# Data preservation

## Deterministic snapshots

The retained fixture serialises the canonical carrier and complete recorded-session ledger immediately before routing/reconciliation and compares them after:

- initial reconciliation;
- owner backfill;
- duplicate reconciliation;
- cache reset;
- one restart;
- two consecutive restarts.

## Results

| Authority | Result |
| --- | --- |
| programme ID/revision | byte-for-byte unchanged |
| mesocycle/microcycle identity | byte-for-byte unchanged |
| planned sessions | byte-for-byte unchanged |
| active recorded-session ID/status | byte-for-byte unchanged |
| completed-set/performed-work state | byte-for-byte unchanged |
| workout history | byte-for-byte unchanged |
| progression evidence | not read or rewritten by routing |
| prescriptions | byte-for-byte unchanged |
| owner | unchanged when present; established migration binds a legacy unowned carrier once |

No test or rendered journey clears storage, discards a workout, or replaces a programme as part of recovery.
