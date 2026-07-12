# Progress journey-actions input boundary

`buildJourneyActions` now consumes `LegacyProgressJourneyActionsInput`, assembled once by `buildLegacyProgressJourneyActionsInput` at the legacy-presenter compatibility boundary.

The contract contains only the values this helper reads: strategic history sufficiency and recommendation title, existing recovery priority, and existing rotation availability. It contains no block identity, block ordering, volume input, immutable-history payload, or full `StrategicCoachingViewModel`.

This is structural only. The existing journey branch order remains: insufficient history, recovery priority, rotation recommendation, legacy advance/repeat/extend title, then the default action. Its labels, copy, ordering, and historical-fatigue behaviour are unchanged.

The adapter remains temporary. Its strategic category will be replaced by `CurrentProgressStrategicSummary`, its recovery category by `CurrentProgressRecoveryContext`, and rotation by a future current rotation boundary. `buildActionFlow` is the remaining shared helper that still receives raw legacy presenter data.
