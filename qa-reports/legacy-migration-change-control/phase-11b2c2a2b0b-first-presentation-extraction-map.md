# First Progress presentation extraction: copy helpers

Family: `verdictTitle`, `verdictMessage`, `actionTitle`, and `actionMessage`.

Raw input: `StrategicCoachingViewModel`. Typed compatibility input: `LegacyProgressCopyPresentationInput`, extracted once by `buildLegacyProgressCopyPresentationInput`.

The adapter preserves history sufficiency, empty message, recommendation title/message/reasons, and momentum band exactly. Recovery priority remains a separate existing boolean. Output-equivalence scenarios: insufficient history, recovery priority, advance, momentum, recommendation fallback, and exercise fallback. Rollback boundary: the new adapter and four helper call sites only.

Deferred: evidence, journey, action-flow, recovery/rotation/volume replacement, and presenter removal.
