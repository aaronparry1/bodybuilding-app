# Release metadata

| Stage | Marketing version | iOS build | Result |
| --- | --- | ---: | --- |
| Certified checkpoint | `1.0.15` | `47` | Existing accepted build |
| First replacement | `1.0.15` | `48` | Archive built; Apple rejected the closed train |
| Corrected train attempt | intended `1.0.16` | `49` | Cancelled before archive after native metadata contradiction was detected |
| Uploaded replacement | `1.0.16` | `50` | Built and accepted for processing |

Final resolved identity:

- App name: `Adaptive Strength Coach`
- Bundle identifier: `com.aaronparry.adaptivestrengthcoach`
- Marketing version: `1.0.16`
- iOS build number: `50`
- App Store Connect application: `6762462649`
- Distribution: App Store/TestFlight
- EAS profile: `production`
- Xcode scheme/configuration: `AdaptiveStrengthCoach` / `Release`
- Android version code: `1` (unchanged)

Metadata sources now agree:

- `app.config.ts`: `1.0.16 (50)`
- `ios/AdaptiveStrengthCoach/Info.plist`: `1.0.16 (50)`
- `ios/AdaptiveStrengthCoach.xcodeproj/project.pbxproj`: `1.0.16 (50)`
- EAS finished-build record: `1.0.16 (50)`

Build `48` could not be the successful candidate because Apple directly returned `ITMS-90062` and `ITMS-90186`: `1.0.15` was not higher than the previously approved version and its pre-release train was closed. Remote auto-increment consumed `49` for the deliberately cancelled contradiction check, so the next valid unique build was `50`.
