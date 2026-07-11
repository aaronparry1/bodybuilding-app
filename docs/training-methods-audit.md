# Training Styles / Set Methods Audit

Date: 2026-06-14

Scope: audit only. No app code changed, no tests run, and no EAS build started.

Question: should Adaptive Strength Coach support periodic training styles / set methods for progress, variety, and stimulus management?

## 1. Executive Summary

Adaptive Strength Coach should support a small, tightly controlled set of training methods later, but not as random variety and not before subscription/paywall work unless the product roadmap explicitly prioritises deeper coaching polish.

The current architecture is already strong enough to support method prescriptions because it has:

- evidence-based slot prescriptions
- target-zone learning
- progression throttle
- fatigue separation
- power quality
- Recovery Window and Peak constraints
- event/taper context
- manual finish/shutdown evidence
- PR and Strength Dashboard reporting

However, training methods would add complexity to:

- workout generation
- set row modelling
- load selection
- Workout Review
- progression interpretation
- fatigue accounting
- PR detection
- UI clarity

Recommendation: implement only a strict Tier 1 subset first:

- Heavy Triple + Backoffs
- Heavy Five + Backoffs
- Short Pyramid
- Last Set AMRAP, tightly constrained

Defer or avoid:

- 5/3/1 and Boring But Big as full programme systems
- Mega Pyramid as too fatiguing/noisy
- Heavy Single + Backoffs until Powerlifting Meet / advanced Strength handling is mature enough
- Eight Across except as a very specific hypertrophy/capacity method
- Big & Strong unless formally defined as an internal method

Best product framing:

Methods should be occasional coached structures, not a user-selected style menu.

Example user-facing copy:

> Today uses Heavy Triple + Backoffs: one crisp heavy set, then lower-fatigue practice work.

## 2. Method Definitions

### Heavy Single + Backoffs

What it is: one heavy single, usually submaximal, followed by reduced-load backoff work.

Typical use case: strength specificity, readiness assessment, powerlifting meet prep, advanced main-lift practice.

Suitable goals:

- Build Strength
- Powerlifting Meet
- Build Muscle & Strength, rarely

Suitable blocks:

- Strength
- Peak, only when specific and low fatigue
- Powerbuilding, rarely and only for advanced primary lifts

Suitable roles:

- Primary compound only
- Specific peak lift only

Suitable rep ranges:

- Single: 1 rep
- Backoffs: 2-6 reps depending phase

Fatigue cost: moderate to high depending load.

Risk level: high if too heavy, too frequent, or used without history.

Beginner suitability: no.

Progression support: high for skill/specificity, not high for broad volume.

Hypertrophy support: low to moderate through backoffs only.

Strength support: high.

Exclude from:

- Hypertrophy as a normal method
- Power blocks unless speed/single work is explicitly submaximal and compatible
- Recovery Window
- high fatigue states
- pain/limitation history
- late meet prep if it introduces novelty or exceeds readiness intent

### Heavy Triple + Backoffs

What it is: one heavy set of 3 followed by lighter backoff sets.

Typical use case: strength building with enough practice volume to be productive.

Suitable goals:

- Build Strength
- Build Muscle & Strength
- Powerlifting Meet
- Get Leaner, only if fatigue is controlled

Suitable blocks:

- Strength
- Powerbuilding
- early Peak only for suitable lifters

Suitable roles:

- Primary compound
- Secondary compound, rarely

Suitable rep ranges:

- Top set: 3
- Backoffs: 3-8

Fatigue cost: moderate.

Risk level: moderate.

Beginner suitability: generally no; intermediate+ only.

Progression support: high.

Hypertrophy support: moderate.

Strength support: high.

Exclude from:

- Recovery Window
- Power movement slots
- isolation/accessory slots
- high fatigue/re-entry weeks
- late Peak unless very specific and intentionally low volume

### Heavy Five + Backoffs

What it is: one heavy set of 5 followed by lighter backoff work.

Typical use case: general strength/hypertrophy-strength progression.

Suitable goals:

- Build Strength
- Build Muscle & Strength
- Build Muscle for primary compounds, occasionally
- Get Leaner if volume is conservative

Suitable blocks:

- Powerbuilding
- Strength
- Hypertrophy, only as a primary compound variation

Suitable roles:

- Primary compound
- Secondary compound
- Machine compound, when used as primary lower-body work

Suitable rep ranges:

- Top set: 5
- Backoffs: 5-10

Fatigue cost: moderate.

Risk level: moderate.

Beginner suitability: possible for late beginner/intermediate if loads are conservative, but not necessary at launch.

Progression support: high.

Hypertrophy support: moderate to high.

Strength support: moderate to high.

Exclude from:

- Peak late phase
- Recovery Window
- high fatigue state
- technical/high-risk lifts with poor history

### Short Pyramid

What it is: 2-4 work sets moving load up and reps down, or a small ramp followed by one working exposure.

Typical use case: sensible ramping for compounds without forcing flat sets.

Suitable goals:

- Build Muscle
- Build Strength
- Build Muscle & Strength
- Get Leaner
- Athletic Performance, for strength support

Suitable blocks:

- Hypertrophy
- Powerbuilding
- Strength
- Power support slots

Suitable roles:

- Primary compound
- Secondary compound
- Machine compound
- Unilateral, carefully

Suitable rep ranges:

- broad: 5-12
- hypertrophy: 8-12 or 10-15
- strength: 3-8

Fatigue cost: low to moderate.

Risk level: low to moderate.

Beginner suitability: yes if simple and not disguised max testing.

Progression support: moderate.

Hypertrophy support: moderate.

Strength support: moderate.

Exclude from:

- Recovery Window if it encourages chasing load
- Peak unless it is essentially normal specific warm-up/ramp practice
- power movement slots where speed quality matters more than ramping load

### Heavy Pyramid

What it is: more pronounced ramping to a heavy top set, sometimes followed by backoff or descending work.

Typical use case: strength-oriented compound progression.

Suitable goals:

- Build Strength
- Build Muscle & Strength
- Powerlifting Meet, early/mid prep only

Suitable blocks:

- Strength
- Powerbuilding
- early Peak, carefully

Suitable roles:

- Primary compound
- Secondary compound

Suitable rep ranges:

- 1-8 depending phase

Fatigue cost: moderate to high.

Risk level: moderate to high.

Beginner suitability: no.

Progression support: high if constrained.

Hypertrophy support: moderate.

Strength support: high.

Exclude from:

- Hypertrophy accessories
- Power slots
- Recovery Window
- high fatigue
- late Peak unless very low total volume and specific

### Mega Pyramid

What it is: large pyramid with many ascending/descending sets, often high volume and high fatigue.

Typical use case: occasional novelty/stimulus challenge.

Suitable goals:

- Build Muscle, rarely
- Build Muscle & Strength, rarely

Suitable blocks:

- Hypertrophy only, and only for low-risk machine/accessory contexts

Suitable roles:

- Machine compound
- Isolation
- Small muscle accessory

Suitable rep ranges:

- broad, usually 8-25

Fatigue cost: high.

Risk level: high due to volume noise and recovery cost.

Beginner suitability: no.

Progression support: low to moderate; noisy evidence.

Hypertrophy support: possible but not efficient as a default.

Strength support: low.

Exclude from:

- Strength
- Power
- Peak
- Recovery Window
- Powerlifting Meet
- primary squat/deadlift/bench/OHP slots
- high fatigue/re-entry/Get Leaner fatigue-controlled contexts

### Ladder

What it is: repeated ascending rep waves, such as 1-2-3, 2-3-5, or load-stable escalating reps.

Typical use case: skill practice, power-quality practice, bodyweight progression, submaximal strength volume.

Suitable goals:

- Build Strength
- Athletic Performance
- Build Muscle & Strength
- Build Muscle for bodyweight/accessory work

Suitable blocks:

- Powerbuilding
- Strength
- Power, for crisp low-rep waves
- Hypertrophy, for bodyweight/calisthenic accessories

Suitable roles:

- Primary compound, rarely
- Secondary compound
- Bodyweight movement
- Power movement with low reps

Suitable rep ranges:

- 1-5 for power/strength ladders
- 3-10 for bodyweight/accessory ladders

Fatigue cost: low to moderate if capped.

Risk level: moderate because users may overrun volume.

Beginner suitability: possible for bodyweight or simple movements.

Progression support: moderate.

Hypertrophy support: moderate.

Strength support: moderate.

Exclude from:

- late Peak
- Recovery Window
- high fatigue
- exercises with poor technique consistency

### Eight Across

What it is: 8 sets with the same load/reps target, typically used for density, practice, or volume accumulation.

Typical use case: hypertrophy/capacity block specialization.

Suitable goals:

- Build Muscle
- Build Muscle & Strength, rarely
- Athletic Performance, only if used as capacity support and fatigue is acceptable

Suitable blocks:

- Hypertrophy
- Powerbuilding, rarely

Suitable roles:

- Machine compound
- Isolation
- Small muscle accessory
- Primary compound only in very constrained advanced cases

Suitable rep ranges:

- 6-12 for compounds
- 10-25 for isolation

Fatigue cost: high.

Risk level: high if used on axial compounds.

Beginner suitability: no.

Progression support: moderate but noisy.

Hypertrophy support: high if recovery supports it.

Strength support: low to moderate.

Exclude from:

- Strength primary lifts
- Power
- Peak
- Recovery Window
- Get Leaner unless very low-risk and clearly recovered

### Big & Strong

What it is: not a universally standardised method. In this audit it means a heavy compound strength exposure followed by hypertrophy support work for the same pattern/muscle group.

Typical use case: powerbuilding session structure.

Suitable goals:

- Build Muscle & Strength
- Build Strength
- Build Muscle for advanced users

Suitable blocks:

- Powerbuilding
- Strength support
- Hypertrophy primary slot, rarely

Suitable roles:

- Primary compound plus secondary/accessory slots

Suitable rep ranges:

- primary: 3-6 or 5-8
- support: 8-15

Fatigue cost: moderate to high.

Risk level: moderate.

Beginner suitability: no as a labelled method; beginners can get simpler versions via normal templates.

Progression support: high.

Hypertrophy support: high.

Strength support: high.

Exclude from:

- Power movement slots
- Peak late phase
- Recovery Window
- high systemic fatigue

### 5/3/1

What it is: a named percentage-based long-term progression system built around rotating main lifts, submaximal training maxes, and planned waves.

Typical use case: standalone strength programme architecture.

Suitable goals:

- Build Strength
- Build Muscle & Strength

Suitable blocks:

- It is more a programme model than a set method. It does not fit cleanly as a random injected set style.

Suitable roles:

- Primary compound only

Suitable rep ranges:

- 5, 3, 1+ style exposures plus supplemental work

Fatigue cost: moderate.

Risk level: medium if implemented fully, high if half-implemented.

Beginner suitability: possible in real-world programming, but not needed for Adaptive Strength Coach launch.

Progression support: high if implemented as a full model.

Hypertrophy support: depends on supplemental work.

Strength support: high.

Exclude from:

- being injected as an occasional method
- power/peak/recovery
- Powerlifting Meet taper unless formally integrated

Recommendation: defer. Do not implement as a partial method card. If added later, treat as a dedicated programme template or compatibility mode.

### Last Set AMRAP

What it is: final work set allows as many clean reps as possible within a strict cap/technical-quality rule.

Typical use case: performance check, hypertrophy stimulus, rep PR opportunity.

Suitable goals:

- Build Muscle
- Build Muscle & Strength
- Build Strength, carefully
- Get Leaner, rarely and only low fatigue

Suitable blocks:

- Hypertrophy
- Powerbuilding
- Strength support slots, carefully

Suitable roles:

- Secondary compound
- Machine compound
- Isolation
- Some primary compounds only for advanced users and low-risk contexts

Suitable rep ranges:

- 6-15 compounds
- 10-25 isolation

Fatigue cost: moderate to high.

Risk level: moderate to high depending exercise.

Beginner suitability: generally no, because “AMRAP” invites form breakdown.

Progression support: high for rep PRs and target-zone learning if capped.

Hypertrophy support: high.

Strength support: moderate.

Exclude from:

- Power
- Peak
- Recovery Window
- high fatigue
- pain/limitation history
- deadlift-family primary slots unless extremely constrained
- late meet prep

Important: user-facing copy should say “clean rep cap,” not “go to failure.”

### Boring But Big

What it is: high-volume supplemental work, usually 5x10, often after a main lift.

Typical use case: strength base and hypertrophy support.

Suitable goals:

- Build Muscle & Strength
- Build Strength
- Build Muscle, if scaled and not tied to 5/3/1 branding

Suitable blocks:

- Powerbuilding
- Hypertrophy support
- early Strength

Suitable roles:

- Primary lift supplemental variation
- Secondary compound
- Machine compound substitution where fatigue needs control

Suitable rep ranges:

- usually 10s, but should be adapted rather than copied blindly

Fatigue cost: high.

Risk level: high if applied to squat/deadlift too often.

Beginner suitability: no, unless heavily scaled and not labelled BBB.

Progression support: moderate.

Hypertrophy support: high.

Strength support: moderate through practice and volume.

Exclude from:

- Power
- Peak
- Recovery Window
- high fatigue
- late meet prep
- Get Leaner unless recovery evidence is excellent

Recommendation: defer unless implemented as “supplemental volume block” rather than a branded 5/3/1 clone.

## 3. Suitability Matrix

Legend:

- Yes = good fit
- Maybe = only with guardrails/history
- No = do not use

### Methods vs Blocks

| Method | Hypertrophy | Powerbuilding | Strength | Power | Peak | Recovery Window |
|---|---|---|---|---|---|---|
| Heavy Single + Backoffs | No | Maybe | Maybe | No | Maybe | No |
| Heavy Triple + Backoffs | No | Yes | Yes | No | Maybe | No |
| Heavy Five + Backoffs | Maybe | Yes | Yes | No | No | No |
| Short Pyramid | Yes | Yes | Yes | Maybe support only | Maybe specific ramp only | No |
| Heavy Pyramid | No | Maybe | Yes | No | Maybe early only | No |
| Mega Pyramid | Maybe isolation only | No | No | No | No | No |
| Ladder | Maybe | Maybe | Maybe | Maybe crisp only | No | No |
| Eight Across | Maybe | Maybe rare | No | No | No | No |
| Big & Strong | Maybe | Yes | Maybe | No | No | No |
| 5/3/1 | No | No as method | No as method | No | No | No |
| Last Set AMRAP | Yes guarded | Yes guarded | Maybe support only | No | No | No |
| Boring But Big | Maybe scaled | Maybe | Maybe early | No | No | No |

### Methods vs Goals

| Method | Build Muscle | Build Strength | Muscle & Strength | Get Leaner | Athletic Performance | Powerlifting Meet |
|---|---|---|---|---|---|---|
| Heavy Single + Backoffs | No | Maybe | Maybe rare | No | No | Maybe advanced |
| Heavy Triple + Backoffs | No | Yes | Yes | Maybe | No | Yes early/mid |
| Heavy Five + Backoffs | Maybe | Yes | Yes | Maybe | Maybe support | Maybe early |
| Short Pyramid | Yes | Yes | Yes | Yes | Maybe support | Maybe early |
| Heavy Pyramid | No | Yes | Maybe | No | No | Maybe early |
| Mega Pyramid | Maybe | No | No | No | No | No |
| Ladder | Maybe | Maybe | Maybe | Maybe | Yes if power quality | No late |
| Eight Across | Maybe | No | Maybe rare | No | No | No |
| Big & Strong | Maybe | Maybe | Yes | No | No | No |
| 5/3/1 | No | Defer | Defer | No | No | No |
| Last Set AMRAP | Yes guarded | Maybe | Yes guarded | Maybe rare | No | No late |
| Boring But Big | Maybe scaled | Maybe | Maybe | No | No | No |

### Methods vs Exercise Roles

| Method | Primary Compound | Secondary Compound | Machine Compound | Unilateral | Isolation | Core/Bracing | Power Movement | Recovery Movement |
|---|---|---|---|---|---|---|---|---|
| Heavy Single + Backoffs | Yes advanced | No | No | No | No | No | No | No |
| Heavy Triple + Backoffs | Yes | Maybe | Maybe | No | No | No | No | No |
| Heavy Five + Backoffs | Yes | Yes | Yes | Maybe | No | No | No | No |
| Short Pyramid | Yes | Yes | Yes | Maybe | Maybe | No | No | No |
| Heavy Pyramid | Yes | Maybe | Maybe | No | No | No | No | No |
| Mega Pyramid | No | No | Maybe | No | Maybe | No | No | No |
| Ladder | Maybe | Maybe | Maybe | Maybe | Maybe bodyweight | Maybe low risk | Maybe | No |
| Eight Across | No mostly | Maybe | Maybe | No | Maybe | No | No | No |
| Big & Strong | Yes as session structure | Yes | Maybe | Maybe support | Maybe support | No | No | No |
| 5/3/1 | Yes only | No | No | No | No | No | No | No |
| Last Set AMRAP | Maybe guarded | Maybe | Yes | Maybe | Yes | No | No | No |
| Boring But Big | Maybe | Maybe | Maybe | No | No | No | No | No |

## 4. Risk Matrix

| Method | Fatigue cost | Technical risk | Evidence noise | Launch risk |
|---|---:|---:|---:|---:|
| Heavy Single + Backoffs | Moderate-high | High | Medium | High |
| Heavy Triple + Backoffs | Moderate | Medium | Low-medium | Medium |
| Heavy Five + Backoffs | Moderate | Medium | Low-medium | Medium |
| Short Pyramid | Low-medium | Low-medium | Medium | Low |
| Heavy Pyramid | Moderate-high | Medium-high | Medium | Medium-high |
| Mega Pyramid | High | Medium | High | High |
| Ladder | Low-medium | Medium | Medium | Medium |
| Eight Across | High | Medium | High | High |
| Big & Strong | Moderate-high | Medium | Medium | Medium |
| 5/3/1 | Moderate | Medium | Low if complete | High if partial |
| Last Set AMRAP | Moderate-high | High if misunderstood | Medium | Medium-high |
| Boring But Big | High | Medium | High | High |

## 5. Safe Use Rules

### Global eligibility rules

A method can only appear when all of these are true:

- the block allows it
- the goal allows it
- the exercise role allows it
- the user has enough history for the exercise or method is low risk
- fatigue classification is low or controlled moderate
- no recent pain/limitation reason for the exercise/family
- no recent equipment-unavailable reason that would force awkward substitutions
- no repeated shutdown/drop-off trend
- no training-gap re-entry state
- no Recovery Window
- no late taper/event week unless the method is explicitly peak-specific and low fatigue
- set prescription stays within hard caps

### Frequency caps

Suggested launch caps:

- Heavy Triple/Five + Backoffs: max 1-2 exercises per week, max 1 per session.
- Short Pyramid: max 1-2 exercises per session.
- Last Set AMRAP: max 1 exercise per session, max 1-2 per week.
- No method should appear on every workout in a block.
- No method should appear repeatedly on a lift with declining performance.

### Week 1 rules

Can appear in week 1:

- Short Pyramid, if low risk.

Usually should not appear in week 1:

- Heavy Single/Triple/Five + Backoffs unless the user has meaningful history.
- Last Set AMRAP.
- Eight Across.
- Boring But Big.

Reason: week 1 should establish baseline and target-zone evidence rather than injecting noisy methods.

### Meet/event timing rules

Powerlifting Meet:

- 8+ weeks out: Heavy Triple/Five + Backoffs may be used sparingly.
- 4-8 weeks out: more specificity, less novelty.
- 2-3 weeks out: only specific, low-fatigue structures.
- final week: no AMRAP, no BBB, no pyramids, no novelty.

Athletic events:

- avoid high-fatigue lifting methods when conditioning/event specificity is already high.

Get Leaner:

- avoid high-fatigue methods unless strength retention evidence is excellent and recovery/cardio load is controlled.

## 6. Interaction With Existing Systems

### Evidence-based prescription matrix

Methods should sit on top of slot prescriptions, not replace them blindly.

Example:

- Primary compound slot says 3 required, target 3-5, soft cap 5.
- Heavy Triple + Backoffs can express that as one top triple plus 2-3 backoff sets.
- It must not become 7 total hard sets unless the slot hard cap allows it.

### Target zones

Target-zone learning is compatible if methods expose clean set intent:

- Heavy-end methods can support load-biased evidence.
- AMRAP can support rep-biased evidence only when capped to clean reps and not treated as absolute failure.
- Mega pyramids and eight-across can create noisy evidence and should be avoided early.

### Load selection

Methods need explicit load anchors:

- top set load
- backoff percentage or conservative decrement
- same-load repeat sets
- AMRAP cap

Load selection must continue to respect:

- exact irregular machine loads
- target-zone midpoint
- first-exposure caution
- double-progression prevention after in-session escalation

### Progression throttle

Methods can be implemented without breaking throttle if throttle remains final authority.

Required rule:

- method says “what structure to try”
- throttle says “whether progression is allowed”

### Fatigue separation

Methods should feed fatigue evidence:

- failed top set = exercise-specific fatigue signal
- multiple method failures across unrelated lifts = systemic fatigue signal
- AMRAP/drop-off collapse = higher fatigue signal
- high-volume methods add workload cost

### Volume learning

Methods must not bypass volume caps.

High-volume methods like BBB, Eight Across, Mega Pyramid should count as real volume and be blocked if volume ladder is already high, fatigue is rising, or Recovery/Capacity signals are poor.

### Recovery Window

Methods should generally be disabled.

Recovery Window can use:

- simple straight sets
- easy ramps
- movement-quality practice

It should not use named intensity/volume methods.

### Peak

Peak can use:

- specific top single/triple exposure only when advanced, low fatigue, and meet-specific

Peak should not use:

- AMRAP
- BBB
- mega pyramids
- eight across
- novelty ladders

### Power quality model

Power methods must be quality-first.

Compatible:

- crisp ladders with low reps
- speed sets

Not compatible:

- fatigue-chasing AMRAP
- high-volume pyramids
- grinding backoffs

### Manual finish / shutdown / set delete

Methods must be resilient to user control:

- user can delete future method sets
- user can manually finish exercise
- shutdown hides future method sets
- Workout Review should not treat removed optional method sets as failure

### Workout Review

Workout Review needs method context:

- “Top triple held. Backoffs completed.”
- “AMRAP capped by clean reps.”
- “Method stopped early due to fatigue.”

Without this, Review could misread method performance as normal straight-set performance.

### Strength Dashboard and PR tracking

Compatible if:

- warm-ups excluded
- method top sets count normally
- AMRAP PRs are deduped
- backoff volume does not create fake load PRs
- first-exposure baseline rules still apply

## 7. UX Recommendation

Best approach: B + E now, D later.

Recommended:

- app chooses methods sparingly
- method is labelled on the exercise/workout card
- short explanation is shown
- user can ignore/finish/delete sets normally
- later setting can disable advanced methods

Not recommended:

- user-selectable method library at launch
- random “variety mode”
- forcing users to choose between 12 named methods
- using method names without explaining why they appeared

Suggested UI:

Exercise card:

> Method: Heavy Five + Backoffs
> One strong set, then cleaner lower-load work.

Workout Review:

> Heavy Five + Backoffs completed. Top set was stable; backoff work stayed productive.

Settings later:

- Advanced set methods: Recommended / Minimal / Off

Default:

- Minimal or Recommended only after enough history.

## 8. Tier Ranking

### Tier 1: Safe / high-value now

1. Short Pyramid
   - low complexity
   - easy to explain
   - useful for compounds
   - least likely to break autoregulation

2. Heavy Five + Backoffs
   - useful bridge between strength and hypertrophy
   - works for Powerbuilding and Strength
   - easier than singles/triples for many users

3. Heavy Triple + Backoffs
   - strong fit for Strength and Powerlifting Meet
   - should require intermediate+ and history

4. Last Set AMRAP, tightly constrained
   - useful for PRs and target-zone evidence
   - must be “clean rep cap,” not failure-chasing

### Tier 2: Useful later

5. Ladder
   - useful for bodyweight/power/skill practice
   - needs good UI and volume accounting

6. Big & Strong
   - good powerbuilding framing
   - needs formal definition before implementation

7. Heavy Single + Backoffs
   - useful for Powerlifting Meet/advanced Strength
   - too risky until meet-readiness handling is mature

8. Boring But Big, adapted
   - useful as supplemental-volume block
   - high fatigue and easy to over-prescribe

### Tier 3: Avoid or defer

9. 5/3/1
   - defer as a full programme mode, not a set method

10. Eight Across
   - too fatigue-heavy and noisy for broad launch use

11. Heavy Pyramid
   - useful but overlaps with Short Pyramid / Heavy + Backoffs

12. Mega Pyramid
   - too fatiguing and novelty-driven for Adaptive Strength Coach’s current philosophy

## 9. Implementation Plan

If implemented, create:

`src/domain/training/training-methods.ts`

Suggested model:

```ts
type TrainingMethodId =
  | "short_pyramid"
  | "heavy_five_backoffs"
  | "heavy_triple_backoffs"
  | "last_set_clean_amrap";

interface TrainingMethodEligibilityInput {
  goal: TrainingSetupGoal;
  block: BlockType;
  sessionType: string;
  exerciseRole: ExerciseRole;
  exerciseFamily: ExerciseFamily;
  trainingLane: TrainingLane;
  experienceLevel: ExperienceLevel;
  fatigueClassification: FatigueClassification;
  targetZone: ExerciseTargetZoneResult;
  exerciseHistory: ExerciseHistorySummary[];
  eventTaperPhase?: EventPhase;
  recoveryWindow?: boolean;
}

interface TrainingMethodPrescription {
  methodId: TrainingMethodId;
  label: string;
  explanation: string;
  setRows: MethodSetPrescription[];
  fatigueCost: "low" | "moderate" | "high";
  reviewEvidenceTags: string[];
}
```

Implementation phases:

1. Define method catalogue and eligibility only.
2. Add tests for eligibility and exclusions.
3. Add `short_pyramid` only.
4. Add UI label and Workout Review method evidence.
5. Add Heavy Five + Backoffs.
6. Add Heavy Triple + Backoffs.
7. Add Last Set Clean AMRAP with strict caps.
8. Add setting later if needed.

Required guardrails:

- no method in Recovery Window
- no AMRAP in Peak/Power
- no high-fatigue methods when fatigue is moderate/high
- no methods after pain/limitation evidence
- no methods for beginners except simple Short Pyramid
- no method can exceed slot hard caps
- method rows must remain deletable/finishable/shutdown-compatible

Tests required:

- method eligibility by block/goal/role
- beginner exclusions
- fatigue exclusions
- Recovery Window exclusions
- late Peak meet-prep exclusions
- target-zone compatibility
- method set rows respect hard caps
- manual finish and set delete remain compatible
- Workout Review understands method evidence
- PR tracking excludes warm-ups and deleted rows

## 10. Freeze / Change Recommendation

Recommendation: freeze current coaching architecture for monetisation, do not implement methods immediately.

Rationale:

- The current product already has enough coaching depth: evidence-based prescriptions, target zones, fatigue separation, Recovery Windows, Power/Peak templates, Strength Dashboard, PRs, and reports.
- Methods add meaningful value, but they are not required for a paid beta.
- Poorly implemented methods could make the app feel random, noisy, or less trustworthy.
- The correct implementation needs dedicated set-row modelling and Workout Review context.

Commercially sensible path:

1. Freeze current coaching architecture.
2. Implement subscription/paywall.
3. Gather real beta usage.
4. Add Tier 1 methods as a controlled “advanced coaching refinement,” not as launch-critical scope.

Build/no-build recommendation:

- No build is needed from this audit.
- Do not block monetisation on training methods.
- Add methods only after the entitlement/paywall work or if beta feedback clearly asks for more workout variety.
