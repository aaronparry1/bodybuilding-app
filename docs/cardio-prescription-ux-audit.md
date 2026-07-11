# Cardio Prescription & UX Audit

## Executive summary

Adaptive Strength Coach currently has a real cardio recommendation system, not just a generic cardio button.

The app can:

- Recommend Recovery Cardio, Capacity Cardio, or Performance Conditioning from goal, workload, fatigue, block, taper, and user preference.
- Show a weekly Recovery & Capacity target on Home when confidence is high enough.
- Start a recommended cardio session directly from Home.
- Log cardio with modality, duration, optional distance, perceived ease, and notes.
- Track cardio separately from lifting progression, PRs, e1RM, and training-week completion.
- Count hard cardio as systemic workload evidence while keeping easy Recovery Cardio low-cost.
- Surface cardio counts in Advanced Reports / Recovery & Capacity reporting.

The UX problem is that cardio still has two visible workflows:

1. Recovery & Capacity recommendation path on Home.
2. Manual cardio choices inside Create Extra Session.

That is less clean than the current Low Back Capacity direction, where capacity work is becoming a single Home-led workflow. Cardio is not broken, but it is currently split between coached guidance and manual extra-session selection.

Verdict: **C) move under Recovery & Capacity** for the primary user-facing workflow, with a small manual fallback if needed later.

## Current Cardio Logic

### Core domain files

Cardio logic is mainly implemented in:

- `src/domain/training/cardio-dose.ts`
- `src/domain/training/recovery-capacity.ts`
- `src/domain/training/recovery-capacity-delivery.ts`
- `src/domain/training/recovery-capacity-timing.ts`
- `src/domain/training/cardio-interference.ts`
- `src/domain/training/fatigue-classifier.ts`
- `src/domain/training/workout-history.ts`
- `src/domain/training/advanced-reporting.ts`
- `src/domain/training/extra-session-generator.ts`

### Cardio session types

The app supports three cardio session kinds:

- `recovery_cardio`
- `capacity_cardio`
- `performance_conditioning`

User-facing names:

- Recovery Cardio
- Capacity Cardio
- Performance Conditioning

### Dose model

`resolveCardioDose()` sets:

- weekly frequency range
- duration range
- intensity category
- suggested session type
- progression action
- reason
- evidence

Progression actions:

- `start`
- `hold`
- `add_duration`
- `add_session`
- `reduce`
- `pause`

The dose model is conservative:

- If no recent cardio is logged, it starts low.
- If cardio is tolerated, it adds duration before adding more sessions.
- If fatigue, peak, taper, or event-week context is present, it reduces or holds hard conditioning and prefers Recovery Cardio.
- If Recovery & Cardio preference is off, user-facing cardio suggestions are suppressed.

### Base recommendations by goal

Current base goal behaviour:

| Goal | Default cardio lane | Frequency | Duration | Intensity |
| --- | --- | ---: | ---: | --- |
| Build Muscle | Recovery Cardio | 2-4/week | 20-30 min | easy |
| Build Strength | Recovery Cardio | 2-3/week | 15-25 min | easy |
| Build Muscle & Strength | Recovery Cardio | 2-4/week | 20-30 min | easy |
| Get Leaner | Recovery Cardio | 2-4/week | 20-35 min | easy |
| Athletic Performance | Performance Conditioning | 3-5/week, beginner capped lower | 20-35 min | moderate |
| Powerlifting Meet | Recovery Cardio | 1-3/week | 15-25 min | easy |

Peak, taper, event week, high fatigue, and systemic fatigue push the recommendation toward easy Recovery Cardio.

## Current User Surfaces

### Onboarding

Onboarding asks for Recovery & Cardio preference:

- Recommended
- Minimal
- Off

This preference is stored on the active plan and also exists in app settings defaults.

Meaning:

- Recommended: normal Recovery & Capacity recommendations.
- Minimal: only show cardio when workload, fatigue, or goal evidence is stronger.
- Off: hide user-facing cardio prompts while keeping recovery/fatigue assumptions active.

### Home

Home can show a Recovery & Capacity target when `buildRecoveryCapacityWeeklyTarget()` returns a confident recommendation.

The Home card can show:

- target sessions completed
- target frequency and duration
- recommended cardio type
- timing guidance
- best/avoid guidance
- direct start action
- ignore-this-week action
- evidence drawer

Example actions:

- Start Recovery Cardio
- Start Capacity Cardio
- Start Performance Conditioning

Home also has a separate Low Back Capacity card. That is strength/capacity work, not cardio, but it sits under the same broad Recovery & Capacity heading.

### Extra Session

The Create Extra Session modal currently exposes:

- Full Session
- Extra Volume
- Recovery Cardio
- Capacity Cardio
- Performance Conditioning

Low Back Capacity has recently been removed from generic Extra Session selection, but cardio remains visible there.

This is the main UX duplication.

### Train

Cardio sessions open in Train as a dedicated cardio logging screen.

The cardio screen collects:

- modality
- duration
- optional distance
- perceived ease
- notes

Available modalities:

- incline walk
- outdoor walk
- bike
- rower
- ski erg
- assault bike
- sled push
- run
- sport conditioning
- other

Perceived ease:

- easy
- moderate
- hard

Train also runs an interference check and may show caution/avoid copy when the selected modality/ease conflicts with lifting context.

### History

History detail shows cardio sessions separately from lifting sessions.

It shows:

- type
- duration
- ease
- modality
- notes when present

### Progress / Advanced Reports

Advanced Reports include a Recovery & Capacity Report.

It counts current-week:

- Recovery sessions
- Capacity sessions
- Performance conditioning sessions

If a weekly target exists, the report shows:

- completed sessions against target
- target label
- interference/timing note
- avoid guidance

If no target exists, it still shows cardio session counts and says evidence is building.

### Settings

Settings has recently been cleaned up. It should not act as a cardio completion workflow.

The remaining relevant setting is the user’s Recovery & Cardio preference from setup/settings model, but the live Settings UI should avoid looking like an internal configuration panel.

### Workout Review

Cardio affects future recovery/fatigue context through history, but cardio sessions do not go through the same lifting Workout Review path because they do not create lifting exercise summaries or load decisions.

## Current Tracking Behaviour

### What is stored

Cardio completion is stored as a completed `WorkoutSession` with a `cardioLog`.

Stored fields:

- `sessionType`
- `modality`
- `durationMinutes`
- optional `distance`
- optional `perceivedEase`
- optional `notes`
- `loggedAt`

### What cardio does not affect

Cardio does not:

- create lifting exercise summaries
- create PR or e1RM records
- trigger load progression
- complete planned lifting sessions
- advance the training week
- count as planned workout completion

### What cardio can affect

Cardio can affect:

- Recovery & Capacity target completion count
- Advanced Reports Recovery & Capacity section
- fatigue classification, if hard enough
- future dose recommendations

Current fatigue weighting:

- Easy Recovery Cardio: no extra workload.
- Recovery Cardio marked hard: counts as extra workload.
- Capacity Cardio: counts as extra workload.
- Performance Conditioning: counts more strongly.

## Recommendation Decision Inputs

### User goal

Goal strongly influences base lane and dose.

Strength and Powerlifting Meet are recovery-cardio biased. Athletic Performance can receive performance conditioning. Get Leaner gets more easy cardio support but remains lifting-preservation focused.

### Recovery/Cardio setting

The user setting changes surfacing, not the entire internal recovery model.

- Off suppresses user-facing suggestions.
- Minimal raises the threshold for showing prompts.
- Recommended allows normal recommendations.

### Block type

Block type influences cardio through dose and interference:

- Peak pushes toward easy Recovery Cardio.
- Taper/event contexts suppress hard conditioning.
- Power contexts are stricter because speed quality matters.

### Fatigue/recovery state

Fatigue classification influences both Recovery & Capacity recommendation and dose:

- high/systemic/mixed fatigue shifts toward easy Recovery Cardio
- moderate fatigue cautions Capacity Cardio
- high workload can trigger Recovery or Capacity Cardio recommendations

### Workout history

History provides:

- completed workout count
- recent work-set volume
- recent cardio sessions
- extra session workload
- current-week cardio completion count
- personalised volume signals

Limited history lowers confidence and may suppress Home target delivery.

### Conditioning needs

Conditioning need is inferred mostly from:

- goal
- athletic event context
- workload/capacity status
- recent cardio absence
- extra workload

There is no standalone conditioning assessment yet.

### Missed sessions / training gaps

Training gaps can push Recovery & Capacity toward easier recovery support.

Extended gaps are treated as a reason to ease back in rather than add hard conditioning.

### Body composition / Get Leaner

Get Leaner receives easy Recovery Cardio recommendations more readily, with copy focused on supporting the cut without stealing from lifting.

The system does not prescribe calorie burn targets.

### Manual user selection

Manual selection exists through Create Extra Session.

This lets users start Recovery Cardio, Capacity Cardio, or Performance Conditioning even when there is no current recommendation.

This is useful power-user flexibility, but it weakens UX clarity.

## Is Cardio Intelligent Or Generic?

Answer: **C) both**.

It is intelligent when cardio appears through Recovery & Capacity:

- dose is goal-specific
- fatigue-aware
- taper-aware
- preference-aware
- current-week tracked
- interference-checked

It is generic/manual when exposed through Extra Session:

- user can pick any cardio lane manually
- Performance Conditioning can be manually selected outside Athletic Performance
- the picker does not strongly explain why one lane is right today
- manual cardio choices are not hidden by goal or readiness context

So the domain logic is better than the visible workflow.

## Risks / Confusion

### Duplicate workflows

Cardio currently appears as both:

- a coached Recovery & Capacity recommendation
- a manual Extra Session option

After the recent Capacity UX simplification, this inconsistency stands out more. Low Back Capacity has one Home-led path; cardio still has two.

### Performance Conditioning too easy to choose

Performance Conditioning is appropriate mainly for Athletic Performance or sport/event contexts. Manual selection makes it available more broadly.

Interference warnings help, but they appear after the user has already created the session.

### Recovery & Capacity label is overloaded

Recovery & Capacity can mean:

- cardio dose
- Low Back Capacity strength support
- fatigue/timing guidance
- recovery priority

That is acceptable if the UI clearly separates:

- Recovery Cardio / Conditioning
- Low Back Capacity

But it should not feel like a bucket of unrelated things.

### Cardio is not scheduled

The app gives weekly target and timing advice, not exact planned days.

This is fine if marketed as Recovery & Cardio guidance. It should not be marketed as full cardio programming or calendar scheduling.

### Easy cardio extra workload mismatch

Most fatigue logic correctly avoids counting easy Recovery Cardio as extra workload. Some higher-level code still counts all non-planned sessions in places before the cardio-aware logic is applied. This has been noted in earlier audits as a possible mismatch.

This is not obviously breaking today, but it should be watched.

### Manual cardio ignores preference intent

If a user set Recovery & Cardio to Off or Minimal, manual Extra Session cardio is still visible. That may be acceptable as “manual override,” but the UX does not clearly explain the distinction.

## UX Recommendation

Recommended direction: **C) move cardio under Recovery & Capacity**.

One primary path:

Home
↓
Recovery & Capacity
↓
Recovery Cardio / Capacity Cardio / Performance Conditioning when appropriate
↓
Start session
↓
Train cardio log

### Keep internal route support

The underlying builders should remain:

- `buildRecoveryCardioSessionProgramme`
- `buildCapacityCardioSessionProgramme`
- `buildPerformanceConditioningSessionProgramme`

Existing route/deep-link support can remain internal. The change is mostly presentation and entry-point ownership.

### Remove from generic Extra Session picker

The generic Create Extra Session modal should ideally show lifting extras only:

- Full Session
- Extra Volume

Cardio should move to Recovery & Capacity because that is where its logic lives.

### Add a Recovery & Capacity action cluster

Home could present:

- Recommended today: Start Recovery Cardio
- Other option: Log Cardio
- Optional: View guidance

If there is no active recommendation, a low-key Recovery & Capacity card can still allow:

- Log Recovery Cardio
- View Recovery & Capacity

This keeps cardio discoverable without making it feel like random extra work.

### Goal-aware manual availability

If manual cardio remains visible anywhere:

- Recovery Cardio can be generally available.
- Capacity Cardio should be available with caution copy.
- Performance Conditioning should be hidden or de-emphasised unless Athletic Performance/event context applies.

### Copy recommendation

Use:

- Recovery Cardio
- Capacity Cardio
- Performance Conditioning
- Recovery & Capacity

Avoid:

- Extra cardio
- Punishment cardio
- Calorie burn wording
- Medical/recovery claims
- “Cardio prescription” unless it is actually scheduled

## Recommended Product Architecture

### Current

Recovery & Capacity engine
↓
Home target
↓
Start cardio

and

Create Extra Session
↓
Manual cardio choice

### Recommended

Recovery & Capacity
↓
Cardio guidance
↓
Recommended session or manual recovery-cardio log
↓
Train cardio log
↓
History / Advanced Reports

Generic Extra Session should remain for lifting extras, not cardio.

## Recommended Next Build Changes

1. Remove Recovery Cardio, Capacity Cardio, and Performance Conditioning from the generic Extra Session modal.
2. Keep cardio programme builders and session kinds unchanged.
3. Add or refine a Home / Recovery & Capacity entry point for cardio:
   - when target exists, show the recommended action
   - when no target exists, optionally show a subtle “Log Recovery Cardio” action
4. Keep Performance Conditioning visible only when Athletic Performance/event context or an active recommendation supports it.
5. Keep cardio logging screen unchanged unless copy polish is needed.
6. Keep reporting and fatigue integration unchanged.
7. Ensure Recovery & Cardio preference controls surfacing:
   - Off hides recommendation prompts
   - Minimal reduces prompts
   - Manual logging remains possible only from a deliberate Recovery & Capacity area if desired
8. Add tests proving cardio no longer appears as a generic Extra Session option if this change is implemented.

## What Should Stay

Keep:

- `cardioLog` tracking model
- dose resolver
- recovery-capacity resolver
- interference checks
- current modalities
- current easy/moderate/hard ease choices
- current separation from lifting PR/progression/training-week completion
- Advanced Reports Recovery & Capacity counts
- Home weekly target pattern

## What Should Change

Change:

- Cardio entry point ownership.
- Generic Extra Session should not look like the home for cardio.
- Performance Conditioning should not feel like a casual option for all users.
- Recovery & Capacity should become the user-facing cardio hub.

## Final Verdict

Verdict: **C) move under Recovery & Capacity**.

The cardio system is more intelligent than the current UX makes it feel. The recommendation engine is goal-aware, fatigue-aware, and interference-aware. The tracking model is clean. The weak point is workflow clarity.

Cardio should not remain a generic Extra Session option long term. It should live under Recovery & Capacity, with recommended cardio actions surfaced on Home and optional logging kept deliberate and low-friction.

This is a **minor-to-moderate UX cleanup**, not a coaching engine rebuild.
