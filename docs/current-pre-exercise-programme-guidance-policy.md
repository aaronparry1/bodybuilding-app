# Current pre-exercise programme-guidance policy

## Boundary

The policy sits between current microcycle session roles and exercise selection. It must output ordered training jobs, not generated exercises. Generated exercise settings are decomposed as follows: target/purpose/order/set-guidance/constraints come from pre-exercise policy; exercise ID, equipment match, history and substitution come from selection; exact reps/load/set targets come later from exact-target generation.

## Proposed policy contract

`CurrentProgrammeGuidancePolicyInput` contains goal, experience level, frequency, split, mesocycle purpose, microcycle priority, session role/identity, equipment profile, and approved policy versions. It returns `CurrentPrescriptionSlotDefinition[]`: target domain/identity, purpose, stable ordinal, min/max sets, movement/muscle/category constraints, omission/substitution policy and policy versions. D2 supplies stable IDs separately.

Recommended initial domains are muscle, movement pattern and exercise-slot role. Initial purposes are `primary_compound`, `secondary_compound`, `primary_hypertrophy`, `secondary_hypertrophy`, `isolation`, `skill_practice`, and `fatigue_limited_accessory`. Guidance remains slot-based across exercise substitution; exercise history stays exercise-specific.

## Volume and evidence

Use direct per-session slot guidance initially, with a later allocation layer only if a singular mesocycle/microcycle muscle-volume budget is introduced. This avoids two simultaneous volume authorities. Evidence supports treating weekly volume and session ordering as policy inputs, while frequency alone is not a universal hypertrophy rule once volume is equated. Priority exercises should be placed earlier; neither evidence nor coaching practice establishes a universal fixed template. [Volume dose-response review](https://pubmed.ncbi.nlm.nih.gov/27433992/), [frequency review](https://pubmed.ncbi.nlm.nih.gov/30558493/), [exercise-order meta-analysis](https://pubmed.ncbi.nlm.nih.gov/32077380/).

## Policy limits and rollout

Equipment normally constrains exercise selection, not the training job; it can broaden a slot only when the job is impossible. Weak-point policy, optional accessories, body-part split detail, Bench-Squat-Deadlift roles, strength/power variants and non-hypertrophy goals remain explicit rollout decisions. Deload modifies construction execution without consuming productive guidance; a successor mesocycle creates a new programme lineage.

The four-template intermediate Upper/Lower policy is structurally certified, but it is not generic hypertrophy authority. Exact mesocycle-purpose mapping is a separate D2.5D0 boundary: calibration, base, volume, specialisation, consolidation and transition cannot be inferred from the `hypertrophy` label. New plans currently begin in calibration, which remains compatibility-only until a dedicated calibration policy exists.

Implementation sequence: D2.5A contracts → D2.5B/C hypertrophy role coverage → D2.5C3 certification → D2.5D0 purpose mapping → D2.5D1 mapping contract → D2.5D2 base equivalence → D2.5D3/D4 calibration policy and certification → restricted D3 persistence → D4 construction projection. Strength/power and other purpose families remain separate policies.
