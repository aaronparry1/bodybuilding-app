# Energy System Development Policy v1

Decision 9H centralises energy-system development in the Coaching Knowledge Layer.

The policy answers one question:

> Should ASC include conditioning, and if so what energy-system objective should it serve?

It does not choose the conditioning modality.

## Architectural Boundary

Energy system logic lives only in `src/domain/training/energy-system-development-policy.ts`.

Workout Builder may consume the policy output, but it must not invent conditioning objectives, placement, intensity intent, or recovery-cost rules.

A future Conditioning Matching Engine will choose the modality. This policy only decides the energy-system objective.

## Core Rule

Conditioning is optional by design.

ASC should not add generic cardio, random finishers, or fatigue for its own sake.

Conditioning must support the current programme objective and fit the available recovery budget. It must not hijack the primary strength or hypertrophy effect.

## Energy System Objectives

The policy can return:

- `none`
- `recovery_capacity`
- `aerobic_base`
- `general_work_capacity`
- `lactate_tolerance`
- `alactic_power`
- `sport_specific_conditioning`
- `gpp`

Returning an objective is not the same as selecting a modality.

## Placement Options

The policy can recommend:

- `same_session_after_lifting`
- `separate_session`
- `separate_day`
- `recovery_day`
- `omit`

Mission-critical lifting takes priority. Conditioning should be reduced or removed before strength or hypertrophy work is compromised.

## Recovery Cost

Conditioning has recovery cost and must interact with Training Resource Allocation.

The policy returns a maximum recovery cost:

- `none`
- `low`
- `moderate`
- `high`

Compromised recovery should bias toward `recovery_capacity`, easy work, or omission.

High systemic fatigue should block lactate-heavy work.

Alactic power must stay low volume and high quality. It must not become a fatigue circuit.

## Guardrails

The policy must:

- Treat conditioning as optional.
- Select the energy-system objective before modality.
- Protect strength, hypertrophy, and power priorities from interference.
- Respect training state, microcycle context, and recovery status.
- Reduce or omit conditioning when recovery is compromised.
- Keep sport-specific conditioning tied to user goal and context.
- Return reason codes for inclusion, reduction, or omission.

The policy must not:

- Choose modality.
- Choose exercises.
- Build circuits.
- Prescribe warm-ups.
- Prescribe lifting load, reps, or sets.
- Mutate workouts.
- Mutate programme state.
- Save data.

## Workout Builder Contract

Workout Builder consumes:

- `selected_energy_system_objective`
- `conditioning_priority`
- `include_conditioning`
- `recommended_placement`
- `max_recovery_cost`
- `suggested_duration_range`
- `intensity_intent`
- `interference_risk`
- `reason_codes`
- `safety_flags`
- `handoff_to_conditioning_matching_engine`

Workout Builder may render or apply these outputs, but it must not create its own conditioning logic or select a modality without the future matching engine.
