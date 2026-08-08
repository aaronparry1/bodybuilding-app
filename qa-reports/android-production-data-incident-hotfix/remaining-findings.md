# Remaining findings

- Real retained-user in-place smoke has not run.
- Authenticated RLS write/cross-account probes are blocked by the unconfirmed configured test account.
- Remote tables contain no training backup yet; public users do not yet have field evidence of verified account restore.
- Supabase dashboard naming can cause production/staging confusion; rename only administratively without changing endpoint/ref.
- Enable leaked-password protection in Auth settings after change-control review.
- Play country list and usable crash/ANR telemetry were not independently captured.
- Candidate 111 artifact scan, Alpha processing and device result remain open.
