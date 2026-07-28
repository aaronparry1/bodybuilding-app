# Discard root cause

Verdict: **PROVEN**

Production path:

`Train.onDiscard`
→ `discardLatestCanonicalSessionAttempt`
→ prior inline `discardCanonicalSessionAttempt`
→ delete mutable ledger
→ CAS restored planned-session carrier
→ remove evidence and timer
→ navigate Home.

The old transaction compensated when `saveAtomically` returned a conflict, but there was no durable record before ledger deletion. A real process interruption after ledger deletion and before carrier CAS therefore left:

- carrier still pointing to the active recorded session;
- recorded-session aggregate absent;
- no persisted data from which restart could restore or finish Discard;
- Home/Plan/Train in recovery/ghost-active disagreement.

This was a crash-consistency defect, not a button or navigation-only defect.

Correction:

- persist `canonical_workout_discard_intent_v1` before destructive work;
- include exact recorded-session aggregate and expected revisions;
- reconcile pending intents during active-plan hydration;
- restore exact pre-CAS aggregate when the carrier did not commit;
- finish evidence/timer cleanup when the restored carrier did commit;
- keep confirmation retryable until a truthful applied/idempotent result exists;
- reload the committed carrier immediately when only cleanup remains pending.

No second workout authority or coaching authority was introduced.
