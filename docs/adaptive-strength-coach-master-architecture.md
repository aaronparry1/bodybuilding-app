# Adaptive Strength Coach Master Architecture

Status: Living production architecture spec.

Purpose: prevent future drift, duplication, and invented coaching logic.

Every future adaptive feature must be added here before implementation.

## Global Architecture Rules

1. Codex must not invent coaching logic outside the appropriate engine or policy.
2. Workout Builder must assemble outputs, not make coaching decisions.
3. Only Coaching Decision Resolver emits final programme-changing decisions.
4. Only Coaching Evidence Engine updates learned athlete traits.
5. Living Athlete Model stores athlete truth but never makes decisions.
6. Every workout element must trace back to a coaching decision.
7. Every engine must return reason codes where applicable.
8. Safety, pain, and recovery vetoes must be respected.
9. Lower-level policies must not directly mutate programme state.
10. Future features must be added to this document before implementation.

## Ownership Map

| Decision | Engine / Policy | Owns | Does Not Own |
| --- | --- | --- | --- |
| 8D | Adaptive Training State Architecture | Internal training state review | Session PRs, workout generation |
| 8E | Adaptation Detection Engine | Adaptation status from evidence | Interventions or programme mutation |
| 8F | Intervention Decision Engine | Smallest justified action type | Exact exercise/method selection |
| 8G | Exercise Rotation & Variation Policy | Replacement choice after rotation selected | Deciding rotation is needed |
| 8H | Method Selection Engine | Training method choice | Loading/progression application |
| 8I | Loading & Progression Policy | Method-aware load, reps, sets, progression rules | Adaptation detection or interventions |
| 8J | Recovery Management Engine | Recovery status, vetoes, recovery bias | Programme mutation |
| 8K | Coaching Decision Resolver | Final programme-changing action | Evidence validation or athlete truth |
| 9A | Warm-up Policy | General/specific warm-up plans | Progression, methods, state transitions |
| 9B | Session Composition Policy | Session objective layers | Exercise/method/load selection |
| 9C | Training Resource Allocation Policy | Resource/set budget by layer | Exercise selection or recovery status |
| 9D | Support Function Policy | Support functions needed | Exercise matching |
| 9E | Exercise Matching Engine | Ranked exercises for support functions | Whether to rotate |
| 9F | Recovery Between Efforts Policy | Recovery objectives between efforts | Session density or pairing |
| 9G | Session Density Policy | Density and exercise organisation | Rest interval logic |
| 9H | Energy System Development Policy | Conditioning objective and placement | Modality selection |
| 9I | Living Athlete Model | Athlete truth | Coaching decisions |
| 9J | Coaching Evidence Engine | Validated learning pipeline | Coaching decisions |
| 10A | Live Workout Coaching Engine | Active-session execution adjustments | Programme mutation or learning |
| 10B | Live Constraint Resolution Engine | Smallest live constraint solution | Permanent programme changes |
| 10C | Live Safety & Pain Policy | Live safety gate | Diagnosis or programming |
| 10D | Quality of Execution Engine | Evidence quality and learning weight | Technique judgement or progression |
| 10E | Productive Training Exposure Policy | Active-session productivity | Future programming |
| 10F | Post-Workout Review Flow | Minimal useful review questions | Athlete model updates |
| 10G | Runtime Architecture | Offline/event/runtime boundaries | Coaching content |
| 10H | Session PR Opportunity Policy | Existing-session PR opportunity | Programming changes |
| 11A | Goal Translation Engine | Coach-facing objectives | Workout generation |
| 12C | Development Track Learning Engine | Goal-level controlled coaching hypotheses | Exercise-specific selection, athlete truth, programme mutation |
| 12A | ResolvedWorkoutIntent / CoachingPacket Contract | Single builder input contract | Coaching decisions |
| 12B | CoachingPacket Production Pipeline | Validated end-to-end packet orchestration | Coaching logic or legacy fallback repair |
| 12C | Builder Purge / Legacy Decision Quarantine | Builder/session-builder enforcement boundary | Exercise, rep, load, volume, warm-up, rest, density, conditioning, or substitution decisions |
| 12D | End-to-End Coaching Loop Smoke Test | Production-loop verification gate | New coaching logic |
| 13A | First Shippable Coaching Loop | Workout completion learning loop | New coaching engines or live coaching expansion |

## Decision Details

### 8D: Adaptive Training State Architecture

Purpose: replace rigid fixed-duration blocks with evidence-based internal training states.

Responsibility: classify and govern the athlete's current internal state: Foundation, Accumulation, Intensification, Realisation, or Pivot.

Inputs: performance trend, progression velocity, fatigue/recovery signal, completion quality, recent training continuity, exposure weeks/sessions, confidence.

Outputs: current state, review status, exposure rule, confidence, reason codes.

Allowed to decide: whether state continuation, review, escalation, or fallback is required.

Not allowed to decide: exercise selection, rep/load/set prescriptions, session PR recognition, workout generation, user-facing progress celebration.

Upstream dependencies: Living Athlete Model, Adaptation Detection, Recovery Management, Coaching Evidence outputs where available.

Downstream consumers: Intervention Decision Engine, Coaching Decision Resolver, Method Selection, Loading & Progression, Session Composition, Energy System Development.

Conflict rules: minimum exposure prevents flip-flopping; maximum exposure forces review/escalation; safety and recovery vetoes still outrank state ambition.

Regression protections: `tests/adaptive-training-state.test.ts`; master architecture boundary test.

### 8E: Adaptation Detection Engine

Purpose: determine whether current training stimulus is still producing adaptation.

Responsibility: classify adaptation at exercise, movement-pattern, and programme/system level.

Inputs: best set trend, estimated 1RM trend, rep trend, load trend, completed vs planned work, failed set frequency, session difficulty, recovery signals, missed sessions, pain flags, exposure count, pattern/system trends.

Outputs: adaptation level, status, confidence, reason codes, future-engine feed list.

Allowed to decide: adaptation status such as adapting, slowing, plateaued, saturated, regressing, or insufficient evidence.

Not allowed to decide: progression changes, rotations, methods, deloads, state transitions, programme mutation.

Upstream dependencies: Living Athlete Model, Coaching Evidence Engine summaries.

Downstream consumers: Recovery Management, Intervention Decision, Coaching Decision Resolver, Exercise Rotation, Method Selection, Loading & Progression.

Conflict rules: one poor session is noise unless pain/recovery warnings are strong; poor performance plus poor recovery routes as recovery issue; multi-pattern decline is system-level evidence.

Regression protections: `tests/adaptation-detection-engine.test.ts`; no "completed workout = progress" regression.

### 8F: Intervention Decision Engine

Purpose: select the smallest justified coaching action.

Responsibility: convert adaptation and recovery signals into an intervention type and scope.

Inputs: adaptation status/confidence/reasons, exercise/pattern/system statuses, fatigue/recovery flags, pain flags, missed sessions, training state, exposure count, intervention history, recovery assessment.

Outputs: selected intervention, scope, confidence, reason codes, action payload, cooldown, review window.

Allowed to decide: no change, gather evidence, progression/volume/intensity/rep/method adjustment, rotation, pattern adjustment, state transition, deload, pivot.

Not allowed to decide: exact replacement exercise, exact method structure, exact load prescription, direct programme mutation.

Upstream dependencies: Adaptation Detection, Recovery Management, Adaptive Training State, Living Athlete Model.

Downstream consumers: Coaching Decision Resolver, Exercise Rotation, Method Selection, Loading & Progression, Resource Allocation.

Conflict rules: smallest effective intervention first; evidence insufficiency returns gather_more_evidence; cooldowns prevent flip-flopping; repeated failed interventions escalate.

Regression protections: `tests/intervention-decision-engine.test.ts`.

### 8G: Exercise Rotation & Variation Policy

Purpose: choose the right replacement once rotation is selected.

Responsibility: preserve training intent while changing stimulus enough to restore adaptation, reduce pain, or address a limiting factor.

Inputs: current exercise, movement pattern, target region, training state, method, intervention reasons, adaptation status, exposure count, history, fatigue/recovery, pain flags, equipment, experience, preferences, exercise metadata.

Outputs: selected replacement, rejected candidates, rotation scope, confidence, reason codes, loading adjustment, review window, cooldown.

Allowed to decide: smallest meaningful variation or broader replacement when justified.

Not allowed to decide: whether rotation is needed, programme-level changes, arbitrary variety.

Upstream dependencies: Intervention Decision, Adaptation Detection, Recovery Management, Living Athlete Model, Exercise Matching metadata.

Downstream consumers: Coaching Decision Resolver, Workout Builder through resolved decision.

Conflict rules: preserve movement pattern and intent by default; pain/safety can justify larger change; main lifts keep transfer unless safety requires otherwise.

Regression protections: `tests/exercise-rotation-policy.test.ts`; no random swapping.

### 8H: Method Selection Engine

Purpose: change training structure when preserving the exercise is better than rotating.

Responsibility: choose a method such as straight sets, top set/backoffs, 5/3/1, wave loading, clusters, density sets, or restoration-compatible methods.

Inputs: training state, exercise, movement pattern, adaptation status, intervention decision, fatigue/recovery, pain flags, exposure history, experience, equipment, goal priority, performance trend, progression model.

Outputs: selected method, scope, confidence, reason codes, rejected methods, loading guidance, set/rep structure, progression model, review and cooldown.

Allowed to decide: method selection or method assignment.

Not allowed to decide: exercise rotation need, exact final loading, programme mutation, cosmetic variety.

Upstream dependencies: Intervention Decision, Adaptive Training State, Adaptation Detection, Recovery Management, Living Athlete Model.

Downstream consumers: Loading & Progression, Warm-up Policy, Session Composition, Resource Allocation, Density Policy.

Conflict rules: no advanced/high-risk methods for beginners; no high neural demand under poor recovery; no repeated failed method during cooldown.

Regression protections: `tests/method-selection-engine.test.ts`.

### 8I: Loading & Progression Policy

Purpose: turn a selected method into safe, practical loading and progression rules.

Responsibility: prescribe load, sets, reps/ranges, effort cap, backoffs, progression target, next-session rule.

Inputs: selected method, exercise, pattern, training state, estimated ability/training max, recent trends, completion quality, failed sets, fatigue/recovery, pain flags, experience, equipment increments, intervention history.

Outputs: prescribed load, sets, reps/range, effort cap, backoff loads, progression target, next-session rule, confidence, reason codes, safety flags, review window.

Allowed to decide: method-aware loading and progression targets.

Not allowed to decide: adaptation status, intervention type, exercise/method selection, PR recognition.

Upstream dependencies: Method Selection, Intervention Decision, Adaptation Detection, Recovery Management, Living Athlete Model.

Downstream consumers: Coaching Decision Resolver, Workout Builder through resolved decision.

Conflict rules: use training max/estimated ability; progress only when readiness demonstrated; hold mixed evidence; reduce when performance drops with poor recovery.

Regression protections: `tests/loading-progression-policy.test.ts`; no "completed workout = add weight" regression.

### 8J: Recovery Management Engine

Purpose: determine whether recovery is supporting or limiting adaptation.

Responsibility: assess recovery status, limiting recovery dimensions, recovery bias, and veto flags.

Inputs: recent performance, Adaptation Detection, fatigue/recovery signals, failed sets, missed sessions, subjective context where available, pain flags, density, method/exercise fatigue cost, systemic trend, training state, intervention history.

Outputs: recovery status, confidence, limiting factors, reason codes, recommended recovery bias, veto flags.

Allowed to decide: advisory recovery status and recovery-biased recommendations/vetoes.

Not allowed to decide: deload, pivot, state transitions, method/exercise changes, programme mutation.

Upstream dependencies: Adaptation Detection, Living Athlete Model, Coaching Evidence Engine.

Downstream consumers: Intervention Decision, Coaching Decision Resolver, Resource Allocation, Energy System Development.

Conflict rules: bad performance plus poor recovery is recovery-first; good performance despite fatigue is monitor; deload is last resort via 8F/8K.

Regression protections: `tests/recovery-management-engine.test.ts`; advisory-only boundary.

### 8K: Coaching Decision Resolver

Purpose: resolve competing engine outputs into one final coaching action.

Responsibility: enforce authority hierarchy and emit the only final programme-changing decision.

Inputs: state output, adaptation output, recovery output, intervention output, loading/progression, method selection, rotation, cycle context, exposure rules, cooldowns, safety flags, missed sessions, confidence/reasons.

Outputs: final coaching action, scope, final payload, accepted/rejected signals, confidence, reason codes, review window, cooldowns, safety flags.

Allowed to decide: the final resolved coaching action sent to programme/workout mutation.

Not allowed to decide: raw evidence validation, athlete truth updates, low-level candidate generation.

Upstream dependencies: 8D-8J plus 8G/8H/8I as available.

Downstream consumers: Future Workout Builder and programme mutation layer.

Conflict rules: safety first; critical recovery second; low-confidence conflicts gather evidence; cooldowns prevent flip-flop; repeated failed interventions escalate.

Regression protections: `tests/coaching-decision-resolver.test.ts`; master architecture boundary test.

### 9A: Warm-up Policy

Purpose: create warm-ups from researched coaching rules.

Responsibility: general warm-up and exercise-specific ramp-up planning.

Inputs: workout goal, training state, method, exercise, movement pattern, order, working load, rep target, complexity, experience, pain/recovery status, time, equipment, previous response.

Outputs: general warm-up plan, specific warm-up sets, duration estimate, fatigue cost, reason codes, safety flags, compressed option, builder notes.

Allowed to decide: warm-up/ramp-up structure.

Not allowed to decide: progression, method, exercise selection, state transitions, working volume.

Upstream dependencies: Method Selection, Loading & Progression, Recovery Management, Living Athlete Model.

Downstream consumers: Workout Builder; Coaching Decision Resolver if safe warm-up cannot fit.

Conflict rules: warm-up sets do not count as working volume; heavy/high-skill work needs adequate ramping; time constraints can raise safety flags.

Regression protections: `tests/warm-up-policy.test.ts`.

### 9B: Session Composition Policy

Purpose: compose workouts around one primary objective.

Responsibility: arrange work into Mission Critical, Primary Support, Weakness Development, Structural Balance, Recovery/Mobility/Optional layers.

Inputs: objective, training state, method, selected exercises, loading prescription, recovery, interventions, movement priorities, time, equipment, experience, pain flags.

Outputs: session objective, composed layers, exercise priorities, estimated duration, removable layers, compression strategy, structural balance score, reason codes.

Allowed to decide: session hierarchy and compression order.

Not allowed to decide: exercise selection, methods, load, progression, recovery interventions.

Upstream dependencies: Intervention Decision, Method Selection, Exercise Matching, Loading & Progression, Recovery Management.

Downstream consumers: Training Resource Allocation, Session Density, Workout Builder.

Conflict rules: one objective per workout; lower layers support higher layers; remove low-priority layers before mission-critical work.

Regression protections: `tests/session-composition-policy.test.ts`.

### 9C: Training Resource Allocation Policy

Purpose: allocate recoverable work by priority rather than fixed templates.

Responsibility: distribute set/resource budgets across session layers.

Inputs: objective, composed layers, training state, method, exercises, adaptation, recovery, intervention, weakness priorities, movement priorities, experience, time, pain flags, recent volume/fatigue, exercise/method fatigue.

Outputs: allocation by layer, set budget by layer, target work sets by exercise, volume adjustments, removed/reduced layers, recovery/time cost estimates, reason codes, safety flags, review window.

Allowed to decide: resource and set allocation.

Not allowed to decide: exercise selection, methods, progression, recovery status, state transitions.

Upstream dependencies: Session Composition, Adaptation Detection, Recovery Management, Intervention Decision.

Downstream consumers: Session Density, Set Allocation, Workout Builder.

Conflict rules: fund mission-critical work first; reduce lower layers under time/recovery pressure; no automatic volume increase without adaptation/recovery justification.

Regression protections: `tests/training-resource-allocation-policy.test.ts`.

### 9D: Support Function Policy

Purpose: choose coaching support functions before exercises.

Responsibility: define required support functions such as movement support, weak-point development, structural balance, joint health, recovery.

Inputs: session objective, interventions, adaptation, recovery, movement priorities, weakness priorities, structural balance needs, pain flags, experience, equipment.

Outputs: required support functions, priority order, confidence, reason codes.

Allowed to decide: what coaching functions are needed.

Not allowed to decide: exercises, loads, sets, methods.

Upstream dependencies: Session Composition, Intervention Decision, Adaptation Detection, Recovery Management.

Downstream consumers: Exercise Matching Engine, Resource Allocation.

Conflict rules: every support function must support objective; weakness functions need evidence; avoid redundant functions; respect recovery budget.

Regression protections: `tests/support-function-policy.test.ts`.

### 9E: Exercise Matching Engine

Purpose: convert support functions into ranked exercise candidates.

Responsibility: score exercises by function match, transfer, safety, recovery fit, equipment, experience, method/state fit, measurability, loadability, exposure, personal response, preference.

Inputs: required support functions, objective, training state, method, movement pattern, intervention reasons, adaptation, recovery, pain flags, experience, equipment, preferences, history, metadata.

Outputs: ranked candidates, default selected candidate, scores, rejected candidates, fulfilled/unfulfilled functions, confidence, reason codes, safety flags, substitution chain, review window.

Allowed to decide: ranked exercise candidates for required functions.

Not allowed to decide: whether rotation is needed, random exercise choice, programme mutation.

Upstream dependencies: Support Function Policy, Living Athlete Model, Coaching Evidence, Exercise Rotation where applicable.

Downstream consumers: Session Composition, Workout Builder through resolved decisions.

Conflict rules: equipment and pain filter candidates; mission-critical favours high-transfer measurable/loadable choices; recovery-compromised scenarios favour lower fatigue.

Regression protections: `tests/exercise-matching-engine.test.ts`.

### 9F: Recovery Between Efforts Policy

Purpose: determine recovery required between efforts.

Responsibility: prescribe recovery objective, dimensions, practical rest range, and strategy.

Inputs: objective, state, method, exercise, pattern, loading, recovery status, adaptation, interventions, time, complexity, order, experience, pain flags.

Outputs: recovery objective, prioritised dimensions, suggested rest range, recovery strategy, expected density impact, reason codes, safety flags.

Allowed to decide: recovery between efforts.

Not allowed to decide: session density, supersets, exercise pairing, workout compression, programme changes.

Upstream dependencies: Method Selection, Loading & Progression, Recovery Management.

Downstream consumers: Session Density, Workout Builder.

Conflict rules: heavy/high-skill work protects neural/technical recovery; time cannot silently compress unsafe rest.

Regression protections: `tests/recovery-between-efforts-policy.test.ts`.

### 9G: Session Density Policy

Purpose: control work per unit of time without confusing density with rest intervals.

Responsibility: session density level, density strategy, exercise organisation and pairing plan.

Inputs: objective, state, method, composed layers, resource allocation, Recovery Between Efforts output, recovery status, time, experience, equipment constraints, pain flags, exercise complexity/order.

Outputs: density level, density strategy, pairing plan, organisation format, duration estimate, compression options, risk flags, reason codes.

Allowed to decide: density and exercise organisation.

Not allowed to decide: rest intervals, exercises, methods, loading, warm-ups, recovery status, final interventions.

Upstream dependencies: Recovery Between Efforts, Session Composition, Training Resource Allocation, Recovery Management.

Downstream consumers: Workout Builder.

Conflict rules: do not override mission-critical recovery requirements; heavy/high-skill work remains low density; accessories can pair where safe.

Regression protections: `tests/session-density-policy.test.ts`.

### 9H: Energy System Development Policy

Purpose: treat conditioning as energy-system development.

Responsibility: determine whether conditioning belongs and which energy-system objective it serves.

Inputs: programme goal, session objective, training state, adaptation, recovery, micro/mesocycle context, time, experience, goal priority, pain flags, conditioning/fatigue history, session density, interventions.

Outputs: selected energy-system objective, priority, include flag, placement, max recovery cost, duration range, intensity intent, interference risk, reason codes, safety flags, matching-engine handoff.

Allowed to decide: conditioning objective and placement.

Not allowed to decide: modality such as bike/sled/rower/running, lifting load/reps/sets, workout mutation.

Upstream dependencies: Recovery Management, Session Density, Intervention Decision, Living Athlete Model.

Downstream consumers: Future Conditioning Matching Engine, Training Resource Allocation, Workout Builder.

Conflict rules: conditioning is optional; compromised recovery reduces/omits; strength/intensification/realisation protected; alactic power stays low-volume/high-quality.

Regression protections: `tests/energy-system-development-policy.test.ts`.

### 9I: Living Athlete Model

Purpose: store continuously evolving athlete truth.

Responsibility: maintain stable traits, current state, learned characteristics, and coaching memory.

Inputs: explicit user updates, current state snapshots, validated evidence proposals, validated memory observations.

Outputs: athlete model and read-only coaching-engine snapshots.

Allowed to decide: nothing; it stores truth only.

Not allowed to decide: exercises, methods, load, reps, sets, conditioning, interventions, programme transitions.

Upstream dependencies: User input, Coaching Evidence Engine.

Downstream consumers: all coaching engines and policies.

Conflict rules: stable traits update only from user input; learned characteristics update only from validated evidence; unknown values are acceptable.

Regression protections: `tests/living-athlete-model.test.ts`.

### 9J: Coaching Evidence Engine

Purpose: learn only from validated coaching evidence, not raw logs.

Responsibility: collect, validate, classify, score, decay, and distribute learning evidence.

Inputs: raw coaching evidence from workout logs and behaviour; current date; optional current model.

Outputs: validated evidence, evidence confidence, update proposals, affected models, confidence changes, decay updates, contradiction updates, reason codes.

Allowed to decide: whether evidence is valid enough to propose model updates.

Not allowed to decide: coaching interventions, exercises, methods, load, reps, sets, conditioning, programme mutation.

Upstream dependencies: Raw logs and observations.

Downstream consumers: Living Athlete Model; future evidence stores; all coaching engines indirectly through the model.

Conflict rules: collect everything but trust only validated evidence; one isolated non-safety session cannot update learned traits; pain evidence can update immediately; stable traits never update automatically.

Regression protections: `tests/coaching-evidence-engine.test.ts`; master architecture boundary test.

### 10A: Live Workout Coaching Engine

Purpose: coach the athlete during execution after the generated workout plan exists.

Responsibility: adapt only the active session based on live execution evidence.

Inputs: generated workout plan, final coaching decision payload, warm-up plan, loading prescription, method prescription, Recovery Between Efforts guidance, density plan, session composition layers, time available, completed sets/reps/load, failed sets, user difficulty, pain flags, skipped work, substitutions, actual rest, duration, live time remaining.

Outputs: active session adjustment, adjusted prescription, affected exercises, reason codes, safety flags, evidence flags for 9J, user-facing coaching message, active-session-only marker.

Allowed to decide: active-session changes such as hold load, small next-set load changes, reduce reps/sets, remove backoffs, extend rest, compress lower layers, substitute or stop an exercise, stop workout, or flag for review.

Not allowed to decide: permanent programme changes, athlete model updates, training state changes, method selection changes, future prescriptions, permanent learning.

Upstream dependencies: generated workout plan, Coaching Decision Resolver payload, Warm-up Policy, Loading & Progression, Method Selection, Recovery Between Efforts, Session Density, Session Composition.

Downstream consumers: active workout runtime, Coaching Evidence Engine via evidence flags.

Conflict rules: pain/safety overrides everything; one poor set is not drastic; repeated failures reduce or stop; AMRAP caps are respected; mission-critical work is protected; all permanent learning routes to 9J.

Regression protections: `tests/live-workout-coaching-engine.test.ts`; master architecture boundary test.

### 10B: Live Constraint Resolution Engine

Purpose: solve live workout constraints using the smallest effective intervention that preserves the session objective where safe.

Responsibility: classify active-session constraints, determine severity, rank solution options, select the lowest-cost viable live intervention, and emit reason-coded coaching evidence.

Inputs: active exercise, session objective, primary objective exercises, live constraint signal, pain flags, failed sets, technique breakdown, fatigue spike, equipment availability, Exercise Matching availability, Session Density outputs, Session Composition layers, Recovery Between Efforts guidance, remaining exercises, blocked exercises, user override state, live time remaining.

Outputs: identified constraint, constraint severity, ranked solution options, selected solution, exercise-substitution handoff, confidence, reason codes, safety flags, evidence for 9J, active-session-only marker.

Allowed to decide: live constraint category/severity, lowest-cost live solution, whether substitution is required, and evidence flags for the Coaching Evidence Engine.

Not allowed to decide: permanent programme changes, future prescriptions, athlete model updates, independent exercise matching, loading progression, recovery status, session composition, or density logic.

Upstream dependencies: generated workout plan context, Live Workout Coaching context, Exercise Matching availability, Loading & Progression constraints, Recovery Between Efforts, Session Density, Session Composition.

Downstream consumers: Live Workout Coaching runtime, Exercise Matching Engine when substitution is required, Coaching Evidence Engine via evidence flags.

Conflict rules: safety overrides all; equipment constraints consider reordering before substitution; time constraints use density/composition before mission-critical cuts; performance constraints use load/recovery adjustments before substitution; substitution requires Exercise Matching; all changes are active-session only.

Regression protections: `tests/live-constraint-resolution-engine.test.ts`; master architecture boundary test.

### 10C: Live Safety & Pain Policy

Purpose: act as the hard live safety gate for pain, unsafe technique, dizziness, medical red flags, and equipment safety concerns.

Responsibility: classify live pain/safety category, assign severity, select conservative allowed responses, block unsafe live actions, recommend a constraint-resolution handoff, and route safety evidence to 9J without diagnostic language.

Inputs: pain/safety category, severity where known, affected movement pattern, warm-up status, range-specific pain, persistence after modification, high-risk method status, planned live action, medical red flag.

Outputs: safety decision, allowed live actions, blocked live actions, pain category, severity, affected movement pattern, recommended constraint solution, evidence for 9J, user-facing message, reason codes.

Allowed to decide: live safety response, progression vetoes, exercise/workout stop decisions, conservative modification options, and 9J evidence flags.

Not allowed to decide: medical diagnosis, medical treatment, permanent programme mutation, athlete model updates, replacement exercise selection, method selection, training state transitions, or future prescriptions.

Upstream dependencies: live user report, observed technique/safety flags, warm-up/live workout context, method risk context.

Downstream consumers: Live Workout Coaching Engine, Live Constraint Resolution Engine, Coaching Evidence Engine.

Conflict rules: safety overrides progression, density, method, and session objective; sharp/radiating/worsening pain stops the exercise; medical red flags stop the workout; mild expected muscular discomfort may continue with monitoring; pain evidence routes immediately to 9J.

Regression protections: `tests/live-safety-pain-policy.test.ts`; master architecture boundary test.

### 10D: Quality of Execution Engine

Purpose: determine whether workout evidence represents a valid training exposure suitable for coaching learning.

Responsibility: classify execution quality, assign confidence and learning weight, mark invalid evidence, determine downstream learning permission, and pass safety evidence to 9J.

Inputs: prescribed vs completed load/reps/sets, failed sets, skipped work, substitutions, order changes, rest, duration, early termination, compression, pain flags, dizziness, equipment constraints, validated effort/recovery input, user notes, invalid reasons, explicitly labelled inferences, optional future sensor sources.

Outputs: execution quality, quality confidence, learning weight, reason codes, invalid evidence flags, evidence reliability, recommended review, downstream learning permission, evidence for 9J, labelled inferences, future evidence source markers.

Allowed to decide: quality of execution, evidence reliability, learning weight, invalid evidence flags, safety-only learning permission, and whether raw workout evidence may proceed to 9J.

Not allowed to decide: lifting technique quality, progression, recovery, loading, intervention, exercise selection, method selection, programme mutation, or learned athlete model updates.

Upstream dependencies: completed workout evidence, validated user input, explicitly labelled inference, optional future sensor feeds.

Downstream consumers: Coaching Evidence Engine and Living Athlete Model indirectly through 9J.

Conflict rules: use observed evidence only; invalid sessions cannot update learned characteristics; safety events always propagate; one poor-quality session is low/minimal weight; future sensors extend evidence but do not change authority boundaries.

Regression protections: `tests/quality-of-execution-engine.test.ts`; master architecture boundary test.

### 10E: Productive Training Exposure Policy

Purpose: determine whether further work in the current exercise or session is still expected to produce meaningful adaptation.

Responsibility: estimate training effect remaining, classify productive exposure status, recommend active-workout exposure actions, identify affected layers, and emit evidence flags for 9J.

Inputs: Quality of Execution output, Recovery Management output, adaptation status, Live Workout Coaching context, Session Composition layers, Training Resource Allocation, Method Selection, Loading Policy, Live Constraint Resolution, Safety/Pain Policy, time remaining, workout completion percentage, repeated poor-quality work, AMRAP/fatigue caps.

Outputs: training effect remaining, productive exposure status, recommended action, affected session layers, reason codes, safety flags, evidence flags for 9J, active-workout-only marker.

Allowed to decide: whether current-session work should continue, complete, reduce, terminate the exercise, or terminate the session.

Not allowed to decide: future programming, learned athlete model updates, exercise selection, method selection, loading progression, recovery status, or intervention selection.

Upstream dependencies: Quality of Execution, Recovery Management, Adaptation Detection, Live Workout Coaching, Session Composition, Resource Allocation, Method Selection, Loading & Progression, Live Constraint Resolution, Live Safety & Pain Policy.

Downstream consumers: Live Workout Coaching Engine and Coaching Evidence Engine via evidence flags.

Conflict rules: safety and pain override productivity; mission completion ends unnecessary work; lower-priority layers are reduced first; repeated poor-quality work reduces exposure; AMRAP/fatigue caps are respected; training effect outranks workout completion percentage.

Regression protections: `tests/productive-training-exposure-policy.test.ts`; master architecture boundary test.

### 10F: Post-Workout Review Flow

Purpose: capture the minimum useful user feedback required to validate workout evidence, update coaching evidence, and improve future coaching decisions.

Responsibility: produce the post-workout session summary, required questions, relevant conditional questions, optional notes prompt, normalized review outputs, and evidence handoff markers.

Inputs: completed work, missed work, live adjustments, notable performances, safety/pain events, session duration, planned/completed exercises, skipped sets, substitutions, early termination, compression, unusually poor performance, skipped optional work, user review answers.

Outputs: session difficulty, pain feedback, completion reason, user constraint reason, substitution feedback, recovery context, user notes, evidence flags for 10D, evidence flags for 9J, review reason codes.

Allowed to decide: which review questions are necessary, which follow-up questions are relevant, and how user answers are normalized as evidence.

Not allowed to decide: athlete model updates, validated learning, programme changes, workout generation, intervention selection, exercise selection, method selection, load/reps/sets, or direct coaching memory writes.

Upstream dependencies: completed workout summary, Live Workout Coaching, Live Constraint Resolution, Live Safety & Pain Policy, Productive Training Exposure Policy, Quality of Execution context.

Downstream consumers: Quality of Execution Engine first, then Coaching Evidence Engine.

Conflict rules: ask only what improves coaching; pain/safety follow-up overrides friction concerns; missed or modified work must be explained before learning from it; user feedback is evidence, not absolute truth; no direct Living Athlete Model mutation.

Regression protections: `tests/post-workout-review-flow.test.ts`; master architecture boundary test.

### 10G: Runtime Architecture

Purpose: keep the coaching engine instant, offline-capable, deterministic, scalable, and game-engine-like rather than CRUD-driven.

Responsibility: define runtime layers, event bus dispatch, engine subscriptions, latency budgets, offline guarantees, immutable workout model, evidence queue, explainability cache, and sync strategy.

Inputs: coaching events, engine subscriptions, cached knowledge status, generated workout snapshots, active session patches, evidence queue entries, cloud availability.

Outputs: runtime architecture description, offline guarantee, event dispatch results, latency violations, background task queue, immutable workout state, evidence queue, sync strategy, reason codes.

Allowed to decide: which engines wake for an event, whether work exceeds latency budget and must move background, whether cached knowledge is sufficient for offline execution, and whether evidence is queued asynchronously.

Not allowed to decide: coaching content, exercise selection, method selection, load/reps/sets, intervention decisions, athlete model updates, or direct programme mutation.

Upstream dependencies: generated workout, cached coaching knowledge, live workout events, review events, local evidence queue.

Downstream consumers: Workout Builder/runtime shell, Live Workout Coaching, background evidence processing, sync queue, future deep analysis workers.

Conflict rules: cloud never blocks workout execution; learning never blocks workout execution; generated workouts remain immutable; only active session state can change live; only engines subscribed to an event wake; over-budget real-time work moves background.

Regression protections: `tests/runtime-architecture.test.ts`; master architecture boundary test.

### 10H: Session PR Opportunity Policy

Purpose: identify at least one realistic opportunity for measurable progress in suitable sessions without forcing unsafe or inappropriate max-effort work.

Responsibility: select a PR opportunity type, target exercise, target metric, target threshold, risk level, fallback option, evidence handoff, and pressure-free user-facing message.

Inputs: session objective, training state, selected method, loading prescription, exercise history, recent PR history, adaptation status, recovery status, pain/safety flags, execution quality history, athlete model summary, intervention outputs.

Outputs: selected PR opportunity, PR type, target exercise, target metric, target threshold, confidence, risk level, reason codes, fallback PR option, user-facing message, evidence flags for 9J, live-policy gates.

Allowed to decide: which existing-workout PR opportunity is most appropriate and whether only a low-cost/fallback PR is suitable.

Not allowed to decide: programming changes, live execution approval, safety overrides, method rule overrides, max-effort forcing, athlete model updates, or direct Coaching Evidence updates.

Upstream dependencies: session objective, Method Selection, Loading & Progression, exercise history, Adaptation Detection, Recovery Management, Live Safety & Pain Policy, Quality of Execution history, Living Athlete Model.

Downstream consumers: Live Workout Coaching, Productive Training Exposure, Coaching Evidence Engine via outcome flags.

Conflict rules: recovery-limited sessions use low-cost PRs; pain/safety blocks taxing PRs; deload/pivot uses recovery-friendly targets; method effort caps are respected; live coaching and productive exposure remain final gates; progress is framed without pressure.

Regression protections: `tests/session-pr-opportunity-policy.test.ts`; master architecture boundary test.

### 11A: Goal Translation Engine

Purpose: translate user-facing outcomes into coach-facing objectives that the rest of the coaching architecture can execute.

Responsibility: preserve the user's stated priority, convert vague goals into measurable objectives, resolve goal conflicts safely, define session priority bias, training-state recommendations, progression expectations, support-function priorities, energy-system priorities, recovery priority, contraindicated emphases, success metrics, confidence, and reason codes.

Inputs: user stated goal, secondary goals, training age, current strength level, bodyweight goal, sport, available equipment, preferred schedule, available time, injury/pain restrictions, adherence history, Living Athlete Model summaries, Coaching Evidence summaries.

Outputs: primary training goal, secondary training goals, long-term objective, current-phase objective, session priority bias, recommended training states, progression expectations, support-function priorities, energy-system priorities, recovery priority, contraindicated emphases, success metrics, confidence, reason codes, raw-user-goal-consumed marker, no-workout-building marker.

Allowed to decide: coach-facing interpretation of the user's goal, goal priority conflicts, objective phrasing, safe constraints, recommended training-state direction, support priorities, energy-system priorities, recovery priority, and success metrics.

Not allowed to decide: workout generation, exercise selection, method selection, loading, reps, sets, progression, live workout changes, programme mutation, athlete model updates, or direct Coaching Evidence updates.

Upstream dependencies: user onboarding goal data, Living Athlete Model, Coaching Evidence Engine summaries, injury/pain restrictions, adherence context.

Downstream consumers: Adaptive Training State Architecture, Method Selection, Session Composition, Support Function Policy, Exercise Matching, Energy System Development, Training Resource Allocation, Loading & Progression, future Workout Builder through resolved objectives.

Conflict rules: raw user wording is not a plan; preserve the primary stated goal; resolve conflicts with safety and recovery first; fat loss does not force excessive conditioning; return-after-layoff uses conservative re-entry; downstream engines consume translated objectives rather than raw wording.

Regression protections: `tests/goal-translation-engine.test.ts`; master architecture boundary test.

### 12C: Development Track Learning Engine

Purpose: continuously optimise each user goal independently through safe, controlled coaching experiments.

Responsibility: maintain long-term Development Tracks created from Goal Translation, store coaching hypotheses, enforce one primary learning variable per track, respect the global learning budget, summarise evidence, and recommend the next safe experiments through existing coaching engines.

Inputs: Goal Translation output, athlete experience, existing Development Tracks, safety/recovery limitation status, existing track evidence, optimisation history, and current date.

Outputs: development tracks, active hypotheses, learning budget usage, confidence, evidence summary, recommended next experiments, reason codes, and explicit no-programme-mutation/no-athlete-truth-update markers.

Allowed to decide: which goal-level tracks exist, which hypotheses are active, which single variable each active track is testing, whether the learning budget is full, whether an experiment should be paused for safety/recovery, and what experiment should be recommended next.

Not allowed to decide: exercises, methods, loads, reps, sets, workout generation, programme mutation, athlete truth updates, exercise rotation need, intervention selection, or direct Coaching Evidence/Living Athlete Model writes.

Upstream dependencies: Goal Translation Engine, Living Athlete Model snapshot summaries where available, Coaching Evidence summaries where available, safety/recovery status.

Downstream consumers: Intervention Decision Engine, Method Selection, Exercise Matching, Loading & Progression, Training Resource Allocation, Coaching Decision Resolver, Coaching Evidence Engine as validated experiment outcomes.

Conflict rules: Development Tracks are not exercise-specific; only one primary variable may change per track; conflicting experiments on the same track are blocked; global learning budget is novice 2, intermediate 3, advanced 2, elite 1; safety and recovery override experiments; successful and failed experiments become coaching knowledge only through validated evidence.

Regression protections: `tests/development-track-learning-engine.test.ts`; master architecture boundary test; no direct Living Athlete Model update helpers; no workout generation calls.

### 12A: ResolvedWorkoutIntent / CoachingPacket Contract

Purpose: provide the single validated contract between coaching engines and Workout Builder so raw engine outputs and legacy generation cannot create parallel authority.

Responsibility: define required packet fields, validate packet completeness, assert Coaching Decision Resolver authority, provide diagnostics for missing fields, expose a packet-only builder boundary, and quarantine legacy generation behind explicit rollback flags.

Inputs: goal translation, Living Athlete Model snapshot id, training state, adaptation summary, recovery summary, selected intervention, resolver decision, session objective, session layers, support functions, ranked exercise candidates, selected exercises, selected methods, loading prescriptions, resource allocation, warm-up plan, recovery between efforts, density plan, energy system objective, PR opportunity, safety constraints, reason codes, confidence, review window.

Outputs: validated ResolvedWorkoutIntent / CoachingPacket, missing-field diagnostics, packet-only workout assembly result, reason codes, rollback flag metadata.

Allowed to decide: whether the Workout Builder may run from a complete packet, whether a packet is incomplete, and whether legacy generation is explicitly rollback-enabled.

Not allowed to decide: goal translation, athlete truth, training state, adaptation, recovery, interventions, exercise selection, method selection, loading, volume, warm-up, rest, density, conditioning, PR selection, live coaching, evidence learning, or programme-changing coaching actions.

Upstream dependencies: Goal Translation, Living Athlete Model snapshot, Adaptive Training State, Adaptation Detection, Recovery Management, Intervention Decision, Coaching Decision Resolver, Session Composition, Support Function Policy, Exercise Matching, Method Selection, Loading & Progression, Training Resource Allocation, Warm-up, Recovery Between Efforts, Density, Energy Systems, PR Opportunity.

Downstream consumers: Workout Builder only.

Conflict rules: incomplete packets fail closed; raw engine outputs cannot bypass the packet; Coaching Decision Resolver remains the only programme-changing authority; legacy generation requires an explicit rollback flag; Workout Builder assembles and never invents missing coaching logic.

Regression protections: `tests/coaching-packet.test.ts`; master architecture boundary test.

### 12B: CoachingPacket Production Pipeline

Purpose: produce a complete, validated ResolvedWorkoutIntent / CoachingPacket end to end before the Workout Builder runs.

Responsibility: orchestrate locked coaching engines in production order, preserve reason codes, validate packet completeness, fail closed with diagnostics when required fields are missing, and prevent legacy workout generation from filling packet gaps.

Inputs: user stated goal, training goal, Living Athlete Model inputs, selected session, local exercise catalogue, recent workout evidence summary, experience level, equipment, unit preference, current training state, recovery hint, pain/issue flag, generation timestamp, packet id, athlete id.

Outputs: validated CoachingPacket, packet-validation reason codes, diagnostic missing-field failures, packet-built workout session only after validation passes.

Allowed to decide: whether orchestration produced a complete packet, whether validation passes, whether Workout Builder may run, and whether a diagnostic failure should be returned.

Not allowed to decide: new coaching rules, exercise selection outside Exercise Matching, methods outside Method Selection, loading outside Loading & Progression, volume outside Resource Allocation, warm-up/rest/density/conditioning/PR logic outside their policies, programme-changing actions outside Coaching Decision Resolver, learned-athlete updates, or legacy fallback repair of incomplete packets.

Upstream dependencies: Goal Translation, Living Athlete Model snapshot, Adaptive Training State, Adaptation Detection, Recovery Management, Intervention Decision, Coaching Decision Resolver, Session Composition, Support Function Policy, Exercise Matching, Method Selection, Loading & Progression, Training Resource Allocation, Warm-up, Recovery Between Efforts, Density, Energy Systems, PR Opportunity.

Downstream consumers: ResolvedWorkoutIntent validator and Workout Builder.

Conflict rules: Coaching Decision Resolver remains the only programme-changing authority; missing packet fields fail closed; legacy generation remains rollback-only and cannot silently fill missing reps, loads, exercises, volume, warm-ups, rest, density, conditioning, or PR fields; raw engine outputs cannot bypass packet validation.

Regression protections: `tests/coaching-packet-pipeline.test.ts`; `tests/coaching-packet.test.ts`; master architecture boundary test.

### 12C: Builder Purge / Legacy Decision Quarantine

Purpose: ensure no Workout Builder or session-builder path can invent coaching decisions or silently fall back to legacy logic after the CoachingPacket pipeline exists.

Responsibility: quarantine legacy generation behind an explicit rollback flag, keep builders assembly-only, reject incomplete packets, prevent missing rep ranges or loads from being inferred, and keep old programme/session builders from choosing exercises, rep ranges, set counts, loads, volume, warm-ups, rest, density, conditioning, or substitutions.

Inputs: validated CoachingPacket for production workout assembly; already-prescribed programme slots only when explicit rollback generation is enabled; rollback flag metadata; diagnostics from packet validation.

Outputs: assembled workout/session objects from complete packet or complete planned slots, fail-closed diagnostics for incomplete packets, and rollback-only legacy assembly paths.

Allowed to decide: whether a builder has enough already-resolved fields to assemble a session, whether an incomplete packet must fail closed, and whether legacy assembly is permitted by the explicit rollback flag.

Not allowed to decide: exercises, substitutions, rep ranges, set counts, loads, volume, warm-ups, rest intervals, density, conditioning, PR opportunities, methods, progression, programme-changing actions, athlete learning, or recovery/fatigue interventions.

Upstream dependencies: ResolvedWorkoutIntent / CoachingPacket Contract, CoachingPacket Production Pipeline, Coaching Decision Resolver, explicit rollback flag, and already-prescribed programme slots for rollback-only paths.

Downstream consumers: Train screen session display, workout logging, history persistence, active workout resume.

Conflict rules: packet validation outranks builder convenience; omitted loads and invalid rep ranges fail closed; legacy generation cannot fill missing packet fields; rollback paths may assemble only when `EXPO_PUBLIC_ASC_LEGACY_WORKOUT_GENERATION_ROLLBACK` is explicitly enabled; production Workout Builder must never choose missing coaching content.

Regression protections: `tests/coaching-packet.test.ts`; `tests/coaching-packet-pipeline.test.ts`; `tests/session-builder.test.ts`; `tests/workout-navigation-ui.test.ts`; master architecture boundary test.

### 12D: End-to-End Coaching Loop Smoke Test

Purpose: verify the locked architecture works as one complete production loop from goal translation to built workout without legacy fallback or builder invention.

Responsibility: run the production coaching path through Goal Translation, Living Athlete Model snapshot, CoachingPacket production, CoachingPacket validation, Workout Builder assembly, and UI-ready planned workout output; verify traceability for exercises, support functions, reps, sets, loads, warm-up, rest, density, PR fields, and reason codes; verify failure paths fail closed.

Inputs: representative production pipeline input, local exercise catalogue, generated CoachingPacket, intentionally incomplete packet variants, production source files for legacy-rollback guard checks.

Outputs: passing smoke-test assertions, fail-closed diagnostics for incomplete packets, source guard coverage proving legacy generation cannot run unless explicitly rollback-enabled, and reason-code trace verification in built workout notes.

Allowed to decide: whether the production coaching loop is wired end to end, whether the built workout traces back to packet prescriptions, and whether a missing required packet field fails closed.

Not allowed to decide: exercises, reps, loads, sets, methods, volume, warm-ups, rest, density, conditioning, PR opportunities, substitutions, programme transitions, athlete learning, or any new coaching logic.

Upstream dependencies: Goal Translation, Living Athlete Model snapshot, CoachingPacket Production Pipeline, ResolvedWorkoutIntent validation, Workout Builder, rollback-flag quarantine.

Downstream consumers: release verification, CI/local regression suite, future production-readiness gates.

Conflict rules: smoke verification must not mask failures with legacy fallback; incomplete packets must produce diagnostics; builder notes must preserve reason-code trace; source guards must fail if production planned workout creation imports or calls legacy generation without rollback gating.

Regression protections: `tests/coaching-loop-smoke.test.ts`; `tests/coaching-packet.test.ts`; `tests/coaching-packet-pipeline.test.ts`; `tests/workout-navigation-ui.test.ts`; master architecture boundary test.

### 13A: First Shippable Coaching Loop

Purpose: wire the first real user-facing adaptive loop from generated packet workout through completion, post-workout review, execution quality, validated coaching evidence, Living Athlete Model update, and next workout generation.

Responsibility: coordinate existing locked components so a completed workout can produce validated learning without adding live coaching complexity or allowing raw review/log data to directly update athlete truth.

Inputs: validated CoachingPacket-built workout session, completed workout log, minimal post-workout review answers, current Living Athlete Model, prior workout sessions for context, completed timestamp.

Outputs: normalized review evidence, Quality of Execution result, raw coaching evidence for 9J, Coaching Evidence Engine result, updated Living Athlete Model, internal reason-code trace, and a next-workout handoff that reads the updated athlete model snapshot.

Allowed to decide: whether the first shippable loop ran through the required evidence path, what low-friction default review answers are used when explicit UI answers are not supplied, and how observed workout data is shaped for Quality of Execution and Coaching Evidence.

Not allowed to decide: exercises, reps, loads, sets, methods, progression, interventions, programme changes, training-state transitions, full live coaching, direct athlete-model mutation, or UI-created coaching decisions.

Upstream dependencies: ResolvedWorkoutIntent / CoachingPacket Contract, CoachingPacket Production Pipeline, Post-Workout Review Flow, Quality of Execution Engine, Coaching Evidence Engine, Living Athlete Model, local workout logging.

Downstream consumers: next workout generation, Living Athlete Model repository, release verification, future explicit post-workout review UI, future live coaching.

Conflict rules: review answers are evidence rather than truth; Quality of Execution must run before Coaching Evidence; only Coaching Evidence Engine may update learned athlete traits; incomplete or poor-quality workouts receive reduced learning weight; legacy rollback remains gated; workout execution remains local/offline.

Regression protections: `tests/first-shippable-coaching-loop.test.ts`; `tests/coaching-packet-pipeline.test.ts`; master architecture boundary test.

## Builder And Mutation Boundary

Workout Builder is an assembler. It may consume only a validated ResolvedWorkoutIntent / CoachingPacket, create compatible workout/session objects, and render or persist those objects through approved app flows.

Workout Builder must not:

- consume raw outputs from individual engines,
- invent exercise selection logic,
- invent method selection logic,
- invent loading/progression logic,
- invent set/volume logic,
- invent conditioning logic,
- invent warm-up logic,
- invent rest logic,
- invent density/pairing logic,
- invent PR logic,
- update learned athlete traits,
- bypass Coaching Decision Resolver for programme-changing actions.

## Future Feature Rule

Before implementing any new adaptive feature:

1. Add the feature to this document.
2. Name its decision ID and owner.
3. Define inputs, outputs, allowed decisions, forbidden decisions, upstream/downstream dependencies, conflict rules, and tests.
4. Only then implement code.
