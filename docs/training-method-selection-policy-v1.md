# Canonical training-method selection policy v1

`canonical_training_method_policy_v1` is the single production method policy. Session Construction owns the exact immutable prescription; Train only projects and records that prescription. Method names in fixtures or UI code have no authority.

## Selection order

1. Mesocycle purpose permits a bounded candidate.
2. Athlete experience, readiness, exercise role, exercise risk and load evidence are checked.
3. Exact allocated sets/reps must fit the method contract.
4. Unsupported or ambiguous combinations return to straight sets. This is a fail-closed result, not a random fallback.
5. Session-level structures may add at most one eligible antagonist pair and at most one eligible rest-pause exercise. Inputs are deterministic, so identical inputs cannot randomly rotate methods.

Initial calibration, restricted recovery, deload and transition work remains straight-set work. Straight sets remain the correct method whenever repeatability, load discovery, skill, fatigue or an exact-contract mismatch outweighs density or variety.

## Supported contracts

The complete typed matrix is exported by `canonical-training-method-policy.ts`. Existing canonical exact-target methods retain their existing owners: straight sets, back-off sets, capped AMRAP, 5/3/1, Eight Across, pyramids, ladders, clusters, BBB, dynamic effort, max effort and heavy top-set/back-off work.

Two bounded session structures are newly executable:

| Method | Eligibility | Exact execution | Rest | Stop / exit |
| --- | --- | --- | --- | --- |
| Antagonist superset | Intermediate/advanced; hypertrophy volume/specialisation, powerbuilding hypertrophy or athletic general; equal-round non-primary exercises; low/moderate skill and fatigue | Existing canonical reps and rounds retained; A1/B1/A2/B2 ordering | 0 seconds A→B; 60 seconds after B | Either exercise retains its canonical stop rule; return to standalone work if compatibility, equality, readiness or phase changes |
| Rest-pause row/accessory | Intermediate/advanced; hypertrophy volume/specialisation or powerbuilding hypertrophy; established load; stable non-barbell low/moderate-risk row/accessory | 3 rounds × 10 single repetitions with a 1-second reset between repetitions | Existing canonical rest between rounds | Immediate technical stop; return to straight sets after missed target, stale evidence, restricted recovery or phase exit |

### Source evidence

- `08-Tier-System-Manual-Athletic-Based-Strength-Training.pdf`, PDF page 103 / printed page 87: antagonist horizontal push/pull, vertical push/pull and joint flexion/extension pairing.
- The same Tier System manual, PDF page 232: chest/back examples use three paired rounds of ten and one minute between supersets.
- `02-Vault-T-Nation.pdf`, PDF/printed page 132: dumbbell-row rest pause, three sets of ten, returning each repetition to the floor and waiting one second before the next.

The source PDFs remain external, immutable inputs and are not committed.

## Explicitly unsupported

Same-region supersets, trisets, myo-reps, drop sets, standalone 10×10 and high-repetition finishers remain unsupported until a canonical exact construction, fatigue boundary, progression rule and source provenance exist. “Capped AMRAP” is represented by the existing canonical `amrap` identity; a duplicate label is rejected.

## Cross-surface contract

The v3 snapshot records the method and its executable structure. Preview, Home and Train project the same structure. Performed-work evidence records the method, structure kind and policy ID. Completion and Progress derive method labels from the immutable recorded snapshot and performed slot identities. Display text is never parsed back into a command.
