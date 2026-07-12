# Guidance application service map

The injected service loads a current ready record, rechecks created-workout exclusion, reads the exact stable target/version, delegates normalization to E2B, writes target then applied record, and returns partial recovery if the second write fails. Its interfaces expose no workout writer or progression mutation.

Real repository binding remains blocked on persisted active-plan guidance targets. Legacy `raise_range` and `lower_range` remain unrouted.
