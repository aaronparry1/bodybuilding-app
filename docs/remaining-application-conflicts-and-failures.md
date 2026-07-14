# Remaining application conflicts and failures audit

Commit audited: `b9b513d` (`fix: remove unsupported preview update channel`). The authoritative run was `npm test -- --run --reporter=json --outputFile=/tmp/d4e3-audit-full.json` before this audit. It reports **43 failed tests and 1,790 passed tests across 14 failing files**. Earlier migration artifacts describe 15 failing files; that historical count is preserved, but this report does not infer the current file count from it.

The complete one-row-per-test matrix is in [phase-d4e3-failure-matrix.json](../qa-reports/legacy-migration-change-control/phase-d4e3-failure-matrix.json); the machine-readable inventory is [phase-d4e3-remaining-work-inventory.json](../qa-reports/legacy-migration-change-control/phase-d4e3-remaining-work-inventory.json). No failure was edited, hidden, or converted into a passing expectation.

## Category summary

- Incomplete planning-context migration: 15 failures, concentrated in `planned-workout` and end-to-end dashboard naming/slot mapping.
- Stale test asserting intentionally removed behaviour: 9 failures in product positioning, product-flow source guards, programme skeleton, and paywall source assertions.
- Environment/tooling/configuration failure: 4 failures because `src/domain/training/support-function-policy.ts` is absent while architecture tests still read it.
- Fixture/evidence artifact drift: 3 failures (design QA and recommendation action assertion shape).
- Legacy block/rep-range authority conflict: 2 failures (event taper and recovery capacity semantics).
- UI/view-model mismatch: 1 failure (Recovery Window view model returns null).
- Uncertain semantic investigation: 2 failures (load selection and previous-exercise history).
- Remaining rows are intentionally retained individually in the matrix; no row is treated as a duplicate merely because it shares a module.

## Highest-risk contradictions

The active plan now supplies named planning context such as `Push hypertrophy`, `Upper hypertrophy`, and `Full body 1`, while several tests and user-facing view-model contracts still expect legacy labels (`Push`, `Upper`, `Full Body`, body-part names). This is the primary dependency because it cascades into Home, Train, Plan, design QA, and simulator checks. Separately, source-shape tests still assert repository calls that the current onboarding architecture no longer performs. Numeric history/load failures may be genuine authority conflicts and must not be “fixed” by snapshot updates.

## Dependency-ordered plan

1. **D4E3-AUDIT-1 — reconcile planning-context authority.** Decide the canonical active-plan/session naming contract, map legacy saved-plan labels at the compatibility boundary, and align generated workout/view-model projections. Lock Home, Plan, Train, session creation, and body-part/annual-planning fixtures. This is the single best next implementation task.
2. **D4E3-AUDIT-2 — reconcile stale product/UI architecture assertions.** After the product contract is explicit, update only tests whose assertions target intentionally removed labels, roadmap components, persistence call sites, or paywall source shape. Keep runtime behavior unchanged unless the contract decision identifies a real regression.
3. **D4E3-AUDIT-3 — investigate numeric authority conflicts.** Use independent fixtures to determine whether extra-session history, previous-session exclusion, and recovery context are production regressions or stale expectations. No expected-value edits without an authority decision.
4. **D4E3-AUDIT-4 — resolve the missing support-function-policy contract.** Either restore the real production module through an approved architecture change or retire/repoint the four guards; do not create a test-only stub.
5. **D4E3-AUDIT-5 — rerun the full suite and require zero unexplained failures.** Only then resume internal build/shadow-observation planning. Runtime authority remains `production_only` throughout.

## D4E3-AUDIT-1 result

The active session-role path now projects stable generated-workout labels without changing prescription generation. Of the 21 scoped failures, 14 are fixed and 7 are explicitly reclassified: one end-to-end dashboard expectation and six body-part fixtures assert legacy split labels that conflict with complete current microcycle roles. The post-change run is 28 failed tests, 1,806 passed tests across 14 failing files. The exact dispositions are in [phase-d4e3-audit1-planning-context-dispositions.json](../qa-reports/legacy-migration-change-control/phase-d4e3-audit1-planning-context-dispositions.json).

Dependency graph: `AUDIT-1 → AUDIT-2`; `AUDIT-1 → AUDIT-3`; `AUDIT-4` is independent but must complete before architecture certification; `AUDIT-1..4 → AUDIT-5 → build review → production shadow review → any v2 canary`.

## Scope and safety

No production code, selectors, rep/lane authority, v2 routing, D4D2 behavior, persistence, fallback, guidance, UI telemetry, EAS credentials, or build configuration was changed. No build or external deployment occurred. Approved untracked paths and quarantine remain untouched. The acceptance gate for resuming deployment work is an exact rerun with no unexplained failure IDs, with cascade relationships documented rather than counted away.
