# Exercise-Specific Rep Strategy Audit

Date: 2026-06-14

Scope: audit and design recommendation for interpreting rep ranges in Adaptive Strength Coach without forcing a global "rep-biased / load-biased / balanced" user preference. This audit did not change code, tests, EAS, or app behaviour.

## 1. Current Logic Trace

### Rep range assignment

Current source:

- `src/domain/training/rep-range-strategy.ts`
- `src/domain/training/ad-hoc-workout-generator.ts`
- `src/domain/training/slot-prescription-matrix.ts`

The app currently resolves rep ranges from:

1. explicit programme slot override
2. block + exercise role + family + movement pattern
3. exercise-family override
4. exercise default
5. advanced user override if enabled
6. fallback `8-12`

Current examples:

- Hypertrophy primary compound: `6-10`
- Hypertrophy secondary compound: `8-12`
- Hypertrophy isolation: `10-20` or small muscle `12-25`
- Strength primary compound: `3-5`
- Strength secondary compound: `5-8`
- Power movement: `1-3` or `1-5`
- Peak primary: `1-3`
- Recovery Window primary: `6-10`, secondary `8-12`, other `10-15`

Current interpretation:

- The rep range itself is role/block aware.
- The progression strategy inside the rep range is still partly top-end-driven.

### Basic progression engine

Current source:

- `src/domain/training/progression-engine.ts`

The base progression rule is:

- count work sets only
- warm-ups excluded
- a set is acceptable if it stays inside the rep range and inside the drop-off threshold
- `earnedLoadIncrease` requires:
  - no shutdown/drop-off
  - best set reaches `repRange.max`
  - enough acceptable work sets are completed

This means the base progression engine still values the **top end of the range** as the main trigger for load increases.

Current copy reinforces that:

- "Top-end reps and required quality sets were earned."
- "Keep the load. Aim for more clean reps next time."

Audit judgement:

- Good for classic double progression.
- Too generic if used as the final interpretation for every exercise.
- This is where top-end bias still lives most strongly.

### Progression throttle

Current source:

- `src/domain/training/progression-throttle.ts`

The progression throttle adjusts the base signal using:

- goal
- experience
- current block
- exercise role/family
- target rep range
- recent exercise performance
- shutdown/drop-off rate
- quality set trend
- fatigue signal
- deload state
- extra-session state
- training gap
- training lane
- rep-range occupancy
- fatigue classification
- event taper
- power quality

Important current behaviour:

- Deload/Recovery, peak, training gaps, event taper, fatigue, and power quality can override progression.
- If `progressionEarned` is false, heavy-biased occupancy can still allow a push if:
  - occupancy is heavy-biased
  - confidence is medium/high
  - trend is stable/rising
  - fatigue is low
  - lane/block/event constraints allow it

Goal-specific occupancy rules already exist:

- Build Strength can push from heavy-range occupancy on main compounds.
- Powerlifting Meet needs stronger evidence and main-compound context.
- Build Muscle needs rising heavy-end trend and at least 3 exposures.
- Get Leaner needs at least 3 exposures.
- Athletic Performance allows heavy-end progression mostly for power/main-compound contexts.

Audit judgement:

- The throttle partially solves the problem.
- It already learns exercise-specific rep occupancy from history.
- It is not yet a full exercise-specific rep strategy model because occupancy is not the same as deciding whether an exercise should generally progress by load, reps, or balanced exposure.

### Rep-range occupancy

Current source:

- `src/domain/training/rep-range-occupancy.ts`

Current model:

- analyses completed productive work sets or recent exercise history
- requires at least 2 exposures and 6 productive sets
- calculates average reps as position inside range
- classifies:
  - `heavy_biased`
  - `balanced`
  - `volume_biased`
  - `insufficient_data`
- tracks trend:
  - rising
  - stable
  - falling
- returns confidence

Current thresholds:

- bottom 35% of range: heavy-biased
- top 35% of range: volume-biased
- middle: balanced

Current progression use:

- heavy-biased, stable/rising, medium/high confidence can allow progression even without top-of-range hits.

Audit judgement:

- This is the right foundation.
- It is exercise-specific and observed.
- It should be expanded into an exercise-specific rep strategy layer rather than replaced by a global user preference.

### Load selection

Current source:

- `src/domain/training/load-selection.ts`

Starting load:

- exact history wins
- same-family estimates use e1RM-style conversion from similar exercises
- starting loads can be recalibrated for block transition
- training gaps can adjust or caution the load

In-session escalation:

- currently requires top-of-range reps at current load
- suggests a load increase if:
  - latest work set reaches `repRange.max`
  - enough productive top-end sets exist at current load, or lower loads were used before the current load
  - progression throttle allows the push

Next-session load after escalation:

- consolidates the highest successful escalated load by default
- avoids double-progressing from a single final escalated set

Audit judgement:

- Good conservative handling after in-session escalation.
- Still top-of-range gated for escalation, which is appropriate for many cases but should be role-specific.

### First-exposure recommendations

Current source:

- `src/domain/training/post-workout-review.ts`

Current first-exposure rule:

- first exposure usually suppresses load increase
- exception: strong first baseline
  - enough work sets
  - top-end reps across multiple sets
  - no shutdown/manual suppression
  - load is valid
- copy changes from normal "You earned more weight" to cautious "Strong first baseline. You can try a small increase next time."

Audit judgement:

- Good.
- Should remain conservative under any future rep strategy.
- First exposure should never create a learned strategy.

### Volume learning

Current sources:

- `src/domain/training/personalised-volume.ts`
- `src/domain/training/volume-adjustments.ts`
- `src/domain/training/volume-landmarks.ts`

Current interaction with reps:

- volume learning mostly uses quality sets, progression rate, fatigue/drop-off, and muscle-level signals
- some copy still says "Aim for the top of the range" when mild underdosing is detected

Audit judgement:

- Volume learning should not assume top-of-range is always the answer.
- For rep-biased accessories, "top of range" is often right.
- For heavy-biased compounds, better copy would be "add productive work in the useful zone" or "build either reps or load within the target."

### Set prescription

Current sources:

- `src/domain/training/set-prescription.ts`
- `src/domain/training/productive-set-targets.ts`
- `src/domain/training/slot-prescription-matrix.ts`

Set prescriptions are now block/role-aware and not the main problem. They define how much work to do, while rep strategy should define how to interpret performance inside the prescribed rep range.

### Workout Review copy

Current sources:

- `src/domain/training/post-workout-review.ts`
- `src/domain/training/progression-engine.ts`
- UI copy in Train/Review

Current language still includes:

- "Top-end baseline"
- "Top-end reps"
- "You earned more weight"
- "Aim for more clean reps next time"
- "Aim for the top of the range"

Audit judgement:

- Copy is coherent for double progression.
- It should become role/strategy-aware if a rep strategy model is implemented.

## 2. Recommended Strategy Hierarchy

Recommended hierarchy:

1. Exercise-specific learned strategy
2. Exercise family / movement pattern strategy
3. Slot role strategy
4. Block/lane constraints
5. Default strategy

### 1. Exercise-specific learned strategy

This should be the highest normal layer once enough evidence exists.

Example:

- Bench Press in Hypertrophy may learn that a user reliably progresses from lower-end sets at heavier loads.
- Machine Fly may learn the user responds better by accumulating reps near the top of the range before load jumps.
- Hammer Curl may learn a rep-biased strategy even if curls as a broad class default to rep-biased anyway.

It must require multiple exposures and stable enough evidence.

### 2. Exercise family / movement pattern strategy

Used when exercise-specific evidence is insufficient.

Examples:

- horizontal press primary: load-biased or balanced
- machine chest fly: rep-biased
- lateral raise / rear delt: rep-biased
- heavy leg press / hack squat in primary slot: balanced or load-biased
- curl / pushdown: rep-biased
- core stability: quality/time-biased, not load-biased

### 3. Slot role strategy

Slot role should influence interpretation more than exercise name alone.

Example:

- Leg Press as primary lower slot can be balanced/load-biased.
- Leg Press as secondary hypertrophy volume slot can be balanced/rep-biased.
- Machine Press as primary slot should not be treated like a low-priority isolation exercise.

### 4. Block/lane constraints

Block and lane can override strategy.

Examples:

- Power lane: speed quality beats rep chasing.
- Peak lane: specificity/readiness beats rep preference.
- Recovery lane: no aggressive progression.
- Strength block: primary lifts lean load-biased/conservative.
- Hypertrophy block: isolations lean rep-biased.

### 5. Default strategy

Used only when no better context exists.

Recommended default:

- balanced for general secondary compounds
- rep-biased for isolation/accessories
- load-biased for primary strength compounds

## 3. Default Strategy By Role

### Primary compound

Default zone:

- load-biased or balanced depending block

Progression interpretation:

- repeated lower/mid-range clean work can be success if load is stable/rising and fatigue is low
- top of range is not mandatory

When to add load:

- stable/improving performance across required sets
- no drop-off/shutdown
- sufficient exposure
- fatigue controlled
- heavy-end occupancy stable/rising

When to add reps:

- first exposure or low confidence
- moderate fatigue
- technique/readiness uncertainty
- hypertrophy block with no need to rush load

When to hold:

- moderate/high fatigue
- falling occupancy
- first exposure without strong top-end baseline
- peak/recovery/taper constraints

### Secondary compound

Default zone:

- balanced

Progression interpretation:

- both load and reps matter
- lower-end work is acceptable if load trend is positive
- higher reps are useful before jumping load when fatigue cost is moderate

When to add load:

- repeated mid/top range or heavy-end stable work with low fatigue

When to add reps:

- when load jumps are large
- when technique quality or fatigue cost suggests patience

When to hold:

- inconsistent set-to-set output
- local fatigue

### Machine compound

Default zone:

- balanced for primary/secondary slot
- rep-biased if used as low-fatigue hypertrophy accessory

Progression interpretation:

- machine stack increments can be irregular
- exact user-entered load should be respected
- load jumps may be larger or awkward, so reps should often build first

When to add load:

- strong stable work across multiple sets
- top half of range achieved repeatedly
- low fatigue

When to add reps:

- most normal progression, especially if load jumps are large

When to hold:

- if a load jump would force bottom-of-range collapse

### Unilateral

Default zone:

- balanced to rep-biased

Progression interpretation:

- consistency and side-to-side quality matter
- load progression should be slower than bilateral compounds

When to add load:

- stable reps and no form/fatigue collapse

When to add reps:

- default first move

When to hold:

- high local fatigue, balance/skill degradation, excessive soreness

### Isolation

Default zone:

- rep-biased

Progression interpretation:

- top-half/top-end reps matter more than load jumps
- do not reward heavy low-rep swinging on isolation work

When to add load:

- repeated top-end work across enough sets
- drop-off controlled
- no pain/manual finish

When to add reps:

- default progression until upper range is consistently reached

When to hold:

- lower-end reps on a heavier load without enough evidence

### Small muscle isolation

Includes:

- lateral raises
- rear delts
- curls
- pushdowns/extensions
- forearms

Default zone:

- strongly rep-biased

Progression interpretation:

- quality reps and repeatability matter more than load
- load jumps should be conservative

When to add load:

- multiple exposures near top of range
- no joint/pain signal
- no major drop-off

When to add reps:

- almost always before load

When to hold:

- reps are at low end because load is too heavy

### Calves

Default zone:

- rep-biased

Progression interpretation:

- high-rep tolerance is normal
- load can rise, but not at the expense of range consistency

When to add load:

- upper range repeated with controlled drop-off

When to add reps:

- default

### Core/bracing

Default zone:

- quality-biased, not load-biased

Progression interpretation:

- reps/time/control/anti-extension/anti-rotation quality matter
- load increases should be conservative and exercise-dependent

When to add load:

- only for loaded core movements after repeated clean exposures

When to add reps/time:

- default

When to hold:

- any technique or fatigue degradation

### Power movement

Default zone:

- sharpness-biased

Progression interpretation:

- speed/quality wins
- never chase reps if quality degrades

When to add load:

- only when power quality is sharp

When to add reps:

- rarely; volume is capped

When to hold:

- acceptable quality

When to pull back:

- degrading quality, shutdown/drop-off, repeated decline

### Peak/specific lift

Default zone:

- specificity/readiness-biased

Progression interpretation:

- target is expression and readiness, not accumulation

When to add load:

- rarely, only if planned and evidence is strong

When to add reps:

- not the main goal

When to hold:

- default

### Recovery movement

Default zone:

- easy-quality-biased

Progression interpretation:

- no aggressive progression

When to add load:

- generally not during Recovery Window

When to add reps:

- only within easy quality

When to hold:

- default

## 4. Learning Model

Recommended output:

- `load_biased`
- `balanced`
- `rep_biased`
- `insufficient_data`

Do not call it a user style globally. It should be per exercise and contextual.

### Inputs

Use:

- completed productive work sets
- exact exercise history
- target rep range
- load trend
- rep trend
- repeated exposures
- occupancy score and trend
- stable performance
- drop-off/shutdown history
- manual finish reason
- pain/limitation/equipment reasons
- block/lane
- slot role
- exercise family
- load increment size
- first-exposure status

Exclude:

- warm-ups
- deleted sets
- future removed rows
- cardio
- manual finishes that suppress performance inference
- pain/equipment-unavailable removals as negative performance

### Minimum evidence

Suggested minimum:

- at least 3 exposures for normal classification
- at least 9 productive sets
- at least 2 separate calendar days/weeks
- no dominant pain/equipment/manual-finish confounder

Possible low-confidence inference:

- 2 exposures and 6 productive sets may provide "early lean"
- should not drive aggressive recommendations alone

### Classification logic

Load-biased:

- average occupancy lower/mid range
- load trend stable/rising
- quality sets stable
- no repeated shutdown
- performance improves without needing top-range reps
- common on primary compounds and heavy machine compounds

Balanced:

- occupancy sits around middle range
- reps and load both contribute
- no strong evidence either direction

Rep-biased:

- occupancy usually upper range before load changes
- load jumps are less frequent
- performance improves by accumulating reps
- common on isolations, small muscles, calves, core

Insufficient data:

- not enough exposures
- inconsistent/confounded history
- recent pain/equipment/manual-finish signals
- block/lane makes strategy irrelevant

### Confidence

Use:

- exposure count
- set count
- consistency
- recency
- absence of confounders
- agreement with slot-role default

Confidence should decay when:

- exercise not trained recently
- block changes dramatically
- exercise role changes
- load increments change
- user swaps away repeatedly

## 5. User-Facing Guidance Recommendation

Do not add a global onboarding setting.

Reason:

- it invites users to self-label too early
- it cannot represent exercise-specific behaviour
- it risks making the app less adaptive

Recommended user-facing copy:

- "Heavy-end work today."
- "Balanced target zone."
- "Build reps first."
- "Keep it sharp."
- "Easy quality reps."
- "Consolidate the load."
- "Earn cleaner reps before adding weight."

Do not show:

- occupancy score
- classification labels like `load_biased`
- percentages
- algorithmic jargon

Potential later manual override:

Exercise detail setting:

- Let app decide
- Prefer load progression
- Prefer rep progression

But this should be later and should not override safety/fatigue/block constraints.

Recommended now:

- no manual override
- hidden learned strategy
- brief contextual copy only when it changes the recommendation

## 6. Progression Rule Recommendations

### Bench Press 8-12

Recommended interpretation:

- repeated 8-9 clean reps at stable/rising loads can be success
- do not require 12s forever
- heavy-end progression should need low fatigue and stable/rising history

Push:

- repeated lower-range work with load trend up and no drop-off

Hold:

- first exposure, moderate fatigue, or inconsistent reps

Pull back:

- repeated decline, shutdown, systemic fatigue

### Incline Press 8-12

Recommended interpretation:

- balanced
- progress by reps first when load jumps are costly
- allow load progression from mid/top work or learned heavy-end strategy

### Machine Fly 12-20

Recommended interpretation:

- rep-biased
- build reps first
- lower-end reps are valid work but not a strong load-progression signal

Push:

- multiple sets in upper range across exposures

Hold:

- low-end reps at heavier load

### Lateral Raise 12-25

Recommended interpretation:

- strongly rep-biased
- load jumps should be slow
- high-quality reps and controlled drop-off matter more than load

### Leg Press / Hack Squat

Recommended interpretation:

- depends on slot
- primary lower slot: balanced/load-biased
- secondary hypertrophy slot: balanced/rep-biased

### Curls / Pushdowns

Recommended interpretation:

- rep-biased
- top-half/top-end reps before load
- avoid rewarding heavy low-rep form breakdown

### Power movement

Recommended interpretation:

- ignore rep preference
- quality/sharpness controls progression
- acceptable quality holds
- degrading quality pulls back

### Peak

Recommended interpretation:

- specificity/readiness overrides rep strategy
- default hold unless planned progression and strong evidence

### Recovery Window

Recommended interpretation:

- no aggressive progression
- quality and fatigue reduction are the goals

## 7. Risks

### Too complex

The model could become hard to reason about if it creates too many layers.

Mitigation:

- keep hierarchy clear
- expose simple guidance only
- log evidence internally

### Noisy inference

Three sessions may still be noisy, especially with variable sleep, machines, swaps, or manual finishes.

Mitigation:

- require confidence
- decay stale classifications
- never override fatigue/pain/recovery constraints

### Confusing users

If one exercise says "build reps first" and another says "heavy-end work," users may think the app is inconsistent.

Mitigation:

- explain in guide: different exercises progress differently
- keep copy plain

### Overfitting behaviour

A user may always underperform reps on an exercise because the load is too heavy, not because they are truly load-biased.

Mitigation:

- require stable/improving performance
- distinguish heavy-end success from repeated low-end struggle
- do not classify load-biased if quality sets or reps are falling

### Rewarding low-effort low-rep work

Without RPE/RIR, the app cannot always tell heavy effort from sandbagging.

Mitigation:

- use load trend, consistency, set completion, drop-off, and progression history
- require enough work sets
- do not push from low-end occupancy unless load/performance is improving

### Failing to account for load increments

Large machine jumps or dumbbell jumps can make rep-biased progression more appropriate.

Mitigation:

- include load increment size in strategy inference
- if jump size is large relative to load, bias toward reps/hold

### Strategy conflict with block

A learned rep-biased strategy should not make Peak chase reps.

Mitigation:

- block/lane constraints override strategy

## 8. Final Implementation Recommendation

Recommendation: **D) Hybrid: slot-role default + exercise-specific learning**

Do not implement:

- A) global strategy setting

Reason:

- too simplistic
- user self-report is less reliable than observed behaviour
- cannot model Bench vs Fly vs Curl differences

Do not stop at:

- C) slot-role default only

Reason:

- good baseline, but misses individual exercise behaviour
- does not learn that a specific user thrives at the heavy end on Bench but top-end reps on Flys

Recommended implementation shape:

1. Add a pure domain model, likely `src/domain/training/rep-strategy.ts`.
2. Inputs:
   - exercise metadata
   - slot role
   - block/lane
   - target rep range
   - exact exercise history
   - occupancy result
   - progression/fatigue/drop-off/manual-finish/pain/equipment signals
3. Output:
   - strategy: `load_biased | balanced | rep_biased | insufficient_data`
   - source: `exercise_learned | family_default | slot_default | block_override`
   - confidence
   - guidance copy
   - progression interpretation
4. Use slot/family defaults until learned strategy is confident.
5. Let Power, Peak, Recovery Window, taper, deload/re-entry, pain, and fatigue override.
6. Replace generic top-of-range copy with strategy-aware copy.
7. Preserve current rep-range occupancy as a lower-level input.

Implementation priority:

1. Define strategy defaults by role/family/block.
2. Wrap existing occupancy into a strategy resolver.
3. Feed strategy into progression throttle.
4. Update post-workout review copy.
5. Update volume-adjustment copy away from universal "top of range."
6. Add tests for compound, machine, isolation, power, peak, recovery, and low-history cases.

Bottom line:

Adaptive Strength Coach should not ask users whether they are load-biased or rep-biased. It should infer the correct strategy per exercise, inside the context of the slot and block, then keep the user-facing guidance simple.
