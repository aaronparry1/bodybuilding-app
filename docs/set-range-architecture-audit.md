# Set-Range Architecture Audit

Status: implemented decision document  
Scope: architecture decision and implementation reference  
Decision: Iron Logic now uses a hybrid set-range model while keeping `requiredWorkSets` as a backwards-compatible legacy field.

## Executive Summary

Iron Logic does not currently have a single canonical exercise-level set range such as `3-5 sets`.

The production model has two parallel ideas:

1. `requiredWorkSets`
   - This is stored on the exercise progression settings.
   - It is the real driver for completion, progression gates, workout review, generated workouts, and several tests.

2. Productive set guidance
   - This is computed from block, exercise role, exercise family, muscle group, and deload state.
   - It produces `targetMin`, `targetMax`, `softCap`, and optional `hardCap`.
   - It is mostly a coaching/presentation layer, not the stored programme prescription.

So when the UI says something like `3-5 productive sets`, the app is not currently storing that as a true editable range on the workout slot. It is showing a computed target range while the underlying plan slot still has a single required set count.

This matters because the personalised volume ladder currently applies:

- `raise_range` as `requiredWorkSets + 1`
- `lower_range` as `requiredWorkSets - 1`

That is not the same thing as changing `3-5` to `4-6` or `3-5` to `2-4`.

Implemented recommendation: adopt a hybrid architecture:

`requiredSets + recommendedRange + softCap`

This keeps current completion/progression behaviour stable while giving the volume system real range semantics.

Implementation note:

- New settings can carry `requiredSets`, `recommendedMinSets`, `recommendedMaxSets`, and `softCapSets`.
- Legacy settings with only `requiredWorkSets` are mapped safely at read time.
- `requiredWorkSets` is still mirrored to `requiredSets` for compatibility with older records and persisted sessions.
- The central helper lives in `src/domain/training/set-prescription.ts`.

## Part 1 - Current Set Architecture

### Core Data Model

Production files:

- `src/domain/training/models.ts`
- `src/domain/training/presets.ts`
- `src/domain/training/set-prescription.ts`

`ProgressionSettings` currently stores:

- `repRange`
- `dropOffPercent`
- `loadIncrease`
- `unit`
- `requiredWorkSets`

It does not store:

- `minimumSets`
- `targetSets`
- `targetMin`
- `targetMax`
- `recommendedRange`
- `softCap`

Current conclusion after implementation:

- `requiredSets` is the canonical completion floor when present.
- `recommendedMinSets` and `recommendedMaxSets` are the canonical productive range when present.
- `softCapSets` is the canonical guardrail when present.
- `requiredWorkSets` remains as legacy compatibility and is mirrored when writing new hybrid settings.

### Planned Workouts

Production files:

- `src/domain/training/plan-setup.ts`
- `src/domain/training/planned-workout.ts`
- `src/domain/training/volume-adjustments.ts`
- `src/domain/training/models.ts`

Where set targets are stored:

- Planned exercise slots carry `settings.requiredWorkSets`.

Whether min/max ranges exist:

- Not on the planned exercise slot.

Whether `requiredWorkSets` is the real driver:

- Yes.

Whether soft cap is separate:

- Yes. It is resolved later through productive-set guidance.

Whether current UI is presenting a true range or approximation:

- Approximation/coaching range. The stored plan does not own a real range.

Implementation update:

- Approved volume ladder actions no longer mutate `requiredWorkSets` for `raise_range` and `lower_range`.
- `raise_range` shifts the recommended range, for example `3-5 -> 4-6`.
- `lower_range` shifts the recommended range, for example `3-5 -> 2-4`, and can lower the required floor when the recommended minimum drops.

### Generated Workouts

Production files:

- `src/domain/training/ad-hoc-workout-generator.ts`
- `src/domain/training/extra-session-generator.ts`
- `src/domain/training/session-builder.ts`

Where set targets are stored:

- Generated template slots now resolve to hybrid `ProgressionSettings` with `requiredSets`, `recommendedMinSets`, `recommendedMaxSets`, and `softCapSets`.
- Extra sessions now use the same hybrid settings helper.
- `requiredWorkSets` is still written for compatibility.

Whether min/max ranges exist:

- Not in the generated slot output.

Whether `requiredWorkSets` is the real driver:

- Yes.

Whether soft cap is separate:

- Yes.

Whether current UI is presenting a true range or approximation:

- Approximation. Generated workouts may appear range-based in the UI, but generation produces a single required count.

### Active Workouts

Production files:

- `src/domain/training/session-builder.ts`
- `src/features/workout-logging/use-workout-logger.ts`
- `app/(protected)/(tabs)/train.tsx`

Where set targets are stored:

- Active workout exercises carry `WorkoutExerciseLog.settings`.
- New active workouts include hybrid set fields.
- Existing active workouts that only have `requiredWorkSets` are mapped at read time.

Whether min/max ranges exist:

- Not in active workout state.

Whether `requiredWorkSets` is the real driver:

- Yes for completion.
- Yes for progression gates.

Whether soft cap is separate:

- Yes. The Train screen computes productive set guidance from current block/exercise metadata.

Whether current UI is presenting a true range or approximation:

- Approximation. The overview card uses `productiveGuidance.target.targetMin-targetMax`, but active workout state still stores only `requiredWorkSets`.

Important Train screen behavior after implementation:

- `buildOverviewSetRows(...)` renders work rows from `recommendedMinSets` and `recommendedMaxSets` through the set-prescription helper.
- Workout completion uses `requiredSets`.
- Warm-ups still do not count.

### Progression

Production files:

- `src/domain/training/progression-engine.ts`
- `src/domain/training/load-selection.ts`
- `src/domain/training/progression-throttle.ts`
- `src/features/workout-logging/use-workout-logger.ts`

Where set targets are stored:

- Progression receives `settings` and resolves `requiredSets` through `getRequiredSets(...)`.

Whether min/max ranges exist:

- Not in the progression engine.

Whether `requiredWorkSets` is the real driver:

- Yes.

Current rule:

`earnedLoadIncrease(...)` requires:

- no shutdown/drop-off stop
- best set reaches the top of the rep range
- acceptable work sets are at least `requiredSets`

Training implication:

- Load progression is gated by the required count, not by completing the visible upper end of a range.

### Shutdown / Drop-Off

Production files:

- `src/domain/training/progression-engine.ts`
- `src/features/workout-logging/use-workout-logger.ts`

Where set targets are stored:

- Shutdown logic uses reps and drop-off percentage.

Whether min/max ranges exist:

- No.

Whether `requiredWorkSets` is the real driver:

- Not directly for shutdown itself.
- Shutdown is performance-based: once reps drop far enough from the best set, the app tells the user to stop/move on.

Whether soft cap is separate:

- Yes. Soft cap is a guardrail from productive-set guidance.

Current conclusion:

- Shutdown/drop-off is independent of a true set range.
- This is good and should remain separate.

### Volume Ladder

Production files:

- `src/domain/training/personalised-volume.ts`
- `src/domain/training/volume-adjustments.ts`
- `src/domain/training/planned-workout.ts`

Where set targets are stored:

- Approved future-session application now adjusts hybrid range fields when the action is range-based.

Whether min/max ranges exist:

- Not as persistent programme data.

Whether `requiredWorkSets` is the real driver:

- Yes.

Whether soft cap is separate:

- Yes.

Implementation update:

- `bias_high` and `bias_low` can work as coaching notes.
- `raise_range` and `lower_range` now mutate recommended range fields.
- `add_exercise` and `remove_or_swap_exercise` remain structural future-session changes.

### Workout Review

Production files:

- `src/domain/training/post-workout-review.ts`
- `app/(protected)/(tabs)/train.tsx`

Where set targets are stored:

- Review checks the hybrid required floor through `getRequiredSets(...)`.

Whether min/max ranges exist:

- No.

Whether `requiredWorkSets` is the real driver:

- Yes.

Current completion rule:

- Exercise is complete for review if work sets logged are at least `requiredSets`, or if existing status says complete/shutdown/swapped.

Training implication:

- Review can say the workout is complete even if the user did not reach the displayed upper end of the productive-set target range.

### Home

Production files:

- `src/domain/training/home-dashboard.ts`
- `app/(protected)/(tabs)/index.tsx`

Where set targets are stored:

- Home primarily uses active plan/session state and dashboard presenters.
- Planned session completion ultimately depends on active workout/session completion state, which traces back to required work sets.

Whether min/max ranges exist:

- Not as Home-owned data.

Whether `requiredWorkSets` is the real driver:

- Yes indirectly through session completion.

Whether soft cap is separate:

- Yes.

### Progress

Production files:

- `src/domain/training/progress-dashboard.ts`
- `src/domain/training/volume-landmarks.ts`
- `src/domain/training/personalised-volume.ts`
- `app/(protected)/(tabs)/analytics.tsx`
- `app/(protected)/analytics/muscles.tsx`

Where set targets are stored:

- Progress uses completed history and productive work set summaries.
- Muscle analytics can show weekly sets versus target ranges.

Whether min/max ranges exist:

- Yes for muscle-level analytics and volume landmarks.
- No as exercise-level planned set prescription.

Whether `requiredWorkSets` is the real driver:

- For completed workout cards and session status, yes indirectly.
- For muscle-volume learning, productive work sets/week are the driver.

Whether soft cap is separate:

- Yes.

Current conclusion:

- Progress is closer to a true volume-range system at the muscle level.
- Train/planned workout prescriptions are still single-count at the exercise level.

## Part 2 - Current User Experience

If a workout says:

`3-5 productive sets`

what actually happens today?

### Is 3 mandatory?

Usually, yes in practical terms.

The app's completion/progression model uses `requiredSets`. If legacy data only has `requiredWorkSets = 3`, the helper maps that to `requiredSets = 3`. Three logged work sets are the required amount for that exercise to count as complete.

Warm-ups do not count.

### Is 5 the target?

Only as coaching guidance.

The visible `3-5` or `4-6` comes from productive-set guidance. It tells the user where useful work normally lives for that block and exercise type, but it is not stored as the exercise's canonical range.

### Is 5 optional?

Yes.

The user can keep logging beyond the required count if performance still supports it and rows are available. But the system does not currently require the user to reach the upper end of the displayed range.

### How is the user encouraged to stop?

The user is encouraged to stop through:

- shutdown/drop-off logic when reps fall too far
- soft-cap coaching when productive sets reach the cap
- exercise status/completion once required work sets are logged

### What happens if the user continues?

Additional work sets can be logged.

Those sets can still count as real productive work if they meet the quality rules. They can affect history, fatigue, progress metrics, next-session recommendations, and personalised volume learning.

### How does shutdown interact?

Shutdown is performance-based.

If the user's reps drop far enough from the best set, the app tells the user to stop/move on. This can happen before or after the displayed target range depending on actual logged performance.

### How does soft cap interact?

Soft cap is a safety ceiling, not the normal target.

Example:

- Productive target: `4-6`
- Soft cap: `8`

That means:

- `4-6` is the useful target zone.
- `8` is where the app starts saying most lifters should move on.
- The soft cap should not become the normal goal.

## Part 3 - Architecture Options

### Option A - Keep Current Model

Model:

`requiredWorkSets + computed productive target + softCap`

Example:

- Stored: `requiredWorkSets = 3`
- Computed guidance: `3-5 productive sets`
- Computed soft cap: `8`

Pros:

- Lowest implementation risk.
- Existing tests and production logic already match it.
- Completion and progression rules are simple.
- Shutdown/drop-off remains clean and performance-based.
- Good for conservative tactical logging.

Cons:

- `3-5 sets` is not a true programme range.
- `raise_range` and `lower_range` are not honest range changes.
- Volume ladder actions become blunt: `3 -> 4`, not `3-5 -> 4-6`.
- The UI can imply more nuance than the data model actually owns.
- Future programming will keep fighting this mismatch.

Limitations:

- Personalised volume learning cannot safely express gradual range changes.
- Users may wonder why the workout is "complete" at 3 sets when the card showed `3-5`.
- Product copy has to work around the model instead of describing it naturally.

### Option B - Introduce True Set Ranges

Model:

`minimumSets + targetRange + softCap`

Example:

- Minimum: `3`
- Target range: `3-5`
- Soft cap: `8`

Pros:

- Cleanest programming semantics.
- `raise_range` can honestly mean `3-5 -> 4-6`.
- `lower_range` can honestly mean `3-5 -> 2-4`.
- Better fit for hypertrophy and volume learning.
- Makes set prescription easier to explain.

Cons:

- Higher migration risk.
- Requires careful decisions about workout completion:
  - complete at minimum?
  - complete at target minimum?
  - complete at target max?
- Could destabilise progression if every engine suddenly needs range awareness.
- UI would need stronger distinction between required, recommended, and optional work.

Migration complexity:

- Medium-high.
- Existing workouts, history, tests, generators, review logic, and volume adjustments all assume `requiredWorkSets`.

### Option C - Hybrid Model

Model:

`requiredSets + recommendedRange + softCap`

Example:

- Required: `3`
- Recommended: `3-5`
- Soft cap: `8`

Pros:

- Preserves existing completion/progression behavior.
- Adds real range semantics for volume learning.
- Lets the UI tell the truth:
  - "3 required"
  - "Aim 3-5"
  - "Cap around 8 if performance stays strong"
- Lets `bias_high` and `bias_low` work without changing required sets.
- Lets `raise_range` and `lower_range` modify the recommendation range instead of the required floor.
- Lower risk than Option B.

Cons:

- Slightly more complex than either pure model.
- Requires disciplined copy so users understand required versus recommended.
- Some product decisions remain:
  - Should green Complete Workout require required sets only?
  - Should review celebrate reaching recommended range separately?
  - Should load progression require required sets or target-min sets?

Migration complexity:

- Medium.
- Existing `requiredWorkSets` can map directly to `requiredSets`.
- Recommended ranges can be derived from productive-set guidance until persisted.

## Part 4 - Impact on Personalised Volume Learning

### Current Model

Under the current model:

- `bias_high` works as a note.
- `bias_low` works as a note.
- `raise_range` changes `requiredWorkSets + 1`.
- `lower_range` changes `requiredWorkSets - 1`.
- `add_exercise` adds a low-fatigue accessory.
- `remove_or_swap_exercise` removes or swaps a low-priority accessory.

Example:

- Before: `requiredWorkSets = 3`
- After `raise_range`: `requiredWorkSets = 4`

This is not really:

- `3-5 -> 4-6`

It is:

- required work increased from 3 to 4

That is more aggressive than the volume ladder intends.

### True Range Model

Under a true range model:

- `bias_high`: keep `3-5`, coach toward 5.
- `bias_low`: keep `3-5`, coach toward 3.
- `raise_range`: change `3-5 -> 4-6`.
- `lower_range`: change `3-5 -> 2-4`.
- `add_exercise`: add a low-fatigue slot only after range changes are not enough.
- `remove_or_swap_exercise`: remove/swap only after lower range is not enough.

This is ideal for hypertrophy and volume learning, but it creates larger migration and completion-rule questions.

### Hybrid Model

Under a hybrid model:

- `requiredSets`: protects the minimum needed to count the exercise as complete.
- `recommendedRange`: carries the volume-learning prescription.
- `softCap`: remains the upper guardrail.

Example:

Original limitation before implementation:

- Required: `3`
- Recommended: `3-5`
- Soft cap: `8`

After `bias_high`:

- Required: `3`
- Recommended: `3-5`
- Coaching: "Aim for the top of the range if performance holds."

After `raise_range` now:

- Required: `3`
- Recommended: `4-6`
- Soft cap: still a guardrail, not the target

After `bias_low`:

- Required: `3`
- Recommended: `3-5`
- Coaching: "Stay near the low end this week."

After `lower_range` now:

- Required: `2` when the recommended minimum drops to 2
- Recommended: `2-4`

Best fit by goal:

- Hypertrophy: hybrid works well because volume can move gradually without forcing every set.
- Strength: hybrid protects minimum compound exposure without chasing junk volume.
- Powerbuilding: hybrid balances main lift requirements with muscle-building range work.
- Athletic performance: hybrid allows low recommended ranges and early fatigue caution while preserving quality exposures.

## Part 5 - Recommendation

Recommend Option C: hybrid model.

### Why This Is Best

Iron Logic already has strong tactical logic built around `requiredWorkSets`.

Changing everything to true ranges immediately would be expensive and risky. Keeping the current model would leave the personalised volume ladder semantically wrong.

The hybrid model solves the core problem without destabilising the app:

- `requiredSets` remains the completion/progression floor.
- `recommendedRange` becomes the honest set-range prescription.
- `softCap` remains the safety ceiling.

### What Users Would Experience

The user should not see a confusing programming lecture.

Plain-English experience:

- "Do at least 3 strong work sets."
- "Aim for 3-5 if performance holds."
- "Move on if reps drop."
- "The app will warn you before this turns into junk volume."

Possible compact UI copy:

`3 required · aim 3-5`

With details:

`Soft cap: 8 productive sets. That is a ceiling, not a target.`

### What Future Volume Learning Would Look Like

Volume ladder actions become honest:

- `bias_high`: no set-range mutation; coach toward high end.
- `bias_low`: no set-range mutation; coach toward low end.
- `raise_range`: `3-5 -> 4-6`.
- `lower_range`: `3-5 -> 2-4`.
- `add_exercise`: add a low-fatigue accessory after range changes are not enough.
- `remove_or_swap_exercise`: remove/swap after lower range is not enough.

### Progression Throttle Impact

Load progression should continue to respect performance, not just volume.

Recommended default:

- Required sets remain the minimum gate for load progression.
- Progression throttle can use recommended-range completion as extra evidence, not as a hard requirement.
- For strength main lifts, strong performance across required sets may be enough to push.
- For hypertrophy/accessory work, hitting the upper range with low fatigue is stronger evidence than merely completing required sets.

This fits the Push / Hold / Pull Back model:

- Push: required work completed, top-range reps earned, fatigue acceptable.
- Hold: load earned technically, but volume/fatigue cost is rising.
- Pull back: repeated decline or high cost.

### Shutdown / Drop-Off Impact

Shutdown should remain separate.

It should not become a range-completion rule.

The user may be inside, below, or above the recommended range. If performance drops enough, the app should still say to move on.

### Soft Cap Impact

Soft cap should remain a guardrail.

It should not be treated as:

- the target
- the normal max
- a volume-learning destination

If the user repeatedly reaches soft cap with low fatigue, the app should consider:

- raising the recommended range slightly
- adding a low-fatigue accessory

If the user reaches soft cap with fatigue rising, the app should hold or reduce.

### Future Programming Impact

The hybrid model gives Iron Logic a cleaner programming language:

- Exercise prescriptions have a minimum and recommendation.
- Muscle-volume learning changes recommendations first.
- Structural changes happen only after repeated evidence.
- Completion can remain simple and reliable.
- Review can distinguish "minimum done" from "full target nailed."

## Part 6 - Implementation Plan If Approved

Do not implement in this audit pass.

### Phase 1 - Data Model

Add a set prescription model.

Suggested shape:

```ts
export interface SetPrescription {
  requiredSets: number;
  recommendedMin: number;
  recommendedMax: number;
  softCap: number;
  hardCap?: number;
  source: "generated" | "productive_target" | "volume_adjustment" | "legacy";
  coachingIntent?: "bias_high" | "bias_low";
  volumeAdjustmentId?: string;
}
```

Compatibility:

- Keep `requiredWorkSets` during migration.
- New code reads `setPrescription.requiredSets ?? requiredWorkSets`.
- Old history remains readable.

Risk:

- Low-medium if added as optional and read through helpers.

### Phase 2 - Workout Generation

Update generation so every planned slot receives:

- required sets
- recommended min/max
- soft cap

Sources:

- current block
- exercise role
- family
- muscle group
- experience level
- goal
- deload state
- approved volume adjustments

Risk:

- Medium.

### Phase 3 - Active Workout Behaviour

Update active workout behavior to use set prescription helpers.

Rules:

- Completion uses `requiredSets`.
- Visible row generation uses `recommendedRange`.
- Soft cap remains a guardrail.
- Shutdown/drop-off remains performance-based.
- Warm-ups remain excluded.

Risk:

- Medium, because Train is the highest-touch screen.

### Phase 4 - Volume Ladder Integration

Change volume adjustment application:

- `bias_high`: set coaching intent only.
- `bias_low`: set coaching intent only.
- `raise_range`: increase `recommendedMin` and `recommendedMax`.
- `lower_range`: decrease `recommendedMin` and `recommendedMax`.
- `add_exercise`: add accessory after range escalation is already tried.
- `remove_or_swap_exercise`: remove/swap accessory after lower range is already tried.

Policy decision needed:

- Should `raise_range` also increase `requiredSets`?

Recommended default:

- No for first implementation.
- Keep required sets stable unless repeated evidence supports changing the floor.

Risk:

- Medium.

### Phase 5 - Migration

Migration rules:

- Existing `requiredWorkSets` maps to `requiredSets`.
- Recommended range can be derived from productive-set target tables.
- If metadata is missing, fallback to:
  - `recommendedMin = requiredWorkSets`
  - `recommendedMax = requiredWorkSets + 2`
  - soft cap from productive-set target if available, otherwise `requiredWorkSets + 4`

Old completed workouts:

- Do not mutate.
- Interpret using legacy fields for history.

Risk:

- Medium-high if persisted storage needs a formal migration.
- Medium if handled lazily at read time.

### Phase 6 - UI Updates

Train overview:

- Replace ambiguous copy like `3-5 productive sets` with clearer compact copy.

Recommended:

- `3 required · aim 3-5`

Details:

- Explain soft cap behind Info/Why.

Workout Review:

- Show:
  - required work completed
  - recommended target reached if applicable
  - soft cap warning if applicable

Progress:

- Volume recommendations should reference range actions accurately:
  - "Aim high"
  - "Start one set higher"
  - "Pull one set from accessories"

Risk:

- Low-medium.

## Risk, Complexity, Compatibility

### Risk

Overall risk: medium.

Highest-risk areas:

- Train row rendering
- workout completion copy
- volume adjustment application
- persisted active workout compatibility

Lower-risk areas:

- docs
- Progress evidence copy
- presenter helpers
- optional data model fields

### Complexity

Overall complexity: medium.

This is not a rewrite, but it touches the architecture spine:

- programme generation
- active workout presentation
- completion helpers
- volume adjustments
- post-workout review

### Compatibility

Compatibility can be good if implemented as hybrid and staged.

Recommended compatibility strategy:

- Keep `requiredWorkSets` as legacy.
- Add `setPrescription` optional.
- Use central helpers:
  - `getRequiredSets(settings)`
  - `getRecommendedSetRange(settings, metadata)`
  - `getSoftCap(settings, metadata)`
- Migrate writes first, then reads, then UI copy.

## Final Decision Recommendation

Adopt the hybrid architecture:

`requiredSets + recommendedRange + softCap`

Do not keep pretending `requiredWorkSets + softCap` is a true range.

Do not jump straight to a pure true-range model unless the product is ready to revisit workout completion, progression gates, and UI language all at once.

The hybrid model gives Iron Logic the best balance:

- stable workout completion
- honest set-range presentation
- better personalised volume learning
- safer future progression throttle
- clean user-facing language
- lower migration risk

Recommended next implementation phase:

1. Add optional set prescription model and helper accessors.
2. Populate set prescriptions in generated/planned workouts.
3. Update Train to render recommended ranges from the new prescription.
4. Change volume ladder `raise_range` and `lower_range` to mutate recommended ranges, not `requiredWorkSets`.
5. Keep completion/progression gates on required sets until there is enough product evidence to change them.
