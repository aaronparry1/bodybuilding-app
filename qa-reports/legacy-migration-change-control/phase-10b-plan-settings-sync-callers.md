# Phase 10B plan, settings, storage, and sync callers

| File | Symbol | Behaviour | Classification | Phase 10B action |
| --- | --- | --- | --- | --- |
| `plan-setup.ts` | `ActiveTrainingPlan.blocks`, `activeBlockId`, `createTrainingBlock` | Persists legacy block sequence while also creating current macrocycle/mesocycle/microcycle data | Active-authority leak | Block-utility migration required; cannot safely extract as preference alone. |
| `training-year-repository.ts` | active year/current block/start block | Reads and writes legacy year state | Saved-data compatibility plus legacy control | Retain until a compatibility-only migration replaces `startBlock`. |
| `cloud-data-sync.ts` | backup/restore `trainingYear` | Preserves/restores a legacy record separately from active plan | Saved-data compatibility | Retain; current plan restores independently and wins when present. |
| `app-settings` / settings models | no direct training-year field found | Settings only | No caller | No change. |
| onboarding | `createActiveTrainingPlan` | Generates current macrocycle/mesocycle/microcycle plan | Current plan creation plus legacy persisted block shape | Requires the same deferred plan-setup block migration. |

The current active plan restores independently of the synced training-year record. But `ActiveTrainingPlan` still carries active legacy block fields and plan setup writes them. Removing that authority requires changing the persisted plan model and related block utilities, outside this prompt's explicit exclusion. No future-plan preference type is introduced because it would falsely label executable plan state as a preference.
