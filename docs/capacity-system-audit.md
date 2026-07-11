# Capacity System Audit

Date: 2026-06-18

Status: audit only. No code changes. No EAS build.

## Executive Summary

Adaptive Strength Coach currently has the beginnings of a useful capacity system, but it is not yet a complete capacity framework.

The current shipped system is:

- **Functional for Low Back Capacity**
- **Placeholder-only for Hips, Ankles, Shoulders, and Neck**
- **Separated from main workout progression**
- **Mostly consumer-safe in copy**
- **Not yet adaptation-bucket driven**

The Low Back track is the only real capacity programme. It progresses from trunk endurance/control to posterior-chain tolerance and loaded carries. That direction is defensible, but Level 3 currently reads more like a broad exercise menu than a precise capacity prescription.

Hips, Ankles, Shoulders, and Neck are not ready as live capacity tracks. They exist as domain placeholders with generic “Controlled Range Drill” content. That is not actual capacity programming.

Final verdict: **C) major redesign before expanding capacity beyond Low Back.**

Keep Low Back with refinements. Do not promote the wider capacity system until it is rebuilt around:

```text
Capacity Focus
↓
Adaptation Bucket
↓
Exercise Pool
↓
Progression
```

## Current Architecture

### Domain Model

Implemented in:

- `src/domain/training/capacity-focus.ts`
- `src/domain/training/prep-capacity-guides.ts`
- `src/domain/training/extra-session-generator.ts`
- `app/(protected)/capacity-focus.tsx`
- `app/(protected)/(tabs)/index.tsx`
- `src/data/local/capacity-focus-repository.ts`

Current capacity focus areas:

- Low Back
- Hips
- Ankles
- Shoulders
- Neck

Current levels:

- Level 1
- Level 2
- Level 3

Only Low Back has implemented routines across all three levels.

### Current Low Back Routines

#### Low Back Foundation

Purpose:

- Trunk endurance
- Spinal control
- Bracing awareness

Frequency:

- 2-4 short exposures per week

Exercises:

- Cat-Camel: 5 reps
- McGill Curl-Up: 3 x 5-8 sec
- Side Plank: 2 x 10-20 sec each side
- Bird Dog: 2 x 5 each side

Adaptations targeted:

- Gentle spinal movement
- Anti-flexion / trunk stiffness
- Anti-lateral flexion
- Anti-extension / contralateral control
- Low-fatigue motor control

#### Low Back Resilience

Purpose:

- Improve tolerance to loading with moderate, controlled work

Frequency:

- 2-3 exposures per week

Exercises:

- Back Extension Hold: 2 x 10-20 sec
- Hip Hinge Drill: 2 x 8 reps
- Glute Bridge: 2 x 10 reps
- Side Bend: 2 x 8-12 each side

Adaptations targeted:

- Isometric posterior-chain tolerance
- Hinge pattern control
- Hip extension
- Lateral trunk tolerance

#### Low Back Capacity

Purpose:

- Build posterior-chain work capacity with controlled loading

Frequency:

- 1-3 exposures per week

Exercises:

- Reverse Hyper: 2-3 x 10-20 reps
- Single-Leg Reverse Hyper: 2 x 8-12 each side
- Back Extension: 2-3 x 8-15 reps
- Weighted Back Extension: 2 x 8-12 reps
- Single-Leg Back Extension: 2 x 8-12 each side
- Pull Through: 2 x 10-15 reps
- Hip Thrust: 2 x 8-15 reps
- Suitcase Carry: 2 x 20-40 m each side
- Farmer Carry: 2 x 20-40 m

Adaptations targeted:

- Hip extension endurance
- Posterior-chain load tolerance
- Anti-lateral flexion under carry load
- Grip/trunk bracing
- Repeatable controlled hinging

### Placeholder Capacity Routines

Hips, Ankles, Shoulders, and Neck currently resolve to placeholder routines:

- Controlled Range Drill: 2 x 8 easy reps

These are not real capacity programmes. They are architecture placeholders.

### Extra Session Capacity Path

`buildCapacitySessionProgramme` uses `getCapacityRoutine(area, 1)`. For Low Back, this maps to real low-back exercises.

For unimplemented areas, the generator can fall back to generic exercises with roles such as:

- capacity
- corrective
- resilience

That means an unimplemented area can still become a generic capacity session if exposed through UI. This is not a scientifically defensible area-specific system.

### Evidence Separation

Capacity Focus records are stored separately from workout sessions.

Current tests verify:

- Capacity work does not create normal workout sessions.
- Capacity work does not enter workout history summaries.
- Capacity work does not affect progression or volume data.

That separation is correct and should be preserved.

## What Adaptations Is the Current System Trying to Create?

The current capacity system is trying to create a mix of:

- movement control
- trunk endurance
- bracing awareness
- posterior-chain tolerance
- low-fatigue exposure
- general preparation

It is not purely mobility.

It is not purely stability.

It is not pain reduction, at least in copy and data flow.

It is a mixed preparation/capacity system, with Low Back as the only fully implemented example.

### Mobility

Current examples:

- Cat-Camel
- Hip Hinge Drill

These are movement-quality drills, not mobility programming in the strict sense.

### Stability / Control

Current examples:

- McGill Curl-Up
- Side Plank
- Bird Dog
- Back Extension Hold

This is the strongest part of the current Low Back track.

### Capacity

Current examples:

- Reverse Hyper
- Back Extension
- Weighted Back Extension
- Pull Through
- Hip Thrust
- Suitcase Carry
- Farmer Carry

These can build tolerance, but the current implementation does not yet prescribe them by adaptation bucket or control total stress tightly enough.

### Pain Reduction

The app does not explicitly claim pain reduction, and it should not.

Current copy says:

- “Not medical advice.”
- “Stop exercises that cause pain.”
- “This is training preparation and capacity work.”

That is the right consumer-safe framing.

## Evidence Review

This is a practical coaching evidence review, not a medical protocol.

### General Resistance Training and Capacity

ACSM progression guidance supports the broad idea that strength, endurance, and functional capacity improve through progressive, appropriately dosed resistance training. For this app, that means capacity work should be progressively dosed and recoverable rather than a random add-on.

Source:

- ACSM Position Stands overview: https://acsm.org/education-resources/pronouncements-scientific-communications/position-stands/
- ACSM resistance training progression publication listing: https://www.researchgate.net/publication/235653976_Progression_models_in_resistance_training_for_healthy_adults_ACSM_position_stand

### Low Back / Trunk Endurance

The current Foundation track aligns with common trunk endurance/control models: curl-up, side plank, and bird dog style work are often used to train trunk stiffness and control with relatively low movement demand.

The important distinction: this is not a guarantee of pain prevention or treatment. It is reasonable training preparation and trunk endurance work.

Sources:

- McGill back exercise discussion: https://www.backfitpro.com/designing-back-exercise-from-rehabilitation-to-enhancing-performance/
- Core stabilization summary: https://www.physio-pedia.com/Back_Exercises

### Shoulder Capacity

Shoulder capacity should not be just “band stuff.” A defensible shoulder track needs:

- rotator cuff strength/endurance
- scapular control
- serratus/lower-trap contribution
- overhead tolerance when relevant
- gradual load exposure

Recent reviews and consensus discussions support exercise as useful for rotator cuff-related shoulder function, but the app should avoid medical claims and keep this framed as training tolerance.

Sources:

- Rotator cuff exercise review: https://pmc.ncbi.nlm.nih.gov/articles/PMC12011739/
- Shoulder injury prevention/management statement: https://pmc.ncbi.nlm.nih.gov/articles/PMC10086287/

### Ankle Capacity

Ankle capacity should combine:

- dorsiflexion range
- calf/soleus strength
- tibialis/anterior lower-leg strength
- foot control
- single-leg balance/control

Dorsiflexion is relevant to squatting, landing, running, and general lower-body mechanics. However, a real track needs progression and context, not a single “ankle drill.”

Sources:

- Ankle dorsiflexion interventions review: https://pmc.ncbi.nlm.nih.gov/articles/PMC3784372/
- Dorsiflexion and sport performance commentary: https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1677383/full

### Neck Capacity

Neck work is higher-risk from a consumer product perspective. A general app should be conservative:

- isometrics first
- no casual bridges
- no aggressive loading
- no medical claims
- likely hidden unless there is a sport-specific reason

## Category-by-Category Findings

## Low Back Capacity

Verdict: **B) refine**

### Current Quality

Low Back is the only capacity area with real programming.

It covers:

- bracing
- anti-flexion
- anti-lateral flexion
- hip extension
- posterior-chain tolerance
- carries/load tolerance

It partially covers:

- anti-rotation
- progressive exposure

It does not clearly bucket exercises by adaptation.

### Adaptation Bucket Audit

| Bucket | Current Coverage | Current Exercises | Assessment |
|---|---:|---|---|
| Bracing | Strong | McGill Curl-Up, Bird Dog, carries | Good |
| Anti-flexion | Moderate | McGill Curl-Up, Bird Dog, hinge drill | Good but implicit |
| Anti-rotation | Weak | Bird Dog partly | Needs Pallof/carry progression options |
| Anti-lateral flexion | Strong | Side Plank, Suitcase Carry, Side Bend | Good |
| Hip extension | Strong | Glute Bridge, Hip Thrust, Back Extension, Reverse Hyper | Good |
| Load tolerance | Moderate | Back Extension, carries, Pull Through | Good idea, needs tighter dosing |

### Current Problems

1. Level 3 is too broad.

It includes nine exercises. A user may read this as a complete circuit, which can be too much for an “optional capacity” session.

2. Progression is general, not bucket-specific.

Current notes:

- progress reps first
- add load when repeatable
- keep controlled

Good, but too coarse.

3. Anti-rotation is underbuilt.

Low back/trunk capacity should include anti-rotation exposure, especially for lifting and carries.

### Recommendation

Keep Low Back, but restructure:

Low Back Capacity:

- Bucket 1: bracing/control
- Bucket 2: anti-lateral flexion / anti-rotation
- Bucket 3: hip extension
- Bucket 4: load tolerance/carry

Example session structure:

- 1 bracing/control drill
- 1 anti-lateral/anti-rotation drill
- 1 hip extension drill
- optional carry/load tolerance drill

Target:

- 3-4 exercises
- 6-12 minutes
- low-to-moderate effort
- no failure
- no soreness-chasing

## Hip / Pelvic Capacity

Verdict: **C) major redesign**

### Current Quality

Current state is placeholder only.

### Required Adaptation Buckets

| Bucket | Purpose |
|---|---|
| Glute function | Hip extension and pelvis control |
| Hip control | Controlled hip rotation and range ownership |
| Pelvic control | Rib/pelvis position under limb movement |
| Single-leg stability | Squat/lunge/step mechanics |
| Adductor capacity | Groin/adductor tolerance for squats, lunges, athletic work |

### Recommended Exercise Pool

Beginner-safe:

- Single Leg Glute Bridge
- Dead Bug
- Bird Dog
- 90/90 Hip Switch
- Adductor Rockback
- Reverse Step Up
- Split Squat Iso Hold

Intermediate:

- Copenhagen Side Plank Regression
- Hip Airplane Regression
- Lateral Step Down
- Cable Hip Flexion
- Lateral Lunge

Advanced:

- Copenhagen Plank
- Loaded Split Squat Iso
- Hip Airplane
- Cossack Squat

### Recommended Progression

Progress by:

- control quality
- range ownership
- hold time
- reps
- then load

Do not progress by:

- stretching harder
- chasing discomfort
- adding complexity too early

## Shoulder Capacity

Verdict: **C) major redesign**

### Current Quality

Shoulder-specific prep exists in Session Prep, but Shoulder Capacity does not exist as a real track.

### Required Adaptation Buckets

| Bucket | Purpose |
|---|---|
| Rotator cuff | External/internal rotation capacity |
| Scapular control | Retraction, upward rotation, depression/elevation control |
| Serratus / upward rotation | Overhead mechanics |
| Overhead control | Tolerate overhead positions |
| Load tolerance | Gradual pressing/pulling tolerance |

### Recommended Exercise Pool

Beginner-safe:

- External Rotation
- Band Face Pull
- Scap Push Up
- Wall Slide
- Trap 3 Raise
- Serratus Wall Slide

Intermediate:

- Cable External Rotation
- Prone Y Raise
- Bottom-Up Carry
- Half-Kneeling Landmine Press
- Low Incline Y Raise

Advanced:

- Turkish Get-Up Partial
- Overhead Carry
- Controlled Behind-Neck Press Patterning only if appropriate

### Recommended Progression

Progress by:

- reps
- control
- range
- light resistance
- position difficulty

Do not progress by:

- heavy cuff loading
- fatigue grinding
- painful overhead work

## Ankle Capacity

Verdict: **C) major redesign**

### Current Quality

Placeholder only.

### Required Adaptation Buckets

| Bucket | Purpose |
|---|---|
| Dorsiflexion | Squat/landing/running position access |
| Calf function | Gastrocnemius/soleus capacity |
| Tibialis function | Anterior lower-leg tolerance |
| Foot stability | Tripod foot, arch control |
| Single-leg control | Balance and lower-limb force transfer |

### Recommended Exercise Pool

Beginner-safe:

- Knee-to-Wall Rock
- Tibialis Raise
- Seated Soleus Raise
- Standing Calf Raise
- Foot Tripod Drill
- Single-Leg Balance

Intermediate:

- Deep Calf Raise
- Bent-Knee Calf Raise
- Loaded Knee-to-Wall Rock
- Step-Down Control
- Pogo Regression

Advanced:

- Loaded Soleus Raise
- Single-Leg Calf Raise
- Low-Level Pogos
- Deceleration Step-Down

### Recommended Progression

Progress by:

- range
- reps
- hold time
- load
- single-leg demand

Avoid:

- aggressive bouncing for beginners
- high-volume plyometrics in a general capacity track
- claiming injury prevention

## Neck Capacity

Verdict: **D) hide/defer**

### Current Quality

Placeholder only.

Neck capacity is high sensitivity for a consumer app.

### Required Adaptation Buckets

| Bucket | Purpose |
|---|---|
| Isometric flexion | Front-neck position tolerance |
| Isometric extension | Back-neck position tolerance |
| Isometric lateral flexion | Side-neck tolerance |
| Isometric rotation | Rotational control |
| Position tolerance | Comfortable neutral head/neck control |

### Recommended Exercise Pool If Ever Implemented

Beginner-safe:

- Hand-Resisted Neck Flexion Iso
- Hand-Resisted Neck Extension Iso
- Hand-Resisted Lateral Neck Iso
- Wall Neck Iso
- Chin Tuck Hold

Avoid for general users:

- Neck bridges
- loaded neck harness work
- partner-resisted neck work
- high-rep neck flexion/extension

### Recommendation

Hide Neck until a conservative, clearly non-medical, sport-aware model exists.

## Is the Current System Generic Exercise Selection or Actual Capacity Programming?

Current verdict: **mostly generic exercise selection, with Low Back partially programmed.**

### Why Low Back Is Partially Programmed

Low Back has:

- levels
- named routines
- frequency guidance
- progression notes
- movement guides
- sensible exercise progression

That is real architecture.

### Why the Wider System Is Generic

Hips, Ankles, Shoulders, and Neck have:

- placeholder names
- placeholder exercises
- no adaptation buckets
- no real exercise pools
- no progression model
- no area-specific guardrails

### Why Level 3 Low Back Still Feels Generic

Level 3 has too many exercises and does not say which adaptation each one serves.

A coach would likely ask:

- Is this a menu or a session?
- Why this exercise today?
- What adaptation are we chasing?
- What should progress next week?
- How do we stop it interfering with deadlifts/squats?

## Recommended Future Structure

### Core Model

```text
Capacity Focus
↓
Adaptation Bucket
↓
Exercise Pool
↓
Progression
```

### Data Model Recommendation

Each capacity exercise should carry:

- focus area
- adaptation bucket
- equipment
- difficulty
- risk level
- fatigue cost
- beginner suitability
- prescription
- progression method
- regression options
- contraindication-style safety copy without medical diagnosis

Example:

```text
Focus: Low Back
Bucket: Anti-lateral flexion
Exercise: Side Plank
Level: 1
Dose: 2 x 10-20 sec each side
Progression: hold quality -> longer hold -> harder lever
Risk: low
Fatigue cost: low
```

### Session Builder Recommendation

Capacity routine generation should choose:

- 1-2 required buckets
- 1 optional bucket
- 2-4 exercises total
- low-to-moderate fatigue
- no failure
- no high soreness target

### Progression Model Recommendation

Progression should be bucket-specific.

Control / bracing:

- cleaner reps
- longer holds
- harder lever

Mobility/range:

- smoother range
- repeatable range
- loaded range only later

Load tolerance:

- reps first
- then small load
- then density/frequency

Carries:

- posture quality
- distance
- load

### Scheduling Recommendation

Capacity should be suggested based on:

- selected focus
- current block
- main lift stress
- recent fatigue
- session timing
- equipment
- user adherence

General rules:

- Avoid heavy posterior-chain capacity near heavy deadlift/lower days.
- Keep capacity low fatigue during Peak and Recovery Window.
- Use more capacity in Hypertrophy/Powerbuilding base phases if recovery is good.
- Do not let capacity sessions advance the training week.
- Do not let capacity sessions create progression or PR evidence.

## Recommended Future Category Templates

### Low Back Capacity Template

Foundation:

- 1 bracing/control
- 1 anti-lateral flexion
- 1 anti-extension / bird-dog style control

Resilience:

- 1 bracing/control
- 1 hip hinge pattern
- 1 hip extension
- 1 anti-rotation or carry

Capacity:

- 1 hip extension/load tolerance
- 1 anti-lateral/anti-rotation
- 1 carry or posterior-chain endurance
- optional low-fatigue control drill

### Hip / Pelvic Capacity Template

Foundation:

- 1 pelvic control
- 1 glute activation/control
- 1 adductor or hip rotation drill

Resilience:

- 1 single-leg control
- 1 adductor capacity
- 1 glute/hip extension movement

Capacity:

- 1 loaded single-leg pattern
- 1 adductor progression
- 1 hip control under load

### Shoulder Capacity Template

Foundation:

- 1 cuff movement
- 1 scapular control
- 1 serratus/upward rotation drill

Resilience:

- 1 cuff endurance
- 1 scapular control
- 1 controlled press/carry pattern

Capacity:

- 1 controlled load tolerance movement
- 1 overhead or press-support movement
- 1 cuff/scapular accessory

### Ankle Capacity Template

Foundation:

- 1 dorsiflexion drill
- 1 calf/soleus movement
- 1 foot stability drill

Resilience:

- 1 loaded dorsiflexion
- 1 calf/soleus capacity
- 1 step-down or balance pattern

Capacity:

- 1 loaded calf/soleus movement
- 1 single-leg control movement
- optional low-level elastic/landing progression for athletic users

### Neck Capacity Template

Recommendation:

- Do not ship yet.

If shipped later:

- isometrics only at first
- very low dose
- no bridges
- no “fix neck pain” framing
- likely disabled by default

## Safety and Legal Wording

Current copy direction is good:

- “training preparation”
- “capacity”
- “readiness”
- “tolerance”
- “not medical advice”
- “stop if pain”

Keep avoiding:

- rehab
- therapy
- fix
- cure
- prevent injury
- treat pain
- pain-free promise

For capacity, preferred copy:

- “Build tolerance for training.”
- “Low-fatigue support work.”
- “Keep the dose easy enough that tomorrow’s main work is better.”
- “Stop if this causes pain.”

Avoid:

- “Heal your back.”
- “Bulletproof your shoulders.”
- “Prevent ankle injuries.”
- “Fix hip pain.”

## Gaps

### Product Gaps

1. Capacity is not yet a complete product system.
2. Hips/Ankles/Shoulders/Neck are placeholders.
3. Extra Session can still expose unsupported areas.
4. Low Back Level 3 is too broad.
5. No adaptation-bucket data model exists.
6. No capacity-specific progression engine exists.
7. No scheduling guardrail exists for capacity sessions around heavy lower/deadlift work.

### Coaching Gaps

1. Adaptation goals are implicit.
2. Exercise selection is not bucket-balanced.
3. Progression is too general.
4. Fatigue cost is not clearly controlled.
5. Some high-stress options could interfere if performed too often.

### UI Gaps

1. “Coming later” areas should not appear in a polished live app.
2. Capacity sessions should make clear what adaptation they target.
3. Users should see “why this work exists” without medical framing.

## Recommended Next Steps

### Immediate Product-Safety Recommendation

Do not expand capacity marketing yet.

Keep Low Back available, but avoid positioning the app as having a full body-wide capacity system until the model is rebuilt.

### Next Build Recommendation

1. Hide unimplemented capacity areas from all live selection surfaces.
2. Tighten Low Back Level 3 into short bucket-balanced sessions.
3. Add adaptation bucket metadata.
4. Add capacity-specific progression rules.
5. Keep capacity separate from progression, PRs, fatigue evidence, and training-week advancement.

### Future Implementation Order

1. Low Back refinement
2. Shoulder Capacity
3. Hip / Pelvic Capacity
4. Ankle Capacity
5. Neck only if there is a strong sport-specific reason

Reasoning:

- Low Back already exists.
- Shoulder capacity has clear pressing/pulling relevance.
- Hip/pelvic capacity supports lower-body work.
- Ankle capacity is useful but easier to over-medicalise.
- Neck is the highest-risk category.

## Final Verdict

Current system:

- Low Back Capacity: **B) refine**
- Shoulder Capacity: **C) major redesign**
- Hip / Pelvic Capacity: **C) major redesign**
- Ankle Capacity: **C) major redesign**
- Neck Capacity: **D) hide/defer**
- Overall Capacity System: **C) major redesign before broader rollout**

The current system is not bad. It is just not yet the complete “capacity system” the product language could imply.

The defensible future architecture is:

```text
Capacity Focus
↓
Adaptation Bucket
↓
Exercise Pool
↓
Progression
```

That model would make capacity work feel coached, purposeful, safe, and distinct from Session Prep, Warm-Up Sets, Recovery Windows, and normal workout generation.

