# Canonical Session Construction certification

The certification harness is intentionally fail-closed. The staged pipeline
can construct representative snapshots, but it is not yet eligible to replace
the legacy production engine.

Blocking gaps are concrete:

- the snapshot does not yet own explicit rest, progression, and stop-rule data;
- drop-off remains an indirect policy reference rather than a resolved
  construction output;
- canonical-v2 construction still accepts caller-supplied planned snapshots;
- planned and extra/custom production callers remain legacy-backed.

Accordingly the deterministic certification result is `not_ready` and
`productionSwitchAllowed` is permanently `false` for this phase. No production
caller or authority was changed.
