# Set Architecture and Core Coverage Audit

## 1. Executive summary

Adaptive Strength Coach has a real hybrid set architecture, but it is still coarse.

Current behaviour:

- Generated workout slots carry a `sets` number.
- `resolveGeneratedSettings()` turns that number into `requiredWorkSets`, `requiredSets`, `recommendedMinSets`, `recommendedMaxSets`, and `softCapSets`.
- `resolveProductiveSetTarget()` supplies block/role fallback targets.
- Training lanes then cap or tighten the result for power, peak, recovery, strength, maintenance, and strength-support lanes.
- Personalised volume can later raise/lower ranges or add/remove accessories.
- Fatigue can trim a template before the workout is built.

Why many exercises in the same session show the same set range:

Most template slots default to `sets = 3`. The set resolver then uses:

- `requiredSets = slot sets`
- `recommendedMinSets = requiredSets`
- `recommendedMaxSets = min(productive target max, requiredSets + 2)`

So a hypertrophy slot with `sets = 3` usually becomes `3-5`, regardless of whether it is a main compound, secondary compound, or isolation. That is deliberate in the current implementation and covered by tests, but it is not yet the highest-quality coaching model.

Assessment:

- The system is not broken.
- The same-looking ranges are mostly a consequence of simplified slot defaults, not UI error.
- Block-specific and lane-specific constraints are real.
- Slot-specific prescriptions exist only as a single required set number, not as a full slot matrix.
- Core/abs work exists in the library and appears in some templates, but it is not yet consistently programmed as trunk/bracing support across Legs/Lower/Strength/Powerlifting contexts.

Recommendation:

Add a proper slot prescription matrix as a future implementation:

- prescribe by block + template slot role + session type
- let main lifts, secondary lifts, unilateral work, isolation, and core have different required/range/soft-cap values
- keep lane caps as the safety layer
- add explicit core/bracing support slots for Lower/Legs/Full Body and strength/powerlifting plans

No code was changed for this audit. No EAS build was started.

## 2. Current set prescription flow

### Main files involved

- `src/domain/training/ad-hoc-workout-generator.ts`
- `src/domain/training/planned-workout.ts`
- `src/domain/training/exercise-selection.ts`
- `src/domain/training/set-prescription.ts`
- `src/domain/training/productive-set-targets.ts`
- `src/domain/training/block-training-lanes.ts`
- `src/domain/training/volume-adjustments.ts`
- `src/features/workout-logging/use-workout-logger.ts`
- `app/(protected)/(tabs)/train.tsx`

### Active planned workout path

The real planned workout path is:

1. `buildPlannedWorkoutProgramme()`
2. `workoutTypeForName()`
3. `generateWorkoutByFocus()`
4. `selectPlannedExercisesForWeek()` when a current block exists
5. `createGeneratedSlot()`
6. `resolveGeneratedSettings()`
7. `withSetPrescription()`
8. `applyLaneSetConstraints()`
9. `applyVolumeAdjustmentsToProgramme()`

This means the app is not using old static presets for normal planned generation. It is using the generated template path plus controlled planned exercise rotation.

### Where set ranges come from

In `ad-hoc-workout-generator.ts`, each template slot has:

- `role`
- target muscles
- movement patterns/families
- label
- `sets`
- reason

Helper defaults:

- `primary(...)` defaults to `sets = 3`
- `secondary(...)` defaults to `sets = 3`
- `heavyPrimary(...)` defaults to `sets = 3`
- `heavySecondary(...)` defaults to `sets = 3`
- `isolation(...)` defaults to `sets = 3`
- `power(...)` defaults to `sets = 3`
- `strength(...)` defaults to `sets = 3`

Some templates override the number, usually to `1`, `2`, or `4`.

`setsForExperience()` then modifies the slot set count:

- beginner: trims isolation by one and caps non-isolation at 3, minimum 2
- intermediate: uses slot value
- advanced: adds one set, capped by role

`withSetPrescription()` writes the hybrid fields:

- `requiredWorkSets`
- `requiredSets`
- `recommendedMinSets`
- `recommendedMaxSets`
- `softCapSets`
- `hardCapSets`
- `setRangeSource`

`resolveSetPrescription()` uses the written settings when present. If `recommendedMinSets` and `recommendedMaxSets` are missing, it falls back to productive-set targets from block/role/muscle context.

### Why ranges look the same

For generated settings, `withSetPrescription()` is called with only:

```text
requiredSets = slot sets
source = generated
```

It does not pass explicit `recommendedMinSets`, `recommendedMaxSets`, or `softCapSets`.

So the fallback logic does this:

```text
recommendedMinSets = requiredSets
recommendedMaxSets = min(productive target max, requiredSets + 2)
```

Examples:

- Hypertrophy primary slot with `sets = 3` -> usually `3-5`
- Hypertrophy secondary slot with `sets = 3` -> usually `3-5`
- Hypertrophy isolation slot with `sets = 3` -> usually `3-5`
- Hypertrophy small muscle slot with `sets = 3` -> usually `3-5`, even though the target table would allow up to 6

This explains the common visual pattern. It is not accidental UI formatting. It is a current architecture choice.

### Block and lane constraints

`applyLaneSetConstraints()` then adjusts/caps ranges:

- `power` lane:
  - required max 3
  - recommended min max 3
  - recommended max max 4
  - soft cap max 5
- `peak` lane:
  - required max 2
  - recommended min max 2
  - recommended max max 3
  - soft cap 4
- `maintenance` / `strength_support`:
  - recommended max capped around 4
  - soft cap capped around 6
- `recovery`:
  - required max 2
  - recommended 2-3
  - soft cap 4
- `strength`:
  - recommended max capped at 5
  - soft cap capped at 7

These caps are useful and aligned with block logic, but they are still broad. They do not fully distinguish a secondary compound from a core/bracing slot unless the slot's starting `sets` number differs.

### Productive target table

`productive-set-targets.ts` has a useful table by block and role group:

Hypertrophy:

- primary: target 4-6, soft cap 8
- secondary: target 3-5, soft cap 7
- isolation: target 3-5, soft cap 6
- small muscle: target 3-6, soft cap 8

Powerbuilding:

- primary: 3-5
- secondary: 3-4
- isolation/small: 2-4

Strength:

- primary: 3-5
- secondary: 2-4
- isolation/small: 2-3

Power:

- power: 4-8, soft cap 10 in the table
- primary/secondary: 3-4
- accessories: 2-3

Peak:

- primary: 1-3
- secondary/accessory: 1-2

Recovery Window:

- internally maps through deload/reduced peak-like targets and lane constraints

Important caveat:

The generated slots often write explicit required and recommendation fields before the fallback table can express all those differences. The table is strongest as fallback/guidance and soft-cap logic, not yet a full planned slot prescription matrix.

### Personalised volume interaction

`volume-adjustments.ts` can:

- add notes to aim high/low
- raise recommended set range by `+1`
- lower recommended set range by `-1`
- add a low-fatigue accessory
- remove/swap an accessory

It avoids:

- deload blocks
- aggressive peak additions
- most power-block additions
- taper/event-week additions

This is broadly correct. The risk is that if the base set architecture is too uniform, volume learning is adjusting from a blunt starting point.

### Fatigue/re-entry interaction

`applyFatigueToTemplate()` can:

- trim a slot's set count by one, minimum 2
- remove the final slot
- add a note that fatigue-aware planning trimmed volume

This explains cases where a Pull session can become shorter with `2-4` ranges. That mechanism is intentional when fatigue/drop-off evidence exists.

## 3. Current slot/template set ranges

This catalogue reflects the current template architecture in `ad-hoc-workout-generator.ts`. The visible range assumes an intermediate user and no fatigue/personalised-volume adjustment unless noted.

### Hypertrophy

| Session | Slot structure | Typical visible range | Assessment |
|---|---|---:|---|
| Push | primary chest, secondary chest, shoulder compound, chest isolation, delt isolation, triceps isolation | Mostly `3-5` | Good coverage, but compound/isolation ranges look too similar. |
| Pull | primary back, vertical pull, horizontal row, biceps isolation, rear-delt isolation | Mostly `3-5` | Balanced after biceps fix, but biceps/rear delts probably do not need same default as primary back. |
| Legs | squat, hinge, glute/lunge, quad isolation, hamstring isolation, calf isolation | Mostly `3-5` | Strong lower coverage, but no explicit abs/core slot. |
| Upper | press, row, shoulder compound, vertical pull, triceps, biceps | Mostly `3-5` | Balanced, but arms receive same set range as main compounds. |
| Lower | squat, hinge, glute/lunge, hamstring, calves | Mostly `3-5` | Missing explicit abs/core. |
| Full Body | lower primary, upper push, upper pull, hinge, shoulder, core accessory | Mostly `3-5` | Has core, but full-body can be high-density. |
| Chest | chest compound, secondary press, fly, pressing support, small push accessory | Usually `3-5`, some `2-4` | Better slot variation than Push. |
| Back | vertical pull, row, lat/upper-back, biceps, rear-delt/trap | Mostly `3-5`, biceps can be `2-4` | Good coverage. |
| Shoulders | shoulder press, lateral delt, rear delt, trap/scapular, support accessory | Mostly `3-5`, support can be `2-4` | Good shoulder balance. |
| Arms | triceps compound, biceps, triceps, brachialis/forearm, long-head triceps | Mostly `3-5` | Fine for an arm day, but could use more small-muscle-specific soft caps. |

### Powerbuilding

| Session | Slot structure | Typical visible range | Assessment |
|---|---|---:|---|
| Push | heavy press, hypertrophy press, shoulder, triceps compound, delt isolation, triceps isolation | Mostly `3-5` or capped `3-4/3-5` | Good blend, but heavy/support distinction could be clearer. |
| Pull | heavy row, vertical pull, supported row, biceps, rear delt | Mostly `3-5` / `3-4` | Good, still row-biased rather than deadlift-biased. |
| Legs | heavy squat, heavy hinge, single-leg/glute, quad isolation, hamstring isolation | Mostly `3-5` / `3-4` | Strong blend. No direct core slot. |
| Upper | heavy press, heavy pull, shoulder, vertical pull, triceps, biceps | Mostly `3-5` / `3-4` | Good but arms can visually match compounds. |
| Lower | heavy squat, heavy hinge, glute, hamstring, calf | Mostly `3-5` / `3-4` | Good. No direct core slot. |
| Full Body | heavy lower, heavy push, heavy pull, posterior chain, delt, arms | Mostly `3-5` / `3-4` | Dense but coherent. |
| Chest/Back/Shoulders/Arms | body-part specific blends | Mixed, some `2-4` | Better than generic sessions, but still not a full slot matrix. |

### Strength

| Session | Slot structure | Typical visible range | Assessment |
|---|---|---:|---|
| Push | bench anchor, OHP/support, close press, triceps/shoulder support | Main often `4-5`, support `2-4`/`2-3` | Good anchoring. Set distinction exists via slot values. |
| Pull | deadlift anchor, heavy row, heavy vertical pull, upper-back, biceps | Mostly `3-5` / `2-4` / `2-3` | Good, includes biceps small dose. |
| Legs | squat anchor, deadlift support, secondary lower, hamstring/bracing support | Main often `4-5`, support lower | Strong. Core is bundled with hamstring support, not guaranteed. |
| Upper | bench anchor, OHP, upper-back, pressing/pulling support | Main/support differentiated | Good. |
| Lower | squat, deadlift anchor/support, lower compound, hamstring/bracing | Main/support differentiated | Good. Core bundled, not guaranteed. |
| Full Body | lower anchor, bench anchor, OHP/upper-back, core support | Differentiated | Good, includes explicit core. |
| Chest/Back/Shoulders | canonical or related anchors | Differentiated | Stronger than older generic strength templates. |
| Arms | arm support rather than true strength day | Lower-volume direct work | Acceptable as accessory day, not a primary strength driver. |

### Power

| Session | Slot structure | Typical visible range | Assessment |
|---|---|---:|---|
| Push | explosive push, explosive overhead, strength exposure, support | Power lane capped around `3-4`, support `2-3` | Good direction. |
| Pull | explosive hinge, strength pull, lat maintenance, scap/arm maintenance | Power/support differentiated | Good. |
| Legs | jump/speed squat, explosive hinge, strength squat, hamstring maintenance | Power/support differentiated | Good. No explicit core. |
| Upper | explosive push, explosive overhead, strength pull, scap/delt | Power/support differentiated | Good. |
| Lower | jump/speed squat, explosive hinge, strength squat, calf maintenance | Power/support differentiated | Good. No explicit core. |
| Full Body | lower power, upper power, pull strength, core maintenance | Power/support differentiated | Includes core. |
| Arms | explosive shoulder/triceps, triceps strength, biceps/triceps maintenance | Low relevance as a power session | Acceptable only as support/edge case. |
| Chest/Back/Shoulders | power + strength exposure + maintenance | Differentiated | Good, but relies heavily on exercise pool quality. |

### Peak

| Session | Slot structure | Typical visible range | Assessment |
|---|---|---:|---|
| Push | specific bench, close press support, minimal support | `1-3` / `1-2` | Good. |
| Pull | specific deadlift, upper-back, scapular support | `1-3` / `1-2` | Good. |
| Legs | squat exposure, deadlift support, posterior/bracing support | `1-3` / `1-2` | Good. Core bundled, not guaranteed. |
| Upper | bench, OHP, row support | `1-3` / `1-2` | Good. |
| Lower | squat, deadlift, bracing/posterior support | `1-3` / `1-2` | Good. Core bundled, not guaranteed. |
| Full Body | lower specific, upper specific, upper-back | `1-3` / `1-2` | Specific and low volume. |
| Chest/Back/Shoulders/Arms | minimal specific/support work | `1-3` / `1-2` | Appropriate. |

### Recovery Window

| Session | Slot structure | Typical visible range | Assessment |
|---|---|---:|---|
| Push | easy press, low-fatigue chest/shoulder, light triceps | Usually max `1-2` or `2` | Good low complexity. |
| Pull | easy row/pulldown, scap/rear delt, light biceps | Usually max `1-2` or `2` | Good. |
| Legs | easy squat/press, hamstring, calf/core support | Usually max `1-2` | Good but core may lose to calf candidate. |
| Upper | easy push, easy pull, low-fatigue shoulder | Reduced | Good. |
| Lower | easy lower, hamstring, light bracing | Reduced | Good. |
| Full Body | easy lower, easy upper push, easy upper pull | Reduced | Good. No direct core. |
| Arms/Chest/Back/Shoulders | light direct work | Reduced | Good. |

## 4. Core/abs coverage

### Core exercises available

Core/abs-related exercises currently present include:

- Cable Crunch
- Hanging Leg Raise
- Ab Wheel Rollout
- Machine Crunch
- Plank
- Front Plank
- Copenhagen Plank
- McGill Curl Up
- Bird Dog
- Standing Cable Crunch
- Medicine Ball Rotational Throw
- Back Extension variants
- Reverse Hyper variants

Likely missing or underrepresented from the user's examples:

- Pallof Press
- Side Plank
- Dead Bug

Side-plank style work appears in capacity guide copy, but not as a standard exercise entry in the inspected preset names.

### Where core is currently prescribed

Clear explicit core slots:

- Hypertrophy Full Body: `Core accessory`
- Strength Full Body: `Core support`
- Power Full Body: `Core maintenance`
- Recovery Window Lower: `Light bracing practice`

Mixed core slots:

- Strength Legs: `Hamstring and bracing support` targets `["hamstrings", "abs"]`
- Strength Lower: `Hamstring and bracing support` targets `["hamstrings", "abs"]`
- Peak Legs: `Minimal posterior-chain/bracing support` targets `["hamstrings", "abs"]`
- Peak Lower: `Minimal bracing/posterior-chain support` targets `["abs", "hamstrings"]`
- Recovery Window Legs: `Low-fatigue calf/core support` targets `["calves", "abs"]`

Potential issue:

Mixed slots are not guaranteed to select core. The picker only requires an exercise to touch one of the target muscles. In a slot targeting `["hamstrings", "abs"]`, a hamstring exercise can win. In a slot targeting `["calves", "abs"]`, a calf exercise can win. So the template communicates bracing intent, but the final workout may not actually include a core movement.

### Legs/Lower

Hypertrophy Legs and Lower currently do not have explicit core slots. They rely on indirect trunk demand from squats, hinges, lunges, hip thrusts, and compound work.

That is not obviously wrong for hypertrophy, but it means abs/core coverage can be inconsistent unless Full Body, presets, extra sessions, or user-added exercises cover it.

### Strength and Powerlifting Meet

Strength templates have better bracing intent after the template refactor:

- Legs/Lower include hamstring/bracing support
- Full Body includes core support
- Pull/Back include deadlift/upper-back support

But for powerlifting-style training, core/bracing work should be deliberate enough to show up at least once or twice weekly. Current mixed slots may not guarantee that.

### Power and Athletic Performance

Power Full Body includes core maintenance. Power Legs/Lower do not include direct trunk work. Medicine Ball Rotational Throw exists and is power/core-relevant, but its appearance depends on matching a power slot.

Athletic Performance would benefit from more anti-rotation, trunk stiffness, carry, and med-ball trunk options over time.

### Recovery Window

Recovery Window includes some light bracing intent, particularly Lower. This is appropriate. It should stay low-fatigue and simple.

### Overall core assessment

Core is present but not yet programmed as a reliable weekly support system.

Current state:

- available in library: yes
- included in some templates: yes
- guaranteed in lower-body strength/powerlifting contexts: no
- treated as programmed trunk support: partially
- treated as optional filler: sometimes

## 5. Coaching quality assessment

Current architecture feels like:

```text
B) same-range defaults applied too broadly, with good block/lane guardrails
```

It is not random and not fake. It has:

- block-specific templates
- lane-specific constraints
- experience-based trimming
- fatigue-based trimming
- volume-learning adjustment
- soft caps
- required-set completion logic

But from a coaching-quality perspective, it still often reads like:

- "every hypertrophy exercise gets 3-5 sets"
- "every powerbuilding exercise gets roughly 3-5 or 2-4"
- "most support work differs only when the template author manually wrote `2` or `4`"

That is serviceable, but not yet as polished as the rest of Adaptive Strength Coach's training intelligence.

The better model:

- Main lifts should have enough sets for practice/exposure.
- Secondary compounds should usually be slightly lower.
- Unilateral work should be productive but not session-bloating.
- Isolation should often start at 2 required sets with a flexible upper range.
- Core should be short, intentional, and low-noise.
- Peak/Recovery Window should stay very conservative.

## 6. Recommended set architecture

The app should add a slot prescription matrix that returns:

- required sets
- recommended min sets
- recommended max sets
- soft cap
- optional hard cap
- rationale/copy

Inputs:

- block type
- generated workout type
- template slot role
- slot label/category
- exercise role
- exercise family
- training lane
- experience level
- fatigue/taper/re-entry modifiers

Lane constraints should remain the final safety layer.

### Hypertrophy

Recommended defaults:

| Slot type | Required | Target | Soft cap | Rationale |
|---|---:|---:|---:|---|
| Heavy/primary compound | 3 | 3-5 | 5-6 | Enough exposure without turning every compound into marathon volume. |
| Secondary compound | 2 | 2-4 | 4-5 | Productive angle, lower systemic cost. |
| Unilateral work | 2 | 2-4 | 4 | High local stimulus, high time cost. |
| Machine compound | 2 | 2-4 | 5 | Stable hypertrophy work can tolerate a bit more. |
| Isolation | 2 | 2-4 | 5 | Low-fatigue volume lever. |
| Small muscle isolation | 2 | 2-5 | 5-6 | Useful for biceps/triceps/calves/rear delts if recovery is fine. |
| Core | 2 | 2-3 | 4 | Trunk work should support training, not hijack the session. |

Example Hypertrophy Push:

- Heavy Compound: required 3, target 3-5, soft cap 5
- Secondary/Machine Press: required 2, target 2-4, soft cap 4
- Shoulder/Unilateral/Support: required 2, target 2-4, soft cap 4
- Chest Isolation: required 2, target 2-4, soft cap 5
- Delt Isolation: required 2, target 2-5, soft cap 5
- Triceps Isolation: required 2, target 2-4, soft cap 5

Example Hypertrophy Legs:

- Squat/Leg Press: required 3, target 3-5, soft cap 5
- Hinge: required 2, target 2-4, soft cap 4
- Lunge/Hip Thrust: required 2, target 2-4, soft cap 4
- Quad Isolation: required 2, target 2-4, soft cap 5
- Hamstring Isolation: required 2, target 2-4, soft cap 5
- Calves/Core alternating slot: required 2, target 2-4, soft cap 5

### Powerbuilding

| Slot type | Required | Target | Soft cap | Rationale |
|---|---:|---:|---:|---|
| Heavy primary | 3 | 3-5 | 5 | Strength exposure plus enough repeat practice. |
| Secondary strength/hypertrophy | 2 | 2-4 | 4 | Support the lift without stealing recovery. |
| Hypertrophy compound | 2 | 2-4 | 5 | Muscle-building support. |
| Isolation | 2 | 2-4 | 5 | Useful volume without too much fatigue. |
| Core | 2 | 2-3 | 4 | Bracing support, especially lower/full-body days. |

### Strength

| Slot type | Required | Target | Soft cap | Rationale |
|---|---:|---:|---:|---|
| Main lift | 3 | 3-5 | 5 | Practice and force output. |
| Secondary lift | 2 | 2-4 | 4 | Technical/weak-point support. |
| Unilateral lower/support | 2 | 2-3 | 3-4 | Enough support, low noise. |
| Upper-back/triceps/hamstring support | 2 | 2-3 | 4 | Targeted support for main lifts. |
| Core/bracing | 2 | 2-3 | 3 | Keep it crisp. |

Example Strength Lower:

- Main Lift: required 3, target 3-5, soft cap 5
- Secondary Lift: required 2, target 2-4, soft cap 4
- Unilateral/secondary lower: required 2, target 2-3, soft cap 3
- Hamstring Support: required 2, target 2-3, soft cap 3
- Core/Bracing: required 2, target 2-3, soft cap 3

### Power

| Slot type | Required | Target | Soft cap | Rationale |
|---|---:|---:|---:|---|
| Power movement | 3 | 3-5 | 5 | Quality exposures; stop before speed fades. |
| Speed strength support | 2 | 2-4 | 4 | Fast, clean strength. |
| Low-fatigue accessory | 1 | 1-3 | 3 | Maintenance only. |
| Core/bracing/rotation | 2 | 2-3 | 3 | Useful for athletic output, low fatigue. |

Current power table allows power target up to 8 in productive-set fallback. That may be acceptable for jump/throw exposures if each set is very small, but it should be made explicit by movement type. For loaded Olympic/speed barbell work, 8 productive sets can be too much for general users.

### Peak

| Slot type | Required | Target | Soft cap | Rationale |
|---|---:|---:|---:|---|
| Specific main lift | 2 | 2-4 | 4 | Specific exposure, fatigue controlled. |
| Specific secondary | 1 | 1-3 | 3 | Touch the support pattern only. |
| Minimal support | 1 | 1-2 | 2 | Keep joints/positions alive. |
| Core/bracing | 1 | 1-2 | 2 | Only if useful and familiar. |

Current Peak is close. It should stay conservative.

### Recovery Window

| Slot type | Required | Target | Soft cap | Rationale |
|---|---:|---:|---:|---|
| Easy compound | 1 | 1-3 | 3 | Practice and movement quality. |
| Accessory | 1 | 1-2 | 2 | Low-fatigue support. |
| Mobility/core/bracing | 1 | 1-2 | 2 | Easy practice, no chasing. |

Current Recovery Window templates are directionally good. They need copy and visibility to keep communicating adaptive recovery, not mandatory punishment.

### Core/bracing policy

Recommended weekly policy:

- Strength / Powerlifting Meet:
  - at least 1-2 explicit core/bracing exposures per week
  - prefer cable crunch, plank/front plank, ab wheel for suitable users, McGill curl-up/bird dog in recovery contexts
- Lower/Legs:
  - add explicit core/bracing slot in Strength and Powerbuilding
  - optional in Hypertrophy depending session count
- Full Body:
  - keep explicit core slot
- Power / Athletic Performance:
  - include anti-rotation/rotation/brace options
  - add Pallof Press, Side Plank, Dead Bug later
- Recovery Window:
  - low-fatigue trunk practice only

Avoid:

- turning abs into mandatory high-volume bodybuilding every lower day
- using high-skill ab wheel for beginners by default
- letting core work inflate session length when lower-body fatigue is already high

## 7. Priority fixes

### P1: Add slot prescription matrix

Create a pure domain helper such as:

```text
src/domain/training/slot-set-prescriptions.ts
```

Inputs:

- block type
- workout type
- template slot role
- slot label
- exercise role/family
- training lane
- experience level

Output:

- required sets
- recommended min
- recommended max
- soft cap
- rationale

This would remove the current overreliance on `requiredSets + 2`.

### P1: Make core slots explicit where needed

Do not rely on mixed slots like `["hamstrings", "abs"]` when core is genuinely intended.

Add explicit core/bracing slots or slot tags for:

- Strength Legs
- Strength Lower
- Strength Full Body
- Powerlifting Meet lower/full-body contexts
- Power Full Body and selected Athletic Performance sessions
- Recovery Window Lower

### P2: Add missing common core entries

Add:

- Pallof Press
- Side Plank
- Dead Bug

Classify them as low-fatigue, core-stability/anti-rotation/support work.

### P2: Separate power set logic by power movement type

Jumps/throws can use more low-fatigue exposures than heavy Olympic/speed-barbell work.

Suggested:

- jumps/throws: 3-6 quality sets
- Olympic derivatives: 3-5 quality sets for most users
- speed barbell: 3-5 quality sets
- beginner power: low-skill options only

### P2: Make visible target ranges more honest by slot

Users should see:

- primary: `3-5`
- secondary: `2-4`
- isolation: `2-4`
- core: `2-3`
- peak support: `1-2`
- Recovery Window support: `1-2`

This would make the workout feel more intentionally coached.

### P3: Add weekly core coverage tests

Test by plan type, not only by individual generated workout.

Examples:

- Strength 4-day plan includes at least one explicit core/bracing slot.
- Powerlifting Meet plan includes trunk/bracing support during base/build, but not distracting high-volume abs during taper.
- Recovery Window lower includes low-fatigue core when appropriate.

## 8. Risks

### Breaking personalised volume ladder

Volume learning currently shifts ranges from existing prescriptions. If base prescriptions change, tests should confirm:

- `raise_range` still targets accessories first
- `lower_range` does not reduce required sets below safe minimum
- peak/taper/deload still suppress aggressive additions

Risk: medium.

### Breaking completion logic

Workout completion uses `requiredSets`. Lowering required sets for accessories is fine, but accidentally lowering primary required sets could make exercises complete too early.

Risk: medium.

### Making sessions too long

Adding explicit core slots could increase session length. Prefer:

- replacing a mixed/filler slot with core
- alternating calves/core or hamstring/core by session
- adding core only when session count/days/week supports it

Risk: medium.

### Making beginner sessions too complex

Beginners currently get fewer exercises and lower set counts. Preserve this.

Risk: medium.

### Over-prescribing abs

Core/bracing should support lifting. It should not become daily high-volume ab work unless user goal/history supports it.

Risk: low/medium.

### Noisier Workout Review

More varied set prescriptions can make review logic more sensitive if first-exposure or low-history rules are not respected. Keep the first-session cautious policy.

Risk: low/medium.

### UI confusion

More varied ranges are better coaching, but the UI must still explain:

- required sets finish the exercise
- target range is useful work
- soft cap is a guardrail

Risk: low.

## 9. Build/no-build recommendation

No EAS build should be started from this audit.

Current set architecture is stable enough for beta testing, but it is not as sophisticated as the rest of the training intelligence. It should be improved before broader paid release if the product promise is "Adaptive Strength Coach" rather than "good generated workouts."

Recommended implementation order:

1. Add slot set prescription domain helper and tests.
2. Wire generated slots through the helper before lane caps.
3. Add explicit core/bracing slot support where templates intend it.
4. Add missing low-fatigue core exercises.
5. Add weekly core coverage tests for Strength, Powerlifting Meet, Athletic Performance, and Recovery Window.
6. Re-run full regression.

Until then, the app is not prescribing unsafe set ranges, but it is leaving coaching quality on the table by making too many slots look the same.
