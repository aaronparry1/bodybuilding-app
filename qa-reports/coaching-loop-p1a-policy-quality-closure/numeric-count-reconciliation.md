# Numeric count reconciliation

Verdict: **PROVEN** for the two isolated mounted journeys.

An evaluator decision is the persisted post-workout coaching decision. Each decision contains one numeric decision record per evaluated exercise slot. Most records are non-actionable evidence outcomes. Only records with an exact `after` prescription become application candidates.

| Measure | Success journey | Underperformance journey | Aggregate executions |
|---|---:|---:|---:|
| Evaluator decisions | 9 | 21 | 30 |
| Progression decision records | 24 | 76 | 100 |
| Regression decision records | 0 | 24 | 24 |
| Hold decision records | 0 | 22 | 22 |
| Application intents / successful CAS operations | 3 | 7 | 10 |
| Affected exercise/future-prescription observations | 13 | 17 | 30 |
| Progression field deltas | 13 | 43 | 56 |
| Regression field deltas | 0 | 13 | 13 |
| Receipts, including explicit unchanged receipts | 9 | 21 | 30 |

The earlier “13 progressions” was the dedicated success journey. The 43 earlier progressions occurred independently while the regression fixture established the later failure window. Therefore 56 is the aggregate progression-field-delta count across both executions, not 56 unique exercises or one application rewriting 56 prescriptions.

Every authorised exercise decision matches exactly one future semantic slot. A boundary CAS may atomically commit several separately authorised slot changes in one revision. In the success journey, three CAS operations affected 13 exact future slots in three sessions; in the regression journey, seven CAS operations affected 17 exact slots in three sessions. Zero-target and multi-target matches remain unresolved. Ordinary Session Construction remains a separate authorised structural operation.
