# Post-CAS reconciliation certification

Verdict: **PROVEN**. Confidence: high.

Durable state:

- application attempt/work-item identity;
- expected pre-revision and pre-carrier fingerprint;
- exact intended material deltas and fingerprint;
- affected future prescription identities;
- intended resulting carrier and fingerprint;
- truthful receipt payload.

At restart:

- exact pre-state retries CAS safely;
- exact resulting state recomputes material deltas from persisted pre-state and
  the actual committed carrier, then writes one truthful receipt;
- an already persisted receipt is replayed;
- missing/corrupt intent or a newer/conflicting state cannot re-evaluate or
  reapply and terminalises as typed conflict;
- a semantic no-op has no application intent and cannot be reconstructed as
  applied.

Receipt reconstruction is coordination, not a second coaching evaluator. It
does not choose a demand change. Completed recorded history is never rolled
back.

All 13 interruption/equivalence states converged to applied, unchanged or a
truthful terminal block. Non-converging states: 0. Duplicate applications: 0.
