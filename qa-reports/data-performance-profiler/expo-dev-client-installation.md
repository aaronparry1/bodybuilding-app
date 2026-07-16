# Expo dev-client installation

Previous state: `expo-dev-client` was absent and the isolated EAS profile failed before upload because the development client dependency was missing.

Installation command: `npx expo install expo-dev-client`

Resolved version: `expo-dev-client@56.0.23`, compatible with Expo SDK 56. The expected transitive Expo modules were installed (`expo-dev-launcher`, `expo-dev-menu`, manifests and updates interfaces). CocoaPods then integrated 121 total pods and updated the committed native dependency metadata.

Files changed: `package.json`, `package-lock.json`, `ios/Podfile.lock`, and the generated native resource phase in `ios/AdaptiveStrengthCoach.xcodeproj/project.pbxproj`. No Expo SDK, React Native, unrelated package, production profile, or environment file changed.

Warnings: Node 23.9.0 is outside the declared React Native 0.85.3 engine range; Expo Doctor also reports pre-existing Expo patch mismatches and the existing committed-native/prebuild configuration warning. EAS additionally reports that the committed native project prevents profile-level bundle-identifier substitution. These were not changed in this task.
