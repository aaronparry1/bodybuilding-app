# Performance release cycle 1.1.4

## Scope

Fresh source audit of user-triggered actions for synchronous, history-dependent work, duplicate hydration, repeated whole-store writes, unbounded rendering, and nested scans. The audit covered protected routes, tabs, onboarding, authentication, billing, sync, sharing, notification actions, training application services, and local repositories.

## Findings and disposition

| Surface | Finding | Disposition |
| --- | --- | --- |
| Train start/resume/pause/set/edit/swap | UI called `canonicalActivePlanState.refresh()` after application commands had already hydrated state | Fixed: redundant refreshes removed; failure recovery refresh retained |
| Tab-leave workout minimisation | Duplicate refresh after the minimise command | Fixed |
| Programme exercise edit | Duplicate refresh after the edit command | Fixed |
| Train session hook reload | Duplicate global refresh before local projection | Fixed |
| Completion summary | Re-exported and rescanned the full workout history on unrelated local UI rerenders | Fixed: aggregate, decision, and history reads memoized |
| History filters | Revalidated/projected the complete exported ledger on each input keystroke | Fixed: filters use deferred values; ledger export remains memoized |
| Train session projection | Filtered the complete event list once per prescription slot | Fixed: events indexed by slot in one pass |
| Completion evidence reconciliation | Searched all slots for every performed event | Fixed: slot identities indexed once |
| Progress evaluation | Repeated array membership and nested evidence scans | Fixed: selected evidence indexed once |
| Post-workout reconciliation | Re-read evidence/decisions and rewrote whole method/adaptation stores once per outcome | Fixed: reads reused and outcomes persisted in batches |
| Cloud restore | Rewrote the complete progress-evidence object once per restored item | Fixed: validated batch restore and one persistence write |
| Manual/automatic cloud backup | Exported and validated all ledger/evidence synchronously before the first network yield | Fixed: batched async export/list methods yield to the event loop |
| Sync queue | Re-read and rewrote the complete queue once per enqueue and once per settled item | Fixed: batch enqueue and batch settle, each one persistence write |
| Progress presentation | Reallocated growing arrays while grouping events | Fixed: mutable local grouping arrays |
| Construction facts | Reallocated growing arrays while grouping exercise history | Fixed: mutable local grouping arrays |
| Progress trend | Potentially unbounded charts | Already bounded to 12 observations; no change |
| History rendering | Potentially unbounded mounted rows | Already virtualized with `FlatList`; no change |
| Plan rendering | Potentially unbounded historical rendering | Current microcycle only; no change |
| Library rendering/search | Potentially unbounded mounted rows | Already virtualized and catalogue-bounded; no change |
| Onboarding framework probing | Expensive work during render | Already memoized on bounded onboarding inputs; no change |
| Sharing/referrals | Unbounded render/action work | Native async share and bounded referral presentation; no change |
| Auth/billing/notifications | Synchronous user-action work | Native/network work is awaited and yields; no history-scaled synchronous scan found |

## Regression evidence

- 500 method outcomes: prior single-save path performs 500 whole-store writes; batch path performs 1.
- 500 sync items: batch enqueue performs 1 queue write and batch settle performs 1.
- Batch progress-evidence and adaptation-outcome tests cover validation, idempotency, and one-write persistence.
- Full suite and device results are recorded in the release handoff for the exact build commit.

## Platform parity

All performance fixes are in shared TypeScript application/domain/data code. The only platform branches in affected screens are native keyboard accommodation, native icon names, store naming/links, and platform-specific RevenueCat key/entitlement normalization; none changes training, history, progress, sync, sharing, or referral behavior.
