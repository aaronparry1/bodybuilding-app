# Adaptive Stress Lab v0.1

Research-only test bench for Adaptive Strength Coach V2.

This lab asks:

> Given this athlete, this goal, this training history, and this evidence, what would Adaptive Strength Coach recommend next?

## Boundaries

- No production app imports.
- No production workout generation.
- No production progression logic.
- No subscription, paywall, or RevenueCat logic.
- No EAS builds.
- All schemas, scores, and intervention choices are draft research fixtures requiring Aaron approval before any production use.

## Foundation Documents

- `docs/adaptive-coaching-manifesto-v1.md`
- `docs/adaptive-stress-allocation-v1.md`
- `docs/adaptive-load-management-v1.md`
- `docs/coaching-playbook-v1.md`
- `docs/scientific-validation-framework-v1.md`
- `docs/exercise-stimulus-fatigue-classification.md`
- `docs/training-days-stimulus-audit.md`

## Run

```bash
node research/adaptive_stress_lab/src/run_v0_1.mjs
```

This validates fixture shape, runs the decision stub over the starter scenarios, and writes:

```text
reports/adaptive_stress_lab/v0_1_report.md
```

To generate the first Athlete State Engine report:

```bash
node research/adaptive_stress_lab/src/run_athlete_state.mjs
```

This describes current athlete state only. It does not recommend coaching decisions and writes:

```text
reports/adaptive_stress_lab/athlete_state_report.md
```

To generate the objective-first Coaching State report:

```bash
node research/adaptive_stress_lab/src/run_coaching_state_objective_first.mjs
```

This uses the Sprint 1B semantics: \`fatigue\` is replaced by \`recovery_capacity\`, all scores use 100 as the positive/better direction, and subjective context is lower authority than objective training evidence unless a severe safety flag is present.

```text
reports/adaptive_stress_lab/coaching_state_objective_first_report.md
```

To generate the Safety Gate v0.1 report:

```bash
node research/adaptive_stress_lab/src/run_safety_gate_v0_1.mjs
```

Safety Gate sits after Coaching State and before any future coaching decision. It has veto power through \`restrict\` and \`stop\` statuses.

```text
reports/adaptive_stress_lab/safety_gate_v0_1_report.md
```

To generate the Decision Engine v0.2 report:

```bash
node research/adaptive_stress_lab/src/run_decision_engine_v0_2.mjs
```

Decision Engine v0.2 consumes Coaching State and Safety Gate output, then produces a draft \`CoachingRecommendation\`. It is a research prototype only.

```text
reports/adaptive_stress_lab/decision_engine_v0_2_report.md
```

To run the Coaching Gauntlet v0.1:

```bash
node research/adaptive_stress_lab/src/run_coaching_gauntlet_v0_1.mjs
```

The gauntlet stress-tests Decision Engine v0.2 against 50 realistic scenarios across four levels and reports failures for Aaron review.

```text
reports/adaptive_stress_lab/coaching_gauntlet_v0_1.md
```
