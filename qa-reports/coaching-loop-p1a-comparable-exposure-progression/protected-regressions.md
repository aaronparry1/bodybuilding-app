# Protected regressions

Focused verification passed:

- comparable-exposure/P1A tests: 35 tests;
- P0/grouped/boundary/identity/editing/Discard/method/projection set: 78 tests;
- TypeScript: passed.

P0 invariants retained:

- one mounted authority;
- zero competing authorities;
- generated identity is non-material;
- final boundary state remains truthful;
- post-CAS restart converges;
- immutable completed history remains unchanged;
- onboarding, Train methods, editing and Discard tests remain green in focused runs.

Final verification:

- full automated suite: **PROVEN** — 376 files passed, 2,285 tests passed;
- TypeScript: **PROVEN** — `npm run typecheck`;
- production Expo configuration: **PROVEN** — version `1.0.14`, iOS build `45`, canonical production flags active, shadow mode inactive;
- web export: **PROVEN** — production-mode Expo web export completed;
- production payload isolation: **PROVEN** — the payload scan found no prohibited development or shadow authority.
