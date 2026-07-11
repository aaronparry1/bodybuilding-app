# Current readiness production and decision writing

Phase 11A.2C3 establishes the production ordering: current planned-role evidence and immutable planned-workout facts are composed through the existing B1–B3 and C2 boundaries, then a C1 snapshot is persisted before the current decision writer evaluates it.

The normal writer accepts a persisted, current snapshot ID only. It rejects missing or superseded snapshots, stores `readinessSnapshotId` on its decision record, and returns the existing decision for identical evidence. It does not apply the outcome or write a legacy block transition.

Snapshot states remain evidence states. `in_progress`, blocked, disrupted, insufficient evidence, and insufficient policy do not become decisions inside the producer. A decision context is stored only for a ready snapshot. Missing machine-evaluable objective policy remains explicit and does not fabricate advance.

Legacy default-week and first-successor behaviours are not inputs to the producer or writer. Stage 2 consumers remain unmigrated and must not independently build readiness evidence or invoke the pure evaluator.
