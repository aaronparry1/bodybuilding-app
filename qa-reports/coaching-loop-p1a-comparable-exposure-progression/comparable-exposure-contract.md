# Comparable exposure contract

Version: `canonical_comparable_exposure_v1`.

Semantic identity includes Macrocycle-owned Mesocycle identity, canonical exercise identity, recurring plan-session index and role family, construction/exercise role, lane, method and identity-independent method structure, progression rule, prescribed work-set count, load state/loading mode, and sorted limitation/substitution constraints.

It excludes persistence/session/slot/exercise-instance/group IDs, timestamps, revisions, display units, and regenerated nested object identity.

An exposure is usable only when the completed session exists, every prescribed working set occurs exactly once, all sets are marked complete, evidence is stored in canonical kilograms, no substitution is present, repetitions and loads are valid, all sets use one load, and performed load equals the immutable prescribed base load. Missing legacy semantic fields, ambiguous identity, different equipment/loading semantics, method changes, substitutions, partial/discarded work, and malformed facts fail closed.

Warm-ups and calibration ramp attempts are not ledger working sets and cannot enter this contract. Cross-Mesocycle comparison currently fails closed because Mesocycle identity is included; historical evidence is retained but excluded.
