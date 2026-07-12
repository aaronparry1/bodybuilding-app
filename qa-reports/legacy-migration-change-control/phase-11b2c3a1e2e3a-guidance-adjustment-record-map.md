# Guidance adjustment record map

Legacy `VolumeAdjustmentRecord` fields (block ID/week, action, muscle and timestamp-derived ID) are history compatibility only. The current contract adds explicit target identity, expected parent/target version, timing state, lifecycle, policy and semantic idempotency key. New records cannot be applied without resolved next-normal-microcycle timing. Hydration never resolves plans/workouts and never enriches legacy records.

E2E3B must resolve pending timing after an authoritative decision produces a normal next microcycle. E2E3C may then add idempotent application/persistence; neither is implemented here.
