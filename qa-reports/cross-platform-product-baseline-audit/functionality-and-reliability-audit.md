# Functionality and reliability audit

## Lifecycle verdict

The startup boundary waits for auth, account hydration and retained-training inspection, then reconciles or presents a recovery screen. It explicitly prevents stale onboarding metadata from hiding a valid plan/active workout and prevents native SQLite failure from masquerading as an empty in-memory durable store. [repository-derived; test-derived]

| Scenario | Current behavior | Classification |
|---|---|---|
| New authenticated user | onboarding creates carrier + owner + settings transaction | protected/test-derived |
| Returning user | retained carrier routes to tabs; active attempt auto-enters Train | protected/test-derived |
| Offline returning user | local state allowed through offline mode | repository-derived; device unverified |
| Local populated / remote empty | local plan is not overwritten; canonical envelope subsequently syncs | protected/test-derived |
| Remote populated / local empty | authenticated restore validates canonical carrier/envelope | test-derived; device unverified |
| Both populated | owner/revision checks and local-newer merge policies apply by entity | high-confidence; not one global conflict policy |
| Other account owns local plan | restore is blocked and plan hidden | protected/test-derived |
| Active workout | snapshot + events + timer repositories restore | protected/test-derived |
| Completed history | ledger snapshots/evidence retained; future CAS targets planned snapshots | protected/test-derived |
| Interrupted adaptation | persisted intent/attempt resumes without policy reevaluation | protected/test-derived |
| Failed migration | source retained or recovery state shown | protected/test-derived |
| Reinstall/new device | requires readable authenticated cloud envelope | unverified end-to-end |

## Defect mechanisms

- Onboarding reappearance: historically possible when `onboardingCompleted` hydrated before the plan/owner or became stale; current route uses retained training and has explicit regression tests. **Previously repaired; field verification required.**
- Programme/history “disappearance”: ownership mismatch, unreadable storage, failed cloud reads or canonical validation can intentionally hide/recovery-block data. This is not proof of physical deletion. **Protected behavior with UX risk.**
- Empty remote overwrite: current restore only replaces settings when local is incomplete/default and blocks mismatched owners; tests cover this. **Previously repaired/protected.**
- Edits not persisting: custom programme routes use a different repository from the active carrier; edits may be real but not affect the canonical plan. **Confirmed architectural/product mismatch.**
- Home/Plan/Train disagreement: shared read model and snapshot boundaries reduce this; tests cover current projections. External device verification remains required. **Protected.**
- False backup success: queue result counts and sync status exist, but no current device proof of remote readback after backup. **High-confidence risk.**
- Timer corruption: timer stores absolute `expiresAt`, workout/set identity and pause state rather than relying on tick count. **Protected in tests; OS suspension unverified.**
- Completed history mutation: immutable snapshot/event design and CAS future-session targeting protect it. **Protected in tests.**
