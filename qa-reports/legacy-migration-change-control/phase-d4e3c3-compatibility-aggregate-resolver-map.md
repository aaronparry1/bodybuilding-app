# D4E3C3 compatibility aggregate resolver map

## Resolver input

`CompatibilityPrescriptionResolutionInput` contains registry version, normalized compatibility block classification, exercise class, slot role, movement family, history state, loading capability, equipment increment class, guidance envelope, prescription/evidence state, special method, and generated-slot context. The resolver accepts no `TrainingBlock`, plan, workout, repository, callback, or target output.

## Projection and normalization

`buildCompatibilityPrescriptionResolutionInput` is the only block-aware boundary permitted by this phase. It canonicalizes the four supported block classifications, three exercise classes, four history states, four loading capabilities, role/movement/envelope values, and rejects unsupported or contradictory facts. It returns a defensive block-free input or an explicit invalid/unsupported result.

## Exact resolution

`resolveCompatibilityPrescriptionAggregate` validates registry version, projects/normalizes facts, builds the complete branch key, performs exact registry lookup, validates the complete aggregate, and returns a defensive copy. It never executes arithmetic and never composes independent sub-policy defaults. All seven characterized branches resolve from real facts; missing or ambiguous keys fail explicitly.

## Equivalence and architecture

The aggregate contains the semantic fields characterized in D4E3C0/C2. Equivalence assertions currently lock branch identity and complete sub-policy presence; existing helper formulas and callers remain unchanged and are not routed through this resolver. D4E3C4 must add field-by-field helper equivalence before caller migration.

## Outcomes and next gate

Outcomes preserve unsupported branch/class/role, invalid input, unsupported registry, and contradictory aggregate states. The next phase is D4E3C4: migrate rep/lane callers only after exact helper equivalence is proven. No current-policy runtime, persistence, D4D2, fallback, or generated-workout behavior is changed here.
