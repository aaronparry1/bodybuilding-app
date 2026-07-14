# D4E3-AUDIT-2B: macrocycle horizon semantics

The restored `>= 48 weeks` assertions originate from the legacy annual-plan/training-year model and its truthfulness documentation. They are not a universal requirement of the current Macrocycle → Mesocycle → Microcycle → Session Construction → Progress architecture.

The current engine is hybrid:

- general development is rolling and strategic when no target date exists;
- dated/event plans are bounded by the deadline;
- single-block and custom-sequence modes are explicitly bounded by user choice;
- the active mesocycle and approved successors provide deterministic near-term structure;
- Progress supplies evidence for continuation, transition, recovery, and safety decisions.

The two restored assertions should therefore remain failing until a follow-up test-only migration replaces them with route validity and deadline-specific contracts. They must not be weakened back to `> 0`, and production must not be padded to 48 weeks merely to satisfy the legacy expectation.

The `annualMacrocycleForGoal()` and `TrainingYear` paths remain compatibility/legacy surfaces. Current `createActiveTrainingPlan()` resolves through `macrocycle-engine` phases, whose no-target plans are rolling. Event dates are reverse-engineered to the target. A universal 48-week minimum would over-commit future session detail and contradict adaptive continuation.

Recommended model: bounded for dated goals, outcome-driven/rolling for general development, with the active mesocycle committed and approved successors represented strategically. The next implementation task is **D4E3-AUDIT-2C**, replacing the two horizon assertions with tests for route validity, approved successor coverage, and deadline compliance. No production change is authorized by this audit.
