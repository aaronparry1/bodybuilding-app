# Development Track Learning Engine v1

Status: locked architecture decision.

Decision ID: 12C.

Purpose: ASC should optimise each user goal through controlled coaching experiments rather than changing many variables at once.

## Principle

Development Tracks are long-term coaching objectives created by Goal Translation.

They are not exercises. They are not programme mutations. They are coaching hypotheses about how to improve a goal-specific quality.

Examples:

- Horizontal Press Strength
- Chest Development
- Lower Body Power
- Shoulder Health

## Responsibility

The Development Track Learning Engine owns:

- creating goal-level Development Tracks from Goal Translation output
- keeping one primary learning variable per track
- enforcing the global learning budget
- pausing experiments when safety or recovery requires it
- storing coaching hypotheses separately from athlete truth
- recommending next experiments through existing engines

It does not own:

- exercise selection
- method selection
- load, reps, sets, volume, warm-up, density, or conditioning
- programme mutation
- Living Athlete Model updates
- Coaching Evidence validation

## Learning Budget

Maximum simultaneous active experiments:

- novice: 2
- intermediate: 3
- advanced: 2
- elite: 1

## Architecture Boundaries

The Athlete Model stores athlete truth.

Development Tracks store coaching hypotheses.

Experiment outcomes become coaching knowledge only after Quality of Execution and Coaching Evidence validation. Existing coaching engines consume recommendations; this engine never bypasses Intervention Decision, Coaching Decision Resolver, or the CoachingPacket boundary.

## Regression Protections

- Development Tracks are independent of exercises.
- One primary variable changes per track.
- Budget limits active experiments.
- Safety and recovery override experiments.
- No direct programme mutation.
- No direct Living Athlete Model updates.
