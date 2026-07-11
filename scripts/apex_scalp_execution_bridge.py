#!/usr/bin/env python3
"""Bridge scalp policy into EA execution files.

Converts:
- ApexScalpPolicy.csv

Into:
- ApexWalkForwardCandidates.csv (symbol/timeframe/regime/arm overlays)
- ApexMonthlyPolicy.csv        (arm-level monthly risk/weight profile)

This enables direct execution integration with ApexMedallionEA's existing
external hooks, without manual copy/paste.
"""

from __future__ import annotations

import argparse
import csv
import math
import re
import time
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


# Model-level mapping into EA arm ids (StrategyRegistry.mqh).
MODEL_TO_ARM: Dict[str, int] = {
    "MR_BB_RSI": 2,
    "MR_RSI_Z": 5,
    "CX_DONCH": 8,
    "CX_MA_BREAK": 7,
    "VOL_ATR_EXP": 11,
}

FAMILY_TO_ARM: Dict[str, int] = {
    "MR": 1,
    "CX": 7,
    "VOL": 11,
}

FAMILY_TO_ARMS: Dict[str, List[int]] = {
    "MR": [1, 2, 3, 4, 5, 6],
    "CX": [7, 8, 9, 10],
    "VOL": [11],
}


@dataclass
class PolicyRow:
    symbol: str
    timeframe: str
    strategy_id: str
    family: str
    model: str
    params: str
    mode: str
    risk_scale: float
    win_lb_95: float
    ci_low_test: float
    pf_test: float
    edge_per_day: float
    arm_id: int


@dataclass
class WfCandidate:
    symbol: str
    timeframe: str
    regime: str
    arm_id: int
    score: float
    mode: str
    risk_scale: float
    ci_low_test: float
    edge_per_day: float
    params: str


def _f(v: object, d: float = 0.0) -> float:
    try:
        return float(str(v).strip().replace(",", "."))
    except Exception:
        return d


def _i(v: object, d: int = 0) -> int:
    try:
        return int(round(_f(v, float(d))))
    except Exception:
        return d


def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def parse_hold(params: str) -> float:
    m = re.search(r"(?:^|;)hold=([0-9.]+)(?:;|$)", str(params))
    if not m:
        return 8.0
    return _f(m.group(1), 8.0)


def parse_param(params: str, key: str, default: float) -> float:
    k = re.escape(str(key))
    m = re.search(r"(?:^|;)" + k + r"=([0-9.]+)(?:;|$)", str(params))
    if not m:
        return default
    return _f(m.group(1), default)


def regime_from_arm(arm_id: int) -> str:
    if 1 <= arm_id <= 6:
        return "RANGE"
    if arm_id == 11:
        return "VOLATILE"
    return "TREND"


def family_from_arm(arm_id: int) -> str:
    if 1 <= arm_id <= 6:
        return "MR"
    if 7 <= arm_id <= 10:
        return "CX"
    if arm_id == 11:
        return "VOL"
    return ""


def arm_from_policy_row(row: Dict[str, str]) -> int:
    explicit = _i(row.get("arm_id", "0"), 0)
    if explicit > 0:
        return explicit

    model = str(row.get("model", "")).upper().strip()
    if model in MODEL_TO_ARM:
        return MODEL_TO_ARM[model]

    fam = str(row.get("family", "")).upper().strip()
    return FAMILY_TO_ARM.get(fam, 1)


def timeframe_token(raw: str) -> str:
    tf = str(raw).strip().upper()
    if not tf:
        return "M5"
    return tf


def score_from_policy(row: PolicyRow, min_score: float) -> float:
    # Confidence components to derive a stable utility score in [-1, 1].
    ci_component = clamp(row.ci_low_test / 0.05, 0.0, 2.0)
    pf_component = clamp((row.pf_test - 1.0) / 0.25, 0.0, 2.0)
    win_component = clamp((row.win_lb_95 - 0.50) / 0.08, 0.0, 2.0)

    # Bias toward statistically safer rows; watch still trades at lower strength.
    raw = 0.55 * ci_component + 0.25 * pf_component + 0.20 * win_component
    strength = math.tanh(raw)
    score = strength * (0.60 + 0.40 * clamp(row.risk_scale, 0.0, 1.0))
    return clamp(score, min_score, 1.0)


def parse_policy(path: Path) -> List[PolicyRow]:
    out: List[PolicyRow] = []
    if not path.exists():
        return out

    with path.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            symbol = str(row.get("symbol", "")).upper().strip()
            if not symbol:
                continue

            arm_id = arm_from_policy_row(row)
            if arm_id <= 0:
                continue

            out.append(
                PolicyRow(
                    symbol=symbol,
                    timeframe=timeframe_token(row.get("timeframe", "")),
                    strategy_id=str(row.get("strategy_id", "")).strip(),
                    family=str(row.get("family", "")).upper().strip(),
                    model=str(row.get("model", "")).upper().strip(),
                    params=str(row.get("params", "")),
                    mode=str(row.get("mode", "WATCH")).upper().strip(),
                    risk_scale=clamp(_f(row.get("risk_scale", "0.5"), 0.5), 0.0, 1.0),
                    win_lb_95=_f(row.get("win_lb_95", "0.5"), 0.5),
                    ci_low_test=_f(row.get("ci_low_test", "0"), 0.0),
                    pf_test=_f(row.get("pf_test", "1"), 1.0),
                    edge_per_day=_f(row.get("edge_per_day", "0"), 0.0),
                    arm_id=arm_id,
                )
            )
    return out


def dedupe_candidates(rows: Iterable[WfCandidate]) -> List[WfCandidate]:
    best: Dict[Tuple[str, str, str, int], WfCandidate] = {}
    for r in rows:
        key = (r.symbol, r.timeframe, r.regime, r.arm_id)
        prev = best.get(key)
        if prev is None or r.score > prev.score:
            best[key] = r
    out = list(best.values())
    out.sort(key=lambda z: (z.score, z.edge_per_day, z.ci_low_test), reverse=True)
    return out


def build_candidates(policy_rows: List[PolicyRow], min_score: float, max_rows: int) -> List[WfCandidate]:
    cands: List[WfCandidate] = []
    for p in policy_rows:
        base_score = score_from_policy(p, min_score=min_score)

        arms = list(FAMILY_TO_ARMS.get(p.family, []))
        if p.arm_id in arms:
            arms.remove(p.arm_id)
        arms.insert(0, p.arm_id)
        seen_arms: Dict[int, bool] = {}
        ordered_arms: List[int] = []
        for arm in arms:
            if arm <= 0 or seen_arms.get(arm):
                continue
            seen_arms[arm] = True
            ordered_arms.append(arm)

        for idx, arm_id in enumerate(ordered_arms):
            # Primary mapped arm gets full score; family backups are attenuated.
            arm_mult = 1.0 if idx == 0 else 0.70
            score = clamp(base_score * arm_mult, min_score, 1.0)
            cands.append(
                WfCandidate(
                    symbol=p.symbol,
                    timeframe=p.timeframe,
                    regime=regime_from_arm(arm_id),
                    arm_id=arm_id,
                    score=score,
                    mode=p.mode,
                    risk_scale=p.risk_scale,
                    ci_low_test=p.ci_low_test,
                    edge_per_day=p.edge_per_day,
                    params=p.params,
                )
            )
    out = dedupe_candidates(cands)
    if max_rows > 0:
        out = out[:max_rows]
    return out


def write_wf_candidates(path: Path, rows: List[WfCandidate], ts_forward_days: int, expiry_days: int, source_tag: str) -> None:
    now = int(time.time())
    ts = now + max(1, ts_forward_days) * 86400
    expiry = ts + max(1, expiry_days) * 86400
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["timestamp", "symbol", "timeframe", "regime", "arm_id", "score", "expiry", "source"])
        for r in rows:
            w.writerow([ts, r.symbol, r.timeframe, r.regime, r.arm_id, f"{r.score:.6f}", expiry, source_tag])


def write_monthly_policy(path: Path, ym: int, rows: List[WfCandidate]) -> None:
    by_arm: Dict[int, List[WfCandidate]] = defaultdict(list)
    for r in rows:
        by_arm[r.arm_id].append(r)

    out_rows: List[Tuple[int, int, float, float, int]] = []
    for arm_id in sorted(by_arm.keys()):
        grp = by_arm[arm_id]
        if not grp:
            continue

        avg_score = sum(x.score for x in grp) / float(len(grp))
        avg_risk = sum(x.risk_scale for x in grp) / float(len(grp))
        avg_hold = sum(parse_hold(x.params) for x in grp) / float(len(grp))

        # Keep values inside EA clamps:
        # weight [0..2], risk_mult [0.8..1.2], exit_profile [0..2]
        weight = clamp(0.80 + 0.50 * avg_score, 0.0, 2.0)
        risk_mult = clamp(0.80 + 0.40 * avg_risk, 0.80, 1.20)
        if avg_hold <= 4.0:
            exit_profile = 0
        elif avg_hold <= 8.0:
            exit_profile = 1
        else:
            exit_profile = 2

        out_rows.append((ym, arm_id, weight, risk_mult, exit_profile))

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month", "arm_id", "weight", "risk_mult", "exit_profile"])
        for ym_v, arm, wgt, risk, profile in out_rows:
            w.writerow([ym_v, arm, f"{wgt:.6f}", f"{risk:.6f}", profile])


def write_exec_policy(path: Path, policy_rows: List[PolicyRow], min_score: float) -> None:
    out: List[Dict[str, object]] = []
    for p in policy_rows:
        hold = parse_hold(p.params)
        tp = parse_param(p.params, "tp", parse_param(p.params, "tp_r", 1.0))
        sl = parse_param(p.params, "sl", parse_param(p.params, "sl_atr", 1.0))
        score = score_from_policy(p, min_score=min_score)
        arm_id = max(0, int(p.arm_id))
        family = str(p.family or "").strip().upper()
        if not family and arm_id > 0:
            family = family_from_arm(arm_id)

        # Keep arm_id explicit so scalp fast-track can stay arm-scoped.
        out.append(
            {
                "symbol": p.symbol,
                "timeframe": p.timeframe,
                "family": family,
                "arm_id": arm_id,
                "mode": p.mode,
                "risk_scale": f"{p.risk_scale:.6f}",
                "hold": f"{hold:.6f}",
                "tp": f"{tp:.6f}",
                "sl": f"{sl:.6f}",
                "edge_per_day": f"{p.edge_per_day:.8f}",
                "ci_low_test": f"{p.ci_low_test:.8f}",
                "score": f"{score:.6f}",
                "params": p.params,
                "strategy_id": p.strategy_id,
                "strategy_tf_id": f"{p.strategy_id}-{p.timeframe}" if p.strategy_id else "",
            }
        )

    # One row per symbol+timeframe+arm_id (keep strongest edge row).
    best: Dict[Tuple[str, str, int], Dict[str, object]] = {}
    for r in out:
        k = (str(r["symbol"]), str(r["timeframe"]), int(_i(r["arm_id"], 0)))
        prev = best.get(k)
        if prev is None or _f(r["edge_per_day"], 0.0) > _f(prev["edge_per_day"], 0.0):
            best[k] = r

    rows = list(best.values())
    rows.sort(key=lambda z: (_f(z.get("edge_per_day", "0"), 0.0), _f(z.get("score", "0"), 0.0)), reverse=True)

    # IMPORTANT:
    # ApexMedallionEA currently parses this CSV positionally (not by header).
    # Keep the first 13 columns in the exact legacy order expected by the EA:
    # symbol,timeframe,family,arm_id,mode,risk_scale,hold,tp,sl,edge_per_day,ci_low_test,score,params
    # Any extra metadata must be appended after these.
    cols = [
        "symbol",
        "timeframe",
        "family",
        "arm_id",
        "mode",
        "risk_scale",
        "hold",
        "tp",
        "sl",
        "edge_per_day",
        "ci_low_test",
        "score",
        "params",
        "strategy_id",
        "strategy_tf_id",
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for r in rows:
            w.writerow(r)


def current_ym_utc() -> int:
    g = time.gmtime()
    return int(f"{g.tm_year:04d}{g.tm_mon:02d}")


def main() -> int:
    ap = argparse.ArgumentParser(description="Publish scalp policy into EA execution files")
    ap.add_argument("--policy-csv", required=True, help="Path to ApexScalpPolicy.csv/final_policy.csv")
    ap.add_argument("--wf-candidates-csv", required=True, help="Output ApexWalkForwardCandidates.csv")
    ap.add_argument("--monthly-policy-csv", required=True, help="Output ApexMonthlyPolicy.csv")
    ap.add_argument("--exec-policy-csv", default="", help="Optional output ApexScalpExecutionPolicy.csv")
    ap.add_argument("--year-month", type=int, default=0, help="YYYYMM; default current UTC month")
    ap.add_argument("--wf-forward-days", type=int, default=35, help="Forward-shift timestamp to survive monthly cadence")
    ap.add_argument("--wf-expiry-days", type=int, default=2, help="Expiry offset from timestamp")
    ap.add_argument("--max-wf-rows", type=int, default=300, help="Max rows in WF candidates file")
    ap.add_argument("--min-score", type=float, default=0.05, help="Minimum WF score floor")
    ap.add_argument("--source-tag", default="scalp-autopilot-v1", help="Source tag for WF file")
    ap.add_argument("--allow-empty", action="store_true", help="Allow writing empty files when no rows pass")
    args = ap.parse_args()

    policy_path = Path(args.policy_csv).expanduser().resolve()
    wf_path = Path(args.wf_candidates_csv).expanduser().resolve()
    monthly_path = Path(args.monthly_policy_csv).expanduser().resolve()
    ym = args.year_month if args.year_month > 0 else current_ym_utc()

    policy_rows = parse_policy(policy_path)
    wf_rows = build_candidates(policy_rows, min_score=max(0.0, args.min_score), max_rows=max(1, args.max_wf_rows))

    if not wf_rows and not args.allow_empty:
        raise RuntimeError(f"no execution rows derived from policy: {policy_path}")

    write_wf_candidates(
        path=wf_path,
        rows=wf_rows,
        ts_forward_days=max(1, args.wf_forward_days),
        expiry_days=max(1, args.wf_expiry_days),
        source_tag=str(args.source_tag),
    )
    write_monthly_policy(path=monthly_path, ym=ym, rows=wf_rows)
    if str(args.exec_policy_csv).strip():
        exec_policy_path = Path(str(args.exec_policy_csv)).expanduser().resolve()
        write_exec_policy(path=exec_policy_path, policy_rows=policy_rows, min_score=max(0.0, args.min_score))

    print(f"policy_rows={len(policy_rows)}")
    print(f"wf_rows={len(wf_rows)}")
    print(f"out_wf={wf_path}")
    print(f"out_monthly={monthly_path}")
    if str(args.exec_policy_csv).strip():
        print(f"out_exec_policy={Path(str(args.exec_policy_csv)).expanduser().resolve()}")
    for r in wf_rows[:10]:
        print(
            "top symbol={0} tf={1} arm={2} regime={3} score={4:.4f} mode={5} ci_low={6:.6f} edge_day={7:.6f}".format(
                r.symbol, r.timeframe, r.arm_id, r.regime, r.score, r.mode, r.ci_low_test, r.edge_per_day
            )
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
