# Adaptive Strength Coach User Journey Map

This map documents the current app journeys in plain English. It focuses on where the user is, what they can do next, where they go after acting, and what still needs product decisions.

## Journey 1: New User

Starting state: user opens the app without an authenticated or offline/design QA session.

User action: choose create account, login, continue offline, or Design QA Mode in dev/staging.

App response:
- If authenticated, offline, or Design QA Mode is active, route into the protected app.
- If onboarding is not complete, route to onboarding.
- Design QA Mode is only shown in dev/staging and does not create a Supabase session.

Next screen: Onboarding, unless the user already completed setup.

Failure/edge cases:
- Missing Supabase config shows a clear message and keeps offline mode available.
- Production cannot enter Design QA Mode.

Unresolved issue: social auth and cloud account flows still need full device QA, but the local/offline journey is clear.

## Journey 2: Onboarding and Plan Creation

Starting state: user is in onboarding.

User action: answers goal, plan style, event/block choices when needed, equipment, schedule, split, experience, and units.

App response:
- Creates an active training plan.
- Starts the first training block.
- Marks onboarding complete.

Next screen: Home.

Failure/edge cases:
- Single-block plans create one block only.
- Event/custom date plans use the target date to size relevant block sequences.
- Event/custom date plans also calculate a countdown phase: base, build, specificity, taper, event week, or post-event.
- Recommended plan creates a goal-specific 48-52 week annual sequence.

Custom sequence editing is structured internally for compatibility, but hidden from normal onboarding until a polished builder exists.

## Journey 3: Home Decision

Starting state: user opens Home.

User action and app response:
- If no active plan exists, Home shows "Set up your training plan" and routes to onboarding.
- If an active workout exists, Home shows "Continue workout" and routes to Train.
- If today's planned workout exists and is not started, Home shows one primary workout card and routes through Session Prep.
- If today's workout is completed, Home shows completion first and may show a different next session.
- If today is a rest day, Home shows rest guidance and the next session where available.
- If the user taps the help icon, Home opens "How Adaptive Strength Coach Works" with a plain-English guide to plans, blocks, sets, autoregulation, deloads, and safety.

Next screen: onboarding, Session Prep, Train, or Plan depending on state.

Failure/edge cases:
- Home prevents duplicate workout cards when active/planned/up-next sessions are the same.
- Home cleans generated names such as "AI Push" to "Push."
- Body-part split labels are safe in planned workouts: Chest, Back, and Shoulders use dedicated generator contexts, while Legs, Arms, and Full Body use their existing templates.
- Planned workouts use deterministic controlled rotation: exercises stay stable inside the rotation window, primary-like lifts stay stable by default, and accessories can rotate when the window changes.

Unresolved issue: rest-day display currently depends on whether the app is showing training sequence or calendar style. The present compact view uses training slots only.

## Journey 4: First Workout

Starting state: user has a planned workout and taps Start from Home or starts a generated session.

User action: Start workout.

App response:
- Fresh workouts route to Session Prep first.
- Existing active workouts resume Train directly.

Next screen: Session Prep for fresh sessions, Train for active sessions.

Failure/edge cases:
- Prep is optional. The user can start, skip, or go back.
- Prep completion/skipping is tracked separately and does not affect progression, volume, or strategic coaching.

Unresolved issue: prep is currently a lightweight preparation layer, not a personalized readiness test.

## Journey 5: Session Prep

Starting state: user is on Session Prep.

User action:
- Start Prep.
- Complete Prep.
- Skip Prep.
- Open Why or How.
- Go back.

App response:
- Complete/skip creates a local prep record.
- Prep shows general preparation and optional Wenning-style warm-up primer work, not exercise-specific loading ramps.
- Exercise warm-up rows remain inside the workout and handle the specific ramp toward each exercise's working load.
- Prep completion and exercise warm-up sets do not count as productive work, progression, volume landmarks, or fatigue evidence.
- Why and How stay hidden until requested.
- Safety copy stays framed as preparation/capacity, not rehab or treatment.

Next screen: Train overview after complete/skip, or previous screen on Back.

Failure/edge cases:
- Custom/unknown workout types use a safe generic prep.
- Arms uses an upper-style prep.

Unresolved issue: no video/media demos yet.

## Journey 6: Workout Overview

Starting state: active workout exists.

User action:
- Tap Performance on a set row.
- Open Detail.
- Swap.
- Remove for today.
- Add exercise.
- Complete workout.

App response:
- Performance opens the compact logging drawer.
- Detail opens the secondary exercise screen.
- Swap suggests same family/role first, then asks why the user is changing the exercise.
- Remove for today asks for a quick reason and affects only the current workout instance.
- Add exercise affects only the current workout instance.
- Exercise cards show the recommended productive range, such as 3-5 sets, while completion still uses the required set floor.
- Complete Workout asks for confirmation, with early-completion copy if planned work is unfinished.

Next screen: logging drawer, exercise detail, swap/add panel, or Home/Progress after completion.

Failure/edge cases:
- The session overview stays clean after swaps; old swapped-out work is preserved in history metadata rather than cluttering the active list.
- Pain, limitation, unavailable equipment, dislike, preference, temporary skip, and other reasons are stored as coaching context and are not treated as failed performance.
- Repeated dislike/preference reasons can lower future ranking for the avoided exercise and raise the preferred replacement; temporary skips do not create lasting preference learning.
- Pain/limitation suppresses the exercise and close relatives temporarily without medical claims or progression penalties.
- Equipment unavailable or machine occupied creates a short practical cooldown, not a permanent dislike.
- Protected primary lifts require stronger evidence before long-term suppression, and the user can still override the recommendation.
- Add Exercise appears after the exercise list.

Unresolved issue: swipe gestures are present but still need physical-device feel testing with sweaty-hand gym use.

## Journey 7: Exercise Logging

Starting state: user opens the Performance drawer or exercise detail.

User action:
- Choose warm-up or work.
- Enter/adjust load.
- Choose reps or type reps.
- Log set.
- Undo if needed.

App response:
- Warm-ups are recorded but excluded from best set, drop-off, quality sets, progression, and volume landmarks.
- Work sets feed the tactical engine.
- Required sets decide whether the exercise can count as complete.
- Recommended range tells the user where normal productive work lives.
- Soft cap is a guardrail warning, not the target.
- Rest timer starts after logged sets.
- Unknown loads show percentage guidance until actual load history exists.
- Known/estimated loads show practical load values in the user's unit.

Next screen: drawer closes back to overview, or exercise detail updates.

Failure/edge cases:
- Unknown load never displays 0kg/0lb.
- Load suggestions are optional.
- User can return to workout overview from exercise detail.

Unresolved issue: similar-exercise load estimates are conservative but still need more real gym validation.

## Journey 8: Exercise Stop, Progression, and Completion

Starting state: user logs work sets.

User action: continue logging until stop, soft cap, or manual completion.

App response:
- Drop-off shutdown stops the exercise when performance falls below the useful range.
- Soft cap is coaching guidance only and does not force shutdown.
- If the user hits top-range work repeatedly, the app may suggest a next-set load increase.
- After the session, next-session load uses productive work-set loads, excluding warm-ups and below-threshold sets.

Next screen: next exercise, workout overview, or completion.

Failure/edge cases:
- Shutdown can be reopened only with explicit "Reopen anyway."
- Manual completion can be reopened more easily.

Unresolved issue: max quality-set hard caps are still mostly guidance, not automatic limits.

## Journey 9: Returning User With Active Workout

Starting state: user opens the app with an unfinished workout.

User action: tap Continue Workout.

App response: routes directly to Train instead of re-showing Session Prep.

Next screen: Train overview or active exercise state.

Failure/edge cases:
- Prep remains secondary once work has started.

Unresolved issue: resume location is mostly session-level; deeper restoration of an open drawer is not needed today.

## Journey 10: No-Plan Journey

Starting state: active plan is missing.

User action:
- Open Home.
- Open Plan.
- Open Settings.

App response:
- Home shows setup.
- Plan shows setup.
- Settings offers training plan setup/restart.

Next screen: onboarding/setup.

Failure/edge cases:
- No fake workout, block, or week is invented.

Unresolved issue: replacing an existing plan with a new plan is still routed through setup rather than a full edit wizard.

## Journey 11: Progress Review

Starting state: user has completed workouts.

User action: open Progress.

App response:
- Low history: tells user to log 3-5 workouts first.
- Enough history: shows coach verdict, what to do next, recent progress, and recent workouts.
- Zero-set/abandoned sessions are hidden from normal recent workouts.
- Generated names are cleaned.

Next screen: Train, Plan, or History from action buttons.

Failure/edge cases:
- If fatigue is the limiter, recovery advice overrides aggressive load-increase advice.
- Fatigue is separated into exercise-specific, muscle-local, systemic, mixed, or insufficient-data signals before Progress decides whether to recommend rotation, volume adjustment, or deload.
- Exercise-specific fatigue stays local to the lift where possible; muscle-local fatigue points toward volume/accessory changes; systemic or mixed fatigue can support broad hold/deload guidance.
- Exercise-specific progression notes may still appear behind details.
- Every major recommendation has an Evidence disclosure with confidence, source, and data points.
- Design QA/demo recommendations are labelled as fixture-backed and stay local-only.

Unresolved issue: accepting a strategic recommendation is not a full wizard yet. Progress provides compact action paths.

Recommendation evidence behaviour:
- IF fewer than 3 completed workouts exist -> Progress shows low-history copy and locks meaningful recommendation actions.
- IF evidence confidence is insufficient_data -> no deload, rotation, volume, or block action should apply.
- IF the recommendation comes from Design QA fixtures -> the protected-app banner and Evidence source identify it as demo data.
- IF a recommendation uses real history -> Evidence lists the data points used, such as completed workouts, repeated shutdowns, productive sets, or block week.

## Journey 12: Block Progression

Starting state: current block is near its end or readiness is high.

User action: open Progress or Plan.

App response:
- Progress recommends continuing, extending, repeating, or advancing based on readiness.
- Plan shows current phase, week, roadmap, and next block.
- Design QA has a block-nearing-end fixture.

Next screen: Plan for review.

Failure/edge cases:
- Block changes are recommendations until the user acts.
- User is not forced to advance solely because the calendar says so.
- Block actions are only available when the active plan block has reached its planned endpoint.

Recommendation acceptance:
- If the user taps Move to next block, the active plan marks the current block complete and makes the next block active.
- If the user is in single-block mode, they can choose the next block instead of being pushed into a hidden annual sequence.
- If the user taps Repeat current block, the active block restarts at week 1 and stays active.
- If the user taps Decide later, the app records the decision and changes nothing structurally.

Next screen: Plan remains the source of truth, and Home/future workouts read the updated active block.

Unresolved issue: block acceptance currently applies immediately. A future product decision is whether "move to next block" should apply immediately or queue for the next calendar week.

## Journey 13: Exercise Stall and Rotation

Starting state: an exercise stalls or regresses across repeated exposures.

User action: open Progress.

App response:
- Progress surfaces a rotation note with the reason and a suggested replacement.
- Replace exercise applies the suggested replacement to future planned sessions.
- Keep exercise suppresses the immediate repeat prompt while tracking continues.

Next screen: Progress acknowledges the decision. Future planned sessions use the replacement if accepted.

Failure/edge cases:
- Progressing Tier A exercises are not rotated.
- Stalled Tier A exercises can recommend a same-family/role replacement.
- Completed workout history is not changed.
- Active workout swaps remain separate from future planned-session replacements.
- Rotation recommendations are suppressed until repeated exposure evidence exists.
- Keep exercise suppresses the immediate repeat prompt rather than deleting the evidence.

Unresolved issue: there is no dedicated review screen yet for comparing several replacement options before accepting one.

## Journey 14: Recovery Window / Reactive Deload

Starting state: fatigue is high, shutdowns rise, or volume tolerance declines.

User action: open Progress.

App response:
- Coach verdict prioritises recovery.
- Start deload creates an active deload phase on the plan.
- Home and Plan show the phase as a Recovery Window.
- Ignore for now records the decision and changes nothing structurally.

Next screen: Progress acknowledges the action; Plan shows the Recovery Window status.

Failure/edge cases:
- The app does not automatically force a hard deload because a week number arrived.
- Reactive deload is recommendation-led.
- Planned Recovery Windows can be lighter transition weeks when readiness is good.
- The original plan is not erased.
- Recovery Window uses conservative block defaults and does not alter tactical shutdown/progression rules.
- Deload actions are suppressed when history is too thin for a recovery recommendation.
- Exercise-specific fatigue by itself should not trigger a global deload.
- Systemic or mixed fatigue gives deload evidence more weight because multiple unrelated areas are dropping together.

Phase 1 deload profiles now define the prescription intent:
- Mild: 30-40% fewer productive sets, 5-10% easier load/intensity, no aggressive progression prompts.
- Clear: 40-60% fewer productive sets, 10-15% easier load/intensity, lower soft caps, no escalation prompts.
- Severe: 50-70% fewer productive sets, 15-25% easier load/intensity, conservative prescriptions.

Goal model:
- Build Strength protects main-lift output.
- Build Muscle prioritises recoverable productive volume.
- Build Muscle & Strength balances both.
- Athletic Performance protects output quality.
- Powerlifting Meet prioritises squat, bench, deadlift readiness, specificity, and taper timing.
- Event countdown phases tighten that priority: specificity rises 4-8 weeks out, taper rules apply 2-3 weeks out, and event week suppresses novelty and aggressive progression.
- Get Leaner preserves strength and muscle where possible while recovery/cardio support helps consistency and body-composition progress.

Remaining limitation: deload session generation is still profile-based. Future work should make sessions more deeply individualized by block, lift, and long-term response.

## Journey 15: Capacity Focus

Starting state: user opens Settings and enables Capacity Focus.

User action:
- Toggle Low Back/Hips/Ankles/Shoulders/Neck.
- Open Capacity Focus.
- Open Why/How.
- Mark complete.

App response:
- Low Back levels display full routines.
- Placeholder areas show coming later.
- Capacity tracking stays separate from workout progression.

Next screen: Settings or Capacity Focus.

Failure/edge cases:
- Copy avoids rehab, therapy, cure, and treatment claims.
- Safety copy tells users to stop if exercises cause pain.

Unresolved issue: non-low-back tracks are placeholders.

## Navigation Audit Summary

Main tab screens:
- Home, Train, Plan, Progress, Library have bottom tabs.
- Settings is reachable from the top-right header.
- Account is hidden from the tab bar.

Nested screens:
- Session Prep has Back.
- Capacity Focus has Back to settings.
- Exercise detail has Workout.
- Performance drawer has Close and backdrop close.
- Add/swap panels have cancel/hide controls.
- History/library/programme routes use Expo Router stack back navigation.

Known limitation:
- Some stack back labels are default platform labels rather than custom copy. They are functional but should be reviewed on physical Android/iOS.

## Design QA Fixture Coverage

Current fixture coverage includes:
- no plan
- active plan
- active workout
- fresh workout
- completed workout
- rest-day style weekly schedule
- low history
- fatigue
- stalled exercise
- rotation recommendation
- block nearing end
- block transition action
- deload action
- rotation action
- accepted block transition
- accepted deload
- accepted rotation
- prep skipped/completed/not started
- unknown load
- known load
- estimated load
- load increments
- productive set soft cap
- shutdown

Fixture evidence rules:
- Fixture sessions are local-only and blocked from production fixture entry.
- Fixture sessions must not enqueue cloud sync.
- Recommendation evidence should show `fixture` source when the visible recommendation comes from demo history.
- Clearing fixtures restores the previous local state.

## Recommendation Evidence Summary

Adaptive Strength Coach now treats recommendations as claims with provenance.

Evidence fields:
- recommendation type
- confidence
- source
- evidence summary
- data points used
- user-facing reason
- whether an action is allowed

User-facing rule:
- IF the app has enough evidence -> show a concise recommendation and keep details behind Evidence/Why.
- IF the app does not have enough evidence -> say what is missing and do not show a confident action.
- IF the app is showing demo data -> make fixture/demo provenance visible.

Phase 1 recommendation changes:
- IF load should increase -> round up to the next available practical increment.
- IF load should reduce -> round down to a practical lower valid increment.
- IF only one weak session exists -> hold load or show caution, not a reduction.
- IF repeated decline exists but the next lower available load would overcorrect -> hold and ask for one more exposure.
- IF deload evidence exists -> choose mild, clear, or severe deload prescription.
- IF deload evidence is thin -> suppress the deload action.
- IF the user goal changes -> recommendation priority can change, but the evidence requirement does not.

## Weekly Completion And Editing Journey

Planned session completion:
- Starting state: user has an active plan and a current training week.
- User action: complete a planned session.
- App response: mark that planned session complete for the current week.
- Next screen: Home recommends the next incomplete planned session.
- Edge case: if the completed workout is Extra/ad-hoc, it appears in history but does not complete a planned slot.

Complete Week:
- Starting state: every planned session in the current week is complete.
- User action: tap Complete Week on Home.
- App response: show confirmation, then move the programme to the next week only after confirmation.
- Next screen: Home shows the new week and starts at session 1.
- Edge case: partial weeks do not show Complete Week.

Cancel vs Complete Workout:
- Complete Workout means finish and save/log the active workout.
- Cancel Workout means discard the active workout.
- IF the user cancels with logged sets -> warn that logged sets from the active workout will be discarded.
- IF the user confirms cancel -> remove the active workout, do not create history, do not mark a planned session complete, and do not advance the plan.

Current-week workout editing:
- Starting state: user has completed workouts in the current week.
- User action: Home -> Completed this week -> View/Edit.
- App response: open the completed workout detail.
- Editable fields: load, reps, warm-up/work designation, and delete set.
- Edge case: workouts outside the current week remain read-only for now.
- Extra sessions in the current week can be opened and edited, but remain labelled Extra.

## Top Remaining Product Decisions

1. Should accepting a deload create fully prescribed deload sessions, or is changing the block enough for the next paid QA round?
2. Should accepting a block transition apply immediately, or queue for the next calendar week?
3. Should single-block next-block choice eventually include a stronger app recommendation, or stay fully user-directed?
4. Should rotation acceptance offer multiple replacement options before applying one?
5. Should stall recommendations live in Progress only, or also appear when opening the affected exercise?
6. Should max productive-set caps ever become hard stops?
7. Should rest-day display become a true 7-day calendar or stay as training sequence only?
8. Should Capacity Focus completion later feed strategic coaching, or stay fully separate?
9. Should onboarding allow plan edits without restarting setup?
10. How much advanced control should be exposed without making Settings feel like an engineering console?

## Settings And Onboarding Control Journey

Starting state: user is in onboarding or Settings.

User action: chooses goal, plan style, schedule, split, equipment, experience, units, weight jumps, or capacity focus.

App response:
- Goal changes block sequencing, success definitions, recommendation priority, and Progress interpretation.
- Plan style changes roadmap structure.
- Days per week changes the number of planned weekly sessions.
- Equipment filters generated planned and extra sessions.
- Experience changes exercise eligibility, generated session size, and planned set targets.
- Units and weight jumps change load display and recommendation rounding.
- Low Back Capacity Focus enables real capacity routines.

Next screen:
- Onboarding saves the active plan and returns to Home.
- Settings updates preferences used by the next generated session or load recommendation.

Failure/edge cases:
- Future capacity areas are labelled Coming later and cannot be completed as real training.
- Advanced custom rep ranges are not exposed as a normal-user control yet.
- Existing history remains valid when settings change; new recommendations use the current settings where applicable.

Unresolved:
- Per-machine custom increments.
- Full advanced custom rep range UI.
- Detailed capacity tracks for hips, ankles, shoulders, and neck.

## Push / Hold / Pull Back Recommendation Journey

Starting state: user logs enough work-set performance for a load recommendation.

User action: logs a set, completes an exercise, or finishes a workout review.

App response:
- If performance earned progression and fatigue is low, show Push copy such as “You earned more weight.”
- If performance earned progression but recent cost is rising, show Hold copy such as “Hold the weight. Earn cleaner reps first.”
- If repeated decline exists, show Pull Back copy such as “Back it down.”
- If evidence is thin, keep low-data copy honest: “Log a few sessions first. The app is smart, not psychic.”

Next screen:
- In-session escalation appears only when Push is appropriate and a future work row exists.
- Workout Review can show increase, hold, or decrease next-session load recommendations.
- Progress can explain the evidence behind the recommendation.

Failure/edge cases:
- Deload suppresses push recommendations.
- Extra sessions contribute evidence but do not force planned-session progression.
- Logged sets are never rewritten by the throttle.
- RPE/RIR is never requested.

Unresolved:
- Future versions may expose more detailed evidence visualisation, but the default surface should stay quiet.

## Personalised Muscle-Volume Learning Journey

Starting state: user has several weeks of completed workout history.

User action: completes planned or extra sessions with productive work sets.

App response:
- Productive work sets are grouped by primary muscle.
- Warm-ups, cancelled workouts, incomplete rows, and below-threshold sets are ignored.
- Extra sessions count as workload and fatigue evidence, but do not complete planned sessions or advance the week.
- If evidence is thin, the app says to build more history instead of pretending certainty.

Next screen:
- Progress may show a Volume note with the most important muscle-level ladder recommendation.
- Home may show only high-priority notes, such as a meaningful extra-work warning or a clear muscle-volume adjustment.

Adjustment ladder:
- Underdosed level 1: aim for the top of the current range.
- Underdosed level 2: start one set higher next week.
- Underdosed level 3: add a low-fatigue accessory slot.
- High-cost level 1: stay near the low end of the range.
- High-cost level 2: pull one set from accessories.
- High-cost level 3: swap or remove a low-priority accessory.
- Overreaching: pull back before pushing again.

Failure/edge cases:
- Deload suppresses add-volume actions.
- Soft cap remains a guardrail, not the normal target.
- Build Strength protects main compounds before trimming them.
- Build Muscle can raise useful volume sooner when recovery supports it.
- Athletic Performance and Powerlifting Meet avoid junk volume and late aggressive changes.
- Get Leaner prefers sustainable volume, low-fatigue recovery work, and simple bias nudges before structural changes.

Unresolved:
- Future versions may expose a more detailed adjustment history screen, but the current flow already persists approved/ignored ladder decisions.

## Approving A Volume Ladder Change

Starting state: Progress or Home shows a medium/high-confidence muscle-volume recommendation.

User action: taps Apply change.

App response:
- Saves an applied volume adjustment on the active plan.
- Applies the adjustment only when future planned/generated sessions are built.
- Keeps completed workouts unchanged.
- Keeps any active workout in progress unchanged.
- Stores the action so later volume learning knows what has already been tried.

Next screen:
- Future planned sessions show the coaching intent, adjusted accessory set target, added accessory, or removed low-priority accessory depending on the approved ladder action.

User action: taps Ignore for now.

App response:
- Saves the ignored decision.
- Makes no future-session changes.
- Keeps the evidence visible in Progress.

Failure/edge cases:
- Deload blocks add-volume actions.
- Peak/taper/event-week phases block add-volume actions.
- Specificity phases restrict new exercise novelty.
- Only one volume increase per muscle per week is allowed.
- Structural add/remove is limited to one per muscle per block unless confidence is high.
- Tier A/main compounds are protected from remove/swap actions.

## Returning After A Training Gap

Starting state: the user opens the app after time away from one exercise/family or from training entirely.

User action: starts the next planned, extra, or generated workout.

App response:
- 0-7 days away: prescriptions stay unchanged.
- 8-14 days away: loads stay unchanged, but the user sees an ease-in note.
- 15-21 days away: known or estimated loads are trimmed slightly and rounded down.
- 22-35 days away: known or estimated loads are trimmed more conservatively and in-session escalation backs off.
- 36+ days away: the app presents a re-entry week tone and suppresses aggressive load pushing.

Next screen:
- Known loads show the adjusted target.
- Estimated loads can be adjusted conservatively.
- Unknown loads stay percentage-based and do not invent a weight.
- In-session escalation holds unless the return session creates new objective evidence.

Failure/edge cases:
- A break under a week is not treated as a setback.
- Completed history, PRs, approved recommendations, and logged sets are never rewritten.
- If only one exercise/family has a gap, only that area is adjusted.
- If the user logs a successful return session, normal performance-based progression resumes from the new evidence.

## Moving Into A New Training Block

Starting state: the current block is complete or the user accepts a block transition recommendation.

User action: taps Move to next block.

App response:
- Activates the next block.
- Generates future sessions with lane metadata for each exercise.
- Recalibrates known/estimated starting loads when the new block changes the rep target.
- Keeps unknown loads percentage-based until work sets create real history.
- Applies the new block's heavy exposure and lane constraints under the hood.

Next screen:
- Home shows the new active block/session.
- Train shows normal exercise cards, but prescriptions reflect the new lane constraints.
- Plan roadmap updates to the active block.

Failure/edge cases:
- Completed workouts are not rewritten.
- Active workouts already in progress are not mutated.
- Warm-ups never create block-transition working loads.
- Peak/deload suppress aggressive volume additions.
- Power work prioritises quality and may push, hold, or pull back from objective performance proxies.
- The app does not claim to measure bar speed; it protects speed intent from reps, consistency, missed work, drop-off, fatigue, and lane context.

## Primary Lift Variation Acceptance Journey

Starting state:
- The user has enough completed history for Bench Press, Standing Overhead Press, Squat, or Deadlift.
- The canonical lift has objective stall evidence.
- The app has a structured variation available for the user’s equipment and experience level.

User action:
- Opens Progress and sees the rotation recommendation.
- Chooses Replace exercise or Keep exercise.

App response:
- If Replace exercise is chosen, the app applies the structured variation to future planned sessions only.
- If Keep exercise is chosen, the app keeps the canonical lift and suppresses the immediate repeat prompt.
- The app records the primary-lift variation decision either way.
- If repeated reason/preference evidence exists, the app uses it to rank structured variations and generic fallback swaps without treating the reason as failed performance.

Next screen:
- Future Train sessions use the approved variation.
- Progress evidence shows the stall reason and the structured variation recommendation.

Failure/edge cases:
- One bad session does not trigger a variation.
- If no structured variation is safe or available, the app falls back to generic same-family rotation.
- Completed history is never mutated.
- Active workouts already in progress are not changed.
- Variations are temporary; strength and peak specificity can return the user to the canonical lift after the variation run.
- Deadlift returns to Deadlift as the canonical lift; Romanian Deadlift remains a support variation.
- Preference learning can reduce a disliked variation's ranking, but primary lifts and high-specificity variations are not silently removed forever.

## Finding And Adding Exercises

Starting state:
- The user opens Library, Add Exercise, or Swap Exercise.

User action:
- Searches for a strength variation, power movement, or hypertrophy accessory.

App response:
- Library search includes canonical exercise names plus aliases such as Chest-Supported Row, Overhead Rope Extension, Machine High Row, Rear Delt Fly Machine, Hip Thrust, and Straight Arm Cable Pulldown.
- Add Exercise search uses the same exercise library and taxonomy.
- Swap suggestions prioritise same-family options before broader alternatives.
- Structured Bench/Squat/Deadlift/OHP variation recommendations use the primary-lift variation map before generic rotation.
- Add and Swap recommendations use preference evidence: repeated preferred replacements rise, repeated disliked exercises fall, unavailable equipment cools down, and stale preferences decay.

Next screen:
- The selected exercise is added or swapped into the current/future workout according to the existing Add/Swap flow.
- The movement keeps its equipment, family, role, lane, and experience metadata so load estimates, volume learning, and progression throttle still behave.

Failure/edge cases:
- Existing equivalent movements are not duplicated just because the search term differs.
- Power and Olympic-style movements are not treated as normal hypertrophy accessories.
- Beginner users are protected from advanced/high-skill variants unless they deliberately search and choose manually.
- Specialty equipment is filtered conservatively through the existing equipment categories.

## Rep Range Occupancy Learning

Starting state:
- The user has logged multiple completed workouts for the same exercise.
- The sets include productive work sets inside the exercise's target rep range.

User action:
- Logs work sets normally.
- Does not choose a style, effort score, RPE, or RIR.

App response:
- Observes whether the exercise usually lands near the bottom, middle, or top of the rep range.
- Keeps this learning exercise-specific.
- Uses the signal as one input to the progression throttle.

Next screen:
- Most users see no new UI.
- If evidence is shown, it uses plain language such as: “Bench work is trending well even though recent reps sit near the heavy end of the range.”

Failure/edge cases:
- Warm-ups never count.
- One workout does not classify the user.
- Fatigue, deload, re-entry, and repeated decline still override occupancy.
- Occupancy does not mutate completed history or logged sets.
- The app never asks for RPE, RIR, or subjective training-style settings.

## Recovery & Cardio Journey

Starting state:
- The user chooses Recovery & Cardio during onboarding or Settings.
- Default is Recommended.

User action:
- Chooses Recommended, Minimal, or Off.
- Uses the Home weekly Recovery & Capacity target when it appears.
- Taps a direct action such as Start Recovery Cardio or Start Capacity Cardio.
- Optionally creates an extra Recovery Cardio, Capacity Cardio, or Performance Conditioning session manually.
- Logs modality, duration, optional distance, optional ease, and optional notes.

App response:
- Recommended can show a Home weekly target such as “1 / 2 sessions completed” and “2 x 20 min Recovery Cardio.”
- The Home target can show Best/Avoid timing guidance instead of scheduling exact days.
- Direct start shows a short timing check, for example “Heavy lower work is next. Keep this easy.”
- Minimal waits for stronger workload, fatigue, or goal evidence.
- Off hides cardio prompts but leaves recovery/fatigue/volume logic active.
- Extra cardio sessions are marked separate from the main plan and do not complete planned lifting slots.
- Current-week cardio logs count toward the Recovery & Capacity target, not toward planned lifting completion.
- Dose progresses conservatively: start low, add duration before frequency, reduce/pause hard conditioning when lifting fatigue rises.
- Timing and interference rules inspect active/next planned workout context when available to steer the user away from hard lower-body conditioning near heavy lower-body/deadlift work.
- The cardio logging screen can show a brief “keep this easy” style caution with an alternative when the selected session would interfere.

Next screen:
- Home may show a concise weekly target and direct start action when useful.
- Progress can show the current target, completion count, dose action, and supporting evidence.
- Train can log the extra cardio session separately from planned workouts.
- History shows cardio as cardio, not as fake sets/reps.

Failure/edge cases:
- No calorie targets, heart-rate zones, medical claims, or running-app complexity.
- Cardio suggestions should never imply the user failed lifting.
- Recovery/Capacity Cardio should support the work that matters, not become a second product.
- Cardio logs can affect recovery/capacity evidence, but they do not trigger lifting progression or complete weekly lifting slots.

## Template Architecture Journey

Starting state:
- The user has an active plan and current training block.
- The block may be Hypertrophy, Powerbuilding, Strength, Power, Peak, or Recovery Window.

User action:
- Starts the next planned workout from Home or Train.
- Optionally selects another session from the week.

App response:
- Hypertrophy and Powerbuilding sessions use muscle-coverage templates with stable main work and controlled accessory variety.
- Strength sessions bias the heavy anchor slots toward Bench Press, Barbell Back Squat, Deadlift, and Military Press/standing overhead press where the session context supports it.
- Power sessions start from true power-role work where possible: speed lifts, jumps, throws, or Olympic-derived pulls, with low-volume support.
- Peak sessions use dedicated specific, low-volume templates instead of generic Strength fallback.
- Recovery Window sessions use dedicated lower-complexity templates instead of generic Hypertrophy fallback.

Next screen:
- The workout overview still looks like a normal planned workout.
- The difference is in the exercise structure: Peak feels specific and stripped back, Recovery Window feels easier and lower-noise, Strength feels anchored, and Power feels fast-output focused.

Failure/edge cases:
- Equipment and beginner filters still apply.
- Preference, pain, unavailable-equipment, and approved replacement logic still apply.
- The app should not force high-skill power or peak variations onto beginners.
- Tactical logging, workout completion, and post-workout review do not change because template architecture changed.
