# Recommended set guidance identity and timing

## Decision required before E2E3

The legacy `raise_range`/`lower_range` branch changes an accessory slot's recommended set-count guidance during programme construction. That slot is generated, not a persistently addressable active-plan guidance object. The current plan can identify plan, current mesocycle and microcycle, while planned workouts can identify plan mesocycle, microcycle and session index. It cannot identify one persisted `recommendedMinSets`/`recommendedMaxSets` guidance target without an array/order or block fallback.

The proposed current target granularity is **one future programme guidance slot**, scoped to plan, mesocycle, session-template identity, exercise-slot identity and set-guidance domain. It must be represented by a versioned `RecommendedSetGuidanceTargetIdentity` with stable child identity plus parent/version validation. Array positions, display names, timestamps and legacy block/week are prohibited.

New current adjustment records will need target identity, expected target version, effective timing, and semantic idempotency key. Existing block-scoped records are compatibility-only and require manual review or the isolated legacy path; they must not be mapped into current identities.

## Recommended timing policy

Recommended default: **next microcycle only**. An accepted change records the plan, mesocycle and first effective microcycle. It affects only workouts constructed for that effective-or-later current mesocycle point; already-created workouts are never rebuilt. If any session in the current microcycle exists, that microcycle is unchanged. A deload or pending current progression decision blocks application pending explicit policy.

This avoids partial same-microcycle changes, preserves session-role consistency and stored exact targets, and keeps range changes deterministic. It is a product/training-policy decision for Aaron to approve before E2E3. Alternative policies (immediate future-only, next mesocycle, decision-bound, or manually named first session) remain unapproved.

## Future E2E3 contract

`ApplyRecommendedSetGuidanceAdjustmentCommand` must require adjustment record ID, complete target identity, expected plan/target versions, direction/magnitude, `RecommendedSetGuidanceEffectiveTiming`, expected lifecycle, policy versions, and an idempotency key based on record + target + timing + policy. It must return explicit stale-plan/target, open-reference, completed-reference, timing-passed, deload/decision-conflict, compatibility, duplicate, and persistence-failure outcomes.

Implementation sequence: persist identity contract → support new record writer → persist timing contract → validate resolver identity/version → add idempotent service without caller → recover staged persistence → route raise → route lower → certify. No E2E3 implementation is approved until the target-granularity and timing decisions are accepted.
