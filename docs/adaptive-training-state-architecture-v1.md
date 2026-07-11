# Adaptive Training State Architecture v1

Status: Decision locked.

Adaptive Strength Coach uses internal adaptive training states instead of rigid fixed-duration block progression.

This document protects Decision 8D. Future programme work must use these internal states as the top-level programme structure. Traditional labels such as hypertrophy, strength, power, and peak can inform emphasis, but they must not become the primary rigid structure again.

## Internal States

The internal states are:

- Foundation
- Accumulation
- Intensification
- Realisation
- Pivot

These are engine concepts. They do not need to be shown to users as labels.

## Governing Rule

State progression is evidence-based.

The engine should consider:

- workout performance
- progression velocity
- fatigue and recovery signals
- completion quality
- recent training history
- evidence confidence

Calendar time alone must not force state progression in continuous development.

## Exposure Bounds

No state may continue indefinitely.

Every state must define:

- minimum exposure duration/session count
- maximum exposure duration/session count
- entry criteria
- continuation criteria
- exit criteria
- fallback criteria

Minimum exposure prevents flip-flopping. Maximum exposure prevents the coach from getting stuck in Foundation or Accumulation forever.

## Anti-Flip-Flop Rule

The engine must not move between states simply because one recent signal changed.

A state review requires:

- minimum exposure satisfied
- sufficient evidence confidence
- objective training evidence

If the athlete recently changed state and has not accumulated enough exposure, the coach should continue gathering evidence unless fallback criteria are severe.

## Maximum Exposure Rule

Foundation and Accumulation cannot run forever.

If maximum exposure is reached, review or escalation is mandatory. The engine may not silently continue the same state just because the calendar block has not ended or because no next block decision exists yet.

## Traditional Block Labels

Traditional labels may inform emphasis:

- hypertrophy
- strength
- power
- peak
- recovery

They are not the primary programme architecture.

The state system answers:

"What adaptive training state is the athlete in?"

Traditional labels answer:

"What emphasis helps deliver this state?"

## Boundary

This decision does not implement:

- session PR recognition
- progress celebration
- next-block decision logic
- workout generation changes
- exercise selection changes
- rep/load/set changes

Those belong to future decisions.

## Implementation Anchor

The canonical implementation is:

- `src/domain/training/adaptive-training-state.ts`
- `tests/adaptive-training-state.test.ts`

Future work must not reintroduce rigid fixed-duration block progression as the main programme engine.
