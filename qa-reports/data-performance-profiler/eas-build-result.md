# EAS development build result

The isolated command was:

`npx eas-cli@latest build --platform ios --profile profiling-development --non-interactive`

EAS CLI 21.0.1 was authenticated. EAS resolved the `development` environment with no remote plain-text or sensitive variables and loaded the profiling profile's explicit sentinels. The command then failed before upload or queueing because no suitable iOS credentials were available for internal distribution in non-interactive mode.

The repository's committed native iOS project also caused EAS to ignore the profile's bundle identifier and use the identifier in `ios/AdaptiveStrengthCoach.xcodeproj`. A distinct profiling identifier therefore needs an explicit native-project/configuration decision before another build attempt.

No EAS build ID, artifact, device registration, installation, launch, or profiling session exists. No TestFlight, App Store, production service, or submission operation occurred.

No EAS build ID, artifact, device registration, installation, launch, or profiling session exists. No TestFlight, App Store, production service, or submission operation occurred.
