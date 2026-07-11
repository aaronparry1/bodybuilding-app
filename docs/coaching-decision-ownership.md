# Coaching decision ownership map

## Runtime ownership verdict

There is no singular coaching owner. The actual live constructor is the V2 CoachingPacket pipeline. Local live adjustments and post-workout updates are separate owners. V3 is shadow/conditional replacement, while planned/ad-hoc/extra builders remain alternative constructors.

| Decision | Intended/claimed owner | Actual reachable owner(s) | Inputs / output / persistence | Validation & fallback | Conflict / reachability |
|---|---|---|---|---|---|
| Programme creation | `plan-setup`, annual planner | Onboarding `createActiveTrainingPlan`; training-year repository separately starts block; custom programme builder | Setup choices → ActiveTrainingPlan + TrainingYear + skeleton | Normalization only; no cross-store validation | Three programme forms; production reachable |
| Split/session role | framework rules/planned workout | Active plan sequence, Home generated programme name, then logger `sessionTypeForWorkoutName` | Split/name → V2 selectedSession | Name mapping defaults full-body | Name is a lossy contract; reachable |
| Exercise selection | exercise-selection / matching engine | V2 packet matching engine; planned/ad-hoc generator; extra generator; manual add/swap | Full static+custom library, all equipment inferred from library, history → candidate(s) | V2 requires one candidate; legacy rollback; V3 gated | Major competing implementations |
| Classification/equipment | presets/taxonomy | Exercise metadata; V2 passes equipment union of **all library exercises**, not user plan equipment | Metadata + inferred union → matching candidates | Candidate match checks its passed equipment | User onboarding equipment is not passed to V2 live constructor; reachable defect |
| Volume/sets/reps | set prescription, adaptive set allocation/rep prescription | V2 packet, settings resolver, local adaptive set decision, legacy generators | Block/settings/metadata/history → settings + live prompts | V2 only session validity checks positive ranges; V3 stricter but optional | Multiple owners |
| Load/progression | loading policy / progression engine | V2 initial load; local load selection, progression engine/throttle, in-session escalation, post-review approval | Local sets/history/block → suggested load | Deload suppression and fallback loads | V2 packet and logger can disagree; reachable |
| Fatigue/recovery | recovery management/living athlete | V2 derives coarse cycle flags from last 2 sessions; local training gap; post-workout model; V3 snapshot | History/notes → flags/recommendations | Usually low-evidence fallbacks | No single persisted fatigue truth |
| Set-to-set adaptation | live workout engine | logger progression/load drop/escalation | Current set log → shutdown/drop/escalate | Local only | This is the strongest reachable loop |
| Substitution/preference | swaps/recommendation actions | Logger swap ranking and session mutation; Train records reason for future coaching; analytics actions | Metadata/reason → replacement/preference record | Suggestions no global session-role validator | Generator may not consume preferences consistently |
| Deload/block transition | annual/block rules | Active plan completion/Plan actions; training-year block separately; V2 phase mapping | Block representation/history → phase | V2 sees fallback block | Active plan and year may diverge |
| V2 | QA naming implies preview | **Default live generator** via `createProductionWorkoutFromCoachingPacketPipeline` | broad inputs → WorkoutSession | returns null; then legacy only if flag | Production reachable |
| V3 | V3 engine | Shadow telemetry; replacement only three flags+strict readiness | Snapshot/history/library → V3 session | quality gate rejects thin normal V3 and falls back V2 | Configuration Unknown; conditionally reachable |
| Shadow evaluation | V3 telemetry | microtask after V2 session creation | V2 session + snapshot → console telemetry | errors swallowed/logged | Nonpersistent; not product-visible |
| Fallback generation | legacy/ad-hoc | V2 failure + rollback flag; active-plan legacy path; selected-exercise fallback | Various → WorkoutSession | explicit rollback flag or fallback session | Multiple format/quality contracts |

## Legacy/dead coaching modules

- `legacy-workout-generation.ts` is explicitly rollback-only but still imported by Home, logger and recovery capacity delivery.
- `v2-workout-generator.ts`, `v2-coaching-qa.ts`, `run-v2-qa-preview.ts`, dashboards and V2 QA screen are QA-only and do not construct normal Train sessions.
- V3 contains a much larger quality/readiness system but is not proven active. V3’s protection against a one-exercise normal session does not protect default V2 output.
- `coaching-decision-resolver` asserts a single authority within its own packet path, but it does not own the logger’s direct progression, Home plan changes, custom builder, or alternate generators.

## Decision ownership recommendation

Keep exactly one `WorkoutSessionFactory` with a typed input containing plan session role, *user-selected* equipment, required role coverage, history and active block. It must produce either a validated session or a user-visible failure—never a selected-exercise fallback. Make local set logging the sole tactical owner; make one plan/block aggregate the strategic owner. Retain V3 only as offline comparison data until it becomes that factory, or quarantine it.
