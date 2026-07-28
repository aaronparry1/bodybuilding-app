# Release metadata

Verdict: **PROVEN**

| Field | Starting state | Initial archive | Apple-accepted candidate |
| --- | --- | --- | --- |
| Marketing version | `1.0.14` | `1.0.14` | `1.0.15` |
| iOS build number | `45` | `46` | `47` |
| Bundle identifier | `com.aaronparry.adaptivestrengthcoach` | unchanged | unchanged |
| Display name | `Adaptive Strength Coach` | unchanged | unchanged |
| URL scheme | `ironlogic` | unchanged | unchanged |
| Android version code | `1` | unchanged | unchanged |
| EAS version source | remote | remote | remote |
| Production profile auto-increment | enabled | enabled | enabled |

Apple validation rejected the otherwise successful `1.0.14 (46)` archive because `1.0.14` is already approved and its pre-release train is closed. This is direct evidence that a marketing-version increment was required rather than optional. EAS then atomically incremented its remote iOS counter from `46` to `47`.

`1.0.15 (47)` is represented consistently by Expo app configuration, the native Xcode project and the native Info.plist.

`ITSAppUsesNonExemptEncryption` remains `false`. Entitlements and environment selection are unchanged.
