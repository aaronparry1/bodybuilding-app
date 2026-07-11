# Live Constraint Resolution Engine v1

Decision ID: 10B

Status: Locked architecture.

## Purpose

The Live Constraint Resolution Engine solves constraints that appear during an active workout. It identifies the constraint, ranks the smallest effective interventions, and preserves the session objective wherever safe.

This engine adapts the active session only. It does not permanently mutate the programme, athlete model, training state, exercise selection policy, method selection, or future prescriptions.

## Constraint Categories

- Safety: pain, injury, dizziness, equipment failure, medical concern
- Equipment: unavailable equipment, occupied machines, unavailable rack, missing equipment, home gym limitations
- Environment: crowded gym, travel, limited space, unexpected interruption
- Time: gym closing, session running long, user interruption, shortened availability
- Performance: repeated failed sets, technique breakdown, fatigue spike, unexpected weakness
- User choice: dislike, skip request, preference, manual override

## Solution Hierarchy

1. Continue unchanged
2. Modify load, reps, ROM, tempo, grip, or recovery
3. Reorder exercises, compress density, increase pairing, or remove lower-priority work
4. Substitute exercise
5. Restructure remaining session
6. Terminate exercise or workout

## Authority Boundaries

Allowed to decide:

- constraint category and severity
- ranked live solution options
- selected lowest-cost live intervention
- whether exercise substitution is required
- reason codes and evidence flags for 9J

Not allowed to decide:

- permanent programme changes
- future workout prescriptions
- athlete model updates
- exercise matching details
- loading progression policy
- recovery status
- session composition logic
- density logic

## Handoffs

If substitution is required, the engine must hand off to the Exercise Matching Engine. It must not create independent substitution logic.

If time is constrained, it must prefer Session Density and Session Composition outputs before removing mission-critical work.

If performance breaks down, it must prefer Loading & Progression and Recovery Between Efforts style adjustments before substitution.

All live interventions produce coaching evidence for the Coaching Evidence Engine.

## Regression Protections

Tests must prove:

- constraints are classified correctly
- lowest-cost solutions are preferred
- substitution is only selected when simpler options are not enough
- session objective is preserved where safe
- existing engines are referenced by handoff, not duplicated
- no programme mutation occurs
