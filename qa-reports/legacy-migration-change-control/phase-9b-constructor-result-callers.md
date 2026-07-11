# Phase 9B planned-session constructor result callers

| File | Symbol | Direct call | Current `null` meaning | Classification | Typed handling |
| --- | --- | --- | --- | --- | --- |
| `src/features/workout-logging/use-workout-logger.ts` | `createSessionFromActivePlan` | Yes | No active plan, incomplete planning input, no candidate, intervention block, or invalid constructed session | Active production | Return a session only for `constructed`; preserve `null` solely at the logger's existing no-session UI boundary. |
| `tests/session-construction.test.ts` | Constructor tests | Yes | Success assumed | Test | Assert `constructed` and its session payload. |
| `tests/current-planning-constructor-authority.test.ts` | `construct` helper | Yes | Incomplete planning input | Test | Assert `invalid_input`. |
| `tests/planned-target-boundary.test.ts` | Exact-target test | Yes | Success assumed | Test | Narrow to `constructed` before inspecting targets. |

The constructor has no builder, non-planned, persistence, report, or QA caller. Its nullable meanings are: incomplete planning resolution; a required-slot intervention block; ordinary empty candidates; and invalid post-construction validation. Optional slots remain optional and therefore do not fail construction.
