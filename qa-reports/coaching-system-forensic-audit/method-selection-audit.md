# Training-method selection audit

## Overall verdict

**PROVEN for contextual initial selection and execution; PARTIALLY PROVEN longitudinally.**

`canonical_training_method_policy_v1` is production-reachable through Session Construction. Selection is deterministic and bounded by Mesocycle permission, experience, exercise role/safety, load evidence and recovery. Unsupported method identities fail closed. Method progression/removal ultimately depends on the unmounted cycle/adaptation loop.

## Supported methods

### Straight sets and existing canonical method families

- Authority: Mesocycle permission → exact target/rest/progression/stop components.
- Eligibility: the existing Mesocycle and exact-target policies.
- Frequency: owned by Microcycle allocation.
- Exit: Mesocycle no longer permits the method or its stop rule fires.
- Finding: coherent within initial snapshots; later phase exit is unmounted.

### Antagonist supersets

- Goals: hypertrophy, powerbuilding and athletic performance.
- Experience: intermediate/advanced.
- Mesocycles: `hypertrophy_volume`, `hypertrophy_specialisation`, `powerbuilding_hypertrophy`, `athletic_general`.
- Pair types: horizontal push/pull, vertical push/pull, joint flexion/extension.
- Exclusions: primary-compound, high-skill, high-fatigue, unequal-round, recovery-restricted, deload/taper/transition.
- Maximum: one linked group per session.
- Execution: zero transition rest inside the pair; 60 seconds after the completed pair/round.
- Progression: each exercise retains its exact canonical targets; the pairing does not invent load progression.
- Exit: return to standalone work when eligibility/equality/recovery/phase compatibility is lost.
- Determinism: yes.
- Verdict: **PROVEN**.

Evidence:

- `08-Tier-System-Manual-Athletic-Based-Strength-Training.pdf`, PDF page 103 / printed page 87: defines antagonist pair classes.
- Same source, PDF page 232: chest/back paired examples with one minute between supersets.
- Limitation: these examples support the pairing/rest structure, not universal eligibility.

### Rest-pause

- Goals: hypertrophy and powerbuilding.
- Experience: intermediate/advanced.
- Mesocycles: hypertrophy volume/specialisation and powerbuilding hypertrophy.
- Exercise: one stable, low/moderate-fatigue dumbbell/machine/cable accessory or row.
- Requires: established load.
- Excludes: primary/barbell compounds, high skill/fatigue, restricted recovery, deload/taper/transition.
- Maximum: one exercise per session.
- Exact structure: three rounds of ten one-repetition segments, one-second reset between individual reps, normal inter-round rest.
- Stop: canonical stop rule plus immediate technical stop.
- Exit: missed target, stale evidence, restricted recovery or Mesocycle exit.
- Determinism: yes.
- Verdict: **PROVEN for the narrow dead-stop row-style structure**, not for a general failure-based rest-pause method.

Evidence:

- `02-Vault-T-Nation.pdf`, PDF/printed page 132: “Dumbbell Rows – Rest Pause,” 3×10, return each rep to the floor and wait one second before the next pull.
- Interpretation: “one-second reset” is literally the between-repetition dead-stop reset in that source. It is not one second between full rest-pause rounds.
- Limitation: the label is broader than the source-supported implementation; the policy correctly confines it to a narrow safe structure.

## Unsupported methods

| Method | Outcome | Reason |
| --- | --- | --- |
| Same-region superset | Fail closed | No approved exact pairing/eligibility contract |
| Triset | Fail closed | Named in sources but no bounded production execution contract |
| Myo-reps | Fail closed | No exact construction/evidence contract |
| Drop set | Fail closed | No approved load-reduction and stop rule |
| Standalone 10×10 | Fail closed | No approved production policy |
| High-rep finisher | Fail closed | No defined need, dose and recovery contract |
| Capped AMRAP duplicate | Fail closed | Existing canonical AMRAP owns that behavior |

## Material finding

Severity: **P1**  
Evidence: method facts propagate from snapshot to Train and performed evidence, but method exit/progression cannot change later plans without the mounted Progress/cycle loop.  
Affected users: athletes receiving advanced methods across multiple weeks  
Consequence: method exposure can remain static rather than exit responsively  
Direction: close the general adaptation loop before adding any method breadth  
Code change required: yes  
Blocked by insufficient evidence: no
