# Product mission and scope decision

Decision date: 2026-08-08
Authority: subsequent product-owner decision, made after baseline commit `411d9f6` and supplied-source supplement `ea0e68c`. It narrows future product direction; it does not rewrite what the original audit found.

## Mission

Adaptive Strength Coach aims to become the best adaptive training application for **hypertrophy, general and lift-specific strength, and powerbuilding**. It helps people become bigger and stronger through coherent long-term programming, individual adaptation, excellent workout execution, trustworthy persistence and premium cross-platform presentation. This is a direction, not a claim that the product is already best or scientifically validated.

## Users and coaching lanes

Primary users are recreational through advanced resistance-trained people pursuing muscular development, strength, combined strength/hypertrophy, long-term progression, weak-point improvement, plateau resolution, or powerlifting-style strength expression/testing while working within schedule, equipment and session-duration constraints.

The three active coaching lanes are:

1. **Hypertrophy:** muscle-development programming, specialisation, exercise selection, fatigue-aware volume and progression.
2. **Strength:** general strength plus lift-specific development and testing, including squat/bench/deadlift emphasis where appropriate.
3. **Powerbuilding:** deliberate sequencing and coexistence of hypertrophy and strength priorities without pretending every session can maximise both.

Supported secondary contexts are limited equipment, short sessions, high/low availability, return after a layoff, bodyweight/assisted exercise, older trainees and dieting phases. They modify one of the three lanes; they are not additional product identities.

## Explicit exclusions

The active coaching roadmap excludes sport-specific S&C; field/court/combat preparation; speed/agility; conditioning generation; endurance or concurrent-sport programming; strongman-sport preparation; Olympic-weightlifting performance; generic athletic development; calorie tracking; meal planning; dieting protocols; weight-loss challenges; fat-burning workouts; metabolic conditioning for expenditure; and drug-use guidance.

Historical sport material remains attributable research. It may be classified as historical context, transferable general principle, architectural extensibility, future-product research, inactive roadmap item or unsuitable. It may not keep a mixed coaching authority alive inside this product.

## Fat-loss boundary

Fat loss is not a primary goal. The athlete may record an energy-deficit context so the app can explain potentially reduced recovery/progression capacity, use evidence-backed conservative training heuristics, and prioritize muscle/strength retention. The app must not infer muscular progress or programme effectiveness from bodyweight change alone. Nutrition remains outside scope except for carefully bounded training context and referral to qualified help.

## Injury and medical boundary

The app may collect limitations and pain/discomfort signals, stop or substitute unsafe work, avoid known aggravators, and recommend qualified assessment. It does not diagnose, rehabilitate, clear return to sport, prescribe treatment, or override clinician instructions. Acute or concerning symptoms trigger a safety/referral boundary, not an adaptive training experiment.

## Product implications

| Area | Decision |
|---|---|
| Onboarding | Offer only hypertrophy, strength and powerbuilding as coaching goals. Collect training age, available days/time/equipment, relevant lift history, exercise preferences, limitations, schedule and optional deficit context. Do not ask users to select a sport-development lane. |
| Athlete inputs | Facts need provenance, confidence, recency and correction. Bodyweight is contextual/trend data, never a complete success score. Remove cardio/conditioning preference from active prescription authority unless retained only as non-prescriptive recovery context. |
| Programme construction | Optimize muscle/lift exposure, recoverable volume, specificity, fatigue distribution, adherence and constraints. Sport drills, sprint programming and event-specific strongman/weightlifting plans are ineligible. Strongman-derived carries or trunk/grip exercises may be neutral accessories when independently justified. |
| Evidence intake | Every source must resolve a decision in the three lanes or their safety/adherence context. Sport-specific prescriptions are out of scope; transferable principles require abstraction and modern corroboration. Coaching systems define methods but do not scientifically validate them. |
| Competitor benchmark | Primary comparators are evidence-aware bodybuilding, strength, powerlifting and powerbuilding products. Sport-performance and calorie-tracking products are not mission benchmarks. Compare private behaviour only with lawful access; marketing claims remain marketing evidence. |
| Architecture | Reuse authentication, persistence, execution, evidence-registry and UI infrastructure across possible future products, but keep this app's coaching policies, athlete model and roadmap mission-specific. No PDF/OCR corpus enters runtime. |
| Roadmap | Reliability and truth precede coaching expansion. Evidence collection attaches to specific policy decisions. Advanced methods wait for purpose, eligibility, dose/progression, stop and exit contracts. |

## Future separate-product boundary

A future sport-specific application may share non-coaching infrastructure, design systems and evidence-governance structures. It requires a separate mission, policy library, athlete model extensions, validation plan and coaching authority. Adaptive Strength Coach must not carry dormant sport-specific rules “just in case.”

## Authoritative priority order

1. Candidate 111 retained-device resolution.
2. Physical Android and iOS critical-journey certification.
3. Persistence, account isolation, backup, restore and remote-readback truth.
4. Native performance baselines and budgets.
5. Cross-platform workout reliability and execution speed.
6. Coaching-authority consolidation and athlete-model development.
7. Evidence-registry implementation.
8. Programme-quality expansion for hypertrophy, strength and powerbuilding.
9. Premium cross-platform UI and explanation improvements.
10. Controlled advanced-method expansion.
11. Experiments and optimisation.

## Decisions unchanged

Candidate 111 remains a separate protected release lane. Local-first execution, single deterministic coaching authority, immutable performed history, explicit sync truth, cross-platform parity, medical boundaries, claim governance, rights separation and no automatic promotion of source claims remain unchanged. The first implementation slice remains reliability certification, not coaching expansion.
