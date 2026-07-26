# Fresh 12-week longitudinal certification

Two independent scenario-isolated runs used the committed production
completion, evidence, evaluator, decision, application, Session Construction,
and local persistence authorities. Their semantic SHA-256 values are recorded
in the JSON artifact and are identical run-to-run.

## Aggregate

- Scenarios: 12.
- Target reached: 12/12 in both runs.
- Opportunities per run: 648.
- Matrix deadlocks: 0.
- Matrix terminal blocks: 0.
- Mechanically applied: 157.
- Truthfully material: 155.
- Explicit no-change: 491.
- Numeric progression: 0.
- Numeric regression: 0.
- Calibration: 10.
- Recalibration: 1.
- Structural continuity: 144.
- Generated-ID-only incorrect applications: 2.
- Maintenance classified as missed adaptation opportunity: 462.
- Other appropriate maintenance/no-op: 29.

## Per scenario

| Scenario | Sessions / highest sequence | Truthful material | False applied | Explicit no-change | Classification highlights |
| --- | ---: | ---: | ---: | ---: | --- |
| normal responder | 60 / 13 | 14 | 0 | 46 | 2 calibrations, 12 structural, 43 successful-maintain gaps |
| high responder | 60 / 13 | 12 | 0 | 48 | 12 structural, 47 successful-maintain gaps |
| repeated stall | 60 / 13 | 13 | 1 | 46 | 1 simulated-comparator recalibration, 12 structural |
| poor recovery | 60 / 13 | 14 | 0 | 46 | recovery fact disabled; behaves like normal responder |
| missed sessions | 60 / 13 | 12 | 0 | 48 | one partial first workout, then all work completed |
| return after layoff | 60 / 13 | 14 | 0 | 46 | returning-capacity fact disabled; behaves like normal |
| pain or limitation | 60 / 13 | 14 | 0 | 46 | limitation retained; pain fact disabled |
| limited equipment | 36 / 13 | 13 | 0 | 23 | direct construction input, not mounted onboarding |
| advanced five-day hypertrophy | 60 / 13 | 12 | 0 | 48 | 12 structural, no numeric adaptation |
| strength transition boundary | 36 / 13 | 12 | 0 | 24 | structural transitions only |
| powerbuilding athlete | 60 / 13 | 12 | 0 | 48 | 12 structural, 47 successful-maintain gaps |
| athletic changing workload | 36 / 13 | 13 | 1 | 22 | changed workload fact disabled |

## Production reachability

Fully mounted distinguishing inputs in the runner:

- normal responder;
- high responder;
- partial-work “missed” fixture;
- advanced five-day hypertrophy;
- strength boundary;
- powerbuilding.

Simulation-only distinguishing inputs:

- repeated historical stall evidence;
- constrained recovery;
- returning capacity;
- pain;
- limited-equipment onboarding;
- later changed sport workload.

Every scenario still invokes production authorities. A simulation-only label
means that the fact distinguishing that named athlete is directly supplied by
the harness or removed in continuity mode, not that a second coaching engine
is used.

## Boundary exposure

The runs contain 117 ordinary week advances, 22 approved-successor
transitions, and 5 same-phase fallbacks after successor construction failure.
They do not exercise final-session review continuity or a maximum-horizon
construction failure.

Verdict: **PROVEN** for favourable ordinary continuity; **PARTIALLY PROVEN**
for the named athlete contexts and full boundary matrix.

Production entrypoint: `completeCanonicalSession`; persisted state: ledger,
evidence, attempt, decision, carrier, receipt; representative harness:
`certification-runner.ts`; affected configurations: the 12 recorded scenario
definitions; confidence: high.

## Safety classification

- Unsafe numeric adaptations: 0.
- Incorrect numeric adaptations: 0.
- Incorrect semantic applications: 2 generated-ID-only receipts.
- Permanent matrix deadlocks: 0.
- Demonstrated counterfactual review deadlock: 1.
- Silent omissions in the captured matrix: 0 receipts missing.
- Missed coaching opportunities: 462 successful-maintain outcomes caused by
  absent numeric policy.

The matrix proves the loop keeps generating workouts in selected conditions. It
does not prove that those workouts become progressively better matched to the
athlete.
