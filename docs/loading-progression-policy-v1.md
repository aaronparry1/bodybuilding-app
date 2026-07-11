# Loading & Progression Policy v1

Status: Architecture locked, isolated domain module.

The Loading & Progression Policy sits downstream of Method Selection. Once a method is selected, this policy turns that method into practical loading, reps, sets, effort caps, backoff loads, progression targets, and next-session rules.

It does not replace Adaptation Detection, Intervention Decision, Method Selection, PR recognition, workout generation, or the existing production progression engine.

## Core Principle

ASC uses fluctuating overload, not endless linear overload. Progression is earned from objective performance, completion quality, fatigue/recovery evidence, and method-specific targets.

The policy should hold when evidence is mixed, reduce when performance drops with poor recovery or repeated failures, and avoid aggressive jumps after one good session.

## Required Inputs

The policy accepts the selected method, exercise context, training state, training max or estimated ability, recent performance trends, completion quality, failed set history, fatigue/recovery status, pain/issue flags, experience level, equipment/load increments, and prior intervention history.

Training max is preferred. If only estimated ability or e1RM is available, the policy discounts it before prescribing work. It does not prescribe from a true max.

## Method Models

- `straight_sets`: progress reps within the target range first, then load.
- `top_set_backoffs`: top set updates estimated ability; backoffs use a percentage reduction.
- `heavy_single_backoffs`: controlled training single, not a true max; backoffs provide volume.
- `heavy_triple_backoffs`: controlled heavy triple; backoffs provide volume.
- `heavy_five_backoffs`: controlled heavy five; backoffs provide volume.
- `five_three_one`: conservative training max and scheduled increases only after ownership.
- `last_set_amrap`: capped AMRAP only; result guides future load cautiously.
- `boring_but_big`: volume completion before load increases.
- `eight_across`: all sets at target reps before load increase.
- `ladder`: total completed rungs or reps before load increase.
- `pyramid`: top set quality/load progresses cautiously while volume stays clean.
- `wave_loading`: wave completion and quality before load increases.
- `cluster_sets`: density or load progresses cautiously; monitor neural fatigue.
- `density_sets`: work completed in the time/rest window before load increases.

## Guardrails

- No automatic weight increase from workout completion alone.
- No aggressive jump from one good session.
- One bad session is noise unless paired with fatigue, pain, or repeated failure.
- Mixed evidence holds.
- Poor recovery plus poor performance reduces stress.
- Normal recovery plus poor performance routes toward stimulus review rather than blind deloading.
- AMRAPs and high-effort sets are capped.
- Minimum load increments are respected.
- Exercise type, skill level, safety, and training state remain constraints.

## Future Integration

Future workout builders can consume this output to build session prescriptions, but should not bypass the policy by applying simple completed-workout progression. User-facing PR recognition remains a separate future decision.
