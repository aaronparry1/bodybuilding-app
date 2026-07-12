# Journey actions extraction map

## Boundary

`buildJourneyActions` previously accepted `StrategicCoachingViewModel`, `hasRecoveryPriority`, and `hasRotationRecommendation`. It now accepts `LegacyProgressJourneyActionsInput`, constructed once by `buildLegacyProgressJourneyActionsInput` in `progress-dashboard.ts`.

| Branch order | Field read | Category | Compatibility source | Contract field |
| --- | --- | --- | --- | --- |
| 1 | `hasEnoughHistory` | legacy strategic/history gate | `StrategicCoachingViewModel.hasEnoughHistory` | `strategic.hasEnoughHistory` |
| 2 | `hasRecoveryPriority` | legacy recovery presentation | existing dashboard calculation | `recovery.priority` |
| 3 | `hasRotationRecommendation` | legacy rotation presentation | existing dashboard calculation | `rotation.hasRecommendation` |
| 4 | recommendation title text | legacy strategic presentation | `StrategicCoachingViewModel.recommendation.title` | `strategic.recommendationTitle` |
| 5 | none | default | none | none |

The executable order remains: insufficient history → recovery → rotation → recommendation title containing advance/repeat/extend → default. The helper has no volume field, historical evidence payload, deduplication loop, or maximum-action collection; its fixed primary/optional-secondary result is unchanged.

## Equivalence and rollback

Focused coverage preserves insufficient-history, recovery, rotation, strategic-title, and missing-title extraction states. Existing Progress dashboard characterization continues to cover journey copy and priority outcomes. Rollback is limited to `legacy-progress-journey-actions.ts`, the `buildJourneyActions` call path, and its focused test.

## Replacement gates

This adapter is compatibility-only. Replace strategic fields with `CurrentProgressStrategicSummary`, recovery with `CurrentProgressRecoveryContext`, and rotation with its future current boundary. No volume or immutable-history category is introduced because this helper does not consume either. `buildActionFlow` remains the next raw legacy presenter consumer.
