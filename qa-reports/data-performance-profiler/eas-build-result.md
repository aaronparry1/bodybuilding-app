# EAS development build result

The isolated command was:

`npx eas-cli@latest build --platform ios --profile profiling-development --non-interactive`

EAS CLI 21.0.1 was authenticated. The command failed before upload or queueing with:

`expo-dev-client` is not installed for the project.

No EAS build ID, artifact, device registration, installation, launch, or profiling session exists. No TestFlight, App Store, production service, or submission operation occurred.

The precise next dependency decision is whether to add the Expo SDK-compatible `expo-dev-client` package and lockfile entry. That was intentionally not done in this task.
