# Adaptive Strength Coach transformation programme

Status: active authoritative programme
Owner: product and engineering
Last updated: 2026-08-23
Baseline commit: `31be2368aff1cd82c9fe319c2f89b28498775ba4`

## Outcome and operating standard

Adaptive Strength Coach must connect a durable athlete model to an explainable programme, an executable session, recorded performance, a bounded interpretation and the smallest justified future change. No pillar is complete because code exists; it is complete only when its user outcome and compatibility behavior are verified.

Severity is `P0` release-blocking, `P1` high impact, `P2` material improvement, or `P3` polish. Confidence describes confidence in the diagnosis, not confidence in a proposed solution.

## Portfolio

| Pillar | Issue and user impact | Evidence | Sev. | Conf. | Dependencies | Proposed solution | Acceptance criteria and verification | Status |
|---|---|---|---|---|---|---|---|---|
| 1. Data integrity | Account, local-plan and cloud-history authorities have historically diverged; returning users can appear new or see incomplete history. Trust is destroyed if prior work disappears. | Canonical startup hydration, reconciliation, recorded-session ledger and release tests now exist; older journey audit documents the former split authorities. | P0 | High | Auth, local repositories, Supabase restore, migrations | Maintain a single canonical retained-training decision at startup; preserve legacy reads until migration evidence proves deletion safe. | Fresh, upgrade, logout/login, offline restart, partial restore and cross-account fixtures retain correct identity/history; migrations are idempotent; no destructive reset. | In progress; extensive canonical coverage exists, physical-device restore remains required. |
| 1. Data integrity | Workout discard must remove only the active attempt and never completed history or the planned prescription. | Canonical discard transaction, intent repository and failure-injection tests cover crash windows and compensation. | P0 | High | Recorded ledger, active-plan carrier | Keep discard transactional, idempotent and recoverable. | Existing discard suite passes; UI confirmation names consequence; interrupted discard resumes safely. | Implemented in architecture; visual/device confirmation pending. |
| 2. Training science | Legacy progression reporting could add a set from one success and interpret multiple stalls as a reason for more volume. Users could receive workload spikes or junk volume. | `progression-coach.ts`; regression tests added 2026-08-23; evidence ledger E-001/E-002. | P1 | High | Comparable exposure and fatigue evidence | Never change load and sets simultaneously; require established comparable evidence for optional set addition; stalls remain diagnostically inconclusive without recovery and dose context. | Realistic novice/intermediate/advanced histories; no one-exposure set addition; no stall-driven automatic increase; bounded set caps. | Safety patch implemented; confidence-model refinement pending. |
| 2. Training science | Programming authorities are numerous and legacy compatibility can obscure which policy owns a prescription. Incorrect changes become hard to defend. | Canonical authority maps and current programme-policy certifications. | P1 | High | Migration programme | Keep one decision writer per variable; compatibility projections read facts but do not create competing decisions. | Authority test rejects duplicate writers; every production prescription exposes provenance. | In progress. |
| 3. Adaptation | Evidence, decision, confidence, previous/new prescription and later outcome are not uniformly connected across every intervention. Users cannot always understand or evaluate coaching changes. | Current transition-decision and adjustment-record modules cover parts of the loop. | P1 | Medium-high | Canonical ledger and progress UI | Standardize an intervention envelope and outcome review without rewriting historical records. | Each material adaptation is bounded, explainable, reversible where appropriate and linked to later comparable exposures. | Partially implemented. |
| 3. Adaptation | Exercise, local-muscle and systemic fatigue can be conflated. The wrong variable may be reduced. | Existing fatigue classifier and historical audit. | P1 | Medium | Readiness/performance windows | Require fatigue scope and evidence quality before load, volume, rotation or deload changes. | Contradictory-signal fixtures preserve defaults; isolated exercise failure does not deload unrelated work. | Audit required. |
| 4. Workout usability | Active training can present too much context before the next log action. Gym-floor speed and focus suffer. | `docs/product/ux-reset-audit.md`; active-workout screenshots and device QA corpus. | P1 | Medium-high | Visual runtime, canonical logger | One dominant next action; current target, previous comparable performance and rest state visible without navigation; secondary evidence collapses. | Common set logged with minimal taps; small-screen, keyboard and large-text QA; accidental edits reversible. | Visual re-audit pending. |
| 4. Workout usability | Swap reasons such as unavailable equipment, pain/limitation and dislike are not guaranteed to remain distinct from performance failure. Bad substitutions may recur. | Historical full-app audit; exercise preference/intervention modules exist. | P1 | Medium | Preference memory, safety copy | Capture low-friction structured reason; pain stops the movement without diagnosis; temporary constraints expire. | Substitute preserves session intent; reason never contaminates progression; repeated permanent rejection influences future selection. | Audit required. |
| 5. Visual design | Brand history includes Iron Logic and Adaptive Strength Coach, with possible copy/token fragmentation. Inconsistency lowers perceived trust. | Brand-boundary tests, theme tokens, UX audit and screenshot corpus. | P1 | High | Design inventory | One authoritative name, token set, component states and copy voice; migrate complete journeys. | Automated brand boundary plus visual comparison across auth, onboarding, home, train, plan, progress and settings. | Automated coverage exists; visual inventory pending. |
| 6. Progress | Dense evidence can obscure what improved, what changed and what to do next. Motivation becomes analytics work. | Progress dashboard projections and UX audit. | P1 | Medium-high | Intervention envelope | Lead with one meaningful outcome and one next action; disclose supporting evidence progressively. | Users can identify improvement, rationale and next target in one scan; records remain factual. | Audit required. |
| 7. Accessibility | Touch targets, large text, focus order, modal semantics and chart alternatives need journey-level proof. | Component code includes accessibility labels but no consolidated certification was found. | P1 | Medium | Runtime visual audit | Establish accessible primitives and test complete journeys at large text and narrow widths. | WCAG-oriented contrast; 44pt-class targets; screen-reader labels/order; charts have textual equivalents. | Open. |
| 8. Reliability | Vitest config startup deadlocked and TypeScript traversed backup/archive scopes, preventing trustworthy verification feedback. | Reproduced before test collection; esbuild service stopped; config import removal restored 8/8 progression tests. | P1 | High | Node/Vite/esbuild, tsconfig | Keep Vitest config dependency-free; constrain TypeScript to production/test sources while retaining all relevant code. | Focused, full suite and typecheck start deterministically with bounded duration; no orphan processes. | Vitest repaired; TypeScript duration diagnosis ongoing. |
| 8. Reliability | Expo/Metro startup is exceptionally slow on this filesystem, delaying visual QA. | Web QA process sampled in synchronous package-file reads before listening on port 8098. | P2 | High | Local filesystem/node_modules | Measure cold/warm startup; avoid archived/generated traversal; verify dependency installation and Node 22 path. | Web QA serves predictably and can be browser-inspected. | Diagnosing. |
| 9. Measurement | Product quality cannot be inferred from feature count. Adaptations need outcome and friction measures. | No authoritative product measurement scorecard found. | P1 | Medium | Privacy policy, event schema | Define privacy-respecting events for plan continuity, logging friction, adherence, accepted/rejected adaptations and later outcomes. | Every coaching rule has an outcome metric; no sensitive free text; event contracts tested. | Open. |
| 10. Differentiation | Competitors lead in logging speed, programme breadth, human coaching energy or polished adaptive explanations. Copying all features would create clutter. | Competitive benchmark below. | P1 | High | Core pillars | Differentiate through durable longitudinal coaching: conservative start, explicit reasoning, small reversible changes, and visible outcome learning. | Comparative usability and outcome studies show faster logging and more trusted adaptations in target cohorts. | Strategy defined; measurement absent. |

## Competitive benchmark - August 2026

This is a product-evidence benchmark, not a claim that every feature was independently exercised. Official product/help/pricing pages are preferred; current community evidence is used only to identify complaints or expectations.

| Product | Demonstrated strength | Material gap/opportunity for ASC |
|---|---|---|
| Hevy | Very fast logger, previous-performance memory, polished social/progress layer, broad free utility. | Match gym-floor speed without turning coaching into a social feed; make future changes more defensible than a tracker alone. |
| Strong | Category expectation for simple routines, timer, history and low-friction set logging. | Preserve simplicity while adding longitudinal prescription reasoning. |
| Boostcamp | Huge free coach/community programme library, RPE/RIR, supersets, alternatives, PR/e1RM and weekly reports. | ASC should win on coherent individual continuity and outcome-evaluated adaptation, not programme count. |
| Fitbod | Goal, duration, equipment and recovery-informed generated workouts; active investment in explanations and injury-aware behavior. | Avoid opaque daily regeneration; preserve recognizable programme intent and show exact evidence for small changes. |
| RP Hypertrophy | Explicit hypertrophy progression, feedback-driven set/RIR management and strong coaching brand at premium pricing. | Offer broader strength/powerbuilding paths and reduce feedback burden while keeping dose decisions transparent. |
| JuggernautAI | Individualized powerlifting/powerbuilding structure, feedback adjustment and deep technique education. | Provide faster general-gym UX and hypertrophy breadth while retaining block continuity. |
| EvolveAI | Strength-focused adaptive positioning and readiness/biomarker language. | Be more cautious about noisy readiness data and prove which signals improve decisions. |
| Alpha Progression | Precise set targets, equipment/schedule plan generation, charts, deloads, warm-up/plate tools and exercise evaluation. | Connect recommendations to later outcomes and make confidence/uncertainty visible. |
| Ladder | High enjoyment through human coach voice, video and pacing; strong plan matching. | Deliver motivation through a responsive digital coach without requiring audio-led sessions or weekly content dependence. |
| JEFIT / similar trackers | Broad library, routines and mature logging expectations. | Win with restraint, clarity and coaching quality rather than database breadth or dashboard density. |

Best-in-class target by category:

- First run: explain the promise, capture only decisions that materially change the first week, and let evidence accumulate.
- Programme creation: recognizable Full Body, Upper/Lower or PPL preference with transparent goal/constraint morphing.
- Logging: current target, previous comparable result, rest and next action in one visual field.
- Adaptation: smallest bounded variable, confidence shown, no unrelated regeneration.
- Substitution: preserve movement/session intent and separate constraint reasons from performance.
- Progress: one meaningful win, one constraint and one next action before charts.
- Pricing quality: premium requires reliability, continuity and explanation—not merely locked analytics.

## Near-term ordered delivery

1. Finish deterministic verification and full-suite baseline.
2. Certify returning-user identity/history and discard/resume on current canonical paths.
3. Replace provisional volume threshold with an explicit evidence-confidence decision boundary connected to canonical weekly-dose context.
4. Visually inspect and simplify the active set-logging vertical slice.
5. Standardize the persisted adaptation envelope and expose one clear explanation in completion/progress.
6. Add outcome measurement for accepted adaptations before expanding training-method variety.

## Visual inventory inspected in this run

Live Metro was attempted with `npm run web:qa` on the repository-mandated Node 22 path. After more than five minutes it had not opened port 8098 and sampling showed synchronous package-file reads, so it was terminated. The Playwright wrapper likewise stalled in `npm exec` before a browser session was created. The following existing rendered evidence was therefore inspected and is not represented as a current live build certification:

- Home with an active plan.
- Onboarding final summary.
- Plan roadmap.
- Settings/subscription.
- Active exercise: first work set, unknown load and shutdown.
- Post-workout review with a PR.

Inventory observations:

| Element | Current evidence | Direction |
|---|---|---|
| Colour | Near-black canvas, blue-black raised surfaces, warm gold action/brand, green completion and amber warning. Strong contrast and a distinctive restrained palette. | Preserve roles; remove ad hoc borders/tones and ensure semantic colors are not the sole status cue. |
| Typography | Heavy, confident headings and highly legible numeric targets. Some headings consume disproportionate vertical space. | Keep numeric authority; reduce redundant display-size copy in active logging and shutdown states. |
| Spacing/surfaces | Generous cards and padding feel premium but make the primary log action fall below the first viewport in the active-set evidence. | Compress chrome and secondary controls during an active set; keep rest-state screens calmer. |
| Navigation | Five-tab shell is recognizable; active state is clear. Persistent bottom navigation competes with and can visually crowd long workout content. | Prove safe-area and keyboard behavior; consider workout-focus treatment without creating a navigation dead end. |
| Inputs | Large load and rep controls are gym-friendly; unknown-load state clearly blocks invalid logging. | Preserve quick presets and minimum targets; make the dominant `Log work set` action visible without hunting. |
| Coaching states | Shutdown is unmistakable but repeats “complete”, “next time” and the same load across several blocks. | One verdict, one rationale, one next action; disclose deeper evidence below. |
| Completion | PR/completion coloring is rewarding without confetti. An inspected QA image displays `468 min`, which must be treated as a fixture/runtime anomaly until reproduced. | Validate duration derivation and clamp/flag impossible summaries; never celebrate corrupted metrics. |
| Developer chrome | Design-QA banner is useful; debugger/RevenueCat warnings obscure lower content in several captured screens. | Production builds must prove development overlays are absent; visual certification should capture clean frames. |

No light theme is currently evidenced. Dark-only is acceptable if intentional, accessible and stated; it should not be described as dual-theme support.

## Change-control rules

- Never delete compatibility reads until migration fixtures prove every legitimate historical form survives.
- Never infer that hidden UI data was deleted.
- Never change more than the smallest justified prescription variable from one noisy exposure.
- Never ship an advanced method without eligibility, purpose, contraindications, fatigue cost, logging, progression, fallback and misuse tests.
- Each completed slice requires targeted tests, typecheck, relevant build/visual validation and a reviewable commit containing no pre-existing user work.
