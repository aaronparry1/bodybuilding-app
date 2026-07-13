# Single-job exercise-selection seam (D4D1)

D4D1 adds `selectExerciseForJob` for one certified current-programme exercise-selection job. The request preserves target domain/identity, movement family, purpose, requiredness, guidance metadata, ordinal and immutable D3 source trace. Guidance and trace are selection-neutral.

The seam delegates candidate eligibility and ranking to the existing generator mechanics through `selectExerciseCandidateForSemanticJob`. Equipment, experience, movement/muscle matching, exercise role, history and preference scoring remain shared with the legacy path. It returns one selected exercise or an explicit no-candidate/invalid result and never supplies exact targets, persistence, workout state or IDs.

The existing `selectPlannedExercisesForWeek` façade and D4C runtime remain unchanged in D4D1. This phase proves the narrow request and shared mechanics without wiring current D4B jobs into runtime. D4D2 must add that wiring only after the selector equivalence and source-trace tests are complete.

The compatibility boundary does not invent `TrainingBlock` or `GeneratedWorkoutType` values for current jobs. Legacy orchestration remains responsible for deriving its generated slots; the narrow seam remains block-free.
