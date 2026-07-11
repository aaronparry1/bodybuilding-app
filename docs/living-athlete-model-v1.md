# Living Athlete Model v1

Decision 9I makes the Living Athlete Model a core architecture component.

The model answers one question:

> What does ASC currently know about this athlete, and how confident is that knowledge?

It does not make coaching decisions.

## Architectural Boundary

The Living Athlete Model lives in `src/domain/training/living-athlete-model.ts`.

All coaching engines may read from it through read-only snapshots.

No coaching engine should mutate it directly.

Only validated evidence may update learned characteristics or coaching memory.

## Core Rule

The app coaches a continuously evolving athlete model rather than a static user profile.

Unknown values are acceptable. The model must not guess.

## Layer 1: Stable Athlete Traits

Stable traits change rarely and should update only through explicit user action.

Examples:

- Age
- Sex
- Height
- Bodyweight baseline
- Training age
- Primary goal
- Sport
- Equipment
- Injury history
- Movement restrictions
- Preferred schedule
- Unit preference

Stable traits are not learned traits.

## Layer 2: Current Athlete State

Current state changes frequently.

Examples:

- Recovery status
- Fatigue status
- Readiness
- Sleep
- Stress
- Motivation
- Soreness
- Pain
- Current bodyweight
- Illness
- Current training state

Current state can inform coaching engines, but it is not the same as long-term athlete truth.

## Layer 3: Learned Athlete Characteristics

Learned characteristics are evidence-derived.

Every learned property stores:

- `current_value`
- `confidence`
- `evidence_count`
- `last_updated`
- `supporting_reason_codes`

Examples:

- Adaptation speed
- Recovery capacity
- Fatigue tolerance
- Volume tolerance
- Frequency tolerance
- Intensity tolerance
- Exercise responsiveness
- Method responsiveness
- Warm-up responsiveness
- Conditioning responsiveness
- Preferred session duration
- Exercise competency
- Personal transfer scores
- Adherence reliability

These properties update only from validated evidence.

Confidence increases with supporting evidence and decreases when contradictory evidence appears.

## Layer 4: Coaching Memory

Coaching memory stores long-term observations.

Examples:

- Historically successful exercises
- Historically poor exercises
- Recurring pain triggers
- Preferred methods
- Recurring weak points
- Preferred exercise families
- Common recovery problems
- Successful intervention history
- Long-term progression characteristics

Coaching memory accumulates. Repeated validated observations increase evidence count and confidence.

## Integration Contract

The Living Athlete Model is a read-only dependency for:

- Adaptive Training State Engine
- Adaptation Detection
- Recovery Management
- Intervention Decision
- Loading & Progression
- Method Selection
- Exercise Matching
- Warm-up Policy
- Session Composition
- Training Resource Allocation
- Energy System Development
- Future Workout Builder

Those engines may consume the model. They may not directly mutate it.

## Guardrails

The model must:

- Keep stable traits separate from learned traits.
- Preserve unknown values instead of guessing.
- Require validated evidence for learned updates.
- Track confidence, evidence count, timestamps, and reason codes.
- Accumulate coaching memory over time.
- Provide read-only snapshots to coaching engines.

The model must not:

- Decide exercises.
- Decide reps.
- Decide load.
- Decide sets.
- Decide conditioning.
- Transition training states.
- Mutate programmes.
- Save itself to storage.
- Call network APIs.

## Future Work

Persistence, evidence validation pipelines, and Athlete Response Model updates should be added later.

This decision only locks the architecture and pure domain model.
