# Stage 2B recommendation and completion map

| Active symbol | Legacy authority | Current replacement | Stage 3 condition |
| --- | --- | --- | --- |
| `useWorkoutLogger.finishWorkout` | `shouldAdvanceTrainingWeekAfterCompletedSession` then `advanceCompletedMicrocycle` | Persist workout, invoke current completion orchestration, persist current snapshot/decision; application remains explicit | Remove compatibility completion helpers after persisted-plan migration. |
| `recommendation-actions` transition helpers | Block preview, order and block decision mutation | Current decision recommendation facade and Stage 2A application boundary | Delete legacy mutation functions once all UI/reporting callers migrate. |
| `plan-setup.advanceCompletedMicrocycle` | Default week and first eligible successor | Compatibility-only; never called by current completion orchestration | Remove with Stage 3 active-plan migration. |

Custom and extra completions remain history-only and never trigger current readiness or decisions. No decision is auto-applied at completion.
