# Exhaustive boundary invariant

For every durable completed planned session, the production result is exactly
one of:

1. an existing planned coaching opportunity;
2. an atomically constructed same-phase continuation inside the declared
   Mesocycle maximum;
3. an atomically constructed approved successor;
4. a persisted typed review/blocked state with its reason, missing fact or
   policy, usability, completed-session identity and reevaluation event; or
5. a canonical terminal state.

The resolver uses only `mesocycleLibrary` horizons and
`MesocyclePrescriptionPolicy.transition.approvedSuccessors`. It cannot invent
an edge or athlete fact.

`canonical_coaching_boundary_state_v1` is stored in the truthful v2
application receipt and projected by the canonical read model. Home renders
the review attention, Plan retains the same state, and Train uses the same
explanation when no next session is available.

Startup `resumePendingCanonicalCoachingWork` retries a blocked work item only
when its persisted evidence/carrier resolution fingerprint changes. A new
decision identity is derived from that changed factual state, while the
original coaching work-item identity remains stable. Duplicate restart calls
therefore settle once.

The formerly deadlocked final-session recovery fixture now persists a review
state and, after later stable canonical evidence is persisted, constructs the
next authorised same-phase opportunity. No completed phase is rewritten.
