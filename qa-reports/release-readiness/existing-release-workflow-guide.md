# How this app is set up to be released

The repository is set up for Expo + EAS. The strongest evidence is the three EAS profiles and the documented native RevenueCat QA workflow. That makes EAS Build the most likely previous release path, although this repository does not prove which historical command was actually run.

## Easiest safe test

For web-only work, run `npm run web`. For a native interactive test, use the existing development-client profile after an authorized development build is available, then run `npm run start:dev-client`. Expo Go is not enough for real billing/native QA; the tracked RevenueCat guide says Expo Go and web use mock billing.

## Profiles

- `development`: internal development client, `npm run eas:build:dev:ios` or `npm run eas:build:dev:android`.
- `preview`: internal staging test, `npm run eas:build:staging:ios` or `npm run eas:build:staging:android`.
- `production`: store builds, `npm run eas:build:production:ios` or `npm run eas:build:production:android`.

None of those commands was run here.

## Store path (not executed)

An iOS preview build would normally be installed for internal testing or TestFlight after an authorized EAS build. Android preview is configured for internal testing. Production submission commands are `npx eas-cli@latest submit --platform ios --profile production` and the equivalent Android command. These upload or change external services and require explicit authorization.

OTA updates are not established: `expo-updates` is absent and no runtime version/update URL is configured. The production `channel` field is configuration evidence only, not proof that OTA delivery works.

The next practical step is owner-authorized local web testing, followed by an authorized development-client build if native testing is needed. No release or upload is authorized by this audit.
