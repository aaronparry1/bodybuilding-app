# Canonical Session Construction certification

The certification harness is intentionally fail-closed. The staged pipeline
can construct representative snapshots, but it is not yet eligible to replace
the legacy production engine.

Blocking gaps are concrete:

- canonical-v2 construction still accepts caller-supplied planned snapshots;
- persistence round-trip for internally constructed planned sessions is not
  yet proven;
- planned and extra/custom production callers remain legacy-backed.

Accordingly the deterministic certification result is `not_ready` and
`productionSwitchAllowed` is permanently `false` for this phase. No production
caller or authority was changed.
