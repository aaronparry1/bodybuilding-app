# RLS and account isolation verification

Structural verification passed: explicit authenticated policies, owner `USING` and `WITH CHECK`, nested parent-owner checks, client read-only subscription status, and least-privilege grants. Publishable-key probes confirmed anonymous denial on every user table and public read access only for exercises.

Authenticated probe status: blocked because the configured test account is not email-confirmed. No new account was created. Cross-account and owner mutation tests therefore require Candidate 111 on an authenticated device or a separately authorised confirmed test account. This is not reported as a pass.
