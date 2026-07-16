# EAS profiling-development build plan

The existing `development` profile was not sufficiently isolated because its service variables were implicit. A dedicated `profiling-development` profile was added with internal distribution, a development-only update channel, Design-QA enabled, a distinct profiling bundle identifier, invalid Supabase URL, disabled RevenueCat sentinels, and no submit configuration. Existing preview and production profiles were unchanged.

The build command was intentionally limited to:

`npx eas-cli@latest build --platform ios --profile profiling-development --non-interactive`

EAS CLI authentication was present, but the command stopped locally before upload or queueing because `expo-dev-client` is not installed. Installing that dependency is a separate change gate and was not performed.
