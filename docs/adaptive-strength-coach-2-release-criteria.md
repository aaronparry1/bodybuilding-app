# Adaptive Strength Coach 2.0 Release Criteria

Status: Master production roadmap.

Purpose: This document defines what must be objectively true before Adaptive Strength Coach V2 becomes the default coaching system.

This is not a backlog.

This is the release gate.

Every item must be objectively satisfied before release. No feature is added because it is clever. Every feature must improve Athlete Lifetime Progress.

## Mission

Adaptive Strength Coach does not optimise exercises, reps, load or sets.

Adaptive Strength Coach optimises the correct adaptation.

Exercises, reps, load and sets are tools used to deliver the required stimulus.

## Release Principle

The coach should make the same decisions that an excellent evidence-based strength coach would make.

The coach must be:

- evidence-based
- adaptive where adaptation improves outcomes
- deterministic
- explainable
- fast
- objective-first

V1 remains the production default until every release gate in this document is satisfied.

## Release Pillar 1: Adaptive Stimulus Planning

Adaptive Stimulus Planning must begin with the adaptation ASC wants to create, not with exercise names.

Must satisfy:

- Understand macro objective.
- Understand mesocycle objective.
- Understand micro objective.
- Produce required stimuli, not exercises.
- Separate required, secondary and optional stimuli.
- Identify stimuli to avoid when recovery, safety or session context requires it.

Objective release evidence:

- Coaching Review Suite sessions show clear stimulus intent before exercise selection.
- Every generated session can answer: "Why this stimulus today?"
- No workout starts from arbitrary exercise lists.

## Release Pillar 2: Adaptive Stimulus Delivery

Adaptive Stimulus Delivery must choose the best delivery method for the required stimulus.

It must not simply choose the lowest-fatigue option.

It must balance:

- specificity
- target stimulus
- fatigue cost
- recovery state
- movement quality
- safety and limitations
- available equipment
- long-term progression reliability

Must support:

- exercise families
- acceptable alternatives
- limitations
- commercial gym equipment assumptions
- future expansion

Objective release evidence:

- Strength anchors are preserved when specificity matters.
- Hypertrophy delivery prioritises target stimulus quality.
- Athletic delivery protects power and movement quality.
- Get Lean delivery preserves performance while controlling fatigue.
- Exercise swaps always have a coaching reason.
- No swap is justified by random variety.

## Release Pillar 3: Adaptive Rep Prescription

Adaptive Rep Prescription must produce evidence-based rep prescriptions, not static ranges.

Must support:

- Productive sets
- Calibration sets
- Verification sets
- Recovery sets
- Performance sets

Must use:

- fixed reps
- top-range checks
- capped AMRAP
- recovery prescriptions
- duration prescriptions where appropriate

Objective release evidence:

- Rep prescription follows goal, phase, exercise category and set objective.
- Deadlift prescriptions include stricter fatigue and AMRAP safeguards.
- Power prescriptions stay low-rep, high-quality and low-fatigue.
- Duration exercises are not represented as fake reps.
- AMRAP is used for evidence gathering, not as an every-session default.

## Release Pillar 4: Adaptive Load Prescription

Adaptive Load Prescription must select the load strategy that best serves the intended adaptation.

Must select:

- working load
- progression load
- recovery load
- calibration load
- power-quality load
- bodyweight or duration-only loading where appropriate

Must respect:

- load ownership
- confidence
- fatigue
- recovery
- safety
- available jumps
- exercise-specific risk

Objective release evidence:

- Load progression only occurs when earned.
- Introduced or unstable loads are stabilised before further progression.
- Deadlift loading is more conservative than bench or many machine/accessory lifts.
- Large equipment jumps do not force progression.
- Load does not chase progression blindly.

## Release Pillar 5: Adaptive Set Allocation

Adaptive Set Allocation must answer:

"Has enough productive stimulus been achieved?"

It must not merely ask:

"Have enough sets been completed?"

Must understand:

- rep intent
- load intent
- stimulus status
- fatigue cost
- shutdown evidence
- productive fatigue
- target-range success

Objective release evidence:

- It never recommends stopping before the minimum prescribed working sets.
- It never exceeds the prescribed maximum.
- It can stop at the minimum when stimulus is achieved.
- It can recommend one more set when marginal value remains high.
- It does not treat high reps as automatic completion if the load may be underloaded.
- It remains advisory until the full V2 pipeline is approved.

## Release Pillar 6: Adaptive Progression

Adaptive Progression must progress only when earned.

Must support:

- load progression
- volume progression
- rep progression
- consolidation
- verification
- calibration

Progression is not mandatory every week.

Objective release evidence:

- Single positive signals do not trigger aggressive progression.
- Repeated high-quality evidence can permit progression.
- Missed minimum target ranges reduce or hold appropriately.
- Productive heavier-load fatigue inside range is not punished.
- Progression decisions respect load ownership and athlete confidence.
- The system can hold steady without treating that as failure.

## Release Pillar 7: Exercise Lifecycle

Every exercise exists in one lifecycle state:

1. Learn
2. Build
3. Own
4. Rotate
5. Return

Rotation occurs because of:

- adaptation
- plateau
- fatigue
- specificity
- recovery
- safety or joint irritation

Rotation must never occur for random variety.

Default exposure limits:

| Athlete Level | Maximum Consecutive Exposures |
| --- | ---: |
| Beginner | 6 |
| Intermediate | 3 |
| Advanced | 1-2 |

The coach may continue longer only if:

- progression continues
- stimulus remains high
- fatigue remains acceptable
- no plateau is present
- no safety concern is present

The coach may rotate earlier if:

- plateau appears
- fatigue cost rises
- joint irritation appears
- stimulus return becomes poor
- specificity needs change

Objective release evidence:

- Each programmed exercise has a lifecycle state.
- Rotation decisions include a reason.
- Returning to previous exercises is supported.
- Advanced users are not forced through stale repeated exposures.
- Beginners are not over-rotated before learning and ownership develop.

## Release Pillar 8: Recovery

Recovery must distinguish:

- consolidation
- local recovery
- systemic recovery
- deload

Recovery decisions must be based primarily on objective evidence, not questionnaires.

Objective release evidence:

- Recovery weeks require systemic evidence.
- One bad lift does not trigger whole-programme recovery.
- One bad session does not trigger whole-programme recovery without severe safety context.
- Extra sessions, cardio, capacity, warm-ups and prep do not falsely trigger recovery windows.
- Recovery interventions preserve momentum and confidence when possible.

## Release Pillar 9: Coaching Quality

Every generated workout must answer:

- Why this stimulus?
- Why this exercise?
- Why these reps?
- Why this load?
- Why these sets?

Every answer must be explainable.

Objective release evidence:

- Coaching Review Suite exposes every decision in a reviewable form.
- Every benchmark session has a clear coaching rationale.
- No session contains obvious junk volume.
- No session contains unnecessary fatigue.
- No session contains repeated exercise bias without a documented reason.
- No adaptive decision is justified by vague intelligence or black-box behaviour.

## Release Pillar 10: Performance

Workout generation must remain:

- instant
- local
- deterministic
- explainable
- rollback-safe

It must not require:

- cloud computation
- waiting screens
- heavy runtime computation
- large storage writes
- full-history scans during live workout logging

Objective release evidence:

- Runtime impact is negligible on supported devices.
- No network request is required for V2 coaching decisions.
- V2 can be disabled by feature flag or rollback path.
- V1 remains available until V2 is approved as default.

## Coaching Review KPI

The Coaching Review Suite is the release gate.

Every benchmark session must receive an Aaron score.

Release target:

- Average Aaron score: at least 9.5 / 10
- Critical coaching errors: 0
- Unsafe programming decisions: 0
- Obvious junk volume: 0
- Unnecessary fatigue: 0
- Unjustified repeated exercise bias: 0

Benchmark Sessions are not Gold Standard Sessions until Aaron approves them.

## Ship Criteria

V2 becomes default only when every item below is satisfied:

- [ ] Coaching Review average is at least 9.5 / 10.
- [ ] Strength sessions approved.
- [ ] Hypertrophy sessions approved.
- [ ] Build Muscle + Strength sessions approved.
- [ ] Athletic Performance sessions approved.
- [ ] Get Lean sessions approved.
- [ ] Recovery logic approved.
- [ ] Exercise lifecycle approved.
- [ ] Progression approved.
- [ ] Performance verified.
- [ ] Runtime impact negligible.
- [ ] Rollback path confirmed.

Until then:

- V1 remains production default.
- V2 remains under active coaching development.
- V2 may be exposed only through QA/dev flags or explicit review harnesses.

## Release Gate Summary

| Pillar | Required Proof Before Release | Release Status |
| --- | --- | --- |
| Adaptive Stimulus Planning | Required stimuli are produced before exercises. | Not approved |
| Adaptive Stimulus Delivery | Delivery balances specificity, stimulus, fatigue, recovery and quality. | Not approved |
| Adaptive Rep Prescription | Rep intent is evidence-based and objective-specific. | Not approved |
| Adaptive Load Prescription | Load respects ownership, confidence, fatigue, recovery and jumps. | Not approved |
| Adaptive Set Allocation | Set guidance reflects marginal stimulus value. | Not approved |
| Adaptive Progression | Progression is earned and supports long-term adaptation. | Not approved |
| Exercise Lifecycle | Learn, Build, Own, Rotate and Return are explicitly supported. | Not approved |
| Recovery | Recovery decisions are objective-first and systemic when systemic. | Not approved |
| Coaching Quality | Every decision is explainable and reviewable. | Not approved |
| Performance | Runtime is instant, local, deterministic and rollback-safe. | Not approved |

## Final Rule

Every future sprint must improve one of these pillars.

No new architectural documents.

No new frameworks.

Only better coaching.
