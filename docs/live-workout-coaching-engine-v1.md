# Live Workout Coaching Engine v1

Decision 10A creates the Live Workout Coaching Engine.

The generated workout is the plan.

The Live Workout Coaching Engine is the coach during execution.

## Architectural Boundary

Live Workout Coaching may adapt the active session only.

It must not permanently mutate:

- Programme state
- Athlete model
- Training state
- Method selection
- Future prescriptions
- Learned athlete traits

All permanent learning goes through the Coaching Evidence Engine.

## Inputs

The engine consumes:

- Generated workout plan
- Final coaching decision payload
- Warm-up plan
- Loading prescription
- Method prescription
- Recovery Between Efforts guidance
- Density plan
- Session composition layers
- Time available
- Actual completed sets/reps/load
- Failed sets
- User-reported difficulty
- Pain/issue flags
- Skipped sets/exercises
- Substitutions
- Rest actually taken
- Session duration
- Live time remaining

## Allowed Live Actions

The engine may return:

- `no_change`
- `hold_load`
- `increase_next_set_load`
- `decrease_next_set_load`
- `reduce_reps`
- `reduce_sets`
- `remove_backoff_sets`
- `extend_rest`
- `compress_lower_priority_layers`
- `substitute_exercise`
- `stop_exercise`
- `stop_workout`
- `flag_for_review`

These are active-session adjustments only.

## Outputs

The engine returns:

- `active_session_adjustment`
- `adjusted_prescription`
- `affected_exercises`
- `reason_codes`
- `safety_flags`
- `evidence_flags_for_9J`
- `user_facing_coaching_message`
- `active_session_only`
- `permanent_mutation_allowed`

Every live change must produce evidence flags for the Coaching Evidence Engine.

## Rules

Safety and pain override everything.

One unexpectedly poor set should not trigger drastic changes unless pain or clear failure is present.

Repeated failed sets should reduce load, reduce volume, or stop the exercise.

Strong performance may allow small live increases only inside method safety rules.

AMRAPs must respect effort caps.

Backoff work should be reduced before mission-critical work is compromised.

Lower-priority session layers should be compressed before Layer 1 work.

If time runs short, use Session Density and Training Resource Allocation outputs to compress intelligently.

If pain appears, stop or substitute the affected movement.

## Guardrails

The engine must:

- Stay active-session only.
- Return reason codes.
- Emit evidence flags for 9J.
- Respect pain and safety.
- Respect method effort caps.
- Protect mission-critical work.
- Use density/resource outputs for time compression.

The engine must not:

- Save workouts.
- Mutate programmes.
- Update the Living Athlete Model.
- Update learned traits.
- Change future prescriptions.
- Change training state.
- Select future methods.
- Bypass Coaching Evidence Engine.

## Downstream Contract

The active workout UI/session runtime may consume the active-session adjustment.

Permanent learning must be routed through 9J as evidence.

Programme-changing actions must still route through 8K.
