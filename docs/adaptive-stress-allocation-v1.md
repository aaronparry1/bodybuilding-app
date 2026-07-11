# Adaptive Stress Allocation v1

Status: research and system architecture only.  
Date: 2026-06-26

This document does not implement code, change workout generation, or modify progression logic. It defines a future decision architecture for the scientific engine that sits between collected training evidence and the next workout prescription.

## Scientific Philosophy

Adaptive Stress Allocation is not another periodisation model.

It is a decision system for answering one question:

> What is the lowest-fatigue intervention that is likely to move adaptation forward safely?

Traditional progression often asks:

```text
Did the user succeed?
↓
Add weight.
```

ASA asks:

```text
What adaptation are we trying to buy?
What stress did the user already pay?
What fatigue cost did that create?
What is the cheapest useful next dose?
```

The system should treat training as a trade-off between adaptation stimulus and fatigue cost. Mechanical tension, useful volume, intensity, proximity to failure, frequency, and exposure can all create adaptation. They also create different costs: local fatigue, systemic fatigue, connective tissue stress, joint irritation, psychological load, soreness, and adherence friction.

The app should not chase maximal stress. It should allocate enough stress to keep adaptation moving while preserving the user's ability to train consistently for months and years.

## Evidence Review

### Strong Evidence

#### Mechanical tension is central to hypertrophy and strength adaptation

Mechanical tension is widely recognised as a primary stimulus for muscle hypertrophy, with metabolic stress and muscle damage also historically discussed as contributing mechanisms. Schoenfeld's hypertrophy mechanism review describes mechanical tension, muscle damage, and metabolic stress as relevant factors, though more recent literature tends to place mechanical tension at the centre of the model.

App implication:

- The engine should preserve meaningful loaded tension.
- Low-fatigue work is not useful if it no longer provides sufficient tension.
- Hypertrophy work can be productive across many rep ranges if sets are challenging enough.

#### Volume is an adaptation lever, especially for hypertrophy

Weekly set volume has a dose-response relationship with hypertrophy in many analyses, although individual recoverability varies. Strength appears more specific and can show stronger diminishing returns from volume.

App implication:

- Volume increases can be useful, but should be earned.
- Adding sets is not the default next step.
- Volume allocation should be muscle-, exercise-, and goal-specific.

#### Proximity to failure affects stimulus and fatigue

Training close enough to failure can increase motor unit recruitment and hypertrophy stimulus, especially with lower loads. However, repeated failure or near-failure training increases fatigue cost and is not necessary on every set.

App implication:

- The engine should distinguish productive hard work from excessive grinding.
- Isolation exercises can tolerate closer-failure work better than heavy compounds.
- Constant near-limit work is a safety and adherence risk.

#### Specificity matters for maximal strength

Strength improvements depend on skill practice, neural adaptation, movement specificity, and exposure to heavier loads. This does not mean every week should add load, but it does mean strength goals require enough specific heavy practice.

App implication:

- Strength and powerlifting prescriptions should protect primary lift exposure.
- Load/intensity cannot be replaced entirely by extra volume.

#### Tendons and connective tissues adapt to loading, but generally require conservative progression

Tendon stiffness, morphology, and load tolerance can adapt to training, but connective tissue adaptation is slower and less immediately visible than muscular performance. Reviews of tendon adaptation support progressive loading and caution against abrupt stress spikes.

App implication:

- The engine should cap rapid loading and repeated high-strain exposures.
- A muscle may be ready for more load before the joint/tendon system should receive it.
- Consolidation is not wasted time; it is part of long-term tolerance.

### Moderate Evidence

#### Autoregulation improves prescription fit

Autoregulation methods such as RPE/RIR, velocity-based training, AMRAP/e1RM approaches, and flexible nonlinear periodisation adjust training based on current performance or readiness. Research supports autoregulation as a defensible alternative to rigid percentage progression, but exact superiority varies by context.

App implication:

- ASA can use performance data rather than requiring user-rated RPE/RIR.
- The engine needs confidence scoring because every input has noise.

#### Stress can be modelled as a practical budget

The exact biology of fatigue is not a single measurable account balance. However, coaches and researchers routinely manage training through workload, volume, intensity, frequency, soreness, readiness, performance trends, and deloads. As a product architecture, a stress budget is useful if treated as a decision heuristic, not a literal physiological currency.

App implication:

- Use stress budget as a bounded coaching model.
- Do not present it to users as a precise biological score.

#### Frequency distributes stress

Training frequency influences how volume and skill practice are distributed. When volume is equated, frequency effects are often smaller than users expect, but frequency can improve practice quality, reduce per-session fatigue, and improve adherence for some users.

App implication:

- Frequency should usually remain stable because it affects routine.
- The engine can redistribute work across sessions in future versions, but should not casually change days/week.

### Weak Evidence

#### Exact fatigue scoring is uncertain

Fatigue is multi-factorial and includes peripheral, central, psychological, connective tissue, and lifestyle components. A single app score cannot perfectly represent this.

App implication:

- Use categories and confidence bands.
- Prefer conservative actions when fatigue evidence is mixed.

#### Psychological stress and adherence cost are hard to quantify

Some users enjoy hard progression pressure. Others disengage when the app feels punishing. The literature supports the importance of adherence, but an app cannot reliably infer motivation from training logs alone.

App implication:

- Avoid overly frequent pullbacks that make users feel stalled.
- Avoid constant escalation that makes training feel hostile.
- Future user feedback inputs could improve this.

### Coach Experience Only

The following are useful coaching heuristics, not hard scientific laws:

- Add reps before load when load jumps are too large.
- Add sets to low-fatigue accessories before heavy compounds.
- Consolidate after a hard exposure before asking for another one.
- Reduce accessory volume before reducing primary lift practice.
- Use deloads only when fatigue evidence justifies them.
- Avoid changing exercise, load, sets, and reps all at once.

## Training Stress Definitions

### Mechanical Tension

Mechanical tension is force experienced by muscle fibres during contraction, especially under meaningful load and high motor unit recruitment.

Adaptation stimulus:

- primary driver of hypertrophy
- essential for strength adaptation
- created by heavy loads or challenging lighter sets

Fatigue cost:

- higher joint/tendon loading with heavy loads
- local muscle damage/soreness
- systemic fatigue when compounded across large muscle groups

### Volume

Volume is the amount of performed work. In app terms, the most useful unit is probably productive hard sets, with supporting context from reps, load, exercise role, and muscle involvement.

Adaptation stimulus:

- strong hypertrophy lever
- skill exposure for repeated lifts
- work capacity development

Fatigue cost:

- local fatigue and soreness
- recovery time
- connective tissue repetitive strain
- session length and adherence cost

### Intensity

Intensity can mean percentage of 1RM, absolute load, relative heaviness, or effort. ASA should separate these.

Use:

- `load_intensity`: load relative to estimated capacity
- `effort_intensity`: closeness to failure
- `exposure_intensity`: psychological/technical heaviness of the session

Adaptation stimulus:

- strength specificity
- high-threshold motor unit recruitment
- technical practice under heavy load

Fatigue cost:

- neural and psychological stress
- joint/connective tissue stress
- longer recovery after heavy compounds

### Proximity to Failure

Proximity to failure describes how close a set is to the point where another rep cannot be completed with acceptable form.

Adaptation stimulus:

- useful for hypertrophy when load is moderate/light
- helps ensure lower-load sets are stimulating

Fatigue cost:

- high local fatigue
- technique breakdown risk
- high systemic cost on compound lifts

### Frequency

Frequency is how often a movement, muscle, or quality is trained.

Adaptation stimulus:

- skill practice
- distributed volume
- repeated exposure for tolerance

Fatigue cost:

- reduced recovery between exposures
- scheduling/adherence friction
- overlap between muscle groups

### Fatigue

Fatigue is a temporary reduction in performance capacity or readiness caused by training and life stress.

Types:

- local muscular fatigue
- exercise-specific fatigue
- systemic fatigue
- connective tissue/joint stress
- psychological fatigue

ASA should not treat all fatigue as bad. Fatigue is often the price of useful work. The question is whether the fatigue is productive, expected, recoverable, and local, or regressive, systemic, and limiting adaptation.

### Recovery

Recovery is the restoration of performance capacity and readiness to train. It includes physiological repair, nervous-system readiness, psychological willingness, sleep, nutrition, and time.

For the app, recovery is inferred from:

- repeated performance
- set stability
- completion
- missed sessions
- shutdown classifications
- recovery/cardio/capacity state
- future sleep/bodyweight/HRV data

### Connective Tissue Stress

Connective tissue stress is the load and strain accumulated by tendons, ligaments, and joint structures.

Relevant drivers:

- rapid load increases
- repeated heavy exposures
- high volume in same pattern
- unfamiliar exercises
- long-length loading
- poor recovery

ASA must treat connective tissue stress as a lagging risk. It is not fully visible in the log until the user reports pain or starts failing.

### Psychological Stress

Psychological stress includes the perceived burden of training:

- fear of hard sessions
- frustration from repeated failure
- boredom from monotony
- pressure from constant progression demands
- adherence cost from long sessions

ASA should not turn training into a punishment engine. The best programme is the one the user can keep doing.

### Systemic Fatigue

Systemic fatigue is broad fatigue affecting multiple lifts, sessions, or movement patterns.

Signs:

- multiple primary lifts declining
- early shutdown across unrelated exercises
- falling quality sets
- reduced performance despite reduced volume
- missed sessions after heavy training blocks
- repeated inability to complete required work

Systemic fatigue should change the whole-session or block-level stress allocation.

## Adaptation Stimulus vs Fatigue Cost

Every prescription has two sides:

```text
Intervention
↓
Expected adaptation stimulus
↓
Fatigue and risk cost
↓
Net value for this user, goal, block, and week
```

Examples:

- `+1 rep` usually has modest stimulus and low cost.
- `+2.5 kg` has moderate-to-high stimulus depending lift, with moderate connective tissue and technical cost.
- `+1 set` has meaningful hypertrophy stimulus but high cumulative fatigue cost.
- `exercise change` may reduce joint stress but lowers progression confidence and skill continuity.
- `consolidation week` may reduce short-term stimulus but improve long-term adaptation by restoring performance.

ASA should choose the highest net-value option, not the loudest progression option.

## Evidence Inputs

### Essential Inputs

These are required for v1.

#### Performance

Includes completed reps, loads, sets, target-zone success, required work completion, set-to-set stability, and best-set trend.

Use:

- decide whether adaptation is moving
- detect overperformance or regression
- select load/reps/sets intervention

#### Estimated Strength

e1RM or equivalent performance estimate for exercises where it is valid.

Use:

- track strength direction
- compare load/rep equivalents
- prevent false regression labels

Confidence:

- high for primary compounds in lower-to-moderate rep ranges
- lower for high-rep sets, isolation work, new exercises, or inconsistent effort

#### Rep Quality Proxy

The app may not directly measure bar speed or technique, but it can infer quality from:

- reps within target zone
- drop-off
- completion
- manual finish
- early stop
- repeated missed work

Use:

- decide if load is too heavy
- detect overreaching
- avoid rewarding ugly performance

#### Fatigue and Recovery Evidence

Includes shutdown classification, performance trend, quality-set trend, systemic/local fatigue classification, missed required work, and Recovery Window signals.

Use:

- constrain progression
- choose local vs systemic intervention

#### Missed Sessions and Consistency

Missed or delayed planned sessions lower confidence and should prevent calendar-driven escalation.

Use:

- hold or repeat week
- reduce first exposure back
- avoid load jumps after interruption

#### Exercise History

Includes exercise age, prior performance, prior swaps, irritation/manual-negative markers, and role.

Use:

- decide confidence
- avoid overreacting to first exposure
- preserve specificity

#### Goal and Block

Goal and block define what adaptation the stress is buying.

Use:

- hypertrophy: volume/reps/local effort
- strength: load/specificity
- powerlifting: competition lift exposure
- meet prep: fatigue timing and taper

#### Training Age

Beginner/intermediate/advanced status changes expected progression rate and tolerance.

Use:

- beginners: more conservative variation and simpler progression
- advanced: smaller jumps, more consolidation, higher specificity

### Useful Inputs

These improve decisions but are not mandatory.

#### Workout Density

Session duration, rest patterns, and work per time.

Use:

- detect if fatigue comes from density rather than load
- avoid adding work to already long sessions

#### Capacity Work

Low Back Capacity and future capacity tracks.

Use:

- context for bracing/load-tolerance support
- not a direct progression signal for main lifts

#### Cardio

Cardio type, duration, intensity, timing, and completion.

Use:

- account for recovery-supportive cardio vs hard conditioning
- avoid lower-body interference before heavy lower sessions

#### Workout Review Outcomes

PRs, e1RM improvements, volume PRs, and completion stats.

Use:

- identify positive adaptation
- avoid unnecessary changes after successful waves

#### User-Reported Constraints

If available:

- soreness
- pain flags
- time pressure
- equipment limits

Use:

- improve safety and adherence decisions

### Future Inputs

These should be designed for, but not required.

#### Bodyweight

Use:

- recomposition/cutting context
- strength-to-bodyweight tracking
- interpreting performance during weight loss

#### Sleep

Use:

- readiness context
- avoid overreacting to one bad session after poor sleep

#### HRV / Resting Heart Rate

Use:

- systemic readiness support
- only as secondary context, not direct prescription owner

#### Nutrition Phase

Use:

- surplus: more volume tolerance likely
- deficit: preserve strength, avoid over-expansion
- maintenance: balanced progression

#### Subjective RPE/RIR

Optional advanced input.

Use:

- improve effort classification
- not required for default product experience

## Decision Architecture

ASA has five layers.

### Layer 1: Evidence Validation

Question:

> Can this evidence safely influence prescription?

Exclude:

- warm-up sets
- Session Prep
- capacity sessions
- cardio sessions
- corrupted sets
- incomplete workouts
- extra sessions unless explicitly relevant

Reduce confidence:

- new exercise
- high-rep e1RM estimate
- missed sessions
- recently changed equipment
- inconsistent logging

### Layer 2: State Classification

Classify each exercise/pattern/session:

- performance up / stable / down
- fatigue low / local / systemic
- confidence high / medium / low
- stress budget available / constrained / exceeded
- goal priority: hypertrophy / strength / preservation / meet prep

### Layer 3: Adaptation Target

Identify the adaptation being purchased:

- muscle growth
- strength expression
- strength skill
- work capacity
- recovery
- connective tissue tolerance
- adherence

### Layer 4: Intervention Selection

Choose the lowest-cost intervention likely to advance the adaptation target.

Intervention classes:

- load
- reps
- sets
- volume distribution
- effort/proximity
- exercise selection
- consolidation
- recovery
- capacity
- cardio

### Layer 5: Guardrail Enforcement

Before prescription is accepted:

- cap load jumps
- cap set increases
- block repeated near-limit exposures
- preserve primary lift specificity
- protect Recovery Window logic
- prevent week advancement from calendar alone
- keep non-main work out of progression evidence

## Decision Hierarchy

### Default Manipulation Order

When performance is positive and fatigue is acceptable:

1. **Hold or repeat if confidence is low**
2. **Add reps**
3. **Add load**
4. **Add set/volume**
5. **Increase intensity exposure**
6. **Change exercise**

When fatigue is high:

1. **Reduce accessory volume**
2. **Reduce proximity to failure**
3. **Consolidate**
4. **Reduce secondary lift load/volume**
5. **Reduce primary lift volume**
6. **Reduce primary lift load**
7. **Recovery Window**

### Why load is not first

Adding load is specific and satisfying, but it is not always the cheapest intervention.

Prefer reps when:

- the user is inside the target zone but not clearly above it
- equipment jumps are too large
- hypertrophy is the goal
- connective tissue stress is elevated
- fatigue is moderate

Prefer load when:

- top of target zone is clearly achieved
- set stability is good
- fatigue is low
- strength/powerlifting specificity matters
- available increment is appropriate

Prefer sets when:

- hypertrophy stimulus is likely insufficient
- performance is stable
- fatigue is low
- the exercise is low-fatigue
- the muscle is underdosed

Prefer consolidation when:

- progress happened but fatigue rose
- a hard productive week occurred
- load recently increased
- user is returning after interruption

Prefer exercise change when:

- repeated local irritation appears
- exercise has stalled despite appropriate stress allocation
- user repeatedly swaps it
- block transition requires a new stimulus

Prefer recovery intervention when:

- performance is falling
- fatigue is systemic
- multiple key lifts are affected
- reduced stress did not restore performance

## Stress Budget Framework

Stress budget is a coaching abstraction, not a literal biological bank account.

It is still useful because every user has a finite ability to tolerate:

- hard sets
- heavy exposures
- near-failure sets
- repeated movement stress
- dense sessions
- life stress
- cardio/conditioning
- capacity work

### Weekly Stress Budget

A weekly budget estimates what the user can tolerate in the current training week.

Budget inflows:

- rest days
- successful recovery
- consistent completion
- low fatigue
- easier consolidation week
- low-stress cardio

Budget outflows:

- hard compound sets
- high proximity to failure
- high session density
- repeated same-joint loading
- heavy axial loading
- missed sleep/future input
- hard conditioning
- early/regressive shutdowns

### Block-Level Stress Budget

A block budget tracks accumulated stress over multiple weeks.

Use:

- avoid endless week-to-week escalation
- decide when consolidation is due
- distinguish one hard week from accumulated fatigue
- protect meet prep/taper phases

### Stress Dimensions

Use separate budgets instead of one score:

1. **Muscle stimulus budget**
   - how much hypertrophy work a muscle receives

2. **Systemic fatigue budget**
   - whole-body recovery cost

3. **Joint/connective tissue budget**
   - repeated strain/load exposure by region/pattern

4. **Specificity budget**
   - how much key-lift practice is preserved

5. **Adherence budget**
   - session length, complexity, and psychological pressure

### Missed Sessions

Missed sessions should not automatically "replenish" the budget enough to progress.

Interpretation:

- If missed because life got busy: lower confidence, repeat or consolidate.
- If missed because fatigue was high: budget was exceeded, reduce stress.
- If missed but user returns strong: resume cautiously, not aggressively.

### Recovery Replenishment

Recovery replenishes budget when performance and completion confirm it.

Do not assume:

```text
calendar days passed = user is recovered
```

Use:

- next-session performance
- readiness/fatigue evidence
- completion
- trend recovery

## Intervention Hierarchy

| Intervention | Adaptation Benefit | Fatigue Cost | Joint/Connective Cost | Recovery Requirement | Sustainability | Best Use |
|---|---:|---:|---:|---:|---:|---|
| +1 rep | Low-moderate | Low | Low | Low | High | Hypertrophy, confidence building, large equipment jumps |
| Improve same prescription | Moderate | Low | Low | Low | Very high | Consolidation, low confidence, skill practice |
| +2.5 kg / small load jump | Moderate-high | Moderate | Moderate | Moderate | High if capped | Strength, top-zone success |
| Shift target reps down with higher load | High for strength | Moderate-high | Moderate-high | Moderate | Medium | Strength/intensity wave |
| +1 accessory set | Moderate-high hypertrophy | Moderate | Low-moderate | Moderate | Medium | Underdosed muscle, low fatigue |
| +1 heavy compound set | Moderate | High | High | High | Low-medium | Rare, strength/hypertrophy overlap |
| Reduce accessory volume | Preserves key stimulus | Low benefit, high fatigue relief | Low | Low | High | Early fatigue control |
| Reduce proximity to failure | Preserves work, lowers fatigue | Low adaptation loss | Low | Low | High | High fatigue, technique issues |
| Wave intensity | High | Controlled | Controlled | Moderate | High | Strength/powerlifting |
| Consolidation week | Preserves adaptation momentum | Low stimulus, high recovery value | Low | Low | High | After hard productive work |
| Change accessory exercise | Variable | Variable | Can reduce local stress | Low-moderate | Medium | Stalls, irritation, boredom |
| Change primary exercise | Low short-term specificity | Variable | Can reduce stress | Variable | Low in strength blocks | Pain/equipment/block transition |
| Recovery Window | Low immediate stimulus | High fatigue relief | Low | Low | High when justified | Systemic fatigue |
| Add cardio | Health/work capacity | Low to high | Low-moderate | Depends intensity | High if easy | Recovery, conditioning, recomposition |
| Add capacity work | Resilience/tolerance | Low-moderate | Targeted | Low-moderate | High if dosed | Low back/trunk/support |

## Decision Trees

### Performance Up, Fatigue Down

Interpretation:

- user adapted well
- stress budget available
- confidence may still depend on exercise age and goal

Preferred intervention:

1. add reps if inside target zone
2. add load if top-zone success is clear
3. add one low-fatigue set if hypertrophy stimulus is underdosed
4. preserve if upcoming consolidation/meet timing requires it

Avoid:

- adding load and volume together on heavy compounds
- unnecessary exercise changes

### Performance Up, Fatigue Up

Interpretation:

- adaptation is happening, but cost is rising
- this may be productive overreach or early warning

Preferred intervention:

1. hold load
2. consolidate
3. reduce accessory volume
4. keep primary exposure if goal requires it
5. avoid adding sets

Hypertrophy note:

- if fatigue is local and after target work, do not overreact.

Strength note:

- if fatigue affects primary compounds, reduce support work first.

### Performance Stable, Fatigue Down

Interpretation:

- user is tolerating work
- adaptation signal is not decisive

Preferred intervention:

1. add reps or technical quality target
2. small load increase only if top-zone evidence exists
3. add low-fatigue volume if hypertrophy goal and underdosed
4. otherwise hold

Avoid:

- treating stable performance as failure

### Performance Stable, Fatigue Up

Interpretation:

- cost is rising without visible adaptation

Preferred intervention:

1. hold load
2. reduce proximity to failure
3. remove one accessory/support set
4. consolidate
5. monitor next session

Avoid:

- adding volume
- chasing load to "force progress"

### Performance Down, Fatigue Down

Interpretation:

- likely low confidence, skill issue, interruption, poor setup, exercise mismatch, or insufficient stimulus

Preferred intervention:

1. check data quality
2. repeat prescription
3. simplify exercise or target
4. add stimulus only if repeated low-fatigue underperformance suggests underdosing
5. consider exercise familiarity

Avoid:

- immediate deload
- immediate aggressive load reduction unless safety requires it

### Performance Down, Fatigue Up

Interpretation:

- regressive fatigue likely
- stress budget exceeded

Preferred intervention:

1. reduce accessory volume
2. reduce effort/proximity
3. reduce secondary lift volume/load
4. preserve technical primary exposure where safe
5. trigger Recovery Window if repeated/systemic

Avoid:

- adding load
- adding sets
- reframing failure as productive without evidence

### Performance Mixed, Fatigue Local

Interpretation:

- one exercise, muscle, or region is struggling

Preferred intervention:

1. local pullback
2. reduce affected accessory volume
3. swap affected accessory if repeated
4. keep unaffected primary progression

Avoid:

- systemic deload unless trend spreads

### Performance Mixed, Fatigue Systemic

Interpretation:

- stress allocation is too high or too dense

Preferred intervention:

1. reduce total session stress
2. consolidate
3. Recovery Window if repeated
4. keep movement familiarity

Avoid:

- solving systemic fatigue with random exercise changes

## Goal-Specific Behaviour

### Hypertrophy

Adaptation target:

- muscle growth
- productive volume
- local effort tolerance

Stress allocation:

- more budget to local muscle volume
- less budget to heavy axial loading
- more tolerance for local fatigue after target work

Preferred interventions:

1. +1 rep
2. same load, more total reps
3. +1 set on low-fatigue accessories
4. small load jump after top-zone success
5. local pullback before systemic recovery

### General Strength

Adaptation target:

- improve force production
- maintain technical quality
- build specific lift exposure

Stress allocation:

- more budget to primary compounds
- less budget to accessory expansion

Preferred interventions:

1. small load jump after strong evidence
2. hold load and build reps
3. wave intensity
4. reduce accessory stress first

### Powerlifting

Adaptation target:

- squat/bench/deadlift specificity
- strength expression
- fatigue timing

Stress allocation:

- high specificity budget
- conservative novelty budget
- strict fatigue timing near meet

Preferred interventions:

1. preserve competition lift identity
2. wave top-set and back-off stress
3. reduce accessories before primary exposure
4. consolidate after heavy exposure

### Body Recomposition

Adaptation target:

- preserve/build muscle
- manage recovery in possible energy deficit
- integrate cardio without undermining lifting

Stress allocation:

- moderate lifting volume
- conservative progression
- cardio dose monitored

Preferred interventions:

1. hold strength performance
2. add reps before load
3. avoid aggressive volume expansion
4. use easy cardio as support

### Muscle Preservation

Adaptation target:

- maintain muscle and strength with minimum effective stress

Stress allocation:

- low total stress
- enough intensity/exposure to preserve adaptations

Preferred interventions:

1. maintain load exposure
2. keep volume stable
3. avoid unnecessary progression pressure

### Meet Prep

Adaptation target:

- express strength on the day
- reduce fatigue
- preserve confidence and specificity

Stress allocation:

- high specificity
- falling volume over time
- limited novelty

Preferred interventions:

1. keep competition lifts
2. reduce volume
3. maintain intensity exposure
4. avoid new exercises
5. taper before event

## Guardrails

### Prevent Runaway Fatigue

- no repeated high-stress weeks without consolidation
- systemic fatigue blocks progression
- multiple compound declines trigger stress reduction
- fatigue cost must be considered before adaptation benefit

### Prevent Runaway Volume

- set increases require repeated evidence
- no more than one set increase per exercise decision
- heavy compound set increases are rare
- volume increases must be reversible

### Prevent Runaway Intensity

- near-limit exposures are capped
- repeated grinders are negative evidence
- strength work can be heavy without being maximal

### Prevent Overuse

- track joint/pattern exposure
- avoid repeated high stress on the same pattern without recovery
- rotate accessories when local irritation repeats
- avoid changing primary lifts unless necessary

### Prevent Rapid Loading

- load jumps respect equipment increments
- large jumps default to rep progression
- post-interruption load jumps are blocked
- connective tissue risk rises with repeated increases

### Prevent Excessive Proximity to Failure

- compound lifts should not repeatedly hit near-failure
- isolation work can go harder but remains locally classified
- failure is not required for progression

### Prevent Loss of Adherence

- cap session length
- avoid excessive complexity
- avoid demoralising repeated failures
- avoid too many "you need recovery" messages when progress is good

## Examples

### Example 1: Hypertrophy Accessory Progress

Input:

- Lateral Raise: 12.5 kg x 18, 16, 15
- fatigue local only
- target zone hit
- no systemic decline

ASA decision:

- do not trigger Recovery Window
- add reps or hold load
- optional +1 set only if shoulder volume is under target and fatigue is low

Reason:

- local fatigue after useful work is expected
- load jump may be too large

### Example 2: Bench Strength Progress

Input:

- Bench Press: 100 kg x 6, 6, 5
- prior week: 100 kg x 5, 5, 5
- fatigue low
- target zone 4-6

ASA decision:

- small load increase or intensity-wave exposure
- keep sets stable

Reason:

- performance up, fatigue down
- strength goal supports load exposure

### Example 3: Squat Regression with High Fatigue

Input:

- Squat misses required work
- deadlift also down
- lower accessories shut down early
- two sessions in a row

ASA decision:

- reduce lower accessory volume
- reduce secondary lower intensity
- preserve technical squat exposure if safe
- consider Recovery Window if trend persists

Reason:

- systemic/regional fatigue, not lack of effort

### Example 4: Returning After Missed Week

Input:

- user took 10 days to finish a training week
- prior performance was good
- no current evidence after break

ASA decision:

- repeat or slightly reduce first exposure
- do not progress by calendar
- restore normal progression after completed evidence

Reason:

- recovery may be better, but confidence is lower

### Example 5: Recomposition With Cardio

Input:

- user completes two cardio sessions
- lower-body performance stable
- fatigue moderate

ASA decision:

- hold lower-body load
- allow upper-body rep progress
- avoid adding lower volume

Reason:

- cardio supports goal but consumes some recovery budget

## Future Data Inputs

### Bodyweight

Useful for:

- recomposition context
- interpreting strength changes
- identifying aggressive weight-loss impact

### Sleep

Useful for:

- explaining one-off bad sessions
- avoiding unnecessary deloads
- identifying recovery risk

### HRV and Resting Heart Rate

Useful for:

- systemic readiness context
- trend support, not direct prescription ownership

### Nutrition Phase

Useful for:

- deciding volume aggressiveness
- interpreting stalled strength
- protecting performance in deficit

### Optional RPE/RIR

Useful for:

- advanced lifters
- better effort classification
- distinguishing easy underperformance from true failure

### Pain/Discomfort Flags

Useful for:

- connective tissue risk
- exercise substitution
- local stress reduction

Must be framed as training feedback, not medical diagnosis.

## Open Research Questions

1. What is the best practical stress score without wearables?
2. How much evidence is needed before adding volume to a muscle?
3. How should the engine distinguish under-stimulation from poor execution?
4. How should cardio cost be weighted by intensity and timing?
5. Should stress budget be exposed to users or kept internal?
6. How should connective tissue exposure be estimated without pain reporting?
7. What threshold should trigger consolidation versus Recovery Window?
8. How should the app handle users who want faster progression despite guardrails?
9. Should advanced users get optional RPE/RIR mode?
10. How should ASA interact with future nutrition/bodyweight features?

## Research Citations

Core references:

- Schoenfeld. The mechanisms of muscle hypertrophy and their application to resistance training: https://pubmed.ncbi.nlm.nih.gov/20847704/
- Schoenfeld et al. Dose-response relationship between weekly resistance training volume and muscle mass: https://pubmed.ncbi.nlm.nih.gov/27433992/
- Krieger. Single vs multiple sets for hypertrophy meta-analysis: https://pubmed.ncbi.nlm.nih.gov/20300012/
- Ralston et al. Weekly set volume and strength gain meta-analysis: https://pmc.ncbi.nlm.nih.gov/articles/PMC5684266/
- Loading recommendations for strength, hypertrophy, and local endurance: https://pmc.ncbi.nlm.nih.gov/articles/PMC7927075/
- Resistance training variables for hypertrophy umbrella review: https://pmc.ncbi.nlm.nih.gov/articles/PMC9302196/
- Methods for regulating and monitoring resistance training: https://pmc.ncbi.nlm.nih.gov/articles/PMC7706636/
- Autoregulation in resistance training: https://pmc.ncbi.nlm.nih.gov/articles/PMC7575491/
- Helms et al. RPE-based load prescription in powerlifting: https://pubmed.ncbi.nlm.nih.gov/24662224/
- Zourdos et al. Flexible nonlinear periodisation/autoregulation: https://pubmed.ncbi.nlm.nih.gov/25144187/
- RPE as volume autoregulation in powerlifters: https://pubmed.ncbi.nlm.nih.gov/29786623/
- Resistance training to failure meta-analysis: https://pubmed.ncbi.nlm.nih.gov/33497853/
- Tendon and muscle adaptation review: https://pmc.ncbi.nlm.nih.gov/articles/PMC4637912/
- How tendons adapt to load: https://pmc.ncbi.nlm.nih.gov/articles/PMC6737558/
- Tendon mechanical/material adaptation review: https://pmc.ncbi.nlm.nih.gov/articles/PMC9474511/
- Effects of increased loading on tendon properties: https://pmc.ncbi.nlm.nih.gov/articles/PMC4535734/
- ACSM progression models in resistance training: https://pubmed.ncbi.nlm.nih.gov/19204579/
- Periodised versus non-periodised strength training meta-analysis: https://pubmed.ncbi.nlm.nih.gov/11828249/

## Final Assessment

Adaptive Stress Allocation can become the long-term coaching engine that differentiates Adaptive Strength Coach from traditional progression systems.

The differentiator is not simply "adaptive progression." Many apps can add weight after success. ASA's differentiator is choosing the lowest-fatigue effective dose:

- sometimes more load
- sometimes more reps
- sometimes one more set
- sometimes fewer accessories
- sometimes a consolidation week
- sometimes no change at all

This is closer to how a good coach thinks:

```text
What stimulus does this lifter need now?
What fatigue are they already carrying?
What is the smallest effective change that keeps the long game moving?
```

Final verdict: **yes, ASA should become the scientific decision layer beneath future Adaptive Strength Coach progression.**

Implementation should be gradual and test-led. ASA should first exist as an internal decision-state layer before it changes visible workout generation. The app must remain explainable, conservative when confidence is low, and ruthless about separating productive stress from regressive fatigue.
