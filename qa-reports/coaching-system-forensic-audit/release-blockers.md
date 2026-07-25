# Release blockers and finding register

## Counts

| Priority | Count |
| --- | ---: |
| P0 | 3 |
| P1 | 5 |
| P2 | 5 |
| P3 | 3 |

## P0 — release blockers

1. **Mounted coaching loop does not close.** Evidence is retained but no evaluation/decision/application is invoked.
2. **Established-load reconstruction is invalid.** Slot-keyed values and missing load evidence cannot establish future exercise loads.
3. **Actual evidence cannot derive transition/deload intent.** The evaluator expects facts the mounted writer never produces.

## P1 — required for a credible coaching system

1. Limitations, preferences and history are erased during reconstruction.
2. Equipment is silently full-gym in onboarding.
3. Recovery, stalls, missed sessions and drop-off have no mounted future adaptation.
4. Exercise substitution is schema-only in the mounted Train experience.
5. Event/taper/peak phases are not reached longitudinally.

## P2 — quality and breadth

1. Event type is collected but not preserved as an independent canonical planning fact.
2. Method exit/progression depends on the missing phase loop.
3. Adaptation explanations are absent because decisions are absent.
4. Registered legacy programme/session routes create confusing parallel product surfaces.
5. Applied Strongman source PDF is locally corrupt and cannot support evidence claims.

## P3 — later improvements

1. Broader preference capture after canonical retention is fixed.
2. Body-metric context, with no unsupported fat-loss inference.
3. Additional training methods only after longitudinal authority is certified.

## Complete finding metadata

| ID / severity | Evidence and production path | Affected / confidence | Consequence | Recommended direction | Code change | Evidence-blocked |
| --- | --- | --- | --- | --- | --- | --- |
| F01 P0 | Mounted Train writes evidence; mounted Progress only presents it | All users / high | No future adaptation | Mount validated evaluation/decision/application | yes | no |
| F02 P0 | `canonical-construction-facts.ts:19` versus exercise/evidence-keyed load resolver | Calibration users / high | Load never becomes established safely | Versioned exercise-scoped calibration facts | yes | no |
| F03 P0 | Evaluator lines 37–38 expect flags absent from evidence writer lines 65/95 | All users / high | Transitions/deloads cannot be derived | Derive decisions from factual evidence | yes | no |
| F04 P1 | Reconstruction returns empty limitations/history and no preferences | Constrained/long-lived users / high | Future regeneration forgets facts | Retain/resolve versioned facts | yes | no |
| F05 P1 | Onboarding hardcodes all equipment | Limited-equipment users / high | Unavailable exercises may be prescribed | Collect factual equipment | yes | no |
| F06 P1 | Pure recovery/stall/missed/drop-off policies lack mounted callers | Long-lived users / high | Static prescriptions despite evidence | Integrate bounded Progress interventions | yes | no |
| F07 P1 | Train has no substitution command/UI though schema supports it | Users needing swaps / high | Substitution and learned preference are unavailable | Add canonical suitability-preserving authoring | yes | no |
| F08 P1 | Phase specs exist; construction selects `[0]`; no mounted transition | Event/strength users / high | Taper/expression pathway never becomes prescribed | Activate approved successor chain | yes | no |
| F09 P2 | Event type absent from canonical command | Event users / high | Question may be theatrical/redundant | Preserve only if it changes Macrocycle policy | maybe | no |
| F10 P2 | Method exit relies on missing phase/adaptation loop | Advanced-method users / high | Method can remain static | Close general loop before adding method logic | yes | no |
| F11 P2 | No later decision means no reason projection | All adapting users / high | Coaching changes cannot be explained because none exist | Persist and project reason codes | yes | no |
| F12 P2 | Registered legacy builder/session routes use `programmeRepository` | Deep-link users / medium-high | Confusing parallel product surface | Prove callers then isolate/remove | yes | caller evidence partial |
| F13 P2 | Strongman PDF has invalid xref/page tree | Evidence review / high | Claims from that source cannot be checked | Replace with verified source copy | no production code | yes |
| F14 P3 | Preferences are narrow and not collected | Preference-sensitive users / high | Less useful individualisation | Add only after retention is correct | yes | no |
| F15 P3 | Body metrics are evidence/presentation only | Body-composition users / high | No unsupported coaching claim, limited context | Optional future context with explicit bounds | maybe | policy evidence needed |
| F16 P3 | Unsupported method breadth intentionally fails closed | Method-seeking users / high | Fewer features, safer authority | Keep closed until exact contracts exist | future | source/policy approval needed |

## Marketing claims that would be misleading today

- “Learns from every workout.”
- “Automatically progresses your weights.”
- “Autoregulates your training from readiness and recovery.”
- “Changes phases when your performance shows you are ready.”
- “Adapts around missed sessions and stalls.”
- “Builds around your equipment and limitations” without adding those intake paths.
- “Full intelligent coach in your pocket.”

Supportable wording:

- “Creates deterministic, goal- and schedule-specific training plans.”
- “Prescribes exact exercises, sets, reps, rest and supported methods.”
- “Records completed training and presents conservative progress history.”
