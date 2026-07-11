# Session Composition Policy v1

Decision 9B locks session composition into the Coaching Knowledge Layer.

The policy answers one question:

> Given the objective and the upstream-selected training pieces, how should this workout be arranged?

It does not choose exercises, methods, loading, progression, recovery interventions, or training state transitions.

## Architectural Boundary

Session composition logic lives only in `src/domain/training/session-composition-policy.ts`.

The Workout Builder may consume a composed session, but it must not invent session structure. It should not decide what is mission-critical, what is optional, or which accessories survive time compression. Those decisions belong to this policy.

Upstream engines remain responsible for:

- Training state
- Adaptation detection
- Intervention selection
- Method selection
- Exercise rotation or delivery
- Loading and progression
- Recovery gating

The Session Composition Policy receives those outputs and arranges the session around one primary objective.

## Core Rule

Every workout has exactly one primary objective.

Examples:

- Maximal squat strength
- Maximal bench strength
- Maximal deadlift strength
- Bench hypertrophy
- Posterior chain development
- Technical refinement
- Overhead strength
- Recovery
- Weak-point development

Everything below the primary work must justify its place by supporting that objective.

## Session Layers

### Layer 1: Mission Critical

The highest-priority work. It directly delivers the session objective.

This layer cannot be removed unless safety, pain, or critical recovery requires it.

### Layer 2: Primary Support

Direct support for the mission-critical work.

Examples include a secondary press on a bench-focused day or upper-back support for heavy pressing.

### Layer 3: Weakness Development

Exercises that target limiting factors identified by upstream coaching decisions.

Examples include triceps lockout support, upper-back support, bracing work, or posterior-chain weak-point work.

### Layer 4: Structural Balance

Joint health, antagonist work, trunk, posterior-chain balance, unilateral balance, and similar supportive work.

This layer should improve durability or support future training without interfering with the primary training effect.

### Layer 5: Recovery / Mobility / Optional Work

Cool-down, mobility, restoration, low-stress optional work, or recovery-supporting work.

This is the first layer removed when time or recovery is limited.

## Time Compression

If available time decreases, the policy compresses the session in this order:

1. Remove Layer 5.
2. Reduce Layer 4.
3. Reduce Layer 3.
4. Modify Layer 2.
5. Modify Layer 1 only if safety or recovery requires it.

The session objective is never removed for convenience. If the objective cannot be trained safely in the available time, that should be escalated through the Coaching Decision Resolver.

## Guardrails

The policy must:

- Preserve one primary objective.
- Preserve specificity throughout the session.
- Avoid junk volume.
- Prevent accessories from interfering with the primary training effect.
- Respect recovery recommendations.
- Respect pain or issue flags.
- Respect current training state.
- Keep lower-priority work removable before mission-critical work.

The policy must not:

- Select exercises.
- Select methods.
- Prescribe load.
- Prescribe progression.
- Decide recovery interventions.
- Mutate programme state.
- Start or save workouts.

## Workout Builder Contract

The Workout Builder consumes:

- `session_objective`
- `composed_session_layers`
- `exercise_priority`
- `estimated_duration`
- `removable_layers`
- `compression_strategy`
- `structural_balance_score`
- `reason_codes`

It may render or execute the composed workout, but it must not create its own session hierarchy.
