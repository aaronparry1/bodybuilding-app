# Adaptive Programming Framework v1 Report

Status: research/design output.  
Date: 2026-06-28

Production app untouched.

## Files Created

- `docs/adaptive-programming-framework-v1.md`
- `reports/adaptive_stress_lab/adaptive_programming_framework_v1.md`

## Purpose

This sprint created the scientific programming framework for future Adaptive Strength Coach programming decisions.

The key shift:

> ASC must prescribe by intent, not by random rep range.

Every future prescription should explain:

- scientific support
- coaching rationale
- product rationale
- validation method

## Core Framework

The proposed prescription chain is:

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

## Set Objectives Defined

The framework defines five internal set objectives:

| Objective | Purpose | Main value | Main risk |
|---|---|---|---|
| Calibration | Discover current useful zone | High data value | Can become fatiguing if AMRAP-led |
| Productive | Accumulate useful stimulus | Adaptation | Junk volume if uncontrolled |
| Verification | Confirm ownership/readiness | High confidence | Can delay progress if overused |
| Performance | Express/test ability | Milestone/data | High fatigue and ego risk |
| Recovery | Maintain movement with low stress | Sustainability | Undertraining if misused |

## Coaching Biases Defined

The framework defines seven programming biases:

- tension bias
- balanced bias
- metabolic bias
- speed/power bias
- skill bias
- recovery bias
- peak bias

These are internal prescription descriptors. They are not recommended as user-facing UI yet.

## Exercise Categories Covered

The document separates prescriptions for:

- competition squat
- competition bench
- competition deadlift
- standing overhead press
- heavy compounds
- machine compounds
- isolation
- power movements
- bodyweight/duration movements

## Key Programming Conclusions

### Strength

Strength prescriptions should include sub-3 rep work when justified.

Allowed zones:

- singles
- doubles
- triples
- 3-5 strength work
- 5-8 secondary strength work

Guardrail:

- heavy work must be tied to objective, phase, safety state, and evidence quality.

### Hypertrophy

Hypertrophy prescriptions can use broad loading and rep zones.

Allowed zones:

- 6-10
- 8-12
- 8-15
- 10-20
- 12-25

Guardrail:

- ranges alone can be abused; the app needs objective and coaching bias to interpret the result.

### Power

Power prescriptions should be low-rep, high-quality, and low-fatigue.

Allowed zones:

- 1-5 reps for loaded power work
- 3-6 quality efforts for jumps/throws

Guardrail:

- no bar-speed claims without sensors.

### Peaking

Peaking should increase specificity and reduce volume.

Allowed zones:

- singles
- doubles
- triples
- low-volume specific practice

Guardrail:

- peaking must not look like ordinary strength/hypertrophy work with a new label.

### AMRAP

AMRAP is allowed only as a deliberate data tool.

Allowed contexts:

- early exercise calibration
- uncertainty
- plateau diagnosis
- periodic re-test
- low-risk top-range check
- selected milestone

Avoid:

- every session
- high fatigue
- pain/safety concern
- recovery week
- late peak unless deliberately planned
- high-risk squat/deadlift contexts

## Adaptive Set Allocation Implication

The framework explicitly states that Adaptive Set Allocation should remain advisory until rep/load intent exists.

Reason:

A set range cannot be interpreted correctly unless the app knows whether today's work is:

- calibration
- productive volume
- verification
- performance expression
- recovery

Example:

Stopping at 2 sets of a 2-4 prescription may be excellent for recovery or verification, but premature for productive hypertrophy volume if quality remains high and fatigue cost is low.

## Evidence Used

Primary evidence and authoritative sources included:

- ACSM 2009 Position Stand on progression models in resistance training: https://pubmed.ncbi.nlm.nih.gov/19204579/
- Schoenfeld et al. low- vs high-load strength/hypertrophy meta-analysis: https://pubmed.ncbi.nlm.nih.gov/28834797/
- Schoenfeld, Ogborn, and Krieger weekly volume hypertrophy meta-analysis: https://pubmed.ncbi.nlm.nih.gov/27433992/
- Moesgaard et al. periodization meta-analysis: https://pubmed.ncbi.nlm.nih.gov/35044672/
- Williams et al. periodized vs non-periodized strength meta-analysis: https://pubmed.ncbi.nlm.nih.gov/28497285/
- Autoregulation load/volume review: https://pmc.ncbi.nlm.nih.gov/articles/PMC8762534/
- Proximity-to-failure hypertrophy meta-analysis: https://pubmed.ncbi.nlm.nih.gov/36334240/
- Failure vs non-failure meta-analysis: https://pubmed.ncbi.nlm.nih.gov/33497853/
- Tapering and peaking for powerlifting review: https://pmc.ncbi.nlm.nih.gov/articles/PMC7552788/
- Catalyst Athletics Prilepin limitations article: https://www.catalystathletics.com/article/2229/Prilepins-Table-for-Olympic-Weightlifting/
- Reactive Training Systems Prilepin critique: https://store.reactivetrainingsystems.com/blogs/advanced-concepts/why-i-dont-use-prilepins-chart

## Open Aaron Decisions

1. Should set objective ever be visible to users, or remain internal?
2. Should advanced users ever get an optional "performance check" or AMRAP toggle?
3. Should ASC permit peak prescriptions outside Powerlifting Meet mode?
4. Should top-range checks become a stored set type?
5. How often should calibration be allowed for isolation work?
6. Should duration exercises eventually use load ownership once weighted holds are supported?
7. Should power prescriptions remain lower-confidence until sensor or explicit performance metrics exist?

## Recommended Next Sprint

Recommended V2 lab sprint:

Adaptive Programming Schema v0.1

Create lab-only schemas for:

- set objective
- coaching bias
- rep prescription type
- load intent
- AMRAP policy
- top-range check policy
- peak specificity
- validation method

Then run them through:

- Coaching Gauntlet
- Simulation v0.2/v0.3
- Push Outcome Learning
- Load Ownership
- Athlete Lifetime Progress design

## Verification

Documentation/design only.

No production app code changed.

No EAS build started.

