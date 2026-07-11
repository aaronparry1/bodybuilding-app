# Coaching Decision Register v1

Status: permanent design document.  
Project: Adaptive Strength Coach.  
Date: 2026-06-30.

This document is the constitutional register for every coaching decision made by Adaptive Strength Coach.

It sits below the Adaptive Strength Coach Charter and above implementation, algorithms, UI, progression systems, Adaptive Stress Allocation, V2 production modules, and future AI systems.

After this document is adopted:

- no new adaptive feature may be built without being added to this register
- every production coaching module must reference this register
- every future adaptive algorithm must justify why adaptation improves coaching
- every adaptive decision must identify objective evidence, constraints, and confidence

If a coaching feature cannot explain its decision here, it is not ready for production.

## Governing Rule

Adaptive Strength Coach does not adapt because adaptation sounds intelligent.

Adaptive Strength Coach adapts only when:

1. athlete-to-athlete variability is meaningful
2. objective evidence is available or can be gathered
3. adaptation improves expected long-term progress
4. safety and scientific boundaries remain intact
5. the decision aligns with the Charter

When evidence is weak, ASC should collect evidence, hold, or choose the smaller intervention.

When objective evidence exists, subjective evidence must not dominate it.

Safety evidence is the exception: pain, worsening symptoms, dizziness, unusual systemic symptoms, or explicit unsafe-training reports may override otherwise positive performance evidence.

## Evidence Level Key

| Level | Meaning | Use |
| --- | --- | --- |
| A | Strong evidence or major consensus | Sets hard defaults and public-safe boundaries. |
| B | Moderate evidence plus strong coaching consensus | Supports adaptive rules with guardrails. |
| C | Limited evidence, practical coaching consensus, or ASC lab validation | Use conservatively and validate before production. |
| D | Coach judgement only, weak evidence, or future hypothesis | Do not automate aggressively; gather evidence first. |

## Strategy Key

| Strategy | Meaning |
| --- | --- |
| Fixed | Should rarely or never adapt. Use stable evidence-based defaults. |
| Adaptive | Should usually adapt when evidence is sufficient. |
| Adaptive within Constraints | May adapt, but only inside hard scientific, safety, or product boundaries. |
| Evidence Gathering First | Do not materially adapt until ASC has enough objective evidence. |
| Coach Override Only | Do not automate as a normal product decision; reserve for explicit user, coach, or safety override. |

## Objective Evidence Standard

ASC may use:

- completed planned workouts
- working sets
- load
- reps or seconds
- target-range success
- missed minimum range
- above-range performance
- comparable-load trends
- load ownership
- shutdown/drop-off events
- exercise swaps
- skipped work
- session spacing
- planned versus extra session classification
- recovery week acceptance/completion
- safety flags
- pain or unusual symptom reports

ASC must not treat as primary evidence:

- generic readiness scores
- motivation ratings
- broad wellness questionnaires
- scale weight alone for muscle gain
- extra sessions as planned progression evidence
- warm-ups as working-set progression evidence
- future wearable metrics until validated against ASC outcomes

## Decision Register

| Decision | Evidence Default | Athlete Variability | Adaptation Benefit | Objective Measurement | Strategy |
| --- | --- | --- | --- | --- | --- |
| Macrocycle | Goal-specific annual direction: strength, hypertrophy, mixed, performance, maintenance, or fat-loss support; periodisation is generally useful for long-term strength planning. Evidence level B. | Moderate | Moderate | Goal, training age, event date, completed blocks, long-term goal progress, interruptions. | Adaptive within Constraints |
| Mesocycle | Use planned blocks with a clear emphasis such as accumulation, intensification, peak, deload, maintenance, or quality-volume progression. Evidence level B. | Moderate | Large | Block completion, goal progress, recovery response, performance trend, missed sessions, safety events. | Adaptive within Constraints |
| Microcycle | Weekly structure should distribute recoverable stress across available training days. Evidence level B. | High | Large | Training days, session spacing, completed planned sessions, working-set density, movement-pattern distribution. | Adaptive |
| Weekly volume | Broad volume ranges should reflect goal, training age, exercise type, and recoverability; more volume is not automatically better. Evidence level A/B. | Very High | Critical | Quality sets, target-range success, recovery capacity, missed ranges, shutdowns, session completion, muscle/pattern distribution. | Adaptive |
| Session objective | A session/set should have an explicit objective: calibration, productive, verification, performance, or recovery. Evidence level B/C. | High | Large | Phase, recovery flag, load confidence, exposure count, load ownership, safety status, recent performance signal. | Adaptive |
| Coaching bias | Bias should reflect goal and context: tension, balanced, metabolic, speed/power, skill, recovery, or peak. Evidence level B/C. | High | Large | Goal, exercise category, phase, recovery context, performance signal, safety status. | Adaptive within Constraints |
| Exercise order | Power/skill/heavy technical work generally comes before high-fatigue accessories; safety and logistics matter. Evidence level B. | Moderate | Moderate | Exercise category, fatigue cost, technical demand, power intent, remaining session work. | Adaptive within Constraints |
| Exercise selection | Select exercises that match goal stimulus, equipment assumptions, safety, skill demand, and fatigue cost. Evidence level B/C. | High | Large | Exercise history, swaps, pain flags, target-muscle coverage, movement pattern, fatigue/stimulus classification. | Adaptive within Constraints |
| Exercise substitution | Substitute when the original movement is unsafe, unavailable, stale, or poor-fitting while preserving target stimulus. Evidence level C. | Very High | Large | Swap history, reason if known, pain/safety flag, post-swap performance, adherence, target stimulus coverage. | Adaptive |
| Rep prescription | Rep targets should match goal, exercise category, phase, set objective, and bias; rep ranges are tolerance bands, not the whole decision. Evidence level A/B. | Moderate | Large | Exercise category, target-range success, exposure count, phase, performance signal, duration/reps measurement type. | Adaptive within Constraints |
| Load prescription | Load should support the rep intent, phase, exercise category, safety, and load ownership; heavy exposure is more important for strength than hypertrophy. Evidence level A/B. | High | Critical | Previous load, last successful load, e1RM where reliable, target-range success, load ownership, available jump, safety/recovery status. | Adaptive within Constraints |
| Set allocation | Set ranges require judgement about marginal value of another set; stop, continue, or max should remain inside prescribed min/max. Evidence level B/C. | High | Large | Completed working sets, target-range success, missed minimum, shutdown, fatigue cost, remaining exercises, deload status. | Adaptive within Constraints |
| Rest periods | Heavier strength/power work generally needs longer rest; isolation/metabolic work may use shorter rest. Evidence level A/B. | Moderate | Moderate | Goal, exercise category, intensity band, power intent, session density, performance degradation. | Adaptive within Constraints |
| Tempo | Normal controlled tempo should be default; specific tempo work is a tool, not a universal prescription. Evidence level C. | Low/Moderate | Small | Technique issue, exercise category, rehab/safety exclusion, user control, target stimulus. | Evidence Gathering First |
| AMRAP timing | AMRAP is a calibration or verification tool, not a default; high-risk lifts need caps. Evidence level B/C. | High | Moderate | Load confidence, plateau, exposure count, safety status, exercise category, recovery status, recent AMRAP history. | Adaptive within Constraints |
| Verification timing | Use top-range checks or verification sets when a prescription may be too easy or ownership needs evidence. Evidence level C. | High | Large | Repeated top-range success, underloaded signal, load ownership state, same-exercise exposures. | Adaptive |
| Calibration timing | Calibrate when load estimate is stale, unknown, or after interruption; choose conservative methods for high-risk lifts. Evidence level C. | High | Large | LoadKnown, exposure count, time since exposure, new exercise flag, recent interruption, safety/recovery state. | Adaptive within Constraints |
| Load progression | Progress load only when evidence says the athlete owns the current load; reduce faster than increase. Evidence level A/B plus ASC principle. | Very High | Critical | Same-exercise exposures, target-range success, missed-range events, load ownership, available jumps, recovery response. | Adaptive within Constraints |
| Volume progression | Increase volume only when quality work is being tolerated and goal requires more stimulus. Evidence level A/B. | Very High | Critical | Quality sets by muscle/pattern, recovery capacity, missed ranges, session duration, adherence, fatigue cost. | Adaptive within Constraints |
| Rep progression | Add reps when load progression is not yet earned or when rep performance is the intended stimulus/proof. Evidence level B. | High | Large | Reps/seconds trend, target-range position, load stability, exercise category, duration targets. | Adaptive |
| Deload timing | Deload/recovery weeks require systemic evidence, not one bad lift. Evidence level B/C. | Very High | Critical | Multiple planned sessions declining, multiple patterns affected, repeated shutdowns, poor response after rest, safety flags. | Adaptive within Constraints |
| Block transition | Transition blocks when the current block has delivered its purpose or evidence supports a new emphasis. Evidence level B/C. | High | Large | Block completion, goal progress, load ownership, volume tolerance, fatigue trend, event date. | Adaptive within Constraints |
| Plateau intervention | Plateau response should start local and low-cost before systemic changes. Evidence level C. | Very High | Large | Same-exercise trend, comparable-load stagnation, missed ranges, recovery status, swap history, goal progress. | Adaptive |
| Recovery prescription | Recovery guidance should reduce unnecessary fatigue while preserving momentum and training identity. Evidence level B/C. | High | Large | Session spacing, missed sessions, recovery week response, fatigue evidence, safety status, adherence. | Adaptive within Constraints |
| Fatigue management | Fatigue is a cost; manage by adjusting load, sets, exercise choice, frequency, and recovery before chasing more stress. Evidence level A/B. | Very High | Critical | Shutdowns, repeated missed ranges, density, performance trend, session spacing, multi-pattern decline, pain flags. | Adaptive |
| Training frequency | Frequency is a constraint, not a goal; distribute weekly stimulus around recoverability and adherence. Evidence level B. | Very High | Large | Available days, session spacing, missed sessions, session length, weekly set density, recovery response. | Adaptive within Constraints |
| MRV estimation | Maximum recoverable volume is individual and unstable; ASC should estimate cautiously from objective tolerance, not declare exact MRV. Evidence level C/D. | Very High | Moderate | Repeated volume response, missed ranges, recovery trend, session completion, fatigue events, multi-week outcomes. | Evidence Gathering First |
| MEV estimation | Minimum effective volume is goal- and athlete-dependent; useful but should be inferred from progress under low dose. Evidence level C/D. | Very High | Moderate | Goal progress at current dose, quality sets, consistency, strength/volume trend, recovery cost. | Evidence Gathering First |
| Peaking | Peaking should increase specificity, reduce volume, maintain intensity exposure, and reduce fatigue. Evidence level B. | High | Large | Event date, competition lift exposures, fatigue trend, readiness evidence, successful heavy practice, safety status. | Adaptive within Constraints |
| Power prescriptions | Power work should use low reps, high quality, low fatigue, adequate rest, and no false velocity claims without sensors. Evidence level A/B. | Moderate | Large | Exercise category, quality completion, reps, load if relevant, fatigue/drop-off, session order. | Adaptive within Constraints |
| Strength specificity | Specificity rises as strength goals intensify or peak; competition lifts become primary evidence. Evidence level A/B. | Moderate | Large | Competition squat/bench/deadlift trends, secondary lift support, phase, event date, safety/fatigue response. | Adaptive within Constraints |
| Competition preparation | Meet prep should prioritise specificity, fatigue reduction, confidence, and known rules; novelty and excessive volume decline. Evidence level B/C. | High | Large | Meet date, lift selection, successful exposures, attempts/load confidence, fatigue status, pain flags. | Adaptive within Constraints |

## Detailed Decision Requirements

### Programming

#### Macrocycle

Purpose: define the long-term direction of training.

Scientific default: evidence-informed coaching generally plans training around goals, training age, and time horizon, using some form of periodised structure for strength and performance goals. Evidence level B.

Individual variability: moderate.

Adaptation benefit: moderate. Macrocycle adaptation matters when goals, event dates, adherence, or recovery constraints change, but should not churn often.

Objective evidence: goal, event date, completed blocks, interruptions, long-term goal progress, safety events.

Recommended strategy: Adaptive within Constraints.

Constraints: Charter, goal selection, event date, safety, minimum block duration, no arbitrary rewrites.

Confidence: medium.

#### Mesocycle

Purpose: set the current block focus.

Scientific default: use blocks with clear emphasis: accumulation, intensification, peak, deload, maintenance, or goal-specific quality-volume work. Evidence level B.

Individual variability: moderate.

Adaptation benefit: large.

Objective evidence: block completion, performance trend, goal progress, fatigue evidence, safety status.

Recommended strategy: Adaptive within Constraints.

Constraints: block changes require evidence; no block change from one bad lift; deload requires systemic evidence unless safety is severe.

Confidence: medium.

#### Microcycle

Purpose: distribute training stress across the week.

Scientific default: match weekly stimulus to goal and recovery while maintaining session quality. Evidence level B.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: planned training days, completed sessions, missed sessions, session spacing, workout density, weekly set distribution.

Recommended strategy: Adaptive.

Constraints: frequency is a constraint, not a goal; do not preserve weekly volume blindly if sessions become unworkable.

Confidence: medium.

#### Weekly Volume

Purpose: provide enough quality work to progress without burying the athlete.

Scientific default: hypertrophy and strength respond to volume, but dose-response has limits and recovery cost rises. Evidence level A/B.

Individual variability: very high.

Adaptation benefit: critical.

Objective evidence: quality working sets, target range success, missed ranges, shutdowns, recovery response, session completion, muscle/pattern distribution.

Recommended strategy: Adaptive within Constraints.

Constraints: no runaway volume, no junk volume, exclude warm-ups/extra sessions unless intended, respect safety and recovery.

Confidence: high for broad principle, medium for individual estimate.

#### Session Objective

Purpose: identify what today's work is trying to do.

Scientific default: evidence-based programming changes set intent by goal and phase even when not named this way. Evidence level B/C.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: phase, recovery flag, recent performance, load confidence, exposure count, load ownership, safety status.

Recommended strategy: Adaptive.

Constraints: deload/safety can force recovery; performance objective requires strong evidence; calibration must stay conservative for high-risk lifts.

Confidence: medium.

#### Coaching Bias

Purpose: choose the stress/stimulus emphasis.

Scientific default: loading and rep targets differ by goal: tension/skill for strength, quality volume for hypertrophy, low-fatigue speed for power, recovery bias during deloads. Evidence level B.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: goal, exercise category, training phase, recovery status, performance signal.

Recommended strategy: Adaptive within Constraints.

Constraints: power bias only for true power work or explicit speed-intent compounds; peak bias only when phase supports it; recovery bias overrides when safety/recovery requires.

Confidence: medium.

#### Exercise Order

Purpose: arrange work so the highest-skill/highest-priority work is done while quality is highest.

Scientific default: power, technical, and heavy work usually precede accessories and fatigue-heavy work. Evidence level B.

Individual variability: moderate.

Adaptation benefit: moderate.

Objective evidence: exercise category, power/skill objective, fatigue cost, session structure, remaining exercises.

Recommended strategy: Adaptive within Constraints.

Constraints: power before fatigue; high-risk lifts before exhaustive accessories; user logistics can override only if safe.

Confidence: medium.

#### Exercise Selection

Purpose: choose movements that deliver the intended stimulus at acceptable cost.

Scientific default: select exercises by goal, target muscle/pattern, specificity, safety, and equipment. Evidence level B/C.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: exercise history, performance trend, pain flags, swaps, available library, stimulus/fatigue classification.

Recommended strategy: Adaptive within Constraints.

Constraints: preserve goal stimulus; do not replace all compounds with easier machines; avoid stacking high axial/joint cost; respect commercial-gym assumption.

Confidence: medium.

#### Exercise Substitution

Purpose: replace a movement when another movement better preserves stimulus, safety, or adherence.

Scientific default: substitutions are common coaching practice when pain, equipment, preference, or poor fit interferes. Evidence level C.

Individual variability: very high.

Adaptation benefit: large.

Objective evidence: swaps, pain flags, repeated failure, post-swap performance, adherence, target stimulus coverage.

Recommended strategy: Adaptive.

Constraints: one post-swap improvement consolidates before push; substitution must preserve target intent; pain localises intervention before systemic recovery.

Confidence: medium.

### Prescription

#### Rep Prescription

Purpose: define the performance target for the set.

Scientific default: strength requires heavier/lower-rep exposure; hypertrophy can use broad rep ranges when effort is sufficient; power stays low rep/low fatigue. Evidence level A/B.

Individual variability: moderate.

Adaptation benefit: large.

Objective evidence: goal, phase, exercise category, set objective, target-range success, duration/reps type, recent signal.

Recommended strategy: Adaptive within Constraints.

Constraints: no fake reps for duration exercises; no high-rep deadlift drift; AMRAP sparingly; power low-fatigue; peak specific.

Confidence: high for broad zones, medium for individual target.

#### Load Prescription

Purpose: select the load strategy that makes the rep prescription productive and safe.

Scientific default: load depends on goal, exercise, phase, and target reps; heavier exposure is more specific to strength. Evidence level A/B.

Individual variability: high.

Adaptation benefit: critical.

Objective evidence: previous load, last successful load, target-range success, load ownership, available load jump, e1RM where stable, recovery/safety.

Recommended strategy: Adaptive within Constraints.

Constraints: Safety Gate, deadlift safeguards, available jump sanity, no increase without ownership, reduce excessive stress faster than increase.

Confidence: high for direction, medium for exact load.

#### Set Allocation

Purpose: decide whether one more set is worth the fatigue cost.

Scientific default: set ranges are common, but exact daily set count depends on quality and fatigue. Evidence level B/C.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: completed working sets, minimum/maximum prescribed sets, in-range status, missed minimum, shutdown, fatigue cost, remaining work.

Recommended strategy: Adaptive within Constraints.

Constraints: never below prescribed minimum; never above prescribed maximum; no junk volume after clear miss/shutdown; advisory until rep/load intent is fully trusted.

Confidence: medium.

#### Rest Periods

Purpose: preserve performance quality and match physiological target.

Scientific default: longer rests support heavier strength/power performance; shorter rests can support time efficiency/metabolic work but may reduce load performance. Evidence level A/B.

Individual variability: moderate.

Adaptation benefit: moderate.

Objective evidence: exercise category, intensity band, power/strength intent, set-to-set performance drop, session density.

Recommended strategy: Adaptive within Constraints.

Constraints: heavy compounds/power need adequate rest; avoid forcing short rests when performance quality matters.

Confidence: high for broad default, medium for adaptation.

#### Tempo

Purpose: control execution quality or alter stimulus where justified.

Scientific default: controlled lifting is generally sufficient; tempo prescriptions are tools, not core drivers. Evidence level C.

Individual variability: low/moderate.

Adaptation benefit: small.

Objective evidence: technique breakdown, exercise category, safety flag, target stimulus.

Recommended strategy: Evidence Gathering First.

Constraints: do not use tempo as complexity theatre; avoid medical/rehab claims.

Confidence: low/medium.

#### AMRAP Timing

Purpose: gather performance evidence or create a controlled test.

Scientific default: AMRAP-style testing is practical but fatiguing; failure is not required for progress. Evidence level B/C.

Individual variability: high.

Adaptation benefit: moderate.

Objective evidence: load confidence, exercise exposure count, plateau, stale estimate, recent AMRAP use, safety/recovery status.

Recommended strategy: Adaptive within Constraints.

Constraints: no open deadlift AMRAP; avoid during deload, high fatigue, pain, peak risk, or low-safety confidence.

Confidence: medium.

#### Verification Timing

Purpose: verify whether a load/prescription is too easy or ready to progress.

Scientific default: coaches use top-end checks and repeated successful exposures before increasing stress. Evidence level C.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: repeated top-range success, underloaded signal, load ownership, exposure count.

Recommended strategy: Adaptive.

Constraints: one above-range set is not enough to push; repeated evidence required.

Confidence: medium.

#### Calibration Timing

Purpose: find or refresh the right starting point.

Scientific default: new/stale exercises require conservative load finding. Evidence level C.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: loadKnown false, zero/low exposures, interruption, new exercise, stale history.

Recommended strategy: Adaptive within Constraints.

Constraints: high-risk lifts use capped/conservative calibration; no aggressive load finding with poor recovery/safety concern.

Confidence: medium.

### Progression

#### Load Progression

Purpose: increase external load when adaptation and ownership justify it.

Scientific default: progressive overload matters, but the timing and size of increases must reflect performance and recovery. Evidence level A/B.

Individual variability: very high.

Adaptation benefit: critical.

Objective evidence: same-exercise successful exposures, top-range success, missed ranges, load ownership, recovery response, available jumps.

Recommended strategy: Adaptive within Constraints.

Constraints: same-exercise evidence required for meaningful push; no increase after missed minimum; large jumps may block increase; deadlift conservative.

Confidence: high.

#### Volume Progression

Purpose: increase productive work when more stimulus is useful and recoverable.

Scientific default: higher weekly volume can improve hypertrophy up to a point, but excessive volume harms recovery. Evidence level A/B.

Individual variability: very high.

Adaptation benefit: critical.

Objective evidence: quality set trend, goal progress, recovery capacity, missed ranges, shutdowns, session duration, adherence.

Recommended strategy: Adaptive within Constraints.

Constraints: no runaway volume; quality volume only; no volume push under poor recovery or repeated missed ranges.

Confidence: high for broad rule, medium for individual dose.

#### Rep Progression

Purpose: create progress within a stable load before load increase is earned.

Scientific default: rep progression is a common double-progression tool. Evidence level B.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: rep trend, target-range position, load stability, exercise category, duration progression.

Recommended strategy: Adaptive.

Constraints: no fake duration-as-reps; no overvaluing one anomalous high-rep set.

Confidence: medium/high.

#### Deload Timing

Purpose: reduce fatigue so training can keep progressing.

Scientific default: deloads/tapers are useful when fatigue has accumulated, but timing is individual. Evidence level B/C.

Individual variability: very high.

Adaptation benefit: critical.

Objective evidence: repeated decline, multiple patterns affected, shutdowns, missed ranges, poor response after rest, recovery week response.

Recommended strategy: Adaptive within Constraints.

Constraints: no full recovery week from one bad lift/session; local failure stays local first; severe safety exception allowed.

Confidence: medium.

#### Block Transition

Purpose: move to the next training emphasis at the right time.

Scientific default: block changes follow goal, phase completion, and readiness for new emphasis. Evidence level B/C.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: block completion, goal progress, load ownership, plateau, fatigue trend, event date.

Recommended strategy: Adaptive within Constraints.

Constraints: avoid frequent rewrites; completion-based progression remains stable; recovery blocks require real implementation, not presentation only.

Confidence: medium.

#### Plateau Intervention

Purpose: resolve stalled progress with the smallest useful change.

Scientific default: plateaus can require load, volume, exercise, recovery, or specificity changes. Evidence level C.

Individual variability: very high.

Adaptation benefit: large.

Objective evidence: comparable-load trend, same-exercise exposure count, missed ranges, recovery status, swap response, goal progress.

Recommended strategy: Adaptive.

Constraints: diagnose local before systemic; do not rewrite programme from weak evidence; safety overrides.

Confidence: medium.

### Recovery

#### Recovery Prescription

Purpose: preserve adaptation and momentum by reducing unnecessary fatigue.

Scientific default: recovery enables adaptation; fatigue management is central to long-term training. Evidence level B.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: session spacing, recovery week completion, missed sessions, fatigue events, performance rebound, safety flags.

Recommended strategy: Adaptive within Constraints.

Constraints: no medical claims; severe safety prompts professional advice; recovery should not erase training identity.

Confidence: medium/high.

#### Fatigue Management

Purpose: control the cost of training stress.

Scientific default: fatigue accumulates through load, volume, proximity to failure, density, and systemic stress. Evidence level A/B.

Individual variability: very high.

Adaptation benefit: critical.

Objective evidence: shutdowns, same-load collapse, below-minimum events, multi-pattern decline, session spacing, workload density.

Recommended strategy: Adaptive.

Constraints: productive fatigue inside range is not failure; compare comparable workloads; reduce excessive stress faster than increase.

Confidence: high.

#### Training Frequency

Purpose: fit useful weekly stimulus into the athlete's real life.

Scientific default: frequency distributes volume and skill practice; it is not inherently superior without recoverability/adherence. Evidence level B.

Individual variability: very high.

Adaptation benefit: large.

Objective evidence: available days, completed sessions, missed sessions, session spacing, session density, weekly stimulus distribution.

Recommended strategy: Adaptive within Constraints.

Constraints: do not blindly preserve per-session volume; do not make low-frequency plans brutally dense; frequency is a constraint.

Confidence: medium.

#### MRV Estimation

Purpose: estimate when more volume is likely counterproductive.

Scientific default: maximum recoverable volume is a useful coaching concept but not directly measurable as a fixed number. Evidence level C/D.

Individual variability: very high.

Adaptation benefit: moderate.

Objective evidence: volume tolerance, missed ranges, fatigue events, performance trend, recovery response, adherence.

Recommended strategy: Evidence Gathering First.

Constraints: do not display false precision; do not use MRV to justify runaway volume.

Confidence: low/medium.

#### MEV Estimation

Purpose: estimate the lowest useful dose for progress.

Scientific default: minimum effective volume is useful but individual and goal-dependent. Evidence level C/D.

Individual variability: very high.

Adaptation benefit: moderate.

Objective evidence: progress at low dose, quality sets, goal progress, recovery cost, consistency.

Recommended strategy: Evidence Gathering First.

Constraints: do not undertrain advanced goals from weak evidence; do not claim exact MEV.

Confidence: low/medium.

### Performance

#### Peaking

Purpose: express strength/performance by reducing fatigue and increasing specificity.

Scientific default: taper/peaking reduces volume while maintaining specificity and intensity exposure. Evidence level B.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: event date, competition lift trend, heavy exposure success, fatigue trend, pain/safety flags.

Recommended strategy: Adaptive within Constraints.

Constraints: no random heavy singles; no AMRAP-heavy peaking; accessories conservative.

Confidence: medium.

#### Power Prescriptions

Purpose: develop high-quality explosive performance with low fatigue.

Scientific default: power work uses low reps, high intent, adequate rest, and quality termination. Evidence level A/B.

Individual variability: moderate.

Adaptation benefit: large for athletic goals.

Objective evidence: power exercise completion, reps, load where applicable, fatigue/drop-off, session placement.

Recommended strategy: Adaptive within Constraints.

Constraints: no bar-speed claims without sensors; stop when quality drops; avoid fatigue-style power prescriptions.

Confidence: high for default, medium for individual adaptation.

#### Strength Specificity

Purpose: align training with the lifts that define strength progress.

Scientific default: strength improves most reliably when training includes specific practice of target lifts. Evidence level A/B.

Individual variability: moderate.

Adaptation benefit: large.

Objective evidence: competition squat, bench, deadlift trends; secondary lifts; phase; event date; recovery.

Recommended strategy: Adaptive within Constraints.

Constraints: isolation progress is not primary strength progress; deadlift fatigue cost managed conservatively.

Confidence: high.

#### Competition Preparation

Purpose: prepare the athlete to perform on a specific date under specific constraints.

Scientific default: competition prep prioritises specificity, fatigue reduction, stable attempts, and confidence. Evidence level B/C.

Individual variability: high.

Adaptation benefit: large.

Objective evidence: meet date, lift history, load ownership, successful heavy exposures, fatigue/safety trend, attempt confidence.

Recommended strategy: Adaptive within Constraints.

Constraints: no novelty near competition; no unsafe load jumps; safety and confidence outrank chasing gym PRs.

Confidence: medium.

## What Never Changes

These are fixed constitutional rules:

- The Charter wins over every algorithm.
- Safety Gate can veto progression.
- Objective training evidence outranks subjective feeling except safety/pain.
- Warm-ups, Session Prep, recovery/cardio/capacity, and non-evidence extra sessions do not drive planned progression.
- Rep/duration measurement type must be respected.
- Performance comparisons require comparable workloads.
- Successful heavier-load work inside range is not deterioration.
- Recovery weeks require systemic evidence unless safety is severe.
- Deadlift/high-risk lift fatigue limits are stricter than bench or low-cost isolation work.
- AMRAP is not an every-session default.
- ASC must not claim sensor-like data it does not measure.

## What Sometimes Changes

These adapt only within strong constraints:

- macrocycle and mesocycle emphasis
- session objective
- coaching bias
- exercise order
- exercise selection/substitution
- rep target
- load strategy
- set allocation
- rest periods
- deload timing
- peaking exposure
- power prescription

## What Should Almost Always Adapt

These should be adaptive when objective evidence is sufficient:

- load prescription
- load progression
- set allocation inside prescribed ranges
- local plateau intervention
- fatigue management
- training frequency/stimulus distribution
- recovery prescription
- exercise substitution after clear pain/logistics/performance evidence

## What ASC Should Never Pretend To Adapt

ASC should not pretend to adapt:

- exact MRV or MEV as if directly measured
- body-fat progress without body-composition evidence
- bar speed without velocity data
- motivation from a single missed session
- sleep/recovery from a generic readiness rating alone
- medical diagnosis from pain reports
- muscle gain from scale gain alone
- long-term athlete potential from short history

## Where Objective Evidence Exists

Strong objective evidence exists for:

- set completion
- load
- reps/seconds
- target-range success or miss
- planned session completion
- session spacing
- shutdown/drop-off
- same-exercise comparable trends
- load ownership
- recovery week completion
- exercise swaps

Partial objective evidence exists for:

- systemic fatigue
- volume tolerance
- plateau cause
- adherence pressure
- boredom/staleness
- recovery capacity
- exercise fit

Weak or absent objective evidence exists for:

- exact motivation
- exact soreness meaning
- exact stress cause
- exact MRV/MEV
- body composition without user data
- bar speed without sensors

## Where Coaching Judgement Dominates

Coach judgement remains important for:

- choosing between similarly safe interventions
- deciding whether local or systemic intervention is appropriate
- interpreting messy interruption patterns
- balancing confidence and momentum
- avoiding unnecessary complexity
- selecting substitutions when multiple choices are defensible
- deciding when not to act

Coach judgement may guide a rule, but it may not erase safety, evidence hierarchy, or Charter constraints.

## Where Outcome Learning Can Add Value

Future outcome learning can improve:

- push thresholds by goal and exercise category
- load ownership timing
- volume tolerance estimates
- deload rebound prediction
- substitution success patterns
- plateau intervention ranking
- recovery prescription effectiveness
- training frequency/stimulus distribution
- confidence calibration

Outcome learning must remain advisory until validated. It must never automatically override the Charter, Safety Gate, or scientific guardrails.

## Production Roadmap

### Phase 1: Must Exist Before Production V2

These decisions form the minimum safe production V2 coaching stack:

- Evidence Capture Model
- Safety Gate
- Cycle Strategy Context
- Session Objective
- Coaching Bias
- Rep Prescription
- Load Prescription
- Set Allocation
- Load Progression
- Rep Progression
- Basic Volume Progression
- Deload Timing Guardrails
- Fatigue Management
- Exercise Measurement Type
- AMRAP Timing Guardrails
- Verification Timing
- Calibration Timing
- Training Frequency Constraint Handling
- Coaching Review Suite
- Scenario/gauntlet validation

Production V2 must not ship without these because they define the minimum defensible chain from evidence to prescription.

### Phase 2: High-Value Adaptation

These decisions should follow once Phase 1 is stable:

- Exercise Selection
- Exercise Substitution
- Exercise Order
- Weekly Volume by muscle/pattern/stimulus cost
- Rest Period Adaptation
- Block Transition
- Plateau Intervention
- Recovery Prescription
- Strength Specificity
- Peaking Rules
- Power Prescription refinement
- Frequency-aware stimulus distribution
- Load Ownership Calibration
- Goal Progress scoring
- Athlete Lifetime Progress tracking

These have high coaching value but require more integrated evidence and scenario validation.

### Phase 3: Long-Term Intelligence

These decisions should remain research/lab-first until substantial real-world evidence exists:

- Macrocycle adaptation
- MRV estimation
- MEV estimation
- Advanced volume landmarks
- Outcome Learning adjustments
- Body-composition-aware Get Lean logic
- Wearable-informed recovery context
- Long-term competition preparation intelligence
- Individual exercise preference modelling
- Confidence/momentum modelling
- Boredom/staleness inference

These are valuable, but easy to overfit, overclaim, or automate before evidence quality is strong enough.

## Production Eligibility Checklist

Before any adaptive feature ships, it must answer:

1. Which CDR decision does it modify?
2. What is the scientific default?
3. What athlete variability justifies adaptation?
4. What objective evidence drives the adaptation?
5. What evidence is excluded?
6. What hard constraints can never be violated?
7. What happens when evidence is low confidence?
8. How is success measured after 1 session, 2 weeks, 4 weeks, and 8 weeks?
9. What scenario tests prove it behaves safely?
10. What user-facing copy explains the decision without overclaiming?

If these cannot be answered, the feature stays in research.

## Source Documents

This register is grounded in:

- `docs/adaptive-strength-coach-charter-v1.md`
- `docs/adaptive-coaching-manifesto-v1.md`
- `docs/adaptive-programming-framework-v1.md`
- `docs/adaptive-rep-prescription-matrix-v1.md`
- `docs/evidence-capture-model-v1.md`
- `docs/scientific-validation-framework-v1.md`
- `docs/adaptive-stress-allocation-v1.md`
- `docs/adaptive-load-management-v1.md`
- `docs/athlete-lifetime-progress-v1.md`
- `docs/exercise-stimulus-fatigue-classification.md`
- `docs/training-days-stimulus-audit.md`
- `research/adaptive_stress_lab/`

Key evidence sources are tracked in the programming framework and rep prescription matrix, including ACSM progression guidance, Schoenfeld/Grgic/Krieger hypertrophy and load-spectrum work, training-to-failure reviews, autoregulation reviews, power training consensus, peaking/tapering literature, and Prilepin-inspired guardrail discussions.

## Final Position

Adaptive Strength Coach should adapt only where adaptation improves coaching.

Some decisions should remain fixed because science already gives a strong default.

Some decisions should adapt within strict constraints because athletes differ meaningfully.

Some decisions should gather evidence first because ASC cannot yet measure them cleanly.

Some decisions should remain coach override only because pretending to automate them would create false precision.

The Coaching Decision Register exists to prevent Adaptive Strength Coach from becoming clever for its own sake.

Every adaptive decision must earn its place.
