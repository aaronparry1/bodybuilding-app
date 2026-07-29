# Protected regressions

## Required scenario coverage

The 32 requested cases are covered by the Build 47 suite plus existing protected suites:

1. older completed user update — preserved carrier test;
2. old onboarding schema — metadata backfill test;
3. missing completion flag — valid plan precedence test;
4. delayed plan/account hydration — startup hydration test;
5. delayed profile/auth — authentication loading test;
6. persistence read error — recovery test;
7. completed history — serialized history preservation tests;
8. active workout — resumable ledger test;
9. completed onboarding/no plan — setup-required test;
10. genuinely new user — onboarding-required test;
11. signed-out user — auth redirect source test;
12. account switch — owner mismatch and cloud-block tests;
13. restart after migration — cache reset test;
14. duplicate startup — repeated reconciliation test;
15. migration interruption — owner/settings rollback and retry tests;
16. schedule/history semantics — conditional-source test;
17. currently training — historical frequency normalization;
18. short break — derived-zero normalization;
19. long absence — derived-zero normalization;
20. schedules 2–6 — training-frequency and construction suites;
21. required validation — onboarding final/product-flow tests;
22. single tap — atomic commit test;
23. rapid taps — submission-gate test;
24. generation failure — rejected canonical construction leaves state unchanged;
25. persistence failure — owner/settings rollback test;
26. navigation failure — committed Open Programme recovery source boundary;
27. restart during creation — retry gate and no partial settings;
28. restart after commit — reconciliation/idempotency tests;
29. completed onboarding does not reopen — plan precedence test;
30. Home/Plan/Train consistency — canonical projection suites;
31. exactly one programme — duplicate fingerprint/idempotency test;
32. no prescription change — byte-identical valid carrier and canonical architecture suites.

## Verification results

- Focused startup/onboarding/projection suites: passed.
- Full automated suite: 382 files, 2,334 tests passed.
- Build 45/47 Discard, immutable history, active-workout recovery: passed in full suite.
- P0 coaching loop and P1A production path: passed.
- Mounted coaching authorities: 1.
- Competing coaching authorities: 0.
- UI adaptation authorities: 0.
- TypeScript: passed.
- Production Expo config: passed.
- Web export and payload isolation: passed; zero payload findings.

No expected outcome was weakened to hide a production failure. Two stale source-shape assertions were updated to recognize the explicit historical-frequency wording while preserving the future 2–6 schedule contract.
