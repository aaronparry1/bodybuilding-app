# Data authority and returning-user continuity certification

Status: certified for the current canonical training slice on 2026-08-23.

This document records which persisted model owns each customer fact, where compatibility reads remain, and the conflict rule used during hydration or restore. It is a release boundary: presentation code may project these facts, but must not create a second authority for them.

## Authority map

| Customer fact | Canonical authority | Compatibility / transport boundary | Conflict rule |
| --- | --- | --- | --- |
| Authentication identity | `AuthProvider` / auth context session | Supabase auth session and local guest identity | An authenticated account ID must match the carrier owner. An account mismatch blocks hydration; it never adopts another athlete's plan. |
| Profile and settings | settings repository and authenticated profile snapshot | Cloud backup settings payload; versioned local JSON | Restore fills missing local state. A newer valid local record is retained. |
| Onboarding answers and completion | canonical plan onboarding metadata | legacy onboarding metadata read during release reconciliation | Valid canonical metadata wins. Missing metadata may be backfilled; contradictory account ownership is rejected. |
| Programme, current block, week, and schedule | canonical active-plan v2 carrier | legacy active-plan import and cloud backup envelope | The valid, owner-scoped canonical carrier wins. Reconciliation can reconstruct future prescriptions, but cannot rewrite completed or active attempt facts. |
| Active workout identity and lifecycle | recorded-session ledger plus the carrier's recorded-session reference | startup hydration and discard-intent journal | Exactly one linked mutable attempt may be restored. Unreadable, missing, duplicated, or owner-mismatched linkage blocks activation rather than guessing. |
| Scheduled session prescription | immutable prescription snapshot on the planned session; copied verbatim into the recorded aggregate at start | canonical plan construction/reconstruction | Started/completed snapshots are immutable. Only future planned prescriptions may be reconstructed or adapted. |
| Performed sets and repairs | append-only recorded-session event ledger | progress-evidence projection and sync payload | Set identity and expected ledger version control writes. Equivalent retries are idempotent; conflicting duplicate set facts are rejected. Repairs append evidence and do not overwrite history. |
| Completed workout history | completed/historical recorded-session aggregates | legacy workout-history migration and cloud restore | Completed aggregates are immutable and cannot be discarded. Missing cloud history may be restored; a newer local record is not overwritten. |
| Exercise history and genuine achievements | projections from completed ledger events | no independent writable history | Derived views may be rebuilt. They never become a competing source of performed work or records. |
| PRs and progress evidence | deterministic projections plus the canonical progress-evidence repository | legacy history only during explicit migration | Only valid completed, comparable work contributes. Discard removes evidence belonging to that mutable attempt and leaves all completed-session evidence intact. |
| Progression recommendations and applied changes | canonical progress-decision repository and application receipt | coaching explanation presented on completion/progress | A recommendation is not an applied change. Only an idempotent application receipt may change future prescriptions; retained history stays unchanged. |
| Rest timer | per-recorded-session rest-timer repository | reconstructed UI presentation | Timer state belongs only to its active attempt. Pause/minimise persists it; discard clears it; completion duration is derived from ledger pause/resume boundaries. |
| Offline sync queue | durable local sync queue | injected cloud sync service | Failed uploads remain queued. Successful transport does not become the local training authority. |
| Cloud backup / restore | transport envelope for canonical plan, history, settings, custom content, and training year | Supabase sync service | Restore is identity-scoped and merge-safe: fill missing state, retain newer valid local facts, and route legacy plans through canonical reconciliation. |

## Certified returning-user journeys

The following journeys are covered by focused executable tests and were re-run together for this release slice:

- active attempt survives repeated process rehydration with the same identity, immutable prescription, performed work, paused lifecycle, and rest timer;
- fresh-install cloud restore recovers the active plan, training year, settings, custom content, and missing history without overwriting a newer local workout;
- release reconciliation preserves recorded-session references and immutable history, reconstructing only future compatible prescriptions;
- completion is idempotent across ledger, completion evidence, progression decision, and adaptation application;
- an offline sync failure retains queued payloads for a later flush;
- an authenticated account mismatch or unreadable carrier fails closed instead of exposing or replacing retained training data.

## Discard contract

Discard means “remove this mutable attempt,” never “delete this workout from history.” The transaction writes a durable intent containing the exact aggregate before any destructive write. It then restores the planned prescription, removes the carrier reference, deletes only the mutable ledger aggregate, removes only that attempt's evidence and timer, and finally clears the intent.

If ledger deletion fails, the carrier remains unchanged. If the carrier compare-and-swap fails, the exact aggregate is restored. If the process stops in either crash window, startup reconciliation completes or compensates the transaction. Completed and historical aggregates are rejected at the transaction boundary.

## Known compatibility boundaries

Legacy active plans and workout history remain read-only migration inputs. Cloud payloads remain transport, not a parallel business authority. Derived Home, Progress, exercise-history, achievement, and completion views remain disposable projections. Any new persistence path must name its owner in this table before release.
