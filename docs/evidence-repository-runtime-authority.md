# Evidence repository runtime authority

## Canonical repository

`trainingEvidenceRepository` is the single persisted runtime source for `TrainingEvidenceRecord` values. It stores evidence derived from completed workouts; it is not a scientific-citation or coaching-policy engine.

The repository provides deterministic `list`, `findById`, and multi-ID `resolve` access. Duplicate IDs are rejected without overwriting the existing record. Unknown IDs are returned explicitly in `missingIds`; no unrelated record is substituted. Returned records are defensive copies, so callers cannot mutate canonical stored evidence.

## Provenance and versions

Every newly created record includes:

- stable session-derived evidence ID;
- schema version (`1`);
- source (`completed_workout_loop`); and
- originating rule ID (`13a_first_shippable_coaching_loop`).

Older stored records without these fields are normalized as completed-workout-loop compatibility records when read. Historical workout and plan records are not rewritten.

## Rules, explanations, and decisions

Coaching rules remain independently executable. Their structured logic and reason codes decide behaviour; repository records provide audit provenance only. Missing evidence metadata does not block workout construction, Train execution, progression, or live coaching.

There is no active user-facing evidence/citation explanation surface in this checkout. Any future surface must resolve a narrow presentation model from the repository and must not parse prose into coaching logic.

## Retired material

The coaching-evidence engine no longer emits the retired `living_athlete_model_update_proposed` reason code. It now records `training_evidence_proposal_created`; this renames audit metadata only and does not alter validation or proposal outcomes.

The large V2/V3/living-athlete logger comment contains no stable evidence IDs, citations, or repository writes. Its extracted reference is in [retired-v2-v3-living-athlete-evidence-reference.md](archive/retired-v2-v3-living-athlete-evidence-reference.md). The comment is deletion-gated for a separate V2/V3 policy cleanup because it also contains unrelated historical generation behaviour.

## Deferred work

Evidence ingestion administration, scientific citation records, user-facing explanation design, exercise-intervention integration, and final V2/V3/comment deletion are separate work. No current runtime rule imports archived documentation, QA reports, or the V2/V3 comment.
