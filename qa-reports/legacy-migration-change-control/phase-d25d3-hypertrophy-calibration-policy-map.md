# D2.5D3 hypertrophy-calibration policy map

## Locked identities

- Policy: `intermediate_upper_lower_hypertrophy_calibration_v1`
- Guidance policy version: `hypertrophy_calibration_guidance_v1`
- Construction policy version: `hypertrophy_calibration_construction_v1`
- Template family: `upper_lower_ab_v1`
- Certification: `hypertrophy_calibration_upper_lower_certification_v1`

The policy applies only to intermediate, four-day, full-gym Upper/Lower `hypertrophy_calibration` normal-calibration microcycles. It establishes repeatable exercise-selection, initial-load, set-tolerance, drop-off, shutdown, role-completion and exact-target evidence. It is neutral about continue/deload/advance and does not evaluate readiness.

## Slot map

| Session / ordinal | Base equivalent | Treatment | Target / purpose | Base → calibration sets | Requirement | Stability / substitution | Evidence purpose / fatigue rationale | Certification rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Upper-A 01 | primary horizontal press | retained, reduced | horizontal press / primary compound | 3–4 → 2–3 | required | preserve target and movement; repeatable setup | load, execution and drop-off with limited pressing fatigue | present and below base |
| Upper-A 02 | primary horizontal pull | retained, reduced | horizontal pull / primary compound | 3–4 → 2–3 | required | same | pulling execution/load evidence | present and below base |
| Upper-A 03 | secondary vertical press | retained, reduced | vertical press / secondary compound | 2–3 → 1–2 | required | same | movement breadth without base fatigue | present |
| Upper-A 04 | secondary vertical pull | retained, reduced | vertical pull / secondary compound | 2–3 → 1–2 | required | same | movement breadth and exercise fit | present |
| Upper-A 05 | lateral deltoid | retained, reduced | lateral deltoid / isolation | 2–3 → 1–2 | required | preserve target | direct tolerance and selection fit | present |
| Upper-A 06–07 | arms | omitted | biceps/triceps accessory | 2–3 → omitted | absent | no calibration evidence need beyond compounds | avoids accessory density | absent deterministically |
| Upper-B 01–05 | B priority compounds + deltoid | retained, reduced | vertical pull/press then horizontal pull/press + lateral delt | base → 2–3/2–3/1–2/1–2/1–2 | required | same | A/B breadth with distinct priority | distinct first movement |
| Lower-A 01 | knee dominant | retained, reduced | knee dominant / primary compound | 3–4 → 2–3 | required | preserve target and movement | loading, tolerance, lower execution | present |
| Lower-A 02 | hip hinge | retained, reduced | hip hinge / primary compound | 2–3 → 2–3 | required | same | hinge load/drop-off evidence, no extra hinge | present |
| Lower-A 03 | unilateral knee dominant | omitted | — | 2–3 → omitted | absent | not required for first tolerance pass | reduces soreness/novelty | absent |
| Lower-A 04–05 | knee flexion / calf | retained, reduced | hamstrings / calves isolation | 2–3 → 1–2 each | required | preserve target | direct movement/tolerance coverage | present |
| Lower-A 06 | trunk | omitted | — | 2–3 → omitted | absent | bracing is not direct trunk calibration | avoids excess density | absent |
| Lower-B 01 | hip hinge | retained, reduced | hip hinge / primary compound | 3–4 → 2–3 | required | same | B hinge priority, one heavy hinge only | first slot differs from A |
| Lower-B 02 | knee dominant | retained, reduced | knee dominant / secondary compound | 2–3 → 2–3 | required | same | repeated complementary quadriceps evidence without adding posterior-chain fatigue | present |
| Lower-B 03 | quad isolation | omitted | — | 2–3 → omitted | absent | no material early evidence beyond compounds | no redundant quad fatigue |
| Lower-B 04–05 | knee flexion / calf | retained, reduced | hamstrings / calves isolation | 2–3 → 1–2 each | required | preserve target | direct coverage and tolerance | present |
| Lower-B 06 | trunk | omitted | — | 2–3 → omitted | absent | same as A | absent |

## Totals and guards

Calibration totals: Upper-A **7–12**, Lower-A **6–10**, Upper-B **7–12**, Lower-B **6–10**; total **26–44**, below base **58–84**. The lower bound preserves repeated required jobs; omitted arms, trunk, unilateral quad and B quad isolation remove non-essential early evidence burden. A certification must reject base totals, missing press/pull/knee/hinge/knee-flexion/calf coverage, indistinguishable A/B priority, unstable substitution, or any optional accessory reintroduction.

No selected exercise, slot ID, generated setting, exact target, block, persistence, adjustment or successor logic is part of this map.

## D2.5D3A Lower-B guidance reconciliation

The corrected numeric reducer exposed a contradiction in the original Lower-B row. Its actual slot arithmetic was: primary hip hinge **2–3** + knee-dominant complement **1–2** + knee flexion **1–2** + calf **1–2** = **5–9**, not the locked **6–10**. The four-session target of **26–44** therefore could not be established from the real policy output.

| Option | Assessment against calibration evidence, fatigue and structure | Decision |
| --- | --- | --- |
| A. Increase the existing knee-dominant complement from 1–2 to 2–3 | Produces **6–10** without adding a job. A second and third conservative knee-dominant set provide repeatable quadriceps execution/load evidence, preserve the hinge-first B priority, remain below base Lower-B guidance, and add no posterior-chain or glute-accessory fatigue. Lower-B remains distinct from knee-led Lower-A. | **Selected** |
| B. Increase knee flexion or calves | Would repair arithmetic but preferentially increases isolation exposure while leaving the complementary knee-dominant calibration job underdosed. It weakens the intended quadriceps evidence balance without a better readiness benefit. | Rejected |
| C. Revise the Lower-B target to 5–9 | Would make the complete total **25–43**, requiring changes to the approved calibration lower bound and its certification guards. The 6–10 target was structurally intended, not merely a typed total. | Rejected |
| D. Add a slot | Would create artificial density and violate the locked omission of trunk, unilateral quadriceps, quadriceps isolation and glute accessories. | Rejected |

The approved reconciliation changes only Lower-B ordinal `02-knee-dominant` from **1–2** to **2–3**. It preserves one-slot/one-selected-exercise semantics, required movement coverage, stable substitution metadata, session-duration plausibility and the conservative relationship to base Lower-B (**13–19**). The resulting Lower-B total is **6–10** and the complete calibration total is **26–44**. Certification remains pending; the mapping registry remains unchanged until certification passes.
