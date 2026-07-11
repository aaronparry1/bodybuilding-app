# Block Planning Audit

Audit date: 2026-06-17

Scope: production block-planning paths in `src/domain/training/plan-setup.ts`, block definitions in `src/domain/training/annual-planner.ts`, event timing in `src/domain/training/event-taper.ts`, roadmap display in `src/domain/training/plan-page-view-model.ts` and `src/domain/training/block-display.ts`, and relevant tests.

No code changes were made.

## Executive Summary

Adaptive Strength Coach block planning is structured and goal-specific. It is not random. Recommended plans are generated from explicit goal-specific macrocycle templates, while Powerlifting Meet date plans are generated from event countdown logic.

The strongest area is goal differentiation. Build Muscle, Build Strength, Build Muscle & Strength, Get Leaner, Athletic Performance, and Powerlifting Meet each produce a different annual block sequence, with different first blocks, different Recovery Window placement, and different emphasis on hypertrophy, strength, power, and peak work.

The weakest area is that block planning is not deeply personalised at initial plan creation. Experience level, days per week, equipment, and recovery/cardio preference meaningfully affect workout generation and recovery/cardio behaviour, but they do not currently change the macrocycle block sequence or block durations. That means a beginner and advanced lifter who choose the same goal and planning mode receive the same block roadmap, with personalisation occurring inside the blocks rather than at the macrocycle level.

Final verdict: **B) minor refinements**. The current block planning is defensible enough to ship, but future refinements should make experience level, schedule, and programme length influence the roadmap more directly.

## Block Planning Logic

### Production Decision Chain

The current active-plan creation path is:

1. Onboarding collects goal, planning choice, target date if relevant, equipment, days per week, split, experience level, recovery/cardio preference, and rotation frequency.
2. `createActiveTrainingPlan()` normalises legacy goals.
3. `resolveBlockPlanSpecs()` chooses the block plan:
   - `single_block` creates one block from the chosen block or goal default.
   - `custom_sequence` creates the requested block list.
   - `custom_date_event` uses event/date planning.
   - otherwise, `recommended_12_month` uses `annualMacrocycleForGoal(goal)`.
4. `createTrainingBlock()` applies block defaults: duration, rep ranges, volume/intensity emphasis, drop-off rule, progression type, and week focuses.
5. Plan display maps internal `deload` blocks to user-facing `Recovery Window`.

### Planning Modes

Recommended 12-month plan:

- Uses a goal-specific sequence from `annualMacrocycleForGoal()`.
- Current annual durations are 48-52 weeks depending on goal.
- Despite the name, it is not a single repeated generic block cycle.

Single Block:

- Uses one block only.
- The app does not invent future blocks.
- Default single-block fallback by goal:
  - Build Strength -> Strength
  - Build Muscle & Strength -> Powerbuilding
  - Athletic Performance -> Power
  - Powerlifting Meet -> Strength
  - Build Muscle / Get Leaner -> Hypertrophy

Powerlifting Meet Date Plan:

- Onboarding forces Powerlifting Meet into `custom_date_event`.
- The event runway is calculated from `targetDate`.
- Short runways peak/taper quickly.
- Longer runways use Powerbuilding -> Strength -> Peak -> Recovery Window.

Custom Sequence:

- Uses explicitly provided block types.
- Each block gets its default duration unless richer custom duration support is added later.

### Block Defaults

| Block | Default duration | Intent | Volume | Intensity | Progression style |
| --- | ---: | --- | --- | --- | --- |
| Hypertrophy | 6 weeks | Build muscle and work capacity | High | Moderate | Double progression |
| Powerbuilding | 6 weeks | Bridge hypertrophy and strength | Moderate-high | Moderate-high | Double progression |
| Strength | 6 weeks | Increase force production | Moderate | High | Load progression |
| Power | 3 weeks | Rate of force development | Low | High | Speed intent |
| Peak | 2 weeks | Express strength | Very low | Very high | Test expression |
| Deload / Recovery Window | 1 week | Restore performance | Low | Low-moderate | Fatigue reduction |

Goal-specific annual plans override these defaults with per-block durations.

## Goal-By-Goal Findings

## Build Muscle

Sequence:

`Hypertrophy 8 -> Powerbuilding 6 -> Recovery Window 1 -> Hypertrophy 8 -> Hypertrophy 6 -> Recovery Window 1 -> Strength 4 -> Hypertrophy 6 -> Recovery Window 1 -> Power 3 -> Hypertrophy 6 -> Recovery Window 1`

Total: 51 weeks.

Why it starts with Hypertrophy:

- This matches the goal directly: high recoverable volume, muscle coverage, and work capacity.
- The first block being 8 weeks gives enough time for a muscle-first accumulation phase before changing emphasis.

Why each next block follows:

- Powerbuilding after the first hypertrophy block keeps load progression alive and prevents the plan from becoming pure pump work.
- Recovery Window after 14 weeks is sensible as a planned consolidation point.
- The middle of the year returns to hypertrophy-heavy work, which matches the goal.
- A short Strength block gives force-production support without hijacking the goal.
- A brief Power block is used as an output/speed exposure, not a dominant goal.
- The year ends with more Hypertrophy and a Recovery Window.

Recovery Window placement:

- Four 1-week windows across 51 weeks.
- They appear after longer accumulation or mixed phases.
- Placement is defensible for a muscle-first plan.

Repetition risk:

- Moderate. The plan uses three Hypertrophy blocks plus one extra Hypertrophy after Strength.
- This matches the goal, but users may perceive repeated Hypertrophy labels as repetitive unless Plan copy explains that exercise selection, volume, and target zones still evolve inside blocks.

Coach verdict:

- Defensible. A hypertrophy coach would understand the sequence.
- The Strength and Power inclusions are support phases rather than variety for its own sake.

Score: 8/10.

## Build Strength

Sequence:

`Hypertrophy 6 -> Powerbuilding 6 -> Recovery Window 1 -> Strength 6 -> Strength 6 -> Recovery Window 1 -> Power 4 -> Strength 5 -> Recovery Window 1 -> Peak 3 -> Recovery Window 1 -> Powerbuilding 4 -> Strength 6 -> Recovery Window 1`

Total: 51 weeks.

Why it starts with Hypertrophy:

- This is a base-building choice: tissue tolerance, muscle cross-sectional support, and work capacity before heavier phases.
- It is defensible for general strength, especially natural lifters and low-history users.

Why each next block follows:

- Powerbuilding bridges base work into heavier strength exposure.
- Two consecutive Strength blocks create the main force-production development phase.
- Power after Strength is sensible for speed/intent and neural output.
- A later Strength block restores specificity before Peak.
- Peak expresses strength after enough base and specific work.
- Later Powerbuilding/Strength recycles the development cycle after peak/recovery.

Recovery Window placement:

- Five 1-week windows across 51 weeks.
- They appear after base/build, after two Strength blocks, after Power/Strength, after Peak, and at the end.
- This is conservative but sensible for strength.

Repetition risk:

- Low to moderate. Strength appears multiple times, but the sequencing alternates with Power, Peak, and Powerbuilding.

Coach verdict:

- Strong. A strength coach would recognise base -> bridge -> intensify -> express -> recover.
- The first Hypertrophy block is justifiable, not random.

Score: 8.5/10.

## Build Muscle & Strength

Sequence:

`Hypertrophy 6 -> Powerbuilding 6 -> Recovery Window 1 -> Strength 5 -> Powerbuilding 6 -> Recovery Window 1 -> Hypertrophy 6 -> Strength 5 -> Recovery Window 1 -> Power 4 -> Peak 2 -> Recovery Window 1 -> Powerbuilding 6`

Total: 50 weeks.

Why it starts with Hypertrophy:

- This starts by building a muscle and volume base before heavier hybrid work.
- For a combined goal, this is reasonable because hypertrophy supports later strength progress.

Why each next block follows:

- Powerbuilding after Hypertrophy blends the two stated goals.
- Strength after Recovery Window shifts the emphasis toward force production.
- Returning to Powerbuilding keeps both qualities alive.
- A later Hypertrophy block restores muscle/volume emphasis.
- Strength -> Power -> Peak gives an output arc before recovery.
- Ending with Powerbuilding keeps the plan on-brand for the combined goal.

Recovery Window placement:

- Three planned windows across 50 weeks.
- They appear after mixed/base phases and after peak.
- Less frequent than Build Strength, which is reasonable because the plan also includes more moderate phases.

Repetition risk:

- Low. The plan alternates goals enough to feel varied without becoming chaotic.

Coach verdict:

- Very defensible. The sequence is coherent and the block mix matches the goal.

Score: 9/10.

## Get Leaner

Sequence:

`Hypertrophy 6 -> Powerbuilding 5 -> Recovery Window 1 -> Hypertrophy 6 -> Strength 4 -> Recovery Window 1 -> Powerbuilding 5 -> Hypertrophy 6 -> Recovery Window 1 -> Power 3 -> Recovery Window 1 -> Hypertrophy 6 -> Powerbuilding 4 -> Recovery Window 1`

Total: 50 weeks.

Why it starts with Hypertrophy:

- The goal is body-composition oriented without nutrition tracking. Hypertrophy-style work helps preserve muscle while leaning out.
- Starting with sustainable volume is consistent with muscle retention.

Why each next block follows:

- Powerbuilding keeps strength exposed during fat-loss-oriented training.
- Strength blocks are shorter than Build Strength, which fits the goal.
- Power exposure is brief and used to keep output sharp without chasing fatigue.
- Hypertrophy and Powerbuilding dominate, which supports muscle/strength preservation.

Recovery Window placement:

- Five planned windows across 50 weeks.
- More frequent than Build Muscle & Strength.
- This matches the goal's fatigue-management promise.

Repetition risk:

- Moderate. Hypertrophy and Powerbuilding recur frequently.
- That is defensible because the goal prioritises sustainable muscle/strength preservation, not novelty.

Does it preserve strength and manage fatigue?

- At block level: mostly yes.
- Strength exposure exists, Powerbuilding recurs, Power is short, and Recovery Windows are frequent.
- Recovery/cardio recommendation logic elsewhere further differentiates Get Leaner.

Weakness:

- The block sequence alone does not show calorie-deficit-specific periodisation beyond shorter Strength/Power and more Recovery Windows. The differentiation depends on recovery/cardio, progression throttling, and volume behaviour inside blocks.

Coach verdict:

- Defensible, but the plan should avoid marketing this as a fat-loss programme. It is better described as strength/muscle-preserving training while leaning out.

Score: 8/10.

## Athletic Performance

Sequence:

`Hypertrophy 6 -> Strength 5 -> Recovery Window 1 -> Power 5 -> Powerbuilding 5 -> Recovery Window 1 -> Strength 4 -> Power 5 -> Recovery Window 1 -> Peak 3 -> Recovery Window 1 -> Power 5 -> Hypertrophy 6 -> Power 4`

Total: 52 weeks.

Why it starts with Hypertrophy:

- It builds tissue tolerance and general capacity before speed and output work.
- This is defensible, especially for non-specialist users.

Why each next block follows:

- Strength after Hypertrophy builds the force base.
- Power follows Strength, which matches performance sequencing.
- Powerbuilding reintroduces muscle and strength support.
- The year repeats Strength -> Power exposures and includes a Peak.
- The final phase returns to Power after rebuilding with Hypertrophy.

Recovery Window placement:

- Four planned windows across 52 weeks.
- They appear after Strength, after mixed Powerbuilding, after Power, and after Peak.
- Reasonable for output-focused training.

Does it genuinely prioritise power/speed?

- At block level: yes. Power appears four times for a total of 19 weeks, far more than other goals.
- At workout-template level, previous audits show Power templates are now power-specific and beginner-filtered.

Repetition risk:

- Low. Repeated Power is goal-consistent.
- Not random variety.

Coach verdict:

- Stronger than earlier product versions. A performance coach would recognise base -> strength -> power cycles.
- One caveat: without sport-specific skill demands, this is general athletic power, not sport programming.

Score: 8.5/10.

## Powerlifting Meet

Annual sequence available in domain:

`Powerbuilding 6 -> Strength 5 -> Recovery Window 1 -> Powerbuilding 6 -> Strength 5 -> Recovery Window 1 -> Power 4 -> Peak 3 -> Recovery Window 1 -> Strength 5 -> Power 4 -> Recovery Window 1 -> Powerbuilding 6`

Total: 48 weeks.

Actual onboarding path:

- Selecting Powerlifting Meet forces `planningChoice` to `custom_date_event`.
- The user normally receives a date-based meet plan rather than the annual sequence.

Date-plan logic:

- 4 weeks or less: Peak block for the available runway.
- 5-8 weeks: Strength until 2 weeks out, then Peak 2.
- 9-16 weeks: Powerbuilding 5, then Strength for the remaining middle weeks, then Peak 3.
- More than 16 weeks: Powerbuilding 6, Strength for most of the runway, Peak 4, Recovery Window 1.

Why it starts with Powerbuilding:

- For meet prep, Powerbuilding is used as a base around squat, bench, and deadlift rather than pure Hypertrophy.
- This is a stronger fit than starting every meet plan with generic Hypertrophy.

Why each next block follows:

- Strength follows Powerbuilding to increase specificity.
- Peak follows Strength near the event.
- Event taper rules restrict novelty and suppress aggressive progression close to meet day.

Recovery Window placement:

- In annual Powerlifting Meet, Recovery Windows appear after base/strength phases and after Peak/Power phases.
- In date-based plans, the final 1-week Recovery Window appears after Peak for longer runways. This is slightly ambiguous: the note says fatigue reduction into the event, but the sequence order is `Peak -> Deload`, which means the Recovery Window is the final event-adjacent phase. That is acceptable if displayed as meet-week/taper recovery rather than post-peak afterthought.

Does it taper/peak correctly?

- Mostly yes.
- `event-taper.ts` defines base, build, specificity, taper, event_week, and post_event phases.
- Taper and event week suppress progression, restrict novelty, and keep intensity quality.

Weakness:

- A 17+ week meet plan makes Strength last `availableWeeks - 11`, which can be very long for far-away meets. The plan depends on internal template variation and Recovery Windows rather than splitting long strength development into named sub-phases.
- Onboarding forces Powerlifting Meet to date planning, so the 48-week annual Powerlifting Meet sequence exists but is not the normal user path.

Coach verdict:

- Defensible for a general meet-prep app.
- Strongest when the target date is known.
- Minor refinement recommended for very long meet runways.

Score: 8/10 for date-based meet planning; 7.5/10 for annual meet roadmap availability/user-path clarity.

## Length/Schedule Findings

### Programme Length

Current production behaviour:

- Recommended plans are goal-specific annual-style roadmaps of 48-52 weeks.
- Event-date plans scale to the number of weeks until the target date.
- Single-block plans are one block.
- Custom sequences use the selected blocks with default durations.

Meaningful differences:

- Yes, recommended annual plans differ from shorter plans.
- Single-block mode truly shows only one block.
- Event-date mode produces runway-specific sequencing.

Limitations:

- Recommended 12-month plans are not built from a programme-length parameter. They are fixed annual templates.
- There is no built-in 8-week, 12-week, 16-week, or 24-week non-event macrocycle variant.
- Custom sequence duration is not deeply periodised.

### Experience Level

Current block-sequence impact:

- Experience level does not currently alter block order or block duration.

Where experience matters:

- Exercise selection.
- Beginner filtering.
- Power exercise suitability.
- Set prescriptions and trimming.
- Progression/recovery assumptions in other systems.

Assessment:

- Sensible for safety inside blocks.
- Macrocycle personalisation is weaker than the product promise might imply.

Recommended future refinement:

- Beginners: longer base/skill phases, fewer Peak exposures, more conservative Power, more frequent transition windows if low history.
- Intermediate: current roadmap is suitable.
- Advanced: more specific Strength/Peak sequencing, less generic base, more deliberate overreach/consolidation structure.

### Days Per Week

Current block-sequence impact:

- Days per week does not alter block order or block duration.

Where days/week matters:

- Weekly split:
  - 1-3 days defaults toward Full Body.
  - 4 days defaults toward Upper/Lower.
  - 5 days defaults toward Push/Pull/Legs plus Upper/Lower.
  - 6 days defaults toward repeated Push/Pull/Legs.
- Workout generation, volume distribution, exercise count, and recovery/cardio logic use schedule context.

Assessment:

- Good enough at the weekly-workout level.
- Macrocycle-level planning could improve by placing Recovery Windows more conservatively for 5-6 day plans or extending accumulation phases for low-frequency plans.

### Recovery Window Placement

Current behaviour:

- Planned Recovery Windows are fixed inside goal-specific annual templates.
- Reactive Recovery Windows can still be recommended from fatigue evidence.
- User-facing copy maps internal `deload` blocks to `Recovery Window`.

Assessment:

- Placement is generally sensible.
- It is hybrid: scheduled recovery opportunities plus reactive fatigue/readiness decisions.
- The number of planned windows differs by goal:
  - Build Muscle: 4
  - Build Strength: 5
  - Build Muscle & Strength: 3
  - Get Leaner: 5
  - Athletic Performance: 4
  - Powerlifting Meet annual: 3

Weakness:

- Planned Recovery Windows are not currently recalculated from days/week, experience, or early history at plan creation.

## Strongest Areas

1. Goal-specific annual sequences exist and are explicit.
2. Plans are deterministic rather than random.
3. Recovery Window user-facing framing is now aligned with product philosophy.
4. Powerlifting Meet date planning uses target-date logic and taper phases.
5. Athletic Performance has a genuinely higher Power exposure than other goals.
6. Get Leaner includes more recovery opportunities and preserves Strength/Powerbuilding exposure.
7. Single-block mode does not mislead users with invented future blocks.
8. Plan display truthfully shows actual plan duration.

## Weakest Areas

1. Experience level does not affect macrocycle block order or duration.
2. Days per week does not affect macrocycle block order, duration, or Recovery Window spacing.
3. Non-event programme length options are limited: annual, single block, or custom sequence.
4. The annual Powerlifting Meet sequence exists in domain logic but onboarding normally forces date-based planning.
5. Very long Powerlifting Meet date plans can create a long Strength middle phase rather than a more visibly phased meet prep.
6. Build Muscle has repeated Hypertrophy labels that are defensible but may look repetitive without explanatory copy.
7. Recovery Window placement is fixed at creation rather than evidence-informed from user profile.
8. Custom sequence blocks use default durations, so custom planning is block-type custom but not fully periodised.

## Answers To Audit Questions

### 1. Why does each goal start with its first block?

- Build Muscle starts with Hypertrophy because the primary goal is muscle growth and work capacity.
- Build Strength starts with Hypertrophy to build tissue and volume base before heavier work.
- Build Muscle & Strength starts with Hypertrophy as a base before Powerbuilding/Strength alternation.
- Get Leaner starts with Hypertrophy to preserve muscle while keeping training sustainable.
- Athletic Performance starts with Hypertrophy to prepare tissues before strength and power.
- Powerlifting Meet starts with Powerbuilding in the annual/domain sequence, and date-based meet plans start from the appropriate event runway phase.

### 2. Why does each next block follow?

Most sequences follow a recognisable coaching arc:

- Base or accumulation.
- Bridge or intensification.
- Specific strength/power.
- Peak where relevant.
- Recovery Window after longer or more stressful phases.

The exact order is hardcoded by goal, not dynamically generated from individual history at plan creation.

### 3. Are Recovery Windows planned sensibly?

Mostly yes.

They appear after stressful or multi-block phases. Get Leaner and Build Strength receive more frequent planned Recovery Windows, which is coherent. Reactive recovery logic can still add or recommend recovery outside planned windows.

### 4. Are plans too repetitive?

Not overall.

Build Muscle and Get Leaner are intentionally repetitive around Hypertrophy/Powerbuilding because those goals need repeated muscle-preservation or muscle-building exposure. Athletic Performance repeats Power because that is the point. The main risk is visual repetition in roadmap labels, not necessarily bad programming.

### 5. Are any blocks included just because the system needs variety?

Mostly no.

Power in Build Muscle is the closest candidate, but it is short and defensible as an output/speed exposure. Peak in Build Muscle & Strength is also defensible as expression/readiness work after Strength and Power. There is no evidence of random block insertion.

### 6. Does a 12-month plan differ meaningfully from shorter plans?

Yes.

Recommended annual plans contain 48-52 weeks of goal-specific blocks. Single Block mode contains only one block. Event-date plans scale to the event runway.

However, there are no polished non-event 8/12/16/24-week generated roadmaps yet.

### 7. Does Powerlifting Meet planning taper/peak correctly?

Mostly yes.

Date-based Powerlifting Meet planning uses event runway logic and event taper constraints. The later phases increase specificity, reduce novelty, suppress aggressive progression, and keep fatigue low.

Minor caveat: very long meet prep could be split into clearer sub-phases instead of one long Strength middle phase.

### 8. Does Get Leaner preserve strength and manage fatigue correctly?

Mostly yes.

The block sequence keeps Powerbuilding and Strength exposure, includes frequent Recovery Windows, and avoids excessive Peak emphasis. Other systems add recovery/cardio support and conservative progression bias.

Minor caveat: block labels alone do not communicate body-composition-specific intent strongly; much of the differentiation is inside recovery/progression/cardio systems.

### 9. Does Athletic Performance genuinely prioritise power/speed?

Yes at block level.

Athletic Performance includes repeated Power blocks totalling 19 weeks, plus Strength phases to support force production. That is meaningfully different from the other goals.

### 10. Would a coach understand and defend these sequences?

Generally yes.

A coach would understand the logic. The biggest coaching critique would be that the roadmap is currently template-based by goal, not adaptive to experience level, schedule, equipment, or early training history at creation time.

## Recommended Changes If Needed

These are recommendations only. No code was changed.

### Priority 1: Minor Refinement

Make experience level influence macrocycle planning:

- Beginner:
  - longer base phases
  - fewer Peak blocks unless event-specific
  - safer Power exposure
  - clearer skill/consolidation phases
- Advanced:
  - more specific Strength/Peak sequencing
  - potentially shorter generic base phases
  - more deliberate Recovery Window timing

### Priority 2: Minor Refinement

Make days/week influence Recovery Window spacing:

- 5-6 day plans can use slightly more frequent planned Recovery Windows or shorter high-stress blocks.
- 2-3 day plans may tolerate longer accumulation phases because weekly stress is lower.

### Priority 3: Minor Refinement

Improve very long Powerlifting Meet runways:

- For 20+ weeks, split the middle phase into clearer blocks such as Powerbuilding -> Strength Accumulation -> Strength Specificity -> Peak -> Recovery Window.
- Avoid a very long single Strength block.

### Priority 4: Product Copy Refinement

For repeated Hypertrophy/Powerbuilding blocks, explain that the block label can repeat while exercise selection, target zones, volume learning, and progression state continue to evolve.

### Priority 5: Future Planning Feature

Add non-event programme-length options:

- 8-week
- 12-week
- 16-week
- 24-week

These should be separate from the Recommended 12-month plan.

## Final Verdict

**B) minor refinements.**

Block planning is coherent, goal-specific, and defensible. It is not random. The main limitation is not a blocking coaching flaw; it is that initial macrocycle planning is template-driven by goal and programme mode, while personalisation from experience level, schedule, fatigue, and progression happens mostly inside the blocks and through reactive systems.

The current architecture can remain frozen for release unless product positioning promises deeply personalised macrocycle sequencing from day one. If that promise is made, minor roadmap-personalisation refinements should be added before leaning heavily on that claim.
