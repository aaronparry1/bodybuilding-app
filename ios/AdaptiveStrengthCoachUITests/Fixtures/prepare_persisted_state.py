#!/usr/bin/env python3
"""Test-harness-only simulator persistence setup for Release XCUITests.

This file is owned by the UI-test target directory and is never bundled into
Adaptive Strength Coach. It edits only the selected simulator's synthetic app
container while the app is terminated.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import subprocess
from pathlib import Path

BUNDLE_ID = "com.aaronparry.adaptivestrengthcoach"
PLAN_KEY = "iron-logic.canonical-active-plan-v2"
LEDGER_KEY = "iron-logic.canonical-recorded-session-ledger-v1"


def container(device_id: str) -> Path:
    value = subprocess.check_output(
        ["xcrun", "simctl", "get_app_container", device_id, BUNDLE_ID, "data"],
        text=True,
    ).strip()
    return Path(value)


def database(device_id: str) -> Path:
    return container(device_id) / "Documents" / "SQLite" / "iron-logic-local-storage"


def read_rows(db_path: Path) -> dict[str, str]:
    with sqlite3.connect(db_path) as connection:
        return dict(connection.execute("SELECT key, value FROM storage ORDER BY key"))


def write_rows(db_path: Path, rows: dict[str, str]) -> None:
    with sqlite3.connect(db_path) as connection:
        connection.execute("DELETE FROM storage")
        connection.executemany(
            "INSERT INTO storage (key, value) VALUES (?, ?)",
            sorted(rows.items()),
        )
        connection.commit()


def decode_plan(raw: str) -> dict:
    serialized = json.loads(raw)
    if not isinstance(serialized, str):
        raise RuntimeError("canonical plan storage must contain its serialized carrier")
    value = json.loads(serialized)
    if not isinstance(value, dict):
        raise RuntimeError("canonical plan carrier must be an object")
    return value


def encode_plan(plan: dict) -> str:
    serialized = json.dumps(plan, sort_keys=True, separators=(",", ":"))
    return json.dumps(serialized, separators=(",", ":"))


def digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def snapshot(device_id: str, snapshot_path: Path) -> None:
    rows = read_rows(database(device_id))
    if PLAN_KEY not in rows or LEDGER_KEY not in rows:
        raise RuntimeError("completed native journey baseline is missing canonical plan or ledger")
    snapshot_path.write_text(json.dumps({"schemaVersion": "canonical_ios_persistence_baseline_v1", "rows": rows}, sort_keys=True))


def restore(device_id: str, snapshot_path: Path) -> None:
    payload = json.loads(snapshot_path.read_text())
    if payload.get("schemaVersion") != "canonical_ios_persistence_baseline_v1":
        raise RuntimeError("unsupported persistence baseline")
    write_rows(database(device_id), payload["rows"])


def inject(device_id: str, case: str, evidence_path: Path) -> None:
    db_path = database(device_id)
    rows = read_rows(db_path)
    original_ledger = rows[LEDGER_KEY]
    plan = decode_plan(rows[PLAN_KEY])
    prior_revision = int(plan["revision"])

    if case == "stale_future":
        for session in plan["plannedSessions"]:
            session["constructionVersion"] = "canonical_plan_v2"
        expected_result = "reconstructed"
    elif case == "corrupt_plan":
        rows[PLAN_KEY] = json.dumps("{not-valid-json", separators=(",", ":"))
        expected_result = "recovery_required"
    elif case == "incompatible_attempt":
        references = list(plan.get("recordedSessionReferences") or [])
        if not plan.get("cycleLineage"):
            raise RuntimeError("baseline carrier lacks canonical cycle lineage")
        references.append({
            "sessionId": "native-ui-missing-active-attempt",
            "planId": plan["planId"],
            "macrocycleId": plan["macrocycle"]["id"],
            "mesocycleId": plan["mesocycle"]["id"],
            "microcycleId": plan["microcycle"]["id"],
            "revision": prior_revision,
            "status": "paused",
            "recordReference": "canonical-recorded-session:native-ui-missing-active-attempt",
        })
        plan["recordedSessionReferences"] = references
        plan.setdefault("operational", {})["openWorkoutId"] = "native-ui-missing-active-attempt"
        expected_result = "recovery_required"
    else:
        raise RuntimeError(f"unsupported persistence case: {case}")

    if case != "corrupt_plan":
        rows[PLAN_KEY] = encode_plan(plan)
    write_rows(db_path, rows)
    evidence = {
        "schemaVersion": "canonical_ios_persistence_case_v1",
        "case": case,
        "expectedResult": expected_result,
        "priorRevision": prior_revision,
        "injectedPlanSha256": digest(rows[PLAN_KEY]),
        "ledgerSha256": digest(original_ledger),
    }
    evidence_path.write_text(json.dumps(evidence, sort_keys=True, indent=2) + "\n")


def assert_outcome(device_id: str, evidence_path: Path) -> None:
    evidence = json.loads(evidence_path.read_text())
    rows = read_rows(database(device_id))
    if digest(rows[LEDGER_KEY]) != evidence["ledgerSha256"]:
        raise RuntimeError("canonical completed ledger changed during native reconciliation")
    if evidence["case"] == "stale_future":
        plan = decode_plan(rows[PLAN_KEY])
        if plan["revision"] != evidence["priorRevision"] + 1:
            raise RuntimeError("stale future reconciliation did not commit exactly one revision")
        if not all(
            session.get("constructionVersion") == "canonical_plan_v3"
            and session.get("prescriptionSnapshot", {}).get("schemaVersion") == "canonical_session_snapshot_v3"
            for session in plan["plannedSessions"]
        ):
            raise RuntimeError("stale future reconciliation did not regenerate current v3 snapshots")
        observed_plan = digest(rows[PLAN_KEY])
        if evidence.get("observedPlanSha256") not in (None, observed_plan):
            raise RuntimeError("repeated native reconciliation changed an already-current carrier")
    elif digest(rows[PLAN_KEY]) != evidence["injectedPlanSha256"]:
        raise RuntimeError("fail-closed native recovery mutated the injected carrier")

    evidence["observedPlanSha256"] = digest(rows[PLAN_KEY])
    evidence["observedLedgerSha256"] = digest(rows[LEDGER_KEY])
    evidence["assertionStatus"] = "passed"
    evidence_path.write_text(json.dumps(evidence, sort_keys=True, indent=2) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["snapshot", "restore", "inject", "assert"])
    parser.add_argument("--device-id", required=True)
    parser.add_argument("--snapshot", type=Path, required=True)
    parser.add_argument("--case", choices=["stale_future", "corrupt_plan", "incompatible_attempt"])
    parser.add_argument("--evidence", type=Path)
    args = parser.parse_args()

    subprocess.run(["xcrun", "simctl", "terminate", args.device_id, BUNDLE_ID], check=False)
    if args.action == "snapshot":
        snapshot(args.device_id, args.snapshot)
    elif args.action == "restore":
        restore(args.device_id, args.snapshot)
    elif args.action == "inject":
        if not args.case or not args.evidence:
            parser.error("inject requires --case and --evidence")
        inject(args.device_id, args.case, args.evidence)
    elif args.action == "assert":
        if not args.evidence:
            parser.error("assert requires --evidence")
        assert_outcome(args.device_id, args.evidence)


if __name__ == "__main__":
    main()
