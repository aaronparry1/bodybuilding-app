# Duplicate training-days resolution

## Cause

`daysPerWeek` and `startingVolumeContext.recentTrainingDaysPerWeek` both used full schedule-style cards. One means “what can you train now”; the other means “what were you doing before today.” The second fact genuinely affects the bounded initial-volume policy, so deleting it would remove production input.

## Correction

- Future schedule remains a 2–6 day choice on Schedule.
- Historical frequency appears only after “I’m training consistently.”
- It uses compact 1–7 buttons headed “Your recent routine.”
- Guidance says it helps select starting workload and does not change the new schedule.
- A short break or longer absence hides the historical-frequency control and deterministically stores zero.
- Selecting current training with zero normalizes to one rather than persisting a contradiction.
- The review summary says “previously N days/week.”

The future frequency test continues to assert the 2–6 production range. Historical 1–7 source assertions now require explicit “recently” semantics.

Verdict: **PROVEN** in source, behavior tests, and rendered web evidence.

