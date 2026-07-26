# Audit of 491 explicit no-change outcomes

All 491 v2 receipts are structurally truthful: revision unchanged, no material
deltas, and `actualResult: explicit_no_change`.

## Reason counts

| Attempt/reason | Count | Required evidence | Mounted evidence in run | Later resolution | Verdict |
| --- | ---: | --- | --- | --- | --- |
| `phase_one_prescription_maintained` / `successful_exposure_retained` + `automatic_numeric_adjustment_not_authorised` | 462 | a successful completed target; no threshold can authorise numeric change | complete performed work and exact target facts | cycle construction occurs, but the same success outcome can repeat indefinitely | PARTIALLY PROVEN as conservative; exposes absent P1 policy |
| `material_prescription_delta_absent` / stable completed calibration | 27 | successful calibration candidate but compatible retained future target absent/equivalent | complete performed work and exercise identity | sometimes resolves when a compatible target later exists; not guaranteed if the exercise does not recur | PROVEN truthful no-op; PARTIALLY PROVEN resolution |
| `phase_one_prescription_maintained` / `single_incomplete_exposure` | 1 | one partial exposure | mounted partial completed workout | later success resolves in this run | PROVEN appropriate |
| `phase_one_prescription_maintained` / `rep_drop_off_blocks_progression` | 1 | performed reps below later target | mounted performed work | later stable success resolves in this run | PROVEN appropriate |

Production entrypoint:
`evaluateCanonicalPostWorkoutProgress` →
`applyPhaseOneDecision`.

Persisted state: decision reason codes and v2 no-change receipt.
Representative evidence: fresh longitudinal JSON and
`one incomplete exposure maintains the future prescription and excessive
drop-off cannot progress it`. Affected configurations: all scenarios, chiefly
established successful athletes. Confidence: high.

## Required explicit checks

- Repeated `insufficient_evidence`: **0** in the continuity matrix.
- Repeated successful maintenance: **462**.
- Repeated maintenance after qualifying failure: the repeated-stall fixture
  recalibrates once after directly injected history, then returns to successful
  maintenance; general prescription compatibility remains **NOT PROVEN**.
- Recovery/pain states production cannot resolve: absent from continuity runs
  because their inputs are disabled. A final-session recovery counterfactual
  blocks with no next session.
- Missed-session states production cannot resolve: not represented. The
  “missed sessions” fixture performs partial work and then trains normally.
- Next session exists but demand never adapts numerically: normal, high,
  advanced hypertrophy, strength, and powerbuilding contexts repeatedly show
  this.

## Coaching assessment

The 462 successful-maintain results are not unsafe. They are also not evidence
of an intelligent progression loop. Once sufficient comparable evidence is
mounted, identical success can repeat forever because the evaluator explicitly
prohibits numeric adjustment.

Verdict: **CONTRADICTED** for complete longitudinal autoregulation.

The 29 other no-change outcomes are bounded and factually defensible at that
specific opportunity. Verdict: **PROVEN** at the individual decision, with
later-resolution coverage **PARTIALLY PROVEN**.
