# Current mesocycle to programme-guidance policy mapping

## Rule

A current mesocycle maps to a programme-guidance policy only through an explicit, versioned entry. Goal, a shared `hypertrophy` prefix, catalogue order, predecessor/successor state and legacy block data are not mapping rules. A mapping selects one exact policy ID and version; it does not select exercises, create a programme, choose a successor or apply guidance.

## Current hypertrophy purposes

| Purpose | Training job and evidence state | Programme-policy status |
| --- | --- | --- |
| `hypertrophy_calibration` | Establish reproducible exercise, load and recovery baselines. Load data, stable exercise fit and set tolerance are not yet trusted. | Dedicated policy required. It must state conservative ranges, accessory rules, stable-selection constraints and the evidence needed before base. The certified productive policy must not be attached here. |
| `hypertrophy_base` | Build a recoverable, stable progressive muscle-specific stimulus. Success is priority-muscle rep/load progression. | Candidate for `certified_upper_lower_hypertrophy_v1`, pending exact field-level equivalence certification. |
| `hypertrophy_volume` | Find productive additional *local* volume after a base dose is known. | Dedicated volume policy required. It may reuse structural templates but not the certified ranges by default. |
| `hypertrophy_specialisation` | Prioritise one to three muscles while maintaining the rest. | Dedicated policy required: priority slot/placement and non-priority maintenance are materially different. |
| `hypertrophy_consolidation` | Dissipate fatigue while retaining muscle with familiar maintenance work. | Dedicated policy required; productive-volume ranges and optional accessories cannot be inherited implicitly. |
| `hypertrophy_transition` | Restore readiness using low structured volume. | Dedicated policy required or explicit compatibility-only status; it is not a productive normal-microcycle policy. |

All powerbuilding, strength and athletic purposes remain unsupported by this policy family. Their own goal/purpose policies must be mapped explicitly.

## Certified policy identity

The certified four-template policy is proposed as `certified_upper_lower_hypertrophy_v1`: intermediate, four-day, full-gym Upper/Lower, productive normal microcycle, with Upper A/B and Lower A/B. It contains 58–84 direct pre-exercise prescribed sets across the four sessions. Its slot count, optional accessory treatment, stable selection assumptions and recoverability profile are consistent with **base productive hypertrophy**, not calibration, volume expansion, specialisation, consolidation or transition.

This is a semantic recommendation, not an implementation mapping. `hypertrophy_base` remains unmapped until D2.5D2 proves every required policy field is identical: family, roles/order, target/purpose, ranges, optionality, constraints, equipment, experience, normal-productivity priority and certification fingerprint.

## Structure versus purpose parameters

The Upper-A, Lower-A, Upper-B and Lower-B skeleton may later be shared where a purpose retains the same training jobs. Each purpose still owns a distinct policy identity/version for ranges, optionality, fatigue limits, selection constraints and reason codes. A shared structural builder is acceptable only if those fields remain explicit; generic parameterisation must not conceal a materially different calibration, volume or specialisation policy.

## Proposed mapping contract

`CurrentMesocycleProgrammeGuidancePolicyMapping` should receive goal, experience, frequency, split, exact mesocycle purpose, equipment profile and registry version. It returns one of:

- `mapped` with exact programme-guidance policy ID/version, structural family, purpose-policy identity, certification ID/version and scope;
- `unsupported_mesocycle_purpose`;
- `dedicated_policy_required`;
- `unsupported_programme_family`;
- `unsupported_policy_registry`; or
- `invalid_input`.

It returns no slots, IDs, exercises, programme versions or successor choice. The policy resolver remains the sole producer of slot definitions.

## Initial support matrix

| Inputs | Mapping now | D3 consequence |
| --- | --- | --- |
| Intermediate, four-day, Upper/Lower, full gym, `hypertrophy_base`, normal productive | Candidate only; D2.5D2 certification required. | May support a base-only fixture path after certification, not normal production entry. |
| Same family, `hypertrophy_calibration` | Dedicated calibration policy required. | Compatibility-only; do not attach the certified specification. |
| Same family, `hypertrophy_volume` | Dedicated volume policy required. | Compatibility-only. |
| Specialisation, consolidation, transition; beginner; other split/frequency/equipment; strength/power | Unsupported. | Compatibility-only while existing workout flow remains available. |

## Calibration requirements

A calibration policy must separately decide its template structure, conservative set ranges, optional accessory treatment, compound-fatigue cap, exercise-stability/rotation constraints, exact-target first-session handoff, and minimum credible exposure before base eligibility. Literature can support conservative entry, familiarisation and avoiding excessive initial fatigue; it does not prescribe an app-specific `hypertrophy_calibration` policy. Those values require an explicit product/coaching decision and certification.

## Lineage and transition safety

The mapping applies only to the mesocycle currently named in the input. It cannot select successors or create loops. A same-mesocycle guidance change can create a new immutable version in its programme lineage. Calibration-to-base and every other mesocycle advance create a new programme lineage and new template/slot identities, even if structural jobs later resemble one another.

## Plan-creation consequence and gates

`createActiveTrainingPlan` currently starts a new intermediate build-muscle plan in `hypertrophy_calibration`. Until calibration policy is implemented and certified, normal new plans must continue through explicit compatibility construction: no programme specification, no invented identity and no current guidance-adjustment eligibility. Base-only restricted D3 can be tested only through an explicitly base-starting fixture after D2.5D2; it cannot be presented as production new-plan readiness.

Production restricted D3 requires either a certified calibration policy or a separately approved product/training decision to change initial mesocycle selection. Engineering must not change that selection merely to unblock persistence.

## Rollout

1. D2.5D1 — implement the pure exact-purpose mapping contract and support matrix.
2. D2.5D2 — certify `hypertrophy_base` field-level equivalence to `certified_upper_lower_hypertrophy_v1`, or introduce a separate base policy.
3. D2.5D3 — design and implement calibration policy following approved entry-volume and evidence decisions.
4. D2.5D4 — certify calibration’s four-template programme and exact-target handoff.
5. Restricted D3 — persist only the certified initial-calibration policy for real new plans; retain base-only fixture coverage as appropriate.
6. D4 — migrate construction projection only after persisted policies are present.

## Product-owner decisions

Aaron must approve: whether the certified policy becomes `hypertrophy_base_v1`; calibration slot structure/ranges/accessory treatment; calibration exposure required before base; whether intermediate users continue to start in calibration; volume structure versus dedicated ranges; and whether unsupported families retain compatibility setup rather than blocking onboarding. The recommendation is to retain calibration entry and compatibility setup, then implement a distinct conservative calibration policy.
