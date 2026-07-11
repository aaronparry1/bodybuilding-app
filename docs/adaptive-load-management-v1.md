# Adaptive Load Management v1

Status: research and system design only.  
Date: 2026-06-26

This document does not change app code, workout generation, or progression logic. It defines a scientific and coaching foundation for a future Adaptive Load Management system.

## Executive Summary

Adaptive Strength Coach should move from a simple "successful week = add weight" model toward a bounded Adaptive Load Management engine.

The core reason is simple: strength and hypertrophy progression are not linear. A good week does not always mean load should increase. It may mean the user should:

- repeat the load with more control
- add reps
- add one set
- reduce volume and express strength
- consolidate after a hard exposure
- hold load while fatigue clears
- reduce stress before performance drops

The proposed system should manipulate load, reps, sets, intensity, effort, and exposure while keeping the user experience simple:

> The app knows when to push me and when to back off.

Final verdict: **yes, Adaptive Strength Coach should move toward Adaptive Load Management**, but only as a constrained, evidence-led replacement for naive weekly progression. It should not become a black-box novelty engine. It should preserve stable plans, stable exercise intent, and clear guardrails.

Recommended direction:

- Keep the existing block structure.
- Keep target zones.
- Keep performance-based evidence rather than forcing RPE/RIR input.
- Replace fixed weekly load jumps with a decision policy that can choose push, repeat, rep progress, volume progress, intensity exposure, consolidation, or pullback.
- Treat equivalent performances as valid progress.
- Wave stress across weeks and blocks.
- Separate hypertrophy, strength, powerlifting, recomposition, preservation, and meet-prep behaviour.
- Prevent runaway fatigue and constant high-effort exposures.

## Evidence Review

### Strong Evidence

#### Progressive overload is necessary, but not synonymous with weekly load increases

Resistance training adaptations require progressive challenge over time. ACSM progression models support manipulating load, volume, rest, exercise selection, and frequency according to training status and goals, not only adding weight every week.

Implication for the app:

- Progression should be multi-variable.
- Load progression is one tool, not the only tool.
- Stable or slightly lower load with more reps, better performance, or lower fatigue can still be productive.

#### Volume matters for hypertrophy, with recoverability limits

Schoenfeld, Ogborn, and Krieger's dose-response meta-analysis supports a graded relationship between weekly set volume and hypertrophy, with higher weekly set categories generally outperforming very low volumes. Krieger's earlier meta-analysis also supports multiple sets outperforming single sets for hypertrophy.

Implication:

- Hypertrophy progression should often be volume- and rep-tolerance aware.
- More volume is not automatically better; the app must use performance and recovery evidence to decide whether volume is productive.

#### Training close enough to failure matters for hypertrophy, but constant failure is unnecessary

The literature broadly supports that hypertrophy can occur across a wide loading range when sets are sufficiently challenging. Training to momentary failure is not required for all sets and may increase fatigue cost, especially on compound lifts and higher-volume plans.

Implication:

- Hypertrophy work should reach useful proximity, but the system should not drive every set toward RPE 9-10.
- Isolation/accessory work can tolerate closer-to-failure exposures better than heavy primary compounds.

#### Specificity matters more for maximal strength

Strength improvements are more load-, skill-, and lift-specific than hypertrophy. Heavy exposure, technical practice, and specific movement patterns matter.

Implication:

- Strength and powerlifting blocks should preserve primary lift exposure.
- Load/intensity waves matter more than pure set accumulation.
- Accessories should support the lift rather than create unbounded bodybuilding fatigue.

#### Periodisation generally helps organise stress

Traditional, undulating, and block-periodised models all provide ways to distribute volume, intensity, and fatigue. Evidence comparing periodisation models is mixed, but periodised training generally provides a more defensible structure than doing the same stress every week forever.

Implication:

- The app should wave stress.
- It does not need to claim one periodisation model is universally superior.
- It should choose stress waves based on goal, block, performance, and fatigue.

### Moderate Evidence

#### Autoregulation can improve fit versus fixed prescriptions

RPE/RIR-based autoregulation, velocity-based approaches, flexible nonlinear periodisation, and estimated-1RM approaches all attempt to match training stress to current readiness. Evidence supports autoregulation as a reasonable coaching tool, especially when user skill and measurement quality are sufficient.

Implication:

- Adaptive Strength Coach can autoregulate without asking for RPE/RIR by using logged performance, target-zone outcomes, rep drop-off, shutdowns, session completion, recent trends, and recovery signals.
- The app should avoid pretending performance data is perfect. It should use confidence scoring.

#### RIR and RPE are useful, but not mandatory for this product

Helms, Zourdos, Tuchscherer/RTS, and powerlifting coaching practice support RPE/RIR as useful autoregulation tools. However, RPE/RIR can be noisy for beginners and burdensome for mainstream users.

Implication:

- The product can remain no-RPE/no-RIR by default.
- Internally, it can infer effort bands from performance outcomes.
- Optional future RPE/RIR input could improve precision for advanced users, but should not be required.

#### Undulating exposure is useful for managing strength and hypertrophy trade-offs

Daily or weekly undulation changes stress by varying reps, load, and volume. Evidence does not prove one universal waveform, but undulating exposure is a practical way to train multiple qualities while reducing monotony and fatigue accumulation.

Implication:

- The app should use wave roles such as base, volume, intensity, and consolidation.
- The app should avoid monotonically increasing load and sets together.

#### Estimated 1RM is useful, but unstable at high reps and near-failure uncertainty

e1RM can track strength trends, especially from lower-to-moderate rep sets performed with consistent effort. It is less stable when derived from very high reps, inconsistent proximity to failure, unfamiliar exercises, or technical breakdown.

Implication:

- e1RM should inform decisions but not fully own them.
- The engine should treat e1RM changes as higher-confidence for primary compounds and lower-rep top sets than for high-rep isolation work.

### Weak Evidence

#### Exact volume landmarks are individual

Concepts such as minimum effective volume, maximum adaptive volume, and maximum recoverable volume are useful coaching models, but exact numbers vary heavily by person, muscle, exercise, training age, sleep, nutrition, and life stress.

Implication:

- The app should learn personal volume tolerance rather than hard-code "optimal" weekly set numbers.
- Volume landmarks should be dynamic estimates with confidence, not fixed truths.

#### Connective tissue progression lacks precise app-ready thresholds

Tendons and connective tissue adapt more slowly than acute muscular performance can improve. This supports conservative load-jump guardrails, but the literature does not provide a simple universal weekly percentage cap that guarantees safety.

Implication:

- The app should cap rapid load increases.
- It should use consolidation weeks and slower progression for heavy compounds.
- It should be more conservative after interruptions or repeated pain/manual-negative signals.

### Coach Experience Only

These are common high-level coaching practices, but should be labelled as coaching heuristics rather than proven laws:

- Three-to-four week stress waves followed by consolidation.
- First hard week after deload should not immediately chase PRs.
- Advanced lifters often need more variation and smaller load jumps.
- Beginners often progress better from repeating quality exposures than constantly changing stimulus.
- Powerlifters often benefit from more frequent low-fatigue practice of competition lifts.
- Some muscles tolerate more local volume than others.
- Constant grinding damages training momentum even when short-term load increases look successful.

## Research Citations

Key references used for this design:

- ACSM Position Stand: Progression Models in Resistance Training for Healthy Adults: https://pubmed.ncbi.nlm.nih.gov/19204579/
- Schoenfeld, Ogborn, Krieger. Dose-response relationship between weekly resistance training volume and muscle mass: https://pubmed.ncbi.nlm.nih.gov/27433992/
- Krieger. Single vs multiple sets for hypertrophy meta-analysis: https://pubmed.ncbi.nlm.nih.gov/20300012/
- Ralston et al. Weekly set volume and strength gain meta-analysis: https://pmc.ncbi.nlm.nih.gov/articles/PMC5684266/
- Schoenfeld et al. Low- vs high-load resistance training and hypertrophy/strength: https://pubmed.ncbi.nlm.nih.gov/28834797/
- Grgic et al. Resistance training to failure vs non-failure meta-analysis: https://pubmed.ncbi.nlm.nih.gov/33497853/
- Helms et al. RPE-based load prescription in powerlifting: https://pubmed.ncbi.nlm.nih.gov/24662224/
- Zourdos et al. Flexible nonlinear periodisation/autoregulation research: https://pubmed.ncbi.nlm.nih.gov/25144187/
- Rhea and Alderman. Periodised vs non-periodised strength training meta-analysis: https://pubmed.ncbi.nlm.nih.gov/11828249/
- Williams et al. Periodisation and strength/power outcomes review: https://pubmed.ncbi.nlm.nih.gov/28497285/
- Pritchard et al. Tapering for maximal strength: https://research.bond.edu.au/en/publications/effects-and-mechanisms-of-tapering-in-maximizing-muscular-strengt/
- Suchomel et al. Force-time characteristics and strength/power relationships: https://pubmed.ncbi.nlm.nih.gov/26881876/
- Pareja-Blanco et al. Velocity loss and resistance training adaptations: https://pubmed.ncbi.nlm.nih.gov/27038416/
- RTS / Mike Tuchscherer coaching model: https://articles.reactivetrainingsystems.com/
- Stronger By Science / Greg Nuckols applied research archive: https://www.strongerbyscience.com/
- James Krieger weightology research archive: https://weightology.net/

## System Philosophy

Adaptive Load Management should be built around five ideas.

### 1. Progress is multidimensional

Progress can be:

- more load for same reps
- more reps at same load
- same performance with lower fatigue
- same e1RM through a harder block
- improved rep stability across sets
- improved volume tolerance
- better performance after a consolidation week
- fewer shutdowns and cleaner completion

The app should not punish a user for making progress in a non-load-jump form.

### 2. Stress should be waved

The body adapts to stress, but excessive monotony and constant escalation increase fatigue risk. The app should wave stress within a block:

- base exposure
- volume exposure
- intensity exposure
- consolidation exposure

The exact wave should depend on goal and block.

### 3. The engine should choose the least disruptive effective change

If progress is happening, the engine should not aggressively change everything.

Priority:

1. Keep stable when the signal is weak.
2. Add reps before load when target-zone confidence supports it.
3. Add load when performance is clearly above target and fatigue is low.
4. Add sets only when volume tolerance evidence supports it.
5. Reduce sets before reducing load when fatigue is systemic.
6. Reduce load/intensity when performance is falling or joints are being overloaded.

### 4. Hypertrophy and strength need different progression logic

Hypertrophy can often progress through volume, reps, and local effort. Strength needs more specificity, load exposure, and technical repeatability.

### 5. The app should be conservative when confidence is low

Low-confidence states:

- new exercise
- missed sessions
- interrupted block
- changed equipment
- first week after onboarding
- inconsistent logging
- warm-up/session prep-only data
- high-rep e1RM estimate
- recent illness/travel/manual negative finish

Default low-confidence action: hold, repeat, or consolidate.

## First Principles

### Should load increase every successful week?

No.

Load should increase only when:

- the user reached or exceeded the target zone
- performance was stable across sets
- fatigue evidence is low or local/productive
- load jump is small enough for the equipment and exercise
- the current wave calls for intensity/load progression
- recent history does not show repeated regression after jumps

### Should volume increase every successful week?

No.

Volume should increase only when:

- required work is consistently completed
- target zones are hit without excessive drop-off
- fatigue is local/productive, not systemic
- muscle or pattern needs more stimulus for the goal
- the current block supports volume expansion
- the exercise role is appropriate for extra volume

### Should effort wave?

Yes.

Effort should wave even when load is stable. Constant hard sets near failure are unnecessary and can reduce long-term progression.

Suggested internal effort bands:

- easy technical exposure
- productive
- hard productive
- near-limit
- limit/failure

The app can infer these from reps achieved, drop-off, set completion, shutdown timing, and recent performance.

### Should rep targets wave?

Yes, especially for hypertrophy, powerbuilding, and general strength.

Examples:

- hypertrophy: 8-12, 10-15, 12-20 depending exercise role
- strength: 3-5, 4-6, 5-8 support ranges
- powerlifting: heavier singles/doubles/triples plus lower-stress back-off work

### Should percentage of e1RM wave?

Yes, with caution.

The app should use e1RM-derived zones for primary compounds more than for accessories. It should avoid tightly prescribing percentages from unreliable e1RM estimates.

### Should frequency ever wave?

Rarely.

Frequency should normally remain stable because users build habits around days/week. Frequency changes should be reserved for:

- missed sessions
- meet prep
- deload/recovery windows
- repeated systemic fatigue
- calendar interruptions

### Should exercise selection wave?

Sometimes.

Exercise selection should remain stable enough for skill and progression, but variation can manage joint stress, boredom, equipment limits, and stimulus coverage.

Do not rotate primary lifts aggressively in strength/powerlifting blocks. Do rotate some accessories or variants when:

- progression stalls
- local irritation appears
- volume needs shift
- the block changes
- the user repeatedly swaps the movement

### What variables should remain stable?

Stable by default:

- training goal
- block intent
- weekly schedule
- primary movement pattern
- core exercise identity within a mesocycle
- progression evidence source
- warm-up exclusion from progression evidence

Flexible:

- load
- reps
- sets
- target-zone width
- accessory volume
- proximity to failure
- rest recommendation
- optional cardio/capacity dose
- consolidation timing

## Adaptive Load Management Engine

### Inputs

The future engine should read:

- block type
- goal
- exercise role
- exercise type
- target zone
- required work completed
- set outcomes
- load trend
- rep trend
- e1RM trend where valid
- rep drop-off
- shutdown classification
- session completion
- missed sessions
- Recovery Window state
- cardio/capacity recommendations
- exercise age/newness
- user experience level
- equipment jumps
- recent interruptions
- core lift status
- upcoming block/event proximity

### Outputs

For each exercise or pattern, the engine can choose:

- add load
- hold load
- add reps
- narrow or shift rep target
- add one set
- remove one set
- switch to consolidation exposure
- reduce load
- reduce effort target
- delay progression
- rotate accessory
- trigger Recovery Window consideration
- preserve current prescription

### Decision States

Use a small set of explainable states:

1. **Push load**
   - clear overperformance
   - low fatigue
   - appropriate block
   - equipment jump feasible

2. **Push reps**
   - load jump too large or premature
   - performance strong inside target zone
   - hypertrophy/powerbuilding context

3. **Push volume**
   - repeated successful completion
   - low systemic fatigue
   - exercise role tolerates volume
   - goal benefits from more volume

4. **Hold**
   - progress is present but not decisive
   - new exercise
   - low confidence
   - recent interruption

5. **Consolidate**
   - recent hard productive work
   - load recently increased
   - high exposure week completed
   - preserve adaptation without escalating

6. **Pull back local**
   - one exercise or region is struggling
   - accessory/isolation fatigue
   - no systemic trend

7. **Pull back systemic**
   - multiple key lifts declining
   - early shutdowns
   - missed required work
   - primary compound regression

8. **Deload / Recovery Window**
   - systemic evidence persists
   - fatigue affects multiple key lifts
   - performance falls despite reduced stress

## Decision Tree

For each exercise after a completed session:

1. Is the data valid?
   - Exclude warm-ups, Session Prep, capacity work, cardio, incomplete sets, and corrupted logs.
   - If invalid: hold.

2. Is this a planned work exercise?
   - If no: do not affect main progression.

3. Was required work completed?
   - If no: check if early/systemic/regressive.
   - If missed due to non-training reason: hold or repeat.
   - If missed due to performance decline: pull back local or systemic.

4. Was the target zone hit?
   - Above target with stable sets: progression candidate.
   - Inside target: repeat, rep progress, or volume progress depending wave.
   - Below target: hold or reduce.

5. What is fatigue classification?
   - productive/local: do not punish.
   - regressive/systemic: reduce stress.

6. What does the current wave want?
   - base: stable quality exposure
   - volume: add reps/sets if tolerated
   - intensity: add load or lower reps
   - consolidation: hold/reduce volume, preserve performance

7. What is the goal/block?
   - hypertrophy: prefer reps/volume/local tolerance
   - strength: prefer load exposure/skill stability
   - powerlifting: preserve competition-lift quality
   - meet prep: reduce novelty and fatigue

8. What is the safest effective change?
   - choose one primary change, not all changes.

9. Apply guardrails.
   - cap load jump
   - cap volume jump
   - cap hard weeks
   - prevent repeated near-limit exposure

## Variables

### Load

Use for:

- strength and powerlifting progression
- clear overperformance
- lower-rep exposure weeks
- primary compound progression when confidence is high

Guardrails:

- load increases should respect available equipment jumps
- heavy compound increases should usually be smaller than accessory increases as a percentage of current load
- no rapid repeated jumps after missed sessions or fatigue flags

### Reps

Use for:

- hypertrophy progression
- ambiguous but positive progress
- when load jumps are too large
- accessories and isolation work

Guardrails:

- avoid chasing very high reps on primary strength work
- cap high-rep e1RM confidence

### Sets

Use for:

- hypertrophy volume progression
- weak-point support
- low-fatigue accessories
- body recomposition and muscle preservation where useful

Guardrails:

- do not add sets to heavy axial compounds aggressively
- add no more than one set per exercise at a time
- prefer adding sets to low-fatigue movements first
- require repeated evidence before increasing weekly volume

### Intensity

Use for:

- strength expression
- powerlifting specificity
- peak/meet prep
- lower-volume blocks

Guardrails:

- limit near-limit exposures
- avoid repeated grinders
- maintain technical quality

### Effort

Use for:

- hypertrophy stimulus
- accessory progression
- productive hard work classification

Guardrails:

- heavy compounds should not live at near-failure every week
- isolation work can be closer to failure but should not contaminate systemic fatigue

### Exposure

Exposure means how often the user sees a pattern, load zone, or lift.

Use for:

- skill practice
- re-entry after interruption
- meet-prep specificity
- connective tissue and technical tolerance

Guardrails:

- frequency changes should be rare and user-safe

## Performance Equivalents

Performance equivalents estimate whether different load/rep combinations represent similar strength output.

Example:

- 100 x 8
- 95 x 10
- 105 x 6

These can be approximately equivalent depending on formula, exercise, proximity to failure, and athlete.

### Recommended App Use

Use equivalent zones, not exact equality.

High confidence:

- primary compound
- 3-8 rep range
- consistent technique
- similar proximity to failure
- same exercise
- similar rest and session placement

Moderate confidence:

- 8-12 rep range
- machine compounds
- stable accessories

Low confidence:

- 12+ reps
- isolation exercises
- new exercises
- sets stopped far from failure
- sets with clear technique breakdown
- sessions after illness/travel

### Equivalent Zone Rule

Treat performance as broadly equivalent when estimated strength output is within roughly:

- primary compounds: +/- 2-3%
- secondary compounds: +/- 3-5%
- accessories/isolation: +/- 5-8%

Do not overreact to one equivalent performance. Use rolling trends.

### Practical Interpretation

If the user does:

- Week A: 100 x 8
- Week B: 102.5 x 7
- Week C: 95 x 10

The app should not automatically say Week C is regression. It may be equivalent or productive depending on block, target zone, fatigue, and intent.

### Limitations

Equivalent performance is not the same as identical stimulus.

- 95 x 10 may create more volume/fatigue.
- 105 x 6 may create more specific strength exposure.
- 100 x 8 may be a better balance.

The engine should compare output and stimulus cost.

## Fatigue Integration

Fatigue should alter the type of progression, not just stop progression.

### Low Fatigue + Strong Performance

Hypertrophy:

- add reps or one set
- add load if top of target range is exceeded

Strength:

- add load or intensity exposure
- keep volume stable

Powerlifting:

- add small load or specific exposure
- avoid extra accessory fatigue if meet proximity is increasing

### Moderate Fatigue + Stable Performance

Action:

- hold load
- repeat prescription
- allow rep progress
- avoid set increases
- preserve current block

### Productive Local Fatigue

Action:

- do not trigger systemic recovery
- keep block going
- maybe reduce only affected accessory volume
- preserve primary compound progression if stable

### High Local Fatigue

Action:

- reduce affected exercise volume
- swap accessory if repeated
- hold load
- keep main lift if unaffected

### Systemic Fatigue

Action:

- reduce sets first
- reduce intensity exposure on secondary work
- preserve movement practice
- consider Recovery Window if repeated

### Performance Regression

If required work is missed, target zones are badly missed, primary compounds decline, and multiple exercises are affected:

- do not add load
- do not add volume
- reduce stress
- consider Recovery Window

## Goal-Specific Behaviour

### Hypertrophy

Primary adaptive emphasis:

- reps
- volume
- local effort
- productive fatigue tolerance

Progression preference:

1. add reps
2. add one accessory/isolation set when tolerated
3. add load after top-of-zone success
4. consolidate after hard productive work

Avoid:

- aggressive heavy compound escalation
- treating isolation shutdown as systemic fatigue
- constant low-rep load chasing

### General Strength

Primary adaptive emphasis:

- primary lift load
- stable technique
- moderate volume
- lower-rep performance

Progression preference:

1. add load when top-zone performance is clear
2. hold load and improve reps when confidence is moderate
3. keep accessories supportive
4. reduce volume before reducing primary lift exposure

Avoid:

- adding sets endlessly
- rotating primary lifts too often
- high-fatigue accessory expansion

### Powerlifting

Primary adaptive emphasis:

- competition lift specificity
- top-set exposure
- back-off control
- fatigue timing

Progression preference:

1. maintain squat/bench/deadlift identity
2. wave intensity and volume
3. use small load jumps
4. deload/taper intelligently near meet

Avoid:

- novelty close to meet
- high-rep grinders
- late-block accessory fatigue

### Body Recomposition

Primary adaptive emphasis:

- preserve or build strength
- manage fatigue from energy deficit
- maintain volume enough for muscle
- integrate cardio carefully

Progression preference:

1. hold strength where needed
2. progress reps before load
3. use conservative volume increases
4. avoid heavy fatigue spikes

Avoid:

- interpreting flat load as failure
- aggressive volume increases during low recovery

### Muscle Preservation

Primary adaptive emphasis:

- minimum effective dose
- strength retention
- consistency
- low fatigue cost

Progression preference:

1. maintain load exposure
2. hold volume stable
3. use occasional rep/load progress if easy

Avoid:

- chasing maximal adaptation
- unnecessary fatigue

### Meet Preparation

Primary adaptive emphasis:

- specificity
- fatigue reduction
- high-confidence load exposure
- taper timing

Progression preference:

1. preserve competition lifts
2. reduce volume as meet nears
3. maintain intensity enough to express strength
4. remove novelty and excessive accessories

Avoid:

- late-stage hypertrophy expansion
- repeated near-failure work
- aggressive e1RM chasing

## Wave Design

No single wave is universally optimal. The engine should choose from templates based on goal, block, experience, and fatigue.

### Default Four-Week Stress Wave

Useful for hypertrophy, powerbuilding, and general strength:

1. **Base**
   - establish load and target-zone quality
   - moderate effort

2. **Build**
   - add reps or volume if tolerated
   - maintain load unless overperformance is clear

3. **Expose**
   - higher load or harder productive work
   - lower volume increase probability

4. **Consolidate**
   - hold or slightly reduce volume
   - preserve performance
   - prepare next wave

### Hypertrophy Wave

Week 1: base volume  
Week 2: rep progress / volume tolerance  
Week 3: hard productive exposure  
Week 4: consolidation or local volume adjustment

### Strength Wave

Week 1: technical base  
Week 2: moderate load progress  
Week 3: intensity exposure  
Week 4: lower-fatigue consolidation

### Powerlifting Wave

Week 1: competition lift practice  
Week 2: volume or back-off emphasis  
Week 3: heavier top exposure  
Week 4: fatigue control / specificity preservation

### Short Block / Interrupted User Wave

If the user misses sessions or stretches one training week over more than seven calendar days:

- do not advance stress by calendar
- complete the current training week
- repeat or consolidate rather than escalate

## Recovery Integration

### Recovery Windows

Adaptive Load Management should make Recovery Windows less blunt.

Recovery Window should require:

- regressive shutdowns
- systemic fatigue
- falling performance trend
- multiple key-lift disruptions
- repeated early missed work

Productive hypertrophy fatigue should lead to:

- hold volume
- monitor next session
- reduce affected exercise only
- keep block going

### Cardio

Cardio should influence load management by fatigue cost and goal:

- easy recovery cardio: usually neutral or supportive
- hard conditioning: may reduce lower-body progression aggressiveness
- recomposition/get-leaner goal: preserve strength while accepting slower load progression
- meet prep: avoid interference close to heavy lower sessions

### Capacity Work

Low Back Capacity should not drive main progression. It can inform safety context if the user repeatedly struggles with bracing/control, but capacity completions should not add load to main lifts.

### Deloads

Deloads should reduce stress while preserving movement familiarity.

Preferred order:

1. reduce sets
2. reduce accessory load/effort
3. reduce primary lift volume
4. reduce primary lift load only when needed

### Missed Sessions and Training Interruptions

After interruption:

- do not jump to the next week by calendar
- use completion-based training week
- reduce confidence
- repeat or slightly reduce first exposure back
- restore progression only after successful completion

## Safety Guardrails

### Prevent Runaway Fatigue

Rules:

- no simultaneous load and set increase on the same heavy compound unless exceptional confidence
- no repeated hard-week classification without consolidation
- systemic fatigue blocks progression
- regressive shutdowns override overperformance elsewhere

### Prevent Constant RPE 9-10

Rules:

- limit near-limit exposures per exercise and per week
- heavy compounds require lower frequency of near-limit work than isolations
- productive hard work can be followed by consolidation

### Prevent Joint and Connective Tissue Overload

Rules:

- cap load jumps
- slow progression after layoffs
- avoid repeated aggressive jumps on same lift
- reduce load progression when pain/manual-negative signals appear
- prefer reps or holds when load jumps are too large

### Prevent Ego Progression

Rules:

- load increase requires target-zone and fatigue evidence
- failed early work blocks load increase
- one good top set cannot override poor session-wide evidence
- e1RM spike from high-rep set is low-confidence

### Prevent Misclassification of Productive Work

Rules:

- isolation/accessory shutdown after target work in hypertrophy is low-negative or neutral
- primary compound early failure is concerning
- multiple compound declines are systemic
- Power/Peak blocks treat shutdown more strictly

## Example 16-Week Progression

This is illustrative only. It is not a hard-coded prescription.

### Weeks 1-4: Hypertrophy Base Wave

Goal: build useful work and establish tolerance.

- Week 1: baseline target zones, moderate volume
- Week 2: add reps where target zones were strong
- Week 3: add one set to tolerant accessories or small muscles
- Week 4: consolidate; hold load, reduce added sets if fatigue rises

### Weeks 5-8: Hypertrophy / Powerbuilding Wave

Goal: convert volume tolerance into heavier productive exposures.

- Week 5: repeat key exercises with stable volume
- Week 6: add load on clear top-zone successes
- Week 7: heavier exposure on primary compounds, keep accessories stable
- Week 8: consolidation or Recovery Window if systemic evidence appears

### Weeks 9-12: Strength Wave

Goal: improve primary lift performance.

- Week 9: lower rep targets, stable primary lift exposure
- Week 10: small load increases where performance supports it
- Week 11: intensity exposure, reduced accessory expansion
- Week 12: lower-volume consolidation

### Weeks 13-16: Strength / Performance Wave

Goal: express strength while managing fatigue.

- Week 13: rebase after consolidation
- Week 14: load or rep progress depending equivalent performance
- Week 15: heavier top exposure or strength test surrogate
- Week 16: deload/recovery, block transition, or next wave depending evidence

## Strength Example

Bench Press target: 4-6 reps.

Week 1:

- 100 kg x 6, 6, 5
- fatigue low
- action: small load increase candidate

Week 2:

- 102.5 kg x 5, 5, 4
- equivalent performance, higher intensity
- action: hold load, build reps

Week 3:

- 102.5 kg x 6, 5, 5
- improved reps
- action: hold or small increase depending wave

Week 4:

- consolidation
- 100 kg x 5, 5, 5 with lower volume or lower effort
- action: preserve, do not chase PR

Interpretation:

The user progressed without needing a load jump every week.

## Hypertrophy Example

Leg Press target: 10-15 reps.

Week 1:

- 180 kg x 13, 12, 11
- action: hold load, push reps

Week 2:

- 180 kg x 15, 14, 13
- action: add load or add one set depending wave

Week 3:

- 190 kg x 12, 11, 10
- productive, no systemic fatigue
- action: hold load

Week 4:

- 190 kg x 13, 12, 11
- action: progress confirmed

Interpretation:

The app should treat this as productive even if there was no weekly load increase in Week 4.

## Powerlifting Example

Squat in meet-prep context.

Week 1:

- competition squat practice, moderate triples

Week 2:

- slightly higher volume back-off work

Week 3:

- heavier single or double exposure, low grinding

Week 4:

- reduced volume, maintain specificity

If e1RM improves but bar-speed/rep stability worsens and fatigue rises:

- do not add more volume
- reduce accessory load
- preserve squat exposure

## Pros

- More evidence-aligned than fixed weekly load jumps.
- Better handles hypertrophy progress that appears as reps or volume.
- Better protects long-term progression.
- Reduces unnecessary Recovery Window triggers.
- Supports strength and powerlifting specificity.
- Lets the app feel more coach-like without asking for RPE/RIR.
- Provides a foundation for long-term user retention because the system can adapt to real training life.

## Risks

- Higher complexity can make recommendations harder to explain.
- Poor confidence scoring could create inconsistent behaviour.
- Too many adaptive options could obscure block intent.
- If volume progression is too eager, fatigue may accumulate.
- If load progression is too conservative, motivated users may feel held back.
- Without optional subjective inputs, some fatigue states will remain inferred rather than known.
- e1RM-based decisions can mislead if derived from noisy sets.

## Open Questions

1. Should advanced users be allowed to opt into RPE/RIR logging?
2. Should the app show wave labels to users or keep them invisible?
3. How many weeks of evidence are needed before volume landmarks are trusted?
4. Should load management operate per exercise, per movement pattern, per muscle group, or all three?
5. How should nutrition phase be captured for recomposition/cutting users?
6. Should cardio dose affect lower-body progression only, or full systemic fatigue?
7. Should powerlifting users get meet-date-specific taper logic in v1 or a later phase?
8. What minimum explanation does a user need to trust a hold/repeat recommendation?

## Implementation Recommendation

Do not implement this as a single giant rewrite.

Recommended phases:

1. **Research freeze**
   - Agree the philosophy, guardrails, and goal-specific behaviours.

2. **Decision-state layer**
   - Add push load, push reps, push volume, hold, consolidate, local pullback, systemic pullback.

3. **Performance-equivalent layer**
   - Treat equivalent performances as neutral/positive rather than failed load progression.

4. **Wave layer**
   - Add block-specific stress waves without changing workout generation.

5. **Volume-learning layer**
   - Use repeated evidence to adjust sets cautiously.

6. **Recovery integration**
   - Link systemic fatigue to Recovery Window only when evidence is strong.

7. **User copy**
   - Explain outcomes simply:
     - "Hold this weight and own the range."
     - "Add weight next time."
     - "Build reps before loading."
     - "Consolidate after a hard productive week."

## Final Verdict

Adaptive Strength Coach should move from a traditional progression engine to Adaptive Load Management.

The strongest version of the product is not "add weight whenever last week worked." It is:

> A performance-led coach that decides whether the next best dose is more load, more reps, more work, the same work done better, or less stress so progress can continue.

This should become a core scientific foundation for the app, but implementation should be gradual, test-led, and guarded. The system must remain explainable, conservative when confidence is low, and aligned with the user's goal and block.
