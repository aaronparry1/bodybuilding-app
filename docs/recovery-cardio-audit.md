# Recovery & Cardio System Audit

## 1. Executive summary

Recovery & Cardio is genuinely present in Adaptive Strength Coach, but it is not yet a fully programmed cardio system.

Current production behavior is best described as:

- recovery/cardio recommendations are calculated by domain logic
- Home and Progress can surface recovery/capacity advice
- Recovery Cardio, Capacity Cardio, and Performance Conditioning can be created as Extra Sessions
- cardio sessions can be logged with modality, duration, ease, distance, and notes
- hard cardio can contribute to systemic fatigue evidence
- cardio does not complete planned lifting sessions and does not trigger lifting progression

What is not yet true:

- cardio is not automatically scheduled into the programme
- cardio dose progression is delivered as a weekly Home/Progress target, not as a persisted calendar plan
- interference rules inspect the active/next planned workout when possible, then fall back to broad plan context
- cardio recommendations are not consistently goal-filtered in the Extra Session picker
- Recovery Cardio does not yet create a positive recovery adaptation signal beyond being logged and counted in dose history

Build recommendation: this is not a build blocker if the product promise is "recovery/cardio support and optional logging." It is a product truthfulness issue if the app claims cardio is fully integrated programming. Fix the high-priority gaps before marketing it as a planned conditioning system.

## 2. What is implemented

### Recovery/capacity recommendation engine

Production file: `src/domain/training/recovery-capacity.ts`

The app has a real recovery/capacity resolver:

- `resolveRecoveryCapacity(input)`
- accepts goal, block, event type, fatigue classification, personalised volume state, extra-session workload, training-gap status, recovery/cardio preference, weekly training volume, experience level, and completed workouts
- returns recovery status, capacity status, recommendation, session type, frequency suggestion, confidence, and evidence

The engine respects the Recovery & Cardio setting:

- `recommended`: normal user-facing suggestions
- `minimal`: suppresses most suggestions unless workload/fatigue evidence is stronger
- `off`: returns no user-facing recommendation, while still computing recovery/capacity status

### Cardio dose logic

Production file: `src/domain/training/cardio-dose.ts`

The app has cardio dose logic:

- starts low when no cardio has been logged
- progresses duration before frequency
- reduces or pauses under high fatigue, taper, event week, or peak block
- changes base dose by goal
- suppresses suggestions when cardio preference is off

Examples from current logic:

- Build Strength: Recovery Cardio, 2-3 sessions, 15-25 minutes, easy
- Get Leaner: Recovery Cardio, 2-4 sessions, 20-35 minutes, easy
- Athletic Performance: Performance Conditioning, 3-5 sessions, 20-35 minutes, moderate
- Powerlifting Meet: Recovery Cardio, 1-3 sessions, 15-25 minutes, easy

This logic is present and is surfaced through Home/Progress weekly targets and recommendation copy rather than a persisted cardio schedule.

### Cardio interference rules

Production file: `src/domain/training/cardio-interference.ts`

The app has an interference evaluator:

- returns `allowed`, `caution`, or `avoid`
- avoids hard cardio during taper/event week/peak contexts
- avoids hard cardio for Powerlifting Meet users
- warns against hard conditioning for non-athletic goals
- cautions against Capacity Cardio when fatigue is moderate
- allows easy Recovery Cardio broadly unless fatigue is high

The Train screen uses it during cardio logging.

Production file: `app/(protected)/(tabs)/train.tsx`

Current Train usage passes:

- selected cardio session type
- modality
- perceived ease
- goal
- current block
- event taper phase

It does not currently pass upcoming lifting context such as "heavy squat tomorrow."

### Extra Session cardio options

Production files:

- `app/(protected)/(tabs)/index.tsx`
- `app/(protected)/programmes/ai.tsx`
- `src/domain/training/extra-session-generator.ts`

The app exposes:

- Recovery Cardio
- Capacity Cardio
- Performance Conditioning

These are available through Extra Sessions and the create-session flow. They are not planned lifting sessions.

Generated cardio session programmes include copy that the session does not complete a planned workout slot.

### Cardio logging and history

Production files:

- `app/(protected)/(tabs)/train.tsx`
- `src/domain/training/workout-history.ts`
- `app/(protected)/history/[id].tsx`

Cardio sessions can be logged with:

- session type
- modality
- duration
- optional distance
- optional perceived ease
- optional notes

Workout history treats cardio separately from lifting:

- cardio sessions have no lifting exercise summaries
- cardio does not produce work-set evidence
- cardio does not trigger load progression

### Fatigue integration

Production file: `src/domain/training/fatigue-classifier.ts`

Cardio contributes to systemic fatigue only when it is meaningfully costly:

- easy Recovery Cardio: no extra workload
- Capacity Cardio: contributes extra workload
- hard perceived ease: contributes extra workload
- Performance Conditioning: contributes more workload

This can feed downstream coaching indirectly through fatigue classification.

## 3. What is partially implemented

### Home recommendations

Production file: `src/domain/training/home-dashboard.ts`

Home can surface a recovery/capacity warning and weekly target when:

- an active plan exists
- recovery/capacity returns a non-empty recommendation
- recommendation confidence is not low or insufficient

Home evidence uses:

- fatigue classification
- personalised volume state
- recent work-set volume
- training-gap status
- extra-session workload
- recovery/cardio preference

Partial issue:

Home passes explicit `extraSessionWorkload` as a count of all non-planned sessions. That can include easy Recovery Cardio, even though the fatigue classifier correctly treats easy Recovery Cardio as low cost. This creates a possible mismatch where easy recovery work may still inflate extra-workload warnings.

Current delivery:

- Home can show a Recovery & Capacity weekly target.
- The target shows current-week completed cardio sessions.
- The card has direct start actions such as `Start Recovery Cardio`.
- `Ignore This Week` persists for the current training week and active plan without changing training logic.

### Progress recommendations

Production file: `src/domain/training/progress-dashboard.ts`

Progress can expose a `recoveryCapacityRecommendation` string when:

- strategic data has enough history
- recovery/cardio preference is not off
- recommendation is not none

Partial issue:

Progress displays recommendation text plus the current target, completed count, and dose action. It does not provide a direct schedule/apply action for exact day placement.

### Dose progression

Production file: `src/domain/training/cardio-dose.ts`

Dose progression logic exists:

- start
- hold
- add duration
- add session
- reduce
- pause

Partial issue:

The app does not persist a calendar prescription such as "Tuesday: 20 min, Friday: 20 min." It recalculates the weekly target from logged history instead.

### Event/taper interaction

Production files:

- `src/domain/training/event-taper.ts`
- `src/domain/training/cardio-dose.ts`
- `src/domain/training/cardio-interference.ts`
- `src/domain/training/recovery-capacity.ts`

Event/taper support is partial:

- cardio interference receives event taper phase in the Train cardio logging flow
- cardio dose suppresses hard work if `eventTaperPhase` is passed or block is Peak
- Home/Progress recovery-capacity calls do not pass event taper phase into cardio dose directly
- event/taper can still influence cardio indirectly through current block and fatigue classification

## 4. What is missing

### Critical missing pieces

No critical runtime blocker was found in this audit.

The current system is usable as optional recovery/cardio support. The critical distinction is product positioning: it should not be described as fully scheduled conditioning programming yet.

### High-priority missing pieces

#### 1. Cardio is not automatically scheduled

Why it matters:

Users may reasonably expect cardio to appear in the plan if the guide/settings say recovery/cardio is integrated.

Current behavior:

Cardio appears as recommendations and Extra Sessions, not as planned programme sessions.

Risk:

Product promise mismatch.

Complexity:

Medium. Requires deciding whether cardio belongs in weekly plan slots, separate recovery slots, or a lightweight weekly checklist.

#### 2. Interference still needs calendar placement, not exercise detection

Why it matters:

The intended rule "avoid hard lower-body conditioning before heavy squat/deadlift days" now inspects an active lifting workout or generated next planned workout where possible.

Current behavior:

The cardio delivery/logging flow can pass next planned lifting context such as squat focused, deadlift focused, heavy lower, heavy upper, power focused, peak/taper, and event week.

Risk:

The app can warn about heavy lower/deadlift/power/peak contexts, but it still does not place cardio on an exact calendar day.

Complexity:

Medium. Exercise inspection exists; fuller delivery requires rest-day/calendar placement.

#### 3. Dose progression is not calendar-scheduled

Why it matters:

The dose model can say "add duration" or "add session," and the user can see a current weekly target. The user does not get exact day placement.

Current behavior:

Dose progression is calculated on demand and surfaced as a weekly target/copy.

Risk:

Users can understand what to do this week, but not the exact best day to do it.

Complexity:

Medium.

#### 4. Extra Session cardio options are not preference-filtered

Why it matters:

If Recovery & Cardio is set to Off, user-facing cardio suggestions should stop. Manual creation may still be acceptable, but the product should be clear whether "Off" hides suggestions or hides cardio entry points.

Current behavior:

The Extra Session cardio options are available as manual choices. The recommendation engine respects Off, but the picker itself is not goal/preference-filtered.

Risk:

Settings feel inconsistent.

Complexity:

Low to medium.

#### 5. Easy cardio does not create an explicit positive recovery adaptation

Why it matters:

The product philosophy says cardio improves recovery/work capacity. The app logs cardio and uses it for dose progression, but it does not strongly model improved recovery capacity over time.

Current behavior:

Hard cardio can increase fatigue. Logged cardio influences cardio dose history. Recovery capacity status is still mostly derived from lifting history, fatigue, extra workload, and volume signals.

Risk:

Cardio feels like stress tracking more than capacity development.

Complexity:

Medium.

### Medium-priority missing pieces

#### 1. Performance Conditioning is broadly visible

Performance Conditioning is available in Extra Sessions even for goals where the recommendation engine would rarely choose it.

Recommended fix:

Keep manual search/create flexible, but rank or label Performance Conditioning based on goal/context.

#### 2. Cardio suitable-block metadata is not fully used

Cardio exercise presets include block suitability, but Extra Session availability does not appear to use that metadata.

Recommended fix:

Use metadata to rank, label, or caution session types.

#### 3. Home and Progress extra workload accounting may overcount easy cardio

Home/Progress explicit extra-session workload counts all non-planned summaries, while the fatigue classifier treats easy Recovery Cardio as zero workload.

Recommended fix:

Use a shared extra-workload scorer so easy recovery work does not inflate stress evidence.

#### 4. No cardio adherence surface

The app can recommend "2 x 20 min," but there is no simple "done this week" recovery/cardio checklist.

Recommended fix:

Add a small non-lifting weekly recovery/capacity tracker if cardio becomes a stronger product promise.

## 5. Goal-specific behaviour

### Build Muscle

Current cardio recommendation level:

- mostly Recovery Cardio
- recommended when workload is high, recovery is strained, capacity is low, deload/gap conditions exist, or systemic/mixed fatigue appears

Recovery emphasis:

- moderate
- supports volume tolerance and recovery

Conditioning emphasis:

- low
- Capacity Cardio and Performance Conditioning are not normally selected by the recovery-capacity engine

Interference protections:

- hard cardio can produce caution/avoid if fatigue/block context says so
- no specific heavy-lower-day protection unless upcoming lifting context is passed

### Build Strength

Current cardio recommendation level:

- Recovery Cardio, usually 2-3 easy sessions when triggered

Recovery emphasis:

- high enough to protect heavy lifting output

Conditioning emphasis:

- low

Interference protections:

- hard cardio gets more caution because goal is non-athletic
- hard cardio is not automatically blocked before heavy squat/deadlift days from current production wiring

### Build Muscle & Strength

Current cardio recommendation level:

- Recovery Cardio by base dose
- Capacity Cardio can be recommended when workload/capacity evidence suggests it and recovery is not already strained

Recovery emphasis:

- high

Conditioning emphasis:

- moderate when tolerated

Interference protections:

- same general hard-cardio cautions
- exact next-workout protection is active when the next planned workout can be resolved

### Get Leaner

Current cardio recommendation level:

- Recovery Cardio is the main recommendation
- recommended more readily than most goals in normal mode
- Minimal mode suppresses unless workload/recovery issue is clear

Recovery emphasis:

- high
- messaging supports preserving training quality while leaning out

Conditioning emphasis:

- low to moderate
- Capacity Cardio is not normally selected by the recovery-capacity engine

Interference protections:

- general hard-cardio caution
- no calorie/fat-loss tracking or promises

### Athletic Performance

Current cardio recommendation level:

- strongest cardio/conditioning emphasis
- Performance Conditioning when not high workload
- Capacity Cardio when workload is high

Recovery emphasis:

- moderate to high

Conditioning emphasis:

- high

Interference protections:

- athletic goal is allowed more hard conditioning
- heavy-lower hard-cardio avoidance is relaxed for athletic priority
- high fatigue and taper/event contexts can still caution or avoid

### Powerlifting Meet

Current cardio recommendation level:

- Recovery Cardio, especially when workload is high or event work gets specific
- base dose is conservative

Recovery emphasis:

- high

Conditioning emphasis:

- low

Interference protections:

- hard cardio is avoided for Powerlifting Meet
- taper/event week strongly suppresses hard conditioning in the interference evaluator
- plan-level cardio scheduling is not automatic

## 6. Interference behaviour

### Heavy squat day tomorrow

Actual current behavior:

- Recovery Cardio can still be recommended and logged
- Capacity Cardio can be cautioned/avoided when exact or fallback next-lifting context is heavy lower, squat focused, or deadlift focused
- Performance Conditioning is not automatically blocked from the Extra Session picker

Reason:

The delivery layer resolves active/next planned workout context and passes it into `evaluateCardioInterference`.

### Heavy deadlift session

Actual current behavior:

- Same exact-context behavior as heavy squat day when Deadlift or deadlift-family work is present

### Strength blocks

Actual current behavior:

- Recovery Cardio is favored
- Hard cardio can get caution/avoid depending fatigue, goal, and block context
- Strength block alone does not create a detailed interference schedule

### Power blocks

Actual current behavior:

- Power block context can influence caution around hard cardio
- Recovery Cardio remains broadly allowed
- No automatic programme-level cardio scheduling changes were found

### Peak blocks

Actual current behavior:

- Cardio dose logic treats Peak as taper-like and reduces/holds cardio
- Interference avoids hard cardio in Peak/taper/event contexts

### Taper weeks and event weeks

Actual current behavior:

- Train cardio logging can receive event taper phase and show avoid/caution for hard cardio
- Home/Progress recovery-capacity does not appear to pass event taper phase directly into cardio dose, so taper influence there depends more on current block/fatigue context

## 7. Product truthfulness assessment

If a user reads the guide and settings today, would they reasonably believe "Cardio is integrated into coaching"?

Answer: partially yes.

Why yes:

- Recovery & Cardio preference exists
- Home can recommend recovery/capacity work
- Progress can surface recovery/capacity recommendations
- cardio sessions can be logged
- hard cardio can affect systemic fatigue
- cardio does not interfere with lifting completion/progression accounting
- goal-specific dose logic exists

Why not fully:

- cardio is not scheduled into the programme
- weekly targets exist, but exact day placement does not
- the Extra Session picker still exposes cardio manually regardless of goal/preference context
- interference rules inspect active/next planned workout context, then fall back conservatively
- dose progression is a weekly target/recommendation system, not a calendar schedule
- recovery adaptation from easy cardio is not strongly modeled

Product wording should say:

"Adaptive Strength Coach can recommend, target, and log recovery/cardio work to support recovery and capacity."

It should not yet say:

"Adaptive Strength Coach programs your cardio week by week around your lifting plan."

## 8. Recommended next steps

### Step 1: Fix extra-workload scoring consistency

Use the same cardio-aware workload scoring in Home, Progress, and fatigue classification.

Priority: High

Risk: Low to medium

Complexity: Low

### Step 2: Add exact day/rest-day placement

Use the existing next-workout context to suggest specific rest-day or post-session placement without forcing calendar rigidity.

Priority: High

Risk: Medium

Complexity: Medium

### Step 3: Add a lightweight weekly cardio target surface

Show a simple weekly target when recommendations exist:

- `2 x 20 min easy walks`
- `Add 5 minutes to one easy session`
- `Hold cardio this week`

Do not turn it into a running app.

Priority: High

Risk: Medium

Complexity: Medium

### Step 4: Clarify Off/Minimal behavior in UI

Decide whether Off hides cardio suggestions only or also demotes/hides cardio Extra Session options. Then make the UI match the setting.

Priority: High

Risk: Low

Complexity: Low to medium

### Step 5: Model positive recovery capacity from consistent easy cardio

Add a conservative capacity trend from completed Recovery Cardio sessions. It should improve confidence/recovery-capacity status gradually, without pretending cardio instantly reduces fatigue.

Priority: Medium

Risk: Medium

Complexity: Medium

### Step 6: Goal-filter Extra Session cardio ranking

Keep manual control, but rank and label cardio session types by goal/context:

- Powerlifting Meet: Recovery Cardio first
- Athletic Performance: Performance Conditioning visible and relevant
- Get Leaner: Recovery Cardio first, no fat-loss promises

Priority: Medium

Risk: Low

Complexity: Low

## 9. Build/no-build recommendation

Recommendation: build can proceed if Recovery & Cardio is positioned as weekly coaching support, not a fully scheduled cardio programme.

Do not block a preview build solely on Recovery & Cardio.

Block or fix before build if the next preview build is intended to validate:

- fully programmed cardio
- exact rest-day/cardio day placement
- calendar-placed cardio progression targets
- Recovery & Cardio Off hiding all cardio entry points

Current status:

- implemented enough for beta feedback on weekly recovery/cardio targets, logging, and recommendations
- partial for goal-specific cardio programming
- incomplete for exact-day cardio scheduling and full rest-day placement
