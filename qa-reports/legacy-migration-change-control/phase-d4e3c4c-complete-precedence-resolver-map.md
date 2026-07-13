# D4E3C4C complete precedence resolver map

## Resolver stages

1. Validate v2 schema/registry and generated-settings fact completeness.
2. Validate normalized class, prescription family, planned-order requirements, and role state.
3. Construct immutable candidates from explicit override, advanced method, family, role, prescription-family, planned-order, block, and programme-default facts.
4. Sort candidates by explicit precedence rank and stable authority ID (never registry order).
5. Select rep and lane winners; equal-rank collisions fail.
6. Look up the exact final v2 branch key.
7. Build the complete trace, validate the aggregate/pairing, and return a defensive copy.

## Outcomes

The resolver returns explicit failures for unsupported versions, incomplete generated-settings facts, unsupported classes/families/order, missing roles, missing authorities, precedence collisions, invalid pairings, contradictory branches, and unregistered final branches. It never accepts caller-supplied winners and never executes prescription arithmetic.

## Trace

The trace records all evaluated and matching authority IDs, selected rep/lane authorities, rejected lower-priority matches, collision codes, normalized key, and deterministic fingerprint. Candidates contain data only and no callbacks.

## Scope gate

This resolver is isolated and not imported by production helpers or generated-settings construction. D4E3C4D must prove exact equivalence against every characterized production branch before any caller migration.
