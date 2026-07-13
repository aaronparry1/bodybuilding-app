# D4E2 calibration exact-target policy map

## Audit outcome

The current calibration programme defines slots and set guidance, but does not yet own all exact-target semantics currently supplied by `BlockType`. D4E2 cannot certify a policy bundle without approved values for those load-bearing decisions.

| Semantic decision | Current legacy branch | Prescription meaning | Candidate current owner | Status | Blocker |
|---|---|---|---|---|---|
| rep strategy | `resolveRepRange` / `resolveBlockRoleRepRange` | exact reps and range selection | calibration rep-strategy policy | missing approval | high |
| training lane | `resolveTrainingLane` | lane-specific caps, effort and set behavior | calibration lane policy | missing approval | high |
| set construction | `resolveEvidenceBasedSlotPrescription` + `withSetPrescription` | exact set count and bounds | D4B guidance + calibration set policy | partial; precedence unresolved | high |
| starting load | `resolveStartingLoadRecommendation` | no-history, sparse-history and established-load behavior | calibration load policy + history | policy not defined | high |
| drop-off | block drop-off rule / lane constraints | reference-set comparison and threshold | calibration drop-off policy | threshold ownership unresolved | high |
| shutdown | live/target generation branches | stop and failure semantics | calibration shutdown policy | ownership unresolved | high |
| suitability | `matchesBlock`, block eligibility | exercise admissibility | current suitability policy | no exact replacement contract | medium |
| progression qualification | load/progression helpers | later evidence qualification | progression architecture | separate owner, not mapped | medium |

## Scope mapping

The bundle must resolve exactly for `build_muscle`, intermediate, four-day Upper/Lower, full gym, `hypertrophy_calibration`, normal calibration priority and all four certified session identities. Slot purpose and movement pattern alone cannot infer a lane or rep strategy.

## Required policy identities

The future bundle needs independent versioned identities for rep strategy, lane, set construction, starting load, drop-off, shutdown, suitability and effort/failure handling, plus a certification identity. None may reuse `BlockType`, the generic hypertrophy label, or the programme-policy identity.

## Current-source gaps

* D4B supplies selected-job semantic target, purpose, movement constraints and recommended min/max guidance.
* Exercise facts and history supply classification and evidence availability.
* Session identity and microcycle priority supply structural context only.
* No approved current source supplies exact reps, lane, load-estimation hierarchy, drop-off threshold/measurement, shutdown trigger, or block-suitability replacement.

Until those fields are approved, no exact-target policy can be certified and D4E remains blocked. No target engine, D4D2 runtime, formula, persistence or fallback was changed.

## D4E2A decision matrix

| Decision | Proposed calibration policy | Evidence/architecture basis | Compatibility comparison | Owner approval |
|---|---|---|---|---|
| Rep strategy | moderate compound domain; moderate-to-higher isolation domain; exact reps chosen by existing arithmetic from policy input | technique consistency, repeatable loading, low unnecessary fatigue | policy-input change; arithmetic remains shared | exact numerical domains |
| Lanes | `primary_compound_calibration`, `secondary_compound_calibration`, `isolation_calibration` | only three formula-relevant class distinctions | replaces block names with semantic lanes | lane values and controls |
| Set precedence | D4B min/max envelope → calibration chooses initial count → history may move within envelope → drop-off may stop early | preserves certified slot authority | intentional current authority correction | initial count/history movement |
| Starting load | exercise-specific history first; sparse-history estimate second; conservative calibration discovery third; explicit review if unsafe | preserves evidence quality without generic percentages | intentional policy boundary | hierarchy and rounding |
| Drop-off | universal 15% from best valid working set; evaluate after sufficient working sets; exclude warm-ups | existing approved app rule | likely compatible where block used 15% | comparison basis/minimum observations |
| Shutdown | exercise-level stop after drop-off/safety trigger; retain valid work; later jobs continue when safe | separates target metadata from live safety authority | intentional current orchestration | trigger and continuation rules |
| Effort/failure | no routine AMRAP or intentional failure; missed/failed reps are evidence | calibration interpretability | policy clarification | final-set behavior |
| Suitability | explicit purpose/lane/class/loading checks | removes `isBlockSuitable` proxy | intentional current replacement | supported class matrix |

All numerical rep domains, exact initial set count, load hierarchy, drop-off basis, shutdown continuation and established-history behavior remain product-owner decisions. The proposal is implementation-ready only after those approvals.
