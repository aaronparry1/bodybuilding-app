# Legacy planning, evidence, and intervention migration status

## Authoritative architecture

Current planned construction uses current macrocycle/mesocycle/microcycle/session-role input. Planned execution uses stored exact targets; review, Progress, and Analytics consume stored facts. Non-planned sessions are explicitly separate, Builder output is draft/custom-only, and completed-workout evidence uses the canonical evidence repository.

## Intervention failure handling

Candidate resolution now distinguishes `candidates`, `blocked_by_intervention`, and `no_eligible_candidate`. The current nullable constructor preserves its public API and returns `null` for either non-success state; the typed resolver is the immediate boundary that distinguishes them. This is intentional temporary type debt until a future constructor-result API migration.

## Compatibility retained

`TrainingBlock`, training-year utilities, range metadata, legacy plan fields, V2/V3 QA material, and the large logger comment remain only in compatibility, historical, QA, builder-guidance, or non-planned paths. They are deletion-gated because callers/tests still exist. They must not drive current planned construction.

## Verification

Migration-focused tests, typecheck, Expo public config, and web export pass. After Phase 9A, the full-suite result is 15 failing files / 43 failing tests / 1,501 passing tests: the seven obsolete legacy Home assertions are resolved. The remaining failures include the workout-history prior-load expectation and progress-dashboard recovery-window null access, as recorded in `baseline-failures.md`.

## Residual risks

Phase 10A removed the current Train/logger training-year dependency. Ad-hoc, recommendation, settings, sync, and QA paths still retain annual/block utilities or compatibility storage. Phase 9A removed Home's deprecated compatibility fields and Phase 9B replaced the public planned-session constructor's ambiguous nullable result with explicit outcomes. No expiry, medical, or scope semantics were invented for interventions.

## Phase 11A.2C2 status

Exposure, successor validation, and objective-status boundaries are current-only and pure. Stage 2 consumer migration remains blocked on C3 canonical readiness production and authoritative decision-writer integration.

## D2.5D0 programme-policy status

The certified intermediate four-day Upper/Lower policy is not generic hypertrophy authority. It is a candidate `hypertrophy_base` policy only after a field-level equivalence certification. New build-muscle plans start in `hypertrophy_calibration`, which remains compatibility-only until a dedicated conservative policy and certification exist; no active-plan programme specification is persisted yet.
