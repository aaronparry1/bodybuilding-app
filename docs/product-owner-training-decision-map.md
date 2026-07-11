# Adaptive Strength Coach Product Owner Training Decision Map

Date: 2026-06-04

Audience: product owner, coach, and training-system decision maker.

This document explains the current decision model in plain English.

Format used throughout:

**IF this happens -> THEN the app does this -> BECAUSE this is the training reason.**

No section assumes RPE or RIR. Adaptive Strength Coach uses logged reps, loads, completed sets, exercise metadata, and workout history.

## Part 1: One-Page Summary

Adaptive Strength Coach works as a training operating system with two layers.

Layer 1 is the strategic layer:

- The plan decides what kind of training the user is doing.
- The block decides the current training emphasis.
- The exercise library provides suitable exercise options.
- The workout generator chooses exercises that match the plan, block, workout type, equipment, and experience level.
- The rep strategy chooses rep targets from block type, exercise role, and exercise family.

Layer 2 is the tactical layer:

- The user chooses or warms up to find the load.
- Work sets decide how much productive volume is actually performed.
- Drop-off decides when an exercise should stop.
- Progression decides whether the next load should increase.
- History updates Progress, analytics, and strategic coaching.
- Strategic coaching recommends whether the user should continue, reduce workload, deload, repeat a block, or move to the next block.

The simple product promise is:

**The plan decides what to train. Performance decides how much training gets done.**

Example:

IF the user is in a Hypertrophy block and today is Push  
-> the app builds a Push workout with pressing, delt, and triceps work  
-> BECAUSE the plan says today is Push and the block says the goal is muscle-building volume.

IF the user logs Bench Press for 12, 11, 10, 8 with a 15% drop-off rule  
-> the app stops Bench Press after the 8-rep set  
-> BECAUSE 8 is below the minimum acceptable performance from the best set.

IF the user logs Bench Press for 12, 11, 10, 10 and the target is 8-12  
-> the app can recommend a load increase next time  
-> BECAUSE the user reached the top of the rep range and completed enough productive sets without dropping below threshold.

## Recommendation Evidence Rule

Core rule:

**No recommendation without evidence.**

IF evidence is missing  
-> the app says **Not enough data yet** or gives default setup guidance  
-> BECAUSE the product should not pretend certainty from empty history.

Confidence definitions:

- `high`: direct user history supports the recommendation.
- `medium`: enough user history supports a conservative recommendation, but it is not exact.
- `low`: weak signal only; do not apply a meaningful action automatically.
- `insufficient_data`: the app should suppress the recommendation and explain what data is needed.

Source definitions:

- `history`: real completed user sessions.
- `default`: a safe default prescription, such as a planned prep routine or starting block structure.
- `limited_data`: not enough completed data for a real coaching call.
- `fixture`: Design QA/demo data only. It must be labelled and must not sync to cloud.

Minimum evidence rules:

- Home coach note: needs 3-5 completed workouts before strategic advice appears.
- Progress verdict/action: needs at least 3 completed, non-zero-set workouts.
- Same-family load estimate: needs enough recent same-family work-set history and acceptable similarity confidence.
- Load increase in-session: needs 3 productive top-of-range work sets at the same load.
- Reduced-load recommendation: needs repeated objective decline, not one poor session.
- Volume change: needs enough completed history and meaningful weekly productive-set data.
- Deload: needs enough completed history plus recovery/fatigue signals.
- Fatigue separation: needs completed work-set history; classifies exercise-specific, muscle-local, systemic, mixed, or insufficient data before deciding whether to hold, reduce, rotate, deload, or adjust volume.
- Exercise rotation: needs repeated stall/regression/shutdown evidence.
- Block transition: needs a real active plan block at its planned endpoint.
- Prep/capacity: is optional default guidance, not a performance recommendation.

Recommendation-source audit:

| Recommendation | Data source | Minimum data | If missing |
| --- | --- | --- | --- |
| Home coach note | Completed workout history through strategic coaching | 3 completed workouts | Show limited-data note |
| Progress verdict | Completed workout history only | 3 completed, non-zero-set workouts | "Log 3-5 workouts first" |
| Progress next action | Strategic signals, volume, rotation, plan state | Same as the specific action | Suppress action |
| Exact starting load | Exact exercise history | 1 exact completed exercise summary | Check same-family estimate |
| Same-family load estimate | Similar exercise work-set history | At least 2 similar exercises or 3 same-family entries, recent enough, confidence not low | Leave load blank |
| In-session load increase | Current work sets | 3 productive top-range sets at same load | No suggestion |
| Next-session load | Productive work-set loads from the session | At least 1 productive work set | Fall back to current load |
| Reduced load | Recent exercise history | 3 recent exposures plus repeated decline signals | Hold load/caution |
| Soft cap | Productive work-set count and role/block target | Current exercise productive sets | No soft-cap prompt |
| Volume change | Weekly productive sets by muscle group | Enough completed history | Suppress |
| Deload | Strategic fatigue/readiness signals | Enough completed history | Suppress |
| Fatigue classification | Work-set history, shutdown/drop-off, volume signals, extra workload, gap/deload state | 3 completed workouts and enough work-set entries | Return insufficient_data |
| Block transition | Active plan block state | Block at planned endpoint | Suppress actions |
| Exercise rotation | Exercise exposure history | 4 no-progression exposures, or repeated early shutdowns, or 3-exposure regression | Keep exercise stable |
| Generated workout/session | Active plan, block, equipment, exercise taxonomy | Active plan/settings, or explicit ad-hoc request | Label as a default/planned session, not a progress recommendation |
| Session Prep | Workout type default routine | Workout type | Offer optional prep/skip; does not count as productive training evidence |
| Capacity Focus | User-enabled focus area | User setting | Show default capacity track, not a rehab recommendation |

## Part 2: Decision Tree: What Workout Does The User Do Today?

### Active Workout Exists

IF an active workout exists  
-> show **Continue Workout**  
-> BECAUSE the user should finish the session they already started before creating another one.

Example:

The user started Upper yesterday and did not finish it. When they open Home, the app should point them back to that session, not create a new Push workout.

### No Active Plan Exists

IF no active plan exists  
-> show **Set Up Plan**  
-> BECAUSE the app cannot honestly prescribe training without knowing the user's goal, equipment, schedule, split, and starting block.

Example:

A fresh user opens the app. The app should not invent "Push" or "Upper". It should ask the user to set up training direction first.

### Active Plan Exists And Today Is A Training Day

IF an active plan exists and today's split item is a workout  
-> show today's planned workout  
-> BECAUSE the plan provides the weekly structure.

Example:

Plan: 4 days/week, Upper/Lower.  
Today: Upper.  
The app shows Upper.

### Active Plan Exists And Today Is A Rest Day

IF an active plan exists and today's split item is Rest  
-> show Rest Day and the next upcoming workout  
-> BECAUSE rest is part of the plan and the user should not be nudged into random extra work by default.

Example:

Today is Rest. Next workout is Lower.  
The app shows Rest Day and "Next session: Lower."

### Workout Completed Today

IF today's planned workout is already completed  
-> show completed state and the next planned workout if useful  
-> BECAUSE repeating a completed planned session by accident would corrupt training flow and history.

Example:

The user completed Push at lunch. They reopen the app at night. The app should not say "Start Push" again as if nothing happened.

### Body-Part Split Contexts

IF the split uses body-part labels like Chest, Back, or Shoulders  
-> the app uses dedicated body-part generator contexts  
-> BECAUSE visible split labels should produce workouts that match the training purpose, not crude Push/Pull/Upper aliases.

Current mapping:

- Chest -> Chest
- Back -> Back
- Shoulders -> Shoulders
- Legs -> Legs
- Arms -> Arms
- Full Body -> Full Body

Context rule:

An exercise can be valid in multiple session types when its role fits the slot. For example, Face Pull can support Pull or Shoulders, Lateral Raise can support Push or Shoulders, and Shrugs can support Pull or Shoulders. The primary slot must still match the session purpose.

Product-owner decision for later:

How much body-part split volume/frequency should beta users see before the app starts recommending a broader split?

## Part 3: Decision Tree: What Exercises Are Chosen?

Exercise selection depends on the workout type, block, template slot, equipment, experience level, and recent training context.

### Planned Workout

IF a workout comes from a selected programme day  
-> use the exercises already stored in that programme day  
-> BECAUSE a planned programme should remain stable unless the user changes it.

### Generated Or Ad-Hoc Workout

IF the user creates a generated session such as Push  
-> use a template for that workout type and current block  
-> BECAUSE a good workout starts with structure, not random exercise matching.

### Exercise Role

IF the template slot asks for a Primary Compound  
-> prefer exercises marked Primary Compound  
-> BECAUSE the main lift should be the highest-priority, highest-skill, highest-output movement.

IF the template slot asks for Isolation  
-> prefer exercises marked Isolation  
-> BECAUSE that slot exists to target a muscle directly with lower coordination cost.

### Exercise Tier

IF an exercise is Tier A  
-> prefer stability across the block  
-> BECAUSE core exercises need repeated exposure to build skill, track progression, and avoid noisy data.

IF the planned workout is inside the current rotation window  
-> keep the same selected exercises  
-> BECAUSE consistent exposure is part of coaching, not a lack of imagination.

IF an exercise is Tier C  
-> allow controlled deterministic variation after the rotation window or when evidence supports it  
-> BECAUSE accessories can refresh the programme without damaging the structure.

### Exercise Family

IF a workout already has a horizontal press  
-> avoid adding too many more horizontal presses unless the template specifically wants that  
-> BECAUSE redundant movement patterns can waste fatigue without adding useful stimulus.

### Equipment

IF the user has machines only  
-> choose machine and cable options  
-> BECAUSE the app should prescribe exercises the user can actually perform.

IF the user has full gym  
-> barbell, dumbbell, cable, machine, smith, and bodyweight options can be considered  
-> BECAUSE the available exercise pool is wider.

### Experience Level

IF the user is a beginner  
-> avoid advanced-only exercises  
-> BECAUSE beginner sessions should be technically simple enough to execute well.

IF the user is advanced  
-> allow more complex or higher-skill exercises  
-> BECAUSE advanced users can benefit from a wider exercise menu and handle more technical lifts.

### Recent Exercise Use

IF the same accessory has appeared repeatedly  
-> the generator can choose another suitable accessory  
-> BECAUSE accessories can rotate to reduce staleness without breaking the plan.

IF a Tier A primary exercise is progressing  
-> keep it stable  
-> BECAUSE changing the main lift too often makes progression harder to judge.

IF a Tier B support exercise is progressing  
-> usually keep it until a stall or block change  
-> BECAUSE supporting lifts still benefit from enough repeated exposure.

IF a Tier C accessory is used repeatedly  
-> rotate it more freely  
-> BECAUSE small accessories are less central to progression tracking and easier to swap without damaging the programme.

### Stalled Exercises

IF an exercise has not progressed for several sessions  
-> the generator can avoid or rotate that exercise in future suggestions  
-> BECAUSE a purposeful variation can restart progression or reduce repetitive stress.

Exercise rotation rule:

- Progressing = keep it.
- Stalled = rotate it.
- Tier A stays stable while progressing.
- Tier A rotates only if stalled, painful/unavailable, or the block strategy genuinely changes.
- Tier B can rotate at block change or when stalled.
- Tier C can rotate more freely.
- No random novelty for its own sake.

Current implementation: active planned workout generation now uses the controlled planned rotation path, so exercises stay stable inside the rotation window and can rotate deterministically when the window changes.

### Rotation Recommendation

IF a Tier A exercise is progressing  
-> recommend keeping it stable  
-> BECAUSE the main lift is still producing useful signal.

IF a Tier A exercise has no progression for 4 exposures  
OR repeated early shutdowns  
OR best-set regression across 3 exposures  
-> recommend a purposeful replacement from the same family/role where possible  
-> BECAUSE the exercise is no longer giving a good return for the fatigue or repetition cost.

Example:

IF Bench Press stalls across 4 exposures  
-> suggest a horizontal-press replacement such as Machine Chest Press  
-> BECAUSE the user keeps training chest pressing, but changes the constraint enough to restart progress.

IF Cable Fly stalls  
-> suggest another chest-isolation option  
-> BECAUSE Tier C accessories can rotate with less cost to progression tracking.

### Fatigue / Volume State

IF recent fatigue signals are high  
-> the generator can reduce exercise count or choose lower-fatigue options  
-> BECAUSE the session should not dig a deeper hole when output is already falling.

Current limitation: fatigue-aware trimming exists, but the full product experience around this is still early.

### Fatigue Separation

IF only one lift repeatedly declines  
-> classify fatigue as exercise-specific  
-> BECAUSE the likely response is hold/reduce/variation for that lift, not a global deload.

IF several exercises for the same muscle decline and muscle-volume signals are high-cost  
-> classify fatigue as muscle-local  
-> BECAUSE the likely response is to reduce local volume or accessories.

IF multiple unrelated lifts/muscles decline, shutdowns repeat across sessions, or extra sessions become a real workload  
-> classify fatigue as systemic  
-> BECAUSE broad fatigue should suppress aggressive progression and support deload/re-entry/hold decisions.

IF local and systemic signals overlap  
-> classify fatigue as mixed  
-> BECAUSE the product should not oversimplify the response.

This layer feeds Progress evidence, deload evidence, personalised volume decisions, progression throttle, and primary-lift rotation. It does not use RPE/RIR and does not make medical claims.

### Practical Examples

#### Push Hypertrophy

IF the workout is Push in Hypertrophy  
-> choose a primary press such as Bench Press  
-> BECAUSE chest/triceps/front-delt tension is the main target and a stable compound gives measurable progression.

IF Bench Press fills the main slot  
-> choose Incline Press or another secondary press next  
-> BECAUSE the workout still needs more pressing volume from a different angle.

IF enough pressing is already included  
-> choose Cable Fly or Pec Deck later  
-> BECAUSE chest isolation adds direct volume with less systemic fatigue.

IF shoulders need direct work  
-> choose Lateral Raise  
-> BECAUSE side delts usually need higher-rep direct work, not more heavy pressing.

IF triceps need direct work  
-> choose Triceps Pushdown  
-> BECAUSE triceps finish the Push session without adding another heavy press.

#### Pull Strength

IF the workout is Pull in Strength  
-> include a row or pull-up/pulldown early  
-> BECAUSE back strength needs heavy pulling patterns.

IF the workout lacks vertical pulling  
-> add pulldown or pull-up  
-> BECAUSE lats need a vertical-pull pattern, not only rows.

IF the workout lacks horizontal pulling  
-> add row  
-> BECAUSE upper back and scapular retraction need horizontal-pull work.

IF Dumbbell Pullover is available  
-> do not use it as the main back exercise  
-> BECAUSE it is not a primary strength movement and should not replace rows or pulldowns.

#### Power

IF the block is Power  
-> choose Power Clean, Hang Clean, Box Jump, Jump Squat, Medicine Ball Throw, Speed Bench, or Push Press in power slots  
-> BECAUSE power work requires speed and intent.

IF the app simply prescribes Bench Press for triples as "power"  
-> that is not enough  
-> BECAUSE low reps alone do not make an exercise power-focused.

IF power-lane work is logged  
-> classify quality as sharp, acceptable, degrading, or insufficient data from completed reps, consistency, missed work, drop-off, fatigue, and lane context  
-> BECAUSE Power should push only when output stays clean, hold when quality is merely acceptable, and pull back when output fades.

IF a user asks whether the app measures bar speed  
-> say no  
-> BECAUSE Adaptive Strength Coach uses logged performance proxies, not velocity devices or fake precision.

## Part 4: Decision Tree: How Many Exercises Are Chosen?

Current behaviour is mostly template-driven.

IF the workout is Push Hypertrophy  
-> choose the number of exercises from the Push Hypertrophy template  
-> BECAUSE the template defines the intended session structure.

IF the workout is Strength or Power  
-> choose fewer exercises than Hypertrophy  
-> BECAUSE lower-rep, higher-intensity work costs more fatigue and needs higher set quality.

IF available time is provided  
-> cap the number of exercises  
-> BECAUSE a 35-minute session cannot honestly support the same menu as a 75-minute session.

IF fatigue signals are high  
-> trim the workout  
-> BECAUSE the user needs less workload, not more exercise variety.

### Current State

Exercise count is currently:

- template-driven first
- optionally reduced by available time
- optionally trimmed by fatigue-aware logic

It is not yet deeply adaptive to the user's exact weekly recovery profile.

### What Should Stay Template-Driven

The following should stay template-driven:

- session structure
- exercise role order
- main movement priority
- minimum movement balance
- power/strength/hypertrophy emphasis by block

Reason:

Templates keep workouts coach-like and prevent random exercise soup.

### What Should Become Adaptive Later

The following should become more adaptive:

- total exercise count
- number of work-set opportunities per exercise
- accessory volume
- choice between high-fatigue and low-fatigue alternatives
- whether to trim compounds when fatigue is high
- whether to add direct volume when a muscle is tolerating work well

Reason:

A good coach keeps the structure stable but adjusts the dose.

## Part 5: Decision Tree: What Rep Range Is Chosen?

Rep range is no longer a global setting.

### Priority Order

IF a programme/session slot has an explicit rep range  
-> use that rep range  
-> BECAUSE an explicit prescription should beat general rules.

IF no explicit slot range exists  
-> use block type plus exercise role  
-> BECAUSE a primary compound in Strength should not use the same reps as a lateral raise in Hypertrophy.

IF the exercise family has a special need  
-> use the family override  
-> BECAUSE calves, rear delts, forearms, core, jumps, and throws often need different targets.

IF no block/role/family rule applies  
-> use the exercise default  
-> BECAUSE each exercise still has a reasonable fallback.

IF advanced custom control is enabled later  
-> allow advanced user override  
-> BECAUSE some users will want full control.

IF nothing else exists  
-> use safe fallback  
-> BECAUSE the app must not crash or prescribe nonsense.

### Examples

IF Bench Press is in a Hypertrophy block as a Primary Compound  
-> use 6-10  
-> BECAUSE heavy compounds can build muscle well at lower hypertrophy reps while preserving load quality.

IF Incline Dumbbell Press is in a Hypertrophy block as a Secondary Compound  
-> use 8-12  
-> BECAUSE secondary compounds usually work well with moderate reps and slightly less load emphasis.

IF Lateral Raise is in a Hypertrophy block  
-> use 12-25  
-> BECAUSE small-muscle isolation generally tolerates and benefits from higher reps.

IF Power Clean is in a Power block  
-> use 1-3  
-> BECAUSE power output drops when reps get too long.

IF Leg Curl is in a Strength block  
-> use 10-15  
-> BECAUSE it is hypertrophy maintenance/accessory work, not the main strength lift.

## Part 6: Decision Tree: What Weight Does The User Use?

### Current Starting Load Priority

Adaptive Strength Coach now uses this priority:

1. Exact exercise history.
2. Same-family estimate when the evidence is reliable enough.
3. Blank load with guided discovery when no reliable data exists.

The app must not invent a load just to look confident.

### Exact Exercise History

IF exact exercise history exists and progression was earned  
-> suggest the previous next recommended load  
-> BECAUSE the user earned the load increase from actual reps.

IF exact exercise history exists and progression was not earned  
-> use the last load  
-> BECAUSE the user has not yet earned a heavier load.

IF the exercise is bodyweight  
-> load is 0 and considered known  
-> BECAUSE external load is not required for the basic set entry.

### Similar Exercise History

IF no exact history exists but same-family history exists  
-> estimate only if there is enough reliable data  
-> BECAUSE similar exercises can provide a useful clue, but they are not the same exercise.

Same-family estimates require:

- same exercise family
- same primary muscle or movement pattern
- enough data: at least 2 similar exercises logged, or at least 3 completed sessions in that family
- recent enough history to be useful
- completed sessions only
- work sets only
- no warm-up sets
- no abandoned or zero-set sessions

The estimate uses:

`estimated1RM = load × (1 + reps / 30)`

Then converts back to the target reps:

`targetLoad = estimated1RM / (1 + targetReps / 30)`

The target reps are the midpoint of the planned rep range.

Then the app applies a conservative similarity multiplier:

- same family and similar equipment: stronger estimate
- same family but different equipment style: more conservative estimate
- machine to free weight: conservative estimate
- dumbbell to barbell/free-weight transfer: conservative and only when confidence is acceptable

IF confidence is too low  
-> do not estimate  
-> BECAUSE a blank load with warm-up guidance is safer than a fake precise number.

IF same-family estimate is shown  
-> label it as an estimate  
-> BECAUSE the user should treat it as a starting clue, not a command.

IF an estimated load is produced  
-> round it to the user's available equipment increment  
-> BECAUSE a recommendation is only useful if the user can actually load it in the gym.

Load increment hierarchy:

1. Exercise-specific load jump override.
2. User-configured equipment jump.
3. Equipment default.
4. Safe fallback.

Examples:

- Barbell or plate-loaded work can round to 1kg, 2.5kg, or 5kg depending on the user's plates.
- Dumbbell work can round to 1kg, 2kg, 2.5kg, or 5kg depending on the user's dumbbell rack.
- Cable work can round to 1kg, 2.5kg, or 5kg depending on stack add-ons or GymPin-style loading.
- Machine work can round to 1kg, 2.5kg, or 5kg depending on stack add-ons or built-in increments.
- Bodyweight work stays at 0 unless the user enables external loading.

IF the user sets barbell jumps to 5kg  
AND the exercise has a smaller exercise-specific override  
-> use the smaller exercise-specific jump  
-> BECAUSE some movements need conservative progress even when the equipment category could jump more aggressively.

Example:

No Bench Press history exists.  
The user has enough recent horizontal-press history from Machine Chest Press and Dumbbell Bench Press.  
The app may show a conservative Bench Press estimate and say:

"Estimated from similar exercises. Adjust during warm-ups."

IF the user only has one weak similar entry  
-> leave load blank  
-> BECAUSE the estimate is not trustworthy enough.

### Blank / Guided Discovery

IF no exact history exists and no reliable same-family estimate exists  
-> leave load blank/unknown  
-> BECAUSE pretending to know the user's starting weight is dishonest.

IF load is unknown  
-> show percentage prescriptions with plain effort labels  
-> BECAUSE percentages alone are abstract, but fake loads are worse.

Examples:

- W1: 30% · easy warm-up
- W2: 45% · warm-up
- W3: 55% · close to working weight
- Work: 65-80% · hard but clean
- Strength work: 80-90% · heavy, clean reps
- Power work: fast reps, no grind

IF the user needs to find the load  
-> use warm-up/ramp sets  
-> BECAUSE warm-ups let the user discover today's working load without polluting progression data.

### Experience / Bodyweight Estimates

IF no history exists  
-> current app does not use beginner/intermediate/advanced bodyweight formulas  
-> BECAUSE bodyweight and experience estimates are still too blunt for reliable load prescription.

IF the user undershoots massively  
-> keep load or suggest a modest increase next time  
-> BECAUSE the target range was too easy but one session should not cause an aggressive jump.

IF the user overshoots massively  
-> stop early or suggest a lower next target  
-> BECAUSE missing the target range means the load was too heavy for the intended stimulus.

## Part 7: Decision Tree: What Happens After Each Work Set?

Warm-ups are ignored for this section. Only work sets count.

### Best Set

IF a work set is logged  
-> compare its reps to all previous work sets  
-> BECAUSE the highest-rep work set becomes the performance anchor.

### Minimum Allowed Reps

IF the best set is known  
-> calculate minimum acceptable reps from best set and drop-off percentage  
-> BECAUSE the app needs an objective stop line.

Example:

Best set = 12.  
Drop-off = 15%.  
12 - 15% = 10.2.  
Minimum allowed = 10.

### Productive Sets

IF a work set is within the target rep range and at/above the minimum allowed reps  
-> count it as acceptable/productive  
-> BECAUSE it met both the planned rep target and the fatigue threshold.

### Continue

IF the latest work set is at or above the minimum allowed reps  
-> allow the exercise to continue  
-> BECAUSE performance has not dropped too far.

### Near Threshold

IF the latest work set equals the minimum allowed reps  
-> show warning/close-to-threshold state  
-> BECAUSE one more productive set may remain, but the user is near the stop point.

### Shutdown

IF the latest work set is below the minimum allowed reps  
-> stop the exercise  
-> BECAUSE performance has dropped below the productive threshold.

### Rest Timer

IF a work set is logged  
-> start the rest timer  
-> BECAUSE the next work set needs enough recovery to be useful.

IF a warm-up set is logged  
-> do not start the same work-set rest logic  
-> BECAUSE warm-ups are not treated as productive work sets.

IF Session Prep offers Wenning Warm-up  
-> treat it as optional light high-rep primer work before lifting  
-> BECAUSE it prepares supporting muscles generally, while exercise warm-up rows handle specific loading ramps.

IF the user completes Session Prep or logs exercise warm-up rows  
-> save the prep/warm-up record but exclude it from productive sets, volume landmarks, fatigue signals, progression, same-family estimates, and load-reduction evidence  
-> BECAUSE prep is useful preparation, not proof that the training dose was productive.

### Examples

Target: 8-12.  
Load: 100kg.  
Drop-off: 15%.

Sets: 12, 11, 10, 8  
-> best set = 12  
-> minimum allowed = 10  
-> 8 is below 10  
-> stop  
-> BECAUSE performance dropped below threshold.

Sets: 12, 11, 10, 10  
-> best set = 12  
-> minimum allowed = 10  
-> latest set equals minimum  
-> no shutdown  
-> BECAUSE performance stayed within the allowed drop-off.

## Part 8: Decision Tree: What Makes Weight Go Up?

There are two different "go up" decisions:

1. An optional in-session escalation for today's next set.
2. A next-session starting-load recommendation after the exercise/session is summarized.

They are related, but they are not the same thing.

### In-Session Load Escalation

IF the user hits the top of the target rep range or higher for 3 productive work sets at the same load  
-> suggest increasing load for the next set  
-> BECAUSE today's performance says the current load may be too light for the intended stimulus.

This is a suggestion only.

IF the user accepts  
-> update the load for the next set  
-> BECAUSE the user confirmed they want to test a heavier load today.

IF the user ignores  
-> keep the current load  
-> BECAUSE the app should coach, not force the lifter mid-session.

IF the user accepts the increase and keeps hitting the top of the range or higher  
-> keep suggesting further increases  
-> BECAUSE performance is still showing reserve inside the objective rep target.

Example:

Target: 8-12.  
100kg: 12, 12, 12.  
-> suggest 102.5kg next set.

102.5kg: 12.  
-> suggest 105kg next set.

This does not change the tactical drop-off rule. If performance drops below threshold, the exercise still stops.

### Next-Session Progression

IF the best work set reaches the top of the target rep range  
AND enough acceptable work sets were completed  
AND the exercise did not shut down  
-> recommend increasing load next time  
-> BECAUSE the user proved the current load is ready to move.

### Enough Productive Sets

Current default required work sets: 3.

Example:

Target: 8-12.  
Required work sets: 3.  
Load: 100kg.  
Sets: 12, 11, 10, 10.

IF best set is 12  
AND at least 3 sets are acceptable  
AND no shutdown occurred  
-> recommend next load  
-> BECAUSE the load was handled at the top of the range with enough quality work.

### Load Jump

IF progression is earned  
-> next load = current load + the resolved equipment-aware load jump  
-> BECAUSE the app uses double progression: reps first, then a practical load increase the user can actually perform.

Example:

Current load = 100kg.  
Machine stack jump = 5kg.  
Progression earned.  
Next load = 105kg.

IF the same result happened on a barbell and the user has fractional plates  
-> the next jump may be 1kg total  
-> BECAUSE the smallest practical plate jump is different from the machine stack.

IF the same result happened with dumbbells and the user's gym jumps by 2kg  
-> the next jump is 2kg  
-> BECAUSE dumbbell racks do not always move in 2.5kg steps.

### Next-Session Starting Load From Productive Work

When multiple productive work-set loads are used in one exercise, the next-session starting load is not simply the highest load touched.

IF the exercise has productive work-set loads  
-> collect productive work-set loads only  
-> exclude warm-ups  
-> exclude sets below the drop-off threshold  
-> average the productive loads  
-> round up to the nearest valid equipment-aware load jump  
-> use that as the next-session starting recommendation  
-> BECAUSE the next session should reflect the average productive dose, not one top set or one easy warm-up.

Example:

Productive work-set loads:

100, 100, 100, 102.5, 105, 107.5, 110.

Average = 103.57.  
Rounded up to the available barbell jump = 105.  
Next session starts at 105.

Example:

Average productive load = 103.1kg.

- Barbell increment 1kg -> 104kg.
- Barbell increment 2.5kg -> 105kg.
- Barbell increment 5kg -> 105kg.

The app rounds upward, not down and not nearest, because recommendations should not understate the next productive starting point once the evidence supports progression.

IF the user touched 110 once but most productive work was around 100-105  
-> do not automatically start next session at 110  
-> BECAUSE the highest load is not the same as the best repeatable starting load.

## Part 9: Decision Tree: What Makes Weight Stay The Same?

IF the user completes productive work but does not hit the top of the rep range  
-> keep load the same  
-> BECAUSE the next target is more reps, not more weight.

Example:

Target: 8-12.  
Sets: 10, 10, 9.  
No shutdown.  
Best set = 10.  
Top of range = 12.

THEN keep load  
BECAUSE the user has not earned the load increase yet.

IF the user hits the top of the range but does not complete enough acceptable work sets  
-> keep load  
-> BECAUSE one good set is not enough evidence.

IF the user shuts down  
-> do not increase load from the tactical engine  
-> BECAUSE performance dropped below the stop threshold.

## Part 10: Decision Tree: What Makes Weight Go Down?

### Current Implementation

The tactical workout engine does not automatically decrease load from a single session.

IF one workout goes badly  
-> the tactical engine stops the exercise if drop-off is hit  
-> BECAUSE one bad session is enough to stop today's work, but not enough by itself to rewrite the training plan.

Decrease-load recommendations currently come from the coaching layer, not the set-by-set workout engine.

IF recent history shows regression or fatigue  
-> the coach can recommend reducing load  
-> BECAUSE repeated objective underperformance is stronger evidence than one bad set.

Examples of current decrease-load evidence:

- best set trending down
- load trending down
- volume load trending down
- repeated early drop-offs
- declining set count
- repeated failure to reach the target range
- quality-set collapse

IF one poor session happens  
-> hold load or show caution  
-> BECAUSE one bad day should not create load flip-flopping.

IF repeated objective decline appears across sessions  
-> recommend a lower load  
-> BECAUSE the current load is too demanding for the intended work.

IF a reduced load is recommended  
-> explain the evidence calmly  
-> BECAUSE the user should understand that this is load management, not failure.

Example:

Recent sessions show early shutdowns and declining best sets.  
-> recommend 95kg instead of 100kg.  
-> copy: "Recent performance suggests the current load is too demanding. Use 95kg next time."

### Ideal Future Rules

IF repeated early shutdowns occur across multiple sessions  
-> reduce next target load  
-> BECAUSE the current load is repeatedly producing early fatigue.

IF best set regresses across multiple sessions  
-> reduce load or hold load  
-> BECAUSE output is trending down.

IF quality sets collapse  
-> reduce volume first, or reduce load if performance also drops  
-> BECAUSE the user may be overreached rather than weak.

IF fatigue is high globally  
-> reduce workload before increasing load  
-> BECAUSE recovery is the limiter.

IF injury or pain flag exists later  
-> reduce load or swap exercise  
-> BECAUSE tissue tolerance overrides progression.

IF a strength/power block repeatedly fails main lifts  
-> reduce load, reduce volume, or deload  
-> BECAUSE high-intensity work punishes repeated misses quickly.

## Part 11: Decision Tree: What Makes The App Stop An Exercise?

IF the user logs warm-up sets  
-> ignore them for shutdown  
-> BECAUSE warm-ups are preparation, not productive work-set performance.

IF the user logs only warm-up sets  
-> keep those sets visible in history but do not create Progress or Home coaching recommendations from them  
-> BECAUSE the app needs real work-set evidence before it can honestly coach progression, volume, fatigue, or deloads.

IF the user logs work sets  
-> use them to calculate best set and minimum allowed reps  
-> BECAUSE work sets represent the real training dose.

IF latest work-set reps fall below minimum allowed reps  
-> shut down the exercise  
-> BECAUSE performance has dropped below the allowed threshold.

IF the exercise is shut down  
-> block more set logging  
-> BECAUSE the movement is complete for today.

IF the user taps undo  
-> remove the last set and re-evaluate  
-> BECAUSE mistakes happen and the state should recover cleanly.

IF the user explicitly chooses Reopen Anyway  
-> reopen after warning  
-> BECAUSE a wrongly logged set should be recoverable, but ignoring a true shutdown should be deliberate.

### Max Quality Set Cap

Current behaviour:

There is no hard maximum quality set cap for normal training.

There are role/block soft caps.

IF the user keeps staying above threshold  
-> the app allows more work  
-> BECAUSE volume is currently performance-led.

IF the user reaches the soft cap  
-> the app shows a coach prompt to move on unless the lift is a priority  
-> BECAUSE soft caps guide the decision without replacing drop-off.

Risk:

A user could do too many sets if they keep barely surviving above threshold.

Product-owner decision still needed:

Should Adaptive Strength Coach ever add hard caps by role/block?

Recommended answer:

Keep soft caps for normal training. Consider hard caps only for deload, peak, and high-fatigue states.

## Part 12: Decision Tree: How Does Volume Emerge?

IF the user performs more productive sets before drop-off  
-> volume rises  
-> BECAUSE performance capacity is higher.

IF the user hits drop-off sooner  
-> volume falls  
-> BECAUSE fatigue or low readiness is limiting output.

Example:

Week 1 Squat: 12, 11, 10  
-> 3 productive sets.

Week 2 Squat: 12, 12, 11, 10  
-> 4 productive sets.

Week 3 Squat: 12, 12, 12, 11, 10  
-> 5 productive sets.

The app reads this as rising volume tolerance.

### Current Minimum / Target / Maximum

Current behaviour:

- Minimum productive work for progression exists through `requiredWorkSets`.
- Role/block productive set targets now provide guidance.
- Soft caps now warn when enough productive work has been done.
- Hard maximum quality set cap does not exist.
- Volume landmarks exist as broad starting estimates.
- Personalized MEV/MAV/MRV landmarks are not fully learned yet.

### Starting Volume Landmarks

Large muscles:

- chest
- back
- quads
- hamstrings
- glutes

Starting estimates:

- MEV: 6-8 direct productive sets/week
- MAV: 10-16 direct productive sets/week
- MRV: 18-22 direct productive sets/week

Smaller muscles:

- biceps
- triceps
- side/rear delts
- calves
- abs
- forearms
- traps
- adductors/abductors

Starting estimates:

- MEV: 4-6 direct productive sets/week
- MAV: 8-14 direct productive sets/week
- MRV: 16-20 direct productive sets/week

Important:

These are broad starting estimates, not personalised truths.

IF weekly productive sets are low, fatigue is low, and progress is flat  
-> recommend adding a small amount of direct work  
-> BECAUSE the muscle may be below the productive zone.

IF weekly productive sets are high and fatigue/shutdowns are rising  
-> recommend reducing volume or deloading  
-> BECAUSE more work is no longer producing better output.

IF weekly productive sets sit in the productive zone and progress is moving  
-> recommend maintaining volume  
-> BECAUSE the current dose is working.

### Current Limitation

The app lets volume emerge, but it does not yet fully control the upper boundary.

Product-owner decision needed:

Should volume be:

- fully open until drop-off
- capped by exercise role
- capped by block
- capped by recent fatigue
- capped only with warnings

Recommended answer:

Use performance-led volume with soft caps by role/block and stronger caps when fatigue is high.

## Part 13: Decision Tree: When Does The App Recommend Deload Or Change Block?

### Fatigue Signal

IF shutdown rate is high  
OR quality sets are falling  
OR best-set performance is falling  
-> fatigue trend rises  
-> BECAUSE the user is producing less output before failure/stop.

### Readiness

IF progression is strong, quality sets are stable/rising, fatigue is low, and volume tolerance is stable/rising  
-> readiness score rises  
-> BECAUSE training is producing output without excessive fatigue.

IF progression is low, quality sets fall, fatigue is high, or volume tolerance declines  
-> readiness score falls  
-> BECAUSE the current strategy is not being tolerated or is no longer productive.

### Momentum

IF progression rate is rising, volume tolerance is rising, and fatigue is low  
-> momentum is Strong  
-> BECAUSE the user is adapting.

IF progression falls, volume collapses, and fatigue rises  
-> momentum is Declining  
-> BECAUSE training output is worsening.

### Block Duration

IF minimum block duration has not been reached  
-> recommend continuing unless fatigue is high  
-> BECAUSE the user needs enough exposure before changing strategy.

IF readiness is high and minimum duration is met  
-> recommend advancing block  
-> BECAUSE the user has adapted enough to shift emphasis.

IF readiness is low or fatigue is high  
-> recommend deload then continue  
-> BECAUSE recovery should happen before more overload.

### Planning Mode

IF planning mode is Guided Annual  
-> recommend next block in annual sequence when ready  
-> BECAUSE the user chose long-term progression.

IF planning mode is Single Block  
-> recommend repeating the same block when ready  
-> BECAUSE the user chose not to move into another style.

IF planning mode is Goal/Event  
-> recommend the next event-appropriate phase  
-> BECAUSE the date/goal determines the sequence.

### Automatic Or Recommendation?

Current behaviour:

Strategic coaching makes recommendations only.

It does not automatically change the block.

User override is expected later.

Recommended product stance:

Keep strategic changes as recommendations with a clear user confirmation.

## Part 14: Known Gaps Requiring Product-Owner Decisions

### 1. Starting Load With No History

Current behaviour:

Load is blank unless exact history or a reliable same-family estimate exists. User chooses a starting load through warm-ups when no reliable data exists.

Risk:

Beginners may not know what to choose.

Option A:

Keep blank load and provide warm-up guidance only.

Option B:

Add conservative estimates from bodyweight, experience, and exercise type.

Recommended choice:

Implemented current choice: use exact history first, conservative same-family estimates second, and blank guided discovery when evidence is not reliable enough.

### 2. Similar Exercise Load Estimation

Current behaviour:

Implemented with conservative gates.

The app estimates only when there is enough same-family data, uses work sets only, excludes warm-ups, applies an estimated1RM formula, converts back to target reps, and labels the result as an estimate.

Risk:

If the estimate is shown too confidently, the user may treat it as a prescription rather than a starting clue.

Option A:

Exact exercise history only.

Option B:

Same-family conservative estimates.

Recommended choice:

Keep same-family estimates, but always mark them as estimates. If confidence is low, show blank load and warm-up guidance.

### 3. Max Quality Set Cap

Current behaviour:

No hard cap for normal training.

The app now has role/block soft caps.

IF the user reaches the soft cap  
-> show coaching copy such as "You have completed enough productive work. Move on or continue only if this is a priority lift."  
-> BECAUSE performance still decides, but the user should not accidentally turn one exercise into the whole workout.

Risk:

High-tolerance or overmotivated users can do excessive volume.

Option A:

No cap. Let drop-off decide everything.

Option B:

Soft caps by role and block.

Implemented direction:

Soft caps first. Hard caps only remain a future option for deload, peak, or high-fatigue states.

### 4. Min / Target / Max Sets Per Exercise Role

Current behaviour:

Role/block productive set targets are implemented as guidance.

Examples:

- Hypertrophy primary compound: minimum 3, target 4-6, soft cap 8.
- Hypertrophy secondary compound: minimum 3, target 3-5, soft cap 7.
- Hypertrophy isolation/accessory: minimum 2, target 3-5, soft cap 6.
- Hypertrophy small-muscle isolation: minimum 2, target 3-6, soft cap 8.
- Powerbuilding primary compound: minimum 3, target 3-5, soft cap 6.
- Strength primary compound: minimum 2, target 3-5, soft cap 6.
- Power movement: minimum 3, target 4-8 low-rep quality sets, soft cap 10.
- Peak/taper primary: minimum 1, target 1-3, soft cap 4.

These targets are not automatic shutdowns.

Risk:

Users may still ignore soft-cap guidance and continue too long.

Option A:

Keep all exercises open until drop-off.

Option B:

Add role-based guidance such as "2-4 productive sets" for primary compounds and "2-5" for isolation.

Implemented direction:

Role-based target ranges are guidance, not hard stops. Drop-off/shutdown still remains the hard tactical stop.

### 5. Decreasing Load Rules

Current behaviour:

One bad session does not reduce load. Repeated objective decline can recommend a lower load with an explanation.

Risk:

The app may keep suggesting a load that is too heavy after repeated poor sessions.

Option A:

Keep decrease-load advice as coaching text only.

Option B:

Let repeated objective failures reduce next target load.

Recommended choice:

Current agreed direction: reduce only after repeated objective evidence. Avoid flip-flopping after one bad day. Explain the reason calmly and allow user override.

### 6. Automatic vs Suggested Block Changes

Current behaviour:

Recommendations only.

Risk:

Users may ignore strategic advice or be unsure what to do.

Option A:

Never auto-change blocks.

Option B:

Auto-change after readiness thresholds.

Recommended choice:

Recommend and ask for confirmation. Do not auto-change training strategy without user approval.

### 7. Recovery Window And Deload Rules

Current behaviour:

Annual roadmaps include planned Recovery Windows. Reactive deloads are still recommended from fatigue/readiness signals, not forced by one bad session.

Risk:

Some users may train through obvious fatigue.

Option A:

Keep planned Recovery Windows as adaptive opportunities and keep reactive deloads as evidence-gated recommendations.

Option B:

Force deload when multiple fatigue signals align.

Recommended choice:

Strong recommendation with friction, not force. Example: "Recovery strongly recommended. Continue anyway?"

### 8. Planned Exercise Rotation Frequency

Current behaviour:

Rotation preference exists. Full planned-mesocycle consistency is not completely wired into the active plan path.

Risk:

Generated workouts may feel too variable or not plan-like enough.

Option A:

Keep generation flexible every session.

Option B:

Lock main exercises for a block and rotate accessories on schedule.

Recommended choice:

Lock Tier A exercises for the block. Rotate Tier B occasionally. Rotate Tier C more freely.

### 9. Novelty vs Consistency In Generated Workouts

Current behaviour:

Generator uses structured variability but tries to preserve role structure.

Risk:

Too much novelty weakens progression tracking. Too much consistency feels stale.

Option A:

Prefer novelty.

Option B:

Prefer consistency.

Recommended choice:

Prefer consistency for primary lifts and novelty for accessories.

### 10. Advanced User Control

Current behaviour:

Advanced custom rep strategy is mostly placeholder.

Risk:

Advanced lifters may want more control than the app exposes.

Option A:

Keep app fully opinionated.

Option B:

Expose advanced controls for rep ranges, drop-off, set caps, and rotation.

Recommended choice:

Keep normal settings simple. Add an Advanced Training Controls section later.

## Part 15: Visual Flowcharts

### 1. User Opens App

```text
Open app
  -> Is there an active workout?
       Yes -> Show Continue Workout
          -> because unfinished work takes priority
       No -> Is there an active plan?
          No -> Show Set Up Plan
             -> because no plan means no honest prescription
          Yes -> Is today completed?
             Yes -> Show completed state + next session
             No -> Is today rest?
                Yes -> Show Rest Day + next workout
                No -> Show today's workout + Start button
```

### 2. Workout Selection

```text
Need today's workout
  -> Read active plan
  -> Read days per week and split
  -> Find today's split item
  -> If item is Rest
       show rest state
  -> If item is workout
       map label to workout type
       generate or load planned session
```

### 3. Exercise Selection

```text
Need exercises
  -> Identify workout type
  -> Identify current block
  -> Load template for workout type + block
  -> For each template slot:
       filter by equipment
       filter by block suitability
       filter by experience
       match role
       match muscles
       match movement/family
       penalize redundancy
       consider recent use/stalls/fatigue
       choose best candidate
  -> Store planned slot settings
```

### 4. Load Selection

```text
Need starting load
  -> Exact exercise history?
       Yes -> use previous next recommended load
          -> because exact history is the strongest signal
       No -> bodyweight exercise?
          Yes -> use bodyweight / 0 external load
          No -> enough same-family history?
             Yes -> estimate with estimated1RM formula
                -> apply conservative similarity multiplier
                -> show as estimate, not fact
             No -> leave load blank
                -> user warms up and chooses load
```

### 5. Set Evaluation

```text
User logs set
  -> Warm-up?
       Yes -> store set only
          -> exclude from progression/drop-off/volume
       No -> work set
          -> update best set
          -> calculate minimum allowed reps
          -> count acceptable sets
          -> latest below minimum?
             Yes -> shutdown exercise
             No -> continue
          -> start rest timer
```

### 6. Progression Recommendation

```text
After work sets
  -> Shutdown occurred?
       Yes -> no load increase
          -> stop exercise
       No -> Best set reached top of range?
          No -> keep load
             -> target more reps next time
          Yes -> Enough acceptable work sets?
             No -> keep load
             Yes -> progression earned
                -> calculate productive-load average
                -> round up to valid load jump
                -> recommend next-session starting load
```

### 6A. In-Session Load Escalation

```text
During active exercise
  -> Latest work set at top of range or higher?
       No -> no in-session increase suggestion
       Yes -> 3 productive top-range sets at same load?
          No -> keep logging
          Yes -> suggest next set increase
             -> user accepts?
                Yes -> update next set load
                No -> keep current load
             -> if higher load also reaches top range
                -> suggest another increase
```

### 7. Strategic Coaching Recommendation

```text
After completed workouts
  -> Summarize history
  -> Calculate progression rate
  -> Calculate quality set trend
  -> Calculate fatigue trend
  -> Calculate volume tolerance
  -> Calculate readiness
  -> Planning mode?
       Guided Annual -> recommend continue/deload/advance next block
       Single Block -> recommend continue/deload/repeat block
       Event Plan -> recommend continue/deload/move to event phase
       Custom -> recommend next custom block when ready
```

## Current Agreed Decisions

### Adaptive Starting Load

- Exact exercise history comes first.
- Same-family estimates come second, but only when evidence is strong enough.
- Unknown loads stay blank with guided warm-up/discovery.
- Same-family estimates use work sets only.
- Warm-ups are excluded from estimation.
- Abandoned and zero-set sessions are excluded.
- Estimates use `estimated1RM = load × (1 + reps / 30)`.
- Estimates convert back using `targetLoad = estimated1RM / (1 + targetReps / 30)`.
- Similarity multipliers stay conservative.
- Estimated loads are presented as estimates, not facts.
- Exact-history and same-family loads round to the user's practical equipment increment.

### Equipment-Aware Load Jumps

- The app no longer assumes one global 2.5kg jump.
- Barbell, smith, and plate-loaded style work use the user's available plate jump: 1kg, 2.5kg, or 5kg.
- Dumbbells use the user's dumbbell rack jump: 1kg, 2kg, 2.5kg, or 5kg.
- Cables use the user's cable-stack jump: 1kg, 2.5kg, or 5kg.
- Machines use the user's machine-stack jump: 1kg, 2.5kg, or 5kg.
- Bodyweight exercises stay at 0 unless external loading is enabled.
- Recommendations are rounded to available loads, not abstract numbers.
- Recommendations round upward to the next valid load.
- Exercise-specific overrides beat the user's equipment category setting.
- Normal settings expose simple practical choices, not machine-by-machine configuration.

### In-Session Load Escalation

- If the user hits the top of the rep range or higher for 3 productive work sets at the same load, the app suggests a next-set increase.
- The user can accept or ignore.
- If accepted and the user keeps hitting the top of the range, the app can continue suggesting increases.
- The suggestion never overrides drop-off, shutdown, or the user's choice.
- The suggested jump uses the exercise's resolved equipment-aware increment.

### Next-Session Starting Load

- Productive work-set loads are collected.
- Warm-ups are excluded.
- Below-threshold sets are excluded.
- The app averages productive loads.
- The app rounds up to the nearest valid equipment-aware load jump.
- That rounded value becomes the next-session starting recommendation.

### Decrease Load

- One bad session does not reduce load.
- Repeated objective decline can recommend a lower load.
- The app should avoid increase/decrease flip-flopping.
- Reduction is explained as evidence-based load management.
- Reduced-load recommendations round down to the resolved equipment-aware increment.

### Productive Set Targets

- Productive set targets are now role/block guidance, not forced set prescriptions.
- Warm-ups do not count.
- Below-threshold sets do not count.
- Soft caps show calm coaching copy instead of stopping the exercise.
- Drop-off/shutdown remains the tactical hard stop.

Examples:

- Hypertrophy primary compound: target 4-6 productive sets, soft cap 8.
- Hypertrophy isolation/accessory: target 3-5 productive sets, soft cap 6.
- Powerbuilding primary compound: target 3-5 productive sets, soft cap 6.
- Strength primary compound: target 3-5 productive sets, soft cap 6.
- Power movement: target 4-8 low-rep quality sets, soft cap 10.

### Volume Landmarks

- Broad starting landmarks now exist by muscle group.
- Large muscles start around MEV 6-8, MAV 10-16, MRV 18-22 direct productive sets per week.
- Smaller muscles start around MEV 4-6, MAV 8-14, MRV 16-20 direct productive sets per week.
- Warm-ups are excluded.
- Only productive work sets count.
- Recommendations are shown without raw MEV/MAV/MRV jargon on the main surface.

IF volume is low, fatigue is low, and progress is flat  
-> suggest adding a small amount of direct work.

IF volume is high and fatigue/shutdowns are rising  
-> suggest reducing volume or deloading.

Limitation:

These are broad starting estimates. They are not fully personalised landmarks yet.

### Exercise Rotation

- Progressing exercises stay.
- Stalled exercises can rotate.
- Stall means no progression for 4 exposures, repeated early shutdowns, or best-set regression across 3 exposures.
- Tier A exercises stay stable while progressing.
- Tier B exercises can rotate at block change or stall.
- Tier C exercises can rotate more freely.
- The app should not rotate exercises randomly for novelty.
- Rotation recommendations should explain the reason and prefer the same family/role where possible.

## Still Undecided

- Whether any hard set cap should exist outside deload, peak, or high-fatigue states.
- Whether soft-cap wording should become stricter for advanced fatigue states.
- How strongly the app should enforce deload recommendations.
- Whether strategic block changes should remain recommendation-only forever.
- How much advanced user control should be exposed without making Settings feel technical.
- How body-part splits should map into workout generation.
- How much same-family load estimation should expand to bodyweight, unilateral, or unusual exercise families.
- How quickly broad volume landmarks should personalize from longer history.
- Whether users need per-machine custom increments beyond the simple barbell/dumbbell/cable/machine profile.

## Future Improvements

- Add clearer guided ramp-up prompts for blank-load exercises.
- Add bodyweight and experience-based estimates only if they can be conservative and clearly labelled.
- Personalize volume landmarks from longer history.
- Improve long-term planned exercise locking across a whole block.
- Add stronger fatigue-aware session trimming.
- Add user-facing override history so the app learns when users reject load suggestions.
- Add custom increments for specific machines, cable stations, and dumbbell racks if real gym QA shows the simple profile is not enough.
- Sync more strategic plan state to cloud.

## Current Agreed Session And Week State Decisions

### Planned Session Completion

IF the user completes a planned session  
-> mark that planned slot complete for the current week  
-> because completing one workout should move the recommendation to the next planned workout, not silently advance the programme week.

IF the user completes all planned sessions for the week  
-> show Complete Week on Home  
-> because the user should decide when the training week is closed.

IF the user taps Complete Week and confirms  
-> advance the active block from Week N to Week N+1 and start the next week at session 1  
-> because week advancement is a programme decision, not an automatic side effect of logging the last workout.

### Extra Session Behaviour

IF the user completes an Extra session  
-> save it to history and exercise history  
-> because it is real training and should affect progression, fatigue, deterioration, and progress analysis.

IF the app checks planned weekly completion  
-> ignore Extra/ad-hoc sessions  
-> because extra work should not complete preset plan sessions or unlock Complete Week.

### Complete Workout vs Cancel Workout

IF the user taps Complete Workout  
-> finish and save the workout  
-> because the session should become history and feed progress.

IF the user taps Cancel Workout  
-> confirm discard, remove the active workout, and do not create history  
-> because an accidentally started workout should not pollute plan completion or progress data.

IF logged sets exist when cancelling  
-> warn that the logged sets will be discarded  
-> because this is destructive.

### Current-Week Edit Policy

IF a completed workout is from the current week  
-> allow editing load, reps, and warm-up/work status, and allow set deletion with confirmation  
-> because gym mistakes are common and should be fixable while the week is still being managed.

IF a completed workout is outside the current week  
-> show it read-only for now  
-> because older history editing has wider implications for long-term progress and coaching evidence.

### Phase 1 Load Reduction Rule

IF the user has one poor workout  
-> hold load or show caution  
-> BECAUSE one bad day is not enough evidence.

IF the user shows repeated objective decline  
-> recommend a lower load  
-> BECAUSE the current load is no longer buying productive work.

Severity:

- Mild repeated decline: reduce around 5%.
- Moderate repeated decline: reduce around 7.5%.
- Severe decline or high fatigue: reduce around 10%.

Rounding:

- Increases round up to the next practical load.
- Reductions round down to a practical lower load.
- Reductions must be at least one available jump below the current load.
- If the next lower jump would be silly, the app holds and asks for more evidence.

Example:

IF current load is 102.5kg and the machine jumps by 5kg  
-> a mild reduction recommends 95kg, not 100kg  
-> BECAUSE reductions should actually reduce the training stress.

### Phase 1 Deload Profiles

IF repeated fatigue and performance signals align  
-> recommend a deload profile  
-> BECAUSE fatigue is now limiting useful output.

IF evidence is thin  
-> do not recommend a deload  
-> BECAUSE deloads need repeated completed-session evidence.

IF the user accepts a deload  
-> the active deload session shows lower set targets and lighter intensity prescriptions  
-> BECAUSE a deload should change today's training instructions, not just rename the block.

Mild fatigue:

- 1 week.
- Productive sets down 30-40%.
- Load/intensity down 5-10% or kept comfortable.
- Remove low-priority extras.
- No aggressive progression prompts.

Clear fatigue:

- 1 week.
- Productive sets down 40-60%.
- Load/intensity down 10-15%.
- Lower soft caps.
- No escalation prompts.
- Stable, low-risk exercise selection.

Severe fatigue:

- 1 week.
- Productive sets down 50-70%.
- Load/intensity down 15-25%.
- Remove high-fatigue extras.
- Conservative prescriptions.
- Movement quality first.

### Phase 2 Extra-Session Warning

IF extra sessions are occasional  
-> do not warn  
-> BECAUSE one extra workout is not enough evidence that workload is a problem.

IF repeated extra sessions create a meaningful share of recent workload  
-> show a coach note: “You’re adding a lot of extra work. Useful if you recover. Expensive if you don’t.”  
-> BECAUSE extra sessions affect fatigue and progress even though they do not complete plan sessions.

IF an extra session is completed  
-> keep it out of planned-session completion  
-> BECAUSE the user should not accidentally advance the programme by doing extra work.

IF an extra session includes real work sets  
-> include it in exercise history, progress, and fatigue analysis  
-> BECAUSE the body does not care whether the session was planned or extra.

### Phase 2 Load Increment History

IF a workout is completed  
-> store the load increment, unit, equipment when available, and increment source in history  
-> BECAUSE future reduction/progression rounding should use the load jumps the user actually had available.

IF older history lacks increment metadata  
-> fall back to unit defaults  
-> BECAUSE old completed workouts must remain usable.

### Phase 1 Success Model

Adaptive Strength Coach now defines success differently by goal.

Build Strength:

- Primary: Tier A compound progression and estimated strength trend.
- Priority: protect main lifts and reduce fatigue before abandoning load.

Build Muscle:

- Primary: productive muscle-building work and recoverable weekly volume.
- Priority: adjust volume first and rotate stale accessories.

Build Muscle & Strength:

- Primary: compound progression plus productive volume.
- Priority: balance load progression and muscle-building work.

Athletic Performance:

- Primary: quality strength/power output and readiness.
- Priority: quality over grind and earlier fatigue management.

Powerlifting Meet:

- Primary: squat, bench, and deadlift readiness.
- Priority: meet countdown, specificity, low novelty late, direct low-fatigue bracing, and fatigue reduction near the meet.

Get Leaner:

- Primary: maintain strength where possible, preserve muscle, support body-composition progress, and keep consistency high.
- Priority: sustainable volume, recovery capacity, low-fatigue cardio, and avoiding unnecessary fatigue.

IF the same history is interpreted under different goals  
-> the recommendation priority can change  
-> BECAUSE “success” is not the same for a bodybuilder, strength-focused lifter, leaner-body-composition user, athletic user, and powerlifting meet prep user.

## Final Section

### What Adaptive Strength Coach Currently Does Well

- It separates planning from execution.
- It avoids RPE and RIR.
- It uses actual logged reps to decide best set, drop-off, shutdown, and progression.
- It separates warm-up sets from work sets.
- It prevents fake starting loads when no history exists.
- It estimates from same-family history when the evidence is reliable enough.
- It labels same-family loads as estimates instead of facts.
- It rounds load recommendations to equipment-aware jumps instead of assuming everything moves by 2.5kg.
- It can suggest optional in-session load increases after repeated top-range sets.
- It calculates next-session starting load from average productive load rounded up.
- It records actual load per set.
- It gives role/block productive set targets without forcing rigid volume.
- It warns at soft caps without changing drop-off/shutdown logic.
- It tracks broad starting volume landmarks by muscle group.
- It can recommend volume increases, volume reductions, or deloads from output and fatigue.
- It uses mild, clear, and severe deload profiles instead of vague deload advice.
- It interprets strategic recommendations through the user’s selected training goal.
- It uses exercise roles, tiers, families, equipment, and block type for generated workouts.
- It keeps progressing Tier A exercises stable and recommends rotation only when evidence says the lift is stalled.
- It keeps exercise shutdown calm rather than treating it as failure.
- It filters bad Progress data such as zero-set sessions.
- It makes strategic recommendations instead of forcing automatic block changes.

### What Adaptive Strength Coach Does Not Yet Decide Well

- It does not fully centralize active plan, training year, block, week, and day.
- It supports dedicated Chest, Back, and Shoulders body-part generator contexts.
- It does not yet personalize volume landmarks deeply from long-term history.
- It does not have normal-training hard set caps.
- It keeps planned exercise selections stable inside the configured rotation window.
- It does not truly measure power output or bar speed.
- It does not yet expose advanced training controls cleanly.
- It does not fully sync strategic plan state to cloud.
- It does not yet support per-machine custom stack increments.

### The Top 10 Product Decisions Aaron Needs To Make Next

1. Should Adaptive Strength Coach ever use hard caps, or should soft caps plus drop-off remain enough?
2. Should soft-cap prompts become stronger when fatigue is high?
3. How strict should repeated-decline load reduction be before lowering the next target?
4. Should blank-load ramp-up guidance become a step-by-step flow?
5. Should same-family load estimation expand to bodyweight, unilateral, and unusual exercise families?
6. Should block changes be recommended only, or should the app ever auto-change them?
7. How strong should deload enforcement be when multiple fatigue signals align?
8. How fast should broad volume landmarks personalize from long-term history?
9. How stable should exercises remain across a block when the user prefers novelty?
10. Should Adaptive Strength Coach add per-machine custom increments, or keep the simple equipment profile for now?

## Settings Behaviour Audit

The current product rule is: no fake controls.

Current agreed decisions:

- Goal affects block sequence, success model, recommendation priority, generated workout emphasis, and Progress interpretation.
- Programme type affects roadmap structure: 12-month plans now create goal-specific 48-52 week macrocycles, single-block plans do not pretend more blocks exist and expose a next-block choice at the endpoint, and event plans use the event date to size the sequence and countdown phase.
- Experience affects generated training: beginners get simpler/lower-volume sessions and advanced exercises are excluded; advanced users can receive more work/complexity where the template supports it.
- Training days per week equals planned workouts per week.
- Equipment access filters generated planned and extra sessions.
- Units and weight jumps affect display, manual controls, generated slot increments, same-family estimates, escalation, reductions, and next-session recommendations.
- Rep strategy is currently Recommended in normal Settings. Advanced custom rep controls are marked future instead of being a fake toggle.
- Low Back Capacity Focus is live. Hips, Ankles, Shoulders, and Neck are future-labelled and cannot be completed as real tracks yet.

IF a normal-user setting changes nothing meaningful  
-> hide it or mark it Coming later  
-> BECAUSE product trust dies fast when controls do not control anything.

Full audit: `docs/settings-behaviour-audit.md`.

## Goal-Aware Progression Throttle

Current agreed decision:

Progression is earned by performance, but load increases are filtered through a readiness throttle.

IF performance earns progression and fatigue/cost is low  
-> Push  
-> BECAUSE the user earned more weight and the recent trend supports it.

IF performance earns progression but fatigue, volume cost, goal priority, experience level, or rep-range context argues against a jump  
-> Hold  
-> BECAUSE “technically earned” is not always the same as “smart to push today.”

IF repeated decline appears  
-> Pull Back  
-> BECAUSE objective regression overrides one isolated good signal.

Decision inputs:

- exercise role and family
- user goal
- experience level
- active block
- target rep range
- recent exercise performance
- shutdown/drop-off rate
- quality/productive set trend
- volume/fatigue signal
- deload state
- extra-session state

Goal priorities:

- Build Strength protects main compounds.
- Build Muscle protects recoverable productive volume.
- Build Muscle & Strength balances load and volume.
- Athletic Performance protects output quality.
- Powerlifting Meet protects squat, bench, and deadlift readiness.
- Get Leaner preserves strength and muscle while keeping fatigue manageable.

This throttle influences in-session escalation, Workout Review next-session load recommendations, and Progress copy where relevant. It does not change logged sets, shutdown/drop-off, weekly completion, deload profiles, or session persistence.

## Personalised Muscle-Volume Learning

Current agreed decision:

Load progression is exercise-specific. Volume progression is muscle-specific.

The app now has a pure personalised volume layer that returns a muscle-level status, confidence, productive sets/week, trend, evidence, and ladder action.

Possible statuses:

- insufficient_data
- underdosed
- productive
- high_cost
- overreaching

Possible ladder actions:

- bias_high
- raise_range
- add_exercise
- hold
- bias_low
- lower_range
- remove_or_swap_exercise
- deload_caution
- insufficient_data

Evidence gates:

- at least 3 observed weeks
- at least 2 exposures for that muscle
- enough productive work to form a trend
- productive work sets only
- warm-ups, incomplete rows, cancelled workouts, and below-threshold work are excluded

Volume adjustment ladder:

IF volume needs to rise  
-> bias high first, then raise range, then add a low-fatigue accessory  
-> BECAUSE gradual changes protect plan clarity.

IF volume needs to fall  
-> bias low first, then lower accessory/isolation range, then remove/swap low-priority accessories  
-> BECAUSE the app should reduce cost before disrupting main lifts.

Soft cap:

The soft cap remains a safety ceiling. It is not a normal programming target. Repeated soft-cap success with low fatigue can justify a small future volume adjustment; repeated soft-cap work with rising fatigue triggers high-cost logic.

Goal behaviour:

- Build Muscle can add useful volume sooner.
- Build Strength protects Tier A compounds and trims accessory cost first.
- Build Muscle & Strength balances both.
- Athletic Performance avoids junk volume and reduces sooner under fatigue.
- Powerlifting Meet avoids late novelty and extra fatigue.
- Powerlifting Meet uses event countdown phases so specificity, taper, event week, and post-event reset behave differently.
- Get Leaner uses conservative volume nudges and recovery-cardio support rather than aggressive hypertrophy volume chasing.

Surfacing:

- Progress can show the personalised volume recommendation behind the existing Volume note.
- Home only shows higher-priority muscle-volume warnings so the daily screen stays quiet.
- Copy avoids MEV/MAV/MRV jargon.

## Approved Volume Adjustments

Current agreed decision:

Personalised volume recommendations do not silently mutate training. They require approval.

Actions:

- Apply change
- Ignore for now

Persistence:

Approved or ignored volume actions are stored on the active plan recommendation state with:

- muscle
- ladder action
- confidence
- evidence summary
- applied/ignored status
- date
- active week
- block id
- affected exercise ids where available

Application rules:

- bias_high and bias_low add coaching intent only.
- raise_range and lower_range adjust the future recommended set range, not completed history and not the active workout.
- raise_range example: 3-5 becomes 4-6 while the required floor stays stable unless a later policy explicitly raises it.
- lower_range example: 3-5 becomes 2-4 and may lower the required floor when the recommended minimum drops.
- add_exercise adds one low-fatigue accessory/isolation where equipment allows.
- remove_or_swap_exercise removes a low-priority accessory and protects Tier A/main compounds.
- deload_caution does not add volume and should stay with existing deload/hold logic.

Hybrid set prescription:

- requiredSets = minimum work sets needed for exercise completion.
- recommendedRange = normal productive target zone.
- softCap = guardrail ceiling, not the goal.
- requiredWorkSets remains a legacy compatibility field and maps into requiredSets.

Safety constraints:

- No more than one volume increase per muscle per week.
- No more than one structural add/remove per muscle per block unless confidence is high.
- No added volume during deload.
- No added volume during peak/taper/event week.
- Specificity phases restrict new exercise novelty.
- Completed workouts and active workouts are untouched.
- Previous applied actions feed future personalised-volume decisions.

## Event Countdown And Taper

Powerlifting Meet is date-aware.

Inputs:

- event type
- target date / weeks until event
- current block
- fatigue/readiness/progress signals when available
- goal and experience level

Outputs:

- event phase: base, build, specificity, taper, event week, or post-event
- volume guidance
- intensity guidance
- novelty allowance
- progression aggressiveness
- readiness note

Rules:

- 8+ weeks out: normal block flow; build capacity, strength, or power as needed.
- 4-8 weeks out: specificity increases and random exercise novelty is reduced.
- 2-3 weeks out: volume comes down, quality/intensity stays appropriate to the event, and new volume is suppressed.
- Final week: readiness/taper; low fatigue, no novelty, no aggressive progression chasing.
- Post-event: reset/review recommendation.

Event type behaviour:

- Powerlifting/strength event favours peak/specificity and event-relevant lifts.
- Sport/athletic event favours quality, readiness, and low junk volume.
- Photoshoot/holiday/body-composition event favours fatigue and volume management.
- Generic event stays conservative and readiness-first.

Boundary:

This is a broad countdown/taper engine, not a sport-specific peaking oracle. It should never claim exact readiness, velocity, injury prevention, or guaranteed event outcomes.

## Training Gap / Re-Entry Prescriptions

Decision rule:

IF time away is 0-7 days  
-> no load decay and no caution copy  
-> BECAUSE normal training spacing should not be treated as a setback.

IF time away is 8-14 days  
-> keep the load and show “First session back? Keep it clean before chasing numbers.”  
-> BECAUSE short breaks need restraint, not automatic reductions.

IF time away is 15-21 days  
-> reduce known/estimated loads around 2.5-5% and round down to the valid increment  
-> BECAUSE re-entry should be conservative without overcorrecting.

IF time away is 22-35 days  
-> reduce known/estimated loads around 5-10%, round down, and make in-session escalation less aggressive  
-> BECAUSE old performance is still evidence, but the first session back should not chase the old top number.

IF time away is 36+ days  
-> recommend a re-entry week, reduce known/estimated loads around 10-15%, suppress aggressive escalation, and avoid add-volume pressure  
-> BECAUSE the user should build back in, not prove a point.

Scope:

IF the whole workout history has a gap  
-> apply the adjustment globally.

IF only one exercise/family has a gap  
-> apply the adjustment only to that exercise/family.

Load-source behaviour:

- exact history can be adjusted down
- same-family estimates can be adjusted down conservatively
- unknown loads stay percentage-based
- completed history and logged loads are never mutated

Production paths:

- starting load resolver
- planned/generated workout load prescriptions
- active workout Add Exercise starting load
- in-session progression throttle
- workout load note copy

## Block Training Lanes

Product rule:
Blocks are biased blends. They keep useful elements from nearby blocks, but each exercise slot has a lane that tells autoregulation what kind of work it is.

Lane metadata:

- hypertrophy
- hypertrophy_strength
- strength
- strength_support
- power
- peak
- maintenance
- recovery

Block composition:

- Hypertrophy: high hypertrophy, moderate strength support, low power skill
- Powerbuilding: moderate/high hypertrophy plus moderate/high strength
- Strength: high strength, moderate hypertrophy support, low/moderate power
- Power: high power, moderate strength, low/moderate hypertrophy maintenance
- Peak: high specificity/peak, moderate strength, low maintenance volume
- Deload: high recovery, maintenance only

Decision impact:

- Rep ranges and set ceilings are lane-aware.
- Power, peak, maintenance, and recovery lanes are more conservative under fatigue.
- Personalised volume increases target hypertrophy/accessory lanes first.
- Peak and deload suppress add-volume actions.
- Power blocks allow only the gentlest volume increase action.
- Heavy exposure budgets vary by block, goal, and experience.

Block transition loads:

- Exact history is still preferred, but it is recalibrated when the target rep range changes materially.
- Recent work-set load and reps estimate a suitable target load for the new lane.
- The result is buffered conservatively and rounded down to the available increment.
- Unknown loads remain percentage-based.
- Warm-ups never drive transition load conversion.

## Structured Primary Lift Variations

Primary lift families:

- Bench Press
- Standing Overhead Press
- Squat
- Deadlift

Canonical anchors:

- Bench Press uses Bench Press as the canonical anchor.
- Standing Overhead Press uses Military Press / Standing Barbell Overhead Press as the canonical anchor.
- Squat uses Barbell Back Squat as the canonical anchor.
- Deadlift uses Deadlift as the canonical anchor. Romanian Deadlift is a support variation, not the canonical deadlift.

Decision:

IF Bench Press, Standing Overhead Press, Squat, or Deadlift is progressing  
-> keep the lift stable  
-> because specificity matters for primary strength lifts.

IF a canonical primary lift stalls across objective evidence  
-> choose from its structured variation family before generic same-family rotation  
-> because Floor Press, Box Squat, Rack Pull, and similar variations are different from random exercise swaps.

IF weak-point evidence is not available  
-> choose a broadly useful close variation and avoid weak-point claims  
-> because the app should not say “your lockout is weak” unless the data supports it.

IF a structured variation is accepted  
-> store the canonical family, original lift, chosen variation, reason, block/week, exposure count, outcome, and cooldown  
-> because the app should avoid random cycling and remember what was tried.

IF a structured variation is rejected  
-> keep the canonical lift and suppress the immediate repeat prompt  
-> because user approval controls future plan changes.

IF strength or peak specificity becomes the priority after a variation run  
-> recommend returning to the canonical lift  
-> because variations are temporary tools, not the new identity of the programme.

Fallback:

- If the lift is not a canonical primary family, use generic rotation.
- If equipment or experience blocks every structured option, use generic rotation.
- Manual Add/Swap search remains available.

## Exercise Library And Taxonomy Expansion

Decision:

IF a requested movement already has a near-equivalent canonical entry  
-> add alias/search tags and keep one exercise record  
-> because duplicate records fracture history, same-family estimates, Add Exercise, and Swap behaviour.

IF a requested movement is a true strength variation  
-> add it as a classified variation with family, role, tier, equipment, block suitability, experience suitability, fatigue cost, and primary-lift variation metadata where relevant  
-> because Bench/Squat/Deadlift/OHP variation logic needs structured options before generic swaps.

IF a requested movement is power or Olympic-style work  
-> classify it as power-lane work and restrict high-skill/high-impact options for beginners  
-> because these are quality/speed tools, not hypertrophy accessories.

IF a requested movement is a hypertrophy accessory  
-> classify it so the volume ladder can choose low-fatigue add-volume options first  
-> because personalised volume should add recoverable work before high-cost compounds.

Equipment decision:

- No new normal-user equipment controls were added in this pass.
- Bands use `bands`.
- Chains, specialty bars, boards, blocks, medicine balls, slam balls, trap bars, and similar items map conservatively through `other` plus the base equipment when applicable.
- This avoids fake precision until the Settings equipment model supports those categories cleanly.

## Rep Range Occupancy

Decision:

IF an exercise has enough completed productive work  
-> learn where the user naturally lives inside that exercise's target rep range  
-> because progression should use observed behaviour, not user-selected training-style labels.

Output:

- `heavy_biased`: the user usually performs productive sets near the bottom of the range.
- `balanced`: the user usually performs productive sets near the middle.
- `volume_biased`: the user usually performs productive sets near the top.
- `insufficient_data`: not enough completed productive work yet.

Evidence gate:

- At least 2 exposures.
- At least 6 productive work sets.
- Warm-ups, cancelled workouts, junk sets, and incomplete rows are excluded.

Progression decision:

IF heavy-end occupancy is stable or rising, fatigue is low, and the goal supports load progression  
-> the throttle can choose Push even if the absolute top of the range was not hit  
-> because a strength-biased user should not be trapped at 8 reps in an 8-12 range forever.

IF fatigue is high, deload/re-entry/peak constraints apply, or performance is falling  
-> Hold or Pull Back still wins  
-> because occupancy is a supporting signal, not an override.

Goal interpretation:

- Build Strength accepts low-range behaviour sooner for primary compounds.
- Build Muscle still values top-of-range work, but stable low-range progress can matter.
- Build Muscle & Strength balances both.
- Athletic Performance avoids forcing extra reps when quality matters.
- Powerlifting Meet lets specificity/readiness override occupancy.
- Get Leaner keeps the interpretation conservative.

Product rule:

- Do not expose the terms `heavy_biased`, `balanced`, or `volume_biased` to normal users.
- Do not introduce RPE, RIR, effort scores, or style settings.
- Evidence copy should stay plain: “Bench work is trending well even though recent reps sit near the heavy end of the range.”

## Recovery & Capacity

Decision:

IF Recovery & Cardio is `Off`  
-> suppress user-facing cardio recommendations and session suggestions  
-> but keep recovery, fatigue, volume, and capacity assumptions active  
-> because a preference should hide prompts, not blind the training system.

IF Recovery & Cardio is `Minimal`  
-> surface cardio only for clear workload/fatigue/goal evidence  
-> because some users want fewer nudges.

IF Recovery & Cardio is `Recommended`  
-> allow normal recovery/capacity recommendations  
-> because aerobic capacity can support recovery, fatigue management, volume tolerance, and general health.

Lane decision:

- Recovery Cardio is chosen when workload/fatigue is the limiter or strength/bodybuilding goals need low-cost support.
- Capacity Cardio is chosen when work capacity is the useful limiter and fatigue is not already too high.
- Performance Conditioning is chosen mainly for Athletic Performance or sport/event contexts.

Dose decision:

IF no recent cardio is logged  
-> start low, normally 1-2 short easy sessions  
-> because zero to five sessions is not coaching, it is chaos with a calendar.

IF current dose is tolerated  
-> add duration before frequency  
-> because a small duration increase is easier to recover from than another weekly session.

IF systemic fatigue, deload, taper, or event week is active  
-> reduce/pause hard conditioning and prefer Recovery Cardio  
-> because the lifting plan needs lower fatigue, not extra hero work.

IF Athletic Performance or athletic event context is active  
-> allow more Capacity/Performance Conditioning when fatigue allows  
-> because conditioning is part of the performance goal.

Interference decision:

IF hard lower-body conditioning is near heavy squat/deadlift work  
-> avoid or swap to easy Recovery Cardio  
-> because interference risk is high.

IF the user is logging cardio and the selected modality/intensity conflicts with lifting context  
-> show a short caution and suggested lower-fatigue alternative  
-> because the correction should happen before the session is saved.

IF hard cardio accumulates repeatedly  
-> count it as systemic workload evidence  
-> because it is real training stress.

IF easy Recovery Cardio is logged  
-> keep it low-cost and do not count it as lifting progression evidence.

Hard product boundaries:

- Do not prescribe heart-rate zones or calorie targets.
- Do not make medical claims.
- Do not let Recovery/Capacity Cardio complete planned lifting sessions.
- Do not let cardio preference alter tactical progression throttle, deload execution, weekly completion, or workout logging.
- Do not let cardio logs create lifting exercise summaries or next-load recommendations.

## Template Architecture Decisions

IF the block is Hypertrophy or Powerbuilding  
-> use the existing muscle-coverage templates with controlled accessory rotation  
-> because those blocks need enough productive work and repeatable progression targets.

IF the block is Strength  
-> bias heavy anchor slots toward canonical Bench Press, Barbell Back Squat, Deadlift, and Military Press/standing overhead press where the session context calls for them  
-> because strength blocks should be built around skill practice and force production on the main lifts, not generic heavy compounds.

IF the block is Power  
-> require power slots to draw from actual power-role exercises such as speed lifts, jumps, throws, or Olympic-derived pulls where equipment and experience allow  
-> because power quality is protected by exercise choice before progression logic ever runs.

IF the block is Peak  
-> use dedicated low-volume, high-specificity templates with minimal support work  
-> because peak work is about expressing strength and lowering fatigue, not accumulating volume.

IF the goal is Powerlifting Meet and the block is Peak  
-> prefer canonical/specific squat, bench, deadlift, and standing overhead press exposures for matching peak slots  
-> because late meet prep should avoid novelty and keep readiness tied to the lifts that decide the result.

IF the goal is Powerlifting Meet and the session is Peak Full Body  
-> include direct low-volume bracing support  
-> because squat/deadlift readiness needs trunk skill retention without aggressive ab fatigue.

IF the block is Recovery Window  
-> use dedicated reduced-complexity templates with easy patterns and low-fatigue support  
-> because a recovery window should reduce stress, novelty, and decision cost by design while still adapting to readiness.

IF a machine lower-body exercise fills a primary lower-body slot  
-> keep the primary slot prescription  
-> because slot role owns the dose before equipment category.

IF beginner Power Lower is trimmed  
-> preserve safe low-skill trunk/bracing before optional support work  
-> because beginner power sessions should stay short without losing bracing practice.

Known limitation:

- Recovery Window templates infer familiarity from scoring/history rather than a dedicated "familiar movement" flag.
- Late Peak novelty control now prefers canonical lifts for Powerlifting Meet peak slots, but a future dedicated "familiar movement" flag would make that even more personal.
