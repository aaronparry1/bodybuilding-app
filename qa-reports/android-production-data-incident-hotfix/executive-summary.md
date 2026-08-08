# P0 Android data incident — executive summary

Production remains 1.0.18 (109), fully rolled out. Evidence does not prove physical deletion: historical loads still influence recommendations, while the live remote backup tables contained zero training rows. The working diagnosis is retained local data hidden or orphaned by startup/persistence-authority regressions.

Candidate 110 contains the retained-data, startup, ownership, diagnostics, split and exercise-management repair, but audit found that it could acknowledge a backup while canonical queue items were skipped. It was therefore not promoted. Candidate 111 adds verified remote readback and refuses to acknowledge incomplete backup.

The shipped Supabase authority was restored, migrated and hardened. All 11 required tables exist with RLS; anonymous access is denied except public exercise reads. A genuine authenticated/device probe and in-place upgrade smoke remain mandatory before any Play production promotion.
