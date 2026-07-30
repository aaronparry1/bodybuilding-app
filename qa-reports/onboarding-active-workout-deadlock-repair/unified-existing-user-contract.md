# Unified existing-user contract

`resolveCanonicalExistingUserRoute` is the single decision contract used by production startup and the final Create Programme preflight.

## Precedence

1. Wait until authentication and retained account data have reached a terminal hydration state.
2. Fail closed on unreadable ownership, plan, or active-session relationships.
3. A resumable active workout belonging to the authenticated account routes to Train.
4. A valid canonical plan routes to authenticated tabs.
5. An explicit setup restart may enter onboarding only when no active workout exists.
6. First-run onboarding is permitted only after the relevant authorities establish no retained training.

## Typed outcomes

- `waiting`: hydration or canonical reconciliation is not complete;
- `authenticated / active_workout`: route to Train;
- `authenticated / tabs`: route to the authenticated app;
- `onboarding`: genuine first run or explicit safe restart;
- `recovery`: retained data exists but cannot yet be resolved safely.

## Safety properties

- stale onboarding metadata cannot override retained canonical authority;
- no active workout is automatically discarded;
- no programme is created or replaced during routing;
- account mismatch never exposes another account’s state;
- retry repeats reads/reconciliation rather than mutating training;
- the old “finish or discard” instruction is absent and cannot be the terminal outcome.
