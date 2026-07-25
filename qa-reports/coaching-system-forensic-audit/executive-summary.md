# Coaching-system forensic audit — executive summary

## Scope and baseline

- Audited HEAD: `7834d96e383301e5bde8ae19873aef240ad9cb89`
- Protected repair baseline: `c2d1b5b3f3aef31683762115154075bfda712ca5`
- Change after the protected baseline: `7834d96 fix: repair onboarding programme creation integrity`
- Production router root: `app-production`
- Onboarding/state-integrity repair: present, mounted and test-covered
- Audit mode: read-only production audit plus isolated pure-function evidence generation
- Real or cloud user data touched: none

## Overall verdict

**CONTRADICTED as a complete autoregulated coaching system.**

The app has a strong canonical **initial planning and workout-execution system**. It constructs deterministic Macrocycle, Mesocycle, Microcycle and immutable Session Construction facts; persists them atomically; presents the same identities across Home, Plan and Train; records performed work transactionally; and fails unsupported methods closed.

It does **not** presently prove the defining longitudinal promise. Mounted production records completed work as evidence, then stops. The mounted Progress screen presents evidence and persisted decisions if they already exist, but does not evaluate evidence, produce a decision or apply a decision. Actual completion evidence also lacks the derived transition/deload facts expected by the pure v2 evaluator. Exact load adjustment is deliberately manual-review-only. Reconstruction miskeys established loads and omits required load evidence.

In plain language: the app can build and run a sound-looking first programme, but it does not currently demonstrate that months of performance, stalls, recovery or missed training intelligently change later prescriptions.

## Quantitative summary

| Measure | Result |
| --- | ---: |
| Decision-producing authority clusters inspected | 20 |
| Canonical/authoritative clusters | 17 |
| Unmounted longitudinal Progress cluster | 1 |
| Registered legacy/disconnected route clusters | 2 |
| Meaningful programming inputs audited | 30 |
| Inputs with a proven mounted material programming effect | 14 |
| Meaningful input utilisation | 46.7% |
| Longitudinal scenarios | 12 |
| Scenario constructions successful | 12/12 |
| Identical-run semantic determinism | 12/12 |
| Scenarios with a mounted future-prescription adaptation | 0/12 |
| Counterfactual pairs | 13 |

## Required verdicts

| Question | Verdict | Finding |
| --- | --- | --- |
| One production coaching authority? | PARTIALLY PROVEN | One canonical carrier owns the active plan, but two registered legacy programme/session routes remain and the longitudinal Progress authority is not mounted. |
| Does the full coaching loop close? | CONTRADICTED | Evidence is recorded; no mounted evaluation → decision → application chain follows. |
| Does completed performance materially change future prescriptions? | CONTRADICTED | No scenario changed future prescriptions from actual-shaped completion/performance evidence. |
| Is progression assertive and bounded? | NOT PROVEN | Exact targets and stop rules are bounded, but load progression is manual-review-only and later rep/volume progression is unmounted. |
| Is fatigue/recovery genuinely used? | PARTIALLY PROVEN | It changes initial dose; later recovery policies are not reached from mounted evidence. |
| Are methods contextual? | PROVEN | Supported methods are Mesocycle-, experience-, exercise-, fatigue- and evidence-bounded and deterministic. |
| Are macro/meso/micro concepts operational? | PARTIALLY PROVEN | They operationally construct the first plan; longitudinal phase advancement is unmounted. |
| Does user choice affect outcomes appropriately? | PARTIALLY PROVEN | Goal, schedule, duration and supported frameworks matter; equipment is silently full-gym and limitations/preferences are not retained through reconstruction. |
| Is every exact prescription traceable? | PROVEN for initial snapshots | Initial v3 slots retain policy, reason, target, rest, method, load-state and stop-rule provenance. Later adaptations do not exist to trace. |
| Are Home, Plan, Train and Progress consistent? | PARTIALLY PROVEN | They share the canonical carrier/ledger; Progress is consistent as presentation but not an active coaching loop. |
| Does the app learn longitudinally? | CONTRADICTED | Evidence accumulates, but no mounted future-prescription learning occurs. |
| Can it be called science-backed and autoregulated? | CONTRADICTED | “Source-informed initial programming” is supportable; “autoregulated coaching” is not. |

## Five most serious defects

1. **P0 — The mounted longitudinal loop is open.** Completion evidence never reaches evaluation, persisted decision and future Session Construction.
2. **P0 — Established-load reconstruction is invalid.** Evidence is keyed by slot ID while Session Construction resolves by exercise ID, and required load evidence is omitted.
3. **P0 — Actual evidence cannot derive transition/deload intent.** The evaluator expects manually authored booleans not created by the completion path.
4. **P1 — Recovery, stalls, missed sessions and rep drop-off are mostly policy/test capabilities rather than mounted adaptation.**
5. **P1 — Limitations, learned preferences and history are erased by reconstruction facts; onboarding also silently assumes full-gym equipment.**

## Five strongest proven capabilities

1. Deterministic canonical initial planning across supported goal/experience/frequency/framework combinations.
2. Immutable v3 exact prescriptions whose exercises, sets, reps, rests, method, duration and load state share one Session Construction source.
3. Atomic onboarding creation and one authoritative active-plan carrier across Home, Plan and Train.
4. Transactional/idempotent recorded-session lifecycle, including protected discard and immutable performed-work evidence.
5. Conservative, fail-closed method governance with executable antagonist-superset and bounded row-style rest-pause structures.

## Release recommendation

**Do not market or release this version as an intelligent, learning or autoregulated coach.** The current initial-plan and workout-logging experience can be described as deterministic and source-informed, but the product’s core adaptive promise is release-blocked until the mounted evidence-to-next-prescription loop and construction-fact defects are repaired and longitudinally certified.

No production remediation was implemented in this audit.

## Verification

- Isolated audit runner: 12/12 constructions, deterministic duplicate run, 13 counterfactual pairs.
- Focused coaching/planning/method/persistence suite: 14 files, 76 tests passed.
- Full automated suite: 361 files, 2,150 tests passed; 0 failed.
- TypeScript: passed.
- Production Expo public config: passed; `app-production`, version `1.0.14`, bundle `com.aaronparry.adaptivestrengthcoach`.
- Production web export: passed.
- Production payload scan: 27 files scanned, no findings.
- Production files/tests/config changed by audit: none.
