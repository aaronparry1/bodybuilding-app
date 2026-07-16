# SwiftBuild diagnosis (raw reproduction)

## Reproductions

Workspace: `ios/AdaptiveStrengthCoach.xcworkspace`; scheme: `AdaptiveStrengthCoach`; Debug simulator destination `06EEA722-8702-40AC-81FC-53E92D205303`. Safe invalid local service sentinels and `EXPO_USE_PRECOMPILED_MODULES=0` were used.

| Run | Diagnostic | Result |
| --- | --- | --- |
| A | Fresh DerivedData, normal parallelism, result bundle | Advanced through React Native targets, then idled in `ExpoModulesCore` Swift compilation while SwiftBuild had no active compiler child; stopped after ~18 minutes. |
| B | Fresh DerivedData, `SWIFT_COMPILATION_MODE=incremental` | Advanced through Fabric/RNScreens and then idled in native compilation; no error or completion. |
| C | Fresh DerivedData, `-jobs 4` | Advanced through Fabric/RNReanimated targets, then SwiftBuild again had no active child; stopped after ~7 minutes. |

## Classification

CocoaPods is ruled out: pod installation completed before all runs. A single-source compiler error is also not demonstrated: no `error:` or `BUILD FAILED` was emitted. Runs A–C show an abnormally slow or stalled first native build with repeated idle SwiftBuild states after active compilation. The exact cause is not proven between build-service scheduling, resource starvation, and an Xcode 26.6 / Expo SDK 56 native-toolchain interaction. No source repair is justified.

Nearest concrete phases:

- Run A: `ExpoModulesCore` whole-module Swift header generation, followed by Fabric targets.
- Run B: `React-FabricComponents` / `React-RCTImage` compilation.
- Run C: `React-Fabric` / `React-RCTFBReactNativeSpec` / `RNReanimated` compilation.

CPU-active clang workers were observed during progress; at each apparent stall the SwiftBuild service remained but had no active clang/swiftc child. Generated object files and DerivedData grew while active. No production endpoint was contacted.

No simulator binary was produced, installed, launched, or profiled. Raw logs and result bundles remain outside version control under `/tmp` and the ignored profiler report directory.
