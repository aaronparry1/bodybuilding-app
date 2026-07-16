# Remediation plan

1. Capture development spans around swap, set logging, navigation, ledger persistence, and history projection using the bounded utility.
2. Add synthetic 0/100/500/2,000/10,000-session fixtures and assert interaction request counts do not scale with total history.
3. Measure React commits/listeners across 100 mount/unmount and swap cycles.
4. Design a paginated/summary Supabase history read with query-plan evidence; create a migration only after schema/RLS review.
5. Bound local ledger/history projection reads and define retention/index ownership without changing canonical semantics.
6. Re-test delayed billing/auth so UI feedback precedes nonessential network work.

No production fix or database migration was implemented in this forensic phase because runtime measurements are still missing.
