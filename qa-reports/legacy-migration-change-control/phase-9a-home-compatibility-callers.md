# Phase 9A Home compatibility callers

| File | Symbol / assertion | Classification | Needs legacy block label? | Action |
| --- | --- | --- | --- | --- |
| `src/domain/training/home-dashboard.ts` | `HomeDashboardViewModel.currentBlock` | Default current Home contract | No | Remove. Current planning context is already authoritative. |
| `src/domain/training/home-dashboard.ts` | `HomeDashboardViewModel.nextBlockPreview` | Default current Home contract | No | Remove. Approved-next-mesocycle status remains separately available. |
| `tests/home-dashboard-view-model.test.ts` | Seven legacy block/next-block assertions | Obsolete tests | No | Replace with current-context and selection assertions already exercised by this suite. |
| `tests/product-flow-architecture.test.ts` | Dashboard block-preview assertions | Obsolete architecture fixture | No | Assert planning-context readiness instead. |
| `tests/end-to-end-simulator-qa.test.ts` | Dashboard week-label fixture | Compatibility fixture | No | Assert microcycle label instead. |
| `tests/workout-navigation-ui.test.ts` | Source-level absence assertions | Current architecture test | No | Retain; it already proves Home UI does not render the deprecated fields. |

No active Home UI, report, or persisted-data caller requires a legacy block label. No compatibility adapter is required.

## Known seven failures

The failures asserted current/next annual-block labels, scheduled block previews, and block-transition/deload labels. They are obsolete because the default Home contract now derives current context from mesocycle/microcycle/session-role state and exposes approved transition status separately. Replacement coverage asserts: current authority wins over conflicting blocks; Home works without a `TrainingBlock`; exact targets come from the open planned workout; and extra sessions cannot replace the planned selection.
