# Bug and test-coverage audit

## Executed baseline

- `npm run typecheck`: pass.
- `npm test -- --reporter=basic`: 396 files, 2,410 tests passed in 41.92 s.
- Static search: 45 skipped/todo markers; each must be triaged before release rather than silently enabled or deleted.

The suite strongly proves pure policy behavior, repository failure injection, migration invariants, account isolation, onboarding transactions, timer persistence, active-workout lifecycle, canonical authority, projection consistency, subscriptions and production-route boundaries. It does not prove touch behavior, native storage implementation, store billing, device suspension, accessibility, frame time or current iOS/Android rendering.

| Risk area | Regression risk | Current evidence | Required release gate |
|---|---|---|---|
| Onboarding/creation | critical | extensive transaction and retained-user tests | fresh + retained physical devices both OSes |
| Active workout/timer/discard | critical | ledger/timer/discard tests and old captures | force-close, OS kill, clock change, discard on both OSes |
| Programme editing/replacement | high | policy/unit tests | canonical-vs-custom semantics and restart gate |
| History | critical | immutable ledger tests | 1,000-session render/correction/upgrade |
| Sync/backup/restore | critical | failure/queue/account tests | remote readback + second-device restore |
| Authentication/account deletion | critical | repository tests | staging external end-to-end, explicit destructive test account |
| Subscriptions | high | gateway/mock tests | sandbox storefront restore/purchase/cancel both OSes |
| Coaching rules | critical | unusually deep deterministic tests | golden fixtures + property/invariant + longitudinal approval |
| Accessibility | high | sparse static labels/captures | VoiceOver/TalkBack, 200% text, switch access |
| Performance | high | static/historical only | budgets in `performance-baseline.md` |

Recommended pyramid: policy/property tests at base; repository and orchestration fault-injection; mounted route/component interaction; small native E2E critical-path suite; manual retained-upgrade/accessibility/store gates per OS. Assertions must remain outcome-focused: carrier/history identity, visible prescription, durable restart state and remote readback—not implementation call counts alone.
