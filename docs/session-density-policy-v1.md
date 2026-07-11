# Session Density Policy v1

Decision 9G centralises session density and exercise organisation in the Coaching Knowledge Layer.

The policy answers one question:

> How much work should happen per unit of time without compromising the training effect?

It does not decide rest intervals, exercises, methods, loading, warm-ups, recovery status, or final interventions.

## Architectural Boundary

Session Density logic lives only in `src/domain/training/session-density-policy.ts`.

Workout Builder may consume density outputs, but it must not invent density, pairing, superset, circuit, or compression rules.

Recovery Between Efforts Policy 9F owns recovery objectives and practical rest ranges. Session Density Policy 9G must respect those outputs and must not shorten mission-critical recovery requirements.

## Core Rule

Density is a training variable.

It should change only when the session objective, selected method, recovery status, time available, user experience, and desired training effect justify it.

Density is not the same as rest intervals:

- 9F determines how recovered the athlete should be between efforts.
- 9G determines how the whole session is organised around that recovery requirement.

## Density Levels

The policy can return:

- `very_low_density`
- `low_density`
- `moderate_density`
- `high_density`
- `very_high_density`

Heavy, high-skill, high-neural work usually uses low or very low density.

Hypertrophy accumulation can use moderate to high density when recovery allows.

Work-capacity or density-specific methods can use high or very high density when exercises are simple enough and safety is clear.

## Organisation Formats

The policy can organise work as:

- `standalone_sets`
- `alternating_sets`
- `paired_sets`
- `supersets`
- `tri_sets`
- `circuits`
- `emom`
- `density_block`

Main strength work is normally standalone unless the selected method explicitly supports another format.

Accessories, structural balance work, and lower-priority layers may be paired when they do not interfere with the mission-critical work.

## Pairing Rules

Pairing should prefer non-competing combinations:

- Push / pull
- Upper / lower
- Main / accessory
- Strength / mobility
- Prime mover / antagonist

The policy must not pair two high-skill, high-neural, or high-fatigue exercises unless a future method specifically justifies it.

Pain or technical flags reduce density around the affected pattern.

Beginners should not receive complex high-density formats unless the exercises are simple, safe, and low skill.

## Time Compression

When time is limited, the policy may recommend increasing density before removing useful work only where safe.

If density cannot safely increase, lower-priority layers should be reduced using Session Composition Policy 9B and Training Resource Allocation Policy 9C.

Time compression must not override mission-critical recovery requirements.

## Guardrails

The policy must:

- Protect heavy and high-skill work.
- Respect Recovery Between Efforts outputs.
- Pair accessories intelligently.
- Increase density only where safe.
- Reduce density around pain or technical breakdown.
- Keep density separate from rest interval logic.
- Return reason codes for accepted and rejected density choices.

The policy must not:

- Invent rest periods.
- Select exercises.
- Select methods.
- Prescribe loads.
- Prescribe warm-ups.
- Decide recovery status.
- Decide final interventions.
- Mutate or save workouts.

## Workout Builder Contract

Workout Builder consumes:

- `session_density_level`
- `density_strategy`
- `exercise_pairing_plan`
- `organisation_format`
- `estimated_duration`
- `time_compression_options`
- `density_risk_flags`
- `reason_codes`

Workout Builder may render or apply the plan, but it must not create its own pairing or density rules.
