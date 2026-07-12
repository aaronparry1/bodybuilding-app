# Phase 9C final deletion inventory

| Candidate | Active callers / dependency | Classification | Decision | Deletion blocker |
| --- | --- | --- | --- | --- |
| `annual-planner.ts` | `plan-setup`, recommendation actions, ad-hoc generator, settings, training-year repository, V2 QA, active tests | Active current + saved-data compatibility | Retain | Current modules still import `createTrainingBlock` and related helpers. |
| `annual-models.ts` / `training-year-repository.ts` / `use-training-year.ts` | Cloud sync and design/V2 QA | Saved-data compatibility / QA | Retain | Phase 10A removed Train/logger callers; storage and QA callers remain. |
| `block-display.ts`, `block-review-rules.ts`, strategic coaching | Recommendation/QA/tests | Active legacy policy | Retain | Production imports and test coverage remain. |
| `rep-range-strategy.ts` and range settings | Target generation, safety/calibration, ad-hoc, builder, tests | Mixed legitimate metadata | Retain | Not an executable planned-target fallback; current callers remain. |
| Commented V2/V3 logger implementation | No executable import; archive exists | Deletion-gated historical reference | Retain | The surrounding logger still contains active V2/training-year helpers and no isolated comment-only removal review has migrated their policy assertions into current tests. |
| `v2-coaching-qa.ts`, `run-v2-qa-preview.ts`, V2 QA screens/reports | QA routes, fixtures, tests | Active QA/historical | Retain | Current QA surfaces and test imports remain. |

No annual/block/range module satisfies every deletion gate. The current planned constructor remains isolated from raw `TrainingBlock`, but the broader runtime still has active legacy imports outside the completed migration boundaries. Phase 9C therefore cannot safely certify the repository complete.

Progress no longer passes the complete strategic presenter result to its copy, primary-evidence, journey-action, or action-flow helpers; category compatibility adapters and semantic replacements still prevent strategic-coaching deletion.

The Progress recovery category no longer needs legacy strategic coaching authority. Strategic, rotation, volume, Home, QA, and compatibility callers still block shared-module deletion.
