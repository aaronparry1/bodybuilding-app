# Phase 11A.2C2 — Exposure, successor, and objective context map

| Output | Authority | Missing / invalid behaviour | C3 use |
| --- | --- | --- | --- |
| Exposure policy | `MesocycleSpec.minimumWeeks/defaultWeeks/maximumWeeks` | Missing or incoherent values are explicit policy errors | Minimum/maximum decision input |
| Counted attempts | C1B retained snapshot history, filtered by exact plan/mesocycle and explicit supersession | Conflicting active attempts are invalid history; blocked/disrupted/invalid states do not count | Completed microcycle input |
| Expected window | Explicit `defaultWeeks` from the current mesocycle specification | Never a transition trigger | Readiness context |
| Successor candidates | Current `MesocycleSpec.nextStates`, candidate engine and experience eligibility | No candidates, no eligible candidates, and invalid graph remain distinct | Future transition selection boundary |
| Low-stress metadata | No explicit current mesocycle metadata exists | Reported as unavailable; never inferred from name/order/stimulus text | Future recovery-compatible decision policy |
| Objective status | Machine-readable current objective policy, if supplied | Existing library text criteria are descriptive only, so no policy yields `insufficient_policy` | Purpose-concluded input |

C2 is pure: it consumes persisted snapshots and current mesocycle/macrocycle definitions. It does not inspect workouts, use block week/order, select a successor, persist a record, or produce a decision.
