# Pre-build verification

All checks ran against committed release HEAD `d0e644035b974c7cf6299d491bdb3a15498cd904`.

| Check | Result |
| --- | --- |
| Attributable Train/protected matrix | passed: 28 files, 220 tests |
| Full automated suite | passed before the build: 388 files, 2,375 tests; final evidence-inclusive rerun: 389 files, 2,379 tests |
| TypeScript | passed: `tsc --noEmit` |
| Production Expo public config | passed: `1.0.18 (53)`, `app-production`, correct bundle |
| Production web export | passed |
| Production payload scan | passed: 27 files, zero findings |
| Release artifact source state | tracked clean; approved untracked paths excluded by `.easignore` |
| App Store distribution profile | passed: production Release / `STORE` |
| Development-client exclusion | passed: no `expo-dev-client`, `EXDevLauncher` or `EXDevMenu` dependency/payload |

The focused matrix covered Train navigation/focus, minimise/pause/resume, active-workout and rest restart, exercise navigation, grouped methods, early/full completion, Discard, retained onboarding, Home/Plan/Train boundaries, persistence/migration/idempotency, final P0 and P1A protections.

Authority counts remained:

- mounted coaching authorities: `1`;
- competing coaching authorities: `0`;
- UI adaptation authorities: `0`.
