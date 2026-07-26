# Longitudinal 12-week results

## Result

- Scenarios reaching 12 weeks: **0/12**
- Deadlocked scenarios: **12/12**
- Appropriate actual future changes before deadlock: calibration establishment, recalibration, and Microcycle construction only
- Automatic numeric progression/regression: **0**
- Unsafe automatic adaptations: **0**
- Unsupported/deadlocked capability: **12**

| Scenario | Sessions before no-next state | Highest Microcycle | Final state | Classification |
| --- | ---: | ---: | --- | --- |
| normal responder | 15 | 3 | objective policy missing | deadlocked |
| high responder | 15 | 3 | objective policy missing | missed adaptation then deadlocked |
| repeated stall | 15 | 3 | objective policy missing | comparator-limited then deadlocked |
| poor recovery | 5 | 1 | recovery review required | permanently blocked |
| missed sessions | 5 | 1 | single incomplete exposure | permanently blocked |
| return after layoff | 15 | 3 | objective policy missing | deadlocked |
| pain/limitation | 5 | 1 | safety review required | permanently blocked |
| limited equipment | 9 | 3 | objective policy missing | deadlocked |
| advanced hypertrophy | 10 | 2 | objective policy missing | deadlocked |
| strength boundary | 12 | 4 | objective policy missing | deadlocked |
| powerbuilding | 15 | 3 | objective policy missing | missed progression then deadlocked |
| athletic workload | 3 | 1 | recovery review required | permanently blocked |

These are not 12-week coaching outcomes. They are deterministic evidence that the current mounted policy cannot execute the requested longitudinal horizon. Review outcomes lack a mounted resolution action; additional qualifying sessions cannot arrive after the carrier has no next planned session.

## Finding LG-01

- Severity: P0
- Exact evidence: `longitudinal-12-week-results.json`
- Production path: repeated real completion orchestration
- Affected configurations: all 12
- Consequence: the system cannot continuously coach an athlete across the intended horizon
- Confidence: high
- Verdict: CONTRADICTED
- Remediation direction: Phase 2 must first close the no-next-session and review-resolution boundary
- Production code change required: yes
