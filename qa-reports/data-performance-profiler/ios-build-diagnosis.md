# Local iOS build diagnosis

The selected iPhone 17 Pro simulator and Xcode 26.6 toolchain were available. CocoaPods completed successfully with 114 pods using `EXPO_USE_PRECOMPILED_MODULES=0`. Deployment-mode verification reported only an `EXConstants` Podfile.lock checksum drift; it was not a dependency or Podfile source failure.

The subsequent direct `xcodebuild` compiled React Native native targets for approximately 18 minutes, then remained inside SwiftBuild package-loading/compilation without `BUILD SUCCEEDED`, `BUILD FAILED`, or an `error:` diagnostic. It was stopped cleanly. No development binary was installed or launched. The local log is `/tmp/xcodebuild-ios.log`.

This is an environment/toolchain build hang, not evidence of an application runtime defect. Native interactive profiling remains blocked because no binary was installed, and no browser-control runtime is available.
