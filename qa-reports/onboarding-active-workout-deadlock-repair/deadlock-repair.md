# Deadlock repair

## Production correction

Commit `3d52cd0`:

- mounted subscription/account-data hydration in `ProductionProtectedLayout`;
- added a read-only retained plan/active-session/owner probe;
- reconciled the authenticated account before routing;
- shared one existing-user route resolver between startup and Create Programme;
- routed resumable active workouts directly to Train;
- routed valid plans to authenticated tabs regardless of stale onboarding metadata;
- replaced the impossible warning with an actionable restore/retry state when safe resolution is not possible;
- preserved a genuine new-user onboarding path after conclusive absence.

## No data or coaching changes

The repair does not:

- clear or reset local/cloud data;
- complete, pause, resume, or discard a workout automatically;
- construct or replace a programme;
- change exercise, set, repetition, load, rest, method, progression, or cycle policy;
- alter Discard;
- add fallback/dual authority;
- change release metadata or dependencies.

## Mounted behaviour

In the production web Router root, a canonical plan was created, its first workout started and paused, and direct navigation to `/onboarding` resolved to `/train`. A full reload preserved and reopened the same paused workout.
