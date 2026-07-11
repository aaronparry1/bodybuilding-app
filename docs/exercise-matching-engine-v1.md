# Exercise Matching Engine v1

Decision 9E creates the Exercise Matching Engine.

The engine answers one question:

> Which exercises best fulfil the required support functions for this user, session, and context?

## Architectural Boundary

Support Function Policy decides what coaching functions are needed.

Exercise Matching Engine decides which exercises best fulfil those functions.

Workout Builder consumes ranked candidates, but it must not invent exercise selection logic.

## Core Rule

Exercises are solutions to coaching functions.

The engine must never pick an exercise simply because it appears in a generic template or because variety is desired. Every ranked candidate must map back to at least one required support function.

## Inputs

The engine consumes:

- Required support functions from 9D
- Session objective
- Current training state
- Selected method
- Movement pattern
- Intervention reason codes
- Adaptation status
- Recovery status
- Pain or issue flags
- User experience level
- Equipment availability
- User preferences and dislikes
- Exercise history
- Personal performance history
- Pain history
- Adherence history
- Recent exercise exposure
- Exercise metadata / knowledge graph

## Exercise Metadata

Each candidate should include:

- Movement pattern
- Primary and secondary muscles
- Equipment required
- Skill level
- Setup complexity
- Loadability
- Measurability
- Joint stress profile
- Range of motion profile
- Stability demand
- Axial loading
- Fatigue cost
- Recovery cost
- Hypertrophy, strength, power, and technical-practice bias
- Compatible training states
- Compatible methods
- Support functions fulfilled
- Transfer tags
- Transfer scores
- Variation family
- Progression compatibility
- Substitution candidates
- Contraindications

## Scoring

Candidates are scored across:

- Support function match
- Transfer
- Safety
- Recovery fit
- Equipment fit
- Experience fit
- Method compatibility
- Training state fit
- Measurability
- Loadability
- Novelty / exposure
- Personal response
- Preference

## Guardrails

The engine must:

- Return ranked candidates, not only one exercise.
- Filter unavailable equipment.
- Filter pain or safety contraindications.
- Prefer high-transfer, measurable, loadable exercises for mission-critical work.
- Prefer lower-fatigue or lower-joint-stress exercises when recovery is compromised.
- Prefer simpler and more stable exercises for beginners and Foundation state.
- Prefer highly specific, low-noise exercises in Realisation.
- Prefer hypertrophy and work-capacity compatible exercises in Accumulation.
- Prefer loadable strength-biased exercises in Intensification.
- Prefer lower-stress or restorative exercises in Pivot.
- Avoid recently saturated exercises unless cooldown is cleared.
- Use personal history where available.
- Return rejected candidates with reason codes.

The engine must not:

- Decide whether rotation is needed.
- Select support functions.
- Allocate volume.
- Prescribe loading.
- Mutate workouts or programmes.
- Save state.

## Workout Builder Contract

Workout Builder consumes:

- `ranked_exercise_candidates`
- `selected_candidate_default`
- `candidate_scores`
- `rejected_candidates_with_reasons`
- `fulfilled_support_functions`
- `unfulfilled_support_functions`
- `confidence`
- `reason_codes`
- `safety_flags`
- `substitution_chain`

If the builder cannot use the selected default, it should move through the ranked list or return to Exercise Matching. It should not choose an unranked exercise on its own.
