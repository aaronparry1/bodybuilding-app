# Adaptive Programming Framework v1

Status: research and design only.  
Date: 2026-06-28

This document defines how Adaptive Strength Coach should choose training prescriptions in future programming work.

It does not change production app logic, progression, workout generation, subscription logic, or EAS build behaviour.

## Executive Summary

Adaptive Strength Coach must not randomly choose reps.

Every prescription should be traceable to four things:

1. Scientific support
2. Coaching rationale
3. Product rationale
4. Future validation method

The programming problem is not simply:

> What rep range should this exercise use?

The real question is:

> What is this set trying to achieve, at what fatigue cost, and how will the app know whether it worked?

ASC should therefore prescribe from a chain:

Goal -> exercise category -> training phase -> set objective -> coaching bias -> rep prescription -> load prescription -> adaptive set allocation.

Adaptive Set Allocation cannot be fully trusted until the app understands the intent of the set. A 2-4 set range means different things when the objective is calibration, productive volume, verification, performance expression, or recovery.

## Scientific Position

### Evidence Strength Key

- Strong evidence: supported by systematic reviews, meta-analyses, major position stands, or repeated converging evidence.
- Moderate evidence: supported by controlled studies, reviews, and strong consensus but with important population/context limits.
- Limited evidence: plausible and supported by some literature, but not yet robust enough to automate aggressively.
- Coaching judgement: widely used by experienced coaches but not strongly testable in the current literature.
- ASC principle: product-specific rule derived from the Adaptive Coaching Manifesto and V2 lab architecture.

## Evidence Review

### Hypertrophy Rep and Loading Ranges

Strong evidence:

- Hypertrophy can occur across a wide loading spectrum when sets are performed with sufficient effort.
- Heavier loads are not required for hypertrophy, but they are usually superior for maximal strength development.
- Weekly volume has a dose-response relationship with hypertrophy up to a point, but more volume carries more recovery cost and eventually becomes unproductive.

Practical interpretation:

- Hypertrophy work should not be locked to 8-12 forever.
- ASC can use 6-10, 8-12, 10-15, 10-20, and 12-25 depending on exercise category, joint cost, skill demand, and phase.
- The app should care about quality work volume, not just total sets.
- High-rep work becomes valid when the exercise is stable, local, and low systemic cost.
- Heavy compound hypertrophy work should remain more constrained because joint, axial, technical, and systemic costs rise.

Key sources:

- Schoenfeld, Grgic, Ogborn, and Krieger, "Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training", Journal of Strength and Conditioning Research, 2017: https://pubmed.ncbi.nlm.nih.gov/28834797/
- Schoenfeld, Ogborn, and Krieger, "Dose-response relationship between weekly resistance training volume and increases in muscle mass", Journal of Sports Sciences, 2017: https://pubmed.ncbi.nlm.nih.gov/27433992/
- Fink et al. and later load-spectrum reviews support broad hypertrophy loading when effort is sufficient; see also "Loading Recommendations for Muscle Strength, Hypertrophy, and Local Endurance", Sports, 2021: https://www.mdpi.com/2075-4663/9/2/32

### Strength Intensity Ranges

Strong evidence:

- Maximal strength is best developed with meaningful exposure to heavier loads.
- Heavy loading is more specific to maximal strength than low-load/high-rep work.
- Strength programming benefits from specificity, technical practice, sufficient rest, and controlled fatigue.

Practical interpretation:

- Strength work should include sub-6 rep zones.
- Singles, doubles, and triples are valid when the phase and athlete justify them.
- 3-5 reps should be a default strength-development zone for many primary lifts.
- 5-8 reps can support secondary strength work and hypertrophy-strength bridge work.
- ASC should not use heavy singles as random novelty; they need a set objective and safety context.

Key source:

- ACSM Position Stand, "Progression Models in Resistance Training for Healthy Adults", 2009, recommends wider loading from 1-12RM for intermediate/advanced strength training with eventual emphasis on heavy 1-6RM loading and longer rest periods: https://pubmed.ncbi.nlm.nih.gov/19204579/

### Prilepin's Chart and Limitations

Moderate coaching value, limited direct evidence.

Useful principle:

- As intensity rises, total reps should usually fall.
- High-intensity work should be lower volume.
- Submaximal heavy practice can improve skill and confidence under load.

Limitations:

- It was derived from Soviet Olympic weightlifting training logs, not modern commercial-gym strength/hypertrophy users.
- It is descriptive, not a universal prescription engine.
- It uses broad intensity bands and does not account for exercise category, training age, fatigue, goal, body size, frequency, or individual response.
- It does not tell the app whether a set should be calibration, productive work, verification, performance expression, or recovery.

ASC policy:

- Use Prilepin-inspired boundaries as guardrails for heavy total reps.
- Do not use Prilepin's chart as a literal generator.
- Do not apply Olympic-lift volume tables blindly to squat, bench, deadlift, machine compounds, or isolation work.

Key sources:

- Catalyst Athletics notes the chart is descriptive and based on snatch/clean and jerk training logs, with limited transfer to other lifts: https://www.catalystathletics.com/article/2229/Prilepins-Table-for-Olympic-Weightlifting/
- Reactive Training Systems argues the useful takeaway is submaximal heavy practice and lower volume at higher intensities, not blind adherence: https://store.reactivetrainingsystems.com/blogs/advanced-concepts/why-i-dont-use-prilepins-chart

### Power Training Prescriptions

Strong-to-moderate evidence and consensus:

- Power work should use high intent, low-to-moderate fatigue, adequate rest, and quality termination.
- Low reps are preferred because fatigue reduces output quality.
- Without velocity sensors, ASC must not claim bar-speed measurement.

Practical interpretation:

- Power prescriptions should usually use 1-5 reps.
- Jumps/throws may use small clusters such as 3-6 quality efforts.
- Loaded power work should stop when execution quality drops.
- Power work should normally occur early in the session.

Key source:

- ACSM 2009 describes power training through strength training plus lighter loads performed fast, with longer rest and multiple sets: https://pubmed.ncbi.nlm.nih.gov/19204579/

### Peaking Prescriptions

Moderate evidence, strong coaching consensus:

- Peaking for maximal strength usually increases specificity, keeps intensity exposure, reduces volume, and reduces fatigue.
- Powerlifting-specific taper evidence is limited compared with endurance sports, but practical consensus strongly supports fatigue reduction before maximal performance.

Practical interpretation:

- Peak work should use singles, doubles, triples, and low-rep specific practice.
- Accessory volume and novelty should fall.
- Heavy exposures should be deliberate, not frequent AMRAPs.
- ASC should not turn peak blocks into normal hypertrophy/strength blocks with a new label.

Key sources:

- Travis, Mujika, Gentles, Stone, and Bazyler, "Tapering and Peaking Maximal Strength for Powerlifting Performance", Sports, 2020: https://pmc.ncbi.nlm.nih.gov/articles/PMC7552788/
- Stronger by Science tapering overview: https://www.strongerbyscience.com/tapering/

### Autoregulation Without RPE/RIR

Moderate evidence for autoregulation generally, ASC-specific implementation principle.

Evidence:

- Autoregulated approaches can perform similarly or better than fixed progression, depending on method and context.
- Existing autoregulation research often uses RPE, velocity, or APRE.

ASC stance:

- ASC should not require routine RPE/RIR.
- The coach should trust behaviour more than feelings.
- The app can autoregulate from objective evidence:
  - target-range success
  - below-minimum events
  - comparable-load trends
  - load ownership
  - shutdown/drop-off
  - session completion
  - exercise history
  - recovery week response
  - safety context

Key sources:

- "The Effect of Load and Volume Autoregulation on Muscular Strength and Hypertrophy", Sports Medicine, 2022: https://pmc.ncbi.nlm.nih.gov/articles/PMC8762534/
- "Methods for Regulating and Monitoring Resistance Training", 2020: https://pmc.ncbi.nlm.nih.gov/articles/PMC7706636/

### AMRAP Benefits and Risks

Limited direct evidence, strong coaching relevance.

Benefits:

- Can calibrate a load when history is uncertain.
- Can expose whether a load is too light or too heavy.
- Can create useful performance data after a plateau or training interruption.
- Can provide motivation and milestone value.

Risks:

- High fatigue cost.
- Technique degradation.
- Recovery disruption.
- Ego-driven overreaching.
- Poor fit for high-risk lifts, peak phases, recovery weeks, pain contexts, or low-evidence users.

ASC policy:

- AMRAP should be a data tool, not a default set style.
- AMRAP should be used sparingly and with clear intent.
- AMRAP outcomes should be interpreted over follow-up windows, not as automatic progression proof.

### Training to Failure Literature

Moderate evidence:

- Training to failure is not required for maximal strength.
- Failure may be more relevant in low-load hypertrophy contexts, but it adds fatigue.
- Repeated failure is often a poor fit for long-term strength and skill development.

ASC interpretation:

- Failure is a tool, not a virtue.
- ASC should generally avoid routine failure on compounds.
- Isolation exercises can tolerate closer-to-failure work when safety and recovery are good.
- Duration/bodyweight holds may approach local fatigue, but should stop before form loss.

Key sources:

- "Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy", Sports Medicine, 2023: https://pubmed.ncbi.nlm.nih.gov/36334240/
- "Effects of resistance training performed to repetition failure or non-failure on muscular strength and hypertrophy", Journal of Sport and Health Science, 2021: https://pubmed.ncbi.nlm.nih.gov/33497853/

### Periodisation and Variation Evidence

Moderate evidence:

- Periodized training tends to outperform non-periodized training for maximal strength, especially when volume is equated.
- Hypertrophy may be less dependent on classic periodisation than strength, but variation can still support fatigue management, skill, adherence, and long-term progression.

ASC interpretation:

- Variation must be purposeful.
- Rep/load changes should reflect phase, exercise category, set objective, and evidence.
- Random novelty is not adaptive programming.

Key sources:

- Moesgaard et al., "Effects of Periodization on Strength and Muscle Hypertrophy in Volume-Equated Resistance Training Programs", Sports Medicine, 2022: https://pubmed.ncbi.nlm.nih.gov/35044672/
- Williams et al., "Comparison of Periodized and Non-Periodized Resistance Training on Maximal Strength", Sports Medicine, 2017: https://pubmed.ncbi.nlm.nih.gov/28497285/

## Set Objectives

ASC should assign every working set an objective. The same exercise can use different objectives across phases or even within a session.

### 1. Calibration

Purpose:

- Discover the current useful load, rep, or duration zone.
- Resolve uncertainty after a new exercise, missed time, plateau, equipment change, or stale history.

When used:

- New exercise or new variation
- Low confidence history
- Return from break
- After repeated under/over-shooting
- After meaningful bodyweight/equipment/context change

When avoided:

- Pain/safety concern
- Late peak/taper unless specifically planned
- Recovery week
- High systemic fatigue
- User has already provided recent high-quality comparable evidence

Fatigue cost:

- Low to high depending method. Fixed submax calibration is low; AMRAP calibration is high.

Data value:

- High.

Example prescription:

- Bench Press: 3 x 5 at conservative load, verify all sets inside 3-5 without grind.
- Lateral Raise: 2 x 15-20, optional top-range check on last set if low fatigue.
- Plank: 2 x 30-45 sec, find controlled duration before shaking/form loss.

### 2. Productive

Purpose:

- Accumulate useful training stimulus.
- Build muscle, strength skill, work capacity, or support tissue tolerance.

When used:

- Normal training weeks
- Stable exercise history
- Block-building phases
- Hypertrophy and strength-hypertrophy work

When avoided:

- Severe fatigue or safety concern
- Late peak when volume is reduced
- When verification is more important than volume

Fatigue cost:

- Moderate; depends on exercise category and set count.

Data value:

- Moderate. It shows whether the athlete can complete useful work, but is less diagnostic than calibration or verification.

Example prescription:

- Machine Chest Press: 2-4 x 8-12
- Leg Extension: 2-5 x 12-20
- Squat secondary work: 2-4 x 5-8

### 3. Verification

Purpose:

- Confirm ownership of a load, rep zone, duration, or movement before progressing.

When used:

- After load increase
- After a swap improved performance
- After a near miss
- Before a higher-risk push
- During consolidation weeks

When avoided:

- If evidence already strongly confirms ownership
- If safety gate would restrict the movement

Fatigue cost:

- Low to moderate. Verification should usually avoid maximal effort.

Data value:

- Very high.

Example prescription:

- Bench Press: 3 x 5 at the new load before another load push.
- Spider Curl: 2-4 x 12-25 at the heavier dumbbells, confirm reps stay in range.
- Deadlift: 2 x 3 at a stable load, no extra volume.

### 4. Performance

Purpose:

- Express performance under controlled conditions.
- Produce a meaningful PR, rep PR, heavy single/double/triple, or meet-specific readiness signal.

When used:

- Peak/intensification
- Planned test
- Strong evidence quality
- Safety clear
- Recovery strong
- Meaningful milestone opportunity

When avoided:

- Low evidence
- Pain or worsening symptoms
- Recent shutdown/missed range
- High workload density
- Early hypertrophy base
- Recovery week

Fatigue cost:

- High.

Data value:

- High but noisy. Performance can be affected by arousal, setup, sleep, and novelty.

Example prescription:

- Competition Bench: 1-3 singles at 85-92% estimated 1RM, then back-off volume only if quality remains high.
- Squat: planned rep PR attempt at a verified load, not an open-ended grind.

### 5. Recovery

Purpose:

- Maintain movement, confidence, blood flow, and skill while reducing stress.

When used:

- Recovery Window
- Post-illness/travel return
- Deload/recovery week
- After systemic fatigue evidence
- When pain/safety context restricts aggressive work

When avoided:

- If used as a lazy substitute for necessary productive work without evidence.

Fatigue cost:

- Low.

Data value:

- Low to moderate. It confirms tolerance, not peak ability.

Example prescription:

- Squat pattern: 1-3 x 6-8 easy, familiar load, no progression.
- Chest-supported row: 1-2 x 10-12, controlled.
- Plank: 1-2 x 20-30 sec, clean bracing.

## Coaching Biases

Set objective defines why the set exists. Coaching bias defines what quality the set emphasises.

### Tension Bias

Purpose:

- High mechanical tension with controlled fatigue.

Best fit:

- Strength-hypertrophy compounds
- Machine compounds
- Stable heavy accessories

Typical prescription:

- 4-8 or 6-10 reps
- Moderate-to-heavy load
- Avoid frequent failure

### Balanced Bias

Purpose:

- Blend load, volume, execution quality, and recoverability.

Best fit:

- General strength/hypertrophy
- Intermediate users
- Productive blocks

Typical prescription:

- 6-10, 8-12, or 8-15

### Metabolic Bias

Purpose:

- Local stimulus with lower joint/systemic cost.

Best fit:

- Isolation
- Machines/cables
- Small muscle work
- Later session slots

Typical prescription:

- 10-20 or 12-25
- AMRAP only as controlled top-range check, not routine failure

### Speed/Power Bias

Purpose:

- Explosive intent and output quality.

Best fit:

- Jumps, throws, Olympic-lift derivatives, speed pulls/presses/squats where appropriate.

Typical prescription:

- 1-5 reps or small clusters
- Stop on quality drop
- Longer rests

### Skill Bias

Purpose:

- Practice a technical lift or position without excessive fatigue.

Best fit:

- Competition lifts
- New variations
- Peak/skill phases

Typical prescription:

- Singles, doubles, triples, or low-rep submax sets
- More total exposures only when fatigue is low

### Recovery Bias

Purpose:

- Keep movement and confidence while reducing fatigue.

Best fit:

- Recovery Window, post-disruption, low recovery capacity.

Typical prescription:

- Low sets, moderate reps, easy load
- No aggressive top-range checks

### Peak Bias

Purpose:

- Express strength while dissipating fatigue.

Best fit:

- Powerlifting meet prep, test week, performance block.

Typical prescription:

- Singles/doubles/triples
- Specific lifts
- Low accessory volume

## Exercise Category Prescriptions

### Competition Squat

Primary adaptations:

- Maximal strength, skill, bracing, confidence under load.

Default zones:

- Strength base: 3-5 reps
- Intensification: 1-4 reps
- Peak: singles/doubles/triples
- Hypertrophy-support phase: 5-8 or 6-10 only if fatigue context supports it

Avoid:

- Frequent AMRAP
- High-rep failure
- Random metabolic work
- Large set expansion under fatigue

### Competition Bench Press

Primary adaptations:

- Maximal upper-body pressing strength, technical practice, repeatable setup.

Default zones:

- Strength base: 3-6
- Strength-hypertrophy: 5-8 or 6-10
- Peak: singles/doubles/triples
- Verification: repeated 3-5 or 4-6 exposures

AMRAP:

- More tolerable than squat/deadlift but still not routine.

### Competition Deadlift

Primary adaptations:

- Maximal pulling strength, hinge skill, posterior-chain force.

Default zones:

- Strength base: 2-5
- Peak: singles/doubles/triples
- Recovery exposure: 1-3 low-volume easy sets

Avoid:

- High-volume AMRAP
- Repeated failure
- Excessive same-week intensity density

### Standing Overhead Press

Primary adaptations:

- Secondary strength, shoulder/triceps strength, upper-body skill.

Default zones:

- Strength: 3-6
- Strength-hypertrophy: 5-8 or 6-10
- Productive accessory: 6-10

### Heavy Compounds

Examples:

- Front Squat, RDL, Barbell Row, Incline Barbell Press, Weighted Pull-Up.

Default zones:

- Strength support: 4-8 or 5-8
- Hypertrophy support: 6-10 or 8-12

Bias:

- Tension or balanced.

### Machine Compounds

Examples:

- Leg Press, Hack Squat, Machine Chest Press, Chest-Supported Row.

Default zones:

- 8-12, 8-15, or 10-15

Bias:

- Balanced or metabolic/tension blend.

Notes:

- Lower technical and stability cost can justify higher reps or more set flexibility than barbell compounds.

### Isolation

Examples:

- Pec Deck, Cable Fly, Lateral Raise, Triceps Pressdown, Curl, Leg Extension.

Default zones:

- 10-20
- 12-25 for small muscles, delts, calves, and low-risk local work

Bias:

- Metabolic or local tension.

Top-range checks:

- Useful here when recovery is good.

### Power Movements

Examples:

- Jumps, throws, power cleans, high pulls, speed squats, speed presses.

Default zones:

- 1-5 reps
- 3-6 quality efforts for jumps/throws

Bias:

- Speed/power.

Termination:

- Stop when quality drops.
- Do not claim bar speed without sensors.

### Bodyweight and Duration Movements

Examples:

- Pull-ups, push-ups, plank, side plank, dead hang, carries/holds.

Default zones:

- Bodyweight reps: 5-15, 8-15, or 10-20 depending difficulty.
- Duration: 20-60 sec in controlled progressions.

Progression:

- Reps or seconds first.
- Load only after control and target duration/reps are owned.

## Strength Prescriptions

ASC should support sub-3 rep work when the objective justifies it.

### Singles

Use for:

- Skill under heavy load
- Peak readiness
- Performance expression
- Confidence under specificity

Avoid:

- Low-evidence beginners
- Pain/safety concern
- Fatigue accumulation
- Random weekly testing

Typical:

- 1-3 singles
- Conservative load unless explicitly performance objective

### Doubles

Use for:

- Heavy practice with slightly more exposure than singles
- Peak/intensification
- Technical confidence

Typical:

- 2-4 sets of 2 depending phase and fatigue

### Triples

Use for:

- Main strength development
- Verification of load ownership
- Bridge from base to intensification

Typical:

- 2-5 sets of 3

### 3-5 Strength Work

Use for:

- Primary strength development
- Specificity without constant maximal attempts

Typical:

- 3-5 sets, but Adaptive Set Allocation may stop earlier inside the prescribed range when stimulus is achieved.

### 5-8 Secondary Strength Work

Use for:

- Secondary compounds
- Strength-hypertrophy bridge
- Technical variations

Typical:

- 2-4 sets.

### Prilepin-Inspired Boundaries

ASC should use broad heavy-work guardrails:

- 90%+ estimated 1RM: very low total reps, usually singles/doubles.
- 80-89%: low-to-moderate total reps, mostly doubles/triples/fives depending lift.
- 70-79%: moderate total reps possible, but still governed by phase and fatigue.

Do not use these as literal tables.

### Peak and Intensification Handling

Peak/intensification should:

- increase specificity
- lower accessory volume
- reduce novelty
- preserve confidence
- avoid fatigue-chasing
- use heavy exposures deliberately

## Hypertrophy Prescriptions

### Controlled Fixed Reps

Use when:

- exercise is new
- form consistency matters
- fatigue risk is moderate/high
- the app needs stable comparable evidence

Examples:

- 3 x 10
- 2-4 x 8-12 with prescribed stop guidance

### Higher-Rep Metabolic Work

Use when:

- isolation or machine exercise
- low systemic fatigue
- target muscle benefits from local stimulus
- joint cost is low

Examples:

- 2-5 x 12-25 curls, raises, extensions

### Top-Range Checks

Definition:

- A controlled set where the user is allowed to show they can reach or exceed the top of a range without turning it into a reckless AMRAP.

Use when:

- history is stable
- recovery is acceptable
- exercise is low-to-moderate risk
- ASC needs evidence for progression

Avoid:

- high-risk compounds under fatigue
- pain/safety concerns
- recovery weeks

### AMRAP Calibration

Use only when:

- history is uncertain
- plateau requires diagnosis
- load appears miscalibrated
- low-risk exercise
- fatigue context is good

Not every session.

### Quality Volume Rules

Count as quality volume when:

- working set, not warm-up
- inside target range or valid productive-fatigue context
- technique not clearly broken
- not recovery/cardio/capacity unless that is the programmed goal
- not an unintended extra-session artifact

Do not count:

- junk volume after missed minimum
- warm-ups
- forced failure with poor follow-up
- extra sessions unless explicitly intended as evidence

### Why Ranges Alone Can Be Abused

An 8-12 range does not mean:

- always chase 12
- always add load at 13
- always do max sets
- treat 8 as failure

It means:

- the prescription has an intended zone
- the coach interprets performance in context
- top-range success requires confirmation
- below-minimum evidence requires faster correction than above-range evidence earns progression

## Power Prescriptions

Power work should prioritise:

- low reps
- high intent
- high quality
- low fatigue
- longer rests
- early session placement
- termination when quality drops

ASC must not:

- infer bar speed without sensors
- chase fatigue
- add junk volume
- use high-rep grinders as power work

Example prescriptions:

- Box Jump: 3-5 x 3
- Medicine Ball Chest Throw: 3-5 x 3-5
- Speed Bench: 4-6 x 2-3, crisp execution
- Power Clean: 3-5 x 1-3 for technically suitable users

## Peaking Prescriptions

Peaking should emphasise:

- specificity
- lower volume
- higher intensity
- fatigue reduction
- singles/doubles/triples
- performance expression
- confidence

Peaking should suppress:

- new exercises
- high-rep failure
- aggressive accessories
- unnecessary cardio/capacity fatigue
- AMRAPs unless deliberately planned and safe

Example:

- Competition Squat: work to 1-3 controlled singles, then optional low-volume back-off if quality remains high.
- Competition Bench: doubles/triples early peak, singles closer to test/meet.
- Deadlift: very constrained heavy exposure.

## AMRAP Policy

ASC may use AMRAP when the data value clearly exceeds the fatigue cost.

Allowed contexts:

- early exercise calibration
- after uncertainty
- after plateau
- periodic re-test
- low-risk isolation top-range check
- selected performance milestone

Avoid contexts:

- every session
- high fatigue
- pain/safety concern
- recovery week
- late peak unless deliberately planned
- high-risk squat/deadlift contexts
- low evidence user who may misinterpret the task

AMRAP interpretation rules:

- One AMRAP does not prove readiness for aggressive progression.
- AMRAP success should be followed by verification or consolidation when the cost is meaningful.
- AMRAP failure should be localised first unless systemic evidence exists.

## Decision Tree

```text
Goal
  -> exercise category
    -> training phase
      -> set objective
        -> coaching bias
          -> rep or duration prescription
            -> load prescription
              -> set allocation
                -> follow-up validation
```

### Step 1: Goal

- Strength
- Build Muscle
- Build Muscle + Strength
- Get Lean
- Athletic Performance
- Maintenance
- Powerlifting Meet / Peak

### Step 2: Exercise Category

- Competition squat
- Competition bench
- Competition deadlift
- Standing overhead press
- Heavy compound
- Machine compound
- Isolation
- Power movement
- Bodyweight/duration

### Step 3: Training Phase

- Base
- Accumulation
- Intensification
- Consolidation
- Peak
- Recovery Window
- Return-to-training

### Step 4: Set Objective

- Calibration
- Productive
- Verification
- Performance
- Recovery

### Step 5: Coaching Bias

- Tension
- Balanced
- Metabolic
- Speed/power
- Skill
- Recovery
- Peak

### Step 6: Rep/Duration Prescription

Examples:

- Strength skill: 1-3
- Strength development: 3-5
- Secondary strength: 5-8
- Balanced hypertrophy: 8-12
- Machine/unilateral hypertrophy: 8-15
- Isolation/local stimulus: 10-20 or 12-25
- Duration: 20-60 sec
- Power: 1-5

### Step 7: Load Prescription

Load should match:

- objective
- rep zone
- exercise category
- evidence quality
- load ownership
- safety state
- available equipment jumps

ASC should prefer:

- conservative load introduction
- verification before meaningful push
- faster correction for below-minimum failure than progression from above-range success

### Step 8: Adaptive Set Allocation

Set allocation asks:

> What is the marginal value of one more set?

But it must be interpreted through objective:

- Calibration: another set may be valuable if uncertainty remains.
- Productive: another set is useful only while quality remains high enough.
- Verification: enough clean evidence may be more valuable than max volume.
- Performance: extra sets may impair the point of the session.
- Recovery: minimum effective movement is usually enough.

## Production Implications

### Why Adaptive Set Allocation Should Not Be Fully Trusted Yet

Adaptive Set Allocation v1 currently decides whether the user has likely done enough productive sets inside a prescribed range.

That is useful, but incomplete.

It does not yet know:

- whether the set is calibration, productive, verification, performance, or recovery
- whether the rep range was chosen for tension, metabolic stress, skill, peak specificity, or power
- whether top-range success is supposed to trigger a check, consolidation, or progression
- whether the exercise is being used for load ownership, quality volume, or fatigue reduction
- whether an AMRAP is allowed today

Therefore:

- ASA can be advisory.
- ASA should not become a global volume authority until programming intent exists.
- Future production should attach set objective and coaching bias to each slot before trusting set allocation decisions deeply.

### Data Model Implications

Future production slots may need:

- `setObjective`
- `coachingBias`
- `repPrescriptionType`
- `loadIntent`
- `amrapPolicy`
- `topRangeCheckPolicy`
- `powerQualityPolicy`
- `peakSpecificityFlag`
- `validationMethod`

Do not add these blindly. Validate in the lab first.

### Future Validation Method

Every prescription type should be tested against:

- Coaching Gauntlet scenarios
- 12-week and 52-week simulations
- Load Ownership outcomes
- Push Outcome Learning
- Athlete Lifetime Progress delta
- safety veto scenarios
- real-world anonymised outcome data only after explicit release criteria

## Open Questions

1. Should ASC ever expose set objective to users, or keep it internal?
2. Should advanced powerlifters have optional AMRAP/heavy single controls, or should ASC keep those fully coach-controlled?
3. How should ASC validate power quality without velocity sensors?
4. Should top-range checks be stored as a distinct set type or inferred from context?
5. How should duration exercises integrate with load ownership when loading eventually becomes possible?
6. How conservative should AMRAP use be for commercial-gym general users?
7. Should peaking prescriptions exist only in Powerlifting Meet mode, or also in Strength milestone blocks?

## Final Position

Adaptive Strength Coach should move from generic rep ranges toward intent-based prescriptions.

The future system should not ask:

> What reps do we usually use for this exercise?

It should ask:

> What adaptation are we buying, what fatigue are we spending, and what evidence will tell us whether the dose worked?

This framework becomes the programming foundation for future V2 work.

