# Support Function Policy v1

Decision 9D makes Support Functions first-class coaching entities.

The policy answers one question:

> Which coaching support functions need to be fulfilled in this session?

It does not select exercises.

## Architectural Boundary

Support Function logic lives in `src/domain/training/support-function-policy.ts`.

Exercises are implementations of support functions. A non-primary exercise should never appear in a workout unless it satisfies one or more selected support functions.

The future Exercise Matching Engine consumes selected support functions and chooses exercises that implement them.

## Core Rule

Coaching decisions select support functions first.

Exercise selection occurs afterwards.

This keeps the app thinking like a coach:

- What function does this work serve?
- Why does this support the objective?
- What evidence says this support function is needed?
- Which exercise best implements that function today?

## Support Function Categories

### Primary Performance

Examples:

- Maximal strength
- Hypertrophy
- Power
- Speed
- Work capacity
- Technical practice

### Movement Support

Examples:

- Horizontal push
- Horizontal pull
- Vertical push
- Vertical pull
- Squat
- Hinge
- Unilateral
- Carry
- Rotation
- Anti-rotation
- Bracing

### Weak Point Development

Examples:

- Bottom strength
- Mid-range
- Lockout
- Starting strength
- Explosive strength
- Stability
- Grip

Weakness functions must come from evidence, not assumption.

### Structural Balance

Examples:

- Upper back
- Rear delts
- Rotator cuff
- Hamstrings
- Adductors
- Glute med
- Calves
- Neck
- Forearms
- Foot strength

Structural balance functions protect long-term training quality and durability.

### Joint Health

Examples:

- Shoulder resilience
- Hip resilience
- Knee resilience
- Elbow resilience
- Lumbar resilience
- Thoracic mobility
- Ankle mobility

Pain and issue flags can elevate these functions.

### Recovery

Examples:

- Blood flow
- Mobility
- Active recovery
- Low-fatigue hypertrophy

Recovery functions are context dependent. They should not be added automatically to every session.

## Metadata Contract

Each support function includes:

- Category
- Description
- Compatible training states
- Compatible methods
- Movement patterns
- Fatigue cost
- Recovery cost
- Transfer priority
- Recommended frequency
- Typical volume
- Goal bias

## Guardrails

The policy must:

- Justify every support function.
- Support the session objective.
- Select weakness functions from evidence.
- Include structural balance where it protects long-term quality.
- Add recovery functions only when appropriate.
- Avoid redundant support functions.
- Respect recovery budget.
- Respect training state.

The policy must not:

- Select exercises.
- Select methods.
- Allocate sets.
- Prescribe load.
- Mutate programme state.
- Start or save workouts.

## Exercise Matching Contract

The future Exercise Matching Engine consumes:

- `required_support_functions`
- `priority_order`
- `confidence`
- `reason_codes`

Every non-primary exercise returned by that engine must map back to at least one selected support function.
