# Phase 4D — Analytics and reporting authority map

| Surface | File / symbol | Inputs → output | Legacy reads / writes | Classification and action |
| --- | --- | --- | --- | --- |
| Analytics screen | `app/(protected)/(tabs)/analytics.tsx` / `ProgressContent` | Repositories → current cards/reports | Reads `activePlan.blocks`; writes plan/training-year automatically on a deload action | Current-context and authority leak. Replace displayed context with a narrow current-planning view model; remove Analytics-triggered training-year mutation. |
| Current analytics context | New `analytics-planning-context.ts` | Active plan + session index → goal/macrocycle/mesocycle/microcycle/session role/status | Must not read blocks/year | Current analytics context. Reuse `resolveCurrentPlanningInput`; no plan mutation. |
| Historical summaries | `workout-history.ts` / `WorkoutHistorySummary` | Stored session → historical facts | Legacy `repRange` only for compatibility | Historical exact data. Phase 4C already preserves target arrays/source; Analytics must consume them without reconstruction. |
| Progress dashboard | `progress-dashboard.ts` / `buildProgressDashboardViewModel` | Historical summaries + active plan → trends/future actions | Reads active block for future fatigue/volume recommendations | Historical facts plus future recommendation consumer. Do not change recommendation calculation here; summary outcomes remain stored facts. |
| Advanced reports | `advanced-reporting.ts` / `buildAdvancedReports` | Sessions/history/current plan → strength/volume/recovery/consistency reports | Optional `TrainingBlock` only reaches recovery target helper | Reporting-only. Remove the screen’s raw block argument; reports consume history/current plan and cannot write to plans/sessions. |
| Strength report | `strength-dashboard.ts` | Completed sessions → e1RM/PR trend | No block/range input | Historical fact aggregation; keep. |
| QA fixtures | `application/design-qa/design-qa-fixtures.ts` | Fixture state → UI routes | Contains historical block fixture labels | QA-only; do not change in this phase unless it claims current authority. |
| Production-readiness reports | `qa-reports/*.md` | Static audit output | Historical terminology only | Reporting-only/archive. No production import found. |

## Import-direction finding

No production planning, session-construction, Train, or progression module imports Analytics, advanced-reporting, QA-report, or production-readiness output. The only reverse authority leak found is Analytics screen code applying a Progress action to the active plan/training-year. Phase 4D removes the training-year mutation and leaves action rendering as a consumer of the existing approved action flow.

## Compatibility grouping

`planMesocycleId` and `planMicrocycleNumber` are current historical identities. `planBlockId` and `planWeekNumber` remain compatibility-only grouping data when current identity is missing; neither is exposed as current Analytics context or sent to recommendation logic.
