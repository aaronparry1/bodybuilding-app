# Repository and release baseline

Audit date: 2026-08-08. Evidence classes appear in brackets.

| Item | Baseline |
|---|---|
| Starting HEAD | `248cf4596852ce72e43bf6720c8a7aae0d383f5c` [directly verified] |
| Branch | `main` [directly verified] |
| Tracked modifications | none [directly verified] |
| Preserved untracked | `.env*.example`; `dist-release-candidate/`; `hf_portfolio_backtest/`; three `qa-reports/legacy-migration-change-control/phase-d4e3*.md` files [directly verified] |
| App version | `1.0.18` (`app.config.ts`; native iOS plist) [repository-derived] |
| Android | production package `com.aaronparry.adaptivestrengthcoach`; config default versionCode 111 [repository-derived] |
| iOS | production bundle `com.aaronparry.adaptivestrengthcoach`; build 53 [repository-derived] |
| Runtime | Expo `~56.0.8`, React Native `0.85.3`, React `19.2.3` [repository-derived] |
| SDK targets | Expo 56 documents Android 7+, compile/target SDK 36 and iOS 16.4+; native plist declares `LSMinimumSystemVersion=12.0`, an inconsistency requiring built-binary/device verification [externally sourced; repository-derived] |
| Form factors/orientation | phone portrait; iPad supported and native plist permits all iPad orientations [repository-derived] |
| Profiles | development APK, profiling-development iOS, preview APK, production iOS Release/AAB; remote version source and auto-increment [repository-derived] |

Exact Expo 56 reference: [SDK 56 reference and platform matrix](https://docs.expo.dev/versions/v56.0.0/). SQLite persistence behavior is documented in the [versioned SQLite reference](https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/).

## Release-state separation

- Candidate 111 state is **user-reported/historical report**, not independently queried: 1.0.18/111, Alpha release 35, In review, unavailable to selected testers; production 109 at 100%; 110 deactivated.
- Repository configuration is not store truth. No Play Console, App Store Connect, EAS, Supabase, upload, submission, rollout, build or retained-device operation was performed.
- Latest iOS external/TestFlight state and current public storefront binaries are unknown.
- Candidate 111 was not altered, rebuilt or touched.
