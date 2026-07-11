# Recovery Management Engine v1

Status: Architecture locked, advisory engine only.

The Recovery Management Engine evaluates whether recovery is supporting or limiting productive adaptation. It does not directly change programmes, microcycles, mesocycles, blocks, training states, exercises, or methods.

The Intervention Decision Engine remains the single authority for selecting coaching actions.

## Inputs

8J consumes recent workout performance, Adaptation Detection output, fatigue/recovery signals, failed set frequency, missed sessions, optional sleep/stress/soreness/motivation context, pain or issue flags, training density, method and exercise fatigue cost, systemic performance trend, current training state, and recent intervention history.

Subjective context is allowed only as supporting context. Objective performance, failed sets, systemic trends, pain flags, training density, and adaptation status carry higher authority.

## Outputs

The engine returns:

- `recovery_status`: recovered, recovering, borderline, compromised, critical, or insufficient evidence
- `recovery_confidence`
- `limiting_recovery_factors`
- `recovery_reason_codes`
- `recommended_recovery_bias`
- `veto_flags`
- `can_veto_aggressive_progression`

It also marks itself as `advisory_only` and `feeds_intervention_decision_engine`.

## Recovery Dimensions

- Local muscular
- Joint/connective tissue
- Neural
- Systemic
- Psychological

## Recovery Bias Hierarchy

The engine prefers the smallest effective recovery bias:

monitor -> reduce volume -> reduce intensity/density -> lower-stress method/exercise -> restoration session -> deload -> pivot.

Deload is a last-resort recommendation, not the default.

## Conflict Prevention

8J can veto aggressive progression when recovery is compromised or critical, but it cannot select the intervention itself.

8F combines Adaptation Detection and Recovery Management before selecting actions. Poor performance plus poor recovery is treated primarily as recovery/fatigue pressure. Poor performance with normal recovery is treated primarily as a stimulus/adaptation issue. Good performance despite fatigue is monitored rather than automatically deloaded.

Adaptive Training State remains responsible for state architecture. If a state transition is due while recovery is compromised, 8F decides whether to transition, insert restoration, deload, pivot, or gather more evidence.
