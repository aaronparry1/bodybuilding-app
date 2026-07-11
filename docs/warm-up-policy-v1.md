# Warm-up Policy v1

Status: Coaching Knowledge Layer policy.

Warm-up logic lives in Warm-up Policy 9A. A future Workout Builder may consume warm-up plans, but it must not invent warm-up logic.

## Structure

Warm-ups have two parts:

1. General warm-up
2. Exercise-specific warm-up / ramp-up sets

General warm-up defaults to 3-8 minutes, stays low fatigue, and exists for readiness, temperature, joint preparation, and mental focus.

Specific warm-up sets ramp from lighter to heavier loads while reps decrease as the working load approaches. They prepare performance without creating fatigue.

## Rules

- Main compound lifts require exercise-specific warm-ups.
- Light isolation/accessory lifts use minimal warm-ups.
- Heavy, technical, or early-session lifts receive more ramp-up sets.
- Later exercises in the same movement pattern can use fewer warm-up sets.
- Pain or issue flags require more conservative ramping and safety flags.
- High-intensity methods require more specific ramping: heavy single/triple/five backoffs, wave loading, clusters, and 5/3/1.
- Warm-up sets do not count as working volume unless explicitly changed by a future policy.

## Time-Limited Sessions

When time is limited, the policy produces a compressed warm-up option. It may reduce general duration and ramp count, but it does not remove preparation before heavy or high-skill work.

If a safe warm-up cannot fit, the policy raises safety flags recommending workout compression or method adjustment through the Coaching Decision Resolver.

## Boundary

Warm-up Policy does not decide progression, method selection, exercise selection, state transitions, or workout mutation. It can raise safety flags. The Coaching Decision Resolver remains responsible for resolving those flags into final coaching action.
