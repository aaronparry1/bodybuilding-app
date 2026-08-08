# Screen and journey inventory

Production route root: `app-production`; development adds `design-qa`, `diagnostics`, and `v2-benchmark-qa`. Local reads are normally synchronous SQLite-KV projections; authenticated restore/sync adds network dependency.

| Surface/route | Owner/authority | Reads/writes and failure behavior | iOS | Android | Coverage/risk |
|---|---|---|---|---|---|
| Launch `/` and layouts | auth, subscription hydration, canonical reconciliation | blocks on auth/data/reconciliation; explicit retry/recovery copy | historical | not tested | startup tests; timing unmeasured |
| Auth `/(auth)` | Supabase auth + SecureStore adapter | sign-in/up/reset/offline; network errors surfaced | not current | not tested | auth unit/integration; store behavior unknown |
| Onboarding `/onboarding` | canonical onboarding transaction | writes carrier, owner, settings atomically with rollback | captured | not tested | strong regression tests; long 9-step flow |
| Home tab `/` | canonical read model + ledger | local; loading/recovery/empty states | captured | not tested | extensive fixture tests |
| Train tab `/train` | immutable snapshot + recorded ledger + rest-timer repo | set events, edit, swap/add, pause/resume/complete/discard; fail-closed identities | captured | not tested | deep tests; dense screen |
| Plan `/programmes` tab | canonical read model | local projection and next-workout navigation | captured | not tested | shared authority verified in tests |
| Progress `/analytics` tab | canonical evidence/report projections | local aggregation; error/insufficient-history states | captured | not tested | unbounded-history scaling risk |
| Library tab/details/new | exercise catalogue/custom repo/cloud sync | local CRUD; custom writes queued | historical marketing | not tested | tests; delete consequences need device gate |
| Programme detail `/programmes/[id]` | custom programme repository | separate from active canonical carrier | not tested | not tested | potentially confusing legacy surface |
| Programme/session builders | custom programme repository | draft/custom writes; cannot activate/overwrite canonical plan | not tested | not tested | reachable, separate product authority |
| Programme manage/exercise replacement | canonical exercise management + preferences/customisations | active-session substitutions retain evidence separation | capture has swap fixture | not tested | good policy tests; future preference persistence incomplete |
| Session prep | canonical snapshot/prep repo | local complete/skip; restored across restart | captured | not tested | tests and historical captures |
| Completion summary | ledger/completion projection | completed session + PR evidence; no back | captured | not tested | tests; external sharing unverified |
| History list/detail/exercise | immutable ledger/history projections | local reads; cloud migration input retained | not tested | not tested | immutability tests; large-history budget absent |
| Capacity focus/readiness | settings/readiness repositories | local flags/snapshots | not tested | not tested | collection-to-decision maturity limited |
| Recovery diagnostics | read-only reconciliation diagnostics | local evidence; production route intentionally present | captured recovery states | not tested | should remain non-mutating |
| Settings/profile/account backup | settings, auth, cloud envelope, billing | local settings; remote backup/sync; errors recorded | paywall/settings captures | not tested | readback is not an end-to-end device proof |
| Paywall/subscription | RevenueCat gateway/cache | network/store dependent; cached entitlements | screenshots | not tested | tests use gateways/mocks; storefront unknown |
| Logout/login | auth + account-scoped restore | owner mismatch blocks restore | not tested | not tested | account-isolation tests |
| Account deletion | account service/Supabase RPC | destructive, confirmation required | not tested | not tested | 15 tests; external deployment unknown |
| Reinstall/new device | cloud backup envelope | restores only if authenticated backup exists and schema/read succeeds | not tested | not tested | tests, not device proof |
| Force-close/update/migration | versioned repositories/reconciliation | recover, reconstruct or block without presenting empty durable state | partial reports | Candidate 111 gate pending | current physical gates required |

Completed historical sessions are snapshot/event based and treated as immutable; correction replaces effective evidence before completion through a versioned ledger path. Direct physical-database deletion was not observed or claimed.
