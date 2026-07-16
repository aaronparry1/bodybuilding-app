# EAS development build result

The isolated command was:

`npx eas-cli@latest build --platform ios --profile profiling-development --non-interactive`

EAS CLI 21.0.1 was authenticated. EAS resolved the `development` environment with no remote plain-text or sensitive variables and loaded the profiling profile's explicit sentinels. The command then failed before upload or queueing because no suitable iOS credentials were available for internal distribution in non-interactive mode.

The native project contains the dedicated `AdaptiveStrengthCoachProfiling` scheme and `DebugProfiling` configuration, resolving to `com.aaronparry.adaptivestrengthcoach.profiling` and `Adaptive Strength QA`. The final attempt still stopped at credential setup, before EAS could queue or validate the native scheme remotely. Credentials for this new bundle still need to be created or confirmed interactively.

No EAS build ID, artifact, device registration, installation, launch, or profiling session exists. No TestFlight, App Store, production service, or submission operation occurred.

No EAS build ID, artifact, device registration, installation, launch, or profiling session exists. No TestFlight, App Store, production service, or submission operation occurred.
