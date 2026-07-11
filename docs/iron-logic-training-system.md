# Adaptive Strength Coach Training System

Date: 2026-06-06

Audience: product owner, coach, and app decision maker.

This document explains the current Adaptive Strength Coach training system in plain English.

Core rule:

**Adaptive Strength Coach autoregulates from actual logged performance, not RPE or RIR.**

The app can use evidence-informed ranges for load, reps, sets, volume, fatigue, deloads, rotation, and block progression. But when it is time to make a tactical decision inside a workout, logged reps and loads are the source of truth.

Format:

**IF this happens -> THEN the app does this -> BECAUSE the training reason is this.**

## Evidence Position

Adaptive Strength Coach is aligned with the broad direction of resistance-training evidence:

- Heavier loading tends to be more specific for maximal strength, while a wide load range can build hypertrophy when effort and volume are sufficient.
- Moderate-to-higher weekly set volume tends to support hypertrophy up to a point, but the useful ceiling varies by person, muscle, exercise, and recovery.
- Training to failure is not required for strength or hypertrophy and can add fatigue, especially when overused.
- Power work should bias low reps, high intent, and low fatigue.
- Recovery Windows are best framed as planned opportunities for fatigue management, not magic calendar rituals.

Useful references:

- [ACSM progression models in resistance training](https://pubmed.ncbi.nlm.nih.gov/11828249/)
- [Resistance training prescription network meta-analysis](https://pubmed.ncbi.nlm.nih.gov/37414459/)
- [Resistance training load effects on hypertrophy and strength](https://pmc.ncbi.nlm.nih.gov/articles/PMC8126497/)
- [Resistance training variables umbrella review](https://pmc.ncbi.nlm.nih.gov/articles/PMC9302196/)
- [Training to failure vs non-failure meta-analysis](https://pubmed.ncbi.nlm.nih.gov/33497853/)
- [Resistance training volume review](https://pmc.ncbi.nlm.nih.gov/articles/PMC8884877/)

Important limitation:

These ranges are evidence-informed guardrails, not laws. Adaptive Strength Coach should never claim it has found the single best set, rep, or volume prescription for everyone.

## 1. How The App Chooses The Plan

IF the user completes onboarding  
-> the app creates an active training plan  
-> BECAUSE it needs goal, equipment, weekly schedule, split, experience level, and plan style before it can prescribe training honestly.

IF the user chooses the recommended 12-month plan  
-> the app creates a goal-specific macrocycle of roughly 48-52 weeks  
-> BECAUSE a year-long plan should change emphasis across the year instead of reusing one generic half-year sequence.

IF the user chooses a single-block plan  
-> the app creates only that chosen block, including Peak or Recovery Window when deliberately selected  
-> BECAUSE some users want one clear training emphasis instead of a long annual roadmap.

IF the user chooses an event/custom-date plan  
-> the app calculates the available weeks and builds a date-sized block sequence  
-> BECAUSE a powerlifting meet, holiday, photoshoot, sport season, or generic event should not all use the same runway.

IF the user has an event target date  
-> the app resolves an event countdown phase: base, build, specificity, taper, event week, or post-event  
-> BECAUSE "17 weeks out" and "event week" should not have the same tolerance for novelty, volume additions, or aggressive progression.

Current strength:

The plan structure is clear and no-plan states do not invent training.

Risk:

Custom sequence editing exists structurally for compatibility, but it is hidden from normal onboarding until a mature builder exists.

Recommended improvement:

Later, build a proper plan editor instead of exposing plan creation as the only serious control.

Implement now or later:

Later.

## 2. How The App Chooses The Block

IF a new recommended plan starts  
-> Hypertrophy is active first  
-> BECAUSE the annual sequence starts by building muscle and productive volume.

IF a single-block plan starts  
-> the chosen block is active  
-> BECAUSE single-block mode should not pretend other phases are coming.

IF an event plan starts  
-> the active block depends on event type and time available  
-> BECAUSE a short meet prep needs different sequencing than a long general muscle-building goal.

IF the event gets closer  
-> specificity rises, novelty falls, volume additions get restricted, and progression becomes more conservative  
-> BECAUSE event prep should protect readiness instead of treating the date like decoration.

IF the active block reaches the planned endpoint  
-> the app can show a block decision: move forward, choose the next one-block phase, repeat, or decide later  
-> BECAUSE block transitions should be deliberate, not automatic background magic.

Current strength:

Block sequencing and roadmap explanations are clear.

Risk:

Strategic readiness is still trend-based and simple. It should guide, not overrule common sense.

Recommended improvement:

Keep block transitions user-confirmed. Do not silently advance blocks.

Implement now or later:

Already mostly implemented; refine later with better readiness evidence.

## 3. How The App Chooses The Workout

IF an active workout exists  
-> Home shows Continue Workout  
-> BECAUSE finishing the open session is the cleanest next action.

IF no active workout exists and the user has an active plan  
-> Home recommends the next incomplete planned session for the current week  
-> BECAUSE training days per week means actual workout slots, not calendar rest slots.

IF the user taps another session in the weekly strip  
-> the app lets them start that session out of order  
-> BECAUSE real training weeks are messy and users should not be trapped by calendar order.

IF all planned sessions are complete  
-> Home shows Complete Week  
-> BECAUSE week advancement is a user-controlled decision, not something that happens just because the final workout was saved.

IF the user creates an extra session  
-> the app marks it as extra/ad-hoc and keeps the main plan session index unchanged  
-> BECAUSE extra work should count as training history without corrupting the planned week.

Current strength:

The plan session and extra session concepts are now properly separated.

Current strength:

Body-part split is user-facing and now has proper generator support:

- Chest sessions use chest-dominant pressing and pec isolation.
- Back sessions use vertical pulls, rows, lat/upper-back work, and rear-delt/trap support.
- Shoulders sessions use shoulder press patterns, lateral delts, rear delts, and trap/scapular support.
- Legs -> Legs
- Arms -> Arms
- Full Body -> Full Body

Exercise crossover is intentional:

- Face Pull can support Pull, Shoulders, Upper, or Full Body.
- Lateral Raise can support Push, Shoulders, Upper, or Full Body.
- Shoulder Press can support Push, Shoulders, Upper, or Full Body.
- Shrugs and trap work can support Pull, Shoulders, or Upper.

Recommended improvement:

Tune exact body-part split volume and exercise ordering from beta feedback.

Implement now or later:

Later.

## 4. How The App Chooses Exercises

IF a workout is planned from a programme day  
-> the app uses that day’s exercise slots  
-> BECAUSE planned workouts should stay stable unless the user changes them.

IF a session is generated  
-> the app uses a workout-type template, block emphasis, exercise roles, exercise families, equipment, experience, and history  
-> BECAUSE a workout should have a structure before it chooses individual exercises.

IF the active block is Peak  
-> the app uses dedicated Peak templates with specific primary lift exposure, close low-volume support, and minimal accessories  
-> BECAUSE peak work should keep the main lifts sharp while reducing fatigue and novelty.

IF the active block is Powerlifting Meet Peak  
-> the app strongly prefers canonical/specific squat, bench, deadlift, and standing overhead press exposures for matching peak slots  
-> BECAUSE late meet prep should reduce novelty and keep the most specific lifts sharp.

IF a Powerlifting Meet Peak Full Body session is generated  
-> the app keeps a low-volume bracing slot  
-> BECAUSE squat and deadlift readiness still need trunk support without adding meaningful fatigue.

IF the active block is Deload  
-> the app uses dedicated Deload templates with fewer slots, easy movement patterns, and low-fatigue support work  
-> BECAUSE deloads should be easier by design, not merely normal hypertrophy workouts with smaller set numbers.

IF the active block is Strength  
-> heavy anchor slots bias canonical Bench Press, Barbell Back Squat, Deadlift, and Military Press/standing overhead press where the session calls for them  
-> BECAUSE strength progression needs stable skill practice on the lifts that matter.

IF the active block is Power  
-> power slots prioritise true power-role work such as speed lifts, jumps, throws, and Olympic-derived pulls where appropriate  
-> BECAUSE power sessions should protect fast output instead of becoming bodybuilding sessions with one fast exercise bolted on.

IF a slot asks for a primary compound  
-> the app prefers Tier A primary compound exercises  
-> BECAUSE main lifts need repeat exposure and cleaner performance data.

IF a machine lower-body exercise fills a primary lower-body slot  
-> the app keeps the primary slot prescription  
-> BECAUSE the slot's training job matters more than the equipment category.

IF a beginner Power Lower session is trimmed  
-> the app preserves safe trunk/bracing before optional support work  
-> BECAUSE beginners still need low-skill bracing practice without adding complex fatigue.

IF a slot asks for isolation or accessory work  
-> the app prefers lower-fatigue, muscle-specific options  
-> BECAUSE those slots exist to add useful work without pretending every exercise is a main lift.

IF a user only has certain equipment  
-> the app filters exercises to available equipment  
-> BECAUSE a perfect exercise that the user cannot perform is useless.

IF the user is a beginner  
-> the app penalizes advanced exercises  
-> BECAUSE a session should be executable, not impressive on paper.

IF a Tier A lift is progressing  
-> the app keeps it stable  
-> BECAUSE progressing main lifts should not be rotated for novelty.

IF a planned workout is inside the current exercise rotation window  
-> the app keeps the selected exercises stable  
-> BECAUSE users need repeat exposure before the coach can judge progress.

IF the rotation window changes  
-> the app can rotate accessories in a deterministic, controlled way while keeping primary-like slots stable  
-> BECAUSE variation should refresh support work without turning the programme into random exercise roulette.

IF a lift stalls  
-> the app may recommend a same-family or same-role replacement  
-> BECAUSE rotation should solve a training problem, not create random novelty.

IF the user swaps, removes, or skips an exercise  
-> the app asks for a quick structured reason  
-> BECAUSE pain, unavailable kit, dislike, preference, and a one-off skip are different coaching signals.

IF the reason is pain or limitation  
-> the app does not count it as failed training, does not penalize progression, temporarily suppresses that exercise and close relatives, and steers toward same-muscle alternatives  
-> BECAUSE “this movement is not workable today” is not the same as “performance declined.”

IF the reason is equipment unavailable, machine occupied, or gym does not have this equipment  
-> the app does not penalize progression and uses the reason to rank available alternatives better next time  
-> BECAUSE bad gym logistics should not become fake training data.

IF the reason is dislike or prefer another exercise  
-> the app tracks the avoided exercise, preferred replacement, context, count, recency, confidence, cooldown, and decay  
-> BECAUSE repeated user behaviour is useful preference data and should influence future swaps, recommendations, and generated sessions.

IF the reason is temporary skip  
-> the app records the skip as temporary and learns no lasting preference  
-> BECAUSE one messy day should not permanently reshape the programme.

IF the same preference pattern repeats  
-> the app lowers the avoided exercise ranking and raises the preferred replacement ranking  
-> BECAUSE repeated behaviour is better evidence than a single awkward workout.

IF the avoided exercise is a protected primary lift  
-> the app requires stronger evidence before long-term suppression and still lets the user keep the lift  
-> BECAUSE Bench, Standing Press, Squat, and Deadlift should not disappear because of one bad day or one busy rack.

IF preference evidence becomes stale  
-> the app decays the penalty/boost over time  
-> BECAUSE old preferences should not haunt future programming forever.

Current strength:

The generator is structured, taxonomy-aware, and now uses reason/preference evidence when ranking generated exercises, Add Exercise recommendations, swap suggestions, and primary-lift variation choices.

Risk:

It is still intentionally conservative. Preference learning changes ranking and recommendations, but it does not silently delete major movements forever.

Recommended improvement:

Keep tuning the thresholds after real beta data shows how often users swap because of gym logistics versus true preference.

Implement now or later:

Implemented in Phase 2B.1 and extended in Phase 2B.4.

## 5. How The App Decides Rep Ranges

IF the programme slot has an explicit rep prescription  
-> that prescription wins  
-> BECAUSE planned session intent should not be overwritten by broad block defaults.

IF there is no explicit slot prescription  
-> the app uses block type plus exercise role  
-> BECAUSE a primary compound in Strength should not use the same rep range as a lateral raise in Hypertrophy.

IF the exercise family has a special need  
-> the family override can adjust the range  
-> BECAUSE calves, rear delts, forearms, power movements, and core work often need different targets.

IF none of those exist  
-> the app uses the exercise default, then a safe fallback  
-> BECAUSE every set row still needs a target.

Examples:

IF Bench Press is a Hypertrophy primary compound  
-> 6-10 reps  
-> BECAUSE it is a high-output compound where moderate reps are useful and technically manageable.

IF Lateral Raise is Hypertrophy small-muscle isolation  
-> 12-25 reps  
-> BECAUSE small isolation work usually tolerates and benefits from higher-rep loading.

IF Squat is a Strength primary compound  
-> 3-5 reps  
-> BECAUSE strength work is more specific at heavier loads and lower reps.

IF Power Clean is a Power movement  
-> 1-3 reps  
-> BECAUSE power work should preserve speed and quality.

Current strength:

Global rep min/max has been removed from normal UX, which is correct.

Risk:

The rep strategy is sensible but still broad. It does not yet adapt rep ranges to individual response.

Recommended improvement:

Do not personalize rep ranges until enough history exists to prove a pattern.

Implement now or later:

Later.

## 6. How The App Decides Unknown-Load Percentage Prescriptions

IF the app does not know or estimate the working load  
-> warm-up and work rows show percentages with short effort labels  
-> BECAUSE showing 0kg, 0lb, or fake loads makes the app look broken and untrustworthy.

Example:

- W1: 30% · easy warm-up
- W2: 45% · warm-up
- W3: 55% · close to working weight
- Work: 65-80% · hard but clean

IF the unknown exercise is Hypertrophy primary compound  
-> work rows show 65-80%  
-> BECAUSE that is a reasonable starting intensity band for moderate-load hypertrophy compound work.

IF the unknown exercise is Strength primary compound  
-> work rows show 80-90% · heavy, clean reps  
-> BECAUSE strength work should bias heavier, lower-rep loading.

IF the unknown exercise is small-muscle isolation  
-> work rows show a lower percentage range  
-> BECAUSE small isolation work usually cannot use the same relative loading as big compound work.

IF the user logs an actual load  
-> that set becomes real history  
-> BECAUSE performance-based coaching starts once the user gives the app real work.

Current strength:

Unknown load no longer pretends to know a number.

Risk:

Percentages are only useful if the user roughly understands their own max or effort scale. A true beginner may not.

Recommended improvement:

Keep the labels short. They are effort guidance, not RPE/RIR scoring.

Implement now or later:

Implemented in Phase 2 for unknown-load rows only. Known and estimated loads still show actual loads without percentage clutter.

## 7. How The App Decides Known-Load Prescriptions

IF exact exercise history exists  
-> the app uses the previous next recommended load  
-> BECAUSE exact exercise history is the best available predictor.

IF exact history is missing but same-family data is strong enough  
-> the app estimates conservatively from similar exercises  
-> BECAUSE a cautious estimate is better than a fake default, but only when evidence exists.

IF the same-family estimate is used  
-> it converts previous best work sets with `estimated1RM = load x (1 + reps / 30)` and then converts back to target reps  
-> BECAUSE that gives a simple strength estimate from actual performance.

IF same-family confidence is low  
-> the app leaves load unknown  
-> BECAUSE bad estimates are worse than honest uncertainty.

IF the load is known or estimated  
-> warm-up rows show actual load values only  
-> BECAUSE percentages are supporting detail, not the main prescription once a practical load exists.

Current strength:

Exact history beats estimates. Estimates require evidence. This is the right hierarchy.

Risk:

Same-family estimates can still be wrong across equipment styles, dumbbell/barbell conversions, and machine stacks.

Recommended improvement:

Keep estimates visibly labelled. Add “lower/raise after warm-ups” copy where needed.

Implement now or later:

Already present; refine copy later.

## 8. How The App Handles Warm-Ups

IF the user opens Session Prep  
-> the app can show general preparation such as mobility, activation, and an optional Wenning-style warm-up primer  
-> BECAUSE Session Prep should wake up positions and supporting muscles before lifting, not duplicate exercise loading ramps.

IF the Session Prep routine includes Wenning Warm-up  
-> it is shown as 2-4 light high-rep movements, around 15-25 reps, stopped well before failure  
-> BECAUSE this is a low-fatigue primer inspired by Wenning-style warm-ups, not hard training and not a medical or rehab protocol.

IF the user reaches the workout exercise rows  
-> those rows handle specific warm-up/ramp-up loading for that exercise  
-> BECAUSE exercise warm-ups are where the user works toward the actual working load.

IF a set is logged as warm-up  
-> it is stored but excluded from progression, shutdown, productive set counts, and volume landmarks  
-> BECAUSE warm-ups prepare the session but should not pretend to be hard training volume.

IF the working load is known  
-> warm-up rows show practical load suggestions  
-> BECAUSE the user needs something easy to follow in the gym.

IF working load is unknown  
-> warm-up rows show percentage-only guidance  
-> BECAUSE the app cannot prescribe a load honestly yet.

IF a warm-up is logged incorrectly  
-> the user can edit or delete it  
-> BECAUSE gym logging mistakes should be easy to fix.

Current strength:

Session Prep, Wenning-style primer work, and exercise warm-up rows are separated correctly from productive work sets.

Risk:

Warm-up percentage guidance can still be abstract for newer users.

Recommended improvement:

Keep plain-language intensity labels for unknown-load warm-ups and keep prep copy short enough to use mid-session.

Implement now or later:

Implemented as a presentation/coaching layer; keep refining with gym feedback.

## 9. How The App Decides Productive Sets

IF a work set stays within the target rep range and above the drop-off threshold  
-> it counts as productive  
-> BECAUSE it is hard enough to matter and not so degraded that it is junk.

IF a set is below the current threshold  
-> it is excluded from productive load averaging and can trigger shutdown  
-> BECAUSE that set indicates performance has fallen too far.

IF the exercise role/block has a productive set target  
-> the app shows guidance like 3-5 productive sets  
-> BECAUSE the user needs a target zone without making sets rigid.

Hybrid set prescription:

Adaptive Strength Coach now separates three ideas:

- `requiredSets`: minimum work sets needed for the exercise to count as complete.
- `recommendedRange`: the normal productive target zone, such as 3-5.
- `softCap`: the guardrail where the app says the user is probably done.

IF an exercise has `requiredSets: 3`, `recommendedRange: 3-5`, and `softCap: 8`  
-> 3 work sets completes the exercise, 3-5 is the normal target zone, and 8 is a ceiling-style warning  
-> BECAUSE completion, useful volume, and overwork protection are different decisions.

IF old data only has `requiredWorkSets`  
-> the app maps it into the hybrid model at read time  
-> BECAUSE active workouts and completed history must remain readable.

IF the user reaches the soft cap  
-> the app says they have probably done enough and can move on  
-> BECAUSE more work may add fatigue faster than stimulus.

Current strength:

Productive set targets are guidance, not forced stops.

Risk:

Soft caps are not hard caps, so a user can still overdo it if they ignore the coach.

Recommended improvement:

Later, consider hard caps only for peak/taper, deload, and high-risk contexts.

Implement now or later:

Later.

## 10. How The App Decides When To Stop An Exercise

IF the latest work set drops below the minimum acceptable reps  
-> the app shuts down the exercise  
-> BECAUSE performance has fallen far enough that further sets are likely lower quality.

The minimum acceptable reps are based on the best work set and the block/exercise drop-off setting.

Example:

IF best set is 12 reps and drop-off is 15%  
-> minimum acceptable performance is floor(12 - 1.8) = 10 reps  
-> BECAUSE 10 is still close enough to the best set to count as useful work.

IF the user then logs 8 reps  
-> the app stops the exercise  
-> BECAUSE 8 is below the useful-performance threshold.

Current strength:

This is the core autoregulation system. It is clear, objective, and does not require RPE/RIR.

Power-quality model:

IF the exercise is in a Power lane or Power block  
-> the app classifies recent output as sharp, acceptable, degrading, or insufficient data  
-> BECAUSE power work should protect fast, clean output instead of chasing junk volume.

The model uses:

- completed work reps versus the target
- set-to-set consistency
- missed work
- shutdown/drop-off
- fatigue signals
- lane/block context

It does not use RPE, RIR, velocity devices, or claimed bar-speed measurement.

IF power quality is sharp  
-> progression can push if the normal performance rules were also earned  
-> BECAUSE output is stable and fatigue is low.

IF power quality is acceptable  
-> the app holds  
-> BECAUSE the work is done, but quality is not clean enough to chase more load.

IF power quality is degrading  
-> the app pulls back  
-> BECAUSE speed and output are fading.

## 11. How The App Decides When To Increase Load

IF the user reaches the top of the target range and completes enough productive work without shutdown  
-> the app can recommend increasing load next time  
-> BECAUSE the load has been earned by objective performance.

IF the user hits the top of the range for 3 productive work sets at the same load during a session  
-> the app suggests increasing load for the next set  
-> BECAUSE that load looks too easy today.

IF the user ignores the suggestion  
-> the app does not force the increase  
-> BECAUSE the app coaches, the user lifts.

IF next-session load is calculated  
-> it averages productive work-set loads and rounds up to the available equipment increment  
-> BECAUSE the next starting load should reflect the whole productive session, not just the heaviest set.

Current strength:

This is one of the strongest pieces of the system. It is performance-led and practical.

Risk:

Average productive load rounded up is sensible, but may be aggressive for some users after a long ramp.

Recommended improvement:

Monitor physical QA. If users overshoot next session, add a conservative cap to next-session jumps.

Implement now or later:

Later unless gym QA shows overshooting.

## 12. How The App Decides When To Hold Load

IF the user completes useful work but does not earn progression  
-> the app holds load  
-> BECAUSE the next target is more clean reps, not more weight.

IF there is one bad session  
-> the app holds load or gives caution, not an immediate reduction  
-> BECAUSE one poor session can be sleep, stress, timing, or bad setup.

IF evidence is weak  
-> the app avoids a strong recommendation  
-> BECAUSE confident advice from weak data breaks trust.

Current strength:

Holding load is treated as a legitimate coaching outcome, not failure.

Risk:

Copy must keep reinforcing that “hold” can mean productive training.

Recommended improvement:

Use sharper copy: “Hold. Earn cleaner reps first.”

Implement now or later:

Copy pass later.

## 13. How The App Decides When To Reduce Load

IF there are fewer than 3 recent exposures  
-> the app does not reduce load  
-> BECAUSE repeated evidence is required.

IF there are repeated early shutdowns, best-set regression, quality-set collapse, or repeated failure to reach the target range  
-> the app can recommend reducing load  
-> BECAUSE the current load is producing worsening output.

IF only one weak signal appears  
-> the app says hold and watch  
-> BECAUSE reducing too quickly causes flip-flopping.

Current strength:

The app avoids knee-jerk load reductions.

Risk:

The current reduce-load calculation uses a conservative percentage reduction rounded up to the load increment. Rounding up can blunt the reduction when increments are large.

Recommended improvement:

Review whether reductions should round down, not up, while increases round up. This is a product/training decision.

Implement now or later:

Consider before a wide release. Not a blocker for QA if clearly monitored.

## 14. How The App Manages Weekly Volume

IF a work set is productive  
-> it contributes to weekly productive set counts by primary muscle group  
-> BECAUSE productive work sets are the cleanest available proxy for useful volume.

IF a set is warm-up or below threshold  
-> it is excluded  
-> BECAUSE warm-ups and degraded sets should not inflate volume.

IF extra sessions are completed  
-> they contribute to exercise history, fatigue, progression, and progress metrics  
-> BECAUSE the body still experiences extra training even if the plan does not count it as a planned slot.

IF extra sessions are completed  
-> they do not mark planned sessions complete or advance the week  
-> BECAUSE ad-hoc work should not corrupt programme structure.

Current strength:

Extra sessions are correctly separated from plan completion while still counting as training stress/history.

Risk:

Direct vs indirect muscle contribution is simplified. Some generator logic includes secondary contribution, but the volume landmark system mainly counts primary muscle quality sets.

Recommended improvement:

Later, add fractional secondary-muscle credit consistently.

Implement now or later:

Later.

## 15. How The App Estimates MEV/MAV/MRV-Style Landmarks

IF a muscle is large  
-> starting landmarks are roughly MEV 6-8, MAV 10-16, MRV 18-22 productive direct sets per week  
-> BECAUSE large muscles often tolerate and require more direct volume.

IF a muscle is smaller  
-> starting landmarks are roughly MEV 4-6, MAV 8-14, MRV 16-20 productive direct sets per week  
-> BECAUSE smaller muscles often need less absolute work.

IF volume is below the productive zone, progress is flat, and fatigue is low  
-> the app can recommend a small volume increase  
-> BECAUSE the user may need more stimulus.

IF volume is high, shutdowns are rising, or performance is declining  
-> the app can recommend reducing volume or deloading  
-> BECAUSE recoverability may be the limiter.

Current strength:

The app treats MEV/MAV/MRV as broad starting estimates, not personalized truth.

Risk:

The labels are hidden from users, which is good, but the underlying personalization is still early.

Recommended improvement:

Keep user-facing copy simple. Internally, personalize landmarks only after enough weeks of data.

Implement now or later:

Later.

## 16. How The App Detects Fatigue

IF shutdown rate rises  
-> fatigue trend worsens  
-> BECAUSE repeated drop-offs suggest the user is failing to sustain output.

IF quality-set trend falls  
-> fatigue trend worsens  
-> BECAUSE the user is producing less useful work.

IF best-set performance falls  
-> fatigue trend worsens  
-> BECAUSE output is declining.

IF optional recovery signals are available  
-> they can influence recovery trend  
-> BECAUSE sleep, pain, and motivation can matter, but they are not the core tactical engine.

Current strength:

Fatigue uses objective performance signals first.

Risk:

Fatigue now has a separation layer.

IF one lift declines repeatedly while related muscles are not broadly failing  
-> the app classifies the signal as exercise-specific fatigue  
-> BECAUSE one lift may need a hold, reduction, or variation without turning the whole plan into a deload.

IF several exercises for the same muscle decline and high-cost volume signals exist  
-> the app classifies the signal as muscle-local fatigue  
-> BECAUSE the better response is usually reducing that muscle's volume/accessories before changing the whole programme.

IF multiple unrelated lifts or muscles decline, shutdowns repeat across sessions, or extra-session workload gets high  
-> the app classifies the signal as systemic fatigue  
-> BECAUSE broad fatigue should suppress aggressive progression and can support deload/re-entry style recommendations.

IF local and broad signals overlap  
-> the app classifies the signal as mixed fatigue  
-> BECAUSE the app should address the local problem while respecting the broader recovery cost.

The classifier reads completed work-set history, exercise trends, muscle-volume signals, shutdown/drop-off history, extra-session workload, training-gap state, and deload state. It does not ask for RPE, RIR, or subjective fatigue scores.

Current strength:

Progress, deload evidence, personalised volume decisions, progression throttle, and primary-lift rotation can now distinguish exercise-specific, muscle-local, systemic, and mixed fatigue.

Risk:

The classifier still uses history proxies. It does not diagnose recovery, illness, stress, or injury.

Recommended improvement:

After beta data, tune thresholds for how quickly systemic and mixed fatigue suppress progression.

Implement now or later:

Implemented in Phase 2B.3; tune later.

## 17. How The App Handles Recovery Windows And Deloads

IF the roadmap reaches a planned Recovery Window  
-> the app uses the internal deload/recovery block mechanics with user-facing Recovery Window copy  
-> BECAUSE planned recovery should be an adaptive opportunity, not a mandatory calendar punishment.

IF fatigue/readiness evidence is high inside a Recovery Window  
-> the app runs the week more like a true deload  
-> BECAUSE output is already showing that recovery should lead before more load or volume.

IF the user is recovering well inside a Recovery Window  
-> the app keeps the week lighter than normal but more like transition/consolidation work  
-> BECAUSE the goal is to reduce stress without unnecessarily crushing training momentum.

IF readiness score is low or fatigue trend is high  
-> the app can recommend a reactive deload/recovery phase outside the planned roadmap window  
-> BECAUSE recovery should lead before more load, volume, or block advancement.

IF the user accepts a deload  
-> the app creates/activates a deload state or block  
-> BECAUSE the recommendation should be actionable, not just a warning.

IF a deload block is active  
-> set targets and unknown-load intensity prescriptions are visibly lighter  
-> BECAUSE the deload should change what the user does today, not just show a label.

User-facing note:

“Recovery Window. Keep it easy enough to rebound.”

IF evidence is insufficient  
-> deload recommendation is suppressed  
-> BECAUSE the app should not invent fatigue from empty history.

Current strength:

Reactive deloads are recommendation-led and evidence-gated. Planned Recovery Windows are already in the roadmap, but the actual dose should still adapt to readiness.

Risk:

The deload prescription is conservative but not deeply individualized yet.

Recommended improvement:

Keep improving deload personalization after real usage shows how users respond to mild, clear, and severe profiles.

Implement now or later:

Soon, before broad launch.

## 18. How The App Recommends Exercise Rotation

IF an exercise earns progression  
-> keep it  
-> BECAUSE progressing exercises are still paying rent.

IF an exercise has 4 exposures without progression  
-> recommend rotation  
-> BECAUSE repeated non-progression suggests the variation may be stale or poorly matched.

IF an exercise has repeated early shutdowns  
-> recommend rotation  
-> BECAUSE the movement is not currently producing useful work.

IF best-set performance regresses across 3 exposures  
-> recommend rotation  
-> BECAUSE output is declining.

IF the user keeps the exercise  
-> suppress repeat nagging for a period  
-> BECAUSE the user may have a practical reason to keep it.

Current strength:

Rotation is stall-based, not random.

Risk:

Structured reasons now exist, but ranking thresholds should be tuned after real swap/remove data.

Recommended improvement:

Use preference evidence as a ranking signal, not an irreversible command. Keep primary lifts protected and keep user override available.

Implement now or later:

Implemented in Phase 2B.4.

## 19. How The App Advances Weeks And Blocks

IF a planned session is completed  
-> it marks that planned session complete for the current week  
-> BECAUSE session completion should be tracked by planned slot.

IF all planned sessions in the week are complete  
-> Home shows Complete Week  
-> BECAUSE the user should explicitly move the programme forward.

IF the user taps Complete Week  
-> the block week increments and the next week starts at session 1  
-> BECAUSE week advancement is a deliberate checkpoint.

IF the active block reaches its final week  
-> the app can show block transition actions  
-> BECAUSE the user must choose move forward, repeat, or decide later.

Current strength:

Week advancement is no longer accidentally tied to finishing a single workout.

Risk:

Missed sessions, partial weeks, and calendar rescheduling still need product decisions.

Recommended improvement:

Later, add “carry incomplete sessions,” “skip missed session,” and “start next week anyway” options.

Implement now or later:

Later.

## 20. How Extra Sessions Affect Progression But Not Plan Completion

IF an extra full session is completed  
-> it appears in history and affects exercise/progress/fatigue data  
-> BECAUSE it was real work.

IF an extra volume session is completed  
-> it contributes to muscle volume and fatigue metrics  
-> BECAUSE low-fatigue work still counts as training stress.

IF a capacity session is completed  
-> it is logged separately from the main plan  
-> BECAUSE capacity work is useful but should not pretend to be a planned hypertrophy/strength workout.

IF any extra session is completed  
-> it does not complete a planned session, unlock Complete Week, or advance the week  
-> BECAUSE extra work is extra.

Current strength:

This distinction is product-critical and currently correct.

Risk:

Too many extra sessions can still drive fatigue; the app should eventually warn users when extra work is becoming the programme.

Recommended improvement:

Add a “you are doing a lot of extra work” coach note once history supports it.

Implement now or later:

Later.

## Science Alignment By Block

### Hypertrophy

Current defaults:

- Primary compound: moderate reps, usually 6-10.
- Secondary compound: 8-12.
- Isolation/small muscle: higher reps.
- Productive set targets are higher than strength/power phases.
- Drop-off is looser than strength because volume is part of the goal.

Alignment:

Solid. Hypertrophy can be built across a wide load range, but moderate-to-higher reps for accessories and enough weekly sets are practical and evidence-informed.

Risk:

Volume landmarks are starting estimates, not personalized.

### Powerbuilding

Current defaults:

- Main lifts use lower-to-moderate reps.
- Assistance work stays in moderate hypertrophy ranges.
- Volume is moderate.

Alignment:

Solid. This matches the goal of blending strength practice and muscle-building work.

Risk:

Powerbuilding can become too much if heavy compounds and high accessory volume both climb.

### Strength

Current defaults:

- Primary compounds use low reps.
- Accessories maintain hypertrophy with moderate reps.
- Drop-off is tighter.

Alignment:

Solid. Heavier loading is more specific for maximal strength.

Risk:

The app needs enough data before it recommends reductions or deloads from strength work.

### Power

Current defaults:

- Power movements use low reps.
- Strength exposure remains.
- Accessories are maintenance.

Alignment:

Conceptually solid.

Risk:

The tactical engine does not measure bar speed or jump quality. Power is currently approximated by low reps and fatigue control.

### Peak/Taper

Current defaults:

- Low volume.
- Very low reps for main lifts.
- High intent, low clutter.

Alignment:

Reasonable.

Risk:

The countdown/taper model is now real but intentionally broad. It does not pretend to be a sport-specific meet-prep, fight-camp, or physique-peaking engine.

Event countdown rules:

- 8+ weeks out: normal block flow; build capacity, strength, or power as needed.
- 4-8 weeks out: specificity rises and random exercise novelty is reduced.
- 2-3 weeks out: volume reduces, quality/intensity is maintained where appropriate, and aggressive new volume is suppressed.
- Final week: taper/readiness, low fatigue, no novelty, no aggressive progression chasing.
- After the event: post-event reset/recovery recommendation.

Event type interpretation:

- Powerlifting/strength event: favour strength, peak, specificity, and event-relevant lifts.
- Sport/athletic event: favour power quality, readiness, and low junk volume.
- Photoshoot/holiday/body-composition event: favour fatigue and volume management without fake physique promises.
- Generic event: use conservative readiness-first sequencing.

### Deload

Current defaults:

- Lower stress.
- Comfortable reps.
- No aggressive progression.

Alignment:

Reasonable.

Risk:

Phase 2 makes the active deload prescription clearer on the session surface. Deeper personalization remains later.

## Weak Points And Decisions

| Area | Current behaviour | Solid? | Risk | Recommended improvement | Now or later |
| --- | --- | --- | --- | --- | --- |
| Unknown-load percentages | Shows block/role percentage ranges with plain effort labels when load is unknown | Stronger | Still assumes the user understands percentage-style effort | Consider a deeper first-load tutorial later | Later |
| Known-load prescription | Exact history first, same-family estimate second | Strong | Estimates can miss across equipment | Keep estimate copy cautious | Already mostly done |
| Productive set targets | Role/block targets with soft caps | Strong | Users can ignore soft caps and overdo volume | Consider hard caps only in peak/deload/high-risk contexts | Later |
| Weekly volume landmarks | Broad MEV/MAV/MRV-style starting estimates | Medium | Not personalized yet | Personalize after several weeks of data | Later |
| Fatigue detection | Shutdown rate, quality trend, performance trend | Medium | Can confuse local and global fatigue | Separate muscle, exercise, and global fatigue | Later |
| Deload triggers | Strategic fatigue/readiness recommendation with mild/clear/severe deload profiles | Stronger | Deload prescription is still profile-based, not deeply personalized | Personalize by long-term response later | Later |
| Decrease-load rules | Requires repeated objective decline and rounds reductions down to a practical lower load | Strong | Large dumbbell/machine jumps can still be blunt | Keep conservative hold/caution when one jump would overcorrect | Already done |
| Exercise rotation | Stall-based; keeps progressing lifts; uses structured reasons and preference evidence when ranking replacements | Stronger | Preference thresholds need beta data | Tune cooldown/decay and primary-lift protection thresholds after usage | Done for Phase 2B.4 |
| Extra sessions | Count toward history/fatigue, not plan completion | Strong | Excess extras may undermine plan | Warn if extras become excessive | Done lightly in Phase 2 |
| Power block | Low-rep prescriptions plus power-quality proxy from reps, consistency, missed work, drop-off, fatigue, and lane context | Stronger | Still does not measure true velocity | Keep copy honest: speed intent, not velocity measurement | Done for Phase 2B.2 |

## Recommended Next Implementation Plan

### Training Logic Changes I Recommend

1. Watch physical QA feedback on unknown-load effort labels.
2. Tune the “extra work is getting high” threshold after gym data.
3. Later, split fatigue into exercise-level, muscle-level, and global fatigue.

### Copy Changes I Recommend

1. Replace bland recommendation labels with coach language.
2. Keep evidence drawers factual but less sterile.
3. Make low-history copy honest and funny without being cute.
4. Keep Power block copy honest: “speed and clean reps,” not fake velocity tracking.
5. Keep all prep/capacity copy clearly non-medical.

### Changes To Avoid

1. Do not add RPE/RIR as a required input.
2. Do not make deloads automatic without user confirmation.
3. Do not rotate Tier A exercises just for novelty.
4. Do not expose MEV/MAV/MRV jargon on main surfaces.
5. Do not claim the app knows the user’s true max, true recovery, or true MRV.

### What Should Be Implemented Before The Next Build

Phase 1 training-logic changes are now in place:

- Load increases still round up to the next available increment.
- Load reductions now round down to a practical lower valid increment.
- Reductions require repeated objective decline, not one weak workout.
- Deload recommendations are evidence-gated and use mild, clear, or severe profiles.
- Goal-based success models now influence recommendation priority.

Recommended if time allows:

- More fixtures for power-quality edge cases in real generated Power sessions.
- Copy-only sharpening of hold/increase/reduce recommendations.

### What Can Wait

- Personalized volume landmarks.
- Advanced deload personalization.
- True velocity-device integration. The current power-quality model is intentionally device-free.
- Preference-learning threshold tuning after beta usage.
- Further beta-tuned body-part split volume/frequency.

## Phase 1 Success Model And Deload Rules

### Load Reduction

IF one poor exposure happens  
-> the app holds load or shows caution  
-> BECAUSE one bad day is not enough evidence to reduce.

IF repeated objective decline appears  
-> the app recommends a lower load  
-> BECAUSE the current load is no longer producing quality work.

Reduction severity:

- Mild repeated decline: about 5%.
- Moderate repeated decline: about 7.5%.
- Severe decline or high fatigue: about 10%.

Rounding rule:

- Increases round up.
- Reductions round down to a practical lower load.
- A reduction should not equal the current load.
- If the next available lower load would be a silly overcorrection, the app holds and asks for more evidence.

### Deload Profiles

Deloads are still performance-led. They are not automatic calendar rituals.

IF repeated fatigue and performance signals align  
-> the app can recommend a deload  
-> BECAUSE the logbook shows fatigue is now limiting useful output.

Mild fatigue:

- 1 week.
- Reduce productive set targets by 30-40%.
- Reduce load/intensity by 5-10% or keep comfortable technique loads.
- Remove low-priority extras.
- Suppress aggressive progression prompts.

Clear fatigue:

- 1 week.
- Reduce productive set targets by 40-60%.
- Reduce load/intensity by 10-15%.
- Lower soft caps.
- Suppress escalation and aggressive progression prompts.
- Favor stable, low-risk exercise selection.

Severe fatigue or repeated regression:

- 1 week.
- Reduce productive set targets by 50-70%.
- Reduce load/intensity by 15-25%.
- Remove high-fatigue extras.
- Use conservative prescriptions.
- Focus on movement quality.

User-facing copy stays training-focused:

“Performance is dropping and fatigue is rising. Take a lighter week, then push again.”

### Goal-Based Success Model

Adaptive Strength Coach now interprets the same performance data through the user’s goal.

Build Strength:

- Primary success: Tier A compound progression and estimated strength trend.
- Priority: protect main lifts, reduce fatigue before abandoning load, rotate Tier A only when truly stalled.

Build Muscle:

- Primary success: productive muscle-building work and weekly volume inside a recoverable range.
- Priority: adjust volume first, rotate stale accessories, keep fatigue manageable.

Build Muscle & Strength:

- Primary success: compound progression plus productive volume.
- Priority: keep load progression and muscle-building work from crushing each other.

Athletic Performance:

- Primary success: quality strength/power output and readiness.
- Priority: quality over grind, avoid junk volume, deload earlier when output drops.

Powerlifting Meet:

- Primary success: squat, bench, and deadlift readiness.
- Priority: use the meet countdown, increase specificity, reduce novelty and fatigue late, and arrive recovered enough to express strength.

Get Leaner:

- Primary success: maintain or improve strength where possible, preserve muscle, stay consistent, and support body-composition progress.
- Priority: sustainable volume, recovery quality, more Recovery Cardio when useful, and no unnecessary fatigue chasing.

## Settings Must Change Training

Adaptive Strength Coach does not keep fake controls live for normal users.

IF the user chooses a goal  
-> the app stores that goal on the active plan and uses it for block sequencing, success definitions, strategic coaching priority, and Progress interpretation  
-> BECAUSE “working” means different things for muscle gain, strength, athletic output, leaning out, and meet readiness.

IF the user chooses 12-month planning  
-> the app creates a goal-specific 48-52 week roadmap  
-> BECAUSE long-term training should move through different emphases instead of pretending one block solves everything.

IF the user chooses one block at a time  
-> the app creates only that block and lets them choose the next block at the endpoint  
-> BECAUSE the Plan screen should not pretend annual progression exists.

IF the user chooses an event/date plan  
-> the app uses the event type and target date to choose and size the sequence  
-> BECAUSE a meet, season, or date-based goal changes what should come next.

IF the event countdown reaches taper or event week  
-> the app suppresses add-volume actions, limits novelty, tightens heavy exposure budgets, and holds aggressive progression  
-> BECAUSE readiness matters more than squeezing in one more clever change.

IF the user taps the help icon on Home or Plan  
-> the app opens "How Adaptive Strength Coach Works"  
-> BECAUSE normal users need a quick, non-jargon explanation of plans, blocks, required sets, target ranges, soft caps, warm-ups, autoregulation, progression, volume learning, swaps, deloads, and re-entry.

IF the user chooses beginner  
-> generated sessions exclude advanced exercises, use fewer exercise slots, and start with lower planned set targets  
-> BECAUSE beginners need simpler sessions and a longer runway before aggressive recommendations.

IF the user chooses advanced  
-> generated sessions can use more template slots and higher planned set targets where appropriate  
-> BECAUSE advanced users can usually tolerate more complexity when performance supports it.

IF the user chooses training days per week  
-> the weekly training sequence contains exactly that many workouts  
-> BECAUSE rest days should not consume training slots.

IF the user chooses equipment access  
-> planned and extra generated sessions filter exercises to that equipment  
-> BECAUSE a plan that prescribes unavailable equipment is not a plan.

IF the user chooses kg/lb or available weight jumps  
-> load display and load rounding use those settings  
-> BECAUSE recommendations must match the loads the user can actually put on the bar, stack, or dumbbell rack.

IF a setting is not fully implemented  
-> it is hidden or labelled Coming later  
-> BECAUSE Adaptive Strength Coach should not offer fake controls.

See `docs/settings-behaviour-audit.md` for the full field-by-field audit.

## Goal-Aware Progression Throttle

Adaptive Strength Coach now separates two questions:

1. Did the user earn progression from logged performance?
2. Is pushing load the smartest move right now?

The answer can be Push, Hold, or Pull Back.

IF the user hits the top of the target rep range for enough productive work, fatigue is low, and recent performance is stable  
-> the app can recommend Push  
-> BECAUSE performance earned more weight and the cost is still manageable.

IF the user technically earns progression but recent fatigue, shutdown rate, volume cost, goal context, or experience level says the jump is not smart  
-> the app recommends Hold  
-> BECAUSE holding a load can be productive training when pushing would make the next session more expensive than useful.

IF recent exposures show repeated objective decline  
-> the app recommends Pull Back or lets the existing reduced-load logic win  
-> BECAUSE repeated decline is stronger evidence than one good-looking set.

Goal interpretation:

- Build Strength: push Tier A compound lifts more readily when output is strong; if fatigue rises, protect the main lift and reduce surrounding cost first.
- Build Muscle: do not chase load at the expense of recoverable productive volume; accessories can hold while reps and quality improve.
- Build Muscle & Strength: balance load progression and productive volume so neither crushes the other.
- Athletic Performance: quality beats grind; hold sooner when fatigue rises.
- Powerlifting Meet: readiness and specificity matter more near the event; taper/event-week phases suppress aggressive jumps late.
- Get Leaner: keep recommendations simple and conservative.

Experience interpretation:

- Beginner: can push strong compound trends sooner when fatigue is low.
- Intermediate: default progression speed.
- Advanced: requires stronger evidence before aggressive load jumps, especially on isolation work.

Rep-range interpretation:

- Low-rep strength ranges can earn load from repeated top-range productive sets.
- Moderate hypertrophy ranges can earn load, but volume/fatigue can still make Hold smarter.
- High-rep isolation ranges progress more conservatively; reps and clean work can matter before load.

The throttle never asks for RPE or RIR. It uses logged reps, loads, work-set quality, shutdown/drop-off history, goal, experience, block, and session context.

## Personalised Muscle-Volume Learning

Adaptive Strength Coach now separates load progression from volume progression.

IF an exercise improves  
-> load decisions stay exercise-specific  
-> BECAUSE Bench Press load and Pec Deck load should not move as one shared number.

IF a muscle repeatedly needs more or less work  
-> volume decisions happen muscle-by-muscle  
-> BECAUSE chest, back, quads, hamstrings, shoulders, and smaller muscles can recover and respond differently.

The model reads completed workout history only. It counts productive work sets for the target muscle. It excludes warm-ups, below-threshold junk sets, cancelled workouts, and incomplete rows.

Evidence gates:

IF there are fewer than 3 observed training weeks, fewer than 2 exposures for the muscle, or too little productive work  
-> the model returns insufficient data  
-> BECAUSE one good or bad session is not enough to personalise volume.

Ladder for adding work:

IF a muscle looks mildly underdosed  
-> Bias high  
-> BECAUSE the first move is to aim for the top of the current set range, not rewrite the plan.

IF the same muscle stays underdosed after that nudge  
-> Raise range modestly, such as 3-5 becoming 4-6  
-> BECAUSE repeated evidence can justify starting slightly higher next week.

The app changes the recommended range, not the completed workout and not the logged history.

IF the muscle still stays underdosed after the range is raised  
-> Add a low-fatigue accessory slot  
-> BECAUSE another exercise is the last step, not the first.

Ladder for reducing work:

IF a muscle starts getting expensive  
-> Bias low  
-> BECAUSE the first move is to stay near the low end of the current range.

IF high cost repeats  
-> Lower accessory/isolation range modestly  
-> BECAUSE reducing lower-priority work protects the main training effect.

Lowering range can lower the required floor when the recommended minimum drops, but it still protects Tier A/main compound work where possible.

IF high cost persists after the range is lowered  
-> Remove or swap a low-priority accessory  
-> BECAUSE the app should remove cost before hammering the main lift.

IF output and fatigue suggest overreaching  
-> show deload caution or reduce-volume logic  
-> BECAUSE doing more than the user recovers from is not heroic; it is expensive.

Soft cap rule:

IF a user repeatedly reaches a soft cap  
-> the app may consider a small future range increase or another low-fatigue slot if fatigue is low  
-> BECAUSE the soft cap is a safety ceiling, not the normal target.

IF soft-cap work comes with rising fatigue  
-> the app treats it as high cost  
-> BECAUSE more sets are only useful when the user can recover from them.

Goal interpretation:

- Build Muscle: volume learning matters strongly and can raise ranges/add accessories sooner when recovery supports it.
- Build Strength: protect main compounds; reduce accessory cost before touching Tier A exposure.
- Build Muscle & Strength: balance compound progression with recoverable muscle-building work.
- Athletic Performance: avoid junk volume and reduce/hold sooner when fatigue rises.
- Powerlifting Meet: avoid adding volume late; readiness wins.
- Get Leaner: prefer simple bias-high/bias-low nudges before structural changes.

Extra sessions:

IF the user completes extra work  
-> it counts toward muscle volume, fatigue, and progress evidence  
-> BECAUSE extra work is real workload.

IF the user completes extra work  
-> it does not complete planned sessions or advance the week  
-> BECAUSE it is additional training, not a replacement for the plan.

## Applying Volume Ladder Actions

Volume ladder recommendations require user approval.

IF Progress or Home shows a medium/high-confidence volume recommendation  
-> the user can apply it or ignore it  
-> BECAUSE Adaptive Strength Coach should not silently rewrite the programme.

IF the user ignores the recommendation  
-> no future session changes are made  
-> BECAUSE ignoring is a valid decision when the user knows context the app cannot see.

IF the user applies `bias_high`  
-> future relevant muscle work keeps the same set target and adds the intent “Aim for the top of the range if performance holds.”  
-> BECAUSE the first ladder step is coaching direction, not structural change.

IF the user applies `bias_low`  
-> future relevant muscle work keeps the same set target and adds the intent “Stay near the low end this week.”  
-> BECAUSE the first reduction step lowers execution pressure without rewriting the plan.

IF the user applies `raise_range`  
-> future accessory/isolation work for that muscle starts one work set higher  
-> BECAUSE repeated underdosing can justify a modest future range increase.

IF the user applies `lower_range`  
-> future accessory/isolation work for that muscle starts one work set lower  
-> BECAUSE high-cost patterns should reduce low-priority work before touching main compounds.

IF the user applies `add_exercise`  
-> future generated sessions can add one low-fatigue accessory/isolation for that muscle  
-> BECAUSE another slot is useful only after gentler ladder steps were not enough.

IF the user applies `remove_or_swap_exercise`  
-> future generated sessions remove the lowest-priority accessory for that muscle  
-> BECAUSE the app should trim cost without deleting Tier A/main compounds.

Safety constraints:

- no more than one volume increase action per muscle per week
- no more than one structural add/remove per muscle per block unless confidence is high
- no add-volume actions during deload
- no add-volume actions during peak/taper
- completed workouts are never mutated
- active workouts already in progress are never mutated
- previous applied ladder actions feed the next personalised-volume decision

## Training Gap / Re-Entry Load Adjustment

Adaptive Strength Coach does not overreact to short breaks. It also does not blindly reuse old loads after meaningful time away.

IF the user trained within the last 0-7 days  
-> the app makes no training-gap load adjustment  
-> BECAUSE normal weekly spacing should not be treated as lost capacity.

IF the user is 8-14 days from the last relevant session  
-> the app keeps the load prescription and shows an ease-in note  
-> BECAUSE a short break needs clean execution, not automatic load decay.

IF the user is 15-21 days from the last relevant session  
-> known/estimated target loads can be trimmed around 2.5-5% and rounded down to the available increment  
-> BECAUSE the first session back should be conservative without pretending the user has reset.

IF the user is 22-35 days from the last relevant session  
-> known/estimated target loads can be trimmed around 5-10% and rounded down  
-> BECAUSE the old number may still be useful history, but it should not be forced as today's target.

IF the user is 36+ days from the last relevant session  
-> the app recommends a re-entry week, trims known/estimated targets around 10-15%, and suppresses aggressive escalation  
-> BECAUSE the first week back should build momentum before chasing numbers.

Exercise-specific gap:

IF the user kept training but has not trained a specific exercise/family for a while  
-> the gap adjustment applies only to that exercise/family  
-> BECAUSE pressing loads should not be trimmed just because lower body kept moving, and vice versa.

Global gap:

IF the user has not completed any workout for a while  
-> the gap adjustment applies across the generated workout  
-> BECAUSE the whole session is a re-entry prescription.

Known, estimated, and unknown loads:

IF a known load exists  
-> the adjusted prescription shows a real load in the user's unit.

IF a same-family estimate exists  
-> the app may adjust it conservatively when confidence is medium/high.

IF no reliable load exists  
-> the app keeps percentage prescriptions and shows only an ease-in/re-entry note  
-> BECAUSE warm-ups and unknown prescriptions should not invent a working load.

The adjustment never edits completed history, PRs, approved recommendations, or logged sets. It changes only future prescriptions. Once the user logs a successful return session, normal performance-based progression takes over again.

## Block-Specific Training Lanes

Adaptive Strength Coach treats blocks as biased blends, not isolated training modes.

IF the active block is Hypertrophy  
-> most accessory work uses the hypertrophy lane, while main compounds can use a hypertrophy-strength support lane  
-> BECAUSE muscle-building work is the mission, but useful strength exposure keeps the big lifts alive.

IF the active block is Powerbuilding  
-> main compounds use the strength lane, secondary compounds bridge strength and hypertrophy, and accessories use the hypertrophy lane  
-> BECAUSE the block is designed to build force without starving productive muscle work.

IF the active block is Strength  
-> main compounds use the strength lane, secondary compounds use strength support, and accessories shift to maintenance  
-> BECAUSE heavy work needs room, and accessories should support the lifts without eating recovery.

IF the active block is Power  
-> explosive work uses the power lane, main compounds use strength support, and accessories use maintenance  
-> BECAUSE the goal is speed and quality, not high-volume grinding.

IF the active block is Peak  
-> specific main lifts use the peak lane, secondary lifts use strength maintenance/support, and accessories stay conservative  
-> BECAUSE the goal is expressing strength while dropping fatigue.

IF the active block is Recovery Window  
-> work uses recovery or maintenance lanes  
-> BECAUSE progression chasing is suppressed and the session should lower fatigue.

Lane rules:

- hypertrophy lane: larger productive set ranges, stronger personalised-volume learning, load progression allowed but not at the expense of useful volume
- strength lane: lower reps, tighter set ranges, lower soft caps, and a controlled heavy exposure budget
- power lane: low reps, quality first, no high-volume chasing, hold/pull back when fatigue rises
- peak lane: very low volume, specificity, fatigue minimisation, no aggressive volume increases
- maintenance lane: enough work to keep the quality alive; progression is not the priority
- recovery lane: low load and low fatigue; no progression chasing

## Block Transition Load Recalibration

IF the user moves from one block to another with a different rep target  
-> the app estimates an appropriate starting load from recent work-set performance, applies a conservative lane buffer, and rounds down to the equipment increment  
-> BECAUSE `100kg x 12` in hypertrophy should not blindly become `100kg x 5` in strength, and `120kg x 5` should not blindly become `120kg x 12` in hypertrophy.

IF no reliable work-set history exists  
-> the app keeps unknown-load percentage prescriptions  
-> BECAUSE warm-ups and guesses should not create fake working-load history.

Heavy exposure budgets:

- Hypertrophy keeps heavy exposure supportive.
- Strength allows more heavy exposures but controls total hard compound sets.
- Power keeps quality high and fatigue lower.
- Peak keeps heavy exposure strict.
- Beginners receive lower exposure budgets.
- Advanced users can receive more exposure, but evidence gates stay stricter.

## Primary Strength Lift Variations

Adaptive Strength Coach treats four lift families as canonical primary strength lifts:

- Bench Press
- Standing Overhead Press
- Squat
- Deadlift

IF one of those canonical lifts is still progressing  
-> the app keeps it stable  
-> BECAUSE primary strength lifts need specificity and repeated exposure before the app changes them.

IF one of those canonical lifts stalls across objective evidence, such as repeated exposures without progression, repeated early shutdowns, or repeated best-set regression  
-> the app checks the structured primary-lift variation map before generic same-family swaps  
-> BECAUSE Bench, Squat, Overhead Press, and Deadlift should rotate to close variations before random replacements.

IF Bench Press stalls and no weak-point evidence is strong enough  
-> the app prefers a broadly useful bench variation such as Floor Press before generic Machine Chest Press  
-> BECAUSE it can preserve pressing specificity without pretending to know the exact weak point.

IF Squat stalls  
-> the app prefers structured squat variations such as Box Squat, Safety Squat Bar Squat, Front Squat, Cambered Bar Squat, or Zercher Squat when equipment and experience allow  
-> BECAUSE a squat stall should stay in the squat family unless the user chooses otherwise.

IF the Deadlift family stalls  
-> the app prefers structured pull variations such as Rack Pull, Deficit Deadlift, Romanian Deadlift, Block Pull, Pause Deadlift, or Trap Bar Deadlift when available  
-> BECAUSE heavy hinge specificity matters more than generic hamstring replacement.

IF the app needs the canonical Deadlift anchor  
-> it uses Deadlift, not Romanian Deadlift  
-> BECAUSE Romanian Deadlift is a support hinge/variation, while Deadlift is the primary strength reference lift.

IF Standing Overhead Press stalls  
-> the app prefers structured overhead press variations such as Seated Barbell Shoulder Press, Push Press, Dumbbell Shoulder Press, Plate Loaded Shoulder Press Machine, or high-incline/pin press options when available  
-> BECAUSE it is treated as its own major press strength lift, not just another shoulder exercise.

IF equipment or experience rules make a structured variation inappropriate  
-> the app falls back to the existing generic same-family swap logic  
-> BECAUSE a safe available replacement beats a perfect variation the user cannot perform.

IF no weak-point data exists  
-> the app uses broad variation logic and says the lift has stalled, not that a specific weak point is diagnosed  
-> BECAUSE Adaptive Strength Coach only claims what the logged performance can support.

IF a structured variation is accepted  
-> the future plan stores the original lift, chosen variation, reason, block/week, exposure count, outcome, and cooldown  
-> BECAUSE the app should avoid cycling randomly and should learn which variations helped.

IF the user rejects the variation  
-> the plan records the rejected decision and suppresses the immediate repeat prompt  
-> BECAUSE “Keep Bench” should mean something.

IF a variation has had its run or the user moves into strength/peak specificity  
-> the app can recommend returning to the canonical lift  
-> BECAUSE variations are tools, not permanent exile.

## Exercise Library Expansion And Taxonomy

IF an exercise already exists under a near-equivalent name  
-> the app reuses the existing exercise and adds aliases/search tags instead of creating a duplicate  
-> BECAUSE Add Exercise, Swap, history, same-family estimates, and progression all get cleaner when one movement has one canonical record.

Current reused aliases include:

- Skull Crusher -> Skull Crusher / EZ-bar skull-crusher style entries use the existing triceps isolation taxonomy.
- Overhead Rope Extension -> the existing cable rope overhead extension entry.
- Machine High Row -> High Row Plate Loaded.
- Rear Delt Fly Machine -> Reverse Machine Fly.
- Chest-Supported Row -> Chest Supported Row.
- Hip Thrust -> Barbell Hip Thrust.
- Straight Arm Cable Pulldown -> Straight-Arm Pulldown.

IF a new strength variation is added  
-> it receives family, role, tier, equipment, block suitability, experience suitability, and same-family tags  
-> BECAUSE primary-lift variation logic and swap recommendations need structured variants, not random search results.

New structured strength variation coverage now includes:

- Bench: Paused Bench Press, Larsen Press, Feet-Up Bench Press, Slingshot Bench Press, Bench Press with Chains, Bench Press with Bands, Speed Bench Press.
- Squat: Pin Squat, Anderson Squat, Hatfield Squat, Tempo Squat, Squat with Chains, Squat with Bands, Speed Squat.
- Deadlift: Snatch-Grip Deadlift, Stiff-Leg Deadlift, Tempo Deadlift, Deadlift with Chains, Deadlift with Bands, Speed Deadlift.

IF a power movement is added  
-> it is marked as power-lane work with lower rep ranges, quality emphasis, and beginner restrictions when skill demand is high  
-> BECAUSE Olympic derivatives, jumps, and throws should not leak into hypertrophy accessory slots.

Power coverage includes clean/snatch derivatives, jumps, and medicine/slam-ball throws. These are primarily for power or peak contexts, with beginner filtering applied to high-skill or high-impact options.

IF a hypertrophy accessory is added  
-> it is classified as accessory/isolation/low-fatigue where appropriate  
-> BECAUSE the personalised volume ladder should prefer useful, recoverable add-volume options such as Cable Fly, Pec Deck, Rope Pushdown, Chest Supported Row, Seated Leg Curl, and Machine Lateral Raise before high-fatigue compounds.

Equipment note:

- Chains and specialty implements currently map through `other` plus the relevant base tool such as `barbell`.
- Bands use the existing `bands` category.
- Medicine balls, slam balls, boards, boxes, blocks, trap bars, and specialty bars are represented conservatively as `other` when a more specific category does not exist.
- This keeps filtering safe without adding a swarm of half-supported equipment controls.

## Rep Range Occupancy

IF a user repeatedly logs productive work sets for the same exercise  
-> the app observes where those reps usually land inside the target range  
-> BECAUSE some lifters naturally live near the heavy end of a range while others live near the top end.

IF the target is 8-12 reps and the user usually averages around 8-9 productive reps  
-> the app classifies that exercise as heavy-end behaviour once there is enough evidence  
-> BECAUSE the user may be progressing without needing to hit 12 forever.

IF the target is 8-12 reps and the user usually averages around 10 reps  
-> the app treats the exercise as balanced  
-> BECAUSE the user is working through the middle of the range.

IF the target is 8-12 reps and the user usually averages around 11-12 reps  
-> the app treats the exercise as top-end behaviour  
-> BECAUSE the user is consistently reaching the volume end of the range.

IF there are fewer than 2 exposures or fewer than 6 productive work sets  
-> the app returns insufficient data  
-> BECAUSE one workout is not a training style.

IF warm-up sets, cancelled workouts, or incomplete rows exist  
-> the app excludes them from rep range occupancy  
-> BECAUSE this model is about productive work, not preparation.

IF a heavy-end exercise is stable or improving and fatigue is low  
-> the progression throttle may still allow a load push even without absolute top-of-range reps  
-> BECAUSE performance trend matters, not just a single top-rep checkbox.

IF fatigue is high, deload is active, or performance is declining  
-> the app holds or pulls back even if occupancy looks favourable  
-> BECAUSE recovery and objective performance still outrank style detection.

IF two exercises behave differently for the same user  
-> the app keeps the occupancy exercise-specific  
-> BECAUSE Bench Press can be heavy-biased while Lateral Raise is volume-biased, and both can be normal.

User-facing rule:

- Do not show occupancy scores or labels.
- Do not ask for RPE, RIR, or subjective effort style.
- If surfaced as evidence, use plain language such as: “Bench work is trending well even though recent reps sit near the heavy end of the range.”

## Recovery & Capacity

Adaptive Strength Coach treats cardio as recovery and work-capacity support for the lifting plan, not as a separate fat-loss product.

User preference:

- `Recommended`: normal recovery/capacity recommendations and optional cardio sessions.
- `Minimal`: only surface cardio when workload, fatigue, or goal context clearly supports it.
- `Off`: suppress user-facing cardio suggestions only. Fatigue, recovery, volume learning, and progression calculations still run.

Lanes:

- Recovery Cardio: incline walk, brisk walk, easy bike, or easy rower. Low fatigue. Used for recovery support, aerobic base, and general health.
- Capacity Cardio: tempo row, sled pushes, assault bike intervals, or moderate conditioning. Moderate fatigue. Used for work capacity.
- Performance Conditioning: event or sport-relevant conditioning. Used mostly for athletic/event goals.

Cardio logging:

- Cardio sessions are logged as lightweight cardio records, not fake lifting workouts.
- Required fields: session type, modality, and duration.
- Optional fields: distance, perceived ease (`easy`, `moderate`, `hard`), and notes.
- No heart-rate zones, calorie targets, pace requirements, GPS, or wearables.
- Cardio history stays separate from work-set history and does not create lifting progression evidence.

Delivery:

- Home can show a weekly Recovery & Capacity target when the recommendation confidence is useful.
- The target shows current-week completion, for example `1 / 2 sessions completed`.
- The target uses direct actions such as `Start Recovery Cardio` or `Start Capacity Cardio`.
- The target shows Best/Avoid timing guidance, such as rest days, after upper-body sessions, or avoiding hard conditioning before heavy lower/deadlift work.
- The direct action shows a short timing check before creating the correct extra cardio session and opening cardio logging.
- Progress can show the current target, completed count, and dose action.
- `Ignore This Week` persists for the current training week and active plan without changing training logic.
- Cardio remains separate from `This Week` lifting completion.

Timing guidance:

- Adaptive Strength Coach does not auto-schedule cardio onto calendar days.
- It uses goal, block, fatigue, event/taper phase, and active/next workout context to answer "when should I do this?"
- Heavy lower, squat, or deadlift context pushes hard conditioning away and favours Recovery Cardio.
- Heavy upper context is usually a good window for easy recovery work.
- Power-focused work favours low-fatigue recovery so speed stays sharp.
- Peak, taper, and meet week are recovery-only contexts.
- Athletic Performance allows more conditioning when recovery is under control.

Dose progression:

- Start low and progress slowly.
- Increase duration before adding frequency.
- Build Muscle: mostly Recovery Cardio, usually 2-4 low-fatigue sessions when useful.
- Build Strength: 2-3 low-fatigue sessions; avoid hard conditioning near heavy lower-body work.
- Build Muscle & Strength: 2-4 mostly recovery-focused sessions, with capacity work if tolerated.
- Athletic Performance: can use 3-5 sessions and more Capacity/Performance Conditioning when fatigue allows.
- Powerlifting Meet: follows the meet countdown; taper/meet weeks suppress hard conditioning and protect squat, bench, and deadlift readiness.
- Get Leaner: more Recovery Cardio when useful, usually low-fatigue and supportive rather than punishing.

Interference rules:

- Hard lower-body conditioning should not be placed before heavy squat/deadlift work unless the goal demands it.
- The delivery layer inspects the active or next planned workout when possible, then falls back to context such as heavy lower, deadlift focused, heavy upper, power, peak, taper, and event week.
- Hard intervals are reduced or paused when systemic fatigue is moderate/high.
- Deload, taper, and event week suppress hard conditioning and volume increases.
- Recovery Cardio can be suggested more freely because the cost is low.
- Excessive hard cardio contributes to systemic fatigue evidence; easy recovery cardio does not.
- The cardio logging screen can show a simple caution and lower-fatigue alternative when the chosen session would interfere with the lifting plan.

Goal interpretation:

- Build Muscle favours Recovery Cardio when workload climbs so volume remains recoverable.
- Build Strength favours low-fatigue Recovery Cardio and avoids conditioning that steals from heavy work.
- Build Muscle & Strength uses the strongest recovery-capacity emphasis because both load and volume need support.
- Athletic Performance can use Recovery, Capacity, and Performance Conditioning more assertively.
- Powerlifting Meet biases recovery and low interference so meet-specific lifting stays sharp.
- Get Leaner supports body-composition progress through recovery capacity and consistency, without calorie targets or fat-loss guarantees.

Safety rules:

- No exact heart-rate zones.
- No calorie targets.
- No medical claims.
- No nutrition/running-app sprawl.
- Extra Recovery/Capacity Cardio sessions do not complete planned workouts.
- Cardio dose can influence recovery/capacity recommendations, but it does not trigger lifting progression.
