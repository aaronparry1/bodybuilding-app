# Android recovery candidate 110: Supabase schema readiness

No remote migration was applied as part of this candidate.

## Expected account-backed schema

Repository migrations and generated types require: `profiles`, `exercises`, `programmes`, `programme_days`, `planned_exercises`, `workout_sessions`, `performed_exercises`, `performed_sets`, `user_settings`, `subscription_statuses`, and `sync_queue`.

The expected database contract also includes the authenticated profile-creation function and trigger, foreign-key relationships, and row-level security policies that restrict every user-owned row to its authenticated owner.

## Inspected project gap

The previously inspected production-like Supabase project exposed only `profiles`. The remaining required tables, the complete profile trigger/function contract, and the required RLS policy set were not proven present. Therefore the Android candidate must continue to describe data as stored locally, pending, failed/retryable, or verified account-backed only after a successful sync receipt. Premium entitlement is not backup evidence.

## Configuration

The EAS production environment has sensitive Supabase URL/key variables configured without exposing their values. Production Expo resolution selects `com.aaronparry.adaptivestrengthcoach`, the `app-production` router and a non-staging Supabase endpoint. The production profile explicitly selects the EAS `production` environment.

## Required remediation before claiming complete account backup

1. Review the target project identity and environment ownership out of band.
2. Diff every repository-owned migration against the target project.
3. Review the profile function/trigger and all RLS policies with least privilege.
4. Apply missing migrations through the established controlled migration workflow, not from a recovery build.
5. Verify authenticated create/read/update behavior for every supported backup entity.
6. Rehearse backup and restore with a populated non-production account.
7. Only then allow the UI to describe a successful full account backup.
