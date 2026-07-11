# Prep / Capacity Exercise Audit

Date: 2026-06-18

Status: audit only. No code changes. No EAS build.

## Executive Summary

Adaptive Strength Coach currently has three separate “preparation” systems:

1. **Session Prep** before lifting workouts.
2. **Capacity Focus** tracks, currently only implemented properly for Low Back.
3. **Recovery & Capacity cardio / conditioning** recommendations and extra sessions.

The strongest current system is **Session Prep**. It is workout-specific, clearly optional, low-fatigue, separated from progression evidence, and supported by movement guides. Low Back Capacity is functional and generally safe, but it needs UI polish and tighter progression/exposure framing before being promoted harder.

The weakest area is the mismatch between **hidden/incomplete capacity tracks** and the **Extra Session modal**. Settings now hides Hips, Ankles, Shoulders, and Neck, but Extra Session still lets users select those capacity areas. Those areas are placeholders in the domain model and can generate generic fallback capacity sessions. That should be hidden or blocked in the next build until real area-specific programming exists.

Recovery & Capacity cardio is functional and evidence-aware, but it is not the same thing as mobility/prep. It should remain positioned as low-fatigue aerobic or conditioning work that supports lifting, not as rehab or therapeutic recovery.

Final verdict:

- Session Prep: **B) minor polish**
- Low Back Capacity: **B) minor polish**
- Hips / Ankles / Shoulders / Neck Capacity: **D) remove/hide for now**
- Recovery & Capacity cardio: **A) keep**
- General movement prep: **B) minor polish**

## Current Architecture

### Session Prep

Implemented in:

- `src/domain/training/session-prep.ts`
- `app/(protected)/session-prep.tsx`
- `app/(protected)/(tabs)/train.tsx`
- `src/data/local/session-prep-repository.ts`

Session Prep is selected from workout name/type:

- Push
- Pull
- Legs
- Upper
- Lower
- Full Body
- Arms
- Custom fallback

It creates local `SessionPrepRecord` entries with:

- completed
- skipped

Tests confirm Session Prep does not create workout sessions, does not enter the sync queue, does not affect workout history summaries, and does not affect progression or volume data.

### Capacity Focus

Implemented in:

- `src/domain/training/capacity-focus.ts`
- `app/(protected)/capacity-focus.tsx`
- `app/(protected)/settings.tsx`
- `src/data/local/capacity-focus-repository.ts`

Domain areas:

- Low Back
- Hips
- Ankles
- Shoulders
- Neck

Only Low Back is implemented. Hips, Ankles, Shoulders, and Neck are placeholder routines using “Controlled Range Drill”.

Settings currently only exposes Low Back as a toggle. However, the Capacity Focus screen still has a “Coming later” section, and the Extra Session modal still exposes all capacity areas.

### Recovery & Capacity Cardio

Implemented in:

- `src/domain/training/recovery-capacity.ts`
- `src/domain/training/recovery-capacity-delivery.ts`
- `src/domain/training/cardio-dose.ts`
- `src/domain/training/recovery-capacity-timing.ts`
- `src/domain/training/cardio-interference.ts`
- `src/domain/training/extra-session-generator.ts`
- `app/(protected)/(tabs)/index.tsx`
- `app/(protected)/(tabs)/train.tsx`

Session kinds:

- Recovery Cardio
- Capacity Cardio
- Performance Conditioning

These are logged as cardio sessions with `cardioLog`, not as lifting work. They count toward Recovery & Capacity reports and can influence fatigue lightly depending on type and perceived ease.

## Visible User Surfaces

### Home / Today

Visible:

- Recovery & Capacity card when confidence and settings allow it.
- Start Recovery Cardio / Capacity Cardio / Performance Conditioning action.
- Ignore This Week.
- Extra Session modal.

Risk:

- Extra Session modal exposes all capacity areas, including placeholders.

### Train

Visible:

- Session Prep card before a lifting workout.
- Start prep.
- Skip prep.
- Prep completed / skipped state.
- Cardio session logging for recovery/capacity/performance conditioning sessions.

Session Prep is clearly separated from work sets.

### Settings

Visible:

- Capacity Focus section.
- Low Back toggle only.
- “View capacity tracks”.
- Copy: “This is training preparation and capacity work. Not medical advice. Stop exercises that cause pain.”

This is mostly appropriate.

### Capacity Focus Screen

Visible:

- Low Back Foundation / Resilience / Capacity.
- Coming later cards for Hips, Ankles, Shoulders, Neck.

Risk:

- “Coming later” placeholders should not be shown in the live app if the goal is a polished consumer surface.

### Extra Session Modal

Visible:

- Full Session
- Extra Volume
- Capacity
- Recovery Cardio
- Capacity Cardio
- Performance Conditioning

If Capacity is selected, the modal shows:

- Low Back
- Hips
- Ankles
- Shoulders
- Neck

Risk:

- Hips / Ankles / Shoulders / Neck are selectable despite not being implemented as true programmes.

## Current Prescriptions

### Session Prep Routines

Push Prep, 5 min:

- Cuban Press: 1 x 8 controlled reps
- External Rotation: 1 x 10 each side
- Trap 3 Raise: 2 x 10 reps
- Light Pullover: 1 x 10 easy reps
- Wenning Warm-up: 3-4 movements, light high reps

Push Wenning movements:

- Band Pull-Apart: 2-4 x 15-25
- Face Pull: 2-4 x 15-25
- Triceps Pushdown: 2-4 x 15-25
- Light DB Floor Press or Push-Up: 2-4 x 15-25

Pull Prep, 6 min:

- Bird Dog: 1 x 5 each side
- Hip Hinge Drill: 1 x 8 slow reps
- Light Pullover: 1 x 10 easy reps
- Trap 3 Raise: 2 x 10 reps
- Wenning Warm-up

Pull Wenning movements:

- Band Pull-Apart: 2-4 x 15-25
- Face Pull: 2-4 x 15-25
- Straight-Arm Pulldown: 2-4 x 15-25
- Light Row or Light Curl: 2-4 x 15-25

Leg Prep, 7 min:

- Deep Squat Hold: 2 x 20 sec
- Ankle Floss: 1 x 8 each side
- Hip Flexor Kick Out: 1 x 8 each side
- Loaded Butterfly: 1 x 30 sec
- Wenning Warm-up

Leg Wenning movements:

- Goblet Squat: 2-4 x 15-25
- Back Extension: 2-4 x 15-25
- Leg Curl: 2-4 x 15-25
- Dead Bug or Hanging Knee Raise: 2-4 x 10-25

Upper Prep, 6 min:

- External Rotation: 1 x 10 each side
- Trap 3 Raise: 2 x 10 reps
- Bird Dog: 1 x 5 each side
- Light Pullover: 1 x 10 easy reps
- Wenning Warm-up

Lower Prep, 7 min:

- Cat-Camel: 5 easy reps
- Hip Hinge Drill: 1 x 8 slow reps
- Deep Squat Hold: 1 x 30 sec
- Glute Bridge: 1 x 10 easy reps
- Wenning Warm-up

Full Body Prep, 6 min:

- Cat-Camel: 5 easy reps
- External Rotation: 1 x 10 each side
- Deep Squat Hold: 1 x 20 sec
- Hip Hinge Drill: 1 x 8 slow reps
- Wenning Warm-up

Arms Prep, 4 min:

- External Rotation: 1 x 10 each side
- Light Pullover: 1 x 10 easy reps
- Band Pushdown: 1 x 15 easy reps
- Light Curl: 1 x 15 easy reps
- Wenning Warm-up

Custom Prep, 5 min:

- Cat-Camel: 5 easy reps
- External Rotation: 1 x 10 each side
- Hip Hinge Drill: 1 x 8 slow reps
- Wenning Warm-up

### Low Back Capacity Routines

Low Back Foundation, 6 min, 2-4 short exposures per week:

- Cat-Camel: 5 reps
- McGill Curl-Up: 3 x 5-8 sec
- Side Plank: 2 x 10-20 sec each side
- Bird Dog: 2 x 5 each side

Low Back Resilience, 8 min, 2-3 exposures per week:

- Back Extension Hold: 2 x 10-20 sec
- Hip Hinge Drill: 2 x 8 reps
- Glute Bridge: 2 x 10 reps
- Side Bend: 2 x 8-12 each side

Low Back Capacity, 10 min, 1-3 exposures per week:

- Reverse Hyper: 2-3 x 10-20 reps
- Single-Leg Reverse Hyper: 2 x 8-12 each side
- Back Extension: 2-3 x 8-15 reps
- Weighted Back Extension: 2 x 8-12 reps
- Single-Leg Back Extension: 2 x 8-12 each side
- Pull Through: 2 x 10-15 reps
- Hip Thrust: 2 x 8-15 reps
- Suitcase Carry: 2 x 20-40 m each side
- Farmer Carry: 2 x 20-40 m

### Placeholder Capacity Routines

Hips / Ankles / Shoulders / Neck:

- Controlled Range Drill: 2 x 8 easy reps

These are not real tracks. They exist only as architecture placeholders.

### Recovery & Capacity Cardio Prescriptions

Base recommendations:

- Build Muscle: Recovery Cardio, 2-4 x 20-30 min, easy
- Build Strength: Recovery Cardio, 2-3 x 15-25 min, easy
- Build Muscle & Strength: Recovery Cardio, 2-4 x 20-30 min, easy
- Get Leaner: Recovery Cardio, 2-4 x 20-35 min, easy
- Athletic Performance: Performance Conditioning, 3-5 x 20-35 min, moderate, beginner max 4 sessions
- Powerlifting Meet: Recovery Cardio, 1-3 x 15-25 min, easy
- Peak / taper: Recovery Cardio, 1-2 sessions, easy
- High fatigue: Recovery Cardio, 1-2 sessions, easy

Recovery Cardio options shown in logging:

- Incline walk
- Outdoor walk
- Bike
- Rower
- Ski erg
- Assault bike
- Sled push
- Run
- Sport conditioning
- Other

Intensity is logged as:

- Easy
- Moderate
- Hard

## Area-by-Area Findings

### Low Back

Assessment: **B) minor polish**

What works:

- Three levels exist.
- Exercise choices are mostly conservative and sensible.
- McGill-style trunk endurance appears in Foundation.
- Posterior-chain tolerance work appears in Resilience and Capacity.
- Movement guides are present.
- Safety copy avoids cure/therapy claims.
- Capacity records stay separate from workout progression.

Concerns:

- Level 3 includes nine exercises. It reads more like a menu than a short session.
- Weighted Back Extension, Reverse Hyper, Pull Through, Hip Thrust, and carries can be real training stress. That is fine, but the app should be clearer that users should choose/perform a small controlled dose rather than treat the list as a mandatory circuit.
- “Low Back Capacity” is close to a consumer-safe line, but copy must keep saying training capacity, not injury treatment.

Recommended next-build changes:

- Keep Low Back.
- Make Level 3 less list-heavy.
- Consider “pick 3-4” or split Level 3 into shorter templates.
- Keep all low-back work optional and separate from progression evidence.

### Hips

Assessment: **D) remove/hide for now**

Current state:

- Placeholder only in Capacity Focus.
- Hidden from Settings toggle.
- Still selectable in Extra Session modal.
- Can generate fallback generic capacity/corrective work.

Concerns:

- User expectation is hip-specific prep/capacity work.
- Actual programming is not hip-specific enough.
- Placeholder copy should not appear in live product.

Recommended next-build changes:

- Hide Hips from Extra Session and Capacity Focus until real routines exist.
- Future implementation should include hip rotation, adductor, glute med/control, hip flexor, and squat/hinge prep patterns.

### Shoulders

Assessment: **D) remove/hide for now**

Current state:

- Placeholder only in Capacity Focus.
- Hidden from Settings toggle.
- Still selectable in Extra Session modal.

What already exists elsewhere:

- Session Prep has good shoulder prep for pressing and upper work: Cuban Press, External Rotation, Trap 3 Raise, Light Pullover, Face Pull / Band Pull-Apart in Wenning prep.

Concerns:

- A dedicated Shoulder Capacity track is not implemented.
- The app already has shoulder preparation in Session Prep, so a placeholder shoulder track is unnecessary and confusing.

Recommended next-build changes:

- Hide Shoulder Capacity from Extra Session until a proper track exists.
- Keep shoulder prep inside Session Prep.

### Ankles

Assessment: **D) remove/hide for now**

Current state:

- Placeholder only in Capacity Focus.
- Hidden from Settings toggle.
- Still selectable in Extra Session modal.

What already exists elsewhere:

- Ankle Floss appears in Leg Prep.

Concerns:

- A real ankle capacity track would need more specific prescriptions for dorsiflexion, calf/soleus tolerance, foot control, and squat/run/athletic context.
- Current placeholder does not meet that standard.

Recommended next-build changes:

- Hide Ankles from Extra Session until implemented.
- Keep Ankle Floss in Leg Prep.

### Neck

Assessment: **D) remove/hide for now**

Current state:

- Placeholder only in Capacity Focus.
- Hidden from Settings toggle.
- Still selectable in Extra Session modal.
- A cautious “Neck Bridge Progression” guide exists but is not part of the active low-back/session-prep lists.

Concerns:

- Neck work is higher legal/safety sensitivity for a general consumer app.
- “Neck Capacity” can sound rehab-like or injury-prevention-like.
- Neck bridges are advanced and risky if casually surfaced.

Recommended next-build changes:

- Hide Neck entirely for now.
- Do not include neck bridges in consumer-facing programming unless there is a strong sport-specific reason, conservative alternatives, and very clear safety copy.

### General Warm-Up / Movement Prep

Assessment: **B) minor polish**

Current state:

- Session Prep provides movement prep before training.
- Dynamic warm-up ramps are separate and not part of this audit.
- Session Prep is optional, low-fatigue, and not counted toward progression.

What works:

- Workout-specific routines.
- Clear “optional” framing.
- Movement guides for all prep exercises.
- Good separation from warm-up ramp sets.

Concerns:

- Wenning Warm-up prescriptions use broad “2-4 x 15-25” ranges for several movements. This can read like a lot of work before the workout.
- The app says “3-4 movements · light high reps”, but the movement list itself can make users think they should perform all four movements for up to four sets each.

Recommended next-build changes:

- Clarify that Wenning-style primer is a choice of light movements, not mandatory max volume.
- Consider defaulting to 2 movements for most users and 3-4 only when needed.

### Cardio / Recovery Capacity Work

Assessment: **A) keep**

What works:

- Goal-specific dose ranges.
- Recovery Cardio is low intensity.
- Athletic Performance gets more conditioning.
- Peak/taper and high fatigue suppress hard conditioning.
- Timing guidance avoids hard conditioning before heavy lower/deadlift/squat contexts.
- “Ignore This Week” is week/plan scoped.
- Cardio logs are separated from lifting PR/progression calculations.

Concerns:

- Cardio modalities include harder options such as assault bike, sled push, run, and sport conditioning even for Recovery Cardio logging. This is acceptable if ease selection and copy remain clear, but the default should keep Recovery Cardio easy.
- Capacity Cardio can affect fatigue evidence if hard/moderate. That is appropriate, but copy should keep reinforcing “not another leg day”.

Recommended next-build changes:

- Keep current system.
- Consider ordering easy modalities first for Recovery Cardio.
- Keep hard modalities more clearly associated with Capacity Cardio / Performance Conditioning.

## Safety and Legal Wording Concerns

Current safety copy is mostly good:

- “This is training preparation and capacity work.”
- “Not medical advice.”
- “Stop exercises that cause pain.”
- “If symptoms are severe, worsening, radiating, or associated with weakness/numbness, seek qualified medical advice.”

The code and tests actively avoid words such as:

- rehab
- therapy
- cure
- fix pain
- treat injury

Remaining concerns:

- Low Back, Neck, and “Capacity” are sensitive categories. Copy must keep them positioned as general preparation and training tolerance work.
- “Neck Capacity” should not be visible until fully designed.
- “Low Back Capacity” is acceptable if it avoids pain-treatment framing.

Recommended copy principles:

- Use “training preparation”, “capacity”, “readiness”, “control”, “tolerance”.
- Avoid “rehab”, “therapy”, “fix”, “cure”, “prevent injury”, “treat pain”.
- Keep “stop if pain” and medical escalation language.

## Evidence-Based Assessment

### Strong Areas

- Session Prep uses common movement-preparation principles: low load, controlled motion, pattern rehearsal, trunk/shoulder/hip positioning, and low fatigue.
- Low Back Foundation resembles established trunk endurance / motor-control work without making therapeutic claims.
- Recovery & Capacity cardio respects interference, fatigue, goal, and event/peak context.
- Prep/capacity is separated from main workout progression and PR evidence.

### Weak Areas

- Placeholder capacity tracks are still reachable through Extra Session.
- Low Back Level 3 may prescribe too many exercises at once if interpreted literally.
- Wenning Warm-up can look like high-volume work if the user reads “2-4 x 15-25” across four movements as mandatory.
- Hips, Ankles, Shoulders, Neck do not yet have evidence-based routines.

## Recommended Next Build Changes

### Implement Now

1. Hide Hips, Ankles, Shoulders, and Neck from Extra Session capacity selection.
2. Hide the “Coming later” section from the live Capacity Focus screen.
3. Keep Settings showing only Low Back.
4. Clarify Wenning Warm-up as a light primer, not a mandatory high-volume circuit.
5. Tighten Low Back Level 3 so it behaves like a short routine or a small selectable menu.

### Keep As-Is

1. Session Prep being optional.
2. Session Prep being separate from progression.
3. Recovery & Capacity cardio dose and timing architecture.
4. Recovery/Cardio preference modes: Recommended, Minimal, Off.
5. Ignore This Week behavior.

### Hide Until Ready

1. Hip Capacity.
2. Ankle Capacity.
3. Shoulder Capacity.
4. Neck Capacity.
5. Any “coming later” cards or placeholder capacity language.

### Future Implementation Candidates

Hip Capacity:

- 90/90 transitions
- adductor rockback
- Copenhagen regression / side plank adductor work
- hip airplane regression
- glute med control

Ankle Capacity:

- knee-to-wall rocks
- soleus raise
- tibialis raise
- calf iso/eccentric
- foot tripod control

Shoulder Capacity:

- external rotation
- serratus wall slide
- face pull
- trap 3 raise
- scap push-up
- controlled overhead reach

Neck Capacity:

- defer.
- If ever implemented, start with very low-risk isometrics and avoid bridges for general users.

## Final Verdict

The current prep/capacity architecture is directionally good, but not ready to expand beyond Low Back and general Session Prep.

The next build should not try to implement every area. The safest, most polished path is:

1. Keep Session Prep.
2. Keep Recovery & Capacity cardio.
3. Keep Low Back Capacity with minor polish.
4. Hide all incomplete capacity areas from every live surface.
5. Avoid medical/rehab framing.

Overall verdict: **B) minor polish for shipped systems, D) hide incomplete capacity tracks.**

