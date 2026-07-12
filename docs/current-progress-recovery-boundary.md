# Current Progress recovery boundary

The recovery boundary separates three concepts: immutable historical fatigue warning, current performance-based fatigue evidence, and authorised current recovery action.

Historical warning is supporting-only (`fatigue_pattern_observed`). It may produce `watch`, but never recovery priority, a deload decision, volume reduction, or plan mutation. Recovery priority is true only for a persisted current `deload` decision (`recovery_recommended`) or an explicitly current deload microcycle (`recovery_active`).

Blocked, disrupted, insufficient, and compatibility states are assessment-unavailable rather than fatigue action. The boundary is pure and does not access repositories, strategic coaching, decision production, writer, application, formulas, or UI.

Dashboard integration is deliberately blocked: `verdictTitle`, `verdictMessage`, `actionTitle`, `actionMessage`, `buildActionFlow`, `buildPrimaryEvidence`, and `buildJourneyActions` still consume legacy strategic recommendation. Stage 2C2A2B must decompose those shared presentation inputs before the pure recovery state can be used by Progress.
