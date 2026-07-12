# Current Progress recovery boundary

The recovery boundary separates three concepts: immutable historical fatigue warning, current performance-based fatigue evidence, and authorised current recovery action.

Historical warning is supporting-only (`fatigue_pattern_observed`). It may produce `watch`, but never recovery priority, a deload decision, volume reduction, or plan mutation. Recovery priority is true only for a persisted current `deload` decision (`recovery_recommended`) or an explicitly current deload microcycle (`recovery_active`).

Blocked, disrupted, insufficient, and compatibility states are assessment-unavailable rather than fatigue action. The boundary is pure and does not access repositories, strategic coaching, decision production, writer, application, formulas, or UI.

All shared presentation helpers now have typed legacy input boundaries. `buildActionFlow` still preserves the legacy recovery candidate unchanged; the next phase can replace that candidate with the pure recovery context without changing rotation or volume inputs.

The recovery semantic replacement is complete: action flow, primary evidence, journey actions, and recovery copy now use `CurrentProgressRecoveryContext`. Historical fatigue is a supporting warning only; it cannot reinstate the former legacy recovery action.
