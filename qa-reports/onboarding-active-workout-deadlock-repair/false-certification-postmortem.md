# False-certification postmortem

## Why 45 tests passed

The Build 47 test suite and source-shape checks exercised `app/(protected)/_layout.tsx`. Production uses `app-production/(protected)/_layout.tsx`, which delegates to a different protected layout. The repaired development entrypoint was therefore certified while the mounted production entrypoint retained the stale direct flag check.

## Why rendered web passed

The prior rendered report explicitly recorded the existing-user journey as only **PARTIALLY PROVEN** because it used the offline/local development path, not authenticated production restoration. It did not exercise `transform.routerRoot=app-production` with a retained active workout and stale onboarding metadata.

## Missing evidence

- no assertion proved the production Router root imported the repaired hydration/reconciliation authority;
- no retained-update fixture included an active workout, stale metadata, and production startup together;
- source checks treated the development protected layout as representative of production;
- the final Create Programme guard and startup router were not required to call the same classifier;
- the earlier conclusion overreached its own rendered limitation.

## Prevention

Regression coverage now:

- inspects the mounted production shell;
- requires production subscription hydration and canonical reconciliation;
- requires startup and Create Programme to share `resolveCanonicalExistingUserRoute`;
- constructs retained state through canonical production applications;
- verifies direct `/onboarding` navigation resolves to Train with a paused workout;
- preserves genuine-device status as NOT PROVEN until a replacement binary is installed.
