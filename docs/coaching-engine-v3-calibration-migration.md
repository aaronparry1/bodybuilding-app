# Coaching Engine V3 Calibration Migration

## Purpose

V3 derives exercise calibration state from completed workout history so existing users keep honest direct evidence without receiving fabricated exact loads.

## Evidence Accepted

- Completed workout history only.
- Exact canonical exercise identity only.
- Work sets only; warm-ups are ignored before summaries become calibration evidence.
- Positive load.
- Completed work-set count greater than zero.
- Completed reps greater than zero.
- Valid best-set reps.
- Valid completion date.
- Rep range, equipment signature, setup key and completion date are retained when available.

## Evidence Rejected

- Warm-up-only work.
- Incomplete or invalid summaries.
- Missing exercise identity.
- Missing or invalid completion date.
- Zero, missing or non-finite load.
- Zero completed work sets.
- Zero completed reps.
- Zero best-set reps.
- Indirect exercise history, including machine-to-free-weight, free-weight-to-machine, bilateral-to-unilateral, or same movement-family-only transfer.

## Canonical Matching

Canonical matching only collapses exact identity aliases, such as `Bench Press` and `Barbell Bench Press`.

It does not treat related exercises as equivalent. A machine chest press does not unlock exact bench loading. A custom exercise without a safe canonical match remains its own exact identity.

## Backfill States

- `unknown`: no direct evidence exists for the selected exact exercise.
- `calibrating`: direct evidence exists but is sparse or not yet stable enough.
- `confirmed`: repeated stable direct evidence supports exact loading.
- `progressing`: repeated stable direct evidence plus progression evidence supports exact loading and progression eligibility.
- `monitoring`: repeated stable direct evidence supports exact loading, but progression is not yet earned.
- `recalibration_required`: evidence exists, but context has changed or history is stale/inconsistent.

One historical exposure must not become confirmed.

## Invalidation Rules

Recalibration may be required for:

- long absence from the exact exercise
- materially different rep range
- meaningful equipment change
- setup key change
- repeated prescription failure
- stale or inconsistent direct history

One poor session does not erase useful direct history by itself.

## Cache Strategy

Calibration migration is keyed from completed session and exercise summary fields that affect direct evidence:

- session id and completed date
- exercise log id
- exercise id/name
- load, reps and completed set count
- rep range
- equipment signature
- setup key

The migration cache is bounded and stores only recent migration results. Active workout rendering should consume the generated `TrainingStateSnapshot`; it should not rescan full history on every render or set log.
