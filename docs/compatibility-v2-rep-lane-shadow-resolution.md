# Compatibility v2 rep/lane shadow resolution

D4E3C4E1 invokes the v2 precedence resolver only after the production final rep/lane decision has been formed. The production decision remains authoritative. A pure projector builds conservative v2 facts from already-resolved construction inputs; incomplete facts produce `not_evaluated` rather than guessed values.

The immutable shadow result is internal diagnostic state. It is not included in generated settings, generated slots, generated workouts, persistence, serialization, UI, telemetry, or formulas. v2 failures and semantic differences are recorded without changing production output.
