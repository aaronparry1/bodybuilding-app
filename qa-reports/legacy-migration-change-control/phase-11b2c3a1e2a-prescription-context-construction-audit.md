# Prescription-context normalization and construction audit

## Domains

`recommendedMinSets`/`recommendedMaxSets` are a **recommended set-count guidance range**, persisted in `ProgressionSettings`; they are not `repRange` and not `prescribedSetTargets`. `repRange` is reps-per-set guidance. `prescribedSetTargets` is executable per-set authority on planned workout logs.

## Normalization

`shiftRecommendedSetRange(settings, delta, context)` calls `resolveSetPrescription`, shifts both recommended endpoints, clamps counts to 1–10, caps positive shifts at hard/soft cap and lower shifts at 10, lowers `requiredSets` only on reduction, then calls `withSetPrescription`. Context affects productive-set defaults through block/exercise fields; this is legacy policy/compatibility, not a current-domain mapping.

## Writers/readers and construction chain

`raise_range`/`lower_range` mutate programme slot `settings` in `applyAdjustmentToSlots`. Future construction reads settings and generates exact targets in `recovery-workout-constructor` via `exactTargets({ sets: settings.requiredWorkSets, repMin, repMax })`; Train and review use stored `prescribedSetTargets` first. Open/completed planned logs retain their own stored targets, so no direct rewrite path was found in this audit. Post-workout review, progression, history, and Progress use stored targets by ordinal.

## Scope and safety

The only candidate future E2 scope is future programme/template guidance. Open planned and completed planned scopes must be explicitly blocked; no range shift may fabricate or overwrite exact targets. Non-planned/ad-hoc generation consumes settings as guidance but does not create planned identity.

## Recommended E2 sequence

E2B pure range normalization; E2C explicit scope guard; E2D open/completed target guard; E2E future-guidance-only routing; E2F builder/non-planned analysis; E2G compatibility hydration; E2H certification. Product decisions remain: mid-microcycle guidance changes, width policy, and compatibility plans without exact targets.
