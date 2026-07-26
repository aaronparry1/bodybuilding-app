# Mounted loop trace

## Executable route

| Boundary | Production file/function | Input → output | Persistence / transaction | Failure and retry |
| --- | --- | --- | --- | --- |
| Mounted screen | `app-production/(protected)/(tabs)/train.tsx` re-exports `app/(protected)/(tabs)/train.tsx:CanonicalTrainExperience` | mounted route → canonical Train UI | none | route has no coaching policy |
| Completion command | `canonical-recorded-session-application.ts:completeCanonicalSession` | plan/revision/ledger identity → durable `completed` event | canonical recorded-session ledger append | stale versions reject; duplicate completion retries adaptation only when completion evidence exists |
| Performed evidence | `recordCanonicalPerformedWork` | immutable slot/exercise/set facts → `performance` evidence | ledger append then evidence repository | evidence failure returns retryable, but event/evidence reconciliation is not mounted |
| Completion evidence | `completeCanonicalSession` | completion summary → `completion` evidence | evidence repository after durable completion | failure returns `completed_with_evidence_pending`; completed retry cannot recreate absent evidence |
| Orchestration | `canonical-post-workout-orchestrator.ts:orchestrateCanonicalPostWorkoutAdaptation` | completed session + completion evidence → resolved attempt | coaching-attempt repository | deterministic operation ID; pending attempts retry |
| Evaluation | `canonical-progress-evaluator.ts:evaluateCanonicalPostWorkoutProgress` | immutable snapshot/events/evidence/cycle policy → v3 evaluation | evaluation is embedded through the decision, not separately persisted | invalid identity/context blocks |
| Decision | `canonical-progress-decision-production.ts:produceCanonicalProgressDecision` | v3 evaluation/evidence versions → persisted decision | decision repository; deterministic decision ID | conflict/stale/missing evidence rejects |
| Application | `canonical-progress-decision-application.ts:applyCanonicalProgressDecision` | persisted decision + CAS revision → bounded apply/no-change | active-plan CAS + application receipt | plan save fails closed; receipt failure rolls plan back |
| Exact future session | `constructCanonicalActivePlanFromCanonicalInputs` via application | bounded calibration/recalibration/advance intent → immutable v3 snapshots | active-plan carrier | Session Construction remains exact-prescription owner |
| Projection | `readCanonicalHomeProjection`, `projectCanonicalPlan`, `projectCanonicalWorkoutPresentation` | one active-plan read model → Home/Plan/Train | read-only | no presentation authority |

## Identity chain

Programme `planId` → Macrocycle `carrier.macrocycle.id` → Mesocycle `carrier.mesocycle.id` → Microcycle `carrier.microcycle.id` → planned-session ID → slot ID + canonical exercise ID → prescription hash → deterministic recorded-session ID → evidence IDs → deterministic coaching operation/decision ID → application receipt → regenerated future snapshot IDs.

The completed snapshot remains byte-equivalent in the ledger. New exact prescriptions are generated only for future sessions.

## Finding ML-01

- Severity: P0
- Exact evidence: `advanced_five_day_hypertrophy` in `scenario-reproduction.json`
- Production path: complete → evaluate `establish_calibration` → decision → application
- Affected configurations: completed calibration whose exercises do not recur in retained future indexes
- Consequence: receipt says `applied`, revision changes, future identities churn, but no future load/set/rep changes
- Confidence: high; reproduced twice
- Verdict: CONTRADICTED
- Remediation direction: application must require and receipt must enumerate at least one compatible future target delta, otherwise persist explicit no-change
- Production code change required: yes, Phase 2

## Finding ML-02

- Severity: P0
- Exact evidence: all 12 longitudinal runs; eight final reason codes include `machine_evaluable_objective_policy_missing`
- Production path: final planned completion → blocked decision → zero remaining planned sessions
- Affected configurations: every tested plan by or before the current Mesocycle boundary
- Consequence: no next workout and no mounted resolution route
- Confidence: high
- Verdict: CONTRADICTED
- Remediation direction: add a separately certified machine-evaluable objective/transition boundary or a safe reviewed continuation that never strands the athlete
- Production code change required: yes, Phase 2
