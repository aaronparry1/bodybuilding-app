# Canonical active-plan v2 carrier

`canonical-active-plan-carrier.ts` is an isolated, pure migration target. It combines outputs already produced by Macrocycle, Mesocycle, Microcycle, Session Construction, Progress, and athlete-input boundaries. It does not select phases, create microcycles, resolve prescriptions, evaluate readiness, or become active through restoration.

The carrier deliberately excludes `blocks`, `activeBlockId`, `TrainingYear`, annual weeks, generic rep ranges, and independently authored successor lists. Planned-session prescription data is an output snapshot tagged with Session Construction provenance; it contains no runtime functions or services.

Validation is fail-closed for schema/version, parent linkage, deterministic session identity/index, prescription provenance, progress revision, timestamps, and injected legacy authority fields. Serialization sorts object keys recursively for deterministic round trips.

Next migration boundary: hydrate and persist this carrier at the active-plan restoration boundary, reconstructing only missing future state through canonical owners and retaining legacy source data solely in recovery storage.
