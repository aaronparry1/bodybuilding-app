# Findings

## P1 — unbounded history reads and synchronous aggregation

**Evidence:** cloud history query and local ledger/store implementations described in `suspected-bottlenecks.json`. **Scaling:** proportional to all sessions, nested exercises, sets, and serialized bytes. **User journeys:** history, sync/restore, repeated Train/Home refresh. **Measured cost:** not measured; code-level risk only. **Repair:** paginated/summary queries, bounded local indexes, and worker/off-main-thread aggregation where platform permits. **Risk:** migration and consistency complexity. **Tests:** call-count and long-lived fixture budgets.

## P2 — render fan-out from shared plan subscriptions

**Evidence:** multiple mounted screens subscribe to canonical plan state. **Scaling:** listeners/render count per write, not history count directly. **Repair:** selector-based subscriptions or screen-local invalidation. **Risk:** stale projections. **Tests:** repeated navigation and render counts.

## P2 — billing/auth network work during provider lifecycle

**Evidence:** auth session restore and subscription identity/offering refresh effects. **Scaling:** network latency rather than history. **Repair:** ensure immediate shell and cached entitlement before refresh. **Risk:** entitlement freshness. **Tests:** offline and delayed gateway tests.

## Evidence gap — reported pause not reproduced

No interactive profiler/browser/native runtime was available for this audit. The tester report is treated as a release-blocking P1 symptom until measured.
