#!/usr/bin/env python3
"""Download external FX history and build seed_*.csv files for Apex tooling.

Primary source supported:
  - Dukascopy via `npx dukascopy-node` (M1)

Outputs:
  - seed_<SYMBOL>_M1.csv
  - seed_<SYMBOL>_M5.csv (and optional extra TFs)

Seed format:
  timestamp,open,high,low,close,volume
"""

from __future__ import annotations

import argparse
import calendar
import csv
import datetime as dt
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple


OHLC = Tuple[float, float, float, float]


@dataclass(frozen=True)
class Bar:
    ts: int
    o: float
    h: float
    l: float
    c: float
    v: float


def parse_date(s: str) -> dt.date:
    try:
        return dt.date.fromisoformat(s)
    except Exception as exc:
        raise ValueError(f"invalid date '{s}', expected YYYY-MM-DD") from exc


def month_ranges(from_date: dt.date, to_date: dt.date) -> List[Tuple[dt.date, dt.date]]:
    if to_date < from_date:
        return []
    out: List[Tuple[dt.date, dt.date]] = []
    y = from_date.year
    m = from_date.month
    while True:
        last = calendar.monthrange(y, m)[1]
        start = dt.date(y, m, 1)
        end = dt.date(y, m, last)
        if start < from_date:
            start = from_date
        if end > to_date:
            end = to_date
        out.append((start, end))
        if end >= to_date:
            break
        if m == 12:
            y += 1
            m = 1
        else:
            m += 1
    return out


def tf_seconds(tf: str) -> int:
    t = tf.strip().upper()
    if t == "M1":
        return 60
    if t == "M5":
        return 300
    if t == "M15":
        return 900
    if t == "M30":
        return 1800
    if t == "H1":
        return 3600
    if t == "H4":
        return 14400
    if t == "D1":
        return 86400
    raise ValueError(f"unsupported timeframe '{tf}'")


def parse_symbols(raw: str) -> List[str]:
    syms = []
    for part in raw.replace(";", ",").split(","):
        s = part.strip().upper()
        if not s:
            continue
        if len(s) < 6:
            raise ValueError(f"invalid symbol '{s}'")
        syms.append(s)
    if not syms:
        raise ValueError("no symbols provided")
    return sorted(set(syms))


def parse_timeframes(raw: str, ensure_m1: bool = False) -> List[str]:
    tfs = []
    for part in raw.replace(";", ",").split(","):
        t = part.strip().upper()
        if not t:
            continue
        _ = tf_seconds(t)
        tfs.append(t)
    if not tfs:
        raise ValueError("no timeframes provided")
    if ensure_m1 and "M1" not in tfs:
        tfs.insert(0, "M1")
    seen = set()
    uniq: List[str] = []
    for t in tfs:
        if t not in seen:
            seen.add(t)
            uniq.append(t)
    return uniq


def dukascopy_tf(tf: str) -> str:
    t = tf.strip().upper()
    if t in {"M1", "M5", "M15", "M30", "H1", "H4", "D1"}:
        return t.lower()
    raise ValueError(f"unsupported Dukascopy timeframe '{tf}'")


def run_cmd(cmd: Sequence[str], timeout_sec: int) -> bool:
    try:
        subprocess.run(cmd, check=True, timeout=timeout_sec)
        return True
    except subprocess.TimeoutExpired:
        return False
    except subprocess.CalledProcessError:
        return False
    except OSError:
        return False


def resolve_npx_executable(preferred: str = "") -> str:
    pref = preferred.strip()
    if pref:
        return pref

    if os.name == "nt":
        if shutil.which("npx.cmd"):
            return "npx.cmd"
        if shutil.which("npx"):
            return "npx"
        return "npx.cmd"

    if shutil.which("npx"):
        return "npx"
    return "npx"


def download_dukascopy_monthly(
    symbols: Sequence[str],
    from_date: dt.date,
    to_date: dt.date,
    out_root: Path,
    download_tfs: Sequence[str],
    sides: Sequence[str],
    retries: int,
    timeout_min: int,
    force: bool,
    batch_size: int,
    batch_pause_ms: int,
    npx_exe: str,
) -> None:
    ranges = month_ranges(from_date, to_date)
    timeout_sec = max(60, timeout_min * 60)

    for side in sides:
        side = side.lower().strip()
        if side not in {"bid", "ask"}:
            raise ValueError(f"unsupported side '{side}', expected bid/ask")
        for sym in symbols:
            pair = sym.lower()
            pair_dir = out_root / side / pair
            pair_dir.mkdir(parents=True, exist_ok=True)
            for tf in download_tfs:
                tf_key = dukascopy_tf(tf)
                for start, end in ranges:
                    out_file = pair_dir / f"{pair}-{tf_key}-{side}-{start.isoformat()}-{end.isoformat()}.csv"
                    if out_file.exists() and out_file.stat().st_size > 0 and not force:
                        print(f"[DL] skip {out_file}")
                        continue
                    if force and out_file.exists():
                        out_file.unlink()

                    cmd = [
                        npx_exe,
                        "--yes",
                        "dukascopy-node",
                        "-i",
                        pair,
                        "-from",
                        start.isoformat(),
                        "-to",
                        end.isoformat(),
                        "-t",
                        tf_key,
                        "-p",
                        side,
                        "-f",
                        "csv",
                        "-dir",
                        str(pair_dir),
                        "-bs",
                        str(batch_size),
                        "-bp",
                        str(batch_pause_ms),
                        "-fl",
                        "true",
                        "-r",
                        "2",
                        "-re",
                        "true",
                        "-rp",
                        "1000",
                        "-ch",
                    ]

                    ok = False
                    for i in range(max(1, retries)):
                        print(
                            f"[DL] {sym} {tf_key} {side} {start.isoformat()}->{end.isoformat()} "
                            f"attempt={i+1}/{retries}"
                        )
                        if run_cmd(cmd, timeout_sec=timeout_sec):
                            ok = True
                            break
                    if not ok:
                        print(
                            f"[DL][WARN] failed {sym} {tf_key} {side} {start.isoformat()}->{end.isoformat()}",
                            file=sys.stderr,
                        )


def read_dukascopy_file(path: Path) -> Dict[int, OHLC]:
    out: Dict[int, OHLC] = {}
    with path.open(newline="", encoding="utf-8", errors="ignore") as f:
        r = csv.DictReader(f)
        for row in r:
            ts_raw = row.get("timestamp", "")
            try:
                ts = int(float(str(ts_raw).strip()))
            except Exception:
                continue
            if ts > 10_000_000_000:  # ms -> sec
                ts //= 1000
            try:
                o = float(str(row.get("open", "0")).replace(",", "."))
                h = float(str(row.get("high", "0")).replace(",", "."))
                l = float(str(row.get("low", "0")).replace(",", "."))
                c = float(str(row.get("close", "0")).replace(",", "."))
            except Exception:
                continue
            if h < l:
                h, l = l, h
            out[ts] = (o, h, l, c)
    return out


def load_symbol_side_maps(root: Path, symbol: str, side: str, timeframe: str) -> Dict[int, OHLC]:
    pair = symbol.lower()
    tf_key = dukascopy_tf(timeframe)
    files = sorted(Path(p) for p in root.glob(f"{side}/{pair}/{pair}-{tf_key}-{side}-*.csv"))
    if not files:
        return {}
    merged: Dict[int, OHLC] = {}
    for fp in files:
        data = read_dukascopy_file(fp)
        merged.update(data)
    return merged


def build_mid_bars(
    bid: Dict[int, OHLC], ask: Dict[int, OHLC], prefer_mid: bool, include_single_side: bool
) -> List[Bar]:
    if prefer_mid and bid and ask:
        ts_list = sorted(set(bid.keys()) & set(ask.keys()))
        bars: List[Bar] = []
        for ts in ts_list:
            bo, bh, bl, bc = bid[ts]
            ao, ah, al, ac = ask[ts]
            bars.append(
                Bar(
                    ts=ts,
                    o=(bo + ao) / 2.0,
                    h=(bh + ah) / 2.0,
                    l=(bl + al) / 2.0,
                    c=(bc + ac) / 2.0,
                    v=0.0,
                )
            )
        if bars or not include_single_side:
            return bars

    src = bid if bid else ask
    ts_list = sorted(src.keys())
    return [Bar(ts=t, o=src[t][0], h=src[t][1], l=src[t][2], c=src[t][3], v=0.0) for t in ts_list]


def filter_bars(
    bars: Sequence[Bar],
    from_date: Optional[dt.date],
    to_date: Optional[dt.date],
    drop_weekends: bool,
) -> List[Bar]:
    out: List[Bar] = []
    start_ts = None
    end_ts = None
    if from_date is not None:
        start_ts = int(dt.datetime(from_date.year, from_date.month, from_date.day, tzinfo=dt.timezone.utc).timestamp())
    if to_date is not None:
        end_dt = dt.datetime(to_date.year, to_date.month, to_date.day, tzinfo=dt.timezone.utc) + dt.timedelta(days=1)
        end_ts = int(end_dt.timestamp())

    for b in bars:
        if start_ts is not None and b.ts < start_ts:
            continue
        if end_ts is not None and b.ts >= end_ts:
            continue
        if drop_weekends:
            wd = dt.datetime.fromtimestamp(b.ts, tz=dt.timezone.utc).weekday()
            if wd >= 5:
                continue
        out.append(b)
    return out


def resample(bars: Sequence[Bar], tf_sec: int) -> List[Bar]:
    if tf_sec <= 60:
        return list(bars)
    out: List[Bar] = []
    cur_bucket = None
    o = h = l = c = v = None
    for b in bars:
        bucket = b.ts - (b.ts % tf_sec)
        if cur_bucket is None:
            cur_bucket = bucket
            o, h, l, c, v = b.o, b.h, b.l, b.c, b.v
            continue
        if bucket != cur_bucket:
            out.append(Bar(ts=cur_bucket, o=float(o), h=float(h), l=float(l), c=float(c), v=float(v)))
            cur_bucket = bucket
            o, h, l, c, v = b.o, b.h, b.l, b.c, b.v
            continue
        h = max(float(h), b.h)
        l = min(float(l), b.l)
        c = b.c
        v = float(v) + b.v
    if cur_bucket is not None:
        out.append(Bar(ts=cur_bucket, o=float(o), h=float(h), l=float(l), c=float(c), v=float(v)))
    return out


def write_seed(path: Path, bars: Sequence[Bar]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["timestamp", "open", "high", "low", "close", "volume"])
        for b in bars:
            w.writerow(
                [
                    int(b.ts),
                    f"{b.o:.5f}",
                    f"{b.h:.5f}",
                    f"{b.l:.5f}",
                    f"{b.c:.5f}",
                    f"{b.v:.0f}",
                ]
            )


def summarize(symbol: str, tf: str, bars: Sequence[Bar]) -> None:
    if not bars:
        print(f"[SEED][WARN] {symbol} {tf}: no bars")
        return
    start = dt.datetime.fromtimestamp(bars[0].ts, tz=dt.timezone.utc)
    end = dt.datetime.fromtimestamp(bars[-1].ts, tz=dt.timezone.utc)
    days = (end - start).total_seconds() / 86400.0
    print(f"[SEED] {symbol} {tf}: bars={len(bars)} days={days:.1f} start={start} end={end}")


def build_seeds(
    symbols: Sequence[str],
    input_root: Path,
    out_dir: Path,
    tfs: Sequence[str],
    prefer_mid: bool,
    include_single_side: bool,
    from_date: Optional[dt.date],
    to_date: Optional[dt.date],
    drop_weekends: bool,
) -> int:
    created = 0
    for sym in symbols:
        m1_cache: Optional[List[Bar]] = None
        for tf in tfs:
            bid = load_symbol_side_maps(input_root, sym, "bid", tf)
            ask = load_symbol_side_maps(input_root, sym, "ask", tf)
            out_bars: List[Bar]

            if bid or ask:
                out_bars = build_mid_bars(bid, ask, prefer_mid=prefer_mid, include_single_side=include_single_side)
                out_bars = filter_bars(out_bars, from_date=from_date, to_date=to_date, drop_weekends=drop_weekends)
                out_bars.sort(key=lambda x: x.ts)
            else:
                if m1_cache is None:
                    bid_m1 = load_symbol_side_maps(input_root, sym, "bid", "M1")
                    ask_m1 = load_symbol_side_maps(input_root, sym, "ask", "M1")
                    if bid_m1 or ask_m1:
                        m1_cache = build_mid_bars(
                            bid_m1,
                            ask_m1,
                            prefer_mid=prefer_mid,
                            include_single_side=include_single_side,
                        )
                        m1_cache = filter_bars(
                            m1_cache,
                            from_date=from_date,
                            to_date=to_date,
                            drop_weekends=drop_weekends,
                        )
                        m1_cache.sort(key=lambda x: x.ts)
                    else:
                        m1_cache = []

                if not m1_cache:
                    print(f"[SEED][WARN] {sym} {tf}: no native source and no M1 fallback")
                    continue

                tf_sec = tf_seconds(tf)
                out_bars = resample(m1_cache, tf_sec=tf_sec)

            if not out_bars:
                print(f"[SEED][WARN] {sym} {tf}: empty after filtering")
                continue

            out_path = out_dir / f"seed_{sym}_{tf}.csv"
            write_seed(out_path, out_bars)
            summarize(sym, tf, out_bars)
            created += 1
    return created


def main() -> int:
    ap = argparse.ArgumentParser(description="Build Apex seed files from external Dukascopy data")
    ap.add_argument("--symbols", required=True, help="Comma-separated symbols, e.g. EURUSD,GBPUSD")
    ap.add_argument("--from-date", default="", help="YYYY-MM-DD")
    ap.add_argument("--to-date", default="", help="YYYY-MM-DD")
    ap.add_argument("--download", action="store_true", help="Download Dukascopy timeframes before building seeds")
    ap.add_argument("--download-root", default="data/dukascopy/m1", help="Dukascopy root folder (side/symbol/*.csv)")
    ap.add_argument("--download-sides", default="bid,ask", help="Comma-separated: bid,ask")
    ap.add_argument("--download-timeframes", default="M1", help="Comma-separated Dukascopy TFs to download (M1,M5,M15,H1,H4,D1)")
    ap.add_argument("--download-retries", type=int, default=3)
    ap.add_argument("--download-timeout-min", type=int, default=12)
    ap.add_argument("--download-force", action="store_true")
    ap.add_argument("--batch-size", type=int, default=1)
    ap.add_argument("--batch-pause-ms", type=int, default=1500)
    ap.add_argument("--npx-exe", default="", help="Override npx executable (e.g. npx.cmd on Windows)")
    ap.add_argument("--timeframes", default="M1,M5")
    ap.add_argument("--out-dir", required=True, help="Where seed_*.csv will be written")
    ap.add_argument("--prefer-mid", action="store_true", help="Use bid/ask midpoint when both sides exist")
    ap.add_argument("--include-single-side", action="store_true", help="Fallback to bid or ask when one side missing")
    ap.add_argument("--drop-weekends", action="store_true")
    args = ap.parse_args()

    symbols = parse_symbols(args.symbols)
    tfs = parse_timeframes(args.timeframes, ensure_m1=False)
    download_tfs = parse_timeframes(args.download_timeframes, ensure_m1=False)
    from_date = parse_date(args.from_date) if args.from_date else None
    to_date = parse_date(args.to_date) if args.to_date else None
    if from_date and to_date and to_date < from_date:
        raise ValueError("--to-date must be >= --from-date")

    dl_root = Path(args.download_root)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.download:
        if not (from_date and to_date):
            raise ValueError("--download requires --from-date and --to-date")
        sides = [s.strip().lower() for s in args.download_sides.split(",") if s.strip()]
        download_dukascopy_monthly(
            symbols=symbols,
            from_date=from_date,
            to_date=to_date,
            out_root=dl_root,
            download_tfs=download_tfs,
            sides=sides,
            retries=max(1, args.download_retries),
            timeout_min=max(1, args.download_timeout_min),
            force=bool(args.download_force),
            batch_size=max(1, args.batch_size),
            batch_pause_ms=max(0, args.batch_pause_ms),
            npx_exe=resolve_npx_executable(args.npx_exe),
        )

    created = build_seeds(
        symbols=symbols,
        input_root=dl_root,
        out_dir=out_dir,
        tfs=tfs,
        prefer_mid=bool(args.prefer_mid),
        include_single_side=bool(args.include_single_side),
        from_date=from_date,
        to_date=to_date,
        drop_weekends=bool(args.drop_weekends),
    )
    print(f"[DONE] seed_files_created={created} out_dir={out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
