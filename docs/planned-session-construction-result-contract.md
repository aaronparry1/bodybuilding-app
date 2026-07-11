# Planned-session construction result contract

`buildRecoveryWorkoutSession` is the authoritative planned-session constructor and returns an explicit result: `constructed`, `blocked_by_intervention`, `no_eligible_candidate`, or `invalid_input`.

`constructed` carries the unchanged stored workout prescription. `blocked_by_intervention` carries only the required slot, excluded exercise IDs, and intervention keys. `no_eligible_candidate` distinguishes ordinary catalogue absence. `invalid_input` identifies incomplete planning context or invalid constructed output.

The active logger narrows `constructed` before starting a session and retains its existing no-session UI boundary for non-success outcomes. Non-success outcomes do not persist a workout, consume a session index, advance a microcycle, or transition a mesocycle. There is no nullable constructor compatibility wrapper.

Candidate generation, scoring, exact targets, and intervention semantics are unchanged. Minimal presentation remains deferred to the existing logger no-session state; no intervention details are exposed to users.
