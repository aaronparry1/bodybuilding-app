# Coaching Evidence Engine v1

Decision 9J makes the Coaching Evidence Engine the only validated learning pathway into the Living Athlete Model.

The engine answers one question:

> What coaching evidence is trustworthy enough to update athlete knowledge?

It does not make coaching decisions.

## Architectural Boundary

Coaching evidence logic lives in `src/domain/training/coaching-evidence-engine.ts`.

Raw workout data must never directly update learned athlete characteristics.

Only the Coaching Evidence Engine may create update proposals for learned characteristics and coaching memory.

The Living Athlete Model remains the store of athlete truth. The Coaching Evidence Engine validates and distributes learning.

## Core Rule

Collect everything.

Trust only validated evidence.

Learn gradually with confidence.

## Pipeline

### 1. Evidence Collection

The engine accepts raw observations including:

- Completed sets, reps, and load
- Actual rest
- Session duration
- Skipped sets
- Skipped exercises
- Substitutions
- Warm-up modifications
- Method modifications
- Conditioning completed
- Mobility completed
- Early termination
- Time compression
- Failed sets
- Pain flags
- Soreness
- Recovery responses
- Readiness
- User notes
- Adherence behaviour

### 2. Evidence Validation

The engine rejects or reduces confidence for:

- Obviously invalid entries
- Incomplete workouts
- Injury-limited workouts
- Accidental logging
- Corrupted sessions
- Unrealistic performance
- Emergency termination

### 3. Evidence Classification

Validated observations are classified as:

- Performance
- Recovery
- Pain
- Adherence
- Preference
- Exercise
- Method
- Warm-up
- Volume
- Conditioning
- Progression
- Technical
- Behavioural

### 4. Evidence Confidence

Every observation stores:

- Confidence
- Evidence count
- Supporting sessions
- Contradiction count
- Age
- Quality

### 5. Evidence Storage

Future storage should persist validated coaching observations, not only raw workout history.

This v1 module is pure domain logic and does not write storage.

### 6. Athlete Model Updates

The engine can propose updates for:

- Adaptation speed
- Recovery capacity
- Volume tolerance
- Frequency tolerance
- Exercise response
- Method response
- Conditioning response
- Warm-up response
- Personal transfer scores
- Coaching memory

## Guardrails

The engine must:

- Block learned-trait updates from one isolated non-safety session.
- Increase confidence gradually.
- Reduce confidence when contradictory evidence appears.
- Apply age/decay information to old observations.
- Prioritise pain and safety evidence.
- Keep stable athlete traits untouched.
- Emit reason codes for validation, rejection, contradiction, and decay.

The engine must not:

- Decide interventions.
- Select exercises.
- Select methods.
- Prescribe load, reps, sets, or conditioning.
- Mutate programmes.
- Update stable athlete traits.
- Let raw logs bypass validation.
- Save data directly.
- Call network APIs.

## Living Athlete Model Contract

The only allowed route into learned characteristics is:

1. Raw evidence enters the Coaching Evidence Engine.
2. The engine validates, classifies, and scores confidence.
3. The engine emits update proposals.
4. Validated proposals are applied through Living Athlete Model update helpers.

No other engine should write learned athlete truth directly.
