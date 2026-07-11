# Truthfulness & Promise Validation Audit

Date: 2026-06-14

Scope: product-truthfulness audit of onboarding choices, goal behaviour, plan type behaviour, equipment presets, schedule, experience level, and marketed coaching features. This audit did not change app code, tests, RevenueCat, or EAS.

Audit method:

- inspected the production onboarding options in `app/(protected)/onboarding.tsx`
- inspected active plan creation in `src/domain/training/plan-setup.ts`
- inspected planned workout generation in `src/domain/training/planned-workout.ts`
- inspected block/session templates and exercise scoring in `src/domain/training/ad-hoc-workout-generator.ts`
- inspected evidence-based set prescriptions in `src/domain/training/slot-prescription-matrix.ts`
- inspected recovery/cardio delivery in `src/domain/training/recovery-capacity*.ts` and `src/domain/training/cardio-dose.ts`
- inspected success models and progression throttle in `src/domain/training/success-model.ts` and `src/domain/training/progression-throttle.ts`
- inspected reporting in `src/domain/training/strength-dashboard.ts` and `src/domain/training/advanced-reporting.ts`
- sampled the real planned workout path with a temporary trace file that was removed after use

## 1. Executive Summary

Adaptive Strength Coach can truthfully market itself as an auto-regulated strength and hypertrophy coaching app. The major onboarding choices are not fake labels: goals create different macrocycles, Powerlifting Meet uses date-aware planning, experience level changes session complexity and set prescriptions, equipment filters materially change exercise selection, and Recovery & Cardio preferences alter user-facing delivery.

The strongest truthfulness areas are:

- goal-specific annual block sequencing
- Powerlifting Meet countdown/taper behaviour
- block-specific workout templates
- evidence-based slot prescriptions
- experience-level filtering and session trimming
- equipment-aware exercise selection
- adaptive progression throttle
- fatigue/recovery/cardio systems
- Strength Dashboard, PR tracking, and reports

The weakest truthfulness area is early visible differentiation. Several goals start with a base hypertrophy block, so first-week Push/Pull/Legs workouts can look very similar across Build Muscle, Build Strength, Build Muscle & Strength, Get Leaner, and Athletic Performance. That is defensible programming, but a user who expects their goal to look dramatically different on day one may not immediately notice the difference until roadmap, later blocks, recovery/cardio, success model, and progression decisions appear.

Overall recommendation: **A) Freeze coaching architecture and move to monetisation**, with minor copy/UX truthfulness refinements during paywall work. No major architecture changes are needed before monetisation.

## 2. Goal Validation

### Build Muscle

Generated block sequence:

`Hypertrophy 8 -> Powerbuilding 6 -> Recovery Window 1 -> Hypertrophy 8 -> Hypertrophy 6 -> Recovery Window 1 -> Strength 4 -> Hypertrophy 6 -> Recovery Window 1 -> Power 3 -> Hypertrophy 6 -> Recovery Window 1`

Total: 51 weeks.

Workout structure:

- starts in a longer Hypertrophy block
- Push/Pull/Legs/Upper/Lower at 5 days/week by default
- hypertrophy templates use more muscle coverage and direct isolation work
- sampled first Push: Bench Press, Incline Dumbbell Press, Machine Shoulder Press, Pec Deck, Front Raise, Overhead Cable Extension

Volume profile:

- highest hypertrophy bias of all annual plans
- repeated accumulation blocks
- evidence-based prescriptions allow hypertrophy and small-muscle volume expansion where recovery supports it

Exercise selection bias:

- compounds plus machine/secondary work and isolation
- accessories can rotate in controlled windows
- strength/power phases appear later as support phases, not the core identity

Progression behaviour:

- progression throttle permits volume/reps/load progression but holds more readily on higher-rep/isolation work when cost rises
- rep range occupancy supports heavy-end progression but Build Muscle requires stronger evidence than Build Strength for low-range pushes

Recovery/cardio behaviour:

- base cardio dose is mostly Recovery Cardio, usually 2-4 sessions when useful
- Home card is confidence-gated, so not always visible

Reporting differences:

- Strength Dashboard still exists, but reporting is not goal-relabelled to a muscle-only dashboard
- Volume Report is likely more relevant to this goal than the top-level Strength Dashboard

Peak/taper:

- short Power and no major meet-style Peak unless the block sequence reaches it; not a meet-prep goal

What changes:

- longer hypertrophy exposure
- volume-first success model
- hypertrophy templates and prescriptions
- cardio stays recovery-supportive

What does not change:

- first-week Push may look similar to other goals that also start in Hypertrophy
- Strength Dashboard and PR systems remain universal

Would a user notice?

- Yes over the roadmap and repeated sessions.
- Less obvious in the first workout if comparing only first-week Push.

Promise match: **mostly true**

Score: **8.5 / 10**

### Build Strength

Generated block sequence:

`Hypertrophy 6 -> Powerbuilding 6 -> Recovery Window 1 -> Strength 6 -> Strength 6 -> Recovery Window 1 -> Power 4 -> Strength 5 -> Recovery Window 1 -> Peak 3 -> Recovery Window 1 -> Powerbuilding 4 -> Strength 6 -> Recovery Window 1`

Total: 51 weeks.

Workout structure:

- starts with a base Hypertrophy block, then spends far more time in Strength/Power/Peak than Build Muscle
- Strength templates anchor Bench/OHP/Squat/Deadlift
- Peak templates are specific and lower-volume

Volume profile:

- moderate accessory volume
- main-lift practice protected
- volume expansion is more restricted for strength slots than hypertrophy slots

Exercise selection bias:

- canonical strength anchors get scoring bonuses in Strength and Peak
- primary lifts are protected by Tier A stability and rotation rules
- support work targets upper back, triceps, hamstrings, unilateral lower, and core/bracing

Progression behaviour:

- progression throttle protects main lifts
- Build Strength can progress from heavy-end rep-range occupancy more readily than Build Muscle
- fatigue can trigger hold/pull-back rather than endless load jumps

Recovery/cardio behaviour:

- mostly Recovery Cardio, lower duration/frequency than Athletic Performance
- avoids stealing heavy lifting output

Reporting differences:

- Strength Dashboard and e1RM trends are highly aligned
- current UI reports are universal, but the success model uses strength-specific priorities

Peak/taper:

- annual sequence includes Peak and Recovery Windows
- not date-specific unless using Powerlifting Meet/Event Date

What changes:

- macrocycle has much more Strength/Peak exposure
- canonical lift anchoring
- progression bias protects main lifts

What does not change:

- first block is still Hypertrophy base, so day-one workout may look like a muscle-building base phase
- reporting layout is not radically different from other goals

Would a user notice?

- Yes in Plan roadmap and once Strength blocks begin.
- A cold first-week user may need roadmap/context copy to understand why the first phase is base building.

Promise match: **mostly true**

Score: **8.5 / 10**

### Build Muscle & Strength

Generated block sequence:

`Hypertrophy 6 -> Powerbuilding 6 -> Recovery Window 1 -> Strength 5 -> Powerbuilding 6 -> Recovery Window 1 -> Hypertrophy 6 -> Strength 5 -> Recovery Window 1 -> Power 4 -> Peak 2 -> Recovery Window 1 -> Powerbuilding 6`

Total: 50 weeks.

Workout structure:

- balanced annual waves
- alternates hypertrophy, powerbuilding, strength, power, and brief peak exposure
- sampled first Push matches hypertrophy-base structure

Volume profile:

- middle ground between Build Muscle and Build Strength
- uses hypertrophy prescriptions in hypertrophy blocks and strength support in later blocks

Exercise selection bias:

- compounds and accessories both matter
- controlled rotation supports accessories without destabilising primary lifts

Progression behaviour:

- success model balances progression, productive sets, and fatigue
- occupancy-based progression allowed with moderate evidence

Recovery/cardio behaviour:

- relatively strong recovery-capacity emphasis
- can recommend Capacity Cardio where work capacity is useful and recovery is controlled

Reporting differences:

- both Strength Dashboard and Volume Report are relevant
- no unique report just for hybrid goal

Peak/taper:

- brief peak appears, but not meet-specific unless Powerlifting Meet mode is used

What changes:

- more balanced block mix than Build Muscle or Build Strength
- balanced readiness weights and recovery-capacity behaviour

What does not change:

- first block is still Hypertrophy and may appear similar to Build Strength's first block

Would a user notice?

- Yes from roadmap and medium-term block changes.
- Less immediately in the first workout.

Promise match: **fully/mostly true**

Score: **9 / 10**

### Get Leaner

Generated block sequence:

`Hypertrophy 6 -> Powerbuilding 5 -> Recovery Window 1 -> Hypertrophy 6 -> Strength 4 -> Recovery Window 1 -> Powerbuilding 5 -> Hypertrophy 6 -> Recovery Window 1 -> Power 3 -> Recovery Window 1 -> Hypertrophy 6 -> Powerbuilding 4 -> Recovery Window 1`

Total: 50 weeks.

Workout structure:

- mostly hypertrophy/powerbuilding with shorter strength/power support
- sampled first Push selected slightly different exercise variants than Build Muscle, but structurally still hypertrophy

Volume profile:

- sustainable volume rather than aggressive hypertrophy chasing
- success model prioritises strength/muscle retention and fatigue control

Exercise selection bias:

- not calorie-focused
- does not create fat-loss circuits
- keeps normal lifting quality

Progression behaviour:

- performance-based Push/Hold/Pull Back remains active
- low-range occupancy progression requires more exposure than Build Strength
- moderate fatigue holds are more conservative than generic muscle-building pushes

Recovery/cardio behaviour:

- meaningfully different: Get Leaner directly recommends Recovery Cardio when preference allows
- base cardio dose is 2-4 sessions, 20-35 minutes, easy
- Minimal mode suppresses prompts unless workload/recovery asks for them

Reporting differences:

- reports do not track bodyweight, calories, or fat loss
- consistency, recovery, volume, and strength retention are the real proof

Peak/taper:

- no special peak/taper except normal annual blocks

What changes:

- success model, cardio/recovery recommendation level, macrocycle structure, progression caution

What does not change:

- no nutrition, calorie, scale weight, or body composition tracking
- workouts remain lifting-focused

Would a user notice?

- Yes if Recovery & Capacity card appears.
- Maybe not immediately if low history hides cardio target; the goal may feel like Build Muscle until recovery/cardio evidence surfaces.

Promise match: **mostly true**, as long as marketing avoids fat-loss guarantees.

Score: **8 / 10**

### Athletic Performance

Generated block sequence:

`Hypertrophy 6 -> Strength 5 -> Recovery Window 1 -> Power 5 -> Powerbuilding 5 -> Recovery Window 1 -> Strength 4 -> Power 5 -> Recovery Window 1 -> Peak 3 -> Recovery Window 1 -> Power 5 -> Hypertrophy 6 -> Power 4`

Total: 52 weeks.

Workout structure:

- starts with tissue/capacity support, then shifts heavily toward Strength and Power
- Power templates use jumps, explosive hinges, speed/power options, and low-fatigue support

Volume profile:

- not bodybuilding-heavy over the year
- power and quality are protected
- junk volume is restricted in Power blocks

Exercise selection bias:

- more power movement exposure
- Athletic Performance allows more Performance Conditioning
- beginner filters still suppress advanced/high-skill options

Progression behaviour:

- power quality model matters
- acceptable/degrading power quality holds or pulls back
- quality beats grind

Recovery/cardio behaviour:

- most differentiated cardio profile
- base dose can be Performance Conditioning, 3-5 sessions if tolerated
- less restrictive interference behaviour than Powerlifting Meet or Build Strength

Reporting differences:

- reporting is still strength/volume/recovery/consistency, not a sport-performance battery

Peak/taper:

- readiness phases exist, but not sport-calendar-specific unless Event Date is used

What changes:

- annual sequence, Power block exposure, cardio lane, power quality, fatigue bias

What does not change:

- no sprint/jump testing, sport drills, GPS, or conditioning periodisation beyond broad cardio lanes
- first block may still be Hypertrophy base

Would a user notice?

- Yes in Power blocks and cardio recommendations.
- Not necessarily in week one.

Promise match: **mostly true**, but "Athletic Performance" should be framed as gym-based strength/power/conditioning support, not a full sport performance system.

Score: **8 / 10**

### Powerlifting Meet

Recommended annual block sequence:

`Powerbuilding 6 -> Strength 5 -> Recovery Window 1 -> Powerbuilding 6 -> Strength 5 -> Recovery Window 1 -> Power 4 -> Peak 3 -> Recovery Window 1 -> Strength 5 -> Power 4 -> Recovery Window 1 -> Powerbuilding 6`

Total: 48 weeks.

Event-date mode:

- Powerlifting Meet goal forces `custom_date_event`
- date step appears automatically
- sequence depends on weeks until meet
- short timelines produce Peak/readiness
- longer timelines produce Powerbuilding/Strength/Peak/Recovery Window

Workout structure:

- starts in Powerbuilding rather than Hypertrophy
- Strength/Peak templates favour squat, bench, deadlift, and OHP anchors
- late Peak prefers canonical lifts and avoids novelty
- Powerlifting Meet Peak Full Body includes bracing support

Volume profile:

- lower accessory emphasis near Peak/Taper
- support work remains but is low-volume
- Recovery Windows and event taper suppress aggressive progression

Exercise selection bias:

- squat/bench/deadlift specificity is real in Strength/Peak
- canonical lift scoring and meet-specific Peak selection are implemented

Progression behaviour:

- event taper can suppress progression
- Powerlifting Meet requires stronger exposure before heavy-end occupancy pushes
- fatigue/readiness outweighs load chasing late

Recovery/cardio behaviour:

- favours Recovery Cardio
- taper/peak suppresses hard conditioning

Reporting differences:

- Strength Dashboard adds Powerlifting Meet total
- event context appears in Plan/Home through countdown/taper

Peak/taper:

- strongest goal-specific behaviour in the app

What changes:

- planning choice, event countdown, taper, canonical lift specificity, progression caution, Powerlifting total

What does not change:

- not a full meet attempt-selection platform
- no federation rules, weigh-in/nutrition, opener planning, or attempt calculator yet

Would a user notice?

- Yes. This is one of the most truthful and visibly differentiated choices.

Promise match: **fully true for app-scope meet prep**, not full meet management.

Score: **9 / 10**

## 3. Experience Validation

### Beginner

Actual behaviour:

- filters out exercises marked advanced
- trims session exercise count by one where possible
- reduces non-primary set prescriptions
- protects primary/power/specific peak lifts from becoming too small
- power lower kept safe trunk/bracing after the latest refinement
- beginner Power Lower sample: Box Jump, Belt Squat, McGill Curl Up

What changes:

- fewer exercises
- simpler exercise selection
- lower set range pressure
- less complex power exposure

What does not change:

- same broad plan sequences
- same high-level blocks
- still sees serious training names like Power/Peak if selected

Would a beginner notice?

- Yes in session length and exercise complexity.

Weakness:

- beginner-specific education is mostly copy, not a separate novice progression curriculum.

Score: **8 / 10**

### Intermediate

Actual behaviour:

- default architecture
- full template structures
- normal set prescriptions
- controlled rotation every 4 weeks by default

What changes:

- this is the baseline, so no special dramatic behaviour

Would an intermediate notice?

- Yes, if comparing to beginner/advanced.

Score: **8 / 10**

### Advanced

Actual behaviour:

- allows more exercises in generated sessions
- allows higher recommended max/soft caps where volume expansion is supported
- does not filter advanced exercises
- progression throttle is more conservative on advanced isolation work with limited evidence
- advanced Power Lower sample had a fuller session than beginner

What changes:

- more work capacity assumed
- more advanced exercise eligibility
- more volume where evidence supports it

What does not change:

- no true advanced athlete customisation by lift specialty, weak point questionnaire, or training age beyond this setting
- no subjective readiness/RPE/RIR

Would an advanced lifter get meaningfully different programming?

- Yes, but not a fully bespoke elite system.

Score: **8 / 10**

## 4. Equipment Validation

Onboarding equipment options:

- Full gym
- Machines only
- Dumbbells only
- Barbell + dumbbells
- Home gym
- Custom

The audit request mentions "Limited Equipment"; the current product does **not** expose a literal "Limited Equipment" label. The closest current options are Dumbbells only, Barbell + dumbbells, Home gym, Machines only, and Custom.

### Full Gym

Actual behaviour:

- available equipment: barbell, dumbbell, machine, cable, smith, bodyweight
- best exercise selection quality
- strength, hypertrophy, power, and meet prep all viable

Sample Lower: Hack Squat, Pause Deadlift, Hip Thrust Machine, Standing Leg Curl, Standing Calf Raise, McGill Curl Up.

Score: **9 / 10**

### Home Gym

Actual behaviour:

- available equipment: dumbbell, barbell, bands, bodyweight
- preserves strength and hypertrophy fairly well when barbell is available
- fewer machine/cable isolation choices

Sample Lower: Barbell Back Squat, Pause Deadlift, Bulgarian Split Squat, Nordic Curl, Single-Leg Calf Raise, McGill Curl Up.

Strength viability:

- good if barbell exists

Hypertrophy viability:

- good, but less machine/cable variety

Power viability:

- acceptable with bodyweight/jump/barbell options

Score: **8 / 10**

### Machines Only

Actual behaviour:

- available equipment: machine, cable
- preserves hypertrophy well
- changes strength specificity substantially because canonical barbell lifts are unavailable

Sample Lower: Hack Squat, Back Extension, Machine Glute Drive, Standing Leg Curl, Standing Calf Raise, Cable Crunch.

Strength viability:

- acceptable for general strength, weaker for Powerlifting Meet specificity

Hypertrophy viability:

- high

Power viability:

- weaker; fewer true power movements

Score: **7 / 10**

### Dumbbells Only

Actual behaviour:

- available equipment: dumbbell, bodyweight, bands
- generator produces usable workouts but loses heavy barbell specificity and many machine/cable isolations

Sample Lower: Dumbbell Romanian Deadlift, Single-Leg Hip Thrust, Nordic Curl, Single-Leg Calf Raise, Front Plank.

Strength viability:

- limited, especially for Powerlifting Meet

Hypertrophy viability:

- acceptable with compromises

Power viability:

- acceptable for lower-skill jumps/bodyweight, limited for loaded speed work

Score: **6.5 / 10**

### Barbell + Dumbbells

Actual behaviour:

- available equipment: barbell, dumbbell, bodyweight
- better for strength than dumbbells-only
- less complete for cable/machine hypertrophy

Score: **8 / 10**

### Custom

Actual behaviour:

- `equipmentForPreset("custom")` uses `customEquipment`
- onboarding copy says fine tuning comes later in Settings
- if no custom equipment is supplied, the equipment array can be empty; generation then behaves as unconstrained because the equipment filter treats empty as no filter

Truthfulness risk:

- Custom is not a full normal-user equipment builder in onboarding.
- It can imply more control than currently exists.

Score: **5 / 10**

## 5. Schedule Validation

Actual default split logic:

- 2 days/week: Full Body, Full Body
- 3 days/week: Full Body, Full Body, Full Body
- 4 days/week: Upper, Lower, Upper, Lower
- 5 days/week: Push, Pull, Legs, Upper, Lower
- 6 days/week: Push, Pull, Legs, Push, Pull, Legs

The schedule choice genuinely changes weekly structure.

### 2 days/week

Actual behaviour:

- full-body bias
- fewer weekly exposures
- sessions likely denser

Truthfulness:

- appropriate for low frequency
- not as much muscle-specialisation room

Score: **8 / 10**

### 3 days/week

Actual behaviour:

- full-body bias
- frequent practice, simple weekly rhythm

Truthfulness:

- strong for beginner/intermediate general training

Score: **8.5 / 10**

### 4 days/week

Actual behaviour:

- Upper/Lower
- good balance of volume and recovery

Score: **9 / 10**

### 5 days/week

Actual behaviour:

- Push/Pull/Legs/Upper/Lower
- more distribution and specialisation

Score: **9 / 10**

### 6 days/week

Actual behaviour:

- Push/Pull/Legs repeated
- high frequency and potentially high fatigue

Truthfulness:

- coherent, but the app relies on autoregulation/fatigue systems to manage cost rather than doing a deeply custom 6-day split design.

Score: **8 / 10**

Does the app intelligently adapt volume/frequency?

- It changes split and session count.
- Experience and fatigue can trim sessions.
- Weekly muscle volume guardrails exist through prescriptions/volume learning, but there is not yet a full week-level optimiser that redistributes exact set targets across all days.

Overall schedule score: **8.5 / 10**

## 6. Programme-Type Validation

### Recommended Annual Plan

Actual behaviour:

- creates 48-52 week macrocycles depending on goal
- block sequence differs by goal
- Recovery Windows are planned
- Plan page displays annual duration and roadmap

Truthfulness:

- strong

Score: **9 / 10**

### Single Block

Actual behaviour:

- user can choose Hypertrophy, Powerbuilding, Strength, Power, Peak, or Recovery Window
- active block is exactly that block
- no hidden annual sequence is forced
- block transition preview can recommend repeat/next decision

Truthfulness:

- strong, though next-block choice UX is simpler than a full block-builder

Score: **8 / 10**

### Event Date

Actual behaviour:

- onboarding currently labels this as "Powerlifting meet date"
- Powerlifting Meet goal forces event-date planning
- target date changes available weeks and block sequence
- event taper engine affects progression and recovery/cardio

Truthfulness:

- strong for Powerlifting Meet
- generic event types still exist in code but are not broadly exposed as normal onboarding choices

Score: **8.5 / 10**

### Powerlifting Meet

Actual behaviour:

- goal and event-date mode overlap intentionally
- countdown, specificity, taper, low novelty, SBD bias, and meet-total reporting are real

Score: **9 / 10**

### Custom Sequence

Actual behaviour:

- exists in types and plan setup if custom block types are supplied
- not exposed in normal onboarding plan options

Truthfulness:

- safe because it is hidden from normal users

Score: **not user-facing**

## 7. Feature Truthfulness Review

### Adaptive progression

Rating: **fully true**

Evidence:

- progression throttle uses goal, experience, block, lane, rep range, history, fatigue, deload, training gap, event taper, power quality, and rep-range occupancy
- outputs push/hold/pull-back with evidence

Limitation:

- low-history states appropriately hold more often

### Adaptive recovery

Rating: **mostly true**

Evidence:

- fatigue classifier, training-gap logic, Recovery Windows, deload/recovery recommendations, cardio timing/interference, and recovery/cardio delivery exist

Limitation:

- user-facing recovery target is confidence-gated; a new user may not see much at first

### Adaptive volume

Rating: **mostly true**

Evidence:

- personalised volume, volume ladder, slot caps, fatigue trimming, and evidence-based hard caps exist

Limitation:

- not yet a full week-level volume optimiser with visible muscle-by-muscle prescription targets before training

### Strength Dashboard

Rating: **fully true**

Evidence:

- tracks Bench, Squat, Deadlift, Standing Barbell OHP e1RM, current/best/30-day/90-day/trend
- Powerlifting Meet adds total

### PR tracking

Rating: **fully true**

Evidence:

- load, rep, e1RM PRs and baseline handling exist
- Workout Review/Home/Progress surfaces are implemented

### Recovery Window

Rating: **mostly true**

Evidence:

- user-facing Deload is renamed Recovery Window
- dedicated templates are low-fatigue, low-novelty, lower complexity
- reactive fatigue still exists outside planned windows

Limitation:

- internal block enum remains `deload`, which is acceptable if user-facing copy stays clean

### Recovery & Capacity

Rating: **mostly true**

Evidence:

- cardio preference, dose, interference, weekly target, timing guidance, direct start, and separate cardio logging exist

Limitation:

- no calendar scheduling; it tells users best/avoid timing but does not place sessions automatically

### Powerlifting Meet mode

Rating: **mostly true / fully true within current app scope**

Evidence:

- event date forces meet plan
- SBD specificity, taper, peak, novelty reduction, total dashboard, and progression suppression exist

Limitation:

- no attempt selection, peaking attempt calculator, weigh-in handling, or federation-specific meet management

### Evidence-based prescriptions

Rating: **mostly true**

Evidence:

- slot matrix defines set ranges by block and role
- exercise role can override equipment category
- core/trunk exposure rules exist

Limitation:

- weekly set targets are bounded and practical, but not presented as a transparent volume target table to users

### Autoregulation

Rating: **fully true**

Evidence:

- performance and fatigue change progression, recovery, volume, rotation, cardio, and recommendations
- no RPE/RIR required

## 8. User Expectation Analysis

### Build Muscle

Expectation:

- more hypertrophy volume, muscle coverage, isolation work, recoverable progression

Actual:

- mostly matches
- first phase and annual plan are hypertrophy-dominant

Gap:

- Strength Dashboard may feel more prominent than muscle-specific reporting unless Volume Report is visually strong

### Build Strength

Expectation:

- heavier work, main-lift emphasis, lower rep ranges, strength progression

Actual:

- matches after base phase
- first block is hypertrophy base, which is rational but may surprise some users

Gap:

- day-one session may not look strength-specialised

### Build Muscle & Strength

Expectation:

- hybrid training

Actual:

- strong match

Gap:

- none major

### Get Leaner

Expectation:

- preserve strength/muscle, recovery/cardio, fatigue control, body-composition support

Actual:

- matches training-side expectation
- does not track calories, bodyweight, steps, or nutrition

Gap:

- marketing must avoid implying fat-loss management beyond training support

### Athletic Performance

Expectation:

- power, explosiveness, conditioning, athletic readiness

Actual:

- gym-based power/strength/conditioning support exists

Gap:

- no sport-specific testing or skill plan
- should be described as athletic performance support, not full sport coaching

### Powerlifting Meet

Expectation:

- squat/bench/deadlift, specificity, peak, taper, readiness

Actual:

- strong match

Gap:

- not an attempt-selection or full meet-day management tool

### Beginner

Expectation:

- easier exercises, simpler sessions, lower complexity

Actual:

- matches

Gap:

- still uses block terms like Power/Peak; guide/copy needs to keep them understandable

### Advanced

Expectation:

- more work, harder exercises, stricter evidence, less hand-holding

Actual:

- mostly matches

Gap:

- not fully bespoke advanced periodisation by individual lift specialty

### Full Gym

Expectation:

- best exercise selection

Actual:

- matches

### Home Gym / Limited Equipment

Expectation:

- substitutions that preserve plan quality

Actual:

- mostly matches, but Powerlifting Meet and machine/cable-heavy hypertrophy are naturally compromised

Gap:

- the app should be honest that limited equipment changes what "specific" can mean

### Custom Equipment

Expectation:

- user can choose exact equipment

Actual:

- onboarding says tuning comes later; code supports custom arrays but UI does not fully collect them there

Gap:

- biggest equipment promise weakness

## 9. Weakest Promises

Ranked from weakest/riskier to less risky:

1. **Custom equipment**: user-facing "Custom" implies fine control, but onboarding does not yet provide a full equipment builder. Risk: expectation exceeds UI.

2. **Get Leaner**: training behaviour is real, but users may expect nutrition/bodyweight/fat-loss tracking. Risk: marketing must frame it as strength retention and recovery support.

3. **Athletic Performance**: gym-based power/conditioning support is real, but it is not a full sport-performance platform. Risk: sport-specific expectation.

4. **Early goal differentiation**: several annual plans start with Hypertrophy/base work. Risk: users comparing first workouts may think goals are cosmetic.

5. **Advanced lifter differentiation**: advanced changes volume/exercise eligibility/evidence thresholds, but not deep elite-level custom planning. Risk: advanced users may expect more controls.

6. **Recovery & Capacity visibility**: real logic exists, but Home target is confidence-gated. Risk: users with low history may not see the feature immediately.

7. **Evidence-based prescriptions**: true internally, but users see set ranges, not the evidence matrix. Risk: hard to prove without guide/report copy.

8. **Powerlifting Meet**: strong within app scope, but not full meet attempt/game-day management. Risk: must avoid implying complete meet handling.

9. **Schedule adaptation**: split changes are real, but it is not a full week-level optimiser. Risk: advanced users may expect more redistribution.

10. **Single Block next-step flow**: it behaves differently and avoids hidden annual progression, but UX is lighter than a full decision wizard. Risk: user may want more guidance at block end.

## 10. Final Recommendation

Can the product truthfully market itself as **Adaptive Strength Coach**?

Yes.

Can it truthfully market itself as **Auto-Regulated Strength & Hypertrophy Coaching**?

Yes.

The current product delivers meaningful, production-path behaviour behind the main promises:

- goals change macrocycles and coaching priorities
- blocks change templates, lanes, set prescriptions, and progression constraints
- Powerlifting Meet is genuinely date-aware and specificity/taper-aware
- experience level changes complexity and volume
- equipment changes exercise selection
- schedule changes split and weekly structure
- adaptive progression/recovery/volume systems are real
- reporting and PR systems are real

Freeze recommendation: **A) Freeze coaching architecture and move to monetisation.**

Recommended minor truthfulness refinements before or during monetisation:

1. Add copy near first-block plans explaining that several goals begin with a base phase before specialising.
2. Rename or improve the `Custom` equipment onboarding option, or add a real equipment picker later.
3. Frame Get Leaner as strength/muscle retention and recovery-capacity support, not fat-loss tracking.
4. Frame Athletic Performance as gym-based strength/power/conditioning support, not sport-specific coaching.
5. Frame Powerlifting Meet as meet-prep training, not attempt selection or full meet-day management.
6. Make Volume Report and Recovery & Capacity proof more visible for Build Muscle and Get Leaner users.

Build/no-build recommendation:

- No EAS build is needed for this audit.
- No code changes are required before monetisation on truthfulness grounds.
- Minor copy refinements are recommended, but not blockers.
