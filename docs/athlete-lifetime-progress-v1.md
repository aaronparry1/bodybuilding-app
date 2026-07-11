# Athlete Lifetime Progress v1

Status: research and design only.  
Date: 2026-06-28

This document defines the optimisation target for Adaptive Strength Coach V2.

It does not implement code, change workout generation, modify V1 progression, or alter production app behaviour.

## Executive Summary

Athlete Lifetime Progress is the coach's estimate of whether its decisions increase the athlete's expected long-term progress.

It is not a prediction of the user's entire future. It is a coaching proxy: a structured way to judge whether today's decision makes the athlete more likely to keep adapting, recovering, training, and improving over months and years.

The central question is:

> What should count as a point scored for the coach?

Adaptive Strength Coach should score a point when a decision improves the athlete's expected long-term trajectory without sacrificing safety, recovery, confidence, enjoyment, or adherence.

The app should not optimise for the most impressive single session. It should optimise for the highest probability of meaningful progress that the athlete can sustain.

## Definition

Athlete Lifetime Progress, or ALP, is the expected long-term coaching value created by a decision.

ALP increases when the athlete becomes more likely to:

- progress toward their stated goal
- adapt productively to training
- recover well enough to keep training
- remain safe and avoid unnecessary disruption
- maintain momentum
- build confidence
- adhere to the programme
- enjoy training enough to continue
- tolerate training stress sustainably
- reduce injury, pain, burnout, or interruption risk

ALP decreases when a decision creates short-term performance at the expense of the long-term training process.

## What ALP Should Not Optimise

ALP must not reward:

- today's performance only
- short-term PRs that compromise future training
- engagement for its own sake
- more volume for its own sake
- scale weight alone
- fatigue tolerance as a badge of honour
- streaks at the expense of recovery
- aggressive loading without ownership
- excessive novelty
- fake wins
- user dependency or manipulation
- pushing through worsening pain

The app should be proud of a boring-looking decision if that decision protects long-term progress.

## Input Categories

### 1. Goal Progress

Goal progress measures whether the athlete is moving toward the outcome they chose.

For Strength:

- Competition Squat trend
- Competition Bench Press trend
- Competition Deadlift trend
- secondary strength lifts such as Standing Overhead Press or Military Press
- owned-load trend
- comparable-load performance
- meaningful rep PRs

For Build Muscle:

- total quality work volume trend
- productive sets by target muscle
- hypertrophy-range performance
- ability to complete more quality work over time
- stimulus gained without disproportionate recovery cost

For Build Muscle + Strength:

- strength trend in key lifts
- quality volume trend
- load ownership
- target-range success
- recovery response to combined stress

For Get Lean:

- performance preservation
- strength maintenance
- quality work retained during the cut
- training consistency
- optional body fat or waist trend if supplied
- body weight only as context, not proof of fat loss

For Athletic Performance:

- strength in key compound patterns
- dynamic or power exercise performance where available
- quality work with moderate loads
- future jump, throw, sprint, bar-speed, or timing data only when measured directly

Goal progress should be trend-based. One exceptional session can support confidence, but it should not dominate the ALP estimate.

### 2. Coaching State

Coaching State provides the current internal view of the athlete:

- adaptation
- recovery_capacity
- momentum
- confidence
- coaching_opportunity
- evidence_quality

These scores should influence ALP but not replace goal progress or safety.

Example:

An athlete may be improving strength while recovery capacity is falling. ALP should recognise the progress, but also identify rising risk to future progress.

### 3. Safety and Risk

Safety can override otherwise positive signals.

Inputs include:

- Safety Gate status
- pain flags
- worsening symptoms
- sharp or unusual pain
- repeated failed target ranges
- repeated shutdowns
- severe same-load collapse
- excessive workload density
- high-fatigue movement clustering
- poor response after rest
- repeated missed sessions after overload

An unsafe decision cannot have a high ALP score, even if it produces a short-term PR.

### 4. Sustainability

Sustainability measures whether the training process can continue.

Inputs include:

- session completion
- planned sessions missed
- repeated overrides
- time burden
- session density
- unnecessary complexity
- excessive fatigue cost
- recovery week use and response
- ability to return after disruption

Good coaching protects the athlete's ability to keep showing up.

### 5. Enjoyment and Variety

Enjoyment matters because adherence matters.

Inputs include:

- useful variation
- clear wins
- meaningful milestones
- boredom or staleness if inferable
- confidence-building exposure
- training that feels purposeful

ALP should not reward cheap gamification. It should reward enjoyment when enjoyment helps the athlete train better for longer.

## Lab-Only ALP Score

Future lab work should define an `AthleteLifetimeProgress` object:

```json
{
  "alp_score": 0,
  "trend": "uncertain",
  "confidence": 0,
  "time_horizon": "lifetime_proxy",
  "contributing_factors": [],
  "risk_factors": [],
  "goal_progress_summary": "",
  "coaching_state_summary": "",
  "safety_summary": "",
  "sustainability_summary": "",
  "enjoyment_summary": "",
  "last_updated": ""
}
```

### Score Semantics

`alp_score` uses a 0-100 scale:

- 90-100: exceptional long-term trajectory
- 75-89: strong long-term trajectory
- 60-74: productive but watch key risks
- 45-59: mixed or fragile trajectory
- 30-44: declining or unsustainable trajectory
- 0-29: serious safety, recovery, or adherence threat

This is a coaching estimate, not a biological truth.

### Trend

Trend should be:

- `improving`: long-term trajectory is getting better
- `stable`: trajectory is productive and maintained
- `declining`: trajectory is worsening
- `uncertain`: evidence is too incomplete or conflicted

### Confidence

Confidence should reflect:

- data completeness
- recency
- planned-session count
- same-exercise comparable exposures
- goal-specific metric quality
- safety context completeness
- consistency of evidence
- source quality

Low confidence should compress decisions toward hold or consolidate unless safety requires action.

### Time Horizons

ALP should support multiple horizons:

- `4_week`: short-term coaching consequence
- `12_week`: block-level progress and recovery
- `52_week`: annual training trajectory
- `lifetime_proxy`: honest long-term proxy, not a true lifetime prediction

The same decision may score differently across horizons.

Example:

A load push may improve the 4-week score but reduce the 52-week score if it creates repeated missed ranges, pain, or loss of confidence.

## Decision Evaluation

Every recommendation should be judged by its ALP effect.

### Push

A push increases ALP only if:

- goal progress improves or remains strongly supported
- recovery capacity remains acceptable
- confidence and momentum improve or stay stable
- Safety Gate remains clear
- future progress is not compromised
- the pushed variable is evidence-earned

One exciting PR is not enough if the next four weeks deteriorate.

### Recovery Week

A recovery week increases ALP if:

- fatigue reduces
- performance rebounds
- confidence and momentum are preserved
- future training quality improves
- the recovery recommendation was based on systemic evidence

A recovery week decreases ALP if it is premature, undermines confidence, or interrupts productive momentum without enough evidence.

### Hold or Consolidate

Hold or consolidate increases ALP if:

- load ownership improves
- confidence improves
- recovery stabilises
- future push becomes safer
- momentum is preserved
- training remains purposeful

Holding is not failure when it strengthens the next decision.

### Reduce

Reduction increases ALP if:

- excessive stress is removed
- target-range success returns
- recovery improves
- safety improves
- confidence is protected with clear, calm framing

Reduction decreases ALP if it is excessive, poorly justified, or makes the athlete feel punished for normal productive fatigue.

### Substitute

Substitution increases ALP if:

- target stimulus remains acceptable
- pain or technical issue reduces
- recovery cost improves
- performance stabilises
- adherence improves

Substitution decreases ALP if it creates novelty without a coaching reason or replaces important goal-specific exposure too casually.

### Stop Movement or Stop Session

Stopping increases ALP when safety requires it.

The coach should stop the affected movement first unless systemic red flags or unsafe training conditions require a session-wide stop.

Safety-protective decisions may reduce today's performance but still raise lifetime progress.

## Guardrails

ALP must never reward:

- unsafe decisions
- short-term progress with poor long-term cost
- excessive fatigue
- pushing through worsening pain
- user dependency or manipulation
- engagement over progress
- needless complexity
- fake wins
- scale gain as muscle gain
- volume accumulation without productive stimulus
- streak preservation when recovery is needed
- performance increases that damage confidence, safety, or sustainability

Any ALP implementation must be subordinate to the Adaptive Strength Coach Charter and Safety Gate.

## What Can Be Measured Now

The current lab can already estimate:

- goal progress from simulated training evidence
- Coaching State
- Safety Gate status
- decision recommendation type
- push type
- load ownership
- outcome windows
- opportunity cost
- missed or premature pushes
- recovery response
- consistency and missed sessions
- broad momentum/confidence proxies

This is enough to create a first ALP evaluator in the research lab.

## What Requires Future Data

Future production-grade ALP confidence may improve with:

- body composition data supplied by the user
- waist measurements
- bodyweight trends used carefully
- direct pain explanations
- reason for stopping a set
- time burden and session duration
- wearable data, if validated
- user preference signals that do not become engagement optimisation
- long-term anonymised outcomes

Future data should inform coaching. It should not override the Charter or Safety Gate.

## Future Lab Integration Plan

### Step 1: ALP Evaluator v0.1

Create a lab-only evaluator that consumes:

- GoalProgress
- CoachingState
- SafetyGate
- CoachingRecommendation
- OutcomeEvent
- LoadOwnership
- simulation timeline

It should produce:

- ALP score
- trend
- confidence
- contributing factors
- risk factors
- horizon-specific summaries

### Step 2: Decision ALP Delta

Estimate whether each recommendation improved or harmed ALP over:

- immediate session
- next session
- 4 weeks
- 12 weeks

The initial model should be transparent and conservative.

### Step 3: Simulation ALP Tracking

Add ALP to 52-week simulations.

Track:

- average ALP
- final ALP
- ALP volatility
- ALP drawdowns
- recovery after disruptions
- goal-by-goal ALP
- V1 baseline versus V2

### Step 4: ALP Audit Report

Create a recurring lab report that identifies:

- decisions with high ALP gain
- decisions with high ALP cost
- decisions that improved performance but harmed lifetime proxy
- overly conservative decisions
- overly aggressive decisions
- unsafe or near-unsafe decision patterns

### Step 5: Human Review Gate

Before any ALP-driven production change, decisions should pass:

- Charter alignment
- Scientific Validation Framework
- Coaching Playbook alignment
- Safety Gate review
- human review for high-impact coaching behaviour

## Open Aaron Decisions

1. Should ALP become the top-level score in lab reports, or remain an internal evaluator behind other reports?
2. Should ALP be goal-weighted differently for Strength, Build Muscle, Get Lean, Athletic Performance, and Maintenance?
3. How strongly should enjoyment influence ALP when objective progress is good but training appears stale?
4. Should ALP penalise time burden directly once session duration is reliable?
5. What minimum evidence quality should be required before ALP can label a trend `improving` or `declining`?
6. Should ALP ever be user-facing, or should it remain strictly internal coaching infrastructure?

## Final Position

Athlete Lifetime Progress should become the optimisation target for Adaptive Strength Coach V2.

It gives the coach a single north star:

> Increase the athlete's expected long-term progress by making decisions that improve adaptation while preserving recovery, safety, confidence, enjoyment, momentum, and sustainability.

This should be the point scored by the coach.
