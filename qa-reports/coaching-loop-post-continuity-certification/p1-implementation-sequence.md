# Dependency-ordered P1 implementation sequence

No P1 production behaviour is implemented here.

## P0 gate before P1

First close and independently certify:

1. generated group identity exclusion;
2. crash-safe carrier/receipt convergence;
3. final-session review continuity.

P1 policy must not be mounted on a transaction that can misreport or strand an
athlete.

## 1. Mounted factual athlete inputs

Persist timestamped, correctable readiness/recovery, pain/limitation,
equipment, capacity, missed-session/layoff, and later sport-workload facts.
Define owner-derived freshness and restart replay. Begin with review-only
projection; no automatic prescription mutation.

- Smallest change: factual repositories + mounted commands + evidence
  construction.
- Independent gate: edits, deletion, stale/conflict, restart, privacy, and
  final-session review.
- Literature: not required for collection; required before policy thresholds.

## 2. Prescription-compatible comparable exposure

Version one comparator over exercise identity, loading mode, method family,
role where material, exact target family, substitution status, cycle context,
and freshness. Migrate old evidence fail-closed without inventing facts.

- Dependency: step 1 timestamps/corrections.
- Independent gate: same exercise/different slot, different role, substitute,
  removal/reintroduction, kg/lb, historical ambiguity.
- Literature: limited to approving freshness/compatibility windows; identity
  mechanics are engineering.

## 3. Bounded numeric progression and regression

Add a separately versioned policy for eligible established-load exposures.
Distinguish normal/high responders, main lifts/accessories, strength/hypertrophy
prescriptions, representable increments, repeated stalls, and no-op rounding.
Session Construction remains exact-prescription owner.

- Dependencies: steps 1–2 and P0 truthful receipts.
- Independent gate: paired counterfactuals, 12+ weeks, bounds, units,
  equipment, retry, and exact receipt deltas.
- Literature: required and must be reconciled with current Mesocycle policy.

## 4. Missed-session and layoff handling

Record an actual missed planned session without inventing performed work.
Define bounded schedule reflow, stale-plan behavior, and return calibration.

- Dependencies: steps 1–2; numeric policy must be able to suppress or reset.
- Independent gate: single miss, repeated misses, long layoff, late completion,
  restart, and history immutability.
- Literature: required for training-response rules, not event persistence.

## 5. Recovery, pain, and limitation operation

Compose factual recovery with Mesocycle fatigue policy. Keep pain review-only
unless an approved safe policy exists. Ensure review always has a route and
never consumes the final opportunity silently.

- Dependencies: steps 1–4 and P0 final-session continuity.
- Independent gate: missing/conflicting/stale facts, pain persistence,
  recovery recovery, limitation restart, and no unsafe auto-mutation.
- Literature: required for any dose/deload response.

## 6. Deload and transition intelligence

Derive eligibility from factual performance/recovery plus the existing
Mesocycle successor graph. Never let elapsed time alone masquerade as athlete
adaptation. Construct successors atomically.

- Dependencies: all previous factual/comparator/policy work.
- Independent gate: ordinary/deload/transition counterfactuals, max horizon,
  unavailable successor, construction failure, crash, and lineage.
- Literature: required.

## 7. Substitution/removal/reintroduction history

Define when histories are incompatible, when calibration is mandatory, and
whether any equivalence is source-approved. Preserve canonical exercise and
substitution identity.

- Dependencies: comparator and mounted limitation facts.
- Independent gate: same/different roles, equipment, unilateral variants,
  reintroduction, old data, and no inherited incompatible loads.
- Literature: required for equivalence; fail-closed identity is engineering.

## Later, separate work

- Volume/density adaptation.
- Contextual method retention/removal.
- Rich athlete-facing evidence explanations.
- Additional methods only when evidence and a product need justify them.

Uploaded/historical training sources must not become production truth without
modern evidence review and reconciliation with the existing canonical owners.
