# D4C current calibration runtime construction

The restricted calibration runtime source boundary resolves the exact D3 microcycle reference, programme version, session template and certified D4B adapter before exposing pre-exercise jobs. Supported current plans return `current_programme_adapter`; compatibility plans return `compatibility_generated_guidance`; malformed current plans fail explicitly without fallback.

The D4C result contains programme/template identity, consumed prescription-slot IDs and adapted semantic jobs. It contains no selected exercise or exact target and performs no programme, target, adjustment or workout write. Exercise selection and exact-target generation remain downstream boundaries. The existing compatibility path is preserved for all other families.

The next phase must connect these certified jobs to the existing exercise-selection invocation and prove deterministic selection/exact-target equivalence. No base migration, D5 binding or E2E3 application binding is included here.
