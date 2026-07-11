# Data Sync & Restore Implementation

Date: 2026-06-17

Status: implemented for verification. No EAS build started.

## Summary

Adaptive Strength Coach now has a production-wired cloud restore and automatic sync path for authenticated users.

The app remains local-first. Local storage is still the immediate source of truth during training, but cloud sync now runs automatically instead of relying on hidden diagnostics/manual flushes.

## What Syncs

Automatic sync queues:

- workout sessions, including completed sessions and open sessions
- custom exercises
- custom programmes
- user settings cloud backup envelope

The user settings cloud backup envelope includes:

- app settings
- active training plan
- training year
- recovery/capacity ignore state

Derived analytics are not uploaded separately:

- Strength Dashboard
- PR tracking
- Advanced Reports

Those rebuild from restored workout history.

## What Restores On Login/Startup

When an authenticated user opens the app or logs in, the app attempts to restore:

- completed workout history
- active plan if local active plan is missing
- training year if local state is fresh/default
- app settings if local settings are default/not onboarded
- recovery/capacity ignore record
- custom exercises
- custom programmes

Then it queues and flushes local data back to Supabase.

## Automatic Flush Triggers

Queue flush now runs:

- after startup/login restore
- after workout completion
- when the app returns to the foreground

The flush path bypasses subscription entitlement gating because data durability should not depend on current billing state. This does not unlock premium features and does not change subscription/paywall logic.

## Failure And Retry Behaviour

If Supabase is unavailable, network is down, or flush fails:

- local data remains saved
- sync queue entries are not deleted
- queue survives app restart
- later startup/foreground sync can retry

The production UI does not expose raw sync errors, Supabase table names, environment variable names, or stack traces.

## Conflict Handling

Current conflict handling is conservative:

- queue entries dedupe by entity type, entity ID, and owner user ID
- completed workouts dedupe by stable workout/session ID
- newer local data wins over older cloud data by `updatedAt`, then `completedAt`, then `startedAt`
- cloud restore does not overwrite an existing local active plan
- cloud settings restore only applies to fresh/default local settings

This avoids destroying newer local unsynced work while keeping fresh-install restore useful.

## What Remains Local Only Or Limited

Remaining limitations:

- no tombstone/delete sync for custom exercises/programmes
- no rich conflict UI for simultaneous multi-device edits
- local storage is not fully account-scoped after logout/account switching
- session prep records and detailed capacity focus history are not full cloud-backed systems
- cross-device active workout continuity needs live manual verification before it should be promised

## Manual Test Results

Automated restore simulation was added in `tests/cloud-data-sync.test.ts`:

- cloud workout history restores into local storage
- Strength Dashboard rebuilds from restored workouts
- active plan, training year, and settings restore from the cloud backup envelope
- custom exercises and programmes restore
- duplicate local/cloud workouts are not duplicated
- newer local data is preserved
- automatic sync queues local data and flushes through the sync service
- failed flush keeps queued payloads
- queued payloads survive queue-store recreation

Live Supabase fresh-install verification should still be performed before the iOS patch build if local credentials are available:

1. Login or create an account.
2. Complete a workout.
3. Confirm the workout is locally saved.
4. Confirm cloud write/sync succeeds.
5. Clear simulator app storage or uninstall/reinstall.
6. Login again.
7. Confirm workout history, active plan, settings, and report inputs restore.

## Customer-Safe Messaging

If sync is temporarily unavailable, the app should use customer-safe copy such as:

> Your workouts are saved on this device and will sync when online.

Avoid:

- Supabase names
- environment variable names
- raw error strings
- stack traces

## Build Recommendation

Do not start an EAS build until:

- `npm test` passes
- `npx tsc --noEmit` passes
- `npx expo export --platform web` passes
- iOS simulator build passes
- live cloud restore is manually verified where possible
