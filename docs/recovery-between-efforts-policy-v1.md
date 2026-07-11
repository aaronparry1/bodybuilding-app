# Recovery Between Efforts Policy v1

Decision 9F centralises recovery-between-effort logic in the Coaching Knowledge Layer.

The policy answers one question:

> How much recovery is required between efforts to achieve the intended training effect?

It does not decide session density, supersets, exercise pairing, workout compression, or programme changes.

## Architectural Boundary

Recovery Between Efforts logic lives in `src/domain/training/recovery-between-efforts-policy.ts`.

Workout Builder may consume the recovery objective and practical rest range, but it must not invent rest logic.

The upcoming Session Density Policy will own density, pairing, supersets, and whole-session compression.

## Core Rule

ASC prescribes recovery objectives, not arbitrary timers.

Practical rest ranges can be derived from those objectives, but the objective comes first.

## Recovery Dimensions

The policy can prioritise:

- Neural
- Local muscular
- Cardiovascular
- Technical
- Psychological

Heavy, high-skill, high-neural work prioritises neural and technical recovery.

Hypertrophy work can accept more local fatigue and shorter recovery.

Density and conditioning methods may intentionally limit cardiovascular recovery.

## Recovery Objectives

### Full Recovery

Used when performance quality depends on neural, technical, or psychological readiness.

Common examples:

- Heavy single/triple work
- Peak or realisation work
- High-skill main lifts

### Substantial Recovery

Used for demanding work that needs good quality without full performance restoration.

### Moderate Recovery

Used for normal productive work, especially hypertrophy or accessory work.

### Minimal Recovery

Used when the selected method intentionally keeps recovery incomplete, such as density-oriented work.

### Transition Only

Used when the next effort is not intended to create meaningful fatigue or performance demand.

## Strategies

Recovery between efforts may use:

- Passive rest
- Walking
- Breathing
- Mobility
- Activation
- Technical rehearsal
- Mental rehearsal
- Equipment setup
- Transition only

Passive rest is not always the best default. The strategy should match the dimension being restored.

## Guardrails

The policy must:

- Base recovery on training effect, not arbitrary timers.
- Protect heavy or high-skill work from unsafe rest compression.
- Stay compatible with the selected training method.
- Increase recovery objective when recovery status is compromised.
- Select active recovery strategies where useful.
- Raise safety flags when time is too short for safe heavy work.

The policy must not:

- Decide supersets.
- Pair exercises.
- Compress workouts.
- Change session density.
- Mutate workouts or programmes.
- Save state.

## Workout Builder Contract

Workout Builder consumes:

- `recovery_objective`
- `recovery_dimensions_prioritised`
- `suggested_rest_range`
- `recovery_strategy`
- `expected_density_impact`
- `reason_codes`
- `safety_flags`

If the practical rest range cannot fit safely, the builder should route that conflict to the appropriate resolver or future Session Density Policy. It should not silently shorten recovery for heavy or high-skill work.
