# Input-to-decision utilisation matrix

Machine-readable evidence: `input-utilisation-matrix.json`.

## Result

- Inputs audited: 32
- Meaningful programming inputs: 30
- Proven mounted material programming inputs: 14
- Utilisation: **46.7%**

The numerator is deliberately strict: a pure function or unit test is not counted unless a mounted production path supplies the input and changes a coaching output.

## Effective inputs

Goal, target date, experience, recent consistency, recent training frequency, recent workout workload, available training days, workout duration, compatible framework preference, custom exercise catalogue, recovery/cardio preference, onboarding recovery, onboarding sport workload and active cycle state.

## Important ineffective or compromised inputs

| Input | Classification | Why |
| --- | --- | --- |
| Equipment | Silently defaulted | Onboarding supplies the full equipment enum instead of asking the athlete. |
| Limitations | Collected/unreachable | Typed policy exists, but onboarding does not collect it and reconstruction resets it to `[]`. |
| Disliked exercises/preferences | Collected/unreachable | Direct construction supports records; mounted swaps do not persist them into future construction facts. |
| Established loads | Converted incorrectly | Reconstruction keys by slot ID and omits `loadEvidence`; Session Construction needs exercise ID + evidence. |
| Performed work/target achievement | Stored but unused | Evidence is retained and presented, but no mounted future decision follows. |
| Missed sessions | Stored but unused | Pure reflow exists; mounted evidence does not invoke it. |
| Rep drop-off | Stored but unused longitudinally | Stop/policy contracts exist; no mounted future intervention/application. |
| Fatigue/readiness | Collected/unreachable | No mounted factual entry → policy → decision chain. |
| Previous Mesocycles | Stored but unused | Lineage persists, but mounted phase transitions do not occur. |
| Event type | Collected/unreachable | It filters/labels onboarding, but is absent from the canonical construction command. |

## Counterfactual proof

`counterfactual-results.json` shows material changes for experience, goal, days, duration, initial recovery, equipment, typed limitation and established load evidence. It also shows:

- missed-session evidence does not change future production programming;
- PPL versus “coach choose” can appropriately resolve to the same PPL delivery;
- rep drop-off, deload and phase advancement cannot be exercised from the mounted longitudinal path.
