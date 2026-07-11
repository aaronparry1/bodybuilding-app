# Phase 7 — exercise intervention integration map

| File | Symbol | Classification | Supported fields / gap | Action |
| --- | --- | --- | --- | --- |
| `plan-setup.ts` | `ExerciseInterventionRecord` | Intervention writer/persistence | `exerciseId`, decision, reason, evidence, date, review exposures, optional replacement ID; no explicit status/expiry/severity/scope | Use only decision/reason/replacement plus existing active helper. |
| `exercise-intervention-record.ts` | `isExerciseInterventionActive` | Applicability reader | Pain remains active until explicit resolution; phase-specific applies in a mesocycle; others use review exposure window | Reuse as the sole active-status boundary. |
| `recovery-workout-constructor.ts` | `selectSessionExercises` / `exerciseScore` | Candidate generator/scorer | Currently ignores interventions and returns null on no candidate | Apply resolver after normal eligibility, before score; return null when a required slot is blocked. |
| `recovery-workout-constructor.ts` | `createExerciseLog` | Persistence mapper | Notes are existing narrow metadata channel | Record derived intervention key only; no private evidence prose. |
| `exercise-swaps.ts` | swap UI logic | Historical/in-progress substitution | Separate, user-initiated path | Out of scope; no intervention silently rewrites in-progress sessions. |

Supported semantics: `replace` or `unavailable` is a hard exclusion; `substitute` and `rotate_at_phase_boundary` prefer a valid declared replacement and penalise the original; `keep` has no effect. There is no supported expiry, user scope, movement scope, or clinical status.
