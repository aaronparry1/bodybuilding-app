# Canonical v2 session orchestration

`constructCanonicalActivePlanFromCanonicalInputs` is the normal construction
entry point for new canonical plans. It accepts upstream athlete, Macrocycle,
Mesocycle, Microcycle, exercise and Progress inputs only. It enumerates every
Microcycle session descriptor and invokes the canonical Session Construction
pipeline for each one; callers cannot provide planned-session snapshots to
this path.

The existing `constructCanonicalActivePlan` remains the narrow compatibility /
restoration assembly path for already-created snapshots. It is not the normal
new-plan API and is retained until the repository migration is complete.

Production callers have not been switched in this phase. Persistence and
round-trip certification remain pending because the carrier validator still
accepts historical snapshot records that predate the complete v2 prescription
schema.
