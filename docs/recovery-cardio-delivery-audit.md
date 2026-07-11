# Recovery & Cardio Delivery Audit

## 1. Executive summary

Recovery & Cardio is now delivered as a combination of:

- Home weekly Recovery & Capacity target
- direct-start cardio actions
- Home recommendation note
- Progress recommendation note
- manual Extra Session options
- cardio logging screen
- cardio history entry

It is not currently delivered as:

- an automatically scheduled plan session
- a rest-day task
- a calendar-aware recommendation that says when to do cardio

Core answer:

If the app recommends cardio today, the user sees a Home Recovery & Capacity card with a weekly target, completion count, and direct start action. The user can tap `Start Recovery Cardio` or the relevant cardio action, log the session, and see the count update from current-week cardio history. The app does not currently place that session on a specific calendar day.

Build recommendation:

This is acceptable for beta if Recovery & Cardio is positioned as weekly coaching support. It is not yet complete enough to claim that Adaptive Strength Coach auto-schedules cardio onto exact rest days.

## 2. Current delivery path

### Recovery Cardio

Production paths:

- Recommendation engine: `src/domain/training/recovery-capacity.ts`
- Dose resolver: `src/domain/training/cardio-dose.ts`
- Home surface: `src/domain/training/home-dashboard.ts`, `app/(protected)/(tabs)/index.tsx`
- Progress surface: `src/domain/training/progress-dashboard.ts`, `app/(protected)/(tabs)/analytics.tsx`
- Extra Session creation: `app/(protected)/(tabs)/index.tsx`
- Cardio session programme: `src/domain/training/extra-session-generator.ts`
- Cardio logging: `app/(protected)/(tabs)/train.tsx`
- History display: `src/domain/training/workout-history.ts`, `app/(protected)/history/[id].tsx`

Current user journey:

1. The user may first see Recovery Cardio as a Home weekly Recovery & Capacity target when `dashboard.recoveryCapacityTarget` exists.
2. The same kind of recommendation may appear in Progress as `Recovery note`.
3. Home shows the current-week count, target, brief timing note, and a direct `Start Recovery Cardio` action.
4. Tapping the direct action builds a one-day extra programme through `buildRecoveryCardioSessionProgramme`.
5. The app opens the Train cardio logging screen.
6. The user can still manually use `Create Extra Session` if they want to choose a cardio session themselves.
7. The user selects modality, duration, optional distance, ease, and notes.
8. Tapping `Save cardio session` saves the workout session with a `cardioLog`.
9. The saved history entry is displayed as a cardio session, separate from lifting.

Completion tracking:

- Completion is stored in workout history as a completed session with `cardioLog`.
- The current-week Home target counts matching cardio logs.
- It does not produce lifting exercise summaries.
- It does not complete a planned workout slot.
- It can influence later recommendation/fatigue calculations through completed history.

What happens next week:

- The app recalculates the weekly target from history and context.
- If the dose resolver sees recent cardio, it may recommend hold, add duration, add session, reduce, or pause, but this remains recommendation text rather than a scheduled target.

### Capacity Cardio

Production paths:

- Same delivery path as Recovery Cardio, with `capacity_cardio`.
- Extra Session programme builder: `buildCapacityCardioSessionProgramme`.
- Interference guidance: `src/domain/training/cardio-interference.ts`, surfaced in `app/(protected)/(tabs)/train.tsx`.

Current user journey:

1. The user may see Capacity Cardio recommended on the Home weekly target or in Progress, mostly when the recovery/capacity engine decides capacity is useful and fatigue is not already too high.
2. Home can show a direct `Start Capacity Cardio` action.
3. Tapping the action creates a Capacity Cardio extra programme.
4. The manual Extra Session sheet remains available.
5. The Train screen presents cardio logging fields.
6. If selected modality/ease creates interference risk, a caution/avoid card can appear.
7. The user saves the session.
8. The session is stored as a cardio log and shown in history.

Completion tracking:

- Tracked as a cardio history entry.
- Does not complete lifting plan sessions.
- Can contribute to systemic fatigue if hard enough.

What happens next week:

- The next weekly target is recalculated from recent cardio, workload, fatigue, goal, and preference.
- There is still no exact calendar placement.

### Performance Conditioning

Production paths:

- Same delivery path as Recovery Cardio, with `performance_conditioning`.
- Extra Session programme builder: `buildPerformanceConditioningSessionProgramme`.
- Dose resolver favors it mainly for Athletic Performance.
- Interference evaluator is stricter in peak/taper/Powerlifting Meet contexts.

Current user journey:

1. Athletic Performance users may see Performance Conditioning recommended when workload is not already high.
2. Other users can still manually choose it in Extra Sessions.
3. The user can start the session directly from Home when it is the current target, or manually create it from the Extra Session sheet.
4. The Train cardio logging screen handles modality, duration, ease, distance, and notes.
5. Interference guidance may caution or avoid if the context is wrong.
6. The user saves the session.
7. History records it as a cardio session.

Completion tracking:

- Tracked as completed cardio.
- Does not complete lifting plan sessions.
- Counts more strongly toward systemic fatigue than Recovery or Capacity Cardio.

What happens next week:

- Future recommendations are recalculated from history and context.
- No exact calendar placement is shown.

## 3. Current timing behaviour

The app currently expects the user to complete cardio during the current week, but still lets the user choose the exact day.

There is no production behavior that clearly schedules cardio:

- after lifting
- before lifting
- on a rest day
- on a specific weekday
- between two planned sessions

Timing guidance exists as coaching copy, not calendar scheduling.

Examples currently present:

- Home can show Best/Avoid guidance on the Recovery & Capacity target.
- Recovery Cardio can be marked best on rest days or after upper-body sessions.
- Heavy lower or deadlift context cautions against hard conditioning.
- Peak, taper, and event week produce recovery-only guidance.
- Start actions show a timing check before opening cardio logging.

What is missing:

- no "best day this week" suggestion
- no automatic placement on the weekly plan

## 4. Current tracking behaviour

Cardio completion is tracked as completed session history.

Tracked:

- session type
- modality
- duration
- optional distance
- optional perceived ease
- optional notes
- completed timestamp

Displayed:

- History detail shows Type, Duration, Ease
- History detail shows a Cardio session card
- It is labelled separate from the lifting plan

Now visibly tracked:

- current-week target count on Home
- current target and completed count in Progress

Not visibly tracked:

- weekly cardio streak
- planned cardio due dates
- adherence to a cardio prescription
- whether the user completed the recommended dose

Plan completion:

- cardio does not complete planned lifting sessions
- cardio does not advance week completion
- cardio does not trigger lifting progression

## 5. Goal-specific behaviour

### Build Muscle

Current recommendation frequency:

- occasional
- appears when workload/fatigue/capacity evidence makes it useful

Current delivery mechanism:

- Home note
- Progress note
- manual Extra Session

Timing guidance:

- none beyond general easy/recoverable copy

Weekly target:

- Home can show the derived weekly target when recommendation confidence is useful

Visible completion tracking:

- Home current-week target count and history

### Build Strength

Current recommendation frequency:

- occasional
- mostly Recovery Cardio when recovery/work capacity needs support

Current delivery mechanism:

- Home note
- Progress note
- manual Extra Session

Timing guidance:

- no specific timing around heavy squat/deadlift days in production delivery
- interference can caution against hard work using active/next planned workout context when available

Weekly target:

- Home current-week target count when visible

Visible completion tracking:

- history only

### Build Muscle & Strength

Current recommendation frequency:

- moderate
- Recovery Cardio by default
- Capacity Cardio can be recommended when capacity is the limiter and recovery is not already strained

Current delivery mechanism:

- Home note
- Progress note
- manual Extra Session

Timing guidance:

- broad "do not fight the lifting plan" copy
- no scheduled timing

Weekly target:

- Home current-week target count when visible

Visible completion tracking:

- history only

### Get Leaner

Current recommendation frequency:

- higher than most goals
- Recovery Cardio is favored

Current delivery mechanism:

- Home note
- Progress note
- manual Extra Session

Timing guidance:

- no specific timing
- no calorie or fat-loss tracking

Weekly target:

- dose resolver can produce suggested frequency/duration
- Home current-week target count when visible

Visible completion tracking:

- history only

### Athletic Performance

Current recommendation frequency:

- highest cardio/conditioning emphasis
- Performance Conditioning can be recommended
- Capacity Cardio can appear when workload is high

Current delivery mechanism:

- Home note
- Progress note
- manual Extra Session

Timing guidance:

- interference guidance can be less restrictive for athletic goals
- no automatic placement around lifting days

Weekly target:

- Home current-week target count when visible

Visible completion tracking:

- history only

### Powerlifting Meet

Current recommendation frequency:

- conservative
- mostly Recovery Cardio

Current delivery mechanism:

- Home note
- Progress note
- manual Extra Session

Timing guidance:

- interference logic avoids hard cardio in meet/taper/peak contexts
- no explicit "do this after upper day" or "rest day only" delivery exists

Weekly target:

- Home current-week target count when visible

Visible completion tracking:

- history only

## 6. Rest-day handling

The app has training days and planned sessions. It does not currently have a robust rest-day delivery model for cardio.

What the app can do:

- generate a weekly lifting split based on selected training days
- identify planned lifting sessions
- avoid counting extra sessions as planned sessions
- show "This Week" planned workouts

What the app does not currently do:

- identify a named rest day as a cardio opportunity
- place Recovery Cardio on non-training days
- scan gaps between lifting sessions and recommend cardio there
- show "Rest day: easy walk" as a task
- auto-place cardio into the weekly schedule

Answer:

The app can infer that some days are not planned lifting sessions only indirectly from the weekly split. It does not currently use those gaps as a cardio delivery surface.

## 7. Weekly target capability

Current capability:

The domain layer can produce a frequency suggestion, for example:

- `2 x 20 min easy cardio this week`
- add duration
- add session
- hold
- reduce
- pause

Current UI capability:

The app can now display a weekly target like:

`Recovery & Capacity`

`0 / 2 Recovery Sessions Completed`

`Target: 2 x 20-30 minute walks`

Remaining requirements for fuller scheduling:

1. Add exact rest-day or calendar placement.
2. Add a dedicated weekly recovery checklist if the product needs more structure.

Complexity:

Low to medium.

Why not low:

- the app already has cardio logs and dose recommendations
- but it needs week scoping, visible completion accounting, and careful separation from lifting plan completion

Why not high:

- it does not require GPS, heart-rate zones, calories, or complex scheduling

## 8. Delivery model comparison

### Option A: Extra Session only

Description:

Cardio remains available manually through Create Extra Session.

Advantages:

- low complexity
- preserves user control
- avoids cluttering the plan
- safe for early beta
- already mostly implemented

Disadvantages:

- recommendations feel passive
- users may not know when to do cardio
- weak sense of weekly progression
- Recovery & Cardio setting feels less meaningful

Implementation complexity:

Low.

Fit with Adaptive Strength Coach:

Acceptable as a manual tool, but too passive for a coaching product.

### Option B: Recovery tasks on Home

Description:

Home shows a lightweight task when cardio is recommended, such as:

- `Recovery: 0 / 2 easy sessions`
- `Start Recovery Cardio`
- `Ignore this week`

Advantages:

- clear user action
- does not pollute the lifting plan
- keeps cardio supportive rather than central
- easy to explain
- aligns with recovery/capacity philosophy

Disadvantages:

- requires weekly target state or derivation
- needs careful handling of Off/Minimal
- could clutter Home if not restrained

Implementation complexity:

Medium.

Fit with Adaptive Strength Coach:

Strong. It gives cardio a coaching delivery surface without making the app a running tracker.

### Option C: Auto-place cardio on rest days

Description:

The app schedules cardio sessions onto inferred non-lifting days.

Advantages:

- strongest sense of programming
- can reduce interference
- clear timing for the user

Disadvantages:

- requires real calendar/rest-day logic
- risks annoying users whose actual week does not match the plan
- harder to handle shift work, missed sessions, or flexible gym schedules
- can make cardio feel too prescriptive

Implementation complexity:

High.

Fit with Adaptive Strength Coach:

Useful later, but too heavy for the current product unless users opt in.

### Option D: Weekly recovery target

Description:

The app shows a weekly target without pinning exact days:

- `2 x 20 min easy walks`
- `1 / 2 complete`
- `Keep this away from heavy legs`

Advantages:

- gives frequency and dose
- avoids over-scheduling
- respects flexible training weeks
- pairs well with Extra Session logging
- clear enough for gym use

Disadvantages:

- less precise than a calendar
- still needs weekly target and completion counting
- interference guidance must be worded carefully

Implementation complexity:

Medium.

Fit with Adaptive Strength Coach:

Best fit. It is coaching without turning cardio into a second product.

## 9. Recommended implementation

Implemented approach:

Combine Option B and Option D.

The delivery layer now uses a Home-based weekly Recovery & Capacity target:

- show only when recommendation confidence is useful
- respect Recommended / Minimal / Off
- keep it separate from This Week lifting sessions
- allow direct `Start Recovery Cardio` / `Start Capacity Cardio`
- count completed cardio logs for the current week
- do not complete planned lifting sessions
- include Best/Avoid timing guidance when relevant
- show a timing check before direct-start logging

Suggested Home shape:

`Recovery & Capacity`

`0 / 2 easy sessions`

`Target: 2 x 20 min Recovery Cardio`

`Best: Rest days; after upper-body sessions`

`Avoid: Hard conditioning before heavy lower sessions`

Actions:

- `Start Recovery Cardio`
- `Ignore this week`

Remaining recommended sequence:

1. Add rest-day suggestions later only if users need more structure.
2. Add stronger goal-filtering to manual Extra Session ordering if needed.

Do not start with auto-placement on rest days.

Why:

Adaptive Strength Coach is a strength coaching product. The right cardio delivery model should support lifting, not become a parallel endurance programme. A weekly recovery target gives the user enough direction without pretending the app knows their whole life calendar.

## 10. Build/no-build recommendation

Build recommendation:

Do not block a preview build if the current feature is positioned as weekly Recovery & Cardio coaching support.

Block or fix before build if the product copy says or implies:

- cardio is scheduled onto exact calendar/rest days
- the app fully tells users the best day to do cardio
- Recovery & Cardio Off removes all cardio entry points

Current state:

- good enough for optional extra-session cardio logging
- good enough for Home weekly target delivery
- incomplete for exact timing and rest-day placement

No EAS build was started for this audit.
