# Current recommended set guidance timing resolution

E2E3B validates only authoritative, supplied facts. An applied `continue` may resolve a record to the supplied next normal microcycle in the same plan and mesocycle, provided its parent version is unchanged and no workout exists there. Delay/review remain unresolved; deload remains pending; advance makes the old target stale.

The returned `ready` record is immutable and unpersisted. The resolver never creates a microcycle, reads a repository, normalizes a range or applies an adjustment.
