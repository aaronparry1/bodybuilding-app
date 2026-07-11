# Set Prescription Trace

This is a trace of current production behaviour. It is not a recommendation document.

Probe context:

- Generator path: `buildPlannedWorkoutProgramme()`
- Goal: `build_muscle`
- Planning choice: `recommended_12_month`
- Equipment: `full_gym`
- Experience: `intermediate`
- Split: `push_pull_legs`, 5 days/week for Push/Pull/Legs
- Block: `hypertrophy`
- Week: `1`
- History: empty unless explicitly marked as fatigue-history
- Date: `2026-06-08`

The probe used the same domain functions used by tests and app planned workout generation:

- `createActiveTrainingPlan()`
- `createTrainingBlock()`
- `buildPlannedWorkoutProgramme()`
- `resolveSetPrescription()`

No app code was changed.

## 1. Real workout traces

### Normal Push trace

Session: Push  
Block: Hypertrophy  
Week: 1  
History: none  
Session-level result: all exercises display `3-5` target sets.

| Exercise | Slot | Role | Lane | Template sets | Hybrid required | Final target | Soft cap | Rep range |
|---|---|---|---|---:|---:|---:|---:|---:|
| Bench Press | Primary chest compound | primary_compound | hypertrophy_strength | 3 | 3 | 3-5 | 8 | 6-10 |
| Smith Incline Press | Secondary chest press | secondary_compound | hypertrophy | 3 | 3 | 3-5 | 7 | 8-12 |
| Seated Dumbbell Press | Shoulder compound | secondary_compound | hypertrophy | 3 | 3 | 3-5 | 7 | 8-12 |
| Cable Fly | Chest isolation | isolation | hypertrophy | 3 | 3 | 3-5 | 6 | 10-20 |
| Machine Lateral Raise | Delt isolation | isolation | hypertrophy | 3 | 3 | 3-5 | 6 | 12-25 |
| Triceps Pushdown | Triceps isolation | isolation | hypertrophy | 3 | 3 | 3-5 | 8 | 12-25 |

Decision chain for Bench Press:

```text
Template: hypertrophy.push
Slot: primary(["chest"], ["horizontal_push"], "Primary chest compound")
Slot sets: 3
Exercise selected: Bench Press
Exercise role/family: primary_compound / horizontal_press
Block: hypertrophy
Lane: hypertrophy_strength
Rep resolver: 6-10
withSetPrescription: requiredSets = 3, source = generated
Hybrid resolver: recommendedMin = 3, recommendedMax = min(productive target max, 3 + 2) = 5
Lane constraints: hypertrophy_strength caps soft cap lower than pure hypertrophy only when needed; here target remains 3-5
Volume learning: none
Fatigue adjustment: none
Recovery adjustment: none
Final: required 3, target 3-5, soft cap 8
```

Decision chain for Cable Fly:

```text
Template: hypertrophy.push
Slot: isolation(["chest"], "Chest isolation")
Slot sets: 3
Exercise selected: Cable Fly
Exercise role/family: isolation / chest_isolation
Block: hypertrophy
Lane: hypertrophy
Rep resolver: 10-20
withSetPrescription: requiredSets = 3, source = generated
Hybrid resolver: recommendedMin = 3, recommendedMax = min(productive target max, 3 + 2) = 5
Lane constraints: pure hypertrophy does not change target
Volume learning: none
Fatigue adjustment: none
Recovery adjustment: none
Final: required 3, target 3-5, soft cap 6
```

Ownership for Push:

- Template owns session structure and slot set count.
- Slot owns the starting set count.
- Block owns the rep/block context.
- Lane owns the constraint/cap layer.
- Hybrid resolver owns final fallback target and soft cap if explicit fields are missing.
- Volume/fatigue own later modifications only when evidence exists.

### Normal Pull trace

Session: Pull  
Block: Hypertrophy  
Week: 1  
History: none  
Session-level result: all exercises display `3-5` target sets.

| Exercise | Slot | Role | Lane | Template sets | Hybrid required | Final target | Soft cap | Rep range |
|---|---|---|---|---:|---:|---:|---:|---:|
| Pull-Up | Primary back compound | primary_compound | hypertrophy_strength | 3 | 3 | 3-5 | 8 | 6-10 |
| Lat Pulldown Machine | Vertical pull | secondary_compound | hypertrophy | 3 | 3 | 3-5 | 7 | 8-12 |
| T-Bar Row | Horizontal row | secondary_compound | hypertrophy | 3 | 3 | 3-5 | 7 | 8-12 |
| Hammer Curl | Biceps isolation | isolation | hypertrophy | 3 | 3 | 3-5 | 8 | 12-25 |
| Face Pull | Rear-delt isolation | corrective | hypertrophy | 3 | 3 | 3-5 | 8 | 12-25 |

Decision chain for Pull-Up:

```text
Template: hypertrophy.pull
Slot: primary(["back"], ["horizontal_pull", "vertical_pull"], "Primary back compound")
Slot sets: 3
Exercise selected: Pull-Up
Exercise role/family: primary_compound / vertical_pull
Block: hypertrophy
Lane: hypertrophy_strength
Rep resolver: 6-10
withSetPrescription: requiredSets = 3, source = generated
Hybrid resolver: recommendedMin = 3, recommendedMax = 5
Lane constraints: target remains 3-5
Volume learning: none
Fatigue adjustment: none
Recovery adjustment: none
Final: required 3, target 3-5, soft cap 8
```

Decision chain for Hammer Curl:

```text
Template: hypertrophy.pull
Slot: isolation(["biceps"], "Biceps isolation")
Slot sets: 3
Exercise selected: Hammer Curl
Exercise role/family: isolation / biceps_isolation
Block: hypertrophy
Lane: hypertrophy
Rep resolver: 12-25
withSetPrescription: requiredSets = 3, source = generated
Hybrid resolver: recommendedMin = 3, recommendedMax = 5
Lane constraints: target remains 3-5
Volume learning: none
Fatigue adjustment: none
Recovery adjustment: none
Final: required 3, target 3-5, soft cap 8
```

### Normal Legs trace

Session: Legs  
Block: Hypertrophy  
Week: 1  
History: none  
Session-level result: all exercises display `3-5` target sets.

| Exercise | Slot | Role | Lane | Template sets | Hybrid required | Final target | Soft cap | Rep range |
|---|---|---|---|---:|---:|---:|---:|---:|
| Hack Squat | Primary squat pattern | primary_compound | hypertrophy_strength | 3 | 3 | 3-5 | 8 | 6-10 |
| Deficit Deadlift | Hip hinge | secondary_compound | hypertrophy | 3 | 3 | 3-5 | 7 | 8-12 |
| Single-Leg Hip Thrust | Glute-biased compound | secondary_compound | hypertrophy | 3 | 3 | 3-5 | 7 | 8-12 |
| Leg Extension | Quad isolation | isolation | hypertrophy | 3 | 3 | 3-5 | 6 | 10-20 |
| Kneeling Leg Curl | Hamstring isolation | isolation | hypertrophy | 3 | 3 | 3-5 | 6 | 10-20 |
| Seated Calf Raise | Calf isolation | isolation | hypertrophy | 3 | 3 | 3-5 | 8 | 10-25 |

Decision chain for Hack Squat:

```text
Template: hypertrophy.legs
Slot: primary(["quads"], ["squat"], "Primary squat pattern")
Slot sets: 3
Exercise selected: Hack Squat
Exercise role/family: primary_compound / squat_pattern
Block: hypertrophy
Lane: hypertrophy_strength
Rep resolver: 6-10
withSetPrescription: requiredSets = 3, source = generated
Hybrid resolver: recommendedMin = 3, recommendedMax = 5
Lane constraints: target remains 3-5
Volume learning: none
Fatigue adjustment: none
Recovery adjustment: none
Final: required 3, target 3-5, soft cap 8
```

Decision chain for Leg Extension:

```text
Template: hypertrophy.legs
Slot: isolation(["quads"], "Quad isolation")
Slot sets: 3
Exercise selected: Leg Extension
Exercise role/family: isolation / quad_isolation
Block: hypertrophy
Lane: hypertrophy
Rep resolver: 10-20
withSetPrescription: requiredSets = 3, source = generated
Hybrid resolver: recommendedMin = 3, recommendedMax = 5
Lane constraints: target remains 3-5
Volume learning: none
Fatigue adjustment: none
Recovery adjustment: none
Final: required 3, target 3-5, soft cap 6
```

### Fatigue-history Legs trace

This trace uses the same plan/block/week, but with repeated recent drop-off history. That is the production path that creates a session-wide `2-4` Legs output.

Session: Legs  
Block: Hypertrophy  
Week: 1  
History: repeated drop-off evidence  
Session-level result: all remaining exercises display `2-4` target sets.

| Exercise | Slot | Fatigue note present | Required | Final target | Soft cap |
|---|---|---:|---:|---:|---:|
| Hack Squat | Primary squat pattern | yes | 2 | 2-4 | 8 |
| Deficit Deadlift | Hip hinge | yes | 2 | 2-4 | 7 |
| Single-Leg Hip Thrust | Glute-biased compound | yes | 2 | 2-4 | 7 |
| Leg Extension | Quad isolation | yes | 2 | 2-4 | 6 |
| Kneeling Leg Curl | Hamstring isolation | yes | 2 | 2-4 | 6 |

The exact note on each slot contains:

```text
Fatigue-aware planner trimmed planned volume; logged performance still decides the final dose.
```

Decision chain:

```text
Template: hypertrophy.legs
Initial slot sets: 3
applyFatigueToTemplate:
  repeatedDropOffs >= 3
  slot.sets becomes max(2, slot.sets - 1)
  final slot is removed
Slot sets after fatigue: 2
withSetPrescription: requiredSets = 2
Hybrid resolver: recommendedMin = 2, recommendedMax = min(productive target max, 2 + 2) = 4
Lane constraints: hypertrophy/hypertrophy_strength leave target as 2-4
Volume learning: none
Recovery adjustment: none
Final: required 2, target 2-4
```

This is the only traced production path that made an entire hypertrophy Legs session become `2-4`.

### Beginner Legs trace

Beginner experience does not make the whole Legs session `2-4`.

Observed beginner Legs:

- compounds stayed `3-5`
- isolation slots became `2-4`
- exercise count was reduced

So if every Legs exercise displayed `2-4`, beginner status alone was not the source.

## 2. Source of Push/Pull/Leg differences

### Why Push became 3-5

Actual source:

- Push hypertrophy template slots default to `sets = 3`.
- No fatigue/history trimming was applied.
- No volume adjustment changed the slots.
- Hypertrophy and hypertrophy_strength lanes did not cap the target below 5.
- Hybrid resolver converted required 3 into target `3-5`.

Source layer:

```text
Template slot sets + Hybrid resolver
```

### Why Pull became 3-5

Actual source:

- Pull hypertrophy template slots default to `sets = 3`.
- No fatigue/history trimming was applied.
- No volume adjustment changed the slots.
- Hypertrophy and hypertrophy_strength lanes did not cap the target below 5.
- Hybrid resolver converted required 3 into target `3-5`.

Source layer:

```text
Template slot sets + Hybrid resolver
```

### Why Legs can become 2-4

In the normal trace, Legs did not become `2-4`; it was `3-5`.

The traced path that produces `2-4` is:

- repeated drop-off/fatigue evidence exists
- `applyFatigueToTemplate()` runs
- each slot set count is reduced from 3 to 2
- final slot is removed
- hybrid resolver converts required 2 into target `2-4`

Source layer:

```text
Fatigue adjustment before Hybrid resolver
```

Not the source:

- not a special lower-body rule
- not body-part logic
- not the hypertrophy block itself
- not the lane by itself
- not Recovery Window
- not volume learning in the traced case
- not beginner experience if all exercises are `2-4`

### Most likely explanation for the observed app state

If Push and Pull were generated earlier as `3-5`, then Legs was generated later after fatigue/drop-off history existed, the app can show:

```text
Push: 3-5
Pull: 3-5
Legs: 2-4
```

That is a timing/state effect. Planned workouts are generated from current history/state at the time they are built. The code does not contain a deliberate "Legs should be 2-4 in hypertrophy" rule.

## 3. Set ownership map

### Real authority by layer

| Layer | Affects required sets | Affects target range | Affects soft cap | Evidence |
|---|---:|---:|---:|---|
| Template family | yes | indirectly | indirectly | Template slots define `sets`. |
| Slot | yes | indirectly | indirectly | Slot set count becomes required sets. |
| Block | indirectly | yes | yes | Block passed into rep/set target context. |
| Lane | yes sometimes | yes sometimes | yes | `applyLaneSetConstraints()` caps power/peak/recovery/strength. |
| Experience level | yes | indirectly | indirectly | `setsForExperience()` changes slot set count. |
| Fatigue adjustment | yes | indirectly | indirectly | `applyFatigueToTemplate()` decrements slot sets and removes a slot. |
| Volume learning | sometimes | yes | yes | `shiftRecommendedSetRange()` changes recommended range. |
| Recovery/cardio | no direct trace | no direct trace | no direct trace | Not part of generated set prescription chain. |
| Hybrid resolver | finalizes | yes | yes | `resolveSetPrescription()` fills target/soft cap from settings/fallbacks. |

### Example ownership: Bench Press

```text
Template owns: Push session has primary chest compound slot.
Slot owns: primary chest compound starts with 3 sets.
Block owns: hypertrophy context.
Lane owns: hypertrophy_strength.
Experience owns: no change for intermediate.
Fatigue owns: no change in normal trace.
Volume learning owns: no change in normal trace.
Resolver owns: final target 3-5 and soft cap 8.
```

### Example ownership: Cable Fly

```text
Template owns: Push session has chest isolation slot.
Slot owns: isolation slot starts with 3 sets.
Block owns: hypertrophy context.
Lane owns: hypertrophy.
Experience owns: no change for intermediate.
Fatigue owns: no change in normal trace.
Volume learning owns: no change in normal trace.
Resolver owns: final target 3-5 and soft cap 6.
```

### Example ownership: Fatigue-trimmed Hack Squat

```text
Template owns: Legs session has primary squat pattern slot.
Slot starts with: 3 sets.
Fatigue adjustment owns: reduces slot sets to 2.
Block owns: hypertrophy context.
Lane owns: hypertrophy_strength but does not raise target back up.
Resolver owns: final target 2-4.
```

## 4. Session-wide consistency audit

Current architecture is:

```text
E) Mostly uniform with post-processing
```

Evidence:

- Most template helper functions default to `sets = 3`.
- Hypertrophy Push, Pull, Legs, Upper, Lower, and Full Body all mostly resolve to `3-5` under normal intermediate conditions.
- Differences appear through:
  - manually overridden slot sets
  - experience level
  - fatigue trimming
  - lane caps for power/peak/recovery/strength
  - volume learning adjustments

It is not primarily exercise-specific.

Exercise does affect:

- selected role/family
- lane resolution
- rep range
- soft cap via productive target context
- load increment

But the primary set count authority is the template slot's `sets`, not the exercise itself.

It is not purely session-specific.

Session type determines which slots exist, but Push/Pull/Legs share many `sets = 3` defaults.

It is not purely block-specific.

Block/lane constrain the output, but block alone does not explain Push/Pull `3-5` vs Legs `2-4`.

## 5. Hypertrophy trace

### Push

| Exercise | Role | Slot | Required | Target | Soft cap | Highlight |
|---|---|---|---:|---:|---:|---|
| Bench Press | primary_compound | Primary chest compound | 3 | 3-5 | 8 | compound |
| Smith Incline Press | secondary_compound | Secondary chest press | 3 | 3-5 | 7 | machine/Smith compound |
| Seated Dumbbell Press | secondary_compound | Shoulder compound | 3 | 3-5 | 7 | compound |
| Cable Fly | isolation | Chest isolation | 3 | 3-5 | 6 | isolation |
| Machine Lateral Raise | isolation | Delt isolation | 3 | 3-5 | 6 | isolation |
| Triceps Pushdown | isolation | Triceps isolation | 3 | 3-5 | 8 | isolation/small muscle |

### Pull

| Exercise | Role | Slot | Required | Target | Soft cap | Highlight |
|---|---|---|---:|---:|---:|---|
| Pull-Up | primary_compound | Primary back compound | 3 | 3-5 | 8 | compound/bodyweight |
| Lat Pulldown Machine | secondary_compound | Vertical pull | 3 | 3-5 | 7 | machine compound |
| T-Bar Row | secondary_compound | Horizontal row | 3 | 3-5 | 7 | compound |
| Hammer Curl | isolation | Biceps isolation | 3 | 3-5 | 8 | isolation/small muscle |
| Face Pull | corrective | Rear-delt isolation | 3 | 3-5 | 8 | rear delt/scapular |

### Legs

| Exercise | Role | Slot | Required | Target | Soft cap | Highlight |
|---|---|---|---:|---:|---:|---|
| Hack Squat | primary_compound | Primary squat pattern | 3 | 3-5 | 8 | compound |
| Deficit Deadlift | secondary_compound | Hip hinge | 3 | 3-5 | 7 | hinge compound |
| Single-Leg Hip Thrust | secondary_compound | Glute-biased compound | 3 | 3-5 | 7 | unilateral/glute |
| Leg Extension | isolation | Quad isolation | 3 | 3-5 | 6 | isolation |
| Kneeling Leg Curl | isolation | Hamstring isolation | 3 | 3-5 | 6 | isolation |
| Seated Calf Raise | isolation | Calf isolation | 3 | 3-5 | 8 | calves |

### Upper

| Exercise | Role | Slot | Required | Target | Soft cap | Highlight |
|---|---|---|---:|---:|---:|---|
| Bench Press | primary_compound | Primary press | 3 | 3-5 | 8 | compound |
| Barbell Row | primary_compound | Primary row | 3 | 3-5 | 8 | compound |
| Plate Loaded Shoulder Press Machine | secondary_compound | Shoulder compound | 3 | 3-5 | 7 | machine compound |
| Lat Pulldown Plate Loaded | secondary_compound | Vertical pull | 3 | 3-5 | 7 | machine compound |
| Triceps Pushdown | isolation | Triceps isolation | 3 | 3-5 | 8 | isolation |
| Preacher Curl | isolation | Biceps isolation | 3 | 3-5 | 8 | isolation |

### Lower

| Exercise | Role | Slot | Required | Target | Soft cap | Highlight |
|---|---|---|---:|---:|---:|---|
| Hack Squat | primary_compound | Primary squat pattern | 3 | 3-5 | 8 | compound |
| Snatch-Grip Deadlift | secondary_compound | Hip hinge | 3 | 3-5 | 7 | hinge compound |
| Walking Lunge | secondary_compound | Glute/leg compound | 3 | 3-5 | 7 | unilateral |
| Kneeling Leg Curl | isolation | Hamstring isolation | 3 | 3-5 | 6 | isolation |
| Seated Calf Raise | isolation | Calf isolation | 3 | 3-5 | 8 | calves |

### Full Body

| Exercise | Role | Slot | Required | Target | Soft cap | Highlight |
|---|---|---|---:|---:|---:|---|
| Hack Squat | primary_compound | Lower primary | 3 | 3-5 | 8 | compound |
| Bench Press | primary_compound | Upper push primary | 3 | 3-5 | 8 | compound |
| Barbell Row | primary_compound | Upper pull primary | 3 | 3-5 | 8 | compound |
| Deficit Deadlift | secondary_compound | Posterior-chain secondary | 3 | 3-5 | 7 | hinge compound |
| Machine Shoulder Press | secondary_compound | Shoulder secondary | 3 | 3-5 | 7 | machine compound |
| Front Plank | corrective | Core accessory | 3 | 3-5 | 8 | abs/core |

## 6. Core/trunk exposure map

### Same hypertrophy traces

| Session | Direct core appears? | Evidence |
|---|---:|---|
| Push | no | No selected exercise has `abs` or core movement pattern. |
| Pull | no | Face Pull is rear-delt/scapular, not core. |
| Legs | no | Lower-body compounds only; no direct abs/core slot. |
| Upper | no | No selected abs/core movement. |
| Lower | no | No selected abs/core movement. |
| Full Body | yes | Front Plank selected as Core accessory. |

### Is trunk/bracing exposure guaranteed?

For the traced hypertrophy week:

```text
No, unless Full Body is part of the split.
```

Push/Pull/Legs and Upper/Lower hypertrophy traces did not include direct core.

### Strength plan core trace

Strength Lower:

| Exercise | Slot | Core? |
|---|---|---:|
| Barbell Back Squat | Squat anchor | no |
| Rack Pull | Deadlift-family anchor/support | no |
| Hip Thrust Machine | Secondary lower compound | no |
| Standing Leg Curl | Hamstring and bracing support | no |

Strength Full Body:

| Exercise | Slot | Core? |
|---|---|---:|
| Barbell Back Squat | Squat/deadlift lower anchor | no |
| Bench Press | Bench press anchor | no |
| Military Press | OHP or upper-back support | no |
| Front Plank | Core support | yes |

### Powerlifting Meet core trace

Powerlifting Meet Strength Lower:

| Exercise | Slot | Core? |
|---|---|---:|
| Barbell Back Squat | Squat anchor | no |
| Block Pull | Deadlift-family anchor/support | no |
| Machine Glute Drive | Secondary lower compound | no |
| Seated Leg Curl | Hamstring and bracing support | no |

Powerlifting Meet Peak Lower:

| Exercise | Slot | Core? |
|---|---|---:|
| Barbell Back Squat | Specific squat exposure | no |
| Block Pull | Specific deadlift exposure | no |
| Standing Leg Curl | Minimal bracing/posterior-chain support | no |

Powerlifting Meet Strength Full Body:

| Exercise | Slot | Core? |
|---|---|---:|
| Barbell Back Squat | Squat/deadlift lower anchor | no |
| Bench Press | Bench press anchor | no |
| Seated Dumbbell Press | OHP or upper-back support | no |
| Front Plank | Core support | yes |

### Core conclusion

Current production behaviour:

- Full Body strength/hypertrophy can include direct core.
- Lower/Legs do not guarantee direct core.
- Some slots are labelled as bracing support but can select hamstring-only work.
- Powerlifting Meet plans do not guarantee direct trunk work in Lower sessions.
- Strength plans do not guarantee direct trunk work unless the selected split/session includes an explicit core slot.

## 7. Dependency diagram

```text
Template family
  affects:
    - which slots exist
    - initial slot set numbers
    - session exercise count

Slot
  affects:
    - slot role
    - target muscles/patterns
    - initial sets
    - selected exercise pool

Block
  affects:
    - template family
    - rep range strategy
    - productive target fallback
    - drop-off defaults

Lane
  affects:
    - set caps for power/peak/recovery/strength/support
    - final upper bounds in constrained blocks

Experience level
  affects:
    - slot count
    - required set count through setsForExperience()

Fatigue
  affects:
    - can decrement slot sets
    - can remove a slot
    - therefore changes target range indirectly

Volume learning
  affects:
    - can raise/lower recommended range
    - can add/remove accessory slots
    - does not normally change primary required sets

Hybrid resolver
  affects:
    - final required sets
    - final recommended min/max
    - final soft cap
    - final hard cap

Final prescription
  displays:
    - required sets
    - target productive set range
    - soft cap guidance
```

### What actually affects each field

| Field | Actual affecting layers |
|---|---|
| `requiredSets` | slot `sets`, experience level, fatigue trim, lane caps, volume lowering in some cases |
| `recommendedMinSets` | required sets by fallback, lane caps, volume learning |
| `recommendedMaxSets` | required sets + productive target fallback, lane caps, volume learning |
| `softCapSets` | productive target fallback, lane caps, explicit settings, volume learning preserving/raising cap |

## 8. Coaching assessment

Trace-only assessment:

- The current system is intentional in code: same-range output is expected when slots share the same initial `sets`.
- It is not exercise-specific in the primary set-count sense.
- It is not a special lower-body prescription in hypertrophy.
- The production reason an entire Legs session becomes `2-4` is fatigue-aware template trimming before the hybrid resolver.
- Push/Pull/Legs are otherwise uniform in normal first-block hypertrophy conditions.
- Soft caps still differ by role/muscle even when visible target ranges match.
- Direct core exposure is not guaranteed outside templates that explicitly include an abs/core slot.

## 9. Intentional or accidental

### Intentional current behaviour

- Hybrid set ranges are generated and stored on planned slots.
- Required sets drive completion.
- Soft cap is separate from completion.
- Lane constraints tighten power, peak, recovery, maintenance, and strength-support work.
- Fatigue can trim slot sets and remove a slot before final prescription.
- Volume learning can change recommended ranges later.

### Accidental or emergent behaviour

- Many exercises showing `3-5` is an emergent result of template helper defaults plus resolver fallback, not an individually designed prescription for each exercise.
- A slot labelled `bracing support` does not guarantee a core exercise because candidate selection can choose any exercise that touches one of the slot muscles.
- Push/Pull generated before fatigue evidence and Legs generated after fatigue evidence can produce apparently inconsistent session ranges in the same block/week.

No recommendations are included here per request.
