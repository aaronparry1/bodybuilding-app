# Training Resource Allocation Policy v1

Decision 9C locks training resource allocation into the Coaching Knowledge Layer.

The policy answers one question:

> How should recoverable training resources be distributed across this composed session?

It does not choose exercises, methods, loading, progression, recovery interventions, or training state transitions.

## Architectural Boundary

Resource allocation logic lives only in `src/domain/training/training-resource-allocation-policy.ts`.

The Workout Builder may consume allocation outputs, but it must not invent volume logic. It should not hard-code set counts, add accessory sets because a template usually has them, or remove mission-critical work for convenience.

Upstream engines remain responsible for:

- Session composition
- Training state
- Adaptation detection
- Intervention selection
- Method selection
- Exercise selection or rotation
- Loading and progression
- Recovery management

The Training Resource Allocation Policy receives those outputs and assigns recoverable work to the highest-value layers first.

## Core Rule

Allocate resources to the highest-value work first.

Volume is not simply a set count. It is the distribution of recoverable work toward the current objective.

## Session Layer Priority

Resources are allocated in this order:

1. Mission Critical
2. Primary Support
3. Weakness Development
4. Structural Balance
5. Recovery / Mobility / Optional Work

Mission Critical work receives resources first. Lower layers receive resources only after higher layers are sufficiently funded.

## Recovery And Time Constraints

When recovery is compromised, lower-priority layers are reduced before mission-critical work.

When time is limited, the policy reduces or removes layers in this order:

1. Recovery / Mobility / Optional Work
2. Structural Balance
3. Weakness Development
4. Primary Support
5. Mission Critical only when safety or critical recovery requires it

## Adaptation Rules

If adaptation is strong, the policy should avoid unnecessary volume increases.

If adaptation is slowing and recovery is good, the policy may add targeted resources or reallocate work toward the limiting layer.

If adaptation is slowing and recovery is poor, the policy reduces total allocation or shifts resources toward lower-fatigue work.

## Pain And Safety

Pain or issue flags redirect resources away from avoidable stress.

Pain does not automatically delete the session objective, but it can reduce mission-critical work and raise safety flags for downstream resolution.

## Volume Spike Guardrail

Recent allocation history is used to avoid sudden uncontrolled volume spikes.

This is not long-term progression logic. It is a session-level safety guardrail so a single allocation cannot jump far beyond recent recoverable work without justification.

## Training State Bias

The policy respects the current training state:

- Foundation: skill practice, consistency, conservative volume
- Accumulation: hypertrophy and work-capacity resources
- Intensification: high-quality strength work with managed accessory volume
- Realisation: specificity and low-noise performance work
- Pivot: restoration, lower-stress variation, and structural balance

## Workout Builder Contract

The Workout Builder consumes:

- `allocation_by_layer`
- `set_budget_by_layer`
- `target_work_sets_by_exercise`
- `volume_adjustments`
- `removed_or_reduced_layers`
- `recovery_cost_estimate`
- `time_cost_estimate`
- `reason_codes`
- `safety_flags`

The Workout Builder must not add, remove, or redistribute working sets outside this policy. If a generated workout needs a different resource distribution, it should request a new allocation from this policy.
