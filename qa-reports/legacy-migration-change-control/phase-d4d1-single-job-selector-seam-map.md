# D4D1 single-job selector seam map

## Scope

D4D1 extracts the existing candidate-selection mechanics without wiring D4C current jobs into runtime. The legacy public selector remains a compatibility façade; the narrow seam must not depend on `TrainingBlock` or `GeneratedWorkoutType`.

| Dependency | Current source | Mechanic or orchestration | Narrow semantic input | Legacy adapter | D4B source | Equivalence / tests |
|---|---|---|---|---|---|---|
| Candidate universe | `GenerateWorkoutOptions.exercises`, equipment | Mechanic | exercise library, equipment | existing options | D4B selection context | identical candidate universe |
| Movement/muscle/class filtering | generated `TemplateSlot` | Mechanic | target, movement, muscle, compound/isolation constraints | derive slot facts | D4B constraints | identical eligibility |
| History/preferences | generator options | Mechanic | history, preferences, exclusions | existing options | selection context | identical weighting |
| Ranking | `pickExerciseForSlot` / scoring helpers | Mechanic | semantic slot constraints and context | derived legacy job | D4B job | identical ordering and tie-break |
| Block family | `TrainingBlock` | Orchestration/legacy policy | excluded from narrow seam | legacy-only derivation | no D4B equivalent | no fake block allowed |
| Workout type/template | `GeneratedWorkoutType` and template map | Orchestration | excluded from narrow seam | legacy slot derivation | no D4B equivalent | no generic fallback |
| Guidance | generated slot prescription | Metadata | min/max sets, selection-neutral | legacy output | D4B slot guidance | preserved in result trace |
| Requiredness/omission | generated target-count/template logic | Orchestration | requiredness and omission policy | legacy orchestration | D4B slot contract | no silent dropping |
| Ordinal/source trace | generated slot order | Metadata | ordinal and immutable source trace | legacy order | D4B trace | copied, selection-neutral |

## Required seam

`selectExerciseForJob(request, context)` accepts one semantic selection job and selects at most one exercise. It must reuse the existing filtering, scoring and tie-breaking mechanics. The legacy façade adapts its generated slots into the same request shape and reconstructs its existing result.

The seam must not import or accept `TrainingBlock`, generated-workout types, repositories, exact-targets, persistence, or runtime D3 objects. Set guidance and source trace are metadata and must not affect candidate selection.

## Change control

High-risk selector originals were captured before editing. D4C runtime remains unwired until D4D2. Rollback is removal of the seam and adapter while retaining the unchanged public façade behavior.
