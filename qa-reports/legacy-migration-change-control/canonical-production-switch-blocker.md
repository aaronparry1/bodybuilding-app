# Canonical production switch — precise blocker

The certified pipeline is ready for switching, but the first production caller
(`createActiveTrainingPlan` in `src/domain/training/plan-setup.ts`) cannot yet
be migrated without inventing an application boundary.

## Missing canonical inputs at plan setup

The live `TrainingSetupInput` provides goal, frequency, split, experience,
equipment preset and planning choice. It does not provide:

- the factual exercise catalogue required by Session Construction;
- limitation and preference records in the canonical input shape;
- keyed Progress/readiness/calibration evidence;
- a deterministic operational revision/seed shared with the canonical carrier.

Supplying these from a hidden global or legacy plan would recreate an authority
outside the canonical owners.

## Missing canonical consumer boundary

`constructCanonicalActivePlanFromCanonicalInputs` returns a validated
`canonical_plan_v2` carrier. Existing production callers and screens consume
`ActiveTrainingPlan`/`TrainingYear` fields directly (`blocks`, active block,
current week, and block-derived settings). There is no canonical read model or
application service that supplies those consumers with Macrocycle → Mesocycle →
Microcycle → Session snapshots and Progress references.

Creating an adapter that reconstructs those fields would be a second training
authority and is prohibited by the phase.

## Required owning work before switching

1. Application plan creation must assemble the canonical exercise/evidence input
   from repositories and onboarding state.
2. A canonical active-plan application/read model must replace the block-shaped
   `ActiveTrainingPlan` contract for production consumers.
3. Planned-workout/Train consumers must read canonical session snapshots rather
   than requesting regeneration from `currentBlock`.

Until those boundaries exist, the production switch is not safely executable.
No production authority or caller was changed in this phase.
