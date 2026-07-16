# iOS profiling execution checklist

- [x] Verify HEAD and clean tracked worktree scope (`8ab67d6`; approved untracked paths preserved).
- [x] Read existing audit/profiling plan and synthetic fixture sizes (0/100/500/2,000/10,000).
- [x] Verify Xcode, simulator runtime/device, Node, npm, Expo CLI.
- [x] Override service configuration with non-production sentinels before native command.
- [x] Attempt `npx expo run:ios --device 06EEA722-8702-40AC-81FC-53E92D205303 --no-bundler`.
- [ ] Build/install/launch: blocked during CocoaPods installation before Xcode build.
- [ ] Interactive journeys and repeated-use loops: not executed.
- [ ] React/native/network/serialization/lifecycle measurements: not available.
- [ ] Fix gate: not entered; no cause demonstrated.
