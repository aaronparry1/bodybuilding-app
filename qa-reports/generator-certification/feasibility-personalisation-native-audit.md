# Feasibility, personalisation and native premium audit

Date: 2026-08-23

## Reproduced baseline

- Starting repository: `0e346cc4fbb291e29c681f52d2b4afeb0e130ef1`, branch `main`.
- Pre-existing modified tests and unrelated untracked files were left untouched.
- Clean materialised runtime: `/tmp/asc-runtime-materialized-1787502036`.
- Baseline certification: 21 constructed, 9 failed closed, 0 critical violations.
- Exact failures: personas 02 and 17 failed exact 45/30-minute construction; 26 failed unauthorised specialist selection; 30 failed exercise selection; 09 and 19 failed dosage/available-time constraints; 25, 28 and 29 requested unsupported frameworks.
- Current certification: 25 constructed, 5 failed closed, 0 critical violations. The duration contradictions and avoidable restricted-equipment failures are recovered. The remaining five are explicit constraint failures, not malformed prescriptions.

## Source boundary

`project_sources/` contained no directory entries. The directory had only `com.apple.macl` and `com.apple.provenance` extended attributes. `brctl download project_sources` produced no materialised files. Scoped Spotlight searches inside the project and relevant iCloud/File Provider location for Zatsiorsky, Verkhoshansky, Managing the Training of Weightlifters, Wendler, Tier System, Development of the Russian Conjugate System, Poliquin and Westside for Athletes returned no files. Git history and unreachable trees contained no `project_sources/` PDF blobs. No PDF was recreated, replaced or represented as inspected.

The comparable source-test boundary is production source, discovered Vitest tests and the generated certification artifacts owned by the current generator. Historical screenshots, omitted native projects and other old QA artifacts are evidence only; their absence from a clean materialisation is not a production failure.

## Implemented decisions

- Allocation and exact construction now share lift-specific rest and calibration assumptions.
- Specialist exercises fail selection before construction unless the slot explicitly owns compatible primary strength exposure.
- Dumbbell/bodyweight/band profiles use restricted-equipment contracts and factual hinge metadata.
- Optional training emphasis is now collected. It moves one existing set toward the selected area and one away from a non-priority accessory, preserving weekly total volume. It is persisted and explained through reconstruction and block transition.
- Initial self-report controls conservative starting dosage only. Missing app history does not penalise a new user. Completed history remains authoritative for load evidence, comparable-exposure progression, replanning and phase transition; no additional adherence penalty was introduced without a stable planned-versus-performed history window.
- Premium visual QA is a non-production entitlement projection. It never writes the subscription cache, forces the mock gateway, disables billing actions, is impossible in production and displays permanent QA chrome.

## Native audit

The iPhone 17 Pro simulator on iOS 26.5 mounted the staging development client from the clean runtime. The first native frame exposed a disabled-primary-button contrast defect and showed that the initial QA flag path still allowed RevenueCat initialisation. Both shared boundaries were corrected and automatically covered. A later clean Metro remount was attempted after the entitlement module was added; the initial cache retained the earlier missing-module resolution and required a full cache rebuild. Do not treat incomplete post-rebuild journey captures as a full native pass.

The complete premium journey still requires retained post-rebuild captures for onboarding, Home, Plan, active workout, set entry, rest timer, substitution, completion and Progress, plus large Dynamic Type and narrow-device passes. No live purchase, restore or customer-centre action was invoked.

## Verification

- Focused duration, restricted-equipment, priority, billing and contrast tests pass.
- TypeScript passes from the clean materialised runtime.
- Generator certification is deterministic at 25/5/0.
- Full-suite output includes historical-artifact omissions in the temporary runtime and the four protected pre-existing test edits. A genuine supported two-day beginner strength regression discovered in that run was fixed by making the Romanian deadlift factually beginner-compatible; the exhaustive onboarding construction case then passed.
