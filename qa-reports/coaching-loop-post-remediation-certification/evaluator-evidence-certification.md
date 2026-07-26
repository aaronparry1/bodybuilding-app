# Evaluator evidence certification

## Mounted evidence

| Input | Factual source / derivation | Missing representation | Replay |
| --- | --- | --- | --- |
| target completion | immutable exact targets + effective performed-work ledger events | failed/partial | reproducible |
| load/reps/sets | recorded set event, prescription slot, base kg evidence | absent event | reproducible |
| partial completion | completion summary + per-slot performed count | explicit partial/skipped counts | reproducible |
| rep drop-off | later performed reps below corresponding prescribed target | false when absent | reproducible |
| exposure count | distinct sessions with any complete performance evidence for affected exercise | zero | reproducible but not fully comparable |
| recent trend | not derived | absent | unsupported |
| missed planned work | not derived; fixture completes partial work | absent | unsupported |
| readiness/recovery | direct `readiness`/`capacity` evidence labelled fresh/complete | `not_collected` | repository replay works, mounted collection absent |
| stall | two exercise-keyed failed session groups | one exposure maintains | reproducible, compatibility deficient |
| deload eligibility | hard-coded false | false | reproducible but unsupported |
| phase transition | cycle count + approved successor; objective not machine-evaluable | blocked review | reproducible, no application |

Caller-authored v2 `deloadRequired`, `transitionReady`, and `exitCriteriaSatisfied` flags have no authority in the mounted v3 path. Absence of recovery evidence becomes `not_collected`, never “good recovery.” One poor session maintains. Excessive drop-off blocks progression. First exposure can establish an observed calibration but cannot receive an invented increase.

Performed-work edits replace the matching evidence while the session is active. Editing after completion is rejected, preserving the decision boundary.

## Finding EV-01

- Severity: P1
- Exact evidence: repository-wide mounted-source scan finds no writer for `readiness`, `capacity`, `pain`, or `review_request`
- Production path: Train writes only performance and completion
- Affected configurations: poor recovery, pain, returning athlete, changed sport workload
- Consequence: safe evaluator branches exist but cannot be reached by real athlete facts
- Confidence: high
- Verdict: UNREACHABLE
- Remediation direction: add factual, versioned, mounted capture with explicit freshness and correction/replay semantics before policy application
- Production code change required: yes

## Finding EV-02

- Severity: P1
- Exact evidence: `comparableExposureCount` and `failedComparableExposureCount` use exercise/session membership without complete prescription compatibility
- Production path: v3 evaluator lines 161 and 259–269
- Affected configurations: repeated exercise across roles, modes, targets, substitutions, or long gaps
- Consequence: false stall/recalibration qualification
- Confidence: high
- Verdict: UNSAFE as a general comparator; current action is conservative recalibration rather than numeric regression
- Remediation direction: canonical comparable-exposure contract and freshness window
- Production code change required: yes

## Finding EV-03

- Severity: P2
- Exact evidence: freshness is accepted from `observations.freshness === "fresh"` rather than derived from timestamps/policy
- Production path: `recoveryEvidenceState`
- Affected configurations: replayed or stale recovery evidence
- Consequence: direct writers could mislabel old facts as current
- Confidence: high
- Verdict: NOT PROVEN
- Remediation direction: owner-derived freshness from observed time, current cycle, and policy version
- Production code change required: yes
