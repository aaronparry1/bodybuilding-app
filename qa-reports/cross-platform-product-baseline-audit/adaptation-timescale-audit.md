# Adaptation-timescale audit

| Level | Allowed input/decision | Protected invariant | Persistence/explanation |
|---|---|---|---|
| Programme | goal, date, constraints; macrocycle/horizon | cannot be rewritten by one set | carrier/versioned rationale |
| Block | comparable history/readiness; phase/successor/deload | completed prior blocks immutable | decision + CAS receipt |
| Week/microcycle | schedule, missed work, bounded volume/roles | preserve split identity unless explicit approved transition | carrier revision/future snapshot IDs |
| Session | readiness, equipment, pain, time; swap/stop/load handling | may alter today without unrelated sessions | ledger event + reason |
| Set | performed reps/load/drop-off; continue/stop/calibrate | cannot regenerate macrocycle or rewrite completed work | versioned event/evidence |

Repository tests cover fingerprint identity, future-session CAS, immutable completed snapshots, one-bad-session restraint, comparable-exposure thresholds and crash recovery. No inspected path permits a set event to casually regenerate the macrocycle. Missed-session reflow and split morphing remain less mature than set/session protection. Rollback is recovery/reconciliation via persisted source/intent, not destructive history reversal.
