# Coaching Playbook v1

Status: foundational coaching knowledge base.  
Date: 2026-06-26

This is not an algorithm. It is not an implementation plan. It is a coaching reasoning library for Adaptive Strength Coach.

The purpose of this document is to describe how an experienced evidence-based strength coach would respond to real-world training situations.

The central question is:

> What should the coach do?

Not:

> What should the algorithm do?

## Executive Summary

Adaptive Strength Coach should eventually use this playbook as the reasoning layer beneath Adaptive Stress Allocation.

The playbook's position is simple:

- adaptation is the goal
- fatigue is the cost
- consistency is the multiplier
- confidence is part of the intervention
- uncertainty should lead to conservative coaching
- the best next decision is usually the smallest effective change

This document turns that philosophy into coaching responses for common scenarios:

- performance improving or declining
- fatigue low, local, or systemic
- lift-specific plateaus
- beginner/intermediate/advanced needs
- poor sleep, travel, illness, missed sessions
- hypertrophy, strength, powerlifting, recomposition, maintenance, and peaking
- behavioural and adherence situations

Each scenario includes:

- situation
- evidence available
- primary coaching objective
- recommended intervention
- reasoning
- evidence strength
- alternative options
- monitoring
- future engine hooks

## Coaching Philosophy

An elite coach does not progress every variable every time the athlete has a good session.

An elite coach asks:

1. What adaptation are we trying to create?
2. What evidence do we have?
3. What fatigue did the last dose create?
4. What is the lowest-cost next intervention?
5. What will keep this person training productively?

The coach should not worship load, volume, novelty, or failure. Each is a tool. None is the objective.

The objective is long-term adaptation.

## Evidence Ratings

Recommendations use these evidence labels:

- **Strong evidence**: supported by broad resistance-training evidence, position stands, meta-analyses, or repeated findings.
- **Moderate evidence**: supported by relevant studies, applied research, or strong mechanistic rationale, but not universal.
- **Limited evidence**: plausible and used in practice, but research is narrow, indirect, or population-specific.
- **Coach judgement**: practical coaching decision based on experience, constraints, and individual response.
- **Consensus**: widely accepted among evidence-based coaches, though exact research proof may be incomplete.
- **Unknown**: insufficient evidence; use conservative monitoring.

## Decision Hierarchy

When a coach chooses an intervention, rank options by:

1. Expected adaptation
2. Fatigue cost
3. Joint/connective tissue cost
4. Recovery requirement
5. Safety
6. Confidence in evidence
7. Adherence cost

Default hierarchy when evidence is positive:

1. Do nothing / repeat if the current dose is working and confidence is low
2. Add reps
3. Add small load
4. Add one low-fatigue set
5. Increase intensity exposure
6. Change exercise
7. Change frequency

Default hierarchy when fatigue is rising:

1. Reduce proximity to failure
2. Reduce accessory volume
3. Consolidate
4. Reduce secondary lift stress
5. Reduce primary lift volume
6. Reduce primary lift load
7. Recovery Window / deload

Frequency should be one of the last variables changed because it affects habit, schedule, and adherence.

## Scenario Library

### Scenario 1: Performance Improving, Fatigue Low

Situation:

The user is hitting target zones, completing required work, and recent performance is up. Fatigue evidence is low.

Evidence available:

- target-zone success
- stable or improving reps/load
- required work completed
- low shutdown/drop-off
- no systemic fatigue

Primary coaching objective:

Convert positive adaptation into continued progress without overbuying fatigue.

Recommended intervention:

- Add reps if still inside the target range.
- Add small load if top of range is clearly achieved.
- Add one low-fatigue set only if hypertrophy volume appears underdosed.

Reasoning:

Progression is justified, but the lowest-cost progression should be selected. Load is not automatically first.

Evidence strength:

Strong evidence for progressive overload; moderate evidence for exact intervention ordering.

Alternative options:

- hold and consolidate if a hard week just occurred
- preserve prescription in meet prep or after interruption

Monitoring:

- next-session completion
- rep stability
- fatigue classification
- whether load jump causes immediate regression

Future engine hooks:

- inputs: target-zone result, load trend, rep trend, fatigue state, exercise role, goal
- future sensors: bar velocity, optional RPE/RIR
- confidence score: high if repeated across 2-3 exposures
- automation suitability: high

### Scenario 2: Performance Improving, Fatigue High

Situation:

Performance is up, but fatigue indicators are rising.

Evidence available:

- PR or rep improvement
- higher shutdown/drop-off
- soreness or repeated hard finishes
- lower accessory performance

Primary coaching objective:

Preserve adaptation while preventing the cost from becoming regressive.

Recommended intervention:

- Hold load.
- Avoid adding sets.
- Reduce accessory volume if systemic fatigue appears.
- Consolidate after the hard exposure.

Reasoning:

This is often productive overreach or high-cost adaptation. The coach should not punish progress, but should not keep escalating stress blindly.

Evidence strength:

Moderate evidence; coach judgement for exact timing.

Alternative options:

- local pullback only if fatigue is isolated
- continue one more exposure if goal is short-term peak and fatigue is expected

Monitoring:

- whether performance remains up next exposure
- whether fatigue spreads across unrelated lifts
- missed sessions after hard week

Future engine hooks:

- inputs: PR/e1RM improvement, shutdown classification, session-wide spread, recent hard-week count
- future sensors: HRV, sleep, subjective soreness
- confidence score: medium
- automation suitability: high with guardrails

### Scenario 3: Performance Stagnant, Fatigue Low

Situation:

Performance is flat, but fatigue is low. The user is completing work.

Evidence available:

- target zone reached but not improving
- low fatigue
- stable completion
- no systemic decline

Primary coaching objective:

Determine whether the athlete needs more stimulus, more skill practice, or simply more time.

Recommended intervention:

- Repeat if stagnation is short-term.
- Add reps or a small load if near target-zone top.
- Add one set for hypertrophy if volume appears insufficient.
- Consider exercise-specific technique/stability if a primary lift is stalled.

Reasoning:

Low fatigue plus stagnation can mean insufficient stimulus, skill limitation, low confidence data, or normal adaptation lag. Do not deload.

Evidence strength:

Moderate evidence; coach judgement for distinguishing underdosing from normal variation.

Alternative options:

- exercise variation if stagnation persists after appropriate stress
- increase rest if density is limiting performance

Monitoring:

- 2-4 exposures before major change
- set-to-set drop-off
- completion after small stimulus increase

Future engine hooks:

- inputs: trend length, volume landmarks, exercise age, rest/density, goal
- future sensors: bar speed, subjective difficulty
- confidence score: medium
- automation suitability: medium-high

### Scenario 4: Performance Stagnant, Fatigue High

Situation:

Performance is flat and fatigue is rising.

Evidence available:

- no rep/load improvement
- increased drop-off
- missed required work
- high soreness or repeated hard finishes

Primary coaching objective:

Lower fatigue while preserving useful stimulus.

Recommended intervention:

- Reduce accessory volume.
- Reduce proximity to failure.
- Hold load.
- Insert consolidation exposure.
- Recovery Window only if fatigue is systemic and repeated.

Reasoning:

More stress is unlikely to help if fatigue is already rising without adaptation.

Evidence strength:

Strong evidence for managing fatigue; moderate evidence for exact intervention.

Alternative options:

- local exercise swap if one movement causes the issue
- reduce session density if short rests are causing fatigue

Monitoring:

- performance rebound
- fatigue trend
- required work completion

Future engine hooks:

- inputs: fatigue classification, stagnation duration, affected exercise spread, completion rate
- future sensors: sleep, HRV, soreness
- confidence score: high if repeated
- automation suitability: high

### Scenario 5: Performance Declining, Fatigue Low

Situation:

Performance has dropped, but fatigue signals are low.

Evidence available:

- lower reps/load
- low shutdown/drop-off
- no systemic fatigue
- possible missed sessions, new exercise, poor setup, technical issue

Primary coaching objective:

Avoid overreacting. Identify whether this is a data-quality, skill, or stimulus issue.

Recommended intervention:

- Repeat prescription.
- Check exercise familiarity and recent interruption.
- Simplify target if needed.
- Add stimulus only after repeated low-fatigue underperformance.

Reasoning:

Performance decline without fatigue may reflect noise, skill, confidence, setup, or insufficient stimulus. Deloading is not the default.

Evidence strength:

Limited evidence; coach judgement.

Alternative options:

- reduce load slightly if technique breaks down
- increase rest if density caused underperformance
- change exercise if mismatch persists

Monitoring:

- next 1-2 exposures
- setup consistency
- whether decline repeats

Future engine hooks:

- inputs: exercise age, interruption state, density, missed sessions, trend length
- future sensors: subjective readiness, bar speed
- confidence score: low-medium
- automation suitability: medium

### Scenario 6: Performance Declining, Fatigue High

Situation:

Performance is dropping and fatigue is high.

Evidence available:

- missed target zones
- early shutdowns
- multiple exercises affected
- primary compound decline
- repeated low-quality sessions

Primary coaching objective:

Stop regressive stress and restore trainability.

Recommended intervention:

- Reduce accessory volume first.
- Reduce proximity to failure.
- Preserve technical exposure where safe.
- Reduce primary volume if needed.
- Use Recovery Window if systemic and repeated.

Reasoning:

This is the clearest case for reducing stress. The coach should not demand more effort from a system that is already failing to recover.

Evidence strength:

Strong evidence for fatigue management; moderate evidence for exact reduction sequence.

Alternative options:

- local pullback if only one lift/region is affected
- medical/professional referral if pain or health concern is present

Monitoring:

- performance rebound after reduced stress
- missed sessions
- fatigue spread
- recovery-window response

Future engine hooks:

- inputs: systemic fatigue, performance decline, required work, shutdown timing, affected lifts
- future sensors: sleep, HRV, soreness, pain flag
- confidence score: high
- automation suitability: high

## Exercise-Specific Scenarios

### Bench Press Progressing

Situation:

Bench performance is improving across target-zone exposures.

Evidence available:

- reps/load up
- target zone hit
- stable drop-off
- no shoulder/elbow irritation

Primary coaching objective:

Progress bench while protecting shoulders and elbows.

Recommended intervention:

- Add small load when top-zone success is clear.
- Otherwise add reps or repeat.
- Keep assistance volume stable unless hypertrophy is the priority.

Reasoning:

Bench responds to specific practice and small load increases, but upper-body joints can accumulate stress from pressing frequency and accessory overlap.

Evidence strength:

Strong evidence for progressive overload and specificity; coach judgement for joint-stress balance.

Alternative options:

- add triceps/upper-back support if lockout/stability appears limiting
- reduce pressing accessory volume if irritation rises

Monitoring:

- shoulder/elbow flags
- press accessory fatigue
- rep stability across sets

Future engine hooks:

- inputs: bench trend, pressing volume, shoulder/triceps accessory load, pain/manual-negative flags
- future sensors: bar speed, optional RPE
- confidence: high
- automation suitability: high

### Squat Plateau

Situation:

Squat is flat for several exposures.

Evidence available:

- load/reps stable
- no clear improvement
- fatigue may be low or moderate
- lower accessories may be stable

Primary coaching objective:

Determine whether the plateau is stimulus, fatigue, technical, or confidence-related.

Recommended intervention:

- If fatigue low: add reps, add a small load exposure, or add targeted support work.
- If fatigue moderate/high: reduce lower accessory stress and consolidate.
- If technical breakdown: hold load and repeat with quality emphasis.

Reasoning:

Squat is high systemic and connective tissue cost. Adding volume blindly can make plateaus worse.

Evidence strength:

Moderate evidence; coach judgement for technical diagnosis.

Alternative options:

- variation only if repeated plateau persists
- adjust rep target by block
- increase rest if density is limiting

Monitoring:

- lower-body fatigue spread
- session placement
- squat/deadlift interference

Future engine hooks:

- inputs: squat trend, lower-body volume, deadlift proximity, fatigue, target-zone misses
- future sensors: bar speed, subjective bracing confidence
- confidence: medium
- automation suitability: medium-high

### Deadlift Fatigue Accumulating

Situation:

Deadlift performance may be stable or improving, but fatigue accumulates and affects later training.

Evidence available:

- deadlift hard finishes
- lower back/hamstring fatigue
- next-session lower performance down
- accessory shutdowns

Primary coaching objective:

Keep deadlift exposure productive without letting it dominate the stress budget.

Recommended intervention:

- Reduce deadlift volume before reducing all lower training.
- Keep intensity exposure if strength/powerlifting requires it.
- Reduce posterior-chain accessories.
- Add consolidation if fatigue spreads.

Reasoning:

Deadlifts have high systemic and posterior-chain cost. Extra volume can be expensive.

Evidence strength:

Moderate evidence; strong coaching consensus.

Alternative options:

- alternate heavy and lighter hinge exposures
- use variation if block supports it
- capacity work stays low-dose and separate

Monitoring:

- next-session performance
- low-back fatigue
- grip/bracing limitation

Future engine hooks:

- inputs: deadlift volume, hinge overlap, low-back capacity, shutdown spread
- future sensors: bar speed, soreness/pain flag
- confidence: medium-high
- automation suitability: high with guardrails

### Overhead Press Improving

Situation:

OHP is improving slowly.

Evidence available:

- small rep gains
- stable load
- target zone hit
- no shoulder irritation

Primary coaching objective:

Respect small progress and avoid forcing large jumps.

Recommended intervention:

- Add reps before load.
- Use the smallest available load increment.
- Keep shoulder/scapular support stable.

Reasoning:

OHP often progresses slowly and load jumps are proportionally large.

Evidence strength:

Coach judgement supported by specificity/progressive overload evidence.

Alternative options:

- microloading if available
- rep-range wave
- close-grip/upper-back support where relevant

Monitoring:

- shoulder fatigue
- failed reps
- repeated near misses

Future engine hooks:

- inputs: equipment jump size, target-zone position, shoulder volume, press frequency
- future sensors: optional RPE
- confidence: medium-high
- automation suitability: high

### Isolation Exercise Stalling

Situation:

An isolation movement stops progressing.

Evidence available:

- stable reps/load
- local fatigue
- no systemic issue
- target work completed

Primary coaching objective:

Maintain local stimulus without overreacting.

Recommended intervention:

- Add reps if possible.
- Hold load.
- Add one set only if volume is low and fatigue is acceptable.
- Swap exercise if stale or irritating after repeated exposures.

Reasoning:

Isolation progress is noisy. Local fatigue is expected and should not drive systemic deloads.

Evidence strength:

Moderate evidence; coach judgement.

Alternative options:

- change rep range
- reduce load and improve control
- rotate variation

Monitoring:

- local soreness
- completion
- whether target muscle is still trained productively

Future engine hooks:

- inputs: exercise role, muscle volume, local fatigue, target-zone success
- future sensors: user preference
- confidence: medium
- automation suitability: high

### Accessory Repeatedly Failing

Situation:

An accessory repeatedly misses reps or fails early.

Evidence available:

- missed target zone
- repeated shutdown
- primary lifts may still be fine

Primary coaching objective:

Remove unnecessary friction without disrupting the main plan.

Recommended intervention:

- Reduce accessory load or sets.
- Swap if repeated.
- Do not deload the whole athlete unless fatigue spreads.

Reasoning:

Accessory failure is often local, exercise-specific, or placement-related.

Evidence strength:

Coach judgement; moderate evidence for fatigue management.

Alternative options:

- move accessory later/earlier
- choose lower-fatigue machine/cable variation
- reduce proximity to failure

Monitoring:

- primary lift stability
- same muscle volume from other exercises
- repeated swap behaviour

Future engine hooks:

- inputs: exercise role, repeated failure count, primary lift state, muscle volume
- future sensors: preference, pain flag
- confidence: medium-high
- automation suitability: high

### Repeated Missed Reps

Situation:

The user repeatedly misses prescribed reps on work sets.

Evidence available:

- below target zone
- missed required reps
- possible load too high

Primary coaching objective:

Restore productive target-zone training.

Recommended intervention:

- Reduce load if target zone is repeatedly missed.
- Hold or reduce sets depending fatigue.
- Avoid adding volume.

Reasoning:

Repeated misses suggest the current dose is not matching capacity.

Evidence strength:

Strong evidence for matching load to target adaptation; coach judgement for exact reduction.

Alternative options:

- adjust rep range if block changed
- increase rest if density issue

Monitoring:

- target-zone re-entry
- confidence after reduction
- fatigue state

Future engine hooks:

- inputs: target miss count, fatigue, rest/density, exercise role
- future sensors: RPE/bar speed
- confidence: high
- automation suitability: high

### Joint Irritation

Situation:

User reports or behaviour suggests joint irritation.

Evidence available:

- pain/discomfort flag
- repeated swaps/manual finish
- performance decline in related exercises

Primary coaching objective:

Reduce local stress while preserving training continuity.

Recommended intervention:

- Reduce load, range, volume, or proximity for the affected pattern.
- Swap to a better-tolerated variation.
- Avoid medical claims.
- Suggest professional advice if pain is significant, persistent, or concerning.

Reasoning:

Pain is not a reliable direct measure of tissue damage, but it is a practical constraint and safety signal.

Evidence strength:

Coach judgement; consensus for reducing aggravating load and seeking professional guidance when appropriate.

Alternative options:

- machine variation
- neutral grip
- tempo/control work
- capacity support if relevant and non-medical

Monitoring:

- recurrence
- severity
- effect on adjacent lifts

Future engine hooks:

- inputs: pain flag, swap/manual finish, exercise pattern, recurrence count
- future sensors: user pain scale
- confidence: medium
- automation suitability: medium due safety

### Grip Limitation

Situation:

Grip fails before target muscle or lift intent.

Evidence available:

- deadlift/row/pulldown performance limited
- target muscle likely not exhausted
- user notes grip issue or repeated early stop

Primary coaching objective:

Preserve the intended training stimulus.

Recommended intervention:

- Use straps where appropriate for hypertrophy/back work.
- Add grip capacity separately if goal-relevant.
- Do not reduce back/hinge stimulus solely because grip is limiting.

Reasoning:

Grip can be a bottleneck unrelated to the target adaptation.

Evidence strength:

Coach judgement; strong practical consensus.

Alternative options:

- alternate grip/hook grip for powerlifting context
- grip-specific accessory work
- machine/cable variation

Monitoring:

- target muscle stimulus
- deadlift rules/context if powerlifting
- grip fatigue spread

Future engine hooks:

- inputs: exercise category, grip-limited flag, target muscle, goal
- future sensors: user note
- confidence: medium
- automation suitability: medium

### Technical Breakdown

Situation:

Load or fatigue causes form breakdown.

Evidence available:

- repeated missed reps
- manual finish
- sudden performance drop
- user feedback
- future video/velocity data

Primary coaching objective:

Restore quality exposure.

Recommended intervention:

- Hold or reduce load.
- Reduce proximity to failure.
- Repeat the movement.
- Avoid adding load.

Reasoning:

Strength and hypertrophy require useful tension, not uncontrolled reps.

Evidence strength:

Coach judgement; strong consensus.

Alternative options:

- variation with better control
- tempo only if it supports intent and does not add needless fatigue

Monitoring:

- target-zone success
- repeated breakdown
- confidence under load

Future engine hooks:

- inputs: miss pattern, user technical flag, sudden drop, exercise role
- future sensors: video, bar path, velocity
- confidence: low without direct feedback
- automation suitability: medium

## Athlete Scenarios

### Beginner

Situation:

New lifter with limited training history.

Primary coaching objective:

Build skill, consistency, confidence, and basic progressive exposure.

Recommended intervention:

- Keep exercise selection stable.
- Use simple progression.
- Avoid high failure exposure.
- Add reps or small load when evidence is clear.
- Do not chase advanced periodisation.

Reasoning:

Beginners often progress from repeated practice and modest stimulus.

Evidence strength:

Strong evidence for progressive resistance training; coach judgement for simplicity.

Monitoring:

- adherence
- technique confidence
- soreness
- target-zone success

Future engine hooks:

- inputs: training age, exercise age, completion, target-zone success
- future sensors: confidence rating
- confidence: high
- automation suitability: high

### Intermediate

Situation:

User has training experience and slower progression.

Primary coaching objective:

Balance progression, volume, fatigue, and specificity.

Recommended intervention:

- Use performance trends, not single sessions.
- Wave stress.
- Progress via load, reps, or volume depending goal.
- Consolidate after hard weeks.

Evidence strength:

Moderate evidence; strong coaching consensus.

Monitoring:

- multi-week trends
- fatigue spread
- exercise-specific stalls

Future engine hooks:

- inputs: trend length, block, goal, volume tolerance
- future sensors: optional RPE/RIR
- confidence: high
- automation suitability: high

### Advanced Lifter

Situation:

Experienced lifter with slow adaptation and higher specificity needs.

Primary coaching objective:

Extract progress without excessive stress or novelty.

Recommended intervention:

- Smaller load jumps.
- More consolidation.
- More lift-specific decision-making.
- More caution with volume increases.

Reasoning:

Advanced lifters usually need more precise stress allocation and have less room for rapid improvement.

Evidence strength:

Limited direct evidence; strong coach judgement and specificity principles.

Monitoring:

- small trend changes
- joint/connective tissue stress
- performance equivalence

Future engine hooks:

- inputs: training age, PR proximity, load jump size, injury flags
- future sensors: velocity, RPE/RIR, sleep
- confidence: medium
- automation suitability: medium-high

### Older Lifter

Situation:

Older adult or older strength trainee.

Primary coaching objective:

Build or preserve strength, muscle, confidence, and function while managing recovery and joint tolerance.

Recommended intervention:

- Progressive resistance training remains appropriate.
- Use conservative load jumps.
- Prioritise consistency and recovery.
- Avoid sudden volume/intensity spikes.

Reasoning:

Research supports progressive resistance training in older adults, but recovery and connective tissue tolerance require respect.

Evidence strength:

Strong evidence for resistance training benefits; coach judgement for progression rate.

Monitoring:

- soreness duration
- joint feedback
- adherence
- performance trend

Future engine hooks:

- inputs: age/training age, soreness, completion, load jumps
- future sensors: sleep, pain flags
- confidence: high
- automation suitability: high with safety caps

### Highly Stressed Individual

Situation:

High work/life stress affects training.

Primary coaching objective:

Maintain training continuity and prevent stress stacking.

Recommended intervention:

- Reduce volume before removing training.
- Keep key lifts or patterns.
- Use consolidation exposures.
- Avoid maximal effort demands.

Reasoning:

Life stress can reduce recovery and adherence even when training logs are incomplete.

Evidence strength:

Moderate evidence for sleep/recovery impact; coach judgement for stress.

Monitoring:

- missed sessions
- performance volatility
- session completion
- future subjective stress

Future engine hooks:

- inputs: missed sessions, volatility, completion
- future sensors: sleep, HRV, stress rating
- confidence: low-medium without direct input
- automation suitability: medium

### Shift Worker

Situation:

Irregular sleep and training times.

Primary coaching objective:

Preserve consistency and avoid punishing circadian disruption.

Recommended intervention:

- Use flexible scheduling.
- Avoid calendar-driven escalation.
- Reduce intensity after poor sleep blocks.
- Prioritise repeatable sessions.

Reasoning:

Shift work disrupts sleep and recovery; training should adapt to inconsistent readiness.

Evidence strength:

Moderate evidence for sleep/circadian effects; coach judgement for prescription.

Monitoring:

- missed sessions
- performance variance by schedule
- sleep input when available

Future engine hooks:

- inputs: delayed sessions, session timing, volatility
- future sensors: sleep schedule, HRV
- confidence: medium with sleep data, low without
- automation suitability: medium

### Parent / Time-Constrained Athlete

Situation:

User has limited time and unpredictable schedule.

Primary coaching objective:

Protect minimum effective training and adherence.

Recommended intervention:

- Prioritise main lift/pattern and highest-value accessories.
- Reduce lower-value volume.
- Use shorter sessions.
- Do not punish missed assistance work.

Reasoning:

Time-efficient training can still produce meaningful strength and hypertrophy adaptations when essentials are preserved.

Evidence strength:

Moderate evidence; strong practical consensus.

Monitoring:

- completion rate
- session duration
- skipped exercises
- progress despite lower volume

Future engine hooks:

- inputs: session duration, skipped exercise, completion rate, user time setting
- future sensors: calendar availability
- confidence: high
- automation suitability: high

### Bodybuilder

Situation:

Primary goal is hypertrophy.

Primary coaching objective:

Allocate productive muscle volume while managing local and systemic fatigue.

Recommended intervention:

- Progress reps and volume before aggressive load.
- Use local fatigue interpretation.
- Prioritise muscle coverage.
- Keep systemic fatigue controlled.

Evidence strength:

Strong evidence for volume and hypertrophy; moderate evidence for exact landmarks.

Monitoring:

- muscle volume
- local fatigue
- performance stability
- recovery

Future engine hooks:

- inputs: muscle-level volume, exercise role, target-zone success
- future sensors: bodyweight, photos/measurements
- confidence: high
- automation suitability: high

### Powerlifter

Situation:

Primary goal is squat/bench/deadlift performance.

Primary coaching objective:

Preserve competition-lift specificity and manage fatigue.

Recommended intervention:

- Prioritise main lift exposure.
- Wave intensity/volume.
- Reduce accessories before main lift practice.
- Use conservative load jumps.

Evidence strength:

Strong evidence for specificity; moderate evidence for exact wave.

Monitoring:

- SBD trends
- fatigue around heavy exposures
- meet proximity

Future engine hooks:

- inputs: competition lift status, block, meet date, e1RM confidence
- future sensors: velocity, RPE
- confidence: high
- automation suitability: high

### General Strength Trainee

Situation:

User wants to get stronger and look/feel better without competing.

Primary coaching objective:

Balance strength exposure, hypertrophy support, recovery, and adherence.

Recommended intervention:

- Use moderate progression.
- Keep sessions understandable.
- Avoid over-specialised complexity.
- Preserve broad movement coverage.

Evidence strength:

Strong evidence for progressive resistance training; coach judgement for balance.

Monitoring:

- adherence
- strength trend
- hypertrophy support volume
- fatigue

Future engine hooks:

- inputs: goal, completion, performance trend, fatigue
- future sensors: bodyweight, preference
- confidence: high
- automation suitability: high

## Recovery Scenarios

### Poor Sleep

Situation:

User slept poorly before training.

Primary coaching objective:

Avoid overreacting to one poor-readiness exposure while preventing risky escalation.

Recommended intervention:

- Keep the session if safe.
- Hold load or reduce intensity expectations.
- Avoid PR chasing.
- Judge trend after sleep normalises.

Evidence strength:

Moderate evidence for sleep affecting performance/recovery.

Monitoring:

- repeated poor sleep
- performance rebound
- missed sessions

Future engine hooks:

- inputs: future sleep, performance volatility, missed sessions
- future sensors: sleep tracker
- confidence: low without sleep data, high with repeated sleep signal
- automation suitability: medium

### Travel

Situation:

User returns from travel or trains with different equipment.

Primary coaching objective:

Maintain continuity without forcing invalid comparisons.

Recommended intervention:

- Lower confidence in performance comparisons.
- Use repeat/re-entry sessions.
- Avoid aggressive progression.
- Account for equipment differences.

Evidence strength:

Coach judgement.

Monitoring:

- first 1-2 sessions back
- equipment changes
- soreness

Future engine hooks:

- inputs: training gap, equipment preset change, missed sessions
- future sensors: travel flag
- confidence: medium
- automation suitability: medium-high

### Illness Recovery

Situation:

User returns after illness.

Primary coaching objective:

Restore training gradually and avoid relapse/overload.

Recommended intervention:

- Reduce load/volume first session back.
- Avoid near-failure.
- Progress only after completion evidence.
- Suggest medical advice for concerning symptoms.

Evidence strength:

Coach judgement; health safety consensus.

Monitoring:

- symptoms
- completion
- performance rebound
- excessive fatigue

Future engine hooks:

- inputs: training gap, illness flag, first-session-back status
- future sensors: resting HR, sleep
- confidence: medium
- automation suitability: medium due safety

### High Work Stress

Situation:

Work stress is high.

Primary coaching objective:

Keep training productive without stacking excessive stress.

Recommended intervention:

- Hold or consolidate.
- Reduce accessory volume.
- Keep main pattern exposure.
- Avoid failure demands.

Evidence strength:

Limited direct evidence; coach judgement and recovery principles.

Monitoring:

- consistency
- performance volatility
- missed sessions

Future engine hooks:

- inputs: missed sessions, volatility, user stress input
- future sensors: stress rating, HRV
- confidence: low-medium
- automation suitability: medium

### High Soreness

Situation:

User is very sore.

Primary coaching objective:

Distinguish normal soreness from recovery-limiting fatigue or excessive volume.

Recommended intervention:

- If performance normal: train, possibly reduce volume.
- If performance down: reduce local volume or consolidate.
- Avoid adding sets to sore region.

Evidence strength:

Moderate evidence; coach judgement.

Monitoring:

- soreness duration
- performance effect
- repeated muscle-specific soreness

Future engine hooks:

- inputs: soreness flag, performance, muscle volume
- future sensors: soreness scale
- confidence: medium
- automation suitability: medium

### Excellent Recovery

Situation:

User feels and performs well repeatedly.

Primary coaching objective:

Use available recovery without unnecessary escalation.

Recommended intervention:

- Progress the highest-priority variable.
- Do not add load and volume everywhere.
- Preserve wave structure.

Evidence strength:

Moderate evidence; coach judgement.

Monitoring:

- whether added stress remains productive
- fatigue delayed response

Future engine hooks:

- inputs: performance trend, completion, fatigue low, recovery reports
- future sensors: sleep/HRV
- confidence: high if repeated
- automation suitability: high

### Missed Sessions

Situation:

User misses planned sessions.

Primary coaching objective:

Preserve continuity and avoid calendar-driven progression.

Recommended intervention:

- Keep current training week until planned work is completed.
- Repeat or consolidate.
- Do not skip forward automatically.

Evidence strength:

Coach judgement; strong product principle.

Monitoring:

- completion-based week progress
- performance after delay

Future engine hooks:

- inputs: planned sessions complete, training week state, gap length
- future sensors: calendar
- confidence: high
- automation suitability: high

### Unexpected Training Break

Situation:

User takes more than one week off unexpectedly.

Primary coaching objective:

Re-enter training safely.

Recommended intervention:

- Reduce first exposure back.
- Preserve familiar exercises.
- Avoid PR attempts.
- Restore normal progression after successful completion.

Evidence strength:

Coach judgement; moderate recovery/detraining rationale.

Monitoring:

- soreness
- completion
- performance rebound

Future engine hooks:

- inputs: gap length, prior block, first session back
- future sensors: sleep/stress
- confidence: high
- automation suitability: high

## Goal Scenarios

### Hypertrophy Goal

Coach priority:

Buy enough productive local volume and tension without drowning the user in systemic fatigue.

Decision hierarchy:

1. reps
2. local volume
3. load
4. exercise variation
5. recovery if systemic

Evidence strength:

Strong for volume/tension; moderate for exact volume landmarks.

Future engine hooks:

- muscle volume, target-zone success, local fatigue, systemic fatigue

### General Strength Goal

Coach priority:

Improve force production while maintaining broad fitness and recoverability.

Decision hierarchy:

1. load where evidence supports it
2. reps
3. intensity wave
4. targeted support volume
5. consolidation

Evidence strength:

Strong for specificity/progression; moderate for exact wave.

Future engine hooks:

- e1RM, primary lift trend, fatigue, exercise role

### Powerlifting Goal

Coach priority:

Improve squat, bench, and deadlift performance.

Decision hierarchy:

1. competition lift specificity
2. intensity/volume wave
3. back-off work
4. accessories
5. taper/recovery

Evidence strength:

Strong for specificity; coach judgement for individual peaking.

Future engine hooks:

- SBD trends, meet date, e1RM confidence, fatigue

### Body Recomposition Goal

Coach priority:

Preserve/build muscle while managing recovery and cardio/energy constraints.

Decision hierarchy:

1. preserve performance
2. reps before load
3. conservative volume
4. cardio integration
5. recovery support

Evidence strength:

Moderate evidence; depends on nutrition data.

Future engine hooks:

- bodyweight future, cardio, performance trend, fatigue

### Maintenance Goal

Coach priority:

Retain strength and muscle with minimum effective stress.

Decision hierarchy:

1. maintain key exposure
2. reduce unnecessary volume
3. keep sessions easy to complete
4. avoid novelty

Evidence strength:

Moderate evidence; coach judgement.

Future engine hooks:

- completion, strength preservation, time constraints

### Peaking / Meet Prep

Coach priority:

Express strength at the right time.

Decision hierarchy:

1. specificity
2. fatigue reduction
3. intensity maintenance
4. volume reduction
5. novelty removal

Evidence strength:

Moderate evidence for tapering; strong coaching consensus.

Future engine hooks:

- meet date, block, primary lift trend, fatigue, recent heavy exposures

## Decision Trees

### Performance-Fatigue Matrix

```text
Performance up + fatigue low
→ progress one variable

Performance up + fatigue high
→ consolidate or reduce support stress

Performance stable + fatigue low
→ repeat, add reps, or add small stimulus if repeated

Performance stable + fatigue high
→ reduce fatigue cost, hold load

Performance down + fatigue low
→ check data, repeat, assess skill/stimulus

Performance down + fatigue high
→ reduce stress, preserve essentials, recover
```

### Intervention Ranking by Situation

#### Need more hypertrophy stimulus

1. improve reps in target zone
2. add low-fatigue set
3. add load after top-zone success
4. change exercise if stale
5. increase frequency only if schedule and recovery support it

#### Need more strength specificity

1. preserve primary lift
2. add small load exposure
3. adjust rep target lower
4. reduce accessory fatigue
5. consolidate

#### Need less fatigue

1. reduce proximity to failure
2. remove accessory set
3. reduce secondary volume
4. reduce primary volume
5. reduce primary load
6. Recovery Window

#### Need better adherence

1. reduce session complexity
2. reduce session length
3. preserve highest-value exercises
4. simplify targets
5. reduce frequency only if unavoidable

## Behavioural Coaching

### Confidence

Excellent coaches build confidence by making training understandable and achievable.

Coach should:

- highlight progress beyond PRs
- frame holds as purposeful
- avoid shame
- make the next action clear

Evidence:

Moderate evidence from self-efficacy and exercise-adherence research.

### Adherence

Coach should:

- reduce unnecessary choices
- prioritise completion
- adapt after missed sessions
- avoid punitive catch-up logic

Evidence:

Strong behavioural rationale; moderate direct training evidence.

### Motivation

Coach should:

- support autonomy
- show competence
- connect today's work to the user's goal
- avoid overcomplication

Evidence:

Moderate evidence from self-determination theory in exercise.

### Autonomy

Coach should:

- guide rather than command
- allow sensible alternatives
- explain decisions when stakes are high

Evidence:

Moderate evidence from motivation/adherence research.

### Consistency

Coach should:

- make returning after interruption easy
- avoid making the user feel behind
- preserve training week continuity

Evidence:

Coach judgement plus adherence principles.

## Future Engine Integration

This playbook can become the reasoning layer for Adaptive Stress Allocation if each scenario is later represented as:

```text
scenario_id
evidence_inputs
confidence_rules
primary_objective
allowed_interventions
blocked_interventions
monitoring_rules
user_copy
```

### Automation Suitability

High suitability:

- target-zone success progression
- repeated missed reps
- performance up/fatigue low
- performance down/fatigue high
- missed-session continuity
- local accessory failure

Medium suitability:

- poor sleep without direct sleep data
- joint irritation
- technique breakdown
- advanced lifter nuance
- shift worker adaptation

Low suitability:

- pain diagnosis
- medical concerns
- complex psychological barriers
- nuanced technical corrections without video

### Future Sensors

Useful future inputs:

- sleep duration/quality
- HRV/resting heart rate
- bodyweight
- nutrition phase
- subjective soreness
- pain/discomfort flag
- optional RPE/RIR
- bar velocity
- session duration/density
- user preference
- calendar availability

## Open Questions

1. How many repeated exposures define a true plateau for each exercise class?
2. How should the app distinguish poor execution from underdosing?
3. Should advanced users be offered optional RPE/RIR?
4. How should subjective pain be collected without becoming medical advice?
5. How should bodyweight and nutrition phase alter volume progression?
6. What is the minimum useful sleep input?
7. How should time-constrained users choose between shorter sessions and fewer days?
8. How should the app communicate "do less" without reducing motivation?
9. How should the coach balance user autonomy with safety guardrails?
10. Which scenarios require human/medical referral language?

## Research Citations

Training and prescription:

- ACSM progression models in resistance training: https://pubmed.ncbi.nlm.nih.gov/19204579/
- ACSM 2025 resistance training position stand update: https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/
- Schoenfeld. Mechanisms of muscle hypertrophy: https://pubmed.ncbi.nlm.nih.gov/20847704/
- Schoenfeld, Ogborn, Krieger. Weekly resistance training volume and hypertrophy: https://pubmed.ncbi.nlm.nih.gov/27433992/
- Krieger. Single vs multiple sets for hypertrophy: https://pubmed.ncbi.nlm.nih.gov/20300012/
- Ralston et al. Weekly set volume and strength gain meta-analysis: https://pmc.ncbi.nlm.nih.gov/articles/PMC5684266/
- Loading recommendations for strength, hypertrophy, and endurance: https://pmc.ncbi.nlm.nih.gov/articles/PMC7927075/
- Resistance training variables for hypertrophy umbrella review: https://pmc.ncbi.nlm.nih.gov/articles/PMC9302196/
- Resistance training to failure meta-analysis: https://pubmed.ncbi.nlm.nih.gov/33497853/
- Helms et al. RPE-based load prescription in powerlifting: https://pubmed.ncbi.nlm.nih.gov/24662224/
- Zourdos et al. Flexible nonlinear periodisation/autoregulation: https://pubmed.ncbi.nlm.nih.gov/25144187/
- Autoregulation in resistance training: https://pmc.ncbi.nlm.nih.gov/articles/PMC7575491/

Recovery, older lifters, and time constraints:

- Sleep and recovery practices of athletes: https://pmc.ncbi.nlm.nih.gov/articles/PMC8072992/
- Progressive resistance strength training in older adults: https://pmc.ncbi.nlm.nih.gov/articles/PMC4324332/
- Resistance Training for Older Adults position statement: https://pubmed.ncbi.nlm.nih.gov/31343601/
- No Time to Lift? Designing time-efficient training programs: https://pmc.ncbi.nlm.nih.gov/articles/PMC8449772/
- Exercise interventions for shift workers: https://pmc.ncbi.nlm.nih.gov/articles/PMC12920463/

Behaviour:

- Exercise, physical activity, and self-determination theory: https://pmc.ncbi.nlm.nih.gov/articles/PMC3441783/
- Self-determination and physical exercise adherence: https://pmc.ncbi.nlm.nih.gov/articles/PMC4519215/
- Exercise self-efficacy and control beliefs: https://pmc.ncbi.nlm.nih.gov/articles/PMC3740728/
- Resistance training effects on self-efficacy and physical self-worth: https://pmc.ncbi.nlm.nih.gov/articles/PMC6609926/

## Final Assessment

Yes, this Coaching Playbook can become the reasoning layer behind Adaptive Stress Allocation.

It should not become a rigid ruleset. Its value is in preserving coaching judgement:

- what evidence matters
- what objective comes first
- what intervention is cheapest
- when to progress
- when to hold
- when to pull back
- when to protect adherence

Adaptive Strength Coach should eventually use this playbook to make recommendations feel less like a formula and more like a calm, experienced coach making the right next call.

The playbook's permanent standard:

> Choose the intervention that best improves long-term adaptation with the least unnecessary fatigue, risk, confusion, and loss of confidence.
