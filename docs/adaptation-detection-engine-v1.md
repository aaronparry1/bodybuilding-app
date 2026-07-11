# Adaptation Detection Engine v1

Status: Decision locked.

The Adaptation Detection Engine evaluates whether the current training stimulus is still producing adaptation.

It must not reduce progress to workout completion. Completion matters as evidence quality and context, but adaptation is classified from recent objective training evidence.

## Levels

The engine evaluates adaptation at three levels:

- Exercise level
- Movement-pattern level
- Programme/system level

Exercise saturation is detected as an exercise-level adaptation status. It must not become a separate disconnected engine.

## Status Outputs

The canonical statuses are:

- adapting
- likely_adapting
- slowing
- plateau_approaching
- plateaued
- saturated
- regressing
- insufficient_evidence

Every result must include confidence and reason codes.

## Evidence Inputs

Use compact evidence summaries where available:

- best set trend
- estimated 1RM trend
- rep performance trend
- load trend
- completed vs planned work
- failed set frequency
- session difficulty
- fatigue/recovery signals
- missed sessions
- pain/issue flags
- exercise age / exposure count
- movement-pattern performance trend
- system-wide performance trend

## Interpretation Rules

One poor session is noise unless paired with strong fatigue, pain, recovery, or safety warning signs.

Repeated poor exposures increase confidence that adaptation is slowing or stopped.

Poor performance plus high fatigue should be treated primarily as a recovery/fatigue issue.

Poor performance plus normal recovery should be treated primarily as a stimulus/adaptation issue.

Poor performance across multiple unrelated movement patterns should be treated as a system-level issue.

Use evidence windows and confidence thresholds. Do not trigger major changes from one poor session.

## Boundary

This engine feeds future systems:

- progression adjustment
- exercise rotation
- method selection
- deloads
- adaptive training state transitions

It does not directly replace those engines.

This decision does not implement user-facing PR recognition. Session PR/progress recognition remains a separate future decision.

## Implementation Anchor

The canonical implementation is:

- `src/domain/training/adaptation-detection-engine.ts`
- `tests/adaptation-detection-engine.test.ts`

Future work must not regress to simple "completed workout = progress" logic.
