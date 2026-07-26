# Identity certification

## Verdict: PARTIALLY PROVEN

| Case | Observed behavior | Verdict |
| --- | --- | --- |
| Same exercise, recurring slot | calibration follows `exerciseId`; slot remains evidence provenance | PROVEN |
| Same exercise, different session/slot | retained load can follow exercise identity across slots | PARTIALLY PROVEN: loading-mode/session-role compatibility is not enforced |
| Similar roles, different exercises | exercise-keyed maps keep loads separate | PROVEN |
| Substitution | evidence carrying `substitutionId` cannot establish the prescribed exercise load | PROVEN |
| Removal/reintroduction | exercise-keyed retained context survives reconstruction | PARTIALLY PROVEN: no mounted exercise-removal/reintroduction lifecycle exists |
| Old slot-keyed carrier | only unambiguous explicit established snapshot facts are inferred | PROVEN fail-closed |
| Ambiguous historical identity | conflicting same-latest facts do not create established loading | PROVEN fail-closed |
| Unit display change | non-base-unit evidence is ignored; display conversion cannot create progression/PR | PROVEN |
| Restart before retry | persisted session/evidence/decision identity is deterministic | PROVEN for application retry |
| Duplicate completion | one operation/decision; revision remains unchanged | PROVEN |

The full chain is present: programme, cycles, planned session, exercise, slot, prescription hash, attempt, evidence, decision, receipt, and resulting future session IDs.

## Finding ID-01

- Severity: P1
- Exact evidence: `failedComparableExposureCount` groups by exercise ID and session only; load reconstruction evidence omits a durable compatibility signature
- Production path: v3 evaluator and `resolveCanonicalConstructionFacts`
- Affected configurations: same exercise used under materially different loading modes, roles, or prescriptions
- Consequence: an incomparable failure can count toward recalibration, or an established load can cross an incompatible mode
- Confidence: high from source; destructive outcome not exercised in mounted UI
- Verdict: PARTIALLY PROVEN
- Remediation direction: versioned comparability identity must include exercise, loading mode, prescription family, and relevant role while retaining slot provenance
- Production code change required: yes

## Finding ID-02

- Severity: P2
- Exact evidence: future regeneration rewrites slot/session IDs whenever an applied Phase 1 decision reconstructs a retained Microcycle
- Production path: Phase 1 application → Session Construction
- Affected configurations: calibration/recalibration
- Consequence: unnecessary identity churn; in the no-op case it is the only observable “change”
- Confidence: high
- Verdict: CONTRADICTED as a meaningful applied prescription change
- Remediation direction: do not commit regeneration without an enumerated compatible target delta
- Production code change required: yes
