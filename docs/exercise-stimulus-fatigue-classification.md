# Exercise Stimulus vs Fatigue Classification

Date: June 27, 2026  
Scope: Production design audit only. No app code, workout generation, progression, subscription logic, or EAS build changed.

## Executive Summary

Frequency-aware programme distribution should not be built from crude weekly set counts alone.

Adaptive Strength Coach already stores useful exercise metadata:

- `kind`
- `movementPattern`
- `role`
- `roles`
- `family`
- `tier`
- `fatigueCost`
- `jointStress`

Those fields are a strong start, but they are too coarse for weekly stimulus distribution. A set of Bench Press, Machine Chest Press, and Pec Deck may all train chest, but they do not create the same stimulus, fatigue, joint cost, stability demand, or recovery burden.

Recommended v1 direction: add a simple exercise classification layer that converts each exercise into practical 0-3 scores for:

- primary muscle stimulus
- secondary muscle stimulus
- systemic fatigue
- local fatigue
- joint/connective tissue cost
- technical complexity
- axial loading
- stability demand
- setup/logistics burden
- progression reliability

The purpose is not false precision. The purpose is to stop treating every set as equal.

This classification should support the next frequency-aware programme generator by distributing **recoverable weekly stimulus**, not just raw sets.

## Scoring Model

Use a deliberately simple 0-3 scale:

| Score | Meaning |
|---:|---|
| 0 | None or not meaningfully relevant |
| 1 | Low |
| 2 | Moderate |
| 3 | High |

Avoid decimals. The app does not need pretend laboratory precision.

### Scoring Dimensions

| Dimension | Definition | Why it matters |
|---|---|---|
| Primary muscle stimulus | How much useful stimulus the main target muscle receives per hard working set | Helps distribute effective weekly local stimulus |
| Secondary muscle stimulus | Meaningful contribution to non-primary muscles | Prevents undercounting compounds and overloading support muscles |
| Systemic fatigue cost | Whole-body fatigue and recovery cost | Prevents excessive heavy compound stacking |
| Local fatigue cost | Fatigue in the target muscle or local region | Helps manage repeated same-muscle exposures |
| Joint/connective tissue cost | Stress on joints, tendons, ligaments, and passive structures | Helps avoid accumulating high-cost movements |
| Technical complexity | Skill requirement and likelihood that fatigue degrades execution | Helps select safer options under fatigue or for beginners |
| Axial loading | Spinal loading/compressive demand | Especially important for squat, hinge, carries, and low-back capacity |
| Stability demand | Balance and stabilisation requirement | Higher demand can be useful but reduces loadability and repeatability |
| Setup/logistics burden | Station/equipment/time burden in a real gym | Helps avoid impractical sessions |
| Progression reliability | How consistently load/reps can be progressed and measured | Supports better load learning and progression decisions |

## Exercise Category Classification

These are category defaults. Individual exercises should override them where needed.

| Category | Primary stimulus | Secondary stimulus | Systemic fatigue | Local fatigue | Joint cost | Technical | Axial load | Stability | Setup burden | Progression reliability |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Barbell compound | 3 | 2-3 | 3 | 2-3 | 2-3 | 2-3 | 1-3 | 2 | 2 | 3 |
| Dumbbell compound | 2-3 | 2 | 2 | 2-3 | 2 | 2 | 0-2 | 3 | 2 | 2 |
| Machine compound | 2-3 | 1-2 | 1-2 | 2-3 | 1-2 | 1 | 0-1 | 1 | 1-2 | 3 |
| Cable compound | 2 | 1-2 | 1-2 | 2 | 1-2 | 1-2 | 0 | 1-2 | 2 | 2 |
| Bodyweight compound | 2-3 | 2 | 1-2 | 2-3 | 1-2 | 1-2 | 0-1 | 2-3 | 1 | 1-2 |
| Isolation machine | 2-3 | 0-1 | 1 | 2-3 | 1 | 1 | 0 | 1 | 1 | 3 |
| Isolation cable | 2-3 | 0-1 | 1 | 2-3 | 1 | 1 | 0 | 1-2 | 2 | 2-3 |
| Isolation dumbbell | 2 | 0-1 | 1 | 2 | 1-2 | 1-2 | 0 | 2 | 1 | 2 |
| Hinge/deadlift pattern | 3 | 3 | 3 | 2-3 | 3 | 3 | 3 | 2 | 2 | 2-3 |
| Squat pattern | 3 | 2-3 | 3 | 2-3 | 2-3 | 2-3 | 2-3 | 2 | 2 | 2-3 |
| Loaded carry | 1-2 | 2 | 2-3 | 2 | 2 | 1-2 | 2-3 | 2-3 | 2 | 1-2 |
| Core/bracing | 1-2 | 0-1 | 0-1 | 1-2 | 0-1 | 1 | 0-1 | 1-2 | 1 | 1-2 |
| Capacity/mobility | 1-2 | 0-1 | 0-1 | 1-2 | 0-1 | 1 | 0-1 | 1-2 | 1 | 1 |

## Example Exercise Classifications

These examples are starting points for v1. They should be reviewed by Aaron before implementation.

| Exercise | Primary stimulus | Secondary stimulus | Systemic fatigue | Local fatigue | Joint cost | Technical | Axial load | Stability | Setup burden | Progression reliability | Notes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Barbell Bench Press | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | 3 | High chest stimulus, meaningful triceps/front-delt cost |
| Dumbbell Bench Press | 3 | 2 | 2 | 2 | 2 | 2 | 0 | 3 | 2 | 2 | More stability demand, less precise loading |
| Machine Chest Press | 3 | 2 | 1 | 2 | 1 | 1 | 0 | 1 | 1 | 3 | Strong stimulus with lower systemic/stability cost |
| Pec Deck | 3 | 0 | 1 | 3 | 1 | 1 | 0 | 1 | 1 | 3 | High local pec stimulus, low systemic cost |
| Cable Fly | 2-3 | 0 | 1 | 3 | 1 | 1 | 0 | 2 | 2 | 2 | Useful low-systemic chest work, setup dependent |
| Squat | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 2 | 2 | 3 | High stimulus and high recovery cost |
| Leg Press | 3 | 2 | 2 | 3 | 2 | 1 | 1 | 1 | 1 | 3 | High lower-body stimulus with lower skill cost |
| Hack Squat | 3 | 2 | 2 | 3 | 2 | 1 | 1-2 | 1 | 1 | 3 | Strong quad stimulus, controlled path |
| Leg Extension | 3 | 0 | 1 | 3 | 1-2 | 1 | 0 | 1 | 1 | 3 | Local quad work; knee tolerance should be monitored |
| Romanian Deadlift | 3 | 2 | 2-3 | 3 | 2 | 2 | 2 | 2 | 2 | 2-3 | Excellent posterior-chain stimulus, moderate/high fatigue |
| Deadlift | 3 | 3 | 3 | 2-3 | 3 | 3 | 3 | 2 | 2 | 2 | High global cost; poor choice for simply adding weekly volume |
| Lat Pulldown | 3 | 1-2 | 1 | 2 | 1 | 1 | 0 | 1 | 1 | 3 | Strong back stimulus, easy to progress |
| Pull-Up | 3 | 2 | 2 | 2-3 | 1-2 | 2 | 0 | 2 | 1 | 1-2 | Strong stimulus but progression is less granular |
| Barbell Row | 3 | 2 | 2-3 | 2 | 2 | 2-3 | 2 | 2 | 2 | 2 | Good back work but higher low-back/technical cost |
| Chest-Supported Row | 3 | 1-2 | 1 | 2-3 | 1 | 1 | 0 | 1 | 1-2 | 3 | Back stimulus with lower systemic/axial cost |
| Lateral Raise | 2-3 | 0 | 1 | 2-3 | 1 | 1 | 0 | 1-2 | 1 | 2 | Useful shoulder stimulus, low systemic fatigue |
| Triceps Pressdown | 2-3 | 0 | 1 | 2-3 | 1 | 1 | 0 | 1 | 1-2 | 3 | Low-cost direct triceps stimulus |
| Biceps Curl | 2-3 | 0 | 1 | 2-3 | 1 | 1 | 0 | 1 | 1 | 2-3 | Low-systemic direct arm stimulus |

## How This Supports Frequency-Aware Stimulus Distribution

The training-days audit found that current plans preserve per-session template size too strongly. A stimulus/fatigue classification layer would let ASC decide *what kind* of sets to add or remove when frequency changes.

### Low-Frequency Plans

For 2-3 day plans:

- Use compounds to cover multiple muscles efficiently.
- Avoid stacking too many high-systemic/high-axial compounds in one session.
- Add low-systemic isolation or machine work when a target muscle needs more stimulus.
- Prefer high progression-reliability exercises for important targets.
- Keep sessions complete without making them brutally long.

Example:

If chest stimulus is low but systemic fatigue is already high from bench, squat, and row, add Pec Deck, Cable Fly, or Machine Chest Press rather than another heavy press.

### High-Frequency Plans

For 5-6 day plans:

- Lower per-session systemic fatigue.
- Use tighter muscle-group and axial-loading caps.
- Prevent duplicated heavy compounds from accumulating junk fatigue.
- Use lower-fatigue local exercises to top up stimulus.
- Avoid simply repeating full-sized Push/Pull/Legs sessions.

Example:

If a 6-day PPL plan already has high chest/triceps/front-delt cost from barbell bench and incline press, the second Push day should not blindly repeat the same heavy pressing dose. It may use machine/cable chest work and lower joint-cost accessories.

### Recovery-Aware Substitution

If recovery is poor:

- Preserve useful target-muscle stimulus where possible.
- Reduce systemic fatigue, joint cost, axial loading, and technical demand.
- Prefer machines, cables, supported rows, isolation work, and controlled accessories.
- Avoid turning every recovery decision into a full deload.

Example:

Swap Barbell Row to Chest-Supported Row when back stimulus is still needed but low-back fatigue is high.

### Progression Reliability

Progression reliability matters because the app learns from logged performance.

High progression-reliability exercises:

- Machine Chest Press
- Lat Pulldown
- Leg Press
- Hack Squat
- Leg Extension
- Cable Pressdown

Lower progression-reliability exercises:

- Pull-Up
- Dumbbell work with large jumps
- Highly technical free-weight lifts
- Exercises limited by grip, setup, or balance

Frequency-aware planning should lean on reliable movements when the app needs clean evidence.

## V1 Guardrails

### Do Not Count Every Set Equally

A raw set count should be split into at least:

- effective primary stimulus
- secondary stimulus
- systemic fatigue cost
- joint/connective tissue cost
- axial loading cost

### Do Not Overload 3-Day Plans With Heavy Compounds

A 3-day plan should be more complete per session, but not by cramming in every major barbell pattern at high volume.

Better:

- one or two high-value compounds
- one supported/machine compound
- low-systemic isolation top-ups
- one core/bracing or capacity-compatible slot where appropriate

### Do Not Let 6-Day Plans Multiply Full Sessions

A 6-day plan needs shorter, more focused sessions. It should not simply repeat 25-30 recommended max working sets per session.

### Cap Weekly Axial Loading

Track a weekly axial-loading budget. Squats, deadlifts, heavy rows, carries, and some hinges should consume it.

Suggested v1 rule:

- One high-axial lift per session max unless the session is explicitly lower-body strength focused.
- Avoid more than 2-3 high-axial exposures per week for most users.
- In low-recovery states, replace axial work with supported or machine alternatives.

### Cap High Joint-Cost Stacking

Avoid too many high joint-cost movements for the same joint region in one week:

- heavy barbell pressing + dips + skull crushers
- heavy squats + hack squats + leg press at high volume
- deadlifts + RDLs + unsupported rows

### Do Not Replace All Compounds With Machines

Machines and cables are tools to manage fatigue, not a reason to abandon compounds. Strength and skill still require exposure to stable primary lifts.

### Respect Equipment Availability

The classification layer must degrade gracefully:

- If no machines: use dumbbell/cable/bodyweight alternatives.
- If no cables: use dumbbell or band alternatives.
- If home gym: reduce setup assumptions and use fewer station changes.

## Recommended V1 Implementation Approach

No implementation was done in this audit, but the safest future path is:

### 1. Add Classification Metadata Without Changing Behaviour

Introduce a separate mapping or derived helper:

`ExerciseStimulusFatigueProfile`

Fields:

- `primaryStimulus`
- `secondaryStimulus`
- `systemicFatigue`
- `localFatigue`
- `jointCost`
- `technicalComplexity`
- `axialLoading`
- `stabilityDemand`
- `setupBurden`
- `progressionReliability`

Keep values 0-3.

Initially derive from existing metadata (`kind`, `role`, `family`, `movementPattern`, `fatigueCost`, `jointStress`, `tier`) and override individual exercises where needed.

### 2. Create Audit Tests For The Classifier

Tests should verify obvious relationships, not fragile exact scores:

- Deadlift systemic fatigue > Leg Extension systemic fatigue
- Pec Deck systemic fatigue < Barbell Bench systemic fatigue
- Machine Chest Press progression reliability >= Dumbbell Bench Press
- Chest-Supported Row axial loading < Barbell Row
- Squat axial loading > Leg Press
- Isolation exercises have low secondary stimulus

### 3. Use The Classifier In Reporting First

Before changing generation, expose internal audit functions that summarise:

- weekly primary stimulus
- weekly systemic fatigue
- weekly axial loading
- weekly joint-cost exposure
- weekly secondary-muscle spillover

This lets ASC validate the model before it starts changing workouts.

### 4. Add Frequency-Aware Generator Constraints

Once validated, use the classifier to drive:

- weekly muscle stimulus targets
- systemic fatigue budget
- axial loading budget
- high-joint-cost caps
- session-length guardrails
- low-recovery substitutions

### 5. Keep The First Production Change Small

Recommended first generator change:

- cap 6-day per-session working sets using systemic fatigue budget
- allow 3-day plans to add low-systemic local stimulus where weekly target muscles are under-served
- avoid additional heavy axial compounds when axial budget is already high

This would address the training-days issue without rewriting the entire generator.

## Risks And Open Questions

### Risk: False Precision

The model should not pretend that a score of 2 vs 3 is exact. It is a coaching heuristic.

Mitigation: use broad 0-3 scores and only make decisions when differences are meaningful.

### Risk: Over-Machining The Programme

If fatigue minimisation is over-weighted, the app may drift away from important compound exposure.

Mitigation: maintain minimum exposure rules for goal-relevant primary lifts.

### Risk: Underestimating Secondary Muscle Contribution

Pressing affects triceps and front delts. Pulling affects biceps and rear delts. Squats and hinges affect trunk and posterior chain.

Mitigation: include secondary stimulus and secondary fatigue accounting.

### Risk: User-Specific Variation

Exercise fatigue is individual. Some users recover well from squats but poorly from deadlifts; others have the reverse.

Mitigation: v1 starts with population defaults, then future versions can adjust from user history, performance drops, soreness/recovery feedback, and exercise swaps.

### Risk: Equipment Bias

Commercial gym users may have machines and cables; home gym users may not.

Mitigation: the classifier should guide choices only inside available equipment constraints.

## Final Recommendation

ASC should adopt a v1 Exercise Stimulus vs Fatigue Classification layer before implementing Frequency-Aware Stimulus Distribution.

The classifier should not replace existing metadata. It should sit above it and translate exercise selection into practical coaching budgets:

- target-muscle stimulus
- systemic fatigue
- local fatigue
- joint/connective tissue cost
- axial loading
- progression reliability

This is the missing bridge between the current exercise taxonomy and a programme generator that can distribute weekly training stress like a coach rather than a spreadsheet.
