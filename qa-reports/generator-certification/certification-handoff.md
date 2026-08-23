# Generator and runtime certification handoff

Date: 2026-08-23

Starting commit: `686e3de88fa9a89e3b55541d3b2ac5963c387cc5`

Branch: `main`

## Runtime evidence

The Documents workspace stalls while reading otherwise ordinary hydrated source and loose Git-object files. The same source, materialised with `brctl download`, copied to `/tmp/asc-runtime-materialized-1787502036`, and installed from `package-lock.json` with Node 22 completed `npm ci` in 4.4 seconds, TypeScript in 3.7 seconds, and a 1,534-module Expo web bundle in 4.8 seconds. This isolates the cause to macOS File Provider/Documents mediation rather than Node, npm, Watchman, Metro, Expo, the QA wrapper, or a particular dependency. Finder **Keep Downloaded** for the repository, or moving the canonical repository outside Documents, is the smallest persistent remedy.

The clean runtime also built and signed the Expo 56 iOS app with Xcode 26.6, installed it on an iPhone 17 Pro simulator, bundled 1,931 modules, and rendered the native sign-in/offline-entry screen. The simulator has no StoreKit configuration, so RevenueCat correctly reported that offerings could not be fetched; billing was not changed or exercised.

Web visual inspection covered sign-in, offline entry, complete onboarding, generated-programme review, Today/Home, the paywall boundary, and a 390×844 phone viewport. Workout states beyond preview were not claimed as newly rendered because offline access encountered the existing premium gate and no transaction was authorised.

## Generator authority and certification

Production authority is:

`completeCanonicalOnboardingSetup → commitCanonicalOnboardingPlan → createCanonicalActivePlan → constructCanonicalActivePlanFromCanonicalInputs → createMacrocycle → selectMesocycles → resolveMesocyclePrescriptionPolicy → createMicrocycle → allocateCanonicalMicrocycleVolume → constructCanonicalSession → exact-duration guard → certifyCanonicalConstructedMicrocycle → immutable canonical v2 carrier persistence`.

The deterministic 30-person pairwise matrix covers five goal variants (including hypertrophy, strength, powerbuilding and athletic development), novice mapped explicitly to the real beginner category plus beginner/intermediate/advanced, 2–6 days, all public split families plus adversarial legacy requests, four duration limits, four equipment profiles, and five history/recovery scenarios. Results: 21 constructed; 9 failed closed with reasons; 0 constructed programmes violated the hard duration, catalogue-linkage, or non-empty-programme invariants.

Metrics include programme identity; session/exercise/set counts; estimated duration; rep and rest ranges; direct and meaningful-secondary stimulus accounting; movement exposures; compound/isolation balance; fatigue, joint-stress and stability classes; main-lift specificity; methods; progression opportunities; adjacent-session overlap; push/pull balance; violations; severity; and confidence. Relative intensity, binary “hard sets,” multi-generation workload change, and initial-week deload behaviour are explicitly unavailable rather than fabricated.

Serious findings, ranked:

1. Onboarding's existing-training recovery gate omitted the newer `delayed` and `conflict` hydration states. Fixed by aligning its type boundary with startup hydration; the existing fail-closed routing semantics remain unchanged.
2. Some otherwise supported 30/45-minute strength or powerbuilding requests pass allocation but fail the later exact-duration calculation. The exact guard was preserved. Aligning allocation and constructed-session duration models is the next highest-value generator correction.
3. Restricted-equipment profiles can fail with `no_suitable_exercise` or `unauthorised_specialist_selection`. These are explicit fail-closed outcomes, but onboarding should prevent offering combinations the catalogue cannot execute.
4. Weak-point priority, adherence trend, and plateau/overperformance evidence are not initial canonical construction inputs. They must not be described as generator sensitivities until an evidence-owned adaptation boundary is implemented.

No supplied PDFs were present in `project_sources/`; none were inspected. No new physiological rule was introduced, so the evidence ledger was not changed. Existing contemporary evidence remains compatible with the retained principles: volume is individual and distributed, heavier loading supports strength specificity, hypertrophy spans loading ranges, and failure proximity is not represented with false scalar precision.

## Verification

- Clean `npm ci`: pass, 661 packages.
- Clean TypeScript: pass.
- New deterministic generator certification: 2/2 pass.
- Focused generator/onboarding suite: 42/43 pass; the single failure is the protected obsolete Home source-string assertion (`primary.exerciseCount`/`primary.workSetCount`) against the current projection names.
- Full Vitest from the source-only clean copy: 2,425/2,456 pass. Apart from the protected obsolete assertion, failures were missing historical QA/native artifact files not transferred into the diagnostic copy, not behavioural regressions.
- Expo public config: pass.
- Expo web export: pass, 1,451 modules.
- iOS simulator build/install/launch: pass; one dependency deployment-target warning.

The certification proves deterministic construction, structural metrics, explicit fail-closed behaviour, and selected hard invariants. It does not prove superior hypertrophy, strength, adherence, or recovery outcomes; those require longitudinal performed-work evidence.
