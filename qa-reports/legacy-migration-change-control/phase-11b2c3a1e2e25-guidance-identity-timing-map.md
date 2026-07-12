# Guidance identity and timing map

| Container | Current identity | Limitation | Required future identity |
| --- | --- | --- | --- |
| Active plan | plan ID, current mesocycle/microcycle | no persisted programme guidance target | parent/version validation |
| Generated programme slot | slot/exercise settings include recommended set guidance | generated during construction; no stable active-plan address | stable guidance-owner and slot IDs |
| Planned workout | mesocycle, microcycle, session index and exact-target coverage | identifies existing prescription, not future guidance | reference only; never target |
| Volume adjustment record | action, muscle, block/week compatibility | no target, timing, version or idempotency identity | target identity, effective timing, expected version, semantic key |

Target granularity is proposed as a future programme guidance slot. Stable child ID plus parent/version validation is recommended. Current block/week is compatibility metadata only.

Timing options were assessed: immediate future-only risks partial current microcycles; next microcycle is recommended; next mesocycle is conservative; decision-bound adds coupling; manual effective target adds UX/policy surface. The recommended next-microcycle policy blocks an active deload or pending decision until an owner approves handling.

E2E3 gates: approved target granularity, persisted identity, approved effective timing, idempotency contract, stale/conflict outcomes, compatibility policy, and no exact-target rewrite/workout rebuild.
