# Pre-build verification

Verification was run against committed source `f2dd468d37b7756ba7fa40be778db79361f17d59`.

| Check | Result |
| --- | --- |
| Repair/audit ancestry | pass |
| Production route mounts `app-production` | pass |
| Startup retained-training classification | pass |
| Create Programme/startup shared canonical classification | pass |
| Focused repair/protected matrix | 22 files, 150 tests passed |
| Full automated suite before evidence creation | 385 files, 2,359 tests passed |
| Full automated suite including candidate evidence test | 386 files, 2,360 tests passed |
| TypeScript | pass |
| Production Expo config | pass: `1.0.17 (52)`, `app-production`, correct bundle |
| Web export | pass |
| Production payload scan | pass: 27 files, 0 findings |
| Coaching authority verification | mounted `1`, competing `0`, UI `0` |

`npx expo install --check` reported eight existing patch-version recommendations for Expo SDK 56 packages. No dependency was changed because dependency upgrades were outside the authorised scope and the complete test/config/export verification remained green.
