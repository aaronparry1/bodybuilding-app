# Canonical Progress dashboard coverage — Batch 1

Seven representable cases now have independent canonical projection coverage. They use only canonical Macrocycle/Mesocycle/Microcycle context, evidence, persisted intervention/decision state, and recorded-session aggregates. No legacy dashboard builder is called by the replacement tests.

Replacement IDs and exact remaining-case classifications are machine-readable in `canonical-progress-dashboard-coverage-batch-1.json`.

The legacy dashboard remains retained because the 14 remaining unit cases still require either a missing canonical projection field/owner or an intentionally deferred mutation/application boundary. No production caller is mounted, and production switch completion remains false.
