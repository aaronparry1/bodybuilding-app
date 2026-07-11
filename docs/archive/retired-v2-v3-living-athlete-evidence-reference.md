# Retired V2/V3/living-athlete evidence reference

The former commented logger implementation was reviewed on 2026-07-11 during Phase 6. It remains deletion-gated in the logger until the separate V2/V3 policy cleanup verifies the non-evidence helper functions around it.

It contained no `TrainingEvidenceRecord` IDs, DOI/citation records, repository writes, or active evidence lookup. Its only evidence-related values were a generic numeric `evidenceConfidence` input and a retired living-athlete-model read.

Current equivalents are deliberately narrower:

- completed workout facts and provenance are persisted through `trainingEvidenceRepository`;
- `processCoachingEvidence` validates raw workout evidence without mutating an athlete model; and
- planned-workout construction, targets, progression, and live coaching do not import this archive.

The retired comment also describes V2/V3 workout generation and shadow telemetry. Those are policy/QA concerns, not evidence-repository authority, and were not restored by this migration. Any future coaching-policy gap must be designed and tested separately; this archive is documentation only.
