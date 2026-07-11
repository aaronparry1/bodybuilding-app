# Quality of Execution Engine v1

Decision ID: 10D

Status: Locked architecture.

## Purpose

The Quality of Execution Engine determines whether workout evidence represents a valid training exposure suitable for coaching learning.

It evaluates execution quality. It does not evaluate lifting technique.

## Evidence Boundary

The engine may use:

- directly observed evidence
- validated user input
- explicitly labelled inference

It must never invent or assume unobservable information. Technique quality is not inferred unless future evidence sources directly support it.

## Observable Evidence

- prescribed vs completed load
- prescribed vs completed reps
- prescribed vs completed sets
- failed sets and repeated failures
- unexpected performance drop-off
- skipped work
- substitutions
- exercise order changes
- actual rest vs prescribed
- workout duration
- early termination
- session compression
- pain flags
- dizziness
- equipment constraints
- recovery or effort input when validated
- user notes

## Future Evidence Sources

- bar velocity
- computer vision
- wearables
- heart rate
- ROM estimation

These sources are optional extensions. The architecture supports them without making them mandatory.

## Execution Quality

- excellent
- good
- acceptable
- questionable
- poor
- invalid

## Learning Weights

- excellent: full
- good: high
- acceptable: moderate
- questionable: low
- poor: minimal
- invalid: none

## Rules

Excellent evidence can fully influence coaching learning.

Minor deviations reduce confidence but remain usable.

Significant deviations reduce learning weight.

Invalid sessions must not update learned athlete characteristics.

Safety events always update safety history even when the session is otherwise invalid.

One poor-quality session must not disproportionately influence the athlete model.

Confidence is proportional to evidence quality.

The engine remains independent of progression, recovery, loading, and intervention decisions.

## Integration

Workout evidence flows through:

Workout -> Quality of Execution Engine -> Coaching Evidence Engine -> Living Athlete Model

The Coaching Evidence Engine must not learn directly from raw workout logs. Quality of Execution is the gatekeeper for learning weight and downstream learning permission.

## Regression Protections

Tests must prove:

- unobservable technique is not inferred as fact
- invalid sessions do not corrupt the athlete model
- safety events always propagate
- learning weight scales with evidence quality
- future sensors can be added without changing the architecture
