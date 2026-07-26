# Generated identity regressions

Covered ignored-only changes:

- prescription ID;
- session ID and operational identity;
- exercise-instance ID;
- slot/carrier ID;
- method-group persistence ID with unchanged members;
- timestamps;
- revision metadata;
- ordering normalisation;
- display unit and presentation labels;
- fully regenerated but semantically equivalent prescriptions.

Covered material controls:

- canonical exercise substitution;
- set count;
- exact repetitions;
- base load/load state;
- rest;
- method semantics.

Every ignored-only case returns `{ status: "unchanged", deltas: [] }`.
Material controls return a non-empty deterministic delta. Forward and reverse
comparisons identify the same fields.
