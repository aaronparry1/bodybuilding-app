# Adaptive Strength Coach Staging + Device Beta Setup

This guide prepares real iOS and Android device testing before Apple Watch or live RevenueCat work.

## 1. Prerequisites

- Expo account with EAS enabled.
- Apple Developer account for physical iOS/TestFlight builds.
- Google Play Console account for Android Internal Testing.
- A separate Supabase staging project.
- EAS CLI available through `npx eas-cli@latest` or installed globally.

## 2. Environment Files

Use the checked-in examples as templates:

- Local: `.env.local.example`
- Staging: `.env.staging.example`
- Production: `.env.production.example`

Never commit real env files. `.gitignore` excludes `.env`, `.env.local`, `.env.staging`, and `.env.production`.

Required variables:

```bash
APP_ENV=staging
APP_NAME="Adaptive Strength Coach Staging"
APP_SCHEME=ironlogic-staging
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach.staging
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach.staging
EXPO_PUBLIC_SUPABASE_URL=https://your-staging-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_staging_key
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_staging_placeholder
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_staging_placeholder
APP_PRIVACY_POLICY_URL=https://adaptivestrengthcoach.com/privacy
APP_TERMS_URL=https://adaptivestrengthcoach.com/terms
APP_SUPPORT_EMAIL=support@example.com
EAS_PROJECT_ID=your-eas-project-id
```

For EAS cloud builds, prefer EAS environment variables:

```bash
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value https://your-staging-project-ref.supabase.co
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value sb_publishable_staging_key
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value appl_staging_placeholder
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value goog_staging_placeholder
```

The build profile itself supplies app name, scheme, and bundle/package IDs, but you can override them in EAS env if needed.

## 3. EAS Setup

Initialize or link the Expo project once:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build:version:set
```

Check credentials:

```bash
npx eas-cli@latest credentials
```

Build profiles are in `eas.json`:

- `development`: internal dev client builds.
- `preview`: staging/internal beta builds.
- `production`: store-ready production builds.

## 4. Supabase Staging Setup

For the full real sync QA process, use `docs/supabase-staging-sync-qa.md`.

Create a new Supabase project named something like `iron-logic-staging`.

Apply the schema:

```bash
supabase db push --db-url "postgresql://postgres:[password]@[host]:5432/postgres"
```

Or paste `supabase/schema.sql` into the Supabase SQL editor and run it.

Then verify:

- Email/password auth is enabled in Authentication.
- Confirm email settings match the beta plan. For fastest device QA, disable email confirmation in staging only.
- Row Level Security is enabled on all public app tables.
- The publishable key in Project Settings > API is used as `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- The service role key is never added to the mobile app.

## 5. Staging Builds

iOS staging build:

```bash
npm run eas:build:staging:ios
```

Android staging build:

```bash
npm run eas:build:staging:android
```

Development client builds:

```bash
npm run eas:build:dev:ios
npm run eas:build:dev:android
npm run start:dev-client
```

Production smoke builds:

```bash
npm run eas:build:production:ios
npm run eas:build:production:android
```

## 6. iOS Device Testing

For fast internal QA:

1. Run `npm run eas:build:staging:ios`.
2. Install the internal distribution build from the EAS install link, or submit to TestFlight once App Store Connect is configured.
3. Launch on a physical iPhone.
4. Run the device QA checklist in `docs/device-qa-checklist.md`.

For TestFlight readiness:

1. Create the app record in App Store Connect using the staging or production bundle identifier.
2. Configure signing in `npx eas-cli@latest credentials`.
3. Add submit metadata later; do not submit for review until live billing/privacy docs are final.
4. Build with `npx eas-cli@latest build -p ios --profile preview --submit` when ready.

## 7. Android Device Testing

For fast internal QA:

1. Run `npm run eas:build:staging:android`.
2. Install the APK from the EAS build link on a physical Android device.
3. Run the device QA checklist in `docs/device-qa-checklist.md`.

For Google Play Internal Testing:

1. Create the app in Google Play Console.
2. Configure a service account when ready for automated submits.
3. Change the preview Android build to AAB only if Play upload is required.
4. Use `npx eas-cli@latest submit -p android --profile preview` after store setup.

## 8. Test Account Setup

Use a dedicated staging tester email pattern:

```text
ironlogic.beta+001@example.com
ironlogic.beta+002@example.com
```

For each test run, capture:

- Email used.
- Device model and OS version.
- App build profile and build number.
- Whether the run was online, offline, or offline-to-online.

## 9. Resetting Local App Data

iOS:

- Delete the app from the device, then reinstall.
- For dev client testing, also restart Metro with `npm run start:dev-client`.

Android:

```bash
adb shell pm clear com.aaronparry.adaptivestrengthcoach.staging
```

Web export/dev browser:

```js
localStorage.clear();
indexedDB.databases?.().then((databases) => databases.forEach((database) => database.name && indexedDB.deleteDatabase(database.name)));
```

## 10. Resetting Staging User Data

Use `supabase/reset-staging-user-data.sql` in the Supabase SQL editor. Replace the email at the top before running.

## 11. Validating Synced Records

Use `supabase/validate-staging-user-data.sql` in the Supabase SQL editor. Replace the email at the top before running.

Expected after a completed synced workout:

- `workout_sessions`: at least one completed session.
- `performed_exercises`: one row per exercise in the session, in order.
- `performed_sets`: all logged sets with non-negative reps and load.
- `programmes`: custom programmes are owned by the authenticated user.
- No rows from another user appear when querying through the client as the tester.

## 12. Release Safety Notes

- RevenueCat keys remain placeholders until live payment integration.
- Apple Watch is intentionally out of scope.
- Supabase service role keys must stay server-side only.
- Staging and production Supabase projects should be separate.
- Use separate bundle/package IDs for development, staging, and production so testers can install them side by side.

## 13. RevenueCat Sandbox Notes

RevenueCat sandbox uses public SDK keys only:

```bash
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_your_public_sdk_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_your_public_sdk_key
```

Add them locally in `.env.local` and to EAS preview when sandbox testing:

```bash
npx eas-cli@latest env:create preview --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value appl_your_public_sdk_key --visibility sensitive --force --non-interactive
npx eas-cli@latest env:create preview --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value goog_your_public_sdk_key --visibility sensitive --force --non-interactive
```

If either key is missing or still a placeholder, the app automatically uses mock billing so local development remains usable.
