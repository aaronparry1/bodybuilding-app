# Mesocycle prescription policy

`mesocycle-prescription-policy.ts` is the canonical policy envelope between Mesocycle and Session Construction. It is exhaustive over the current Mesocycle library, deterministic, versioned, and fail-closed. It contains method eligibility, loading/volume character, exercise suitability, fatigue boundaries, progression families, and transition references.

The policy deliberately does not contain exercises, session roles, exact sets, exact reps, loads, rest, chosen method instances, or final stop-rule values. Microcycle continues to own weekly roles and ordering; Session Construction continues to own exact prescriptions; Progress continues to own evidence and decisions; successor identities remain sourced from each Mesocycle specification.

Legacy block semantics are mapped in the accompanying ownership artifact. Unsupported or ambiguous behavior is not translated into a production adapter.

The contract now also exposes canonical lane, target-generation, special-state scoring, strength-anchor, and drop-off envelopes. These are constraints only: exact lane choice, exercise choice, targets, method instance, and stop value remain Session Construction-owned.

Exercise suitability is represented through factual metadata and `matchExerciseToMesocyclePolicy`; phase labels and `suitableBlocks` are not renamed into the canonical contract. The remaining Session Construction switch must replace its `blockType` inputs with these envelopes before production callers migrate.
