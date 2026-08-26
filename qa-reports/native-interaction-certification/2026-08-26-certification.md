# Native interaction certification — 2026-08-26

## Scope and identities

- Canonical start: `d7537c2d4420cb75bad975d5359d146e473ec773` on `main`.
- Materialised checkout: `/Users/aaronparry/ASC-Native-QA-ee195be`.
- Installed profiling binary: build 53, `com.aaronparry.adaptivestrengthcoach.profiling`, native identity `d7537c2`.
- Current Metro bundle identity: canonical `1b0c312` at capture time; the QA banner distinguishes `native d7537c2` from `JS 1b0c312`.
- Release journey source included the subsequent native-harness commits `4868d4f` and `7c4d94a`.
- Device: ASC Narrow iPhone SE (3rd generation), iOS 26.5, Large Dynamic Type.
- Premium QA and native Release tests used local/offline fixtures with live RevenueCat keys unset.

## Native evidence

Fresh XCTest attachments are in `screenshots/after/narrow-large/`:

| State | Screenshot | Result |
| --- | --- | --- |
| Onboarding review | `00-onboarding-review.png` | Pass after reconciling the required priority step |
| Today | `01-planned-home.png` | Pass |
| Plan and preview | `02-plan-overview.png`, `02-plan-preview.png` | Pass |
| Calibration | `03-calibration.png` | Pass |
| Keyboard open | `03a-calibration-keyboard-open.png` | Pass: reps, decimal load and primary confirmation remain visible |
| Rest controls | `03b-rest-timer.png` | Pass: pause, resume, +30 seconds and skip |
| Corrected set | `04-active-logger.png` | Pass: corrected 9-rep value appears once; current and next sets remain stable |
| Minimise and resume | `05-paused-home.png`, `05a-resumed-train.png` | Pass |
| Discard safety | `06-discard-confirmation.png` | Pass, including confirmation while the numeric keyboard owns focus |
| Completion | `07-completion-summary.png` | Pass |
| Progress | `08-progress-one-workout.png` | Pass without inventing a personal record |
| Settings | `09-settings-duration.png` | Pass; infeasible duration choices preserve the existing programme |

The earlier narrow keyboard screenshot in `qa-reports/release-candidate/native-screenshots/narrow/03a-calibration-keyboard-open.png` is the baseline. It clipped calibration content and made the primary action visually unstable. The fresh narrow/large-text capture keeps the prescription fields and confirmation action in one usable keyboard viewport.

## Correction truthfulness

Production-path correction now rejects a command that attempts to move a set to another prescribed slot or exercise before an immutable repair event is appended. It also validates reps, load, set order and optional effort before writing.

Mounted assertions prove:

- one original performance event remains immutable;
- one repair projects the corrected effective value;
- completion totals use the corrected value only;
- progression evidence is replaced with repair-version provenance;
- a wrong-focused-exercise edit is rejected with `performed_set_identity_mismatch`;
- rejection leaves ledger event count unchanged.

Focused result: 49/49 across correction, Train, grouped semantic identity, QA exclusion and mounted P1A production-path tests.

## Interaction cost observed

| Task | Current deliberate actions | Target | Status |
| --- | ---: | ---: | --- |
| Start today’s workout | 2 | ≤2 | Meets |
| Log prefilled load and target reps | 1 confirmation | 1–2 | Meets after calibration |
| Log changed load/reps | numeric entry + 1 confirmation | minimal + 1 | Meets |
| Correct unfinished set | direct inline edit | direct | Meets |
| Correct completed set | Edit, change, Save (3) | ≤3 | Meets |
| Return to prescribed current set | 1 exercise selection | 1 | Meets |
| Browse an exercise | 1 exercise selection | 1 | Meets |
| Minimise and resume | 1 each | 1 each | Meets |
| Finish completed workout | 1 deliberate finish action | 1 | Meets |
| Return from incomplete Finish | 1 cancel/return action | 1 | Meets |
| Substitute exercise | Not natively recertified in this run | ≤3–4 after selection | Open |

## Grouped-method readiness

| Method | Domain identity | Native execution | Production eligibility |
| --- | --- | --- | --- |
| Antagonist superset | Certified | Existing injected native journey | Carrier-ready; generator policy remains unchanged |
| Same-muscle superset | Semantic identity certified | Not fully recertified | Not yet eligible |
| Triset | Contract gap | Not certified | Ineligible |
| Top set plus back-offs | Existing prescription semantics only | Not certified | Ineligible for new generation |
| Rest-pause | Certified carrier identity | Existing injected native journey | Carrier-ready; no new generation enabled |
| Traditional clusters | Contract gap | Not certified | Ineligible |
| Paused/tempo work | Partial prescription semantics | Not certified end to end | Ineligible |

No advanced method was newly enabled in production generation.

## Verification

- Narrow Large Dynamic Type Release/XCTest journey: 1/1 passed, 232.56 seconds, 15 screenshots.
- Release build: passed and embedded an offline production bundle (1,832 modules); independent of Metro.
- Metro profiling clients: two fresh native bundle requests served, 1,936 modules each.
- TypeScript from materialised checkout: passed.
- Generator: 25 constructed / 5 fail closed / 0 critical violations.
- Policy and longitudinal focused tests: 15/15 passed.
- Full canonical suite: 2,482 passed / 4 failed (2,486 total, 413 files).
- Remaining four failures are the protected pre-existing modified source-string assertions: `app-icon-config`, `canonical-train-brand-boundary`, `onboarding-programme-integrity`, and `settings-simplification`.

## Open certification work

- Fresh keyboard-open screenshots are still needed on the iPhone 17 Pro for the current post-identity bundle.
- VoiceOver traversal/order and an accessibility text size above Large remain unmeasured.
- Substitution needs a deterministic native fixture and mounted comparability journey before its interaction budget can be certified.
- Trisets, clusters, top-set/back-off correction, and tempo/paused historical display remain production-ineligible.
- Instruments timings, rerender counts, SQLite query counts and memory growth were not measured in this run; no performance superiority claim is made.
