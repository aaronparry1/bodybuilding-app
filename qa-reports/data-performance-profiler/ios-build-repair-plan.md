# iOS build repair plan

1. Retain the successful non-deployment CocoaPods command and safe sentinel environment.
2. Re-run the direct build with fresh DerivedData after restarting Xcode/SwiftBuild; compare against `/tmp/xcodebuild-ios.log`.
3. If it reproduces, investigate Expo SDK/RN and installed Xcode compatibility using the repository-supported toolchain. Any toolchain or dependency change requires separate approval.
4. Only after a binary installs should the existing profiling checklist be executed.

No production code, dependency, signing, EAS, database, or deployment change was made.
