# Home current-authority compatibility cleanup

Phase 9A removes `currentBlock` and `nextBlockPreview` from the default `HomeDashboardViewModel`. Home now exposes only current planning context, exact-target summary, selected planned-session state, and approved-next-mesocycle status.

No historical report or production caller required the fields, so no compatibility adapter was retained. The former seven Home assertions covered annual-block labels, next-block previews, and block-transition/deload copy. They were replaced with current-authority checks: no-plan/incomplete states, mesocycle/microcycle/session-role context, stored exact targets, planned-session selection, and absence of the deprecated fields.

The Phase 9A focused result is 116 passing tests across Home view-model and navigation suites. The full-suite result is 15 failing files / 43 failing tests / 1,501 passing tests: exactly seven obsolete Home failures were resolved, with all other frozen failures unchanged.
