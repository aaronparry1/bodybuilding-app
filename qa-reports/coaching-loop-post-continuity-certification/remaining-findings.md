# Remaining findings

## P0

### PC-P0-01 — generated method-group identity is material

- Severity: P0.
- Production limitation: comparator treats regenerated
  `methodStructure.groupId` as training demand.
- Entrypoint/persisted state: `applyPhaseOneDecision`; carrier + applied v2
  receipt.
- Affected: grouped-method future sessions regenerated in place.
- Mounted inputs: completed performed work.
- Missing input: none; this is semantic comparison.
- Dependency: none.
- Smallest safe change: exclude generated identity while retaining semantic
  group membership/topology.
- Certification: metadata/group topology/no-op/replay/crash matrix.
- Literature: not required.
- Claim impact: blocks truthful adaptive-coaching claim.
- TestFlight impact: blocks a coaching-loop release candidate; not a
  diagnostic-only internal build.
- Confidence/verdict: high / CONTRADICTED.

### PC-P0-02 — post-CAS receipt interruption does not converge

- Severity: P0.
- Production limitation: carrier commits before receipt; an exception skips
  rollback; restart short-circuits on decision reference without receipt repair
  or attempt terminalisation.
- Entrypoint/persisted state: `applyPhaseOneDecision` and
  `resumePendingCanonicalCoachingWork`; carrier + decision, missing receipt.
- Affected: process/storage interruption in the commit/receipt window.
- Mounted inputs: all required facts are present.
- Missing input: none; transaction protocol is incomplete.
- Dependency: none.
- Smallest safe change: crash-recoverable transaction marker/receipt
  reconstruction or atomic persisted envelope.
- Certification: every interruption point, true concurrent retry, restart,
  screen visibility.
- Literature: not required.
- Claim impact: blocks reliable coaching-loop claim.
- TestFlight impact: blocks the next coaching-loop candidate.
- Confidence/verdict: high / CONTRADICTED.

### PC-P0-03 — final-session review exhausts the carrier

- Severity: P0.
- Production limitation: blocked evaluation precedes boundary continuation; a
  review on the last session leaves no planned successor.
- Entrypoint/persisted state: evaluator/application; blocked decision and
  exhausted carrier.
- Affected: recovery, pain, identity, or other review on a Microcycle's final
  planned workout.
- Mounted inputs: performed work; recovery/pain writers are not yet mounted,
  but migrated/replayed facts can reach this path.
- Missing input: a typed non-training review continuation/resolution contract.
- Dependency: factual review resolution must not invent training.
- Smallest safe change: persist a resolvable boundary work item and safe next
  state without treating review as successful.
- Certification: final-session review for every block reason, restart, and
  Home/Plan/Train.
- Literature: required only for any training prescription; not for transaction
  continuity.
- Claim impact: blocks continuous coach claim.
- TestFlight impact: blocks once review facts are mounted; already relevant to
  migrated evidence.
- Confidence/verdict: high / CONTRADICTED.

## P1

| ID | Exact production limitation / affected configurations | Mounted vs missing inputs | Dependency / smallest safe change | Independent certification | Literature | Claim / release effect | Confidence / verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PC-P1-01 | Train writes performance/completion only; recovery, pain, changed limitations/equipment, capacity, real missed sessions, layoff and later sport workload are unavailable to the evaluator. | Mounted: ledger performance. Missing: factual writers, corrections, freshness. | P0 review continuity; add versioned factual commands/repositories before policy. | correction, stale/conflict, restart, absence, privacy, review-only projection | No for capture; yes for thresholds | Blocks autoregulation claim; claim-bearing candidate only | high / UNREACHABLE |
| PC-P1-02 | `failedComparableExposureCount` groups exercise/session evidence without complete loading/method/role/target/substitution compatibility. | Mounted: exercise IDs, prescription/performance observations. Missing: versioned comparator and owner-derived freshness. | PC-P1-01 timestamps; add one fail-closed comparator. | same exercise/different role, method, target, substitute, gap, old data | limited review for compatibility/freshness window | Blocks safe progression/regression policy | high / UNSAFE |
| PC-P1-03 | Successful established exposures always maintain; repeated failure only recalibrates. | Mounted: target success/failure, sets/reps/load. Missing: approved increment/decrement eligibility. | PC-P1-02; add bounded numeric decision contract, keep Session Construction exact. | response pairs, units, increments, roles, phases, bounds, 12-week replay | required | Blocks intelligent/autoregulated claim | high / NOT PROVEN |
| PC-P1-04 | A missed planned session is not an event; partial workout is used as a proxy. | Mounted: partial performed work. Missing: scheduled absence, reason, layoff duration. | PC-P1-01/02/03; add factual miss then bounded reflow. | one/repeated miss, late completion, long layoff, restart | required for training response | Blocks missed-session coaching quality | high / UNREACHABLE |
| PC-P1-05 | Recovery/pain branches block but no writer or final-session resolution path exists. | Mounted: initial construction context only. Missing: current recovery/pain/limitation facts and resolution. | PC-P1-01 plus P0 boundary closure; begin review-only. | stale/conflict/missing, pain persistence, safe resolution, no mutation | required for dose response | Blocks recovery-adaptive claim; final review is P0 | high / UNREACHABLE |
| PC-P1-06 | `deloadEligible` is fixed false; transition uses horizon/success plus first approved edge. | Mounted: cycle count and completed performance. Missing: qualified fatigue/adaptation/deload evidence. | PC-P1-01–05; add versioned eligibility composed with existing successor graph. | ordinary/deload/transition, max horizon, construction failure, lineage, crash | required | Blocks longitudinal intelligent-coach claim | high / NOT PROVEN |
| PC-P1-07 | Substituted work is excluded safely, but compatible substitution/removal/reintroduction history is unsupported. | Mounted: substitution ID and exercise identity. Missing: approved compatibility/equivalence. | PC-P1-02 and limitation facts; add fail-closed history policy. | substitution variants, equipment, reintroduction, old data, no inherited loads | required for equivalence | Blocks substitution-learning claim, not recorder safety | high / PARTIALLY PROVEN |

Production entrypoints for the P1 set are
`recordCanonicalPerformedWork`, `evaluateCanonicalPostWorkoutProgress`,
`phaseOneDecisionDetails`, and `applyPhaseOneDecision`. Persisted state is the
ledger, evidence repository, decision/receipt, construction facts, and carrier.
Representative tests are the one-step/longitudinal matrix and identity,
unit/substitution, repeated-failure, recovery/pain, and boundary tests.

### PC-P1-01 — mounted athlete facts

No mounted post-workout writers own readiness, pain, limitation change,
capacity, actual missed session, layoff, equipment change, or later sport
workload. Direct repository injection cannot certify product behaviour.
Engineering collection/persistence is required; policy thresholds need later
evidence review. Verdict: UNREACHABLE.

### PC-P1-02 — prescription-compatible comparable history

Failure counts group by exercise/session but do not prove compatible loading
mode, method, role, target, freshness, or substitution status. This can
misqualify recalibration. Engineering identity contract first; freshness window
requires policy approval. Verdict: UNSAFE as a general comparator.

### PC-P1-03 — bounded numeric progression/regression

The schema forbids numeric adjustment. Normal/high responders maintain
indefinitely; repeated failure only removes calibration. Source-backed policy
and increment/bounds certification required. Verdict: NOT PROVEN.

### PC-P1-04 — missed-session and layoff operation

The matrix substitutes partial work for a missed planned session. No factual
absence/reflow policy exists. Event modelling is engineering; training response
needs literature/policy review. Verdict: UNREACHABLE.

### PC-P1-05 — recovery, pain, and limitation behaviour

Pure branches block, but writers and a route out of final-session review are
absent. Pain must remain review-only unless separately approved; recovery dose
policy needs external evidence. Verdict: UNREACHABLE.

### PC-P1-06 — deload and transition intelligence

`deloadEligible` is always false. Transitions use elapsed canonical horizon plus
success and first approved edge, not longitudinal adaptation/fatigue criteria.
Policy evidence required. Verdict: NOT PROVEN.

### PC-P1-07 — substitution history

Substituted performance cannot establish load, which is safe; removal,
reintroduction, and compatible substitution history have no longitudinal
policy. Identity engineering plus evidence-led equivalence policy required.
Verdict: PARTIALLY PROVEN safety only.

All P1 findings block an intelligent/autoregulated product claim. They block a
claim-bearing release candidate, but not an explicitly diagnostic internal
recording build after P0 closure.

## P2

| ID | Evidence / configuration / consequence | Smallest change / gate | Literature | Release effect | Confidence / verdict |
| --- | --- | --- | --- | --- | --- |
| PC-P2-01 | `recoveryEvidenceState` trusts caller `freshness`; future mounted recovery writers could label stale facts current. | derive freshness from observed time/cycle/policy; stale/restart tests | policy window review | dependency of PC-P1-05 | high / NOT PROVEN |
| PC-P2-02 | completion distinguishes partial sets, not real missed-session causes. | factual missed-session event; history/reflow tests | response policy only | later quality until PC-P1-04 | high / PARTIALLY PROVEN |
| PC-P2-03 | comparator records a whole new session atomically, so 648 additions cannot enumerate which internal demand fields differ from a prior comparable week. | add trace-only comparable structural diff without making it authority | no | explanation/audit quality | high / PARTIALLY PROVEN |
| PC-P2-04 | read model gives reason/explanation but no complete evidence/delta/resolution detail. | projection-only evidence and exact delta view | no | later UI quality | high / PARTIALLY PROVEN |

These are later quality gates except where they are dependencies of a selected
P1 policy.

## P3

| ID | Evidence / configuration | Direction | Literature | Release effect | Confidence / verdict |
| --- | --- | --- | --- | --- | --- |
| PC-P3-01 | internal reason terminology appears in diagnostics and reports | presentation-only language pass after truth contracts | no | later polish | high / PARTIALLY PROVEN |
| PC-P3-02 | current supported method set is intentionally bounded | add nothing until an evidence-led product need exists | required | does not block current correctness | high / NOT PROVEN as a need |

No new method is justified by this certification.

## Counts

- P0: 3.
- P1: 7.
- P2: 4.
- P3: 2.
