# Cycle Governance / Coaching Decision Resolver v1

Status: Architecture locked.

The Coaching Decision Resolver is the final governance layer between the internal coaching engines and any future workout builder mutation. Individual engines may produce signals, recommendations, vetoes, prescriptions, or candidate actions, but only the resolver may emit the final resolved coaching action.

## Position In The Chain

Inputs may include Adaptive Training State, Adaptation Detection, Recovery Management, Intervention Decision, Loading & Progression, Method Selection, Exercise Rotation, current cycle context, exposure rules, cooldowns, pain/safety flags, missed sessions, confidence scores, and reason codes.

The resolver returns:

- `final_coaching_action`
- `action_scope`
- `final_prescription_payload`
- `accepted_signals`
- `rejected_signals`
- `confidence`
- `reason_codes`
- `review_after_sessions`
- `cooldowns_applied`
- `safety_flags`

## Authority Hierarchy

1. Safety and pain risk
2. Critical recovery or systemic regression
3. Adaptation status
4. Training state minimum/maximum exposure rules
5. Intervention cooldowns and anti-flip-flop rules
6. Method/exercise suitability
7. Loading and progression

## Governance Rules

Safety overrides progression. Pain can veto load increases, high-risk exercises, and high-fatigue methods.

Critical recovery can veto aggressive progression and route a recovery-biased signal to the Intervention Decision authority.

Improving adaptation delays unnecessary state, method, or exercise changes unless maximum exposure has been reached.

Maximum exposure forces review/escalation, but never unsafe progression. Minimum exposure prevents premature changes unless safety or pain requires action.

One poor session cannot override a higher-confidence trend. Conflicting low-confidence outputs resolve to `gather_more_evidence` or `no_change`.

Recent interventions have cooldown windows. Repeated failed interventions should escalate rather than repeat the same failed action.

## Workout Builder Boundary

Future workout builders should consume only `ResolvedCoachingDecision`. They should not directly consume upstream engine outputs as mutation authority.

This prevents the app from letting loading, recovery, method selection, rotation, or state logic fight each other.
