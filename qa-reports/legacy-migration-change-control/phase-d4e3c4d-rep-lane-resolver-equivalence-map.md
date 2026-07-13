# D4E3C4D rep/lane resolver equivalence map

## Observation method

Production observations invoke the existing `resolveRepRange` and `resolveTrainingLane` APIs read-only. V2 observations use the same independent fixture facts to invoke `resolveCompleteRepLanePrecedence`. No expected authority or final branch ID is supplied to the resolver.

## Results

Three ordinary hypertrophy branches have exact observable rep/lane equality. The independent fixture inventory contains twelve production categories and all eight lane identities, but override, advanced-method, corrective/recovery/power, planned-order, and partial façade cases remain characterization gaps because the current v2 registry/resolver does not represent their full precedence facts.

Equivalence categories used are `exact_equivalence`, `semantic_equivalence_with_identifier_translation`, `production_authority_not_observable`, `resolver_missing_branch_fact`, `resolver_precedence_mismatch`, `rep_semantic_mismatch`, `lane_semantic_mismatch`, `final_branch_mismatch`, `failure_state_mismatch`, `characterization_gap`, `unsupported_production_branch`, and `invalid_fixture`.

## Readiness

Certification is not passed. D4E3C4E caller migration remains blocked until every production-active branch and collision is represented and matched. No production code was changed.
