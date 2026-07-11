# Scientific Validation Framework v1

Status: research and validation architecture.  
Date: 2026-06-26

This document does not implement code, change workout generation, or modify progression logic. It defines the permanent scientific quality-control system for future Adaptive Strength Coach coaching decisions.

## Executive Summary

Adaptive Strength Coach should not ship coaching decisions because they sound clever, feel novel, or make the product appear more advanced.

Every future coaching decision should earn production through validation.

The objective of validation is not to prove that the engine is "smart." The objective is to prove that the engine consistently makes decisions that are at least as good as a competent evidence-based strength coach, while remaining safe, explainable, internally consistent, and practically useful.

The validation framework has eight gates:

1. Scientific evidence
2. Adaptive Coaching Manifesto alignment
3. Coaching Playbook alignment
4. Adaptive Stress Allocation compatibility
5. Safety guardrails
6. Scenario testing
7. Human review where required
8. Production eligibility

Final assessment: **yes, this framework can become the permanent scientific quality-control system for Adaptive Strength Coach.**

It should become the gatekeeper for every future coaching change.

## Validation Philosophy

Validation exists to protect the user, the product, and the coaching philosophy.

It should answer:

- Is this decision scientifically defensible?
- Would a competent evidence-based strength coach understand it?
- Does it improve adaptation without disproportionate fatigue?
- Is it safe enough for production?
- Is it consistent with the manifesto?
- Is it consistent with the playbook?
- Does it behave correctly across realistic scenarios?
- Does it avoid overclaiming?

Validation should not reward complexity.

A simple coaching decision that is safe, evidence-informed, and effective is better than a sophisticated decision that is brittle, confusing, or overfit.

### The Validation Standard

A coaching decision is production-worthy only when it can pass this standard:

> Given the evidence available, this is a reasonable coaching decision that a competent evidence-based coach could defend.

The app does not need perfect certainty. Coaching rarely has perfect certainty.

The app does need:

- a defensible rationale
- a safety boundary
- a confidence rating
- a monitoring plan
- a fallback when evidence is weak

### What Validation Must Prevent

Validation must prevent:

- clever but unsupported recommendations
- runaway load progression
- runaway volume progression
- unnecessary Recovery Windows
- failure worship
- calendar-driven escalation
- unsafe post-interruption jumps
- medical or rehab claims
- hidden contradictions between app systems
- user-facing recommendations that cannot be defended

## Evidence Hierarchy

Evidence quality determines recommendation confidence.

### Level 1: High-Quality Systematic Reviews and Meta-Analyses

Examples:

- resistance training volume and hypertrophy meta-analyses
- training to failure meta-analyses
- periodisation reviews
- resistance training in older adults reviews

Use:

- define broad boundaries
- support high-confidence principles
- reject claims that conflict with the literature

Limitations:

- group averages
- heterogeneous populations
- not always exercise-, goal-, or user-specific

### Level 2: Well-Designed Randomised Controlled Trials

Use:

- support specific interventions
- inform loading, volume, proximity to failure, frequency, and rest decisions

Limitations:

- short study durations
- controlled populations
- often not advanced lifters
- may not cover real app complexity

### Level 3: Position Stands and Consensus Statements

Examples:

- ACSM resistance training progression models
- NSCA/other professional consensus material
- older adult resistance training position statements

Use:

- define safe and broadly accepted practice
- support public-facing claims
- establish conservative defaults

Limitations:

- may be broad
- may lag emerging research

### Level 4: Prospective Coaching Evidence

Includes:

- structured coaching case series
- prospectively tracked athlete outcomes
- internal paper-trade style coaching tests
- pre-registered internal validation datasets

Use:

- validate applied decision rules before production
- test scenario behaviour over time

Limitations:

- less controlled
- selection bias
- coaching effect may include human judgement not captured by engine

### Level 5: Experienced Coach Judgement

Use:

- fill gaps where research is incomplete
- handle practical gym scenarios
- interpret safety and adherence trade-offs
- choose between similarly defensible interventions

Acceptable when:

- evidence is limited
- risk is low
- recommendation is conservative
- monitoring exists
- it does not contradict stronger evidence

Not acceptable when:

- it overrides strong evidence without justification
- it creates high risk
- it makes medical claims
- it becomes an untested production rule

### Level 6: ASC Real-World Anonymised Outcome Data

Future use:

- validate assumptions
- detect weak recommendations
- identify user subgroups
- improve confidence estimates
- reveal unintended consequences

Important:

ASC real-world data must not automatically change coaching behaviour.

It can generate hypotheses. It can strengthen or weaken confidence. It can identify failure modes.

All changes still pass through the validation pipeline.

## When Lower Evidence Levels Are Acceptable

Lower evidence is acceptable when:

- the decision is low risk
- the recommendation is conservative
- the user remains in control
- the system monitors response
- stronger evidence is unavailable
- the decision aligns with the manifesto and playbook

Examples:

- holding load after uncertain evidence
- reducing one accessory set after repeated local fatigue
- suggesting a better-tolerated variation after repeated swaps
- consolidating after travel

Lower evidence is not acceptable for:

- aggressive load jumps
- high-volume expansion
- pain or medical interpretation
- meet-peaking claims
- automatic deloads from weak evidence
- major programme changes

## Validation Pipeline

Every proposed coaching decision should pass through these stages.

### 1. Scientific Evidence Gate

Questions:

- What evidence supports this decision?
- What evidence contradicts it?
- What population was studied?
- How directly does the evidence apply?
- What is the evidence level?

Output:

- evidence rating
- confidence rating
- citation list
- uncertainty notes

### 2. Adaptive Coaching Manifesto Gate

Questions:

- Does it seek adaptation rather than exhaustion?
- Does it treat fatigue as a cost?
- Does it protect long-term progress?
- Does it choose the smallest effective intervention?
- Does it respect that the athlete is human?
- Does it reduce unnecessary decisions?

Reject if:

- it rewards fatigue for its own sake
- it escalates stress without evidence
- it undermines consistency or confidence

### 3. Coaching Playbook Gate

Questions:

- Which playbook scenario does this decision belong to?
- What would the coach do?
- What alternatives are acceptable?
- What monitoring is required?
- What evidence inputs are needed?

Reject if:

- no scenario supports the decision
- the decision conflicts with playbook reasoning
- required inputs are unavailable

### 4. Adaptive Stress Allocation Gate

Questions:

- What adaptation does this buy?
- What fatigue does it cost?
- Is there a lower-cost intervention?
- Which stress budget does it consume?
- Does it preserve the goal/block intent?

Reject if:

- adaptation target is unclear
- fatigue cost is disproportionate
- lower-cost options were not considered

### 5. Safety Guardrail Gate

Questions:

- Does it risk runaway load, volume, or intensity?
- Does it create excessive proximity to failure?
- Does it increase connective tissue stress too quickly?
- Does it overreact to weak evidence?
- Does it expose medical/rehab claims?

Reject if:

- safety boundaries are missing
- regression triggers escalation
- pain is treated as a training target

### 6. Scenario Testing Gate

Test against:

- beginner hypertrophy
- intermediate strength
- advanced powerlifting
- poor sleep
- illness recovery
- missed week
- rapid progress
- plateau
- joint irritation
- travel
- high work stress
- deload timing
- peaking
- recomposition
- maintenance

Reject if:

- decision works only in ideal cases
- scenario outputs contradict each other
- vulnerable users receive aggressive recommendations

### 7. Human Review Gate

Required for:

- new fatigue logic
- new Recovery Window triggers
- new peaking/taper logic
- new pain/joint-response behaviour
- major volume expansion rules
- new goal-specific coaching claims
- any decision with low evidence and high potential cost

Reviewer should ask:

- Would I defend this to a user?
- Would I defend this to another coach?
- Would I be comfortable if this affected thousands of users?

### 8. Production Eligibility Gate

Decision may enter production only if:

- scientifically defensible
- manifesto-aligned
- playbook-aligned
- ASA-compatible
- guardrails pass
- scenario tests pass
- human review passes where required
- user-facing copy is accurate
- monitoring exists

## Scenario Framework

The scenario library should become the main validation surface.

Each scenario should include:

- scenario id
- user archetype
- goal
- block
- training age
- recent performance
- fatigue state
- recovery context
- interruptions
- exercise role
- evidence inputs
- expected recommendation
- acceptable alternatives
- blocked recommendations
- evidence support
- confidence rating
- monitoring rules

### Core Scenario Families

#### Performance and Fatigue

- performance up, fatigue low
- performance up, fatigue high
- performance stable, fatigue low
- performance stable, fatigue high
- performance down, fatigue low
- performance down, fatigue high
- performance mixed, fatigue local
- performance mixed, fatigue systemic

#### Exercise-Specific

- bench progressing
- squat plateau
- deadlift fatigue accumulating
- overhead press slow progress
- row grip-limited
- isolation stalling
- accessory repeated failure
- technical breakdown
- joint irritation

#### Athlete Archetypes

- beginner hypertrophy
- beginner strength
- intermediate hypertrophy
- intermediate strength
- advanced powerlifting
- older lifter
- time-constrained parent
- shift worker
- high-stress professional
- bodybuilder
- general fitness lifter

#### Recovery and Life Events

- poor sleep
- travel
- illness recovery
- missed week
- two-week interruption
- high soreness
- high work stress
- excellent recovery
- inconsistent schedule

#### Goal and Block

- hypertrophy accumulation
- strength block
- powerbuilding bridge
- power block
- peak block
- meet prep
- recomposition
- maintenance
- muscle preservation
- Recovery Window

### Example Scenario Fixture

Scenario id:

`HYPO_BEGINNER_HYPERTROPHY_PROGRESS_LOW_FATIGUE`

Inputs:

- training age: beginner
- goal: hypertrophy
- block: hypertrophy
- exercise: leg press
- role: secondary lower compound
- target zone: 10-15
- recent result: 13, 13, 12 -> 15, 14, 13
- fatigue: low
- missed sessions: none

Recommended intervention:

- add reps if still below top range
- small load increase if top-zone success is repeated
- do not add multiple sets

Evidence supporting intervention:

- progressive overload
- hypertrophy volume/loading evidence
- beginner confidence/skill considerations

Alternative options:

- hold load one more exposure
- add one set only if volume is under target and fatigue remains low

Blocked recommendations:

- aggressive load jump
- Recovery Window
- exercise rotation

Confidence:

High

## Decision Scoring

Every proposed recommendation should receive scores from 1-5.

### Scientific Confidence

1. unknown or speculative
2. limited indirect evidence
3. moderate evidence or strong coaching consensus
4. strong evidence but context-specific uncertainty
5. strong direct evidence and strong consensus

### Adaptation Potential

1. unlikely to improve adaptation
2. minor benefit
3. useful
4. strong likely benefit
5. high priority for adaptation

### Fatigue Cost

1. very low
2. low
3. moderate
4. high
5. very high

Lower fatigue cost is better unless the adaptation requires meaningful stress.

### Injury / Irritation Risk

1. very low
2. low
3. moderate
4. high
5. unacceptable

Risk does not mean injury prediction. It means practical coaching concern.

### Recovery Demand

1. minimal
2. low
3. moderate
4. high
5. likely disruptive

### Behavioural Simplicity

1. confusing
2. requires explanation
3. acceptable
4. simple
5. obvious to the user

### Long-Term Sustainability

1. brittle
2. short-term only
3. acceptable
4. sustainable
5. strengthens long-term training

### Overall Confidence

Overall confidence is not a simple average.

Recommended weighting:

- safety failures override all
- manifesto conflicts override adaptation potential
- low evidence plus high risk fails
- high adaptation plus high fatigue requires strong justification
- low-cost conservative interventions can pass with lower evidence

### Example Score

Intervention:

Add 2.5 kg to bench after repeated top-zone success and low fatigue.

Scores:

- scientific confidence: 4
- adaptation potential: 4
- fatigue cost: 3
- irritation risk: 2
- recovery demand: 2
- behavioural simplicity: 5
- long-term sustainability: 4
- overall: pass

Intervention:

Add one heavy deadlift set after one good session despite high systemic fatigue.

Scores:

- scientific confidence: 2
- adaptation potential: 2
- fatigue cost: 5
- irritation risk: 4
- recovery demand: 5
- behavioural simplicity: 3
- long-term sustainability: 1
- overall: fail

## Simulation Design

Simulation should test coaching decisions over time before production.

The goal is not to perfectly model human physiology. The goal is to identify brittle, unsafe, contradictory, or obviously poor decision patterns.

### Simulation Length

Minimum:

- 16 weeks for block-level behaviour
- 52 weeks for annual training behaviour

Preferred:

- multiple 52-week runs per archetype
- repeated blocks
- varied interruption patterns

### Athlete Archetypes

Simulate at least:

- beginner hypertrophy responder
- beginner poor recovery responder
- intermediate strength responder
- intermediate inconsistent schedule
- advanced powerlifter
- older lifter
- body recomposition user
- high-stress shift worker
- time-constrained parent
- high-volume tolerant bodybuilder
- low-volume responder

### Goals

Simulate:

- hypertrophy
- general strength
- powerlifting
- body recomposition
- maintenance
- meet prep

### Perturbations

Include:

- poor sleep weeks
- travel
- illness
- missed week
- skipped workouts
- high work stress
- joint irritation flag
- rapid early progress
- long plateau
- high soreness
- low motivation/adherence

### Outputs to Inspect

The simulation should report:

- load progression rate
- set progression rate
- hard-week frequency
- Recovery Window frequency
- repeated near-failure exposure
- missed-session handling
- volume by muscle
- heavy compound stress
- local vs systemic fatigue handling
- user-facing decision consistency
- blocked unsafe recommendations

### Failure Modes

Simulation fails if:

- volume increases every time performance improves
- load increases after missed sessions without evidence
- high fatigue repeatedly receives more stress
- beginners receive advanced complexity
- powerlifters lose specificity
- hypertrophy users receive unnecessary Recovery Windows
- peaking users retain excessive volume
- pain/joint irritation receives aggressive load progression
- one bad session triggers dramatic changes

## Human Benchmarking

Adaptive Strength Coach should not mimic one coach.

It should benchmark against broad evidence-informed coaching practice:

- ACSM/NSCA-style principles
- Schoenfeld/Krieger hypertrophy evidence
- Helms/Zourdos/Tuchscherer autoregulation principles
- Nuckols-style practical strength reasoning
- Sheiko-style specificity and controlled volume concepts
- experienced powerlifting/bodybuilding coaching judgement

### Benchmark Process

For each decision family:

1. Present scenario.
2. Ask what a competent coach would do.
3. Compare ASC recommendation.
4. Classify:
   - aligned
   - acceptable alternative
   - questionable
   - unsafe
   - unsupported

### Human Review Rubric

Reviewer should score:

- understands goal
- reads evidence correctly
- chooses appropriate intervention
- avoids unnecessary fatigue
- protects safety
- preserves adherence
- communicates clearly

### Where Human Review Is Mandatory

- low evidence / high cost
- pain/joint scenarios
- post-illness return
- meet taper
- systemic fatigue classification
- new volume-expansion policy
- new recovery trigger
- new user-facing coaching claim

## Learning Framework

ASC may improve over time using anonymised real-world data, but user data cannot be allowed to silently rewrite coaching.

### What Real-World Data Can Do

It can:

- validate assumptions
- reveal weak scenarios
- identify poor recommendation outcomes
- detect excessive Recovery Window frequency
- detect overly conservative holds
- compare subgroups
- improve confidence scoring
- identify where users abandon sessions

### What Real-World Data Cannot Do Alone

It cannot:

- automatically change coaching rules
- create new progression policy without review
- override safety guardrails
- justify medical claims
- prove causation from uncontrolled patterns

### Learning Loop

1. Collect anonymised outcome patterns.
2. Identify suspected weak decision.
3. Recreate scenario.
4. Compare against playbook.
5. Review scientific evidence.
6. Run simulation.
7. Human review if needed.
8. Update confidence or decision policy only after full validation.

### Outcome Metrics

Future validation data should inspect:

- session completion
- target-zone success
- progression earned rate
- fatigue/regression rate
- Recovery Window frequency
- adherence over time
- workout abandonment
- post-recommendation performance
- strength trend
- volume tolerance trend
- user retention
- restore-after-interruption success

## Release Criteria

A new coaching decision may enter production only if all are true:

- scientifically defensible
- consistent with the Adaptive Coaching Manifesto
- consistent with the Coaching Playbook
- compatible with Adaptive Stress Allocation
- safe under known guardrails
- improves adaptation or decision quality without disproportionate fatigue
- handles uncertainty conservatively
- passes scenario review
- passes simulation where applicable
- has user-facing copy that does not overclaim
- has monitoring and rollback criteria
- has tests or QA fixtures appropriate to risk

### Automatic Rejection Criteria

Reject a decision if it:

- escalates load after clear regressive fatigue
- escalates volume after systemic fatigue
- advances training week by calendar alone
- uses warm-up, prep, cardio, or capacity work as main progression evidence
- treats pain as a training target
- makes medical/rehab claims
- conflicts with the manifesto
- lacks a monitoring plan
- cannot be explained to a user in plain language

### Rollback Criteria

A production coaching decision should be reviewed or rolled back if:

- it creates repeated user confusion
- it increases unsafe-looking recommendations
- it causes excessive Recovery Window frequency
- it suppresses progression without reason
- it produces repeated regressions after recommendations
- it harms adherence
- it conflicts with new evidence

## Research Citations

Validation and evidence hierarchy:

- Oxford Centre for Evidence-Based Medicine levels of evidence: https://www.cebm.ox.ac.uk/resources/levels-of-evidence/ocebm-levels-of-evidence
- GRADE evidence certainty framework: https://www.gradeworkinggroup.org/
- CONSORT trial reporting guidance: https://www.consort-spirit.org/

Training science:

- ACSM progression models in resistance training: https://pubmed.ncbi.nlm.nih.gov/19204579/
- ACSM 2025 resistance training position stand update: https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/
- Schoenfeld. Mechanisms of muscle hypertrophy: https://pubmed.ncbi.nlm.nih.gov/20847704/
- Schoenfeld, Ogborn, Krieger. Weekly resistance training volume and hypertrophy: https://pubmed.ncbi.nlm.nih.gov/27433992/
- Krieger. Single vs multiple sets for hypertrophy: https://pubmed.ncbi.nlm.nih.gov/20300012/
- Ralston et al. Weekly set volume and strength gain meta-analysis: https://pmc.ncbi.nlm.nih.gov/articles/PMC5684266/
- Resistance training to failure meta-analysis: https://pubmed.ncbi.nlm.nih.gov/33497853/
- Helms et al. RPE-based load prescription in powerlifting: https://pubmed.ncbi.nlm.nih.gov/24662224/
- Zourdos et al. Flexible nonlinear periodisation/autoregulation: https://pubmed.ncbi.nlm.nih.gov/25144187/
- Autoregulation in resistance training: https://pmc.ncbi.nlm.nih.gov/articles/PMC7575491/

Behaviour and adherence:

- Exercise, physical activity, and self-determination theory: https://pmc.ncbi.nlm.nih.gov/articles/PMC3441783/
- Self-determination and physical exercise adherence: https://pmc.ncbi.nlm.nih.gov/articles/PMC4519215/
- Exercise self-efficacy and control beliefs: https://pmc.ncbi.nlm.nih.gov/articles/PMC3740728/

## Open Questions

1. What minimum scenario coverage is required before a decision can ship?
2. How should simulation represent individual response without pretending to model biology perfectly?
3. Which decisions require external coach review?
4. How should anonymised outcome data be weighted against published research?
5. What should trigger mandatory rollback?
6. How should evidence ratings be shown internally?
7. Should every coaching change include a user-copy validation stage?
8. How should the app validate decisions for populations underrepresented in strength research?
9. How should the app manage low-evidence but low-risk decisions?
10. What metrics best indicate long-term coaching quality?

## Final Assessment

This framework can become the permanent scientific quality-control system for Adaptive Strength Coach.

It gives the product a durable standard:

> No coaching decision reaches production merely because it is clever. It reaches production because it is defensible, safe, useful, consistent, tested, and aligned with the long game.

The framework should sit above Adaptive Stress Allocation, Adaptive Load Management, the Coaching Playbook, and future coaching features.

It should protect the app from becoming noisy, overconfident, or gimmicky.

It should also allow the app to improve over time without letting uncontrolled user data silently rewrite coaching.

Final verdict: **yes, this should become the permanent validation gate for Adaptive Strength Coach coaching decisions.**
