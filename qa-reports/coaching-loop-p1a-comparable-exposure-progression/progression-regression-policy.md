# Bounded numeric policy

Policy: `canonical_numeric_progression_policy_v1`.

For straight-set, established external-load prescriptions in a standard phase:

1. Three recent successful comparable exposures progress exact repetitions by one within the canonical role/lane envelope.
2. At the repetition ceiling, the next successful trend advances load by exactly one exercise/equipment increment and resets exact repetitions to the envelope floor.
3. One failure holds.
4. Two consecutive comparable failures, with at least three total exposures, reduce exact repetitions by one down to the envelope floor.
5. At the repetition floor, the same failure threshold reduces load by one available increment, never below one increment.
6. A rounded/swallowed request is a semantic no-op.

All future matching is exactly-one-slot. Zero or multiple matches remain unresolved and cannot apply. Special phases and unsupported load/method states fail closed. This is a product policy informed by evidence, not a named programme.
