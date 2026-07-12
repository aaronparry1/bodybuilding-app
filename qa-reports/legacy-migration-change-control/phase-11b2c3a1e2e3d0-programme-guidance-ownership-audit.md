# Active-plan programme-guidance ownership audit

| Stage | Symbol / storage | Authority | Identity | Result |
| --- | --- | --- | --- | --- |
| Current plan | `ActiveTrainingPlan` | plan, current mesocycle/microcycle intent | plan/mesocycle/microcycle | No programme guidance specification. |
| Construction | `buildPlannedWorkoutProgramme` | role selection and generator invocation | selected session index/role | Generates programme per construction call. |
| Prescription | `generateWorkoutByFocus`, `slot-prescription-matrix`, `withSetPrescription` | generated setting calculation | generated exercise setting | Recommended min/max pairs are derived output, not persisted identity. |
| Selection | exercise selection/replacements | exercise eligibility/intervention | exercise identities | May change selected exercise/order without a guidance identity. |
| Planned workout | workout session / exact targets | executable prescription | plan/mesocycle/microcycle/session | Exact targets are stored authority after construction. |

The semantic owner of a future range must be a persisted prescription slot before exercise selection. Guidance belongs to a session-template muscle/pattern/slot role, while exercise history and substitution remain exercise-specific. `planSessionIndex` is trace identity only; it is not sufficient as a template ID across programme changes.

Options considered: mesocycle specification (simple but lacks clean effective versioning), microcycle snapshot (duplicates programme state), hybrid mesocycle specification plus microcycle version reference (recommended), and separate registry (only viable if fully authoritative). The hybrid model supports next-normal-microcycle timing, deload exclusion, advance staleness, and immutable constructed workouts.

Required model gaps: mesocycle programme specification/version, stable session-template and prescription-slot IDs, microcycle programme-version reference, generated-setting source trace, planned-workout trace, and current adjustment target mapping. None are implemented here.
