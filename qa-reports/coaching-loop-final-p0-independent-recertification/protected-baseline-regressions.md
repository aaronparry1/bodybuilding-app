# Protected baseline regressions

Verdict: **PROVEN**.

Verification retained:

- onboarding atomicity;
- durable completion and completed-work reconciliation;
- workout persistence and Discard-related lifecycle;
- canonical exercise/session identity;
- method policy;
- antagonist-superset and rest-pause production reachability;
- unsupported-method fail-closed behaviour;
- Home/Plan/Train identity;
- boundary, restart, CAS and receipt truth.

Final executable results:

- independent artifact/boundary consistency: 2 tests passed;
- full automated suite: 373 files and 2,248 tests passed, 0 failed;
- TypeScript: passed;
- production Expo public config: passed and retained app version `1.0.14`,
  iOS build `45` and bundle ID
  `com.aaronparry.adaptivestrengthcoach`;
- production web export: passed, 1,413 modules bundled;
- production payload scan: passed, 27 files scanned and 0 findings.

The first parallel-worker full-suite attempt completed test bodies without an
assertion failure but did not terminate while macOS FileProvider/Spotlight was
indexing the Documents volume. It is not counted. The suite was rerun with one
worker and exited successfully with the totals above. TypeScript and Expo also
exited successfully despite the same temporary storage contention.

No production identity, release metadata, numeric progression, athlete-fact
writer, method policy, successor policy, build, upload or deployment changed.
