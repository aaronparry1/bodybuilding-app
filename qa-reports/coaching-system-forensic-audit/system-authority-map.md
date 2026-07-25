# System authority map

## Counting method

An authority cluster is counted when it can author, alter or present one of the requested coaching decisions. Clusters are grouped by an owning contract rather than every helper function. Twenty clusters were inspected:

- 17 canonical production-reachable authorities;
- 1 canonical longitudinal Progress cluster that exists but has no mounted caller;
- 2 registered legacy/disconnected programme-route clusters.

The two legacy route clusters cannot overwrite the canonical carrier, so precedence is technically fail-closed. They remain competing product surfaces because they present programme/session creation from a separate `programmeRepository`.

## Authority table

| # | Decision | Owner and exact source | Mounted caller | Inputs | Output/persistence | Restart continuity | Conflict |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | Onboarding commit | `canonical-onboarding-setup.ts:completeCanonicalOnboardingSetup` | production onboarding | validated command/settings | atomic carrier + settings | yes | none after repair |
| 2 | Goal/horizon | `macrocycle-engine.ts:createMacrocycle` | canonical construction | goal, experience, target date | MacrocycleSpec in carrier | yes | legacy annual planner is unmounted |
| 3 | Initial phase | `mesocycle-library.ts:selectMesocycles` | construction line 32 | engine, experience | first eligible Mesocycle | yes | always first eligible |
| 4 | Phase policy | `mesocycle-prescription-policy.ts:resolveMesocyclePrescriptionPolicy` | construction line 34 | Mesocycle, goal | lane/load/method/fatigue/progression bounds | snapshot provenance | none in canonical path |
| 5 | Framework compatibility | `programme-framework-rules.ts` | onboarding probe/construction | goal, days, preference, phase | supported/resolved framework | carrier | UI only shows executable probes |
| 6 | Frequency/order/roles | `microcycle-scheduler.ts:createMicrocycle` | construction | days, split, Mesocycle | roles, day offsets, stress/recovery pattern | carrier | missed-session reflow unmounted |
| 7 | Volume allocation | `canonical-microcycle-volume-allocator.ts` | construction | phase, experience, frequency, initial recovery/work capacity, duration | exact regional/session set allocation | snapshots | later volume evaluator unmounted |
| 8 | Exercise selection | `canonical-session-construction-pipeline.ts` plus suitability selector | construction | slot, catalogue, equipment, limitations, preferences | exact exercise/order | immutable snapshot | reconstruction loses limitations/preferences |
| 9 | Exact sets/reps | `canonical-exact-target-policy.ts` | Session Construction | phase/lane/role/method/evidence | exact per-set targets | immutable snapshot | no mounted future progression |
| 10 | Load state/value | `canonical-load-prescription.ts` | Session Construction | loading mode, established load and evidence | established/calibration/autoregulated/bodyweight/unavailable | immutable snapshot | reconstruction is defective |
| 11 | Rest | `canonical-prescription-components.ts` and method policy | Session Construction | phase/lane/role/method | exact seconds and execution semantics | immutable snapshot | none |
| 12 | Method | `canonical-training-method-policy.ts` | Session Construction | Mesocycle permission, experience, exercise, role, load state, recovery | supported method or fail-closed straight-set fallback | snapshot + performed evidence | unsupported methods rejected |
| 13 | Stop/progression component | `canonical-prescription-components.ts` | Session Construction | Mesocycle drop-off/progression policy | exact rule text/threshold/action | immutable snapshot | Train does not derive future intervention |
| 14 | Session duration | `canonical-session-duration.ts` | construction/Home | actual slots, rests, method structures, setup allowances | exact estimated minutes | snapshot | fail closed if over user limit |
| 15 | Conditioning | `canonical-cardio-prescription.ts` | construction | goal, preference, experience, lifting days | bounded cardio/capacity sessions | carrier | later adherence response unmounted |
| 16 | Active/completed state | `canonical-recorded-session-application.ts` and ledger | Train | canonical identities, operation/version, performed work | transactional lifecycle/events/evidence | yes | CAS/idempotency protected |
| 17 | Extra session | `canonical-extra-session.ts` | production extra-session route | factual focus/time/current plan | canonical extra snapshot/recorded session | ledger | does not consume planned session |
| 18 | Progress evidence/evaluation/decision/application | evidence repo, evaluator, producer, `canonicalActivePlanState.applyProgressDecision` | evidence writer mounted; evaluator/producer/application unmounted | ledger evidence, policy, cycle identity | bounded decision and regenerated future snapshots | supported in code | **open loop** |
| 19 | Legacy programme builder | `app/(protected)/programmes/builder.tsx` | registered/deep-linkable route | legacy draft inputs | `programmeRepository` preview/draft | separate | cannot activate canonical plan |
| 20 | Legacy session builder | `app/(protected)/programmes/session.tsx` → `session-prep.tsx` | registered/deep-linkable route | legacy custom programme/day | legacy repository and navigation | separate | presents “Start Session” without canonical session identity |

## Proven precedence

Within canonical construction, precedence is:

1. safety/typed limitation;
2. event/deadline;
3. goal and phase;
4. initial recovery/fatigue context;
5. equipment;
6. time/frequency availability;
7. framework preference;
8. exercise preference;
9. variety.

For later coaching, precedence cannot be proven in mounted production because no decision is produced.

## Cross-screen authority

- Home: canonical carrier/read model and ledger.
- Plan: same canonical carrier/read model.
- Train: immutable session snapshot plus recorded-session ledger.
- Progress: same carrier/ledger/evidence, but presentation-only.

This produces strong current-state consistency. It does not prove future adaptation.
