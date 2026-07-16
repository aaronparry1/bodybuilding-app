# Architecture inventory

## Scope

Inventory is based on tracked `app/`, `src/`, `package.json`, Expo configuration, and Supabase migrations. No production account or credentials were accessed. Runtime latency was not measured in this phase.

| Area | Owner / source | Shape and access | Growth / interaction risk |
|---|---|---|---|
| React state/context | `app/**`, `src/application/auth/auth-context.tsx`, `subscription-context.tsx` | `useState`, `useMemo`, callbacks and provider values | Provider-wide invalidation can fan out renders; subscriptions have cleanup in reviewed providers |
| Canonical plan | `canonical-active-plan-state.ts`, v2 repository | Versioned carrier in `jsonStore`/SQLite KV | Snapshot size grows with planned sessions; synchronous hydration |
| Recorded ledger | `canonical-recorded-session-ledger.ts` | Store keyed by recorded-session ID, events array | `list`/`exportPlan` scan and sort all records |
| Legacy local repositories | `workout-session-repository.ts`, `active-training-plan-repository.ts` | Whole JSON arrays/objects | Retained migration/compatibility; unsafe for new authority if reached |
| Sync | `cloud-data-sync.ts`, `sync-queue.ts` | Full backup plus queued session writes | Backup serializes all history; remote work must not block controls |
| Billing | `subscription-context.tsx`, RevenueCat gateway/mock | Context state and cached entitlement | Launch/user transitions may await offerings/customer info |
| Auth | `auth-context.tsx`, Supabase auth listener | Session plus auth state callback | Listener cleanup present; network session restore at startup |
| Settings | `app-settings.ts`, JSON store | Small bounded preference object | Synchronous persistence; expected small |
| Exercise/programme libraries | local repositories and cloud repositories | Arrays with subscriptions; cloud nested reads | Search/filter cost and full collection reads can scale |
| Analytics | `canonical-analytics-queries.ts`, analytics domain | Derived projections over canonical facts | Must avoid repeated full-history recomputation |

The high-risk path is synchronous whole-store parsing plus full-history aggregation, not a proven memory leak. A browser/React profiler is still required.
