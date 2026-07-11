# Frozen baseline failures

Source command: `npm test` on 2026-07-11.  
Baseline: **16 failing files / 50 failing tests; 117 passing files / 1,473 passing tests**.

| Test file | Failures | Category | Migration relevance | Phase treatment |
| --- | ---: | --- | --- | --- |
| `tests/planned-workout.test.ts` | 20 | legacy planned-workout/block expectations | Direct | Blocks Phase 3 session-selection changes until replaced by current-plan tests. |
| `tests/home-dashboard-view-model.test.ts` | 7 → 0 (Phase 9A) | obsolete current/next-block Home assertions | Direct | Replaced with current-authority coverage; suite now passes. |
| `tests/product-flow-architecture.test.ts` | 4 | old annual setup, block dashboard and Plan roadmap assertions | Direct | Update only alongside affected current journey. |
| `tests/master-architecture.test.ts` | 4 | architecture inventory expects deleted/legacy modules | Potential | Must be repaired in Phase 1 before module deletion work. |
| `tests/product-positioning.test.ts` | 4 | obsolete onboarding goals/annual copy | Potential | Separate product-copy migration; do not modify during constructor work. |
| `tests/design-qa-fixtures.test.ts` | 2 | legacy block transition/event fixture state | Direct | Fixture-only; migrate in Phase 8. |
| `tests/paywall-trial-flow.test.ts` | 1 | Home start gating expectation | Potential | Do not touch unless logger/Home work causes a regression. |
| `tests/recovery-capacity.test.ts` | 1 | next lifting context expectation | Potential | Re-run after session-selection change. |
| `tests/end-to-end-simulator-qa.test.ts` | 1 | annual/dashboard simulator assertion | Direct | Keep as baseline until fixture/reports phase. |
| `tests/progress-dashboard.test.ts` | 1 | deload changes legacy generated prescription | Direct | Do not repair by restoring block-based construction. |
| `tests/programme-skeleton.test.ts` | 1 | onboarding skeleton persistence expectation | Direct | Quarantine during builder/onboarding compatibility phase. |
| `tests/load-selection.test.ts` | 1 | extra-session history exclusion | Potential | Relevant to target/evidence phase; must not worsen. |
| `tests/workout-history.test.ts` | 1 | prior performance ordering expectation | Potential | Relevant to evidence/load phase; must not worsen. |
| `tests/event-taper.test.ts` | 1 | annual runway duration assertion | Direct | Legacy event planning migration. |
| `tests/recommendation-actions.test.ts` | 1 | replacement to future legacy programme | Direct | Interventions/recommendation compatibility; retain until replacement exists. |
| `qa-reports/v3-shadow-telemetry-review.test.ts` | test-file failure | QA artifact treated as test | Environment/configuration/unknown | Exclude from feature acceptance unless its runner inclusion is intentionally addressed. |

Acceptance rule for every phase: no new failing file, no new failure in a previously passing relevant suite, no worsened frozen failure, and all newly added focused tests pass.

Phase 9A removed seven obsolete Home view-model assertions from the frozen baseline. They asserted annual/block labels and next-block previews that no longer belong to the current Home contract; replacement current-authority coverage lives in `tests/home-dashboard-view-model.test.ts`. Final Phase 9A comparison: **15 failing files / 43 failing tests / 1,501 passing tests**; no other frozen failure changed.
