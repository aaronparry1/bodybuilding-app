# Data Durability Audit

Audit date: 2026-06-17

Status: reliability fix implemented. No coaching logic, workout generation, subscription/paywall logic, App Store metadata, or EAS build was changed.

## Executive Summary

Adaptive Strength Coach is still local-first, but the major restore risk identified in the original audit has been addressed.

Before this fix, same-device persistence was solid, but fresh install/device replacement restore was not safe because cloud restore and production queue flushing were not wired into normal startup/login flows.

Now, authenticated users have a production restore/sync path:

- cloud data restore runs on login/startup
- local data is queued for sync automatically
- queue flush runs on startup/login
- queue flush runs after workout completion
- queue flush runs when the app returns to the foreground
- failed flushes keep local queue data for retry
- cloud/local completed workouts are deduplicated by stable workout/session ID

Verdict: **B) minor improvements**.

Core workout history, active plan snapshot, training year, settings, custom exercises, and custom programmes now have a practical restore path. Remaining risks are mostly around multi-device conflict nuance, local-only secondary records, and proving the path against live Supabase credentials before the iOS patch build.

## What Is Safe

### Same-Device Local Persistence

Safe.

The app persists core data through `jsonStore`, backed by Expo SQLite KV storage on native:

- workout sessions
- active/open workout
- completed workout history
- active training plan
- training year
- app settings
- custom exercises
- custom programmes
- recovery/capacity ignore state
- sync queue

Workout logging still saves immediately after logging, editing, deleting, swapping, manual finish, shutdown, and completion.

### Completed Workout History

Safe locally and now restorable when cloud sync succeeds.

Completed workout history is the source of truth for:

- Workout Review
- Strength Dashboard
- e1RM tracking
- PR tracking
- Advanced Reports

Derived reports are not stored separately. They rebuild from restored workout sessions.

### Automatic Queue Durability

Improved.

Local data is enqueued before attempting to resolve a Supabase client. If the user is offline or Supabase is unavailable, payloads remain in the local sync queue.

The queue is flushed automatically:

- after login/startup restore
- after workout completion
- when the app returns to the foreground

Flush failures do not delete local data.

### Device Replacement Restore

Improved and now production-wired.

On authenticated startup/login, the app attempts to restore:

- completed workout history from Supabase
- active plan snapshot from the cloud settings backup envelope
- training year from the cloud settings backup envelope
- app settings from the cloud settings backup envelope
- recovery/capacity ignore state from the cloud settings backup envelope
- custom exercises
- custom programmes

Cloud/local completed workouts are merged conservatively. If the same workout exists locally and in cloud, the newer `updatedAt`, `completedAt`, or `startedAt` version wins.

## What Is Partially Safe

### Active Workout Restore

Partially safe.

Open workout sessions are included in the automatic local sync queue, and the cloud schema can represent sessions with `completed_at = null`. Same-device active workout persistence remains safe.

Remaining caution:

- live cloud restore of an in-progress workout should be manually tested before advertising cross-device active workout continuity
- completed workout restore is the stronger and more important durability guarantee

### Settings Restore

Mostly safe for fresh install.

The cloud backup envelope includes app settings and is restored when local settings are default/not onboarded. This avoids overwriting newer local settings during normal account use.

Remaining caution:

- account-switching on one device is still local-first and not fully account-scoped
- conflict resolution is intentionally conservative and simple

### Custom Exercises And Programmes

Mostly safe.

Custom exercises/programmes are restored when they are marked custom or have a `createdByUserId`.

Remaining caution:

- deletion/tombstone sync is not implemented
- old deleted custom items may reappear if they remain in cloud

### Recovery/Capacity Ignore State

Partially safe.

The current ignore record is stored in the cloud backup envelope and can restore on a fresh install.

Remaining caution:

- historical/session-level recovery and capacity records are still mostly local-derived/local-only unless backed by workout sessions

## What Remains Local Only Or Limited

The following areas are still not full multi-device systems:

- account-scoped local storage separation
- deletion/tombstones for custom exercise/programme removal
- rich conflict UI
- duplicate-device simultaneous edit resolution
- session prep records
- capacity focus history records
- detailed sync status UI for customers

These are not current launch blockers, but they are future reliability hardening candidates.

## Authentication

### Account Creation

Implemented through Supabase email/password.

Now, once authenticated, local data can be queued and flushed automatically. This protects users who trained locally before creating/signing into an account, provided Supabase is configured and available.

### Login

Login restores the Supabase auth identity and now triggers cloud data restore/sync through the subscription/app provider lifecycle.

### Logout

Logout still clears auth state but does not clear local training data.

Risk:

- local storage is not fully account-scoped
- shared-device account switching can expose previous local data unless local state is cleared separately

This is a medium-priority future improvement, not part of this patch.

## Sync Architecture

### Local Storage

Local-first storage remains the primary durability layer.

Strengths:

- immediate writes
- resilient offline use
- queue survives restart
- failed flushes keep payloads

Weaknesses:

- uninstall removes local storage
- account scoping is limited

### Supabase Storage

Supabase cloud repositories support:

- workout sessions
- performed exercises
- performed sets
- custom exercises
- custom programmes
- user settings blob

The settings blob now stores a cloud backup envelope containing:

- app settings
- active training plan
- training year
- recovery/capacity ignore state

### Sync Timing

Automatic sync now happens in production paths:

- startup/login restore and sync
- after workout completion
- app foreground return

Manual diagnostics still exist, but they now delegate to the same cloud backup queue format.

### Conflict Handling

Current conflict handling is simple and safe:

- local unsynced queue survives restart
- failed flushes remain queued
- queue dedupes by `entityType + entityId + ownerUserId`
- completed workouts merge by stable session ID
- newer local unsynced workout data is not overwritten by older cloud data

Limitations:

- no human-facing conflict UI
- no field-level merge
- no tombstone/delete sync

## Device Replacement Scenario

Scenario:

```text
Phone A
User completes workouts
Cloud sync succeeds
App deleted or new phone purchased
Fresh install
Login
Cloud restore runs
```

Expected restore after this fix:

- completed workout history returns
- Strength Dashboard rebuilds
- PR history rebuilds
- Advanced Reports rebuild from restored sessions
- active plan snapshot returns if the cloud backup envelope exists
- training year returns if the cloud backup envelope exists
- app settings return on fresh/default local settings
- custom exercises/programmes return

What will not necessarily return:

- unresolved simultaneous edits from multiple devices
- deleted custom items if cloud tombstones do not exist
- secondary local-only history such as session prep records

## Offline Scenario

Scenario:

```text
User trains offline
Completes workout
App closes/reopens
Network returns
```

Expected behaviour:

- workout remains saved locally
- completed workout is queued locally
- queue survives restart
- foreground/startup sync retries later
- failed flush does not delete local data

Customer-safe copy should remain generic if sync is unavailable:

> Your workouts are saved on this device and will sync when online.

The production UI must not expose Supabase table names, environment variable names, or raw stack traces.

## Risks

### Low Risk

- same-device workout persistence
- completed workout local durability
- report rebuild from restored workout sessions
- automatic retry queue persistence

### Medium Risk

- account switching on one device
- tombstone/delete sync
- active in-progress workout restore across fresh install
- live Supabase schema compatibility until manually verified

### High Risk

No high-risk durability blocker remains from the original audit, assuming live Supabase credentials/schema match the repositories and the patch is manually verified before release.

## Launch Blockers

Before iOS patch build:

- run full test/type/export verification
- run simulator build
- perform a practical restore simulation where possible
- confirm cloud write/read succeeds against the configured Supabase project

If live Supabase credentials or schema are unavailable locally, this should be documented as the remaining manual production verification step rather than treated as a code blocker.

## Verdict

**B) minor improvements.**

The major missing production wiring has been implemented. The app is now meaningfully safer for account/device restore than the original audit state. Remaining work is reliability hardening, not a core launch blocker, provided live cloud verification succeeds.
