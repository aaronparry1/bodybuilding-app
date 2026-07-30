# Protected regressions

## Focused source and behaviour verification

- 5 focused files / 80 tests passed before the repair commit;
- 18 protected files / 147 tests passed after replacing two stale source-shape assertions;
- onboarding plus retained-update rerun: 2 files / 26 tests passed;
- TypeScript passed.

Covered boundaries include:

- transactional/idempotent Discard;
- active-workout persistence/restart;
- immutable canonical carriers;
- programme/account ownership;
- onboarding atomicity;
- P0 and P1A coaching protections;
- canonical Home/Plan/Train identity;
- migrations and persistence;
- completion/boundary orchestration;
- production-switch reachability.

## Final verification

- artifact and retained-update evidence: 3 files / 49 tests passed after correcting one audit-text typo;
- product-flow/source boundary: 19 tests passed after replacing its obsolete single-line ternary shape with assertions for the same existing actions plus the new restore action;
- full automated suite: **385 files / 2,359 tests passed**;
- TypeScript: passed;
- production Expo config: passed; `app-production`, `1.0.16 (50)`, production bundle identifier, strict canonical flags;
- production web export: passed;
- production payload scan: passed, 27 files, zero findings;
- coaching authority boundary: passed; 1 mounted, 0 competing, 0 UI authorities.

No behavioural expected outcome was changed. One product-flow test was updated because it asserted the old one-line source formatting and could not represent the required recovery branch.
