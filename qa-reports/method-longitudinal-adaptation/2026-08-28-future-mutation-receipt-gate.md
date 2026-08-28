# Superset future-mutation and receipt gate — 2026-08-28

## Delivered

- `canonical_superset_future_mutation_v1` resolves the earliest unique unstarted semantic pair.
- Member A and B numeric changes are separate exact mutations with slot, before/after, increment and rounding provenance.
- A round-rest change is one bounded group mutation and updates estimated duration.
- Pair removal is one coherent mutation which retains both exercises and changes both future slots to canonical straight-set structures.
- Missing, started, unrelated, ambiguous and duration-overflow targets fail closed.
- `canonical_superset_application_v1` persists the proposal and intended prescription fingerprint before CAS.
- A successful receipt contains decision, evidence, pair, target, exact mutations, revisions, duration, authority, reconstruction and persisted explanation identities.
- Replay returns the existing receipt. A crash after CAS is reconciled from the intended prescription fingerprint without applying another revision.
- Production cannot apply a `shadow_only` proposal. Tests use explicit `shadow_certification` authority only.
- `canonical_superset_transition_policy_v1` explicitly carries, defers, reassesses, removes or expires method evidence at each tested boundary while always retaining valid exercise progression history.

## Verification

- Future mutation: 6/6.
- Durable application and replay: 4/4.
- Transition policy: 12/12.
- Combined mutation/application/transition selection: 22/22.
- TypeScript under Node v24.19.0: pass.
- Full suite: 2,525/2,529 tests passed. The only failed tests are the four protected pre-existing files: app icon configuration, Train brand boundary, onboarding programme integrity and settings simplification.
- `git diff --check`: pass.

## Promotion result

**Not promoted.** Antagonist-superset adaptation remains `shadow_only`.

The exact mutation and durable reconciliation mechanisms are now present, but the complete gate still lacks mounted post-workout proposal/application wiring, correction invalidation against pending proposals, native receipt-derived presentation across Completion/Today/Preview/Progress, both-device screenshots, Dynamic Type and VoiceOver evidence, native replay/relaunch proof, export/build/performance reruns, and a complete shadow-versus-authority comparison. Weakening those requirements would make the production claim false.
