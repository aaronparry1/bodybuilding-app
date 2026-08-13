# Adaptive Strength Coach — implementation-ready north star

## Approved product decisions

Aaron approved this direction for production implementation with these decisions:

1. Calm-precision identity, with selective editorial athlete imagery outside active training.
2. App-entered and training-derived readiness initially; architecture must allow optional Apple Health context later without making it an authority today.
3. Premium static technique sequences initially, followed by owned demonstrations.
4. Private device-generated sharing initially.
5. Product-authored programme identities with athlete-specific subtitles.
6. Exceptional dark mode first, built from semantic roles that support a later light mode.

The prototype source and approved screenshots stored beside this document are the reproducible visual authority for Stage 1. Prototype athlete data is illustrative and must never be treated as a production prescription or persisted product claim.

## Product promise

The programme quality of an elite coach, the adaptability of a living system, and a training experience athletes genuinely want to open.

The product is not a workout generator with analytics attached. It is a continuous coaching relationship. Every prescription has a reason, every meaningful change produces a receipt, every gym disruption can be handled without corrupting programme intent, and every completed session advances a visible longer-term story.

## Athlete journey

1. **Enter immediately.** Local programme, active workout, recent history and today's objective render without waiting for remote restoration. Account checks continue in the background.
2. **Understand today.** Today presents one objective, one primary action, session duration, block position and the small number of signals that changed—or confirmed—the prescription.
3. **Trust the decision.** A coaching receipt shows why the session was held, increased, reduced or modified. The athlete can correct readiness context without completing a repetitive questionnaire.
4. **Preview the route.** The whole session, methods, duration and equipment dependencies are scannable. Modification is available before starting.
5. **Prepare exactly.** General preparation and lift-specific ramps are separated from work volume. Loads, reps, intent and stop rules are explicit.
6. **Execute quickly.** Active training prioritises the current exercise, current set, previous comparable result and immediate action. One-handed logging is the default.
7. **Receive coaching at the moment of consequence.** Interventions appear only when evidence changes the best next action. They explain the signal, recommendation and trade-off.
8. **Handle gym reality.** Substitutions preserve intent; added/removed work requires a reason and stays within authorised policy. Pausing, correcting and resuming never threatens completed evidence.
9. **Finish with meaning.** Completion distinguishes genuine PRs from noise, shows what changed in the programme and sets the next objective.
10. **See continuity.** Progress explains response patterns across weeks and blocks, not only charts. The next block decision is previewed before it happens.

## Benchmark contract

| Dimension | JuggernautAI benchmark | STNDRD benchmark | Target advantage |
|---|---|---|---|
| Adaptive programme | Visible readiness and periodisation | Structured authored programmes | Every adaptation carries a concise evidence receipt and reversible scope |
| Programme desire | Coaching-system credibility | Coach identity, presentation and aspiration | Original programme identities built from athlete goal, block intent and earned trajectory |
| Exercise experience | Prescription-led | High-quality demos and cues | Media plus load history, intent, method rules and context-specific coaching |
| Logging | Functional programme execution | Sets, reps, load and rest in one flow | One-handed fast entry, comparable evidence, correction/deletion and live intervention |
| Gym disruption | Variable exercise choice | Exercise modification | Intent-preserving substitution ranked by compatibility with reason capture |
| Progress | Programme adaptation | Progress and community motivation | Verified outcomes, response-pattern explanations and next-decision previews |
| Reliability | Cloud coaching product | Content/service product | Immediate local-first entry, background reconciliation and truthful recovery |
| Trust | Expert programming brand | Champion-led programme brand | Explainable decisions, data provenance, privacy and no invented certainty |

## Capability contract

Legend: **supported** means current authoritative data is sufficient; **partial** means reusable foundations exist; **new** means a product/technical contract is required.

| Capability | Data support | Reuse | Required work |
|---|---|---|---|
| Immediate local-first entry | Partial | Canonical local plan, ledger and history | Decouple protected navigation from cloud restore; deadlines and staged reconciliation |
| Programme/block/session context | Supported | Canonical plan/read models | New trajectory projection and programme presentation |
| Readiness without questionnaire fatigue | Partial | Recovery/settings and session-prep concepts | Passive signal policy, correction UI and reasoned decision output |
| Coaching receipts | Partial | Reason codes, provenance and evidence repositories | Stable customer-facing receipt schema and persistence |
| Full-session awareness | Supported | Prescription snapshot | Active-session overview/switcher projection |
| Warm-ups and work sets | Supported | Set types, load display and calibration policy | First-class execution UI and ledger events for ramps |
| Previous comparable performance | Supported | Canonical history/evidence | Compatibility matching and compact projection |
| Fast log/edit/delete | Partial | Record/edit commands | Authoritative deletion/correction command and optimistic interaction layer |
| Contextual substitutions | Partial | Substitution identity and programme management | Compatibility ranking, reason capture and in-session command |
| Add/remove work | Partial | Session structure and completion evidence | Explicit authorised policies, limits, provenance and commands |
| Early exercise/workout completion | Partial | Early workout completion | Exercise-level evidence/reason contract |
| Performance interventions | Partial | Load-drop and target evidence | Real-time intervention coordinator and customer-facing confidence rules |
| Supersets/trisets | Partial | Ordered slots/method metadata | Group/round execution model, navigation and rest ownership |
| Rest-pause/clusters/AMRAP | Partial | Method policy and performed-work events | Method-specific state machines and logging controls |
| Exercise technique/intent/media | Partial | Exercise records and textual guidance | Licensed/owned media pipeline, cue schema and offline media strategy |
| Rest timing and pacing | Supported | Canonical rest timer | Immersive persistence, notification/background behavior and pacing projection |
| Genuine PRs | Supported | Progress evidence and completion projections | Strict verification taxonomy and expressive presentation |
| Block/macrocycle continuity | Partial | Plan/block data | Macrocycle projection, response summaries and next-decision preview |
| Private sharing | Partial | Completion facts | Privacy-first share artifact, explicit field selection and no default public feed |
| Offline/error/recovery | Partial | Local repositories and recovery boundaries | Usable shell, queued sync, conflict UX, timeouts and recovery details |
| Accessibility | Partial | Labels, dynamic type work, reduced motion | End-to-end screen-reader order, 200% text, switch control and contrast certification |
| Privacy | Partial | Account ownership boundaries | Data inventory, local/cloud explanations, export/delete and receipt provenance |

## Navigation architecture

- **Today:** immediate objective, readiness decision, next session, active-workout resume and coach note.
- **Programme:** programme identity, current block, weekly route, upcoming training, adaptations and management.
- **Train:** preview → preparation → active execution → intervention/modification → completion.
- **Progress:** verified outcomes, history, exercise trends, coach insights and long-term decisions.
- **Profile/Settings:** account, units, equipment, accessibility, coaching preferences, privacy, recovery details and programme controls.

Active training becomes an immersive sub-navigation. Global tabs are removed while a workout is open; minimise returns safely to Today.

## Screen blueprint rules

### Today

- Information: today's objective, duration, block/week position, readiness result, coaching receipt, next session.
- Primary action: start or resume.
- States: rest, train, active, completed, deload, offline, restoration in background.
- Transition: Start opens preview; Resume opens exact active position.

### Programme

- Information: programme identity, goal, block intent, week progress, emphasis, adherence/outcomes, phase timeline.
- Actions: inspect week/session, understand adaptation, manage equipment/schedule, restart only through a guarded flow.
- States: active, transition week, deload, reconstructed, awaiting decision.

### Preview and preparation

- Information: decision, evidence receipt, duration, work-set count, methods, exercises and constraints.
- Actions: begin warm-up, correct readiness context, modify session.
- Transition: warm-up starts a resumable recorded attempt.

### Active workout

- Information: current exercise/set, exact target, previous comparable evidence, method intent, rest and session position.
- Actions: log, edit, delete, technique, substitute, add/remove authorised work, minimise, finish early/discard.
- States: ramp, work, rest, paused, intervention, conflict, offline queued, save confirmed.

### Completion

- Information: verified outcomes, meaningful deltas, programme changes, next objective and recovery context.
- Actions: progress, private share, correction within a controlled window.

### Recovery states

- Restoring: local data usable; background stage and safety promise visible.
- Offline: exact locally available capabilities stated; queued work identified.
- Error: data-preservation truth, retry, local continuation and technical reference.

## Visual and interaction system

- **Character:** disciplined, intelligent, calm under load. Precision without clinical sterility.
- **Typography:** neutral grotesk for commands and athlete-facing hierarchy; tabular mono only for loads, reps, time and provenance. Minimum 16px body equivalent in production native UI.
- **Colour roles:** near-black neutral base; bone-white information; electric chartreuse only for current action/confirmed progression; mint for completed/healthy; amber for attention; coral for material risk; violet for advanced-method grouping.
- **Surfaces:** default canvas is flat. A surface exists only for a decision boundary, interactive group or comparison—not every paragraph.
- **Spacing:** 4px base; 8/12 internal control rhythm; 20/24 section rhythm; density increases during active training without shrinking touch targets.
- **Iconography:** simple rounded geometry with consistent stroke. Never use novelty bodybuilding symbols.
- **Media:** owned demonstrations with a stable poster frame, silent-loop preview, captions, target area and two or three high-value cues. Download on demand with explicit offline state.
- **Data visualisation:** trajectories, evidence ranges and phase arcs; avoid decorative donut charts and unexplained scores.
- **Motion:** 160–240ms transitions; progress changes explain cause/effect; completion may use one restrained earned flourish. Reduced-motion parity is mandatory.
- **Haptics:** confirmation for set completion, differentiated rest completion and warning only for a material intervention.
- **Feedback:** optimistic local completion with explicit queued/saved state. Destructive actions state exactly what is preserved.
- **Light/dark:** dark is the primary training environment. Light mode follows semantic roles rather than colour inversion and is required before category-complete release.
- **Accessibility:** 44×44pt targets, 200% text without loss of action, meaningful reading order, non-colour state cues, captions/transcripts, VoiceOver announcements that do not interrupt set entry.

### Anti-card-and-prose rules

1. One dominant decision per viewport.
2. No more than one containing surface nested inside another.
3. Coaching copy must answer **what**, **why**, or **next**; if it answers none, remove it.
4. Repeated metadata becomes a compact rail, not another card.
5. Progressive disclosure is reserved for evidence and technique depth, never for the primary action.
6. Scores require a label, direction and consequence.

## Current-to-target gap map

| Current strength | Target use | Material gap |
|---|---|---|
| Canonical local plan and ledger | Immediate entry and continuity | Protected shell still waits on unbounded restore |
| Strong lifecycle commands | Safe active training | Interaction is synchronous, dense and missing some correction controls |
| Prescription/evidence models | Visible coach decisions | Intelligence is mostly prose or hidden projection logic |
| Rest timer | Immersive pacing | Needs background/native notification behavior and stronger hierarchy |
| Programme dashboard | Long-term trajectory | Generic identity and weak block/macrocycle desirability |
| Completion projection | Earned payoff | PR and programme-change story is visually underpowered |
| Programme management | Gym disruption | Modification is detached from live context and intent ranking |
| Recovery/error safeguards | Trust | Waiting state blocks the app and does not explain recovery truthfully |

## Implementation sequence

1. **Reliable entry + Today:** local-first shell, staged restoration, Today objective, resume, coaching receipt foundation.
2. **Programme + block:** programme identity, phase timeline, upcoming sessions, trajectory and adaptation history.
3. **Preview + preparation:** readiness decision, receipt, session route, warm-up/ramp execution and safe start.
4. **Active training + live coaching:** fast set interaction, edit/delete, comparable evidence, rest, advanced methods, intervention and contextual substitution.
5. **Completion + progression:** verified PR taxonomy, changes applied, next objective, private share.
6. **History + insights:** response-pattern coaching, long-term outcomes, macrocycle continuity and next-block preview.
7. **Integration + native validation:** offline/conflict matrix, performance budgets, real-device accessibility, memory/hang telemetry and release regression.

Each stage ships as a complete athlete journey with instrumentation and migration compatibility; no stage is defined by current component ownership.

## Acceptance criteria

### Functionality

- An athlete can start, modify, complete, correct and resume a workout without losing performed evidence.
- Every adaptation and intervention exposes reason, evidence scope, action and consequence.
- Warm-ups never count as work; advanced methods execute according to their own authorised state model.
- Substitutions preserve intent or explicitly disclose the compromise.

### Reliability and performance

- Local Today renders without waiting for cloud when safe local data exists.
- No indefinite loading state; every remote stage has a deadline and recovery path.
- Cold launch to locally interactive Today: target ≤1.5s p50 / ≤3s p95 on the supported-device floor.
- Set completion acknowledgement: ≤100ms local visual response; durable local write before navigation.
- Active-workout recovery survives process death, offline use, backgrounding and account restoration.
- Production telemetry distinguishes auth, hydration, remote retrieval, reconciliation, render and first interaction.

### Visual quality

- Every key state has one unambiguous primary action and survives long names/large values.
- Programme, active training and completion are recognisably distinct athlete moments within one system.
- No viewport becomes a stack of interchangeable bordered paragraphs.
- Visual comparison at 390×844 and compact representative dimensions passes truncation, keyboard, safe-area and overlay review.

### Accessibility

- WCAG AA semantic contrast; critical state never communicated by colour alone.
- Full operation with VoiceOver, Switch Control, reduced motion and 200% text.
- Minimum 44×44pt targets and logical focus restoration after sheets/modal transitions.
- Exercise media has captions, transcript and equivalent textual instruction.

## Decision status

The six product-preference questions in the original vision are resolved by the approved decisions at the top of this document. Reliability, evidence integrity, accessibility and local-first recovery remain non-optional constraints.
