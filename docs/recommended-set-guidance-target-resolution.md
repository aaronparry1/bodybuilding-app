# Recommended set guidance target resolution

E2E1 provides a read-only command/resolver seam for a later set-guidance application service. Its command names the adjustment, active plan and semantic future-guidance target; the resolver receives narrow read interfaces and returns explicit target/reference facts for E2C and E2D.

It intentionally leaves timing unresolved, returns no normalized range, and writes no plan, workout, record or exact target. Production range branches remain legacy until E2E2 supplies repository adapters and E2E3 supplies the idempotent application boundary.
