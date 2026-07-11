#!/usr/bin/env python3
"""Publish indicator-lab survivors into Apex live execution policy files.

This bridges alpha_discovery_factory outputs into the MT4 files consumed by
ApexMedallionEA (ApexScalpPolicy.csv + ApexScalpExecutionPolicy.csv).

Design goals:
- keep first 13 execution-policy columns compatible with EA positional parser
- publish only the selected survivor set (default top 16)
- preserve auditability (strategy_id/state tokens written in extra columns/params)
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import math
import re
import subprocess
from pathlib import Path
from typing import Any

import pandas as pd
try:
    import yaml  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    yaml = None

DEFAULT_EA_SUPPORTED_EXECUTION_MODES = {"exact_state"}
DEFAULT_EA_SUPPORTED_STATE_TOKENS = {
    "RSI14_LT30",
    "RSI14_GT70",
    "RSI5_LT20",
    "RSI5_GT80",
    "STOCHK_LT20",
    "STOCHK_GT80",
    "CCI_LT_M100",
    "CCI_GT_P100",
    "ADXGT25_DI_PLUS",
    "ADXGT25_DI_MINUS",
    "PRICE_ABOVE_EMA200",
    "PRICE_BELOW_EMA200",
    "EMA_STACK_BULL",
    "EMA_STACK_BEAR",
    "BBZ_LT_M2",
    "BBZ_GT_P2",
    "ATRPCT_LT20",
    "ATRPCT_GT80",
    "MACD_HIST_POS_RISING",
    "MACD_HIST_NEG_FALLING",
    "DONCHIAN_BREAK_UP",
    "DONCHIAN_BREAK_DN",
    "NEAR_PRIOR_SESSION_LOW",
    "NEAR_PRIOR_SESSION_HIGH",
    "NEAR_PRIOR_DAY_LOW",
    "NEAR_PRIOR_DAY_HIGH",
}
DEFAULT_EA_SUPPORTED_PARAM_KEYS = {
    "max_hold_bars",
    "stop_atr_mult",
    "target_atr_mult",
    "spread_filter_mult",
    "allowed_regimes",
    "sessions",
}
DEFAULT_EA_REQUIRED_PARAM_KEYS = {"max_hold_bars", "stop_atr_mult", "target_atr_mult"}
DEFAULT_EA_SUPPORTED_SESSIONS = {"asia", "london", "newyork", "new_york", "rollover"}
DEFAULT_EA_SUPPORTED_REGIMES = {"calm", "normal", "volatile", "vol", "trending", "trend"}


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


def _as_bool(v: object, d: bool = False) -> bool:
    if isinstance(v, bool):
        return v
    if v is None:
        return d
    s = str(v).strip().lower()
    if s in {"1", "true", "yes", "y", "on"}:
        return True
    if s in {"0", "false", "no", "n", "off", ""}:
        return False
    return d


def _load_yaml(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")

    if yaml is not None:
        data = yaml.safe_load(text)
        return data if isinstance(data, dict) else {}

    # Minimal fallback parser for simple key/value YAML used by live_publish.yaml.
    out: dict[str, Any] = {}
    current_map_key: str | None = None
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].rstrip()
        if not line.strip():
            continue
        if line.startswith("  ") and current_map_key:
            body = line.strip()
            if ":" not in body:
                continue
            k, v = body.split(":", 1)
            k = k.strip()
            v = v.strip()
            if current_map_key not in out or not isinstance(out[current_map_key], dict):
                out[current_map_key] = {}
            if v == "":
                out[current_map_key][k] = ""
            else:
                try:
                    out[current_map_key][k] = int(v)
                except Exception:
                    try:
                        out[current_map_key][k] = float(v)
                    except Exception:
                        out[current_map_key][k] = v
            continue

        body = line.strip()
        if ":" not in body:
            continue
        k, v = body.split(":", 1)
        k = k.strip()
        v = v.strip()
        if v == "":
            out[k] = {}
            current_map_key = k
        else:
            current_map_key = None
            try:
                out[k] = int(v)
            except Exception:
                try:
                    out[k] = float(v)
                except Exception:
                    out[k] = v
    return out


def _load_json(text: object, default: Any) -> Any:
    if text is None:
        return default
    s = str(text).strip()
    if not s:
        return default
    try:
        return json.loads(s)
    except Exception:
        return default


def _cfg_str_set(
    cfg: dict[str, Any],
    key: str,
    defaults: set[str],
    *,
    upper: bool = False,
    lower: bool = False,
) -> set[str]:
    if key not in cfg:
        return set(defaults)
    raw = cfg.get(key)
    if isinstance(raw, (list, tuple, set)):
        vals = list(raw)
    else:
        vals = [raw]
    out: set[str] = set()
    for v in vals:
        s = str(v).strip()
        if not s:
            continue
        if upper:
            s = s.upper()
        if lower:
            s = s.lower()
        out.add(s)
    return out if out else set(defaults)


def _norm_token_list(raw: object, *, upper: bool = False, lower: bool = False) -> list[str]:
    if isinstance(raw, (list, tuple, set)):
        src = "|".join(str(x) for x in raw)
    else:
        src = str(raw or "")
    parts = [p.strip() for p in re.split(r'[|,;\[\]"]+', src) if p and p.strip()]
    out: list[str] = []
    for p in parts:
        if upper:
            out.append(p.upper())
        elif lower:
            out.append(p.lower())
        else:
            out.append(p)
    return out


def _validate_ea_schema(
    merged: pd.DataFrame,
    *,
    strict: bool,
    allowed_exec_modes: set[str],
    allowed_state_tokens: set[str],
    allowed_param_keys: set[str],
    required_param_keys: set[str],
    allowed_sessions: set[str],
    allowed_regimes: set[str],
) -> None:
    issues: list[str] = []
    for _, r in merged.iterrows():
        sid = str(r.get("strategy_id", "")).strip() or "<unknown>"
        sym = str(r.get("symbol", "")).strip().upper() or "<?>"
        tf = str(r.get("timeframe", "")).strip().upper() or "<?>"
        tag = f"{sid} [{sym} {tf}]"

        mode = str(r.get("execution_mode", "")).strip().lower()
        if mode not in allowed_exec_modes:
            issues.append(f"{tag}: unsupported execution_mode={mode!r}")

        direction = str(r.get("direction", "")).strip().upper()
        if direction not in {"LONG", "SHORT"}:
            issues.append(f"{tag}: unsupported direction={direction!r}")

        params = _load_json(r.get("params_json", "{}"), {})
        if not isinstance(params, dict):
            issues.append(f"{tag}: params_json is not an object")
            params = {}

        pkeys = {str(k).strip() for k in params.keys() if str(k).strip()}
        missing = sorted(k for k in required_param_keys if k not in pkeys)
        if missing:
            issues.append(f"{tag}: missing required params={missing}")

        unknown_keys = sorted(k for k in pkeys if k not in allowed_param_keys)
        if unknown_keys:
            issues.append(f"{tag}: unsupported params={unknown_keys}")

        raw_states = _load_json(r.get("state_tokens_json", "[]"), [])
        state_tokens = _norm_token_list(raw_states, upper=True)
        if not state_tokens:
            issues.append(f"{tag}: missing state tokens")
        else:
            unknown_states = sorted(s for s in state_tokens if s not in allowed_state_tokens)
            if unknown_states:
                issues.append(f"{tag}: unsupported state tokens={unknown_states}")

        raw_sessions = params.get("sessions", [])
        sessions = _norm_token_list(raw_sessions, lower=True)
        if sessions:
            bad_sessions = sorted(s for s in sessions if s not in allowed_sessions)
            if bad_sessions:
                issues.append(f"{tag}: unsupported sessions={bad_sessions}")

        raw_regimes = params.get("allowed_regimes", [])
        regimes = _norm_token_list(raw_regimes, lower=True)
        if regimes:
            bad_regimes = sorted(g for g in regimes if g not in allowed_regimes)
            if bad_regimes:
                issues.append(f"{tag}: unsupported regimes={bad_regimes}")

    if not issues:
        return

    preview = issues[:25]
    msg = "\n".join(preview)
    if len(issues) > len(preview):
        msg += f"\n... and {len(issues) - len(preview)} more"
    if strict:
        raise RuntimeError(
            "EA schema compatibility check failed. "
            "Selected strategies cannot be executed exactly as published.\n"
            + msg
        )
    print("[WARN] EA schema compatibility issues detected but strict mode disabled:")
    print(msg)


def _ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _normal_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def _parse_iso_dt(raw: object) -> dt.datetime | None:
    s = str(raw or "").strip()
    if not s:
        return None
    # Normalize common MT4/report strings.
    s = s.replace("T", " ").replace("/", "-")
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y.%m.%d %H:%M:%S",
        "%Y.%m.%d %H:%M",
        "%d.%m.%Y %H:%M:%S",
        "%d.%m.%Y %H:%M",
    ):
        try:
            return dt.datetime.strptime(s, fmt).replace(tzinfo=dt.timezone.utc)
        except Exception:
            continue
    try:
        return dt.datetime.fromisoformat(s).replace(tzinfo=dt.timezone.utc)
    except Exception:
        return None


def _parse_strategy_from_comment(raw: object) -> tuple[str, str]:
    c = str(raw or "").strip()
    if not c:
        return "", ""
    parts = [p.strip() for p in c.split("|") if p.strip()]
    if len(parts) < 2:
        return "", ""
    tf = parts[-1].upper()
    if tf not in {"M1", "M5", "M15", "M30", "H1", "H4", "D1"}:
        return "", ""
    sid = "|".join(parts[:-1]).strip()
    if not sid:
        return "", ""
    return sid, tf


def _incumbent_keys(exec_policy_csv: Path) -> set[tuple[str, str, str]]:
    keys: set[tuple[str, str, str]] = set()
    if not exec_policy_csv.exists():
        return keys
    try:
        df = pd.read_csv(exec_policy_csv)
    except Exception:
        return keys
    for _, r in df.iterrows():
        sid = str(r.get("strategy_id", "")).strip()
        sym = str(r.get("symbol", "")).upper().strip()
        tf = str(r.get("timeframe", "")).upper().strip()
        if sid and sym and tf:
            keys.add((sid, sym, tf))
    return keys


def _load_live_trades(live_trades_csv: Path, lookback_days: int) -> pd.DataFrame:
    if not live_trades_csv.exists():
        return pd.DataFrame()
    df = pd.read_csv(live_trades_csv)
    if df.empty:
        return df

    for c in ("symbol", "strategy_id", "strategy_timeframe", "comment", "close_time"):
        if c not in df.columns:
            df[c] = ""

    df["symbol"] = df["symbol"].astype(str).str.upper().str.strip()
    df["strategy_id"] = df["strategy_id"].astype(str).str.strip()
    df["strategy_timeframe"] = df["strategy_timeframe"].astype(str).str.upper().str.strip()
    df["comment"] = df["comment"].astype(str).str.strip()

    sid_tf = df["comment"].apply(_parse_strategy_from_comment)
    sid_from_comment = sid_tf.apply(lambda x: x[0])
    tf_from_comment = sid_tf.apply(lambda x: x[1])
    df["strategy_id"] = df["strategy_id"].mask(df["strategy_id"].str.len() == 0, sid_from_comment)
    df["strategy_timeframe"] = df["strategy_timeframe"].mask(df["strategy_timeframe"].str.len() == 0, tf_from_comment)

    if "net_pips_from_money" not in df.columns:
        df["net_pips_from_money"] = math.nan
    if "gross_pips" not in df.columns:
        df["gross_pips"] = math.nan

    df["net_pips_from_money"] = pd.to_numeric(df["net_pips_from_money"], errors="coerce")
    df["gross_pips"] = pd.to_numeric(df["gross_pips"], errors="coerce")
    df["edge_pips"] = df["net_pips_from_money"]
    df["edge_pips"] = df["edge_pips"].fillna(df["gross_pips"])
    df = df[df["edge_pips"].notna()].copy()

    now_utc = dt.datetime.now(dt.timezone.utc)
    df["close_dt"] = df["close_time"].apply(_parse_iso_dt)
    df = df[df["close_dt"].notna()].copy()
    if lookback_days > 0:
        min_dt = now_utc - dt.timedelta(days=int(lookback_days))
        df = df[df["close_dt"] >= min_dt].copy()

    if df.empty:
        return df

    ages = (now_utc - df["close_dt"]).dt.total_seconds().clip(lower=0.0)
    df["age_days"] = ages / 86400.0
    return df


def _weighted_mean_var(vals: pd.Series, weights: pd.Series) -> tuple[float, float, float]:
    if vals.empty or weights.empty:
        return 0.0, 0.0, 0.0
    w_sum = float(weights.sum())
    if w_sum <= 0.0:
        return 0.0, 0.0, 0.0
    mean = float((vals * weights).sum() / w_sum)
    centered = vals - mean
    var = float((weights * centered * centered).sum() / w_sum)
    w2_sum = float((weights * weights).sum())
    n_eff = (w_sum * w_sum / w2_sum) if w2_sum > 0.0 else 0.0
    return mean, max(0.0, var), max(0.0, n_eff)


def _compute_bayes_overrides(
    merged: pd.DataFrame,
    *,
    live_df: pd.DataFrame,
    incumbent: set[tuple[str, str, str]],
    base_live_scale: float,
    prior_strength_trades: float,
    half_life_days: float,
    min_effective_trades: float,
    floor_new: float,
    floor_incumbent: float,
    no_dilute_prob: float,
) -> tuple[dict[tuple[str, str, str], dict[str, float]], list[dict[str, Any]]]:
    overrides: dict[tuple[str, str, str], dict[str, float]] = {}
    audit_rows: list[dict[str, Any]] = []
    if live_df.empty:
        return overrides, audit_rows

    hl = max(1.0, half_life_days)
    decay_ln2 = math.log(2.0)
    live_df = live_df.copy()
    live_df["decay_w"] = live_df["age_days"].apply(lambda d: math.exp(-decay_ln2 * float(d) / hl))

    for _, r in merged.iterrows():
        strategy_id = str(r.get("strategy_id", "")).strip()
        symbol = str(r.get("symbol", "")).upper().strip()
        timeframe = str(r.get("timeframe", "")).upper().strip()
        if not strategy_id or not symbol or not timeframe:
            continue

        key = (strategy_id, symbol, timeframe)
        is_incumbent = key in incumbent
        floor = max(0.01, floor_incumbent if is_incumbent else floor_new)
        floor = min(floor, max(0.01, base_live_scale))

        mu0 = _f(r.get("oos_net_expectancy_pips", 0.0), 0.0)
        if abs(mu0) <= 1e-12:
            mu0 = _f(r.get("net_expectancy_pips", 0.0), 0.0)
        k0 = max(1.0, prior_strength_trades)

        exact = live_df[
            (live_df["strategy_id"].astype(str).str.strip() == strategy_id)
            & (live_df["symbol"] == symbol)
            & (live_df["strategy_timeframe"] == timeframe)
        ]
        fallback = live_df[(live_df["symbol"] == symbol) & (live_df["strategy_timeframe"] == timeframe)]
        grp = exact if not exact.empty else fallback

        if grp.empty:
            risk = base_live_scale
            p_pos = 0.5
            mu_live = 0.0
            n_eff = 0.0
            mu_post = mu0
        else:
            vals = pd.to_numeric(grp["edge_pips"], errors="coerce").dropna()
            ww = grp.loc[vals.index, "decay_w"]
            mu_live, var_live, n_eff = _weighted_mean_var(vals, ww)
            w_sum = float(ww.sum())
            mu_post = ((k0 * mu0) + (w_sum * mu_live)) / (k0 + w_sum)

            if n_eff >= 2.0 and var_live > 1e-12:
                se = math.sqrt(var_live / max(1.0, n_eff))
                z = mu_post / max(1e-9, se)
                p_pos = _normal_cdf(z)
            else:
                p_pos = 1.0 if mu_post > 0.0 else (0.0 if mu_post < 0.0 else 0.5)

            if n_eff < min_effective_trades:
                risk = base_live_scale
            elif p_pos <= 0.5:
                risk = floor
            else:
                alpha = min(1.0, max(0.0, (p_pos - 0.5) / 0.5))
                risk = floor + (base_live_scale - floor) * alpha
                if is_incumbent and p_pos >= no_dilute_prob:
                    risk = max(risk, base_live_scale)

            risk = max(floor, min(base_live_scale, risk))

        overrides[key] = {
            "risk_scale": float(risk),
            "bayes_p_positive": float(p_pos),
            "bayes_mu_live_pips": float(mu_live),
            "bayes_mu_post_pips": float(mu_post),
            "bayes_n_eff": float(n_eff),
            "incumbent": float(1.0 if is_incumbent else 0.0),
        }
        audit_rows.append(
            {
                "strategy_id": strategy_id,
                "symbol": symbol,
                "timeframe": timeframe,
                "incumbent": int(1 if is_incumbent else 0),
                "prior_oos_pips": float(mu0),
                "live_mean_pips": float(mu_live),
                "posterior_mean_pips": float(mu_post),
                "p_positive": float(p_pos),
                "n_eff": float(n_eff),
                "risk_scale": float(risk),
            }
        )

    return overrides, audit_rows


def _arm_to_family(arm_id: int) -> str:
    if 1 <= arm_id <= 6:
        return "MR"
    if 7 <= arm_id <= 10:
        return "CX"
    if arm_id == 11:
        return "VOL"
    return ""


def _pick_arm_id(family: str, family_arm_map: dict[str, int], default_arm: int) -> int:
    arm = _i(family_arm_map.get(family, default_arm), default_arm)
    return max(0, min(11, arm))


def _make_params_text(
    params: dict[str, Any],
    strategy_id: str,
    direction: str,
    state_tokens_json: str,
    execution_mode: str,
) -> str:
    ordered_keys = ["max_hold_bars", "stop_atr_mult", "target_atr_mult", "spread_filter_mult", "allowed_regimes", "sessions"]
    chunks: list[str] = []
    for k in ordered_keys:
        if k in params:
            v = params[k]
            if isinstance(v, (list, tuple)):
                vv = "|".join(str(x) for x in v)
            else:
                vv = str(v)
            chunks.append(f"{k}={vv}")

    chunks.append(f"strategy_id={strategy_id}")
    chunks.append(f"dir={direction.upper()}")
    chunks.append(f"exec_mode={execution_mode}")

    sts = _load_json(state_tokens_json, [])
    if isinstance(sts, list) and sts:
        chunks.append("states=" + "|".join(str(s) for s in sts))

    return ";".join(chunks)


def _build_rows(
    merged: pd.DataFrame,
    *,
    mode: str,
    risk_scale_live: float,
    risk_scale_watch: float,
    family_arm_map: dict[str, int],
    default_arm: int,
    bayes_overrides: dict[tuple[str, str, str], dict[str, float]] | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    policy_rows: list[dict[str, Any]] = []
    exec_rows: list[dict[str, Any]] = []

    for _, r in merged.iterrows():
        strategy_id = str(r["strategy_id"])
        symbol = str(r["symbol"]).upper().strip()
        timeframe = str(r["timeframe"]).upper().strip()
        family_raw = str(r.get("family", "")).strip()

        params = _load_json(r.get("params_json", "{}"), {})
        if not isinstance(params, dict):
            params = {}

        hold = max(1.0, _f(params.get("max_hold_bars", 20.0), 20.0))
        tp = max(0.10, _f(params.get("target_atr_mult", 1.8), 1.8))
        sl = max(0.10, _f(params.get("stop_atr_mult", 1.1), 1.1))
        execution_mode = str(r.get("execution_mode", "")).strip().lower()
        tp_exec = tp
        if execution_mode == "exact_state" and sl > 0.0:
            # EA interprets tp as R-multiple over stopProxy.
            # Backtest target is ATR-multiple, so convert target/stop to keep parity.
            tp_exec = max(0.10, tp / sl)

        oos_net = _f(r.get("oos_net_expectancy_pips", 0.0), 0.0)
        base_net = _f(r.get("net_expectancy_pips", 0.0), 0.0)
        edge_per_day = oos_net if abs(oos_net) > 1e-12 else base_net

        ci_low = max(0.0, min(1.0, _f(r.get("positive_fold_ratio", 0.0), 0.0)))
        stress = max(0.0, min(1.0, _f(r.get("stress_survival_ratio", 0.0), 0.0)))
        score = max(0.0, min(1.0, 0.50 * ci_low + 0.50 * stress))

        family_key = family_raw.strip()
        arm_id = _pick_arm_id(family_key, family_arm_map, default_arm)
        family = _arm_to_family(arm_id)

        row_mode = mode.upper().strip()
        if row_mode not in ("LIVE", "WATCH", "OFF"):
            row_mode = "LIVE"
        risk_scale = risk_scale_live if row_mode == "LIVE" else risk_scale_watch
        bayes = None
        if bayes_overrides and row_mode == "LIVE":
            b_key = (strategy_id, symbol, timeframe)
            bayes = bayes_overrides.get(b_key)
            if bayes is not None:
                risk_scale = _f(bayes.get("risk_scale", risk_scale), risk_scale)

        direction = str(r.get("direction", "LONG")).upper().strip()
        params_text = _make_params_text(
            params=params,
            strategy_id=strategy_id,
            direction=direction,
            state_tokens_json=str(r.get("state_tokens_json", "[]")),
            execution_mode=str(r.get("execution_mode", "")),
        )

        # ApexScalpPolicy.csv (used by bridge).
        policy_rows.append(
            {
                "symbol": symbol,
                "source": "IND_LAB",
                "timeframe": timeframe,
                "strategy_id": strategy_id,
                "family": family,
                "model": "INDICATOR_LAB",
                "mode": row_mode,
                "risk_scale": f"{risk_scale:.2f}",
                "params": params_text,
                "n_test": _i(r.get("trades", 0), 0),
                "days_total": _i(r.get("trades", 0), 0),
                "win_lb_95": _f(r.get("win_rate", 0.0), 0.0),
                "avg_test": base_net,
                "ci_low_test": ci_low,
                "pf_test": _f(r.get("profit_factor", 0.0), 0.0),
                "wf_pos_ratio": _f(r.get("positive_fold_ratio", 0.0), 0.0),
                "tpd": max(0.0, _f(r.get("trades", 0.0), 0.0)),
                "edge_per_day": edge_per_day,
                "key": strategy_id,
                "arm_id": arm_id,
                "bayes_p_positive": (_f(bayes.get("bayes_p_positive", 0.0), 0.0) if bayes else ""),
                "bayes_mu_live_pips": (_f(bayes.get("bayes_mu_live_pips", 0.0), 0.0) if bayes else ""),
                "bayes_mu_post_pips": (_f(bayes.get("bayes_mu_post_pips", 0.0), 0.0) if bayes else ""),
                "bayes_n_eff": (_f(bayes.get("bayes_n_eff", 0.0), 0.0) if bayes else ""),
            }
        )

        # ApexScalpExecutionPolicy.csv
        # Keep first 13 columns exactly as EA expects (positional parser).
        exec_rows.append(
            {
                "symbol": symbol,
                "timeframe": timeframe,
                "family": family,
                "arm_id": arm_id,
                "mode": row_mode,
                "risk_scale": f"{risk_scale:.6f}",
                "hold": f"{hold:.6f}",
                "tp": f"{tp_exec:.6f}",
                "sl": f"{sl:.6f}",
                "edge_per_day": f"{edge_per_day:.8f}",
                "ci_low_test": f"{ci_low:.8f}",
                "score": f"{score:.6f}",
                "params": params_text,
                "strategy_id": strategy_id,
                "strategy_tf_id": f"{strategy_id}-{timeframe}",
                "direction": direction,
                "state_tokens_json": str(r.get("state_tokens_json", "[]")),
                "execution_mode": str(r.get("execution_mode", "")),
                "robustness_score": _f(r.get("robustness_score", 0.0), 0.0),
                "oos_net_expectancy_pips": _f(r.get("oos_net_expectancy_pips", 0.0), 0.0),
                "stress_survival_ratio": _f(r.get("stress_survival_ratio", 0.0), 0.0),
                "bayes_p_positive": (_f(bayes.get("bayes_p_positive", 0.0), 0.0) if bayes else ""),
                "bayes_mu_live_pips": (_f(bayes.get("bayes_mu_live_pips", 0.0), 0.0) if bayes else ""),
                "bayes_mu_post_pips": (_f(bayes.get("bayes_mu_post_pips", 0.0), 0.0) if bayes else ""),
                "bayes_n_eff": (_f(bayes.get("bayes_n_eff", 0.0), 0.0) if bayes else ""),
                "bayes_incumbent": (_i(bayes.get("incumbent", 0), 0) if bayes else ""),
            }
        )

    return policy_rows, exec_rows


def _write_csv(path: Path, rows: list[dict[str, Any]], cols: list[str]) -> None:
    _ensure_parent(path)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, "") for c in cols})


def _run_bridge(
    python_exe: str,
    bridge_script: Path,
    policy_csv: Path,
    wf_csv: Path,
    monthly_csv: Path,
    *,
    year_month: int,
    wf_forward_days: int,
    wf_expiry_days: int,
    source_tag: str,
) -> None:
    cmd = [
        python_exe,
        "-u",
        str(bridge_script),
        "--policy-csv",
        str(policy_csv),
        "--wf-candidates-csv",
        str(wf_csv),
        "--monthly-policy-csv",
        str(monthly_csv),
        "--year-month",
        str(year_month),
        "--wf-forward-days",
        str(max(1, wf_forward_days)),
        "--wf-expiry-days",
        str(max(1, wf_expiry_days)),
        "--source-tag",
        str(source_tag),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.stdout:
        print(proc.stdout.strip())
    if proc.returncode != 0:
        if proc.stderr:
            print(proc.stderr.strip())
        raise RuntimeError(f"execution bridge failed rc={proc.returncode}")


def parse_args() -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="Publish indicator-lab survivors to Apex MT4 policy files")
    ap.add_argument("--leaderboard-csv", required=True)
    ap.add_argument("--strategy-specs-csv", required=True)
    ap.add_argument("--out-policy-csv", required=True, help="ApexScalpPolicy.csv")
    ap.add_argument("--out-exec-policy-csv", required=True, help="ApexScalpExecutionPolicy.csv")
    ap.add_argument("--out-wf-csv", default="", help="Optional ApexWalkForwardCandidates.csv output")
    ap.add_argument("--out-monthly-csv", default="", help="Optional ApexMonthlyPolicy.csv output")
    ap.add_argument("--bridge-script", default="", help="Optional bridge script path")
    ap.add_argument("--top-n", type=int, default=16)
    ap.add_argument("--mode", default="LIVE", choices=["LIVE", "WATCH"])
    ap.add_argument("--risk-scale-live", type=float, default=1.0)
    ap.add_argument("--risk-scale-watch", type=float, default=0.50)
    ap.add_argument("--include-non-robust", action="store_true")
    ap.add_argument("--min-oos-net", type=float, default=0.0)
    ap.add_argument("--require-exact-state", action="store_true", default=True)
    ap.add_argument("--allow-non-exact-state", action="store_true")
    ap.add_argument("--live-trades-csv", default="", help="Optional normalized live trades CSV (from mt4_detailed_report_edge.py)")
    ap.add_argument("--disable-bayes-overlay", action="store_true", help="Disable Bayesian risk-scale overlay")
    ap.add_argument("--bayes-prior-strength-trades", type=float, default=60.0)
    ap.add_argument("--bayes-half-life-days", type=float, default=180.0)
    ap.add_argument("--bayes-min-effective-trades", type=float, default=8.0)
    ap.add_argument("--bayes-floor-new", type=float, default=0.35)
    ap.add_argument("--bayes-floor-incumbent", type=float, default=0.80)
    ap.add_argument("--bayes-no-dilute-prob", type=float, default=0.70)
    ap.add_argument("--bayes-lookback-days", type=int, default=540)
    ap.add_argument("--bayes-audit-csv", default="", help="Optional output CSV for Bayesian diagnostics")
    ap.add_argument("--publish-config", default="", help="Optional YAML with publish defaults/mappings")
    ap.add_argument("--strict-ea-schema", dest="strict_ea_schema", action="store_true", default=True)
    ap.add_argument("--allow-unsupported-schema", dest="strict_ea_schema", action="store_false")
    ap.add_argument("--python", default="python")
    ap.add_argument("--year-month", type=int, default=0)
    ap.add_argument("--wf-forward-days", type=int, default=35)
    ap.add_argument("--wf-expiry-days", type=int, default=2)
    ap.add_argument("--source-tag", default="indicator-lab-v1")
    return ap.parse_args()


def main() -> int:
    args = parse_args()

    leaderboard_csv = Path(args.leaderboard_csv).expanduser().resolve()
    specs_csv = Path(args.strategy_specs_csv).expanduser().resolve()
    out_policy_csv = Path(args.out_policy_csv).expanduser().resolve()
    out_exec_csv = Path(args.out_exec_policy_csv).expanduser().resolve()
    out_wf_csv = Path(args.out_wf_csv).expanduser().resolve() if str(args.out_wf_csv).strip() else None
    out_monthly_csv = Path(args.out_monthly_csv).expanduser().resolve() if str(args.out_monthly_csv).strip() else None
    bridge_script = Path(args.bridge_script).expanduser().resolve() if str(args.bridge_script).strip() else None

    if not leaderboard_csv.exists():
        raise FileNotFoundError(f"leaderboard not found: {leaderboard_csv}")
    if not specs_csv.exists():
        raise FileNotFoundError(f"strategy specs not found: {specs_csv}")

    cfg: dict[str, Any] = {}
    if str(args.publish_config).strip():
        cfg = _load_yaml(Path(args.publish_config).expanduser().resolve())

    top_n = int(cfg.get("top_n", args.top_n))
    mode = str(cfg.get("mode", args.mode)).upper().strip()
    risk_scale_live = float(cfg.get("risk_scale_live", args.risk_scale_live))
    risk_scale_watch = float(cfg.get("risk_scale_watch", args.risk_scale_watch))

    bayes_enabled = _as_bool(cfg.get("bayes_overlay_enabled"), not args.disable_bayes_overlay)
    bayes_prior_strength = float(cfg.get("bayes_prior_strength_trades", args.bayes_prior_strength_trades))
    bayes_half_life_days = float(cfg.get("bayes_half_life_days", args.bayes_half_life_days))
    bayes_min_effective_trades = float(cfg.get("bayes_min_effective_trades", args.bayes_min_effective_trades))
    bayes_floor_new = float(cfg.get("bayes_floor_new", args.bayes_floor_new))
    bayes_floor_incumbent = float(cfg.get("bayes_floor_incumbent", args.bayes_floor_incumbent))
    bayes_no_dilute_prob = float(cfg.get("bayes_no_dilute_prob", args.bayes_no_dilute_prob))
    bayes_lookback_days = int(cfg.get("bayes_lookback_days", args.bayes_lookback_days))
    strict_ea_schema = _as_bool(cfg.get("strict_ea_schema"), args.strict_ea_schema)

    allowed_exec_modes = _cfg_str_set(
        cfg,
        "ea_supported_execution_modes",
        DEFAULT_EA_SUPPORTED_EXECUTION_MODES,
        lower=True,
    )
    allowed_state_tokens = _cfg_str_set(
        cfg,
        "ea_supported_state_tokens",
        DEFAULT_EA_SUPPORTED_STATE_TOKENS,
        upper=True,
    )
    allowed_param_keys = _cfg_str_set(
        cfg,
        "ea_supported_param_keys",
        DEFAULT_EA_SUPPORTED_PARAM_KEYS,
    )
    required_param_keys = _cfg_str_set(
        cfg,
        "ea_required_param_keys",
        DEFAULT_EA_REQUIRED_PARAM_KEYS,
    )
    allowed_sessions = _cfg_str_set(
        cfg,
        "ea_supported_sessions",
        DEFAULT_EA_SUPPORTED_SESSIONS,
        lower=True,
    )
    allowed_regimes = _cfg_str_set(
        cfg,
        "ea_supported_regimes",
        DEFAULT_EA_SUPPORTED_REGIMES,
        lower=True,
    )

    family_arm_map = {
        "session_range_breakout": 8,
        "trend_pullback_continuation": 7,
        "compression_breakout": 8,
        "overextension_mean_reversion": 1,
        "failed_breakout_reversal": 4,
    }
    fam_map_cfg = cfg.get("strategy_family_to_arm", {})
    if isinstance(fam_map_cfg, dict):
        for k, v in fam_map_cfg.items():
            family_arm_map[str(k).strip()] = _i(v, family_arm_map.get(str(k).strip(), 8))

    default_arm = _i(cfg.get("default_arm", 8), 8)

    ldf = pd.read_csv(leaderboard_csv)
    sdf = pd.read_csv(specs_csv)

    if not args.include_non_robust and "robust_pass" in ldf.columns:
        ldf = ldf[ldf["robust_pass"] == True].copy()  # noqa: E712

    require_exact_state = bool(args.require_exact_state) and not bool(args.allow_non_exact_state)
    if require_exact_state and "execution_mode" in ldf.columns:
        ldf = ldf[ldf["execution_mode"].fillna("").astype(str).str.lower() == "exact_state"].copy()

    if "oos_net_expectancy_pips" in ldf.columns:
        ldf = ldf[ldf["oos_net_expectancy_pips"].fillna(0.0) > float(args.min_oos_net)].copy()
    elif "net_expectancy_pips" in ldf.columns:
        ldf = ldf[ldf["net_expectancy_pips"].fillna(0.0) > float(args.min_oos_net)].copy()

    if "net_expectancy_pips" in ldf.columns:
        ldf = ldf[ldf["net_expectancy_pips"].fillna(0.0) > 0.0].copy()

    if ldf.empty:
        mode_note = "exact-state + robust + positive OOS/net"
        raise RuntimeError(f"no candidate rows after {mode_note} filters")

    sort_cols: list[str] = []
    if "robustness_score" in ldf.columns:
        sort_cols.append("robustness_score")
    if "oos_net_expectancy_pips" in ldf.columns:
        sort_cols.append("oos_net_expectancy_pips")
    if "net_expectancy_pips" in ldf.columns:
        sort_cols.append("net_expectancy_pips")
    if not sort_cols:
        raise RuntimeError("leaderboard missing ranking columns")

    ldf = ldf.sort_values(sort_cols, ascending=False).copy()
    # top_n <= 0 means "publish all qualified rows" (no cap).
    if top_n > 0:
        ldf = ldf.head(max(1, top_n)).copy()

    keep_cols = [
        "strategy_id",
        "params_json",
        "state_tokens_json",
        "execution_mode",
        "direction",
    ]
    for c in keep_cols:
        if c not in sdf.columns:
            raise RuntimeError(f"strategy specs missing column: {c}")

    merged = ldf.merge(sdf[keep_cols], on="strategy_id", how="left")
    if merged["params_json"].isna().any():
        miss = int(merged["params_json"].isna().sum())
        raise RuntimeError(f"{miss} selected rows missing strategy spec join")

    _validate_ea_schema(
        merged,
        strict=strict_ea_schema,
        allowed_exec_modes=allowed_exec_modes,
        allowed_state_tokens=allowed_state_tokens,
        allowed_param_keys=allowed_param_keys,
        required_param_keys=required_param_keys,
        allowed_sessions=allowed_sessions,
        allowed_regimes=allowed_regimes,
    )

    bayes_overrides: dict[tuple[str, str, str], dict[str, float]] = {}
    bayes_audit_rows: list[dict[str, Any]] = []
    live_trades_csv = Path(str(args.live_trades_csv).strip()).expanduser().resolve() if str(args.live_trades_csv).strip() else None
    if live_trades_csv is not None and bayes_enabled:
        incumbent = _incumbent_keys(out_exec_csv)
        live_df = _load_live_trades(live_trades_csv, lookback_days=max(1, bayes_lookback_days))
        bayes_overrides, bayes_audit_rows = _compute_bayes_overrides(
            merged,
            live_df=live_df,
            incumbent=incumbent,
            base_live_scale=max(0.01, min(1.0, risk_scale_live)),
            prior_strength_trades=max(1.0, bayes_prior_strength),
            half_life_days=max(1.0, bayes_half_life_days),
            min_effective_trades=max(1.0, bayes_min_effective_trades),
            floor_new=max(0.01, min(1.0, bayes_floor_new)),
            floor_incumbent=max(0.01, min(1.0, bayes_floor_incumbent)),
            no_dilute_prob=max(0.50, min(0.99, bayes_no_dilute_prob)),
        )

    policy_rows, exec_rows = _build_rows(
        merged,
        mode=mode,
        risk_scale_live=max(0.0, min(1.0, risk_scale_live)),
        risk_scale_watch=max(0.0, min(1.0, risk_scale_watch)),
        family_arm_map=family_arm_map,
        default_arm=default_arm,
        bayes_overrides=bayes_overrides,
    )

    # Policy CSV used by existing bridge/autopilot pipeline.
    policy_cols = [
        "symbol",
        "source",
        "timeframe",
        "strategy_id",
        "family",
        "model",
        "mode",
        "risk_scale",
        "params",
        "n_test",
        "days_total",
        "win_lb_95",
        "avg_test",
        "ci_low_test",
        "pf_test",
        "wf_pos_ratio",
        "tpd",
        "edge_per_day",
        "key",
        "arm_id",
        "bayes_p_positive",
        "bayes_mu_live_pips",
        "bayes_mu_post_pips",
        "bayes_n_eff",
    ]
    _write_csv(out_policy_csv, policy_rows, policy_cols)

    # Execution policy CSV consumed directly by EA.
    # First 13 columns are positional legacy fields; extras are metadata only.
    exec_cols = [
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
        "direction",
        "state_tokens_json",
        "execution_mode",
        "robustness_score",
        "oos_net_expectancy_pips",
        "stress_survival_ratio",
        "bayes_p_positive",
        "bayes_mu_live_pips",
        "bayes_mu_post_pips",
        "bayes_n_eff",
        "bayes_incumbent",
    ]
    _write_csv(out_exec_csv, exec_rows, exec_cols)

    if bayes_audit_rows:
        if str(args.bayes_audit_csv).strip():
            bayes_audit_csv = Path(args.bayes_audit_csv).expanduser().resolve()
        else:
            bayes_audit_csv = out_exec_csv.with_name("ApexScalpBayesOverlay.csv")
        _write_csv(
            bayes_audit_csv,
            bayes_audit_rows,
            [
                "strategy_id",
                "symbol",
                "timeframe",
                "incumbent",
                "prior_oos_pips",
                "live_mean_pips",
                "posterior_mean_pips",
                "p_positive",
                "n_eff",
                "risk_scale",
            ],
        )

    # Optional: regenerate WF + monthly overlays from the same policy snapshot.
    if out_wf_csv is not None or out_monthly_csv is not None:
        if bridge_script is None:
            raise RuntimeError("--bridge-script is required when --out-wf-csv/--out-monthly-csv are used")
        if out_wf_csv is None or out_monthly_csv is None:
            raise RuntimeError("both --out-wf-csv and --out-monthly-csv must be provided together")
        ym = int(args.year_month) if int(args.year_month) > 0 else int(dt.datetime.now(dt.timezone.utc).strftime("%Y%m"))
        _run_bridge(
            python_exe=str(args.python),
            bridge_script=bridge_script,
            policy_csv=out_policy_csv,
            wf_csv=out_wf_csv,
            monthly_csv=out_monthly_csv,
            year_month=ym,
            wf_forward_days=int(args.wf_forward_days),
            wf_expiry_days=int(args.wf_expiry_days),
            source_tag=str(args.source_tag),
        )

    selected_out = out_policy_csv.with_name("ApexScalpPolicy_selected_indicator_lab.csv")
    _write_csv(selected_out, policy_rows, policy_cols)

    print(f"selected_rows={len(policy_rows)}")
    print(f"policy_csv={out_policy_csv}")
    print(f"exec_policy_csv={out_exec_csv}")
    print(f"bayes_enabled={bayes_enabled}")
    if bayes_audit_rows:
        print(f"bayes_rows={len(bayes_audit_rows)}")
        if str(args.bayes_audit_csv).strip():
            print(f"bayes_audit_csv={Path(args.bayes_audit_csv).expanduser().resolve()}")
        else:
            print(f"bayes_audit_csv={out_exec_csv.with_name('ApexScalpBayesOverlay.csv')}")
    if out_wf_csv is not None:
        print(f"wf_csv={out_wf_csv}")
    if out_monthly_csv is not None:
        print(f"monthly_csv={out_monthly_csv}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
