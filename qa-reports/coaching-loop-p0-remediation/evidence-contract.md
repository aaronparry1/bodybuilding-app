# Evidence contract

Writer schema: `canonical_progress_evidence_v1`

## Performance observations

Each performed set persists exercise and slot identity, immutable prescription hash, loading mode/state, method/policy facts, progression rule, prescribed sets and target reps, stop threshold, set order, actual reps/load/base unit, completion, effort when collected, and substitution identity when present.

## Completion observations

Completion persists planned-session identity, prescription hash, prescribed working sets/slots, completed/partial/skipped slots, and performed sets/reps/load.

## Phase 1 interpretation

- **Successful target:** every prescribed slot has exactly its required set count; each event is complete and meets its immutable target reps.
- **Partial/failed:** any missing, partial, or below-target work prevents progression.
- **Missed planned work:** skipped prescribed slots are derived by comparing the immutable snapshot with performed events; calendar absence alone is never treated as fatigue.
- **Drop-off:** a performed set below its prescribed target blocks progression.
- **Comparable exposure count:** distinct recorded sessions with exercise-scoped complete evidence.
- **Repeated qualified failure:** current failed exposure plus at least one prior comparable failed exposure for the same exercise.
- **Recovery:** only fresh and complete readiness/capacity evidence is interpreted. Missing records are `not_collected`; ambiguous values are `conflicting`.
- **Pain/review:** persisted pain or review evidence always blocks automatic change.
- **Microcycle completion:** no planned or active sessions remain and completed planned references meet training frequency.
- **Transition boundary:** completed distinct Microcycles may meet the Mesocycle `defaultWeeks` and have an approved successor, but this does not authorize transition. The current textual objective/success criteria are not machine-evaluable, so Phase 1 persists a review/no-change result at that boundary.
- **Deload:** Phase 1 never fabricates eligibility. Current recovery policy is review-only, so automatic deload application remains false.

UI booleans such as `transitionReady`, `exitCriteriaSatisfied`, or `deloadRequired` do not author v3 outcomes.
