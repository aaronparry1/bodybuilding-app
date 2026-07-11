# Current recommendation and completion migration

Stage 2B moves the post-completion authority away from default-week progression. After a completed planned workout is persisted, the current completion orchestration boundary verifies current identity, produces/reuses the readiness snapshot, and writes/reuses the current decision. It does not apply that decision.

Custom and extra sessions remain history-only and return `non_planned_completion_ignored`; they cannot contribute to required-role completion or trigger a transition decision.

The logger calls only this boundary after a final planned workout completion. It no longer calls `advanceCompletedMicrocycle`, so default-week and first-successor behaviour cannot create current state. Current recommendation consumption is exposed through `current-decision-recommendation`; legacy block actions remain compatibility-only until Stage 2C/2D and Stage 3 migration work is complete.
