# One-step scenario reproduction

The committed 12-scenario matrix was executed twice through the production completion/orchestration/application functions with isolated local repositories. Semantic results were deterministic.

| Scenario | Input reachability | Decision | Recorded result | Actual future numerical/load-state delta | Verdict |
| --- | --- | --- | --- | ---: | --- |
| normal responder | mounted | establish calibration | future change | 1 | appropriate bounded change |
| high responder | mounted | maintain | explicit no-change | 0 | safe but missed progression opportunity |
| repeated stall | simulation-only prior failure | recalibrate | future change | 1 | conservative result; comparator not certified comparable |
| poor recovery | simulation-only readiness | blocked | review | 0 | safe, unreachable from mounted input |
| missed sessions | mounted partial completion | maintain | no-change | 0 | not a missed-session scenario |
| return after layoff | simulation-only capacity | establish calibration | future change | 1 | calibration is safe; layoff fact has no production writer |
| pain/limitation | simulation-only pain | blocked | review | 0 | safe, unreachable from mounted pain input |
| limited equipment | simulation-only onboarding context | establish calibration | future change | 3 | construction supports it; mounted onboarding assumes full gym |
| advanced five-day hypertrophy | mounted | establish calibration | future change | 0 | incorrect applied no-op |
| strength transition boundary | mounted | blocked | review | 0 | safe decision but leaves no next session |
| powerbuilding | mounted | maintain | explicit no-change | 0 | safe but no main/accessory progression differentiation |
| athletic sport workload | simulation-only capacity | blocked | review | 0 | safe, later workload change is unreachable |

Reported decision labels reproduce as 5/7/0. Actual prescription effects are **4 changes / 7 explicit no-change-review / 1 applied no-op**.

No automatic numeric increase or reduction occurred. Calibration changes are `calibration_required → established` at observed loads, rounded by existing equipment increment. Recalibration is `established 80 kg → calibration_required`; it is not an automatic reduction.

All completed historical snapshots remained immutable. Duplicate delivery was idempotent and did not increment the revision. Home, Plan, Train, and the canonical read model agreed where a next session existed. At the transition boundary all correctly agreed that no next session existed—which is itself the deadlock.
