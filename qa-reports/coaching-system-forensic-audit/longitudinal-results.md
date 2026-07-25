# Longitudinal simulated-athlete results

Machine-readable weekly prescriptions and evidence are in `longitudinal-results.json`. Scenario inputs are in `longitudinal-scenarios.json`.

## Execution

- Pure production construction and evaluator functions only.
- No local repositories, cloud services or real user data.
- Twelve representative athletes.
- Eight 12-week and four 16-week runs.
- Every initial construction succeeded.
- Every scenario was executed twice.
- Identical inputs produced semantically identical results in all 12 scenarios.
- No uncontrolled randomness affected a material decision.

## Result by athlete

| Athlete | Weeks | Initial phase | Pure v2 outcome at final week | Mounted future change |
| --- | ---: | --- | --- | --- |
| Normal responder | 12 | hypertrophy calibration | continue | none |
| High responder | 12 | hypertrophy calibration | continue | none |
| Stalled athlete | 12 | strength general | continue | none |
| Poor-recovery athlete | 12 | hypertrophy calibration | continue | none |
| Inconsistent athlete | 12 | hypertrophy calibration | continue | none |
| Returning athlete | 12 | hypertrophy calibration | continue | none |
| Pain/limitation athlete | 12 | hypertrophy calibration | review required | none |
| Time-constrained athlete | 12 | hypertrophy calibration | continue | none |
| Advanced five-day hypertrophy | 16 | hypertrophy calibration | continue | none |
| Strength approaching expression | 16 | strength general | continue | none |
| Powerbuilding | 16 | powerbuilding foundation | continue | none |
| Athletic performance | 16 | athletic general | continue | none |

## Interpretation

This is not a claim that every athlete should change every week. It is evidence that the production architecture does not distinguish:

- a high responder from a normal responder;
- a stall from stable performance;
- repeated drop-off/systemic recovery decline from ordinary completion;
- missed training from consistent training;
- an approaching expression phase from an open-ended initial phase.

The only different pure evaluator outcome was the pain scenario, and only because the audit harness explicitly supplied a pain evidence kind. The mounted Train UI has no equivalent pain authoring path.

## Determinism

Initial construction is strongly deterministic. Session seeds are derived from plan/session identity. Running every scenario twice produced the same material snapshots and weekly diagnostic outputs.

## Limitation

The harness intentionally did not call repositories or simulate a nonexistent mounted application chain. Its `interpretedOutcomeIfPureEvaluatorWereCalled` field diagnoses the pure evaluator. `productionAdaptation: none` reflects executable route reachability, not a mocked omission.
