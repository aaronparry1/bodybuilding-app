# Phase 11A.2C3 readiness producer and writer map

| Step | Authority | Persistence / failure rule |
| --- | --- | --- |
| Roles and evaluability | `current-microcycle-role-evaluability` | Invalid identity prevents snapshot persistence. |
| Exact targets through fatigue | B1A → B1B → B2A → B2B → B3 | Producer composes existing functions only. |
| Exposure, successors, objective | C2 context | No successor is selected. Missing policy remains explicit. |
| Snapshot | C1A schema + C1B repository | Snapshot persists before decision evaluation. Equal fingerprint is unchanged. |
| Decision | Current evaluator + authoritative writer | Writer loads a current snapshot, persists a decision reference, then callers may shadow legacy state. |

The producer never applies a decision, changes a workout, regenerates targets, or reads block week/order. Stage 2 consumers remain read-only until migrated.
