# Full Iron Logic App Audit

Date: 2026-06-09  
Scope: beta-readiness audit of training logic, UI/UX, product promises, data integrity, exercise taxonomy, and Phase 2B gaps.  
Constraint followed: audit only. No app code changes. No EAS build.

## 1. Executive Summary

Iron Logic is much stronger than a demo app now. The core workout flow, set logging, active workout persistence, hybrid set ranges, post-workout review, goal-aware progression throttle, rep range occupancy, training-gap adjustments, personalised volume learning, block lanes, programme-cycle behaviour, and exercise taxonomy all have real production paths and meaningful test coverage.

The biggest release risk is not the basic workout flow. The risk is product truthfulness around advanced coaching claims. The app has strong proxies for autoregulation, but Phase 2B is not complete in the real-world sense:

- Power work is lane-aware, but the app does not truly know rep speed or crispness.
- Pain, limitations, equipment unavailability, dislikes, and temporary skips are not structured user signals.
- Event/taper planning uses real dates and block sequencing, but it is still broad rather than a true event-prep engine.
- Fatigue is used across recommendations, but exercise, muscle, and systemic fatigue are not cleanly separated everywhere.
- Preference learning exists in pieces, but repeated user swaps/rejections do not yet become a coherent preference model.

Build recommendation: suitable for internal beta / physical QA if the beta promise is framed honestly. I would not present it as fully Phase 2B-complete until pain/unavailable handling and power-quality wording/logic are tightened.

## 2. What Is Working Well

### Core Workout Data Integrity

Issue: active workout state, logged sets, edits, cancellation, and completion are now handled through persistent workout session paths rather than local screen-only state.  
Why it matters: this is the highest-risk real-gym area. Losing a workout mid-session destroys trust immediately.  
Affected files/flows: `src/features/workout-logging/use-workout-logger.ts`, `src/data/local/workout-session-repository.ts`, `app/(protected)/(tabs)/train.tsx`, `tests/active-workout-persistence.test.ts`, `tests/session-editing.test.ts`.  
Recommended fix: keep this covered in every pre-build smoke test; no immediate architecture change recommended.  
Priority: working.  
Risk/complexity: low current risk, high impact if regressed.

### Warm-Up Exclusion

Issue: warm-ups are separated from productive work via `getWorkSets` / `getWarmupSets`.  
Why it matters: warm-ups contaminating progression, volume, load recommendations, or workout completion would corrupt the entire training system.  
Affected files/flows: `src/domain/training/workout-sets.ts`, `src/domain/training/workout-history.ts`, `src/domain/training/post-workout-review.ts`, `app/(protected)/(tabs)/train.tsx`, `tests/session-editing.test.ts`, `tests/post-workout-review.test.ts`.  
Recommended fix: keep new analytics/features using `getWorkSets`; avoid ad hoc `sets.length` for coaching decisions.  
Priority: working.  
Risk/complexity: medium regression risk because many features touch set counts.

### Hybrid Set-Range Architecture

Issue: the app now supports `requiredSets + recommendedMinSets/recommendedMaxSets + softCapSets`.  
Why it matters: this makes “3 required · target 3-5 · soft cap 8” truthful instead of pretending a required count is a range.  
Affected files/flows: `src/domain/training/set-prescription.ts`, `src/domain/training/models.ts`, `src/domain/training/volume-adjustments.ts`, `app/(protected)/(tabs)/train.tsx`.  
Recommended fix: continue migrating any older wording from “sets required” to “target productive range” where appropriate.  
Priority: working.  
Risk/complexity: medium, because old `requiredWorkSets` compatibility remains necessary.

### Programme-Cycle Truthfulness

Issue: recommended 12-month plans now create goal-specific 48-52 week macrocycles, single-block mode honours selected blocks, and event plans use target dates.  
Why it matters: this fixes a major product-promise issue.  
Affected files/flows: `src/domain/training/plan-setup.ts`, `src/domain/training/recommendation-actions.ts`, `src/domain/training/home-dashboard.ts`, `src/domain/training/plan-page-view-model.ts`, `app/(protected)/onboarding.tsx`, `app/(protected)/(tabs)/programmes.tsx`, `docs/training-cycle-audit.md`, `tests/product-flow-architecture.test.ts`, `tests/plan-page-view-model.test.ts`.  
Recommended fix: keep custom sequence hidden until a real builder exists.  
Priority: working.  
Risk/complexity: medium, due to block transition and old-plan compatibility.

### Progression Throttle And Rep Range Occupancy

Issue: progression is no longer simply “hit target, add load.” It can push, hold, or pull back using goal, experience, fatigue, training lane, training gap, and rep-range occupancy.  
Why it matters: this is aligned with Iron Logic’s core philosophy: performance-based autoregulation without RPE/RIR.  
Affected files/flows: `src/domain/training/progression-throttle.ts`, `src/domain/training/rep-range-occupancy.ts`, `src/domain/training/load-selection.ts`, `src/domain/training/post-workout-review.ts`, `tests/progression-throttle.test.ts`, `tests/rep-range-occupancy.test.ts`.  
Recommended fix: add more fixture coverage for edge cases with conflicting signals, especially “strong reps but high systemic fatigue.”  
Priority: working.  
Risk/complexity: medium, because recommendation correctness depends on many inputs.

### Post-Workout Review And Approval

Issue: next-session load changes are staged for approval rather than silently applied.  
Why it matters: this prevents the app from feeling like it rewrites the programme behind the user’s back.  
Affected files/flows: `src/domain/training/post-workout-review.ts`, `src/domain/training/workout-history.ts`, `app/(protected)/(tabs)/train.tsx`, `tests/post-workout-review.test.ts`.  
Recommended fix: keep approval state visible in history/evidence so users can understand why a future load changed.  
Priority: working.  
Risk/complexity: medium.

### Exercise Library And Primary Lift Variation Coverage

Issue: canonical Deadlift, primary lift variation trees, and the expanded exercise library are structured rather than random.  
Why it matters: generation, swaps, same-family estimates, strength variations, and volume learning all depend on clean taxonomy.  
Affected files/flows: `src/domain/training/presets.ts`, `src/domain/training/exercise-library.ts`, `src/domain/training/primary-lift-variations.ts`, `src/domain/training/exercise-selection.ts`, `src/domain/training/exercise-swaps.ts`, `tests/exercise-taxonomy.test.ts`, `tests/primary-lift-variations.test.ts`, `tests/exercise-library.test.ts`.  
Recommended fix: keep taxonomy tests mandatory whenever the library changes.  
Priority: working.  
Risk/complexity: medium, because taxonomy drift can quietly poison recommendations.

## 3. Critical Issues

No confirmed critical data-loss or workout-blocking issue was found in this static audit. The app has production-path tests for the previous critical bugs: active workout persistence, warm-up load contamination, edit-set refresh, in-session escalation application, and post-workout completion.

The closest critical risk is product-claim accuracy: if beta copy or onboarding implies true power-speed detection or pain-aware exercise decisions, the current implementation does not support that claim.

### Power Quality Is Not Truly Measured

Issue: power blocks and power lanes exist, but the app does not know whether reps are fast, crisp, slow, or grindy. It infers quality from proxies such as rep completion, fatigue, lane constraints, and drop-off.  
Why it matters: “Power” programming can be prescribed, but the app cannot validate the central quality of power work: speed.  
Affected files/flows: `src/domain/training/block-training-lanes.ts`, `src/domain/training/progression-throttle.ts`, `src/domain/training/ad-hoc-workout-generator.ts`, `app/(protected)/(tabs)/programmes.tsx`, Training System Guide copy.  
Recommended fix: before broader beta, either soften copy to “power intent / speed-focused prescriptions” or implement a minimal Power Quality Model using objective proxies first.  
Priority: critical if power/athletic performance is a headline beta promise; otherwise high.  
Risk/complexity: medium.

## 4. High-Priority Issues

### Missing Pain / Limitation / Unavailable Exercise System

Issue: users can swap/remove exercises, but there is no structured reason model for pain, machine unavailable, equipment unavailable, dislike, temporary skip, or “do not show this soon.”  
Why it matters: in real gyms, unavailable equipment and pain/limitations are common. Without reason capture, the app may interpret a swap as generic preference or may suggest the same bad option again.  
Affected files/flows: Add Exercise, Swap Exercise, exercise rotation recommendations, `src/domain/training/exercise-swaps.ts`, `src/domain/training/recommendation-actions.ts`, `src/domain/training/exercise-selection.ts`, `app/(protected)/(tabs)/train.tsx`, `app/(protected)/(tabs)/analytics.tsx`.  
Recommended fix: add a low-friction reason sheet for swap/remove/skip: `unavailable_now`, `equipment_not_available`, `pain_or_limitation`, `dislike`, `temporary_skip`, `prefer_other`. Persist it separately from performance failure. Pain copy should say stop and choose another movement, not diagnose.  
Priority: high.  
Risk/complexity: medium.

### Preference Learning Is Fragmented

Issue: the app stores some replacement, suppression, primary variation, and volume-adjustment decisions, but it does not yet learn repeated manual swaps/rejections as a coherent preference model.  
Why it matters: a beta user who repeatedly swaps out the same exercise expects the app to stop serving it.  
Affected files/flows: `src/domain/training/recommendation-actions.ts`, `src/domain/training/exercise-selection.ts`, `src/domain/training/exercise-swaps.ts`, `app/(protected)/(tabs)/train.tsx`, Progress rotation actions.  
Recommended fix: create a small preference memory layer: exercise avoided count, preferred replacement, last rejected, temporary/permanent status, and context. Use it during generation and recommended swaps with user approval.  
Priority: high.  
Risk/complexity: medium.

### Event / Taper Engine Is Real But Basic

Issue: event-date planning uses actual weeks and can include peak/deload blocks, but it does not yet manage a detailed event countdown, readiness markers, sport-specific taper, or last-week fatigue profile.  
Why it matters: Prepare For Event implies more than a shorter block sequence. The current system is truthful as a broad planner, but not as a complete event-prep coach.  
Affected files/flows: `src/domain/training/plan-setup.ts`, `src/domain/training/success-model.ts`, `src/domain/training/block-training-lanes.ts`, Home/Plan event context.  
Recommended fix: add an event countdown/taper profile layer: weeks-to-event, taper start, volume/intensity caps, novelty suppression, readiness note, and post-event reset path.  
Priority: high for event beta users; medium for general hypertrophy/strength beta.  
Risk/complexity: medium-high.

### Fatigue Signals Are Not Fully Separated

Issue: fatigue is used in deloads, progression throttle, personalised volume, and strategic coaching, but it is not consistently separated into exercise fatigue, muscle fatigue, and systemic fatigue.  
Why it matters: the right fix depends on the fatigue source. Bench decline, chest volume overload, and overall life/training fatigue should not always produce the same recommendation.  
Affected files/flows: `src/domain/training/progression-throttle.ts`, `src/domain/training/personalised-volume.ts`, `src/domain/training/strategic-coaching.ts`, `src/domain/training/deload-prescription.ts`, Progress/Home recommendations.  
Recommended fix: create a fatigue-classification layer that returns `exercise_specific`, `muscle_local`, `systemic`, or `mixed` with evidence. Feed it into deload, volume, rotation, and progression recommendations.  
Priority: high.  
Risk/complexity: medium-high.

### In-Session Escalation Applies Exercise-Level Load State, Not Row-Level Future Prescriptions

Issue: `applyInSessionEscalationToFuturePrescription` updates the target exercise’s `load` and `loadKnown` rather than explicit future set rows, because future rows are rendered from exercise state rather than stored as discrete planned set rows. Tests protect completed logged sets, but the model is still coarse.  
Why it matters: the behaviour is acceptable today, but the mental model “only future rows changed” is UI-derived rather than backed by explicit future-row state. This could become fragile as set-row logic grows.  
Affected files/flows: `src/domain/training/in-session-escalation.ts`, `app/(protected)/(tabs)/train.tsx`, `tests/in-session-escalation.test.ts`.  
Recommended fix: if future row prescriptions become more complex, introduce explicit uncompleted set prescription state per exercise. Until then, keep tests around completed row immutability.  
Priority: high architecture watch item, not current blocker.  
Risk/complexity: medium.

### Capacity Focus Is Partially Implemented

Issue: Low Back capacity is implemented; hips, ankles, shoulders, and neck are marked Coming later.  
Why it matters: this is currently honest, but it remains a visible partial system.  
Affected files/flows: `src/domain/training/capacity-focus.ts`, `app/(protected)/capacity-focus.tsx`, Settings capacity toggles.  
Recommended fix: either keep future areas clearly disabled/coming later, or implement one area at a time with tests and safe copy.  
Priority: high if Capacity Focus is part of beta positioning; medium otherwise.  
Risk/complexity: medium.

## 5. Medium-Priority Issues

### Power Exercises Can Be Prescribed Better Than They Can Be Evaluated

Issue: power exercises are correctly lane-tagged and filtered, but quality evaluation remains rep/load based.  
Why it matters: a user can grind a “power” set and the app may not know it was no longer power work unless reps drop or fatigue signals accumulate.  
Affected files/flows: `src/domain/training/block-training-lanes.ts`, `src/domain/training/progression-throttle.ts`, `src/domain/training/rest-timer.ts`, `src/domain/training/ad-hoc-workout-generator.ts`.  
Recommended fix: add a conservative rule that power-lane progression requires low reps, no missed work, stable set-to-set output, and no shutdown/drop-off. Add optional later quality tap only if it avoids RPE/RIR creep.  
Priority: medium-high.  
Risk/complexity: medium.

### Expanded Equipment Taxonomy Is Still Coarse

Issue: equipment categories are limited to `barbell`, `dumbbell`, `machine`, `cable`, `smith`, `bodyweight`, `bands`, and `other`. Specialty bars, chains, boards, med balls, boxes, trap bars, racks, benches, and platforms are often represented by `other` or broad equipment.  
Why it matters: equipment filtering can be truthful at a broad level but not precise enough for real gym constraints.  
Affected files/flows: `src/domain/training/models.ts`, `src/domain/training/presets.ts`, `src/domain/training/primary-lift-variations.ts`, onboarding equipment settings, Library filters.  
Recommended fix: add second-level equipment tags while preserving current top-level equipment filters. Example: `specialty_bar`, `chains`, `boards`, `trap_bar`, `medicine_ball`, `box`, `rack`.  
Priority: medium.  
Risk/complexity: medium.

### Same-Family Load Estimates Are Broad

Issue: same-family estimates use exercise similarity and recent history, but the larger exercise library includes variations where load transfer can differ sharply.  
Why it matters: Floor Press, Board Press, Deficit Deadlift, Trap Bar Deadlift, and machine variations can have very different loading relationships despite family overlap.  
Affected files/flows: `src/domain/training/load-selection.ts`, `src/domain/training/presets.ts`, `src/domain/training/primary-lift-variations.ts`.  
Recommended fix: add per-variation estimate modifiers or confidence penalties for high-specificity / low-specificity transfers.  
Priority: medium.  
Risk/complexity: medium.

### Plan Roadmap Density

Issue: real 48-52 week plans can create long roadmap lists. The Plan screen is truthful, but long macrocycles can be a lot to scan on mobile.  
Why it matters: the user needs clarity without feeling buried in block cards.  
Affected files/flows: `app/(protected)/(tabs)/programmes.tsx`, `src/domain/training/plan-page-view-model.ts`.  
Recommended fix: add a compact “current phase / next phase / full roadmap” hierarchy later. No training logic change needed.  
Priority: medium.  
Risk/complexity: low-medium.

### Training System Guide Is Useful But Not Everywhere

Issue: guide access exists on Home and Plan, which meets the current requirement, but users may want it when confused in Train or Progress.  
Why it matters: the guide explains set ranges, autoregulation, deloads, and volume learning exactly when users encounter them.  
Affected files/flows: `src/ui/training-system-guide.tsx`, `src/ui/training-system-guide-content.ts`, Home, Plan, Train, Progress.  
Recommended fix: after beta, consider adding the help icon to Train and Progress headers if it does not clutter the screen.  
Priority: medium-low.  
Risk/complexity: low.

### Current Settings Remain Summary-Oriented

Issue: Settings shows plan and training preferences, but full plan-type migration after onboarding is not a complete polished flow.  
Why it matters: beta users may change goals or programme type after setup and expect the plan to regenerate safely.  
Affected files/flows: `app/(protected)/settings.tsx`, `app/(protected)/onboarding.tsx`, `src/domain/training/plan-setup.ts`.  
Recommended fix: design a safe “change plan” flow that explains what happens to active workouts, completed history, and current block state.  
Priority: medium.  
Risk/complexity: medium-high.

### Require Cycle Warning

Issue: previous simulator output reported a require cycle around `planned-workout.ts -> training-session-selection.ts -> planned-workout.ts`.  
Why it matters: it is not necessarily breaking, but require cycles can create undefined imports when modules grow.  
Affected files/flows: `src/domain/training/planned-workout.ts`, `src/domain/training/training-session-selection.ts`.  
Recommended fix: extract shared display/session helpers into a third module.  
Priority: medium-low.  
Risk/complexity: low.

## 6. Low-Priority Polish

### Dense Recommendation Surfaces

Issue: Home and Progress can show coach note, extra work warning, volume warning, evidence, block state, and weekly actions close together.  
Why it matters: the content is valuable, but gym use rewards fast scanning.  
Affected files/flows: Home, Progress, `src/domain/training/home-dashboard.ts`, `src/domain/training/progress-dashboard.ts`, `app/(protected)/(tabs)/index.tsx`, `app/(protected)/(tabs)/analytics.tsx`.  
Recommended fix: keep only one high-priority coach action prominent; collapse supporting evidence by default.  
Priority: low-medium.  
Risk/complexity: low.

### Extra Session Modal Still Has Several Choices

Issue: extra session creation is powerful but may feel decision-heavy in the gym.  
Why it matters: extra sessions should be useful, not a mini programme builder.  
Affected files/flows: `app/(protected)/(tabs)/index.tsx`, `src/domain/training/extra-session-generator.ts`.  
Recommended fix: default to the most likely extra mode and keep advanced choices secondary.  
Priority: low.  
Risk/complexity: low.

### Copy Tone Is Mostly Good, But Some Technical Surfaces Still Read Dense

Issue: training system guide and block explanations are clearer than before, but Progress evidence and Plan detail sections can still feel technical.  
Why it matters: Iron Logic’s best copy is punchy and coach-like; evidence should support, not overwhelm.  
Affected files/flows: Progress evidence drawers, Plan block explanations, Training System Guide, Workout Review.  
Recommended fix: keep evidence factual, but move equations/proxy details behind disclosure.  
Priority: low.  
Risk/complexity: low.

## 7. Phase 2B Remaining Work

### 1. Power Quality Model

Issue: missing true power-quality detection. Current system uses power lanes, lower rep ranges, fatigue constraints, and “move fast” copy, but no velocity or crispness signal.  
Why it matters: power work should stop when quality drops, not merely when reps drop.  
Affected files/flows: `src/domain/training/block-training-lanes.ts`, `src/domain/training/progression-throttle.ts`, `src/domain/training/ad-hoc-workout-generator.ts`, Train power sessions, Progress recommendations.  
Recommended fix: smallest useful implementation is a pure `power-quality.ts` model using objective proxies first:

- power-lane only
- completed reps vs target
- set-to-set rep stability
- missed set count
- shutdown/drop-off history
- no warm-ups
- no RPE/RIR
- output: `sharp`, `acceptable`, `degrading`, `insufficient_data`

Later optional enhancement: a one-tap “speed stayed sharp / slowed down” flag, but only if it is clearly not RPE/RIR and not required for normal training.

Priority: high.  
Risk/complexity: medium.

### 2. Pain / Limitation / Unavailable Exercise System

Issue: missing structured user reasons for pain, equipment unavailable, machine unavailable, dislike, preference, or temporary skip.  
Why it matters: without context, the app can mistake a constraint for performance failure or keep recommending the same unusable movement.  
Affected files/flows: Swap Exercise, Add Exercise, exercise rotation, exercise selection, recommendation actions.  
Recommended fix: add reason capture on swap/remove/skip, persist it, and feed it into future generation and swap ranking. Pain should be safety-routed and not counted as a training failure.  
Priority: high.  
Risk/complexity: medium.

### 3. Event / Taper Engine

Issue: event-date planning is date-aware but not a detailed taper/readiness system.  
Why it matters: “Prepare For Event” should make late-stage decisions differently, especially around fatigue, novelty, and volume.  
Affected files/flows: `src/domain/training/plan-setup.ts`, `src/domain/training/success-model.ts`, `src/domain/training/block-training-lanes.ts`, Home/Plan event displays.  
Recommended fix: add event countdown state and taper profiles:

- 8+ weeks out: normal block flow
- 4-8 weeks: specificity bias
- 2-3 weeks: volume reduction and novelty suppression
- final week: readiness/taper rules

Priority: high for event users.  
Risk/complexity: medium-high.

### 4. Fatigue Separation

Issue: fatigue exists, but the system does not consistently distinguish exercise-specific, muscle-local, and systemic fatigue.  
Why it matters: recommendations become more precise when the app knows whether to rotate an exercise, lower muscle volume, or deload globally.  
Affected files/flows: Progress, Home, deload recommendations, personalised volume, progression throttle, exercise rotation.  
Recommended fix: add `fatigue-classifier.ts`:

- exercise fatigue: repeated decline for one lift
- muscle fatigue: high-cost volume trend for one muscle
- systemic fatigue: multiple muscles/exercises declining, high extra workload, readiness drop
- mixed: multiple concurrent causes

Priority: high.  
Risk/complexity: medium-high.

### 5. Preference Learning

Issue: user approvals/rejections are stored in some places, but repeated manual behaviour is not yet learned as a preference model.  
Why it matters: beta users expect the app to stop suggesting exercises they consistently avoid.  
Affected files/flows: Add Exercise, Swap Exercise, Progress rotation actions, future workout generation.  
Recommended fix: add lightweight preference memory:

- exercise disliked/avoided count
- preferred replacement
- reason and context
- temporary vs persistent
- decay/cooldown
- apply to future recommendations only, with evidence

Priority: high-medium.  
Risk/complexity: medium.

## 8. Recommended Implementation Order

1. Power copy and Power Quality proxy
   - First, prevent misleading claims.
   - Then add the smallest objective power-quality model.

2. Pain / unavailable / preference reason capture
   - Add reason sheet to swap/remove/skip.
   - Persist reasons without treating them as performance failures.

3. Fatigue separation layer
   - Classify exercise, muscle, systemic, and mixed fatigue.
   - Feed existing deload, volume, rotation, and progression systems.

4. Preference learning
   - Use repeated swap/rejection behaviour to adjust future exercise selection.
   - Keep manual user approval for major changes.

5. Event/taper engine
   - Add countdown and taper profiles.
   - Suppress novelty and aggressive volume near event.

6. Equipment taxonomy refinement
   - Add second-level equipment tags for specialty gear.
   - Keep current top-level equipment filters for compatibility.

7. UI polish pass
   - Reduce dense recommendation surfaces.
   - Improve Plan roadmap scanning.
   - Consider Training System Guide access from Train and Progress.

## 9. Build / No-Build Recommendation

Recommendation: do not call this “Phase 2B complete” yet.

For internal physical QA, a fresh preview build is reasonable if the known limitations are accepted and the beta audience is testing core workout flow, programme flow, and recommendation usability.

For a serious beta marketed around advanced coaching intelligence, hold the build until at least these are addressed:

1. Power Quality Model or softened power claims.
2. Pain/unavailable/preference reason capture.
3. Clear event/taper limitation copy or a minimal taper engine.

No EAS build was started during this audit.
