# Completion-affordance audit

Verdict: **PROVEN**.

`projectCanonicalWorkoutPresentation.finishAllowed` means that enough valid performed work exists for the canonical lifecycle to complete a partial session. It does not mean every prescribed set is complete. Train previously rendered its `Finish workout` panel whenever this permissive predicate became true, so 1 of 22 valid sets exposed normal-completion language.

`resolveCanonicalTrainCompletionAffordance` now separates the meanings:

- 0 of 22: no finish action;
- 1 of 22: no normal finish; explicit `Finish early` in Workout actions;
- 21 of 22: no normal finish; explicit `Finish early`;
- 22 of 22: normal `Finish workout`; no early-finish action.

Normal completion says all prescribed working sets are complete. Early completion reports completed and remaining work, requires confirmation, and uses the existing truthful partial-completion lifecycle. No set count, prescription or completion policy was changed.

The loose `Set completed` page-bottom message came from assigning the successful `recordCanonicalPerformedWork` reason to the shared page message rendered after all content. Success now uses the existing haptic and an accessibility announcement; the page banner is reserved for actionable failures.
