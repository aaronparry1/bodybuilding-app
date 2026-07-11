# Method Selection Engine v1

Status: Architecture locked, isolated domain module.

The Method Selection Engine chooses a training method only after the programme has already decided that method adjustment is appropriate, or when a new programme/training state needs an initial method assignment. It must not be used as random variety, cosmetic templating, or a shortcut around adaptation detection and intervention selection.

## Position In The Coaching Chain

Adaptation Detection identifies whether adaptation is still happening. Intervention Decision selects the smallest justified action. Method Selection runs only when that action is `method_adjustment`, or when a new programme/training state requires method assignment.

The engine does not directly mutate a programme, rotate an exercise, change a workout, or apply a deload. It returns structured method guidance for downstream prescription engines.

## Supported Method Metadata

Each method has explicit metadata for:

- primary and secondary goals
- best training states
- compatible exercise types and movement patterns
- required experience level
- volume, intensity, fatigue, neural, recovery, and technical demand
- progression model
- loadability and measurability requirements
- risk and motivation profile
- minimum and maximum exposure
- cooldown before reuse
- set/rep structure and loading guidance

This prevents methods from being treated as interchangeable templates.

## Selection Rules

The engine preserves training intent first. It prefers method adjustment before exercise rotation when the exercise is still safe, measurable, and technically suitable.

It blocks advanced or high-risk methods for beginners, high-neural methods under poor recovery, high-volume methods under strained recovery, low-transfer novelty for primary lifts outside Pivot, recently failed methods, and methods still inside cooldown.

Training state matters:

- Foundation: simple repeatable methods such as straight sets or controlled top set/backoff.
- Accumulation: repeatable volume and stimulus-changing methods such as ladders, pyramids, eight across, or BBB-style volume when recovery supports it.
- Intensification: top set/backoffs, heavier backoff structures, 5/3/1-style waves, or wave loading when experience and recovery support it.
- Realisation: low-noise, highly measurable heavy exposure methods.
- Pivot: lower-stress variety, density, restoration, weak-point, or technical methods.

## Guardrails

- No method changes from one poor session by itself.
- No high-risk method when pain or unsafe technique is flagged.
- No repeated identical failed method without enough review evidence.
- No cooldown bypass.
- No method selection when the intervention hierarchy says `no_change`, `gather_more_evidence`, or `exercise_rotation`.
- No random variety.

## Future Integration

Future engines may use the selected method to inform rep, load, set allocation, progression, and review timing. They should consume the structured output rather than re-deciding method choice ad hoc.
