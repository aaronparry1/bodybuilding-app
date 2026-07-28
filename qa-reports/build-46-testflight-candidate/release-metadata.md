# Release metadata

Verdict: **PROVEN**

| Field | Before | Candidate |
| --- | --- | --- |
| Marketing version | `1.0.14` | `1.0.14` |
| iOS build number | `45` | `46` |
| Bundle identifier | `com.aaronparry.adaptivestrengthcoach` | unchanged |
| Display name | `Adaptive Strength Coach` | unchanged |
| URL scheme | `ironlogic` | unchanged |
| Android version code | `1` | unchanged |
| EAS version source | remote | remote |
| Production profile auto-increment | enabled | enabled |

The candidate number is represented consistently by Expo app configuration, the native Xcode project and the native Info.plist. EAS reports remote build `45`; the production profile will atomically auto-increment it to `46` for this build.

`ITSAppUsesNonExemptEncryption` remains `false`. Entitlements and environment selection are unchanged.
