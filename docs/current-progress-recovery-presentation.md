# Current Progress recovery presentation

Progress builds `CurrentProgressRecoveryContext` once from the resolved current Progress context, a matching current microcycle state, and an immutable historical-fatigue warning. It then creates `CurrentProgressRecoveryPresentationInput` for action flow, primary evidence, journey actions, and copy.

Only `recovery_recommended` (persisted `deload`) and `recovery_active` (current active deload) are recovery actions. `watch`, including a historical fatigue warning, is supporting-only. `assessment_unavailable`, compatibility, and invalid states create no recovery action.

The action-flow order is unchanged. Strategic transition, rotation, and volume candidates remain legacy compatibility inputs. Legacy deload/recovery wording is removed from copy fallback unless current recovery authority is actionable. This phase creates or applies no decision and changes no fatigue/recovery formula.
