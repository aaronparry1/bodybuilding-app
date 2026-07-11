# Supabase Staging + Real Sync QA

Use this guide to connect Iron Logic to a real Supabase staging project and prove auth/sync on physical devices.

## 1. Create The Staging Project

1. Open Supabase.
2. Create a new project named `iron-logic-staging`.
3. Choose the same region you expect production to use.
4. Save the database password in your password manager.
5. Wait for the project to finish provisioning.

Keep staging separate from production. Staging data should be disposable.

## 2. Find Supabase URL And Publishable Key

In the Supabase project dashboard:

1. Open Project Settings.
2. Open API.
3. Copy the Project URL.
4. Copy the public publishable key. Older dashboards may label this as the anon/public key.
5. Do not copy the service role key into the app.

Use:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-staging-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_staging_key
```

## 3. Add Local Environment Variables

Create `.env.local` for local development against staging:

```bash
cp .env.staging.example .env.local
```

Edit `.env.local`:

```bash
APP_ENV=staging
APP_NAME="Adaptive Strength Coach Staging"
APP_SCHEME=ironlogic-staging
APP_IOS_BUNDLE_IDENTIFIER=com.aaronparry.adaptivestrengthcoach.staging
APP_ANDROID_PACKAGE=com.aaronparry.adaptivestrengthcoach.staging
EXPO_PUBLIC_SUPABASE_URL=https://your-staging-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_staging_key
SUPABASE_DB_URL=postgresql://postgres.your-project-ref:your-db-password@aws-0-region.pooler.supabase.com:6543/postgres
STAGING_TEST_EMAIL=ironlogic.beta+001@example.com
STAGING_TEST_PASSWORD=replace-with-a-strong-staging-password
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_staging_placeholder
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_staging_placeholder
```

Then run:

```bash
npx expo config --type public
```

Confirm:

- `name` is `Adaptive Strength Coach Staging`.
- `scheme` is `ironlogic-staging`.
- iOS bundle identifier ends with `.staging`.
- Android package ends with `.staging`.

Run the non-secret staging smoke check:

```bash
npm run supabase:staging:check
```

Expected:

- Supabase URL/key are present.
- Auth endpoint is reachable.
- Required tables are reachable after schema has been applied.
- Email/password auth is exercised when `STAGING_TEST_EMAIL` and `STAGING_TEST_PASSWORD` are set.

## 4. Add EAS Environment Variables

Use EAS env vars so cloud builds receive the same staging Supabase config:

```bash
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value https://your-staging-project-ref.supabase.co
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value sb_publishable_staging_key
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value appl_staging_placeholder
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value goog_staging_placeholder
```

Check configured values:

```bash
npx eas-cli@latest env:list --environment preview
```

## 5. Apply Schema

Option A: Supabase SQL editor

1. Open SQL Editor.
2. Paste `supabase/schema.sql`.
3. Run it.
4. Re-run is supported for policies/triggers.

Option B: Supabase CLI

```bash
supabase db push --db-url "postgresql://postgres:[password]@[host]:5432/postgres"
```

Option C: local script using `SUPABASE_DB_URL`

```bash
npm run supabase:staging:schema
```

## 6. Verify Tables, RLS, Policies, And Trigger

Run:

```sql
-- Paste and run:
-- supabase/check-staging-readiness.sql
```

Or run locally when `SUPABASE_DB_URL` is present:

```bash
npm run supabase:staging:readiness
```

Expected:

- All required tables are `present`.
- RLS is `true` for every app table.
- Policies exist for profiles, exercises, programmes, programme days, planned exercises, workout sessions, performed exercises, performed sets, user settings, subscription statuses, and sync queue.
- Trigger `on_auth_user_created_profile` exists on `auth.users`.
- Function `public.handle_new_user_profile` exists.

## 7. Verify Email/Password Auth

In Supabase Authentication settings:

1. Confirm Email provider is enabled.
2. For fast staging QA only, decide whether to disable email confirmation.
3. Add a staging test account in the app:

```text
ironlogic.beta+001@example.com
```

After signup, run:

```sql
select id, email from auth.users order by created_at desc limit 5;
select id, email, display_name from public.profiles order by created_at desc limit 5;
```

Expected: the auth user exists and a matching profile row exists.

## 8. Build Staging Apps

iOS:

```bash
npm run eas:build:staging:ios
```

Android:

```bash
npm run eas:build:staging:android
```

For dev clients:

```bash
npm run eas:build:dev:ios
npm run eas:build:dev:android
npm run start:dev-client
```

## 9. In-App Diagnostics

In development/staging builds:

1. Open Account.
2. Tap Staging Diagnostics.
3. Confirm:
   - App environment is `staging`.
   - Supabase URL is present.
   - Supabase key is present.
   - Auth session says signed in after login.
   - Current user ID matches Supabase `auth.users`.
   - Unsynced queue count is visible.

Manual sync:

1. Create local data.
2. Sign in.
3. Open Staging Diagnostics.
4. Tap Trigger Manual Sync.
5. Confirm last attempt, synced count, skipped count, failed count, and last error.

Clear local test data:

- Available only outside production.
- Clears local Iron Logic data on the device.
- Does not delete Supabase staging rows.

## 10. Sync QA Checklist

Run these flows on real iOS and Android devices:

- [ ] Signed-out local workout, then sign up, then manual sync.
- [ ] Signed-in custom exercise sync.
- [ ] Signed-in custom programme sync.
- [ ] Signed-in completed workout sync.
- [ ] Offline workout, then online manual sync.
- [ ] Logout with unsynced data, log back into same user, retry sync.
- [ ] Login as different user and confirm owner-bound queued rows are skipped.
- [ ] Repeat manual sync and confirm duplicate rows are not created.
- [ ] Force failed sync by disabling network, then retry online.

## 11. Validate Synced Data

After syncing, run:

```sql
-- Paste and run:
-- supabase/validate-staging-user-data.sql
```

Replace the email at the top first.

Expected:

- Custom exercises have the tester's `user_id`.
- Custom programmes have the tester's `user_id`.
- Completed workouts have the tester's `user_id`.
- Performed exercises preserve order.
- Performed sets match logged reps/load.

## 12. Reset A Staging Tester

Run:

```sql
-- Paste and run:
-- supabase/reset-staging-user-data.sql
```

Replace the email at the top first.

## 13. Troubleshooting

Missing Supabase URL/key in diagnostics:

- Check `.env.local`.
- Check EAS preview env vars.
- Rebuild the app after changing EAS env vars.

Signup succeeds but no profile row:

- Re-run `supabase/schema.sql`.
- Run `supabase/check-staging-readiness.sql`.
- Confirm the profile trigger exists.

Sync fails with RLS error:

- Confirm the app is signed in.
- Confirm the row `user_id` matches the current auth user.
- Confirm policies exist.
- Confirm you did not use service role key in the app.

Custom programme sync fails on planned exercises:

- Re-apply latest `supabase/schema.sql`.
- The staging schema intentionally does not require planned exercise IDs to exist in `public.exercises`, because seeded exercise library data is local/static.

Manual sync skips rows:

- Skips are expected when queued rows belong to a different signed-in user.
- Sign back into the original user or clear local test data before testing another account.

Duplicate synced workouts:

- The sync queue dedupes by entity type, entity ID, and owner.
- Cloud repositories use upsert by stable local IDs.
- Re-run validation SQL to confirm counts remain stable after repeated manual sync.
