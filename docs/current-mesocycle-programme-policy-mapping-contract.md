# Current mesocycle programme-policy mapping contract

## Boundary

`current-mesocycle-programme-policy-mapping.ts` is a pure registry boundary. It classifies one exact current mesocycle purpose and one exact programme family. It does not resolve slots, call the hypertrophy policy, construct D2 input, choose an exercise, select a successor, mutate a plan, persist data or apply guidance.

## Input and family identity

`CurrentMesocycleProgrammePolicyMappingInput` contains schema/registry versions, goal, experience, days, split, exact catalogue `MesocycleId`, equipment capabilities, programme family and template family. The sole certified family identity is `intermediate_four_day_full_gym_upper_lower` with `upper_lower_ab_v1`; callers cannot assemble a family from labels or policy output.

The resolver rejects unknown registry/schema versions and contradictory inputs. It has no generic `hypertrophy` purpose: purposes must exactly match the catalogue.

## Results and permissions

Results are `supported`, `candidate_pending_certification`, `dedicated_policy_required`, `unsupported_programme_family`, `unsupported_mesocycle_purpose`, `invalid_input`, or `unsupported_registry`. A supported exact row enables only its certified capabilities. Both current supported rows enable slot resolution and D2 construction; persistence and guidance adjustment remain false. `canConstructCurrentProgrammeSpecification` is true only for those exact supported rows.

`hypertrophy_base` for the exact family returns candidate identity only: `certified_upper_lower_hypertrophy_v1`, policy version `v1`, structural family `upper_lower_ab_v1`, and certification `current_hypertrophy_upper_lower_programme_certification@v1`. Candidate is not executable support.

`hypertrophy_calibration` for the exact family is supported by `intermediate_upper_lower_hypertrophy_calibration_v1`, version `v1`, and `hypertrophy_calibration_upper_lower_certification_v1`. Volume, specialisation, consolidation and transition return exact `dedicated_policy_required` reason codes. Valid but non-certified family inputs return `unsupported_programme_family`; invalid/unknown purpose inputs do not fall back.

## Safety properties

The hypertrophy registry is completeness-tested against the catalogue without relying on catalogue order or a wildcard. Input/result copies and fingerprints are deterministic and key-order/timestamp independent. Fingerprints are diagnostic only, never purpose, programme or policy identity. The compatibility projection is advisory: candidate, dedicated and unsupported states continue the existing compatibility plan path; invalid input and unsupported registry block.

## Next gate

D2.5D2 approved the exact base mapping and D2.5D3 certified calibration. Restricted D3 must separately persist a complete calibration specification and reference before normal new `build_muscle` plans use it. No production caller consumes this contract yet.
