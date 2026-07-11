# Adaptive Strength Coach Training Cycle / Programme Type Audit

Date: 2026-06-09

Status: implemented after audit. This document now records the intended production behaviour after the programme-cycle fix.

## Executive Summary

Adaptive Strength Coach programme types are now intended to be truthful and functional:

- `Recommended 12-month plan` creates a goal-specific macrocycle of roughly 48-52 weeks.
- `Single block only` creates one selected block and lets the user choose the next block when it ends.
- `Powerlifting Meet` uses the actual meet date to size the sequence, increase specificity, and taper late.
- `custom_sequence` remains supported internally for compatibility, but is not exposed as a normal-user onboarding option until a real builder exists.

## Production Paths

Primary files:

- `src/domain/training/plan-setup.ts`
- `src/domain/training/recommendation-actions.ts`
- `src/domain/training/home-dashboard.ts`
- `src/domain/training/plan-page-view-model.ts`
- `app/(protected)/onboarding.tsx`
- `app/(protected)/(tabs)/programmes.tsx`

## 12-Month Programme

IF the user chooses `Recommended 12-month plan`  
-> the app creates a goal-specific macrocycle totaling roughly 48-52 weeks  
-> BECAUSE a 12-month plan must be a real year-long structure, not a renamed half-year cycle.

Current goal-specific intent:

- Build Muscle: hypertrophy-heavy accumulation, short strength/powerbuilding support, planned deloads.
- Build Strength: base hypertrophy, powerbuilding, strength accumulation/intensification, power/peak phases, deloads.
- Build Muscle & Strength: balanced hypertrophy, powerbuilding, strength, power, peak, and deload waves.
- Athletic Performance: support capacity, strength, power waves, readiness/peak phases, deloads.
- Powerlifting Meet: if a target date exists, meet-date logic drives the plan; otherwise a specificity/readiness-biased annual structure is used around squat, bench, and deadlift.
- Get Leaner: conservative balanced cycle with recovery/cardio support, sustainable volume, and less aggressive peak emphasis.

Checks:

- Total annual weeks should stay between 48 and 52.
- Annual structures should differ by goal.
- Deload/recovery blocks should be present.
- Home/Plan should read the actual active block and next scheduled block.

## One-Block Mode

IF the user chooses `Single block only`  
-> onboarding lets them choose Hypertrophy, Powerbuilding, Strength, Power, Peak, or Deload  
-> BECAUSE one-block mode should mean the selected block, not a hidden annual roadmap.

IF the selected block reaches its endpoint  
-> Plan shows a block decision and lets the user choose the next block, repeat the current block, or decide later  
-> BECAUSE one-block users should stay in control of the next phase.

Peak is available as a one-block choice, but the copy frames it as specific and low-volume rather than a generic default.

## Event-Date Planning

IF the user chooses an event/date plan  
-> the app calculates weeks until the target date and sizes the block sequence around that runway  
-> BECAUSE an event-date plan should not create an impossible full macrocycle when the event is soon.

Current limitations:

- This is still a broad event planner, not a full sport-specific meet-prep engine.
- Event categories are coarse.
- The final weeks bias readiness/fatigue reduction where relevant.
- Powerlifting-style events include Peak when appropriate.

## Custom Sequence

`custom_sequence` remains part of the internal type system for existing/stored plans and tests.

Normal onboarding no longer exposes "Build my own plan" because there is not yet a polished sequence builder.

IF a custom sequence already exists in data  
-> the app should still read it  
-> BECAUSE hiding a future control should not break compatibility.

## UI / UX

Home should show:

- Current block
- Week X of Y
- Next block when scheduled
- "Next block decided later" for one-block plans without a scheduled next block

Plan should show:

- Current phase
- Week X of Y
- Roadmap
- Block explanation modals
- Block transition actions at block endpoint
- Choose-next-block flow for single-block plans

## Tests To Keep

Required coverage:

- 12-month plan totals 48-52 weeks.
- 12-month plans differ by goal.
- Annual plans include deload/recovery blocks.
- Build Muscle has stronger hypertrophy emphasis.
- Build Strength has more strength/peak/specificity exposure.
- One-block mode honours selected block, including Peak.
- Single-block endpoint exposes next-block choice.
- Event-date plan changes based on available weeks.
- Custom sequence is not exposed as a normal-user onboarding option until implemented.
- Home/Plan current block, week, and next block remain correct.

## Remaining Limitations

- Event-date planning is honest but still broad.
- There is no full custom-sequence builder yet.
- Settings does not yet provide a full plan-type migration flow after onboarding.
- Goal-specific annual structures are explicit defaults; future work can make them more adaptive from long-term history.
