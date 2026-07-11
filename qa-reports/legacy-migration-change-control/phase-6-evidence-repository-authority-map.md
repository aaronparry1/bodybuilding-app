# Phase 6 — evidence repository authority map

Date: 2026-07-11

## Verified evidence model

The current repository stores **training evidence derived from completed workouts**, not a bibliographic or scientific-citation corpus. No active coaching rule parses scientific prose or citations. Evidence metadata is audit/provenance support; executable coaching decisions remain in their dedicated rule modules.

| File | Symbol | Type | Callers | Executable effect | Provenance/version | Classification | Phase 6 action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/domain/training/training-evidence-record.ts` | `TrainingEvidenceRecord`, `trainingEvidenceFromCompletedSession` | Evidence record and ID factory | First shippable completion loop | Produces completion/pain audit records only | Stable session-derived ID; no schema/source version | Intended current source | Add explicit schema version, source, rule IDs and immutable record semantics. |
| `src/data/local/training-evidence-repository.ts` | `trainingEvidenceRepository` | Local evidence repository | Workout logger write; future readers | Persistence only | No duplicate validation, lookup contract, or defensive copies | Intended current source, incomplete | Add deterministic list/find/multi-ID lookup, duplicate rejection, unknown result, and immutable snapshots. |
| `src/domain/training/first-shippable-coaching-loop.ts` | `runFirstShippablePostWorkoutLoop` | Current completion loop | Workout logger | Produces raw/validated evidence and records | Rule ID `13a_first_shippable_coaching_loop`; records lack it | Intended current caller | Pass explicit rule provenance into repository records; retain decision logic unchanged. |
| `src/features/workout-logging/use-workout-logger.ts` | `trainingEvidenceRepository.add` | Runtime write | Completion action | Saves loop evidence; does not read it for coaching | Session ID and timestamp supplied by loop | Intended current caller | Preserve one write path; remove archived V2/V3 comment after extraction audit. |
| `src/domain/training/coaching-evidence-engine.ts` | `evidenceFromWorkoutHistory`, `processCoachingEvidence` | Pure evidence transformer | First shippable loop uses processor; history adapter has no active caller | Produces validation/proposal metadata, not plan mutations | Raw session IDs and occurrence date; model-era reason code remains | Active current transformer with retired terminology | Rename model-era reason code to training-evidence terminology only; do not alter validation/proposal outcomes. |
| `src/domain/training/quality-of-execution-engine.ts`, `post-workout-review-flow.ts`, policy modules | Raw evidence signals/reason codes | Rule inputs | Completion loop and policy tests | Executable rules independent of repository lookup | Rule-local reason codes | Current rule authority | Keep structured logic and IDs local; do not copy record prose into rules. |
| `docs/*policy-v1.md`, `docs/living-athlete-model-v1.md` | Narrative policy documents | Documentation | None at runtime | None | Document dates/versions | Historical documentation | Retain; never import at runtime. |
| `src/features/workout-logging/use-workout-logger.ts` lines 197–396 | Retired V2/V3/living-athlete implementation comment | Historical/commented | None compiled | None | Contains generic `evidenceConfidence`, no evidence record IDs, citations, DOI, or repository writes | Deletion-gated historical material | Archive concise intent; defer deletion until the separate V2/V3 policy cleanup validates the surrounding non-evidence helper material. |
| `src/domain/training/v2-coaching-qa.ts`, V2 QA screens/reports | QA-only policy preview | QA routes/tests only | No active planned-workout construction | V2 labels only | QA fixture data | Fixture/report-only | Retain outside Phase 6; not an evidence repository source. |

## Evidence authority conclusions

1. `trainingEvidenceRepository` is the only persisted runtime evidence store. It needs a read contract, provenance/version fields, and duplicate/unknown handling.
2. Current rules contain executable logic and structured reason codes; they do not use an evidence citation map. Phase 6 must not convert records or policy prose into decision inputs.
3. `processCoachingEvidence` is active in completion processing, but it does not mutate a living-athlete model. Its remaining `living_athlete_model_update_proposed` reason label is retired terminology only.
4. There is no active user-facing bibliography/explanation surface to migrate. Repository lookup will support future narrow presentation without blocking coaching execution.
5. The retired logger comment contains no stable evidence IDs or citations. Its useful historical claim is that V2/V3 generation and living-athlete state are retired from production; preserve that in archive documentation, then delete the comment.

## Deletion gates

- Logger comment: delete after archived intent document, repository contract tests, typecheck, focused completion tests, and search confirmation. No persisted compatibility dependency is present.
- V2 QA modules: retained QA-only; outside scope and not an evidence source.
- Historical policy documents: retained as documentation only.
