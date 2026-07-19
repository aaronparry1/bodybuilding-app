# Canonical Plan and Progress visual certification

This evidence certifies athlete-facing Plan and Progress projections over the new training architecture. The screens receive presentation models; they do not read raw plan carriers, ledger repositories, Progress evaluators, or legacy workout history.

## Plan structure

Plan leads with the current goal and Mesocycle purpose, week position, completed-session count, and one Start or Resume action. It then shows the entire ordered five-session schedule. Each session has text and icon status, its immutable Session Construction summary, and an optional read-only exact prescription preview. Completed and active sessions remain in their original position. The roadmap only presents canonical approved successors and explicitly describes them as reviewed direction, never a guaranteed future plan.

The certified schedule is Bench and hypertrophy, Squat and hypertrophy, Deadlift and back, Upper support, and Lower support with 11 / 11 / 11 / 14 / 12 prescribed work sets. Home, Plan, and Train use the same planned-session identity.

## Progress evidence rules

Progress counts only completed canonical recorded sessions containing valid performed-work events. Started workouts, incomplete sets, warm-ups, and zero-load substitutions do not create completion metrics. The overview names its metrics explicitly: completed workouts, distinct trained seven-day windows across the rolling four-week period, and sessions in the current phase. Status and trends require at least three completed workouts and three observations with the same exercise identity, loading mode, and immutable load state; this threshold is behind **How this is calculated**. Early-history guidance states the derived number of comparable workouts still needed.

Established stable history uses a calm **Holding steady** card rather than growth bars and does not invent a PR. Estimated 1RM is available only for comparable established-load work with valid load, reps, and effort data; calibration, bodyweight, assisted, autoregulated, unavailable, and invalid-effort observations cannot create the estimate. A progression highlight appears only when later performed work genuinely exceeds earlier work. Unit conversion is display-only; canonical kg values do not change.

## Visual states

| State | Viewport | Result | Evidence |
| --- | --- | --- | --- |
| Plan · session 1 next | 390×844 | Passed | `screenshots/plan-session-next-390x844.png` |
| Plan · session 1 active | 390×844 | Passed | `screenshots/plan-session-active-390x844.png` |
| Plan · partially completed week | 375×812 | Passed | `screenshots/plan-partial-week-375x812.png` |
| Plan · phase completed | 390×844 | Passed | `screenshots/plan-phase-completed-390x844.png` |
| Plan · recoverable issue | 320×568 | Passed | `screenshots/plan-recoverable-error-320x568.png` |
| Plan · no plan | 320×568 | Passed | `screenshots/plan-no-plan-320x568.png` |
| Progress · zero history | 390×844 | Passed | `screenshots/progress-zero-history-390x844.png` |
| Progress · one completed workout | 375×812 | Passed | `screenshots/progress-one-completed-375x812.png` |
| Progress · established history | 390×844 | Passed | `screenshots/progress-established-390x844.png` |
| Progress · genuine PR | 390×844 | Passed | `screenshots/progress-genuine-pr-390x844.png` |
| Progress · insufficient trend | 320×568 | Passed | `screenshots/progress-insufficient-trend-320x568.png` |
| Progress · recoverable issue | 320×568 | Passed | `screenshots/progress-recoverable-error-320x568.png` |

Only the four affected Progress states were rerendered for this correction: one completed workout, established history, genuine PR, and insufficient trend. All other screenshot bytes and hashes are unchanged. Images are viewport-only captures from the local non-production Design-QA runtime. Browser inspection found no horizontal overflow and no console errors. The narrow 320×568 state retains readable copy and the normal tab shell. Icons are paired with text, stable and changing trends have textual summaries, touch targets retain the shared minimum height, and text scaling is not disabled.

## Fixture safety

Visual fixture application uses canonical plan construction, immutable snapshots, lifecycle commands, performed-work events, completion, carrier reconciliation, and canonical evidence. Completed Progress fixtures now record all 11 prescribed working sets across the complete snapshot before canonical completion, with deterministic fake-clock work distributed through a plausible 49-minute session. The one-completed fixture records all 11 sets across 45 minutes. Fixture-integrity tests compare prescribed and valid completed sets, lifecycle status, and elapsed/event times. The fixture reset clears its canonical ledger/evidence/timer facts, and each applied visual state records an active QA marker so a reload cannot silently replace completed or historical facts with a new workout. This behavior is Design-QA-only.

## Verification

- Focused Plan, Progress, Design-QA, Home, Train, ledger, and boundary coverage: 19 files / 188 tests passed
- Full suite: 347 files / 2,054 tests passed; zero failed or skipped
- TypeScript: passed
- Production Expo public config: passed with Design-QA disabled
- Production web export: passed
- Native build, EAS build, upload, deployment, and store submission: not performed
