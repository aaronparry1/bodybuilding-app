#!/usr/bin/env python3
"""Parse an MT4 Detailed Report HTML and compute per-symbol live edge metrics.

What this measures:
- `net_money = profit + commission + taxes + swap` (account currency)
- Gross pips from open/close fills (spread/slippage effects are implicitly in fills)
- Optional proxy `r_net` when a broker cost table is provided:
  r_net ~= net_pips / stop_pips

Usage example:
  py -3 scripts\\mt4_detailed_report_edge.py ^
    --report-html "C:\\...\\AccountHistory_Detailed.htm" ^
    --cost-table-csv "C:\\Apex\\code\\outputs\\analysis\\roboforex_procent_costs_20260303.csv" ^
    --out-trades-csv "C:\\Apex\\cert\\scalp_autopilot\\runs\\live_trades.csv" ^
    --out-summary-csv "C:\\Apex\\cert\\scalp_autopilot\\runs\\live_edge_summary.csv"
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import html
import math
import random
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple


@dataclass(frozen=True)
class TradeRow:
    ticket: str
    symbol: str
    side: int  # +1 buy, -1 sell
    lots: float
    open_time: dt.datetime
    open_price: float
    sl: float
    tp: float
    close_time: dt.datetime
    close_price: float
    commission: float
    taxes: float
    swap: float
    profit: float
    comment: str


@dataclass(frozen=True)
class SymbolCost:
    symbol: str
    pip_size: float
    pip_value_per_lot: float  # account-currency per pip per 1.0 lot


def safe_float(v: object, d: float = 0.0) -> float:
    s = str(v or "").strip()
    if not s:
        return d
    s = s.replace("\u00a0", " ").replace(" ", "")
    s = s.replace(",", ".")
    try:
        return float(s)
    except Exception:
        return d


def parse_time(v: str) -> Optional[dt.datetime]:
    raw = str(v or "").strip()
    if not raw:
        return None
    fmts = (
        "%Y.%m.%d %H:%M",
        "%Y.%m.%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d %H:%M:%S",
        "%d.%m.%Y %H:%M",
        "%d.%m.%Y %H:%M:%S",
    )
    for f in fmts:
        try:
            return dt.datetime.strptime(raw, f)
        except Exception:
            continue
    return None


def strip_tags(s: str) -> str:
    txt = re.sub(r"<[^>]+>", "", s)
    txt = html.unescape(txt)
    txt = txt.replace("\u00a0", " ").strip()
    return txt


def extract_table_rows(html_text: str) -> List[List[str]]:
    rows: List[List[str]] = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", html_text, flags=re.I | re.S):
        cells = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, flags=re.I | re.S)
        if not cells:
            continue
        rows.append([strip_tags(c) for c in cells])
    return rows


def norm_col(s: object) -> str:
    x = str(s or "").strip().lower()
    x = re.sub(r"[^a-z0-9]+", "_", x)
    return x.strip("_")


def header_index(row: Sequence[str]) -> Optional[Dict[str, int]]:
    idx: Dict[str, int] = {}
    dup_count: Dict[str, int] = {}
    for i, c in enumerate(row):
        k = norm_col(c)
        if k in idx:
            dup_count[k] = dup_count.get(k, 1) + 1
            idx[f"{k}_{dup_count[k]}"] = i
        else:
            idx[k] = i
    need = ("ticket", "type", "size", "item", "commission", "swap", "profit")
    if all(k in idx for k in need):
        return idx
    return None


def is_trade_type(raw: str) -> Optional[int]:
    t = str(raw or "").strip().lower()
    if t.startswith("buy"):
        return +1
    if t.startswith("sell"):
        return -1
    return None


def parse_mt4_detailed_rows(rows: Sequence[Sequence[str]]) -> List[TradeRow]:
    out: List[TradeRow] = []
    hdr: Optional[Dict[str, int]] = None

    for r in rows:
        if len(r) < 8:
            continue
        maybe_hdr = header_index(r)
        if maybe_hdr is not None:
            hdr = maybe_hdr
            continue

        if hdr is not None:
            try:
                side = is_trade_type(r[hdr["type"]])
                if side is None:
                    continue
                open_time = parse_time(r[hdr.get("time", 0)])
                close_time = parse_time(r[hdr.get("time_2", hdr.get("time_1", hdr.get("close_time", 0)))])
                # Some reports repeat the label "Price", so second price may be named "price_1".
                open_price = safe_float(r[hdr.get("price", 0)], math.nan)
                close_price = safe_float(r[hdr.get("price_2", hdr.get("price_1", hdr.get("close_price", 0)))], math.nan)
                if open_time is None or close_time is None or not math.isfinite(open_price) or not math.isfinite(close_price):
                    continue
                out.append(
                    TradeRow(
                        ticket=str(r[hdr["ticket"]]).strip(),
                        symbol=str(r[hdr["item"]]).strip().upper(),
                        side=side,
                        lots=max(0.0, safe_float(r[hdr["size"]], 0.0)),
                        open_time=open_time,
                        open_price=open_price,
                        sl=safe_float(r[hdr.get("s_l", -1)], 0.0),
                        tp=safe_float(r[hdr.get("t_p", -1)], 0.0),
                        close_time=close_time,
                        close_price=close_price,
                        commission=safe_float(r[hdr["commission"]], 0.0),
                        taxes=safe_float(r[hdr.get("taxes", -1)], 0.0),
                        swap=safe_float(r[hdr["swap"]], 0.0),
                        profit=safe_float(r[hdr["profit"]], 0.0),
                        comment=str(r[hdr.get("comment", -1)]).strip() if "comment" in hdr else "",
                    )
                )
                continue
            except Exception:
                pass

        # Fallback to classic detailed-report row layout:
        # [time, ticket, type, size, symbol, open, sl, tp, close_time, close, commission, taxes, swap, profit]
        if len(r) >= 14:
            side = is_trade_type(r[2])
            if side is None:
                continue
            open_time = parse_time(r[0])
            close_time = parse_time(r[8])
            if open_time is None or close_time is None:
                continue
            open_price = safe_float(r[5], math.nan)
            close_price = safe_float(r[9], math.nan)
            if not math.isfinite(open_price) or not math.isfinite(close_price):
                continue
            out.append(
                TradeRow(
                    ticket=str(r[1]).strip(),
                    symbol=str(r[4]).strip().upper(),
                    side=side,
                    lots=max(0.0, safe_float(r[3], 0.0)),
                    open_time=open_time,
                    open_price=open_price,
                    sl=safe_float(r[6], 0.0),
                    tp=safe_float(r[7], 0.0),
                    close_time=close_time,
                    close_price=close_price,
                    commission=safe_float(r[10], 0.0),
                    taxes=safe_float(r[11], 0.0),
                    swap=safe_float(r[12], 0.0),
                    profit=safe_float(r[13], 0.0),
                    comment=(str(r[14]).strip() if len(r) > 14 else ""),
                )
            )

    return out


def parse_strategy_comment(comment: str) -> Tuple[str, str]:
    raw = str(comment or "").strip()
    if not raw:
        return "", ""
    parts = [p.strip() for p in raw.split("|") if p.strip()]
    if len(parts) < 2:
        return "", ""
    tf = parts[-1].upper()
    if tf not in {"M1", "M5", "M15", "M30", "H1", "H4", "D1"}:
        return "", ""
    strategy_id = "|".join(parts[:-1]).strip()
    if not strategy_id:
        return "", ""
    return strategy_id, tf


def infer_pip_size(symbol: str) -> float:
    s = symbol.upper()
    if s.startswith("XAU"):
        return 0.01
    if s.endswith("JPY"):
        return 0.01
    return 0.0001


def _pick_cost_col(row: Dict[str, str], aliases: Sequence[str]) -> str:
    norm = {norm_col(k): v for k, v in row.items()}
    for a in aliases:
        k = norm_col(a)
        if k in norm:
            return str(norm[k]).strip()
    return ""


def load_symbol_costs(path: Optional[Path]) -> Dict[str, SymbolCost]:
    if path is None:
        return {}
    out: Dict[str, SymbolCost] = {}
    with path.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            sym = _pick_cost_col(row, ("symbol",)).upper()
            if not sym:
                continue
            spread_pips = safe_float(_pick_cost_col(row, ("avg_spread_pips", "avg. spread (pips)")), 0.0)
            spread_per_lot = safe_float(_pick_cost_col(row, ("spread_per_lot_usd", "spread per lot, $")), 0.0)
            pip_size = safe_float(_pick_cost_col(row, ("pip_size", "1 pip size")), 0.0)
            if pip_size <= 0.0:
                pip_size = infer_pip_size(sym)
            if spread_pips > 0.0 and spread_per_lot > 0.0:
                pip_value = spread_per_lot / spread_pips
            else:
                pip_value = 0.0
            out[sym] = SymbolCost(symbol=sym, pip_size=pip_size, pip_value_per_lot=pip_value)
    return out


def bootstrap_ci_low(vals: Sequence[float], samples: int = 1000, seed: int = 42) -> float:
    if not vals:
        return 0.0
    if len(vals) == 1:
        return vals[0]
    rng = random.Random(seed)
    n = len(vals)
    means: List[float] = []
    for _ in range(max(200, samples)):
        s = 0.0
        for _ in range(n):
            s += vals[rng.randrange(n)]
        means.append(s / float(n))
    means.sort()
    idx = int(max(0, math.floor(0.025 * len(means))))
    return means[idx]


def summarize(trades: Sequence[Dict[str, object]]) -> List[Dict[str, object]]:
    by_sym: Dict[str, List[Dict[str, object]]] = {}
    for t in trades:
        sym = str(t.get("symbol", "")).upper()
        if not sym:
            continue
        by_sym.setdefault(sym, []).append(t)

    out: List[Dict[str, object]] = []
    for sym, grp in sorted(by_sym.items()):
        n = len(grp)
        net_vals = [float(x.get("net_money", 0.0)) for x in grp]
        wins = sum(1 for v in net_vals if v > 0.0)
        r_vals = [float(x["r_net"]) for x in grp if x.get("r_net") is not None]
        rec = {
            "symbol": sym,
            "trades": n,
            "win_rate": (wins / float(n)) if n else 0.0,
            "net_money_sum": sum(net_vals),
            "net_money_avg": (sum(net_vals) / float(n)) if n else 0.0,
            "gross_pips_avg": (sum(float(x.get("gross_pips", 0.0)) for x in grp) / float(n)) if n else 0.0,
            "hold_min_avg": (sum(float(x.get("hold_minutes", 0.0)) for x in grp) / float(n)) if n else 0.0,
            "r_net_avg": (sum(r_vals) / float(len(r_vals))) if r_vals else "",
            "r_net_ci_low_95": bootstrap_ci_low(r_vals) if r_vals else "",
            "r_net_samples": len(r_vals),
        }
        out.append(rec)

    out.sort(key=lambda x: float(x.get("net_money_sum", 0.0)), reverse=True)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Compute MT4 live edge/cost summary from Detailed Report HTML")
    ap.add_argument("--report-html", required=True, help="Path to MT4 Detailed Report .htm/.html")
    ap.add_argument("--cost-table-csv", default="", help="Optional broker cost table for pip size/value and r_net proxy")
    ap.add_argument("--out-trades-csv", required=True, help="Output normalized trade rows CSV")
    ap.add_argument("--out-summary-csv", required=True, help="Output per-symbol summary CSV")
    args = ap.parse_args()

    report_html = Path(args.report_html).expanduser().resolve()
    if not report_html.exists():
        raise FileNotFoundError(f"report-html not found: {report_html}")
    cost_table = Path(args.cost_table_csv).expanduser().resolve() if str(args.cost_table_csv).strip() else None
    if cost_table is not None and not cost_table.exists():
        raise FileNotFoundError(f"cost-table-csv not found: {cost_table}")

    try:
        html_text = report_html.read_text(encoding="utf-16")
    except Exception:
        # Some exports are ANSI/UTF-8.
        html_text = report_html.read_text(encoding="utf-8", errors="ignore")
    if "<tr" not in html_text.lower():
        # Final fallback for odd ANSI encodings.
        html_text = report_html.read_text(encoding="latin-1", errors="ignore")

    rows = extract_table_rows(html_text)
    parsed = parse_mt4_detailed_rows(rows)
    if not parsed:
        raise RuntimeError("No closed buy/sell rows found in report")

    costs = load_symbol_costs(cost_table)
    normalized: List[Dict[str, object]] = []
    for t in parsed:
        c = costs.get(t.symbol)
        pip_size = c.pip_size if c is not None and c.pip_size > 0 else infer_pip_size(t.symbol)
        pip_value_per_lot = c.pip_value_per_lot if c is not None else 0.0
        net_money = t.profit + t.commission + t.taxes + t.swap
        gross_pips = (t.side * (t.close_price - t.open_price) / pip_size) if pip_size > 0 else 0.0
        hold_minutes = max(0.0, (t.close_time - t.open_time).total_seconds() / 60.0)
        stop_pips = abs(t.open_price - t.sl) / pip_size if (pip_size > 0 and t.sl > 0.0) else 0.0
        net_pips_from_money = ""
        r_net = None
        if pip_value_per_lot > 0.0 and t.lots > 0.0:
            net_pips_from_money = net_money / (pip_value_per_lot * t.lots)
            if stop_pips > 1e-9:
                r_net = float(net_pips_from_money) / stop_pips

        normalized.append(
            {
                "ticket": t.ticket,
                "symbol": t.symbol,
                "side": "BUY" if t.side > 0 else "SELL",
                "lots": t.lots,
                "open_time": t.open_time.isoformat(sep=" "),
                "open_price": t.open_price,
                "sl": t.sl,
                "tp": t.tp,
                "close_time": t.close_time.isoformat(sep=" "),
                "close_price": t.close_price,
                "commission": t.commission,
                "taxes": t.taxes,
                "swap": t.swap,
                "profit": t.profit,
                "comment": t.comment,
                "net_money": net_money,
                "pip_size": pip_size,
                "pip_value_per_lot": pip_value_per_lot,
                "gross_pips": gross_pips,
                "net_pips_from_money": net_pips_from_money,
                "stop_pips": stop_pips,
                "r_net": r_net,
                "hold_minutes": hold_minutes,
                "strategy_id": parse_strategy_comment(t.comment)[0],
                "strategy_timeframe": parse_strategy_comment(t.comment)[1],
            }
        )

    out_trades = Path(args.out_trades_csv).expanduser().resolve()
    out_summary = Path(args.out_summary_csv).expanduser().resolve()
    out_trades.parent.mkdir(parents=True, exist_ok=True)
    out_summary.parent.mkdir(parents=True, exist_ok=True)

    trade_cols = [
        "ticket",
        "symbol",
        "side",
        "lots",
        "open_time",
        "open_price",
        "sl",
        "tp",
        "close_time",
        "close_price",
        "commission",
        "taxes",
        "swap",
        "profit",
        "comment",
        "net_money",
        "pip_size",
        "pip_value_per_lot",
        "gross_pips",
        "net_pips_from_money",
        "stop_pips",
        "r_net",
        "hold_minutes",
        "strategy_id",
        "strategy_timeframe",
    ]
    with out_trades.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=trade_cols)
        w.writeheader()
        w.writerows(normalized)

    summary_rows = summarize(normalized)
    summary_cols = [
        "symbol",
        "trades",
        "win_rate",
        "net_money_sum",
        "net_money_avg",
        "gross_pips_avg",
        "hold_min_avg",
        "r_net_avg",
        "r_net_ci_low_95",
        "r_net_samples",
    ]
    with out_summary.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=summary_cols)
        w.writeheader()
        w.writerows(summary_rows)

    print(f"report={report_html}")
    print(f"trades={len(normalized)} symbols={len(set(t['symbol'] for t in normalized))}")
    print(f"out_trades={out_trades}")
    print(f"out_summary={out_summary}")
    if summary_rows:
        top = summary_rows[0]
        print(
            "top_symbol={0} net_sum={1:.2f} trades={2} win_rate={3:.3f} r_net_avg={4}".format(
                top["symbol"],
                float(top["net_money_sum"]),
                int(top["trades"]),
                float(top["win_rate"]),
                top["r_net_avg"],
            )
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
