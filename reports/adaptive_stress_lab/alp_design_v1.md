# Athlete Lifetime Progress Design v1

Status: research/design report.  
Date: 2026-06-28

Production app code was not changed for this Sprint 19 design pass. No EAS build was started.

## Summary

Sprint 19 defines Athlete Lifetime Progress, or ALP, as the unifying optimisation target for the V2 coaching system.

ALP answers:

> What should count as a point scored for the coach?

The proposed answer:

> A coaching decision scores when it increases the athlete's expected long-term progress while preserving adaptation, recovery, safety, confidence, enjoyment, momentum, adherence, and sustainability.

ALP is not a true lifetime prediction. It is a lab-only lifetime proxy for evaluating whether V2 coaching decisions make the athlete more likely to keep progressing over months and years.

## Files Created

- `docs/athlete-lifetime-progress-v1.md`
- `reports/adaptive_stress_lab/alp_design_v1.md`

## ALP Definition

Athlete Lifetime Progress is the coach's estimate of whether its decisions increase the athlete's expected long-term progress.

It includes:

- goal progress
- adaptation
- recovery
- safety
- momentum
- confidence
- adherence likelihood
- enjoyment
- sustainability
- reduced injury or disruption risk

It must not optimise:

- today's performance only
- short-term PRs
- engagement
- more volume for its own sake
- scale weight alone
- fatigue tolerance
- streaks at the expense of recovery

## Proposed Score Model

Future lab work should create an `AthleteLifetimeProgress` object:

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

Score bands:

- 90-100: exceptional long-term trajectory
- 75-89: strong long-term trajectory
- 60-74: productive but watch key risks
- 45-59: mixed or fragile trajectory
- 30-44: declining or unsustainable trajectory
- 0-29: serious safety, recovery, or adherence threat

Trend values:

- `improving`
- `stable`
- `declining`
- `uncertain`

Time horizons:

- `4_week`
- `12_week`
- `52_week`
- `lifetime_proxy`

## Input Categories

### Goal Progress

Goal progress should be goal-specific:

- Strength: Competition Squat, Competition Bench Press, Competition Deadlift, owned-load trend, comparable-load performance.
- Build Muscle: quality work volume, productive sets by muscle, hypertrophy-range performance.
- Build Muscle + Strength: strength trend plus quality volume and recovery response.
- Get Lean: performance preservation, strength maintenance, quality work retained, body-composition data only when supplied.
- Athletic Performance: strength, power/dynamic performance where directly measurable.

### Coaching State

ALP should consume:

- adaptation
- recovery_capacity
- momentum
- confidence
- coaching_opportunity
- evidence_quality

### Safety and Risk

Safety can cap or override ALP:

- Safety Gate status
- pain flags
- worsening symptoms
- repeated failed ranges
- excessive workload density
- poor response after rest

### Sustainability

Sustainability reflects whether training can continue:

- session completion
- missed sessions
- repeated overrides
- time burden
- complexity
- recovery response

### Enjoyment and Variety

Enjoyment matters only when it supports long-term training:

- useful variation
- clear wins
- milestones
- reduced staleness
- confidence-building exposures

## Decision Evaluation Examples

Push increases ALP only when goal progress improves without compromising recovery, safety, confidence, momentum, or future progress.

Recovery Week increases ALP when fatigue reduces, performance rebounds, and momentum is preserved. It lowers ALP if recommended too early.

Hold or Consolidate increases ALP when ownership improves, confidence improves, and a future push becomes safer.

Reduce increases ALP when it removes excessive stress, restores target-range success, and protects confidence.

Substitute increases ALP when it preserves target stimulus while reducing pain, technical cost, or recovery cost.

Stop Movement or Stop Session increases ALP when safety requires it, even if today's performance decreases.

## Guardrails

ALP must never reward:

- unsafe decisions
- short-term progress with poor long-term cost
- excessive fatigue
- pushing through worsening pain
- engagement over progress
- unnecessary complexity
- fake wins
- scale gain as muscle gain
- volume accumulation without productive stimulus
- performance gains that damage confidence, safety, or sustainability

## What Can Be Measured Now

The current lab can already support a first ALP evaluator using:

- GoalProgress
- CoachingState
- SafetyGate
- CoachingRecommendation
- OutcomeEvent
- LoadOwnership
- simulation timelines
- opportunity audits
- push outcome audits

## What Comes Later

Future confidence can improve with:

- body composition inputs
- waist measurements
- carefully interpreted bodyweight trends
- user reason for stopping a set
- pain explanations
- session duration and time burden
- validated wearable data
- long-term anonymised outcomes

## Recommended Next Sprint

Recommended next implementation sprint:

**V2 Sprint 20 — ALP Evaluator v0.1**

Build a lab-only evaluator that:

- consumes GoalProgress, CoachingState, SafetyGate, CoachingRecommendation, OutcomeEvent, and LoadOwnership
- produces `AthleteLifetimeProgress`
- calculates ALP across 4-week, 12-week, 52-week, and lifetime-proxy horizons
- adds ALP tracking to simulation reports
- compares V1 baseline versus V2 using ALP, not only goal progress or correctness

Do not make ALP production-facing yet.

## Open Aaron Decisions

1. Should ALP become the headline metric in V2 lab reports?
2. Should ALP be weighted differently by goal?
3. Should enjoyment be a meaningful ALP contributor or a smaller adherence modifier?
4. Should time burden directly penalise ALP once session duration is reliable?
5. What confidence threshold is required before ALP can call a trend improving or declining?
6. Should ALP ever be exposed to users, or remain internal only?

## Verdict

ALP should become the unifying optimisation target for Adaptive Strength Coach V2.

It turns the V2 coach's mission into a measurable lab question:

> Did this decision improve the athlete's expected long-term progress?

This gives future simulations, outcome learning, push policy, recovery policy, and safety decisions a shared scoreboard.
