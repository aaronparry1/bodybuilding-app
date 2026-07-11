# Phase 10C ActiveTrainingPlan authority map

| Area | Current read/write | Authority / risk | Required replacement |
| --- | --- | --- | --- |
| `plan-setup.ts` | Creates `blocks` and `activeBlockId`; block transitions update both | Persisted executable authority | Replace plan model and transition utilities together. |
| active-plan repository | Serialises/deserialises the complete plan directly | Current persistence | Add versioned current/legacy record normalisation. |
| Train/logger | Reads active block for active execution and fallback settings | Active runtime authority | Migrate Train/logger block-dependent paths. |
| training-session selection | Reads block ID/week for legacy matching | Current selector plus compatibility | Separate current identity from legacy-session adapter. |
| Progress/volume/recommendation | Reads active block and mutates block transitions | Active recommendation authority | Deferred recommendation/block-strategy migration. |
| design QA/tests | Creates and asserts block-based active plans | Fixture/QA plus compile dependency | Deferred V2/QA fixture migration. |
| sync | Stores active plan separately and restores it independently of training-year data | Persistence boundary | Add current/legacy record discriminator with the model migration. |

`ActiveTrainingPlan.blocks` and `activeBlockId` cannot be removed safely within this phase alone: all direct readers must migrate to current mesocycle/microcycle selectors in the same atomic model change. The prompt excludes several required dependent migrations, so no production model edit is safe.
