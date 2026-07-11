# Evidence Capture Model v1

Status: research and architecture.

Project: Adaptive Strength Coach V2.

Purpose: define what Adaptive Strength Coach can observe automatically, what it may infer, what it may ask the athlete, and what it should never ask.

This document supports the Adaptive Strength Coach Charter, Coaching State, Safety Gate, and future Decision Engine work.

## Executive Summary

Adaptive Strength Coach should behave like an experienced coach watching training evidence accumulate over time.

The coach should not interrogate the athlete for information it can reliably infer from logged training.

Objective training evidence has the highest authority. Subjective evidence is useful when it explains objective events, clarifies uncertainty, or flags safety risk. It should not replace training evidence.

The app should ask fewer questions, ask only at useful moments, and avoid generic readiness or wellness questionnaires.

Core rule:

Never ask the athlete for information the coach can reliably infer.

## Evidence Hierarchy

1. Objective performance evidence
   - completed planned workouts
   - working sets
   - load
   - reps or seconds
   - target range success
   - missed ranges
   - shutdowns
   - progression
   - comparable workload trends
2. Training behaviour
   - consistency
   - missed sessions
   - skipped work
   - repeated swaps
   - workout completion timing
3. Recovery behaviour
   - session spacing
   - recovery week acceptance
   - recovery week completion
   - recovery/cardio/capacity completion where relevant
4. Subjective explanation
   - pain explanation
   - what stopped a set
   - equipment/time limitation
   - unusual symptoms
5. Subjective context
   - sleep
   - stress
   - soreness
   - motivation
   - perceived readiness
6. Future sensor context
   - HRV
   - resting heart rate
   - sleep duration
   - wearable sleep quality
   - training load estimates

Future sensor data remains context until validated against outcomes inside ASC.

## Evidence Inventory

| Evidence source | Class | Reliability | User effort | Interpretation difficulty | Manipulation risk | Coaching value | Rank | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Planned workout exists | Automatic | High | None | Low | Low | High | Excellent | Establishes intended training exposure. |
| Workout completed | Automatic | High | None | Low | Low | High | Excellent | Core evidence for consistency and training week progression. |
| Working set logged | Automatic | High | Low | Low | Low | High | Excellent | Primary evidence unit. |
| Load used | Automatic | High | Low | Moderate | Low | High | Excellent | Must compare only within comparable exercise/context. |
| Reps completed | Automatic | High | Low | Low | Low | High | Excellent | Primary performance outcome for rep-based work. |
| Seconds completed | Automatic | High | Low | Low | Low | High | Excellent | Primary performance outcome for duration-based work. |
| Target range success | Inferred | High | None | Low | Low | High | Excellent | Compare completed reps/seconds against prescribed range. |
| Missed minimum range | Inferred | High | None | Low | Low | High | Excellent | Strong evidence that prescription may be too aggressive. |
| Above range performance | Inferred | High | None | Moderate | Low | High | Good | Useful but should not trigger instant aggressive loading alone. |
| Load progression | Inferred | High | None | Moderate | Low | High | Excellent | Must distinguish productive progression from deterioration. |
| Comparable-workload trend | Inferred | High | None | High | Low | High | Excellent | Requires matching exercise, load/context, target, and recency. |
| Same-load collapse | Inferred | Moderate | None | High | Low | High | Good | Safety-relevant only when repeated, below range, or paired with technique/pain. |
| Shutdown/stop rule event | Inferred | Moderate | None | Moderate | Low | High | Good | Needs explanation if cause is unclear. |
| Skipped exercise | Automatic | Moderate | None | Moderate | Moderate | Moderate | Acceptable | Reason may matter: time, equipment, pain, preference, or fatigue. |
| Exercise swap | Automatic | Moderate | Low | Moderate | Moderate | Moderate | Acceptable | Repeated swaps can indicate logistics, dislike, pain, or poor fit. |
| Extra session completed | Automatic | High | None | Moderate | Low | Moderate | Good | Should not automatically count as planned progression evidence. |
| Session Prep completed/skipped | Automatic | High | None | Low | Low | Low | Acceptable | Useful for adherence/context, not progression evidence. |
| Warm-up sets | Automatic | High | Low | Moderate | Low | Moderate | Good | Useful for ramp behaviour, excluded from progression evidence. |
| Capacity session completed | Automatic | High | None | Moderate | Low | Moderate | Good | May inform capacity exposure, not main progression. |
| Cardio/recovery work completed | Automatic | High | None | Moderate | Low | Moderate | Good | May inform recovery/cardio adherence, not strength progression. |
| Session spacing | Inferred | High | None | Low | Low | High | Excellent | Important for recovery capacity and frequency tolerance. |
| Missed sessions | Inferred | High | None | Moderate | Low | High | Good | Interpret with caution; absence is not always failure. |
| Consistency streak | Inferred | High | None | Low | Low | Moderate | Good | Useful for momentum and confidence. |
| Recovery week recommended | Automatic | High | None | Moderate | Low | Moderate | Good | Recommendation evidence, not user state by itself. |
| Recovery week accepted | Automatic | High | None | Low | Low | High | Good | Indicates user follows recovery intervention. |
| Recovery week completed | Automatic | High | None | Low | Low | High | Excellent | Strong recovery behaviour evidence. |
| Pain flag | User supplied | Moderate | Low | Moderate | Low | Very high | Excellent | Safety exception: can override objective progression. |
| Sharp/worsening pain | User supplied | Moderate | Low | Moderate | Low | Very high | Excellent | Safety Gate input with veto power. |
| What stopped the set | User supplied | Moderate | Low | Moderate | Moderate | High | Good | Ask only when objective evidence cannot explain the stop. |
| Equipment limitation | User supplied | Moderate | Low | Low | Low | Moderate | Good | Useful for substitutions and logistics. |
| Time limitation | User supplied | Moderate | Low | Low | Low | Moderate | Good | Useful for adherence and session compression. |
| Technique concern | User supplied | Moderate | Low | Moderate | Low | High | Good | Useful when paired with objective failure/drop-off. |
| Soreness | User supplied | Low | Low | High | Moderate | Low/moderate | Acceptable | Context only unless it changes movement or safety. |
| Sleep quality | User supplied | Low | Low | High | Moderate | Low/moderate | Acceptable | Context only; should not dominate coaching. |
| Stress | User supplied | Low | Low | High | Moderate | Low/moderate | Acceptable | Context only; useful for explanation and tone. |
| Motivation | User supplied | Low | Low | High | Moderate | Low | Poor | Should not drive load decisions. |
| Readiness rating | User supplied | Low | Low | High | High | Low | Poor | Avoid as routine input. |
| RPE/RIR | User supplied | Moderate for trained users, low for many | Moderate | High | High | Moderate | Poor/Acceptable | Avoid RPE-led coaching for ASC's core product. |
| HRV | Future sensor | Variable | None | High | Low | Unknown | Acceptable | Context until validated against ASC outcomes. |
| Resting heart rate | Future sensor | Variable | None | High | Low | Unknown | Acceptable | Context until validated. |
| Wearable sleep duration | Future sensor | Variable | None | High | Low | Unknown | Acceptable | Context until validated. |
| Wearable sleep quality | Future sensor | Variable | None | High | Low | Unknown | Poor/Acceptable | Vendor-derived, should not drive coaching alone. |

## Evidence Cost Model

Evidence should be preferred when it has:

- high reliability
- low user effort
- low interpretation difficulty
- low manipulation risk
- high coaching value

### Excellent

Use as primary coaching evidence.

Examples:

- completed planned workout
- working sets
- load
- reps/seconds
- target range success or miss
- session spacing
- recovery week completion

### Good

Use as supporting evidence.

Examples:

- load progression
- same-lift trend
- exercise swaps
- missed sessions
- recovery/cardio/capacity completion
- pain flag
- what stopped a set

### Acceptable

Use as context, not dominant evidence.

Examples:

- soreness
- sleep
- stress
- future HRV
- resting heart rate
- wearable sleep duration

### Poor

Avoid routine use.

Examples:

- general readiness scores
- motivation ratings
- broad wellness questionnaires
- routine RPE/RIR-led decisions for normal users

## Inference Rules

ASC should infer whenever objective evidence is sufficient.

| Question | Can ASC infer it? | Evidence | Ask user? |
| --- | --- | --- | --- |
| Did the athlete complete the workout? | Yes | Completed workout record | No |
| Did the athlete complete planned working sets? | Yes | Set log and session structure | No |
| Was the target range hit? | Yes | Reps/seconds versus prescription | No |
| Was the load likely too heavy today? | Usually | Below minimum range, repeated miss, same-load trend | Usually no |
| Did the athlete progress load? | Yes | Current load versus previous comparable load | No |
| Was heavier-load fatigue productive? | Usually | Load increased and reps stayed in range | No |
| Did performance decline at comparable workload? | Usually | Same exercise/load/context trend | No |
| Was there local lift failure? | Yes | One exercise below range/drop-off | No |
| Was there systemic fatigue? | Partly | Multiple lifts down, recovery capacity, session trend | Only if cause unclear |
| Why did the athlete stop early? | No | Objective stop event lacks cause | Yes, narrowly |
| Was pain involved? | No | Cannot safely infer pain | Yes, when safety-relevant |
| Was equipment unavailable? | No | Swap/skip may suggest it, but not prove it | Yes, if needed |
| Did stress or sleep cause poor performance? | No | Can explain, not prove | Ask only if needed for context |
| Is the athlete motivated? | No | Behaviour can show adherence, not internal state | Usually no |
| Should the athlete deload because they feel tired? | No | Requires objective/systemic evidence | No generic prompt |

## Prompt Decision Tree

1. Did objective evidence clearly explain the event?
   - If yes, do not ask.
   - Example: reps below minimum range means load/prescription evidence exists.

2. Is there a safety concern?
   - If yes, ask only the minimum safety clarification needed.
   - Pain and unusual symptoms can override objective progression.

3. Did the athlete stop, skip, or swap in a way the app cannot interpret?
   - If yes, ask one narrow explanation question.

4. Would the answer change coaching?
   - If no, do not ask.

5. Would the question increase cognitive load without improving coaching?
   - If yes, do not ask.

6. Is this a general wellness, readiness, or motivation question?
   - If yes, do not ask by default.

## Allowed Prompts

Allowed prompts are narrow, event-triggered, and coach-useful.

### Early Stopped Set

Trigger:

- working set ends far below expected range
- shutdown occurs
- objective data cannot explain cause

Prompt:

What stopped the set?

Options:

- Fatigue
- Pain
- Technique
- Equipment
- Time
- Other

### Skipped Exercise

Trigger:

- planned exercise skipped
- repeated skip pattern appears

Prompt:

Why did you skip this exercise?

Options:

- Time
- Equipment
- Pain
- Too fatigued
- Did a substitute
- Other

### Exercise Swap

Trigger:

- repeated swap of the same exercise
- swap affects evidence continuity

Prompt:

Why did you swap this exercise?

Options:

- Equipment unavailable
- Preferred alternative
- Pain/discomfort
- Too busy
- Other

### Pain/Safety Clarification

Trigger:

- user flags pain
- sharp/worsening/unusual symptoms
- severe same-load collapse with technique issue

Prompt:

What happened?

Options:

- Sharp pain
- Worsening pain
- Dizziness or unusual symptoms
- Movement felt unsafe
- Mild discomfort
- Other

### Missed Session Explanation

Trigger:

- repeated missed planned sessions
- plan adherence is affected

Prompt:

What got in the way?

Options:

- Time
- Recovery
- Illness
- Travel
- Motivation
- Other

This prompt should support scheduling and adherence, not judge the athlete.

## Banned Prompts

ASC should not routinely ask:

- How hard was it?
- Rate today's readiness.
- Rate your motivation.
- How recovered do you feel from 1-10?
- How stressed are you from 1-10?
- How well did you sleep from 1-10?
- How sore are you from 1-10?
- What is your RPE for every set?
- How many reps in reserve did you have for every set?
- Long daily wellness questionnaires.
- Mood questionnaires.
- Generic "how are you feeling today?" prompts before training.

These questions may feel coach-like, but they often create noise, burden, and false precision.

## Subjective Authority Rules

Normal rule:

Objective evidence outranks subjective evidence.

Subjective evidence may:

- explain why an objective event happened
- add caution
- soften a future recommendation
- inform user messaging
- trigger monitoring
- improve adherence support

Subjective evidence must not, by itself, trigger:

- recovery week
- major deload
- major load reduction
- block change
- programme rewrite
- aggressive progression

Exception:

Safety.

Pain, sharp pain, worsening pain, dizziness, unusual symptoms, injury concern, or "this feels unsafe" can override objective progression and enter the Safety Gate.

## Examples

### Missed Range

Evidence:

- Bench Press target 8-12
- User logs 100kg x 5

Inference:

- ASC can infer the prescription was too heavy for that set.

Prompt:

- Do not ask "how hard was it?"
- Ask only if the set stopped unusually or safety is unclear.

### Productive Heavier-Load Fatigue

Evidence:

- 5kg x 25, 25, 25
- 10kg x 20, 16
- target 12-25

Inference:

- Heavier-load performance stayed inside range.
- Productive fatigue, not deterioration.

Prompt:

- No prompt needed.

### Skip With Unknown Cause

Evidence:

- User skips Deadlift twice in two weeks.

Inference:

- ASC cannot know whether this is equipment, pain, time, dislike, or fatigue.

Prompt:

- Ask one narrow skip reason.

### Strong Performance, Poor Readiness

Evidence:

- User reports poor readiness.
- Working sets exceed target range.
- Training is consistent.

Inference:

- Objective performance remains high authority.

Action:

- Subjective readiness may soften aggression slightly.
- It should not trigger recovery week or major reduction alone.

### Declining Performance, Feels Great

Evidence:

- User reports feeling great.
- Multiple lifts are below range.
- Comparable workloads are declining.

Inference:

- Objective decline outranks subjective optimism.

Action:

- Coaching State should reflect reduced recovery capacity/momentum.

### Sharp Pain

Evidence:

- User reports sharp pain during squat.

Inference:

- Safety exception applies.

Action:

- Safety Gate may stop the affected movement regardless of otherwise strong performance.

## Future Sensor Data

Future wearable data may eventually include:

- HRV
- resting heart rate
- sleep duration
- sleep quality
- respiration rate
- training load estimates

Initial status:

Context only.

Wearable data should not override training evidence until ASC validates that it improves coaching decisions and long-term outcomes.

Wearable data may help:

- explain uncertainty
- detect unusual recovery context
- support trend monitoring
- improve optional coaching notes

Wearable data should not independently trigger:

- deloads
- major load reductions
- recovery weeks
- block changes
- programme rewrites

Safety exception remains:

If future sensor data detects a serious safety-relevant issue, it should route through Safety Gate, not ordinary Coaching State.

## Prompt Principles

Every prompt must pass all five tests:

1. The app cannot reliably infer the answer.
2. The answer could change coaching.
3. The question is narrow and event-triggered.
4. The prompt does not shame or burden the athlete.
5. The answer has a clear place in Coaching State, Safety Gate, or future Decision Engine logic.

If a prompt fails any test:

Do not ask.

## Open Aaron Decisions

1. Should ASC ever ask RPE/RIR from advanced powerlifters as an optional expert mode, or should this remain excluded from the core product?
2. Should pain prompts appear immediately during workout logging, after the session, or both depending on severity?
3. Should repeated exercise swaps ask after the second swap, third swap, or only when evidence continuity is harmed?
4. Should missed-session explanations be optional, delayed, or only asked when missed sessions repeat?
5. Should wearable integrations be excluded until ASC has enough internal outcome data to validate them?
6. Should "motivation" remain an allowed missed-session explanation, or does it risk pulling ASC into wellness-questionnaire territory?
7. Should subjective sleep/stress ever appear in customer-facing coaching copy, or stay internal context only?

## Final Position

Adaptive Strength Coach should ask fewer questions than most coaching apps.

It should observe behaviour, infer carefully, and interrupt only when the answer materially improves coaching or safety.

Objective training evidence drives the coach.

Subjective input explains, contextualises, and protects.

Safety always has the right to interrupt.
