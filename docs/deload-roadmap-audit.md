# Deload Roadmap Audit

## Executive summary

The `Recommended 12-month plan` system is not uniformly broken, but there is a real product/state mismatch around `Powerlifting Meet`.

For normal non-meet goals, `createActiveTrainingPlan()` builds real annual macrocycles:

- Build Muscle: 51 weeks
- Build Strength: 51 weeks
- Build Muscle & Strength: 50 weeks
- Get Leaner: 50 weeks
- Athletic Performance: 52 weeks

The observed display:

- `Week 1 of 6`
- `25 weeks out`

is consistent with a date-driven meet plan, not a full annual plan. The `25 weeks out` copy comes from event countdown display logic, and a target date around 25 weeks away produces a 25-week Powerlifting Meet sequence.

Root issue: `Powerlifting Meet` is forced into event-date planning in the active plan resolver and onboarding flow. That is coherent if the user chose a meet-date plan, but misleading if the product still presents the result as `Recommended 12-month plan`.

Deload behaviour is currently hybrid:

- Scheduled deload blocks exist inside annual macrocycles.
- Evidence-gated reactive deload recommendations also exist.
- Progression throttle, fatigue separation, volume learning, power quality, recovery/capacity, and taper logic all suppress aggressive training before a deload is necessarily required.

Recommendation: keep planned recovery points in the roadmap, but frame them as adaptive `Recovery windows`, not mandatory calendar deload rituals. Reactive deloads should remain evidence-gated and can still interrupt the roadmap when fatigue clearly demands it.

Implementation update:

- User-facing planned deload blocks are now labelled `Recovery Window`.
- Internal block type can remain `deload` for compatibility.
- Event-date plans are labelled as event/date plans, while explicitly requested annual plans keep annual duration.

## 1. Roadmap duration trace

### Active plan source

Primary active plan state comes from:

- `src/data/local/active-training-plan-repository.ts`
- key: `iron-logic.active-training-plan`
- default: `createRecommendedAnnualPlan()`

The active plan object contains:

- `mode`
- `goal`
- `blocks`
- `activeBlockId`
- `targetDate`
- `eventType`

Plan and Home now prefer this active plan over the older `TrainingYear` fallback.

Production consumers:

- Home: `app/(protected)/(tabs)/index.tsx`
- Home view model: `src/domain/training/home-dashboard.ts`
- Plan: `app/(protected)/(tabs)/programmes.tsx`
- Plan view model: `src/domain/training/plan-page-view-model.ts`

### Roadmap generation

New active plans are created by:

- `src/domain/training/plan-setup.ts`
- `createActiveTrainingPlan()`
- `resolveBlockPlanSpecs()`

Relevant resolver logic:

```ts
if (input.planningChoice === "single_block") return [singleBlockSpec(...)]
if (input.planningChoice === "custom_sequence" && input.customBlockTypes?.length) ...
if (input.planningChoice === "custom_date_event" || goal === "powerlifting_meet") {
  return eventBlockSpecs(...)
}
return annualMacrocycleForGoal(goal)
```

That third condition is the critical one. Any plan with `goal === "powerlifting_meet"` uses `eventBlockSpecs()`, even if the incoming `planningChoice` says `recommended_12_month`.

### Display path

Plan page summary uses:

- `buildPlanPageViewModel()`
- `summary.week`

It displays:

```ts
`${activeBlock.currentWeek} of ${activeBlock.durationWeeks}`
```

If `activePlan.targetDate` exists, it appends:

```ts
`${weeksUntilEvent} weeks out`
```

Home uses the same idea in:

- `src/domain/training/home-dashboard.ts`
- `currentBlock.contextLabel`

So `Week 1 of 6` means:

> Week 1 of the current block, whose duration is 6 weeks.

It does not mean:

> Week 1 of the full annual plan.

`25 weeks out` means:

> The active plan has a target date approximately 25 weeks away.

It is event countdown context, not annual roadmap duration.

## 2. Real duration vs displayed duration

### Normal annual goals

For `recommended_12_month`, non-meet goals use `annualMacrocycleForGoal()`.

| Goal | Current annual duration | Source |
| --- | ---: | --- |
| Build Muscle | 51 weeks | `annualMacrocycleForGoal("build_muscle")` |
| Build Strength | 51 weeks | `annualMacrocycleForGoal("build_strength")` |
| Build Muscle & Strength | 50 weeks | fallback annual macrocycle |
| Get Leaner | 50 weeks | `annualMacrocycleForGoal("get_leaner")` |
| Athletic Performance | 52 weeks | `annualMacrocycleForGoal("athletic_performance")` |

These are valid 12-month-style plans.

### Powerlifting Meet

Powerlifting Meet is different.

There is a 48-week Powerlifting Meet branch inside `annualMacrocycleForGoal("powerlifting_meet")`, but the resolver does not normally reach it because `goal === "powerlifting_meet"` is routed to `eventBlockSpecs()` first.

With a target date about 25 weeks away, event planning returns roughly:

- Powerbuilding: 6 weeks
- Strength: about 14 weeks
- Peak: 4 weeks
- Deload/taper: 1 week

Total: about 25 weeks.

That matches the observed `25 weeks out`.

### Is display wrong or planning wrong?

The display is mostly truthful to the active plan it receives.

The planning/state can be wrong or misleading if the user believes they are on a `Recommended 12-month plan`.

There are two possible states:

1. If the active plan mode is `custom_date_event`, then the 25-week display is correct. The plan is an event runway, not a 12-month plan.
2. If the active plan mode/name is `recommended_12_month` but the goal is `powerlifting_meet` with a target date, then the data is contradictory. The resolver produces an event-length plan while the product label promises a 12-month plan.

Onboarding currently reinforces the event path:

- Selecting `Powerlifting Meet` sets `planningChoice` to `custom_date_event`.
- The event date step is included whenever `setupGoal === "powerlifting_meet"`.
- `effectivePlanningChoice` becomes `custom_date_event` for Powerlifting Meet.

That means normal onboarding should create a `Powerlifting Meet Plan`, not a true 12-month plan, for that goal.

The risk is product expectation: users can see `Recommended 12-month plan` as a general plan option, then select Powerlifting Meet and end up in a countdown plan. That is not fake logic, but it needs clearer copy and/or stricter state separation.

## 3. Deload philosophy audit

### Are deload blocks mandatory?

In annual macrocycles, deload blocks are planned blocks in the sequence.

They are not automatically forced the moment a calendar date arrives. The user reaches the end of a block, then Plan/Home surfaces a block decision.

Relevant paths:

- `completeCurrentPlanWeek()` increments the active block week.
- When the active block is at its duration, it records a `blockDecision` state.
- `getBlockTransitionPreview()` marks block transition as available.
- `advanceActivePlanBlock()` moves to the next planned block.

If the next planned block is Deload, then choosing `Move to next block` enters Deload.

So scheduled deloads are structurally part of the roadmap, but the app still requires a block transition action.

### Are deload blocks entered automatically?

Not directly from weekly completion.

`completeCurrentPlanWeek()` does not automatically set the next block active. It advances the week inside the active block and records that a decision is due when the block reaches its endpoint.

Entering the next block happens through:

- `advanceActivePlanBlock()`
- `chooseNextSingleBlock()` for single-block mode
- `startDeloadPlan()` for reactive/evidence-gated deloads

### Can fatigue or performance trigger additional deloads?

Yes.

Reactive deload paths exist in:

- `src/domain/training/annual-planner.ts`
  - `detectBestSetDrop()`
  - `detectQualitySetCollapse()`
  - `detectRepeatedEarlyDropOffs()`
  - `detectWorseningPerformanceTrend()`
  - `recommendBlockAction()`
- `src/domain/training/strategic-coaching.ts`
  - `recommendStrategicAction()`
- `src/domain/training/deload-prescription.ts`
  - `resolveDeloadPrescription()`
  - `hasDeloadEvidence()`
- `src/domain/training/progress-dashboard.ts`
  - deload action flow
- `src/domain/training/recommendation-actions.ts`
  - `startDeloadPlan()`
  - `ignoreDeloadPlan()`

Reactive deload recommendations are evidence-gated. They require repeated completed-session evidence, not one bad workout.

When accepted, `startDeloadPlan()` makes a Deload block active and preserves the existing plan around it.

### Can users skip planned deloads?

Partially.

At a block transition, users can:

- Move to next block
- Repeat current block
- Decide later

For single-block mode, users can choose a different next block.

For annual mode, there is no explicit `Skip planned deload` action. If the next block is Deload, `Move to next block` enters it. A user can avoid it by repeating the current block or deciding later, but they cannot cleanly skip over a scheduled Deload into the following block from the normal UI.

### Does progression throttle already provide enough protection?

It provides meaningful protection, but not enough to remove recovery planning entirely.

Existing protective systems include:

- Progression throttle: push, hold, or pull back.
- Deload suppression: active deload prevents aggressive push.
- Fatigue separation: exercise-specific, muscle-local, systemic, or mixed.
- Power quality: power only pushes when quality is sharp.
- Training gap adjustment: re-entry suppresses aggressive loading.
- Personalised volume learning: lowers or holds volume when cost rises.
- Recovery/capacity: can recommend recovery work or hold cardio/lifting stress.
- Event taper: suppresses novelty, volume additions, and aggressive progression late.

These systems reduce bad day-to-day decisions. They do not fully replace planned recovery windows because block-to-block fatigue can accumulate even when no single workout screams for a deload.

## 4. Current deload model classification

The current system is hybrid.

Scheduled:

- Annual macrocycles include planned Deload blocks.
- Event plans often include late Deload/taper blocks.
- Deload has dedicated templates and lower productive-set targets.

Reactive:

- Progress can recommend deload from fatigue/readiness evidence.
- Reactive deloads use mild, clear, or severe profiles.
- Users can start or ignore a deload recommendation.

Adaptive protections:

- Progression throttle and related systems can hold/pull back before a full deload.
- Volume and fatigue systems can reduce local stress instead of forcing a global recovery week.

The product docs sometimes say deloads are recommendation-led rather than calendar rituals. That is philosophically correct for reactive deloads, but annual macrocycles now also contain planned Deload blocks. The wording should be tightened so it does not contradict the actual roadmap.

## 5. Recommendation

### Recommended roadmap model

Use planned `Recovery windows`, not hard mandatory `Deload blocks`, in long roadmaps.

Practical structure:

- Keep recovery windows after major accumulation/intensification phases.
- Let the app decide at the transition whether the window should be:
  - a true deload,
  - a lighter consolidation week,
  - a normal transition into the next block,
  - or skipped because performance/recovery evidence is strong.
- Keep reactive deloads available at any time when fatigue evidence is strong.

### Why not remove scheduled deloads entirely?

No scheduled recovery points would over-trust short-term autoregulation.

The current app is good at saying:

- do not push this lift today,
- reduce this muscle's volume,
- hold progression,
- avoid aggressive cardio,
- taper near an event.

But a 48-52 week plan still benefits from planned places to reduce accumulated stress, review performance, and change emphasis without pretending the user is invincible.

### Why not keep mandatory Deload blocks exactly as-is?

Mandatory calendar deloads can be too blunt.

If a user is progressing, sleeping well enough, not shutting down early, and not showing systemic fatigue, forcing a full deload can feel like the app is ignoring its own evidence model.

The product promise is adaptive coaching. A scheduled recovery point is good coaching. A forced deload regardless of evidence is less aligned with the current system.

### Best coaching rationale

Adaptive Strength Coach should communicate:

> Main training blocks build the adaptation. Recovery windows keep the next block trainable. If your data says you need a real deload, the app will call it. If you are still moving well, the window can stay lighter and productive instead of becoming a ritual timeout.

That fits the current architecture better than either extreme.

## 6. Recommended fixes, not implemented

### Fix 1: Separate Powerlifting Meet plan modes

Decision needed:

- `Powerlifting Meet + meet date` should clearly be an event-date plan.
- `Powerlifting Meet + recommended annual` should either:
  - create the 48-week powerlifting annual branch, or
  - be hidden as an option because meet prep requires a date.

Current risk:

- The resolver has a 48-week Powerlifting Meet annual branch that is effectively unreachable through normal planning because `goal === "powerlifting_meet"` routes to event planning first.

Recommended implementation:

- Change `resolveBlockPlanSpecs()` so `goal === "powerlifting_meet"` only routes to `eventBlockSpecs()` when `planningChoice === "custom_date_event"` or a target date is explicitly part of the mode.
- Or remove annual Powerlifting Meet as a possible product promise and make the UI say `Powerlifting meet date` only.

### Fix 2: Add total plan duration display

Current `Week 1 of 6` is technically correct but incomplete.

Recommended copy:

- Current block: `Hypertrophy · Week 1 of 6`
- Plan: `Week 1 of 50`
- Event: `25 weeks out`

This prevents users from reading block duration as full roadmap duration.

### Fix 3: Rename scheduled Deload blocks in annual roadmap

Recommended labels:

- `Recovery`
- `Recovery Week`
- `Deload / Recovery`

If the app still uses `deload` internally, that is fine. User-facing annual roadmap copy should avoid implying every planned recovery point is a mandatory hard deload.

### Fix 4: Add skip/convert choice for planned recovery windows

At transition into a scheduled Deload/Recovery window, offer:

- Run recovery week
- Start next block
- Repeat current block
- Decide later

Gate the stronger options with evidence:

- If systemic fatigue is high, make recovery the primary recommendation.
- If fatigue is low and performance is rising, allow transition without guilt.

## 7. Build/no-build recommendation

No build should be started from this audit alone.

Build readiness depends on product decision:

- If the current simulator state is a `Powerlifting Meet` event-date plan, the 25-week display is expected and not a build blocker.
- If the app displays `Recommended 12-month plan` while actually creating a 25-week Powerlifting Meet event plan, that is a product truthfulness bug and should be fixed before a preview build.

Recommended next step before build:

1. Decide whether Powerlifting Meet supports a true annual option.
2. Clarify block-week versus full-plan-week display.
3. Reframe scheduled roadmap deloads as adaptive recovery windows.
