# D4 programme-specification session construction

For a valid restricted D3 calibration plan, session construction now has a pure source-resolution boundary that reads the exact microcycle programme reference, programme version and session template from persisted D1 metadata. It projects ordered prescription slots, semantic targets, purposes, set guidance, constraints, target versions and diagnostic source trace.

Compatibility plans are explicitly classified and retain the legacy generated-guidance path. A malformed current D3 plan returns an explicit invalid-programme result; it never falls back to legacy guidance. This phase does not mutate programme specifications, create versions, apply adjustments, select exercises, or generate exact targets. Exercise selection and exact-target generation remain downstream. D4B will connect this projection to the generated-setting adapter; D5 will bind references into the runtime microcycle model.
