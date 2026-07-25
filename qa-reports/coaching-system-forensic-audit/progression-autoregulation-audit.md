# Progression and autoregulation audit

## Verdict

**CONTRADICTED** as a production autoregulation system.

The app prescribes explicit progression and stop-rule contracts, but it does not demonstrate that actual completed training changes later prescriptions. Initial calibration is executable; future load establishment/progression is broken or fail-closed; volume/recovery/transition policies are unmounted.

## Rule inventory

| Rule | Required evidence | Threshold/bound | Production outcome | Verdict |
| --- | --- | --- | --- | --- |
| First exposure | Missing compatible load evidence | Exact target reps; positive entered load | Train records calibration work | PARTIALLY PROVEN |
| Successful completion | Completed ledger event | Exact prescribed target | Evidence/history updated | PROVEN as fact, NOT PROVEN as progression |
| Partial/failed target | Partial/missed performed work | Snapshot stop rule | Fact retained; no future prescription change | NOT PROVEN |
| Load progression | Fresh established evidence, supported method, equipment increment | No approved numeric step | Always `manual_review_required` | CONTRADICTED |
| Rep progression | Comparable success inside Mesocycle target envelope | Embedded progression text | No mounted future regeneration | UNREACHABLE |
| Set/volume increase | ≥3 comparable completed observations, acceptable recovery, below target, no drop-off | +1 direct set to one region | Pure policy only | UNREACHABLE |
| Set/volume decrease | Confirmed local drop-off/recovery failure | -1; -2 only on repeated signal and above floor | Pure policy only | UNREACHABLE |
| Density progression | Mesocycle/method owned | No independent mounted density decision | Snapshot-only | NOT PROVEN |
| Maintain | Stable/insufficient evidence | Retain current dose/load | Occurs de facto because no decision runs | CONTRADICTED as intelligent maintenance |
| Regression/recalibration | Persistent regression/stale evidence | Bounded review/calibration outcomes | Policy/evaluators exist; no mounted application | UNREACHABLE |
| Excessive drop-off | Same exercise/session evidence | Snapshot-specific target/stop rule | Rule is stored, but future effect is unmounted | PARTIALLY PROVEN |
| Poor recovery | Fresh complete recovery facts | Review-only in recovery policy | Initial dose uses onboarding recovery; later chain unmounted | PARTIALLY PROVEN |
| Missed sessions | Factual missed-session evidence | Order-preserving reflow | Pure Microcycle helper only | UNREACHABLE |
| Repeated stalls | Persistent comparable evidence | Review/volume policy | No mounted derivation/application | UNREACHABLE |
| Pain/limitation | Typed exclusion or pain evidence | Safety precedence | Initial typed exclusion works; Train cannot author pain evidence | PARTIALLY PROVEN |
| Deload entry | Fresh evidence yielding deload intent | Approved recovery successor | Actual evidence does not derive intent; no mounted caller | UNREACHABLE |
| Deload exit | Successor exit evidence | Approved edge | No mounted loop | UNREACHABLE |
| Exercise replacement | Suitability-preserving candidate + reason | Same owned slot purpose | Initial limitation/preferences supported; mounted Train has no swap authoring | CONTRADICTED |
| Method introduction | Mesocycle permission, experience, exercise safety, evidence, recovery | One group/exercise frequency bounds | Deterministic Session Construction | PROVEN |
| Method progression/removal | Owning exact progression/stop rule and Mesocycle exit | Method-specific exit contract | Introduction works; longitudinal exit depends on unmounted cycle change | PARTIALLY PROVEN |
| Mesocycle transition | Exit evidence + approved successor | CAS revision, history preservation | Application exists; no mounted evaluator/producer | UNREACHABLE |

## Critical evidence mismatch

`evaluateCanonicalProgressV2` derives:

- transition only from `observations.transitionReady === true` or `exitCriteriaSatisfied === true`;
- deload only from `observations.deloadRequired === true` or `recoveryState === "recovery_first"`.

The mounted ledger writer records:

- performance: exercise/loading mode/method, reps, load, unit, completion, optional effort;
- completion: completion state and performed set/rep/load totals.

No mounted owner converts those facts into the evaluator’s intent flags. The evaluator therefore returns `continue` for normal, high-response, stalled, poor-recovery, inconsistent, returning, strength-expression, powerbuilding and changing sport-workload scenarios.

## Established-load defect

Direct construction can produce established loads when supplied both:

1. `establishedLoads[exerciseId]`; and
2. matching `loadEvidence[exerciseId]`.

Production reconstruction instead creates `establishedLoads[slotId]` and supplies no `loadEvidence`. Consequently, performed calibration cannot become a valid established future prescription through the current reconstruction path.

Severity: **P0**  
Confidence: **high**  
Affected users: every athlete beginning with calibration-required load states  
Consequence: future sessions cannot learn valid working loads through the intended path  
Direction: define a versioned exercise-scoped calibration resolver and pass both numeric load and provenance evidence into Session Construction  
Code change required: yes  
Blocked by insufficient evidence: no

## “PR every session”

There is no production programming rule that tries to force a PR every session. Canonical Progress highlights are conservative presentation:

- warm-ups excluded;
- comparisons are exercise/load-mode scoped;
- estimated 1RM requires valid established external-load facts;
- incomparable substitutions/calibration do not become precise PR claims.

Verdict: **PROVEN** as conservative display logic, **NOT PROVEN** as a coaching objective—and it should not become one.
