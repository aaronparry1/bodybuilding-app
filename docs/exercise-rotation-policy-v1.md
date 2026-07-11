# Exercise Rotation & Variation Policy v1

Status: Decision locked.

Exercise rotation must be intelligent, not random.

This policy is used after the Intervention Decision Engine selects `exercise_rotation`. It does not decide whether rotation is needed.

## Core Principle

Use the smallest meaningful variation that preserves the movement pattern and training intent, unless pain, equipment, safety, or repeated failure requires a larger change.

## Required Metadata

Exercise rotation decisions should use metadata for:

- movement pattern
- primary and secondary muscles
- equipment required
- skill level
- setup complexity
- loadability
- measurability
- joint stress profile
- range of motion profile
- stability demand
- axial loading
- fatigue cost
- hypertrophy, strength, and power bias
- transfer tags
- variation family
- progression compatibility

## Rules

Preserve movement pattern by default.

Preserve training intent by default.

Prefer the smallest useful variation first.

Do not replace a main lift with a low-transfer accessory unless pain or safety requires it.

Do not rotate purely for novelty while adaptation is still occurring.

Respect exposure minimums and rotation cooldowns.

Avoid recently saturated exercises.

Prefer high measurability and loadability for primary lifts.

Prefer safer and lower joint-stress variations when pain or issue flags are present.

Respect equipment availability, experience level, setup complexity, and user preferences.

## State Sensitivity

Foundation:
Favour stable, learnable, technically consistent exercises.

Accumulation:
Favour hypertrophy-biased, repeatable, moderate-skill variations.

Intensification:
Favour loadable, high-transfer strength variations.

Realisation:
Favour highly specific, measurable, low-noise variations.

Pivot:
Favour lower-stress, restorative, weak-point, or technical variations.

## Movement Correspondence

Preserve correspondence where possible:

- similar movement pattern
- similar range or amplitude
- relevant force direction
- relevant strength quality
- relevant muscular work regime

Use weakness or limiting-factor tags when available:

- bottom range
- mid range
- lockout
- stability
- upper back
- triceps
- quads
- hamstrings
- glutes
- grip
- core/bracing

## Boundary

This policy does not:

- decide whether rotation is needed
- mutate the programme
- randomly vary exercises
- bypass the Intervention Decision Engine
- replace primary lifts with low-transfer accessories by default

It returns structured recommendations for downstream exercise selection to apply.

## Implementation Anchor

The canonical implementation is:

- `src/domain/training/exercise-rotation-policy.ts`
- `tests/exercise-rotation-policy.test.ts`

Future exercise selection code must not reintroduce random exercise swapping or low-transfer primary-lift substitutions.
