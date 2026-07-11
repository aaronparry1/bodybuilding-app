# Intervention Decision Engine v1

Status: Decision locked.

The Intervention Decision Engine consumes Adaptation Detection output and selects the smallest justified coaching action.

It exists to stop ASC from jumping straight from "progress slowed" to large programme changes.

## Required Hierarchy

The intervention hierarchy is:

1. no_change
2. gather_more_evidence
3. progression_adjustment
4. volume_adjustment
5. intensity_adjustment
6. rep_range_adjustment
7. method_adjustment
8. exercise_rotation
9. movement_pattern_adjustment
10. training_state_transition
11. deload
12. pivot

The engine should choose the smallest effective intervention first.

## Inputs

The engine consumes:

- Adaptation Detection status and confidence
- Adaptation reason codes
- Exercise-level status
- Movement-pattern-level status
- Programme/system-level status
- Fatigue/recovery flags
- Pain/issue flags
- Missed sessions
- Current adaptive training state
- Exercise exposure count
- Recent intervention history

## Rules

One poor session must not trigger a major programme change unless pain, injury, or safety flags are present.

If evidence is insufficient, return `gather_more_evidence` or `no_change`.

Poor performance with poor recovery should prioritise recovery, volume, or deload interventions.

Poor performance with normal recovery should prioritise stimulus interventions.

Exercise-level saturation should prefer exercise-level changes before programme-level changes.

Movement-pattern struggles can justify pattern-level volume, intensity, or method adjustment.

Multiple unrelated movement patterns regressing can justify programme-level deload or pivot consideration.

Cooldown windows prevent flip-flopping.

Failed identical interventions should not be repeated. Escalation should happen one step at a time and only after enough evidence.

## Boundary

This engine decides the type and scope of coaching action.

It does not directly:

- mutate a programme
- replace an exercise
- apply a deload
- change training state
- choose exact exercise substitutions

It returns structured recommendations for downstream engines to apply.

## Implementation Anchor

The canonical implementation is:

- `src/domain/training/intervention-decision-engine.ts`
- `tests/intervention-decision-engine.test.ts`

Future progression, rotation, method-selection, deload, and adaptive-state engines must not bypass this layer and mutate programmes directly from Adaptation Detection output.
