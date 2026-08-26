# Native method, substitution and accessibility certification — 2026-08-26

## Scope and safety

- Canonical start: `36007f31747873a74409aa3308814ed58266c9c1` on `main`.
- Fully materialised checkout: `/Users/aaronparry/ASC-Native-QA-ee195be`, produced from committed Git objects outside Documents/File Provider; dependencies were installed from the lockfile rather than copied.
- Protected pre-existing modifications remain untouched: `tests/app-icon-config.test.ts`, `tests/canonical-train-brand-boundary.test.ts`, `tests/onboarding-programme-integrity.test.ts`, and `tests/settings-simplification.test.ts`. Pre-existing environment examples, release artifacts and legacy reports also remain untouched.
- Native fixtures use the production-impossible QA entitlement with live billing disabled. Release checks use the offline embedded bundle. No live customer account, purchase, trial, reseed or historical prescription was invoked or changed.

## Native identity and launch evidence

- Profiling bundle: `com.aaronparry.adaptivestrengthcoach.profiling`, build 53, `AdaptiveStrengthCoachProfiling`, native identity `d7537c2`.
- Metro was started from the materialised checkout and served fresh requests from both simulators (1,936 modules). The QA identity distinguished the installed native build from the current JS commit, proving the client was not an older cached bundle.
- Release bundle: `com.aaronparry.adaptivestrengthcoach`, scheme `AdaptiveStrengthCoachReleaseCandidate`; the build embedded 1,832 modules and launched without Metro.
- Devices: iPhone 17 Pro (`06EEA722-8702-40AC-81FC-53E92D205303`) and ASC Narrow iPhone SE (`82648A77-F13E-47DE-9D7B-349B6FA2062F`, Large Dynamic Type), both on iOS 26.5.

## Rendered certification

The complete Release journey passed once on each device. Each retained 15 screenshots covering onboarding review, Today, plan/preview, calibration, numeric keyboard, rest controls, corrected logging, minimise/resume, discard confirmation, completion, progress and settings. The iPhone 17 Pro keyboard-open capture proves the active primary action remains visible.

Advanced-method screenshots are retained under:

- `screenshots/after/iphone-17-large/methods/`
- `screenshots/after/narrow-large/methods/`

| State | iPhone 17 Pro | Narrow + Large text | Result |
| --- | --- | --- | --- |
| Antagonist superset | `13-antagonist-superset.png`, `13-antagonist-superset-next-step.png` | same names | Pass; immutable method and direct-next instruction visible |
| Rest-pause | `14-rest-pause.png`, `14-rest-pause-next-step.png` | same names | Pass; activation, bounded mini-set and 20-second instruction visible |
| Top set + back-offs | `15-top-set-back-offs.png`, `15-top-set-back-offs-next-step.png` | same names | Pass; deterministic top/back-off roles and loads visible |
| Partial-work substitution | `15-top-set-back-offs-substituted.png` | same name | Pass; replacement visible, 1/4 completed sets retained, histories explained separately |

Rendered inspection found successful substitution was initially presented as a red error because the positive-feedback classifier expected `Exercise replaced.` but the persisted copy begins `Exercise replaced for`. The classifier now accepts the stable semantic prefix. Both replacement screenshots were recaptured and show the green, polite success treatment.

VoiceOver-facing improvements include adjustable exercise navigation, grouped/status/completion labels, current target and comparable-history context, polite success feedback, assertive errors, and a single rest-expiry announcement rather than timer-tick announcements. Full VoiceOver traversal remains manual work; Large Dynamic Type is certified, not an Accessibility-category size.

## Interaction cost

| Task | Baseline | Certified result | Friction / safety |
| --- | ---: | ---: | --- |
| Start today's workout | 2 actions | 2 | Meets target |
| Log prefilled target | 1 confirmation | 1 | Meets after calibration |
| Log changed load/reps | entry + confirmation | entry + 1 | Numeric keyboard keeps the current action available |
| Correct completed set | 3 | 3 | Explicit Edit, change, Save |
| Complete/current next set | 1 | 1 | Current row remains stable; prescribed next step is shown |
| Adjust rest | 1 | 1 | Pause/resume, +30s and Skip are direct |
| Swap unavailable exercise | previously uncertified | 6 deliberate actions | More deliberate than the aspirational 3–4, but reason, review and save prevent unsafe consequential changes |
| Minimise/resume | 1 each | 1 each | Meets |
| Complete workout | 1 | 1 | Early completion retains confirmation |
| Understand next prescription | scattered/uncertified for methods | no extra navigation | Persisted next instruction is shown in the rest panel |

## Production-path behaviour

- Mounted substitution covers partial work, explicit reason, immutable original evidence, replacement identity, offline provenance/replay, restart restoration, correction against the original identity and idempotent replay.
- The additive `canonical_training_method_contract_v2` retains historical v1 identity while recording set roles, load multipliers, completion/stop/progression rules, eligibility, substitution compatibility, duration cost and explanation authority.
- Rest-pause is observable as 10-rep activation plus up to two 4-rep mini-sets with 20-second rests and a three-clean-rep stop rule. Top/back-off load rows are deterministic and rounded to the exercise increment. Superset members retain separate progression identity.
- Historical prescriptions remain immutable and persisted explanations remain authoritative.
- The mounted loop still does not prove method-specific longitudinal adaptation for every advanced method. The current mesocycle load owner explicitly handles straight and back-off sets; no claim is made that superset or rest-pause have a complete method-specific adaptation vertical. Unsupported methods remain ineligible rather than being inferred from UI execution.
- Production deload remains fail-closed where mounted readiness/recovery writers are unavailable; no recovery signal was fabricated.

## Verification results

- Static generator: 25 constructed / 5 fail-closed / 0 critical violations, reproduced after method changes.
- Focused canonical correction, Train, grouped semantics, QA exclusion and mounted P1A suite: 49/49.
- Advanced-method/domain affected suite: 85/85; final targeted method suite: 23/23; Train phone UI: 11/11.
- Mounted exercise-management substitution suite: 8/8; broader related persistence/Train checks: 35/35.
- Full suite: 2,486 passed / 4 failed (2,490 total, 413 files). All four failures are protected pre-existing source-string assertions listed above; there are zero new or unexplained failures.
- TypeScript: pass. Expo production config: pass. Web export: pass (1,457 modules). Native Release build: pass. `git diff --check`: pass.
- Native Release journey: 1/1 on iPhone 17 Pro (215.963 seconds XCTest execution) and 1/1 on the narrow Large-text device (216.475 seconds), 15 screenshots each.
- Advanced method journeys: 3/3 on iPhone 17 Pro and 3/3 on the narrow Large-text device. The corrected substitution-feedback recapture passed 1/1 on each device.

## Performance and remaining uncertainty

`XCTApplicationLaunchMetric` measured Release first-frame-responsive launch at 1.112, 0.995, 0.995, 1.023 and 0.993 seconds on the iPhone 17 Pro simulator (mean about 1.024 seconds). This is simulator evidence, not a physical-device target. `xctrace` accepted the simulator/process but failed to finalise both App Launch and Time Profiler documents (`Document Missing Template Error`), so memory growth, rerender counts, SQLite query hotspots and main-thread stalls remain unmeasured.

The active logger now meets strong category expectations for keyboard-safe entry, correction, rest control, resumption and visible advanced-method execution. It trails the best competitor flows on substitution action count and still lacks physical-device/VoiceOver/performance profiling evidence. No best-in-class or superior physiological-outcome claim is made.

Next highest-value slice: close the method-specific longitudinal adaptation gap (or explicitly gate the affected generated methods), then run physical-device VoiceOver and Instruments profiling without broadening coaching policy.
