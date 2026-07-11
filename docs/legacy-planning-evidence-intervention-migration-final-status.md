# Legacy planning, evidence, and intervention migration status

## Authoritative architecture

Current planned construction uses current macrocycle/mesocycle/microcycle/session-role input. Planned execution uses stored exact targets; review, Progress, and Analytics consume stored facts. Non-planned sessions are explicitly separate, Builder output is draft/custom-only, and completed-workout evidence uses the canonical evidence repository.

## Intervention failure handling

Candidate resolution now distinguishes `candidates`, `blocked_by_intervention`, and `no_eligible_candidate`. The current nullable constructor preserves its public API and returns `null` for either non-success state; the typed resolver is the immediate boundary that distinguishes them. This is intentional temporary type debt until a future constructor-result API migration.

## Compatibility retained

`TrainingBlock`, training-year utilities, range metadata, legacy plan fields, V2/V3 QA material, and the large logger comment remain only in compatibility, historical, QA, builder-guidance, or non-planned paths. They are deletion-gated because callers/tests still exist. They must not drive current planned construction.

## Verification

Migration-focused tests, typecheck, Expo public config, and web export pass. The final full-suite result is 16 failing files / 50 failing tests / 1,499 passing tests: one additional passing test is the intervention-result characterization added in Phase 8. The remaining failures are the frozen baseline, including the seven legacy Home assertions, workout-history prior-load expectation, and progress-dashboard recovery-window null access, as recorded in `baseline-failures.md`.

## Residual risks

Home compatibility fields and legacy annual utilities still require a dedicated compatibility-test/deletion phase. The constructor’s public `null` result remains ambiguous to external callers, although the intervention-aware resolver is explicit. No expiry, medical, or scope semantics were invented for interventions.
