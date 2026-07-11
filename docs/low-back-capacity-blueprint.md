# Low Back Capacity Blueprint

Date: 2026-06-18

Status: audit / blueprint only. No code changes. No EAS build.

Reference:

- `docs/capacity-system-audit.md`

## Executive Summary

Adaptive Strength Coach should treat Low Back Capacity as a training-tolerance system, not a rehab product.

The goal is not to diagnose, treat, or promise pain reduction. The goal is to help lifters build repeatable trunk control, hip-extension tolerance, bracing endurance, and low-back robustness so they can train consistently over time.

The current Low Back track is directionally good, especially Level 1, but it needs a more precise structure:

```text
Low Back Capacity
↓
Adaptation Bucket
↓
Exercise Pool
↓
Progression Method
↓
Capacity Session
```

Final recommendation:

Build Low Back Capacity around **four primary buckets** and **three secondary buckets**.

Primary buckets:

1. Bracing / trunk stiffness
2. Anti-extension / anti-flexion control
3. Anti-lateral flexion / anti-rotation
4. Hip extension and posterior-chain tolerance

Secondary buckets:

1. Pelvic control
2. Single-leg control
3. Progressive load / exposure tolerance

Do not make “mobility” the centre of Low Back Capacity. Gentle movement can exist as preparation, but the main adaptation should be tolerance, control, and progressive exposure.

Verdict: **Implement after design approval.**

## Scope and Positioning

This system is **not**:

- rehabilitation
- medical treatment
- diagnosis
- physiotherapy advice
- a promise to prevent injury
- a promise to fix back pain

This system **is**:

- resilience work
- capacity work
- movement tolerance
- training longevity support
- low-fatigue trunk and posterior-chain exposure
- a way to build tolerance around serious lifting

Preferred user-facing framing:

- “Build tolerance for training.”
- “Low-fatigue support work.”
- “Keep the dose easy enough that tomorrow’s main work is better.”
- “Stop if this causes pain.”

Avoid:

- “Fix your back.”
- “Bulletproof your spine.”
- “Prevent back injuries.”
- “Treat low-back pain.”
- “Rehab protocol.”

## Adaptation Buckets

### Bucket Decision Summary

| Candidate Bucket | Include? | Priority | Reason |
|---|---:|---|---|
| Bracing | Yes | Primary | Core to lifting and force transfer |
| Anti-extension | Yes | Primary | Protects position under fatigue and hip-extension work |
| Anti-rotation | Yes | Primary | Important for trunk control and asymmetrical loading |
| Anti-lateral flexion | Yes | Primary | Carries and side planks map well to lifting tolerance |
| Hip extension | Yes | Primary | Glutes/hamstrings/spinal erectors share load in hinges and squats |
| Pelvic control | Yes | Secondary | Useful, but should support main buckets |
| Single-leg control | Yes | Secondary | Useful for pelvic control and asymmetry, not always required |
| Spinal endurance | Yes | Primary, folded into bracing/extension buckets | Essential, but should not be isolated as “spine fatigue for its own sake” |
| Load tolerance | Yes | Secondary-to-primary depending level | Needed for robustness, but dose carefully |
| Training exposure tolerance | Yes | System-level outcome | Outcome of the whole track, not one exercise bucket |

### Primary Bucket 1: Bracing / Trunk Stiffness

Purpose:

- Build repeatable trunk position.
- Improve force transfer between upper and lower body.
- Help users maintain position during squats, deadlifts, rows, carries, and loaded machines.

This belongs as a primary bucket.

Representative exercises:

- McGill Curl-Up
- Dead Bug
- Front Plank
- Bird Dog
- Farmer Carry

Primary progression:

- cleaner position
- longer clean holds
- more controlled reps
- harder lever
- small load only later

### Primary Bucket 2: Anti-Extension / Anti-Flexion Control

Purpose:

- Help users resist excessive lumbar movement when limbs or load move.
- Build control under reaching, hinging, pressing, and bracing contexts.

This belongs as a primary bucket, but the app should avoid fragile-spine language.

Representative exercises:

- Dead Bug
- McGill Curl-Up
- Front Plank
- Bird Dog
- Hip Hinge Drill

Primary progression:

- reach distance
- hold duration
- rep quality
- lever difficulty
- slow tempo

### Primary Bucket 3: Anti-Rotation and Anti-Lateral Flexion

Purpose:

- Train trunk control against asymmetrical force.
- Support carries, single-arm work, offset loading, squats, deadlifts, and sport/general strength work.

These should be grouped together in the model but tagged separately so the app can balance them.

Representative anti-rotation exercises:

- Pallof Press
- Bird Dog
- Half-Kneeling Pallof Press
- Cable Anti-Rotation Hold

Representative anti-lateral flexion exercises:

- Side Plank
- Suitcase Carry
- Farmer Carry
- Side Bend, used cautiously and not as heavy ego work

Primary progression:

- hold quality
- distance from anchor
- carry distance
- small load increases
- harder stance

### Primary Bucket 4: Hip Extension / Posterior-Chain Tolerance

Purpose:

- Build glute, hamstring, and spinal-extensor tolerance around hip extension.
- Help low back capacity come from the whole posterior chain, not isolated lumbar effort.

This is essential for lifters.

Representative exercises:

- Glute Bridge
- Single Leg Glute Bridge
- Back Extension
- Reverse Hyper
- Pull Through
- Hip Thrust
- Weighted Back Extension

Primary progression:

- reps
- range control
- tempo
- load
- unilateral demand

### Secondary Bucket: Pelvic Control

Purpose:

- Keep trunk/pelvis position organised while hips move.
- Support hinges, squats, lunges, deadlifts, and carries.

This should support Low Back Capacity but not dominate it.

Representative exercises:

- Dead Bug
- Bird Dog
- Single Leg Glute Bridge
- Hip Airplane Regression, future optional
- Split Squat Iso, future optional

### Secondary Bucket: Single-Leg Control

Purpose:

- Build pelvic control and tolerance under asymmetrical lower-body demand.
- Useful for bodybuilders, general lifters, and athletes.
- Less essential for pure powerlifting users unless there is a clear support need.

Representative exercises:

- Single Leg Glute Bridge
- Single-Leg Back Extension
- Split Squat Iso
- Reverse Step Up

### System Outcome: Training Exposure Tolerance

Training exposure tolerance is not one exercise. It is the outcome of:

- consistent exposure
- low-to-moderate fatigue
- progressive difficulty
- avoiding sudden spikes
- fitting work around the main plan

This should be tracked at the system level.

## Evidence Review

This section is deliberately practical. It avoids medical claims and focuses on defensible training principles.

### 1. Trunk Endurance and Control Are Reasonable Training Targets

Trunk endurance exercises such as curl-up, side plank, and bird dog are commonly used to train trunk stiffness and position control with relatively low loading. For Adaptive Strength Coach, these are best framed as low-fatigue trunk control and training preparation rather than treatment.

Relevant sources:

- McGill-style back exercise discussion: https://www.backfitpro.com/designing-back-exercise-from-rehabilitation-to-enhancing-performance/
- Core stabilization overview: https://www.physio-pedia.com/Back_Exercises
- Core stability training discussion: https://pmc.ncbi.nlm.nih.gov/articles/PMC3806175/

Coach interpretation:

- Use these drills to build repeatable control.
- Do not pretend they are magic.
- Do not make them high-fatigue.
- Do not use them to scare users about spinal fragility.

### 2. Core Training Can Support Performance Qualities

Core training can improve physical-performance variables such as balance, jump, and throwing/hitting metrics in sport contexts. The app does not need to overclaim transfer to max strength, but it can defend trunk work as force-transfer and position-control support.

Relevant source:

- Core training and performance systematic review: https://pmc.ncbi.nlm.nih.gov/articles/PMC10588579/

Coach interpretation:

- Trunk work is useful support work.
- It should not replace main lifting.
- It should be dosed so it helps training rather than stealing recovery.

### 3. Posterior-Chain Resistance Training Is Defensible

Low-back robustness for lifters should include the hips and posterior chain. Glutes, hamstrings, and spinal extensors share load in hinges, squats, rows, carries, and many machine exercises.

Relevant sources:

- Posterior-chain resistance training review: https://pmc.ncbi.nlm.nih.gov/articles/PMC7940464/
- Critical review of trunk and hip exercise prescription: https://pmc.ncbi.nlm.nih.gov/articles/PMC11872577/

Coach interpretation:

- Low Back Capacity should not be only planks.
- Hip extension work belongs.
- Loaded exposure belongs, but it must be progressive and recoverable.

### 4. Sorensen-Style Endurance Is Useful but Should Be Used Carefully

Back-extension hold/Sorensen-style endurance tests and exercises are relevant to trunk-extensor endurance, but benchmark interpretation is messy and context-dependent. The app should use holds as training exposure, not as diagnostic testing.

Relevant sources:

- Biering-Sorensen test overview: https://pubmed.ncbi.nlm.nih.gov/38171249/
- Sorensen endurance contributors: https://profiles.wustl.edu/en/publications/understanding-the-biering-s%C3%B8rensen-test-contributors-to-extensor-/

Coach interpretation:

- Back-extension holds can be useful.
- Do not present hold times as medical risk scores.
- Progress by clean position, not max suffering.

### 5. Progressive Exposure Beats Random Corrective Exercise

ACSM-style resistance-training principles support progressive dosing: volume, load, frequency, and exercise difficulty should move gradually. Capacity work should follow the same logic.

Relevant sources:

- ACSM Position Stands: https://acsm.org/education-resources/pronouncements-scientific-communications/position-stands/
- ACSM progression models listing: https://www.researchgate.net/publication/235653976_Progression_models_in_resistance_training_for_healthy_adults_ACSM_position_stand

Coach interpretation:

- The app should not randomly rotate low-back drills.
- It should progress one or two variables at a time.
- It should cap fatigue and avoid sudden spikes.

## Exercise Pool Recommendations

### Pool Rules

Every exercise should have:

- adaptation bucket
- level
- risk level
- equipment
- fatigue cost
- default prescription
- progression method
- regression
- user-facing purpose

Do not include exercises just because they are “low back exercises.”

### Bracing Pool

| Exercise | Include? | Level | Why |
|---|---:|---|---|
| Dead Bug | Yes | 1 | Low-risk trunk/pelvis control |
| McGill Curl-Up | Yes | 1 | Low-motion trunk stiffness drill |
| Front Plank | Yes | 1 | Simple anti-extension hold |
| Bird Dog | Yes | 1 | Contralateral trunk/hip control |
| Farmer Carry | Yes | 3 | Loaded bracing and grip/trunk tolerance |
| Goblet Hold | Yes | 2 | Upright bracing under simple load |

Notes:

- Dead Bug and Bird Dog overlap with anti-extension/pelvic control.
- Farmer Carry is bracing plus load tolerance.

### Anti-Extension / Anti-Flexion Pool

| Exercise | Include? | Level | Why |
|---|---:|---|---|
| Dead Bug | Yes | 1 | Easy to scale by reach |
| Front Plank | Yes | 1 | Simple hold |
| McGill Curl-Up | Yes | 1 | Controlled trunk stiffness |
| Bird Dog | Yes | 1 | Anti-extension plus pelvic control |
| Ab Wheel | Later / optional | 3 | Effective but easy to overdo |
| Hanging Leg Raise | No for Low Back Capacity default | 3 | More ab-focused; may be too much for capacity track |

Notes:

- Ab Wheel should not be an early Low Back Capacity default.
- Hanging Leg Raise belongs more in core/abs programming than low-back capacity.

### Anti-Rotation Pool

| Exercise | Include? | Level | Why |
|---|---:|---|---|
| Pallof Press | Yes | 1-2 | Easy anti-rotation drill |
| Half-Kneeling Pallof Press | Yes | 2 | Adds pelvic/hip control |
| Bird Dog | Yes | 1 | Low-risk contralateral control |
| Cable Anti-Rotation Hold | Yes | 2-3 | Loadable, measurable |
| Landmine Anti-Rotation | Later | 3 | More setup and load demand |

Notes:

- Anti-rotation is currently underbuilt in the existing Low Back system.
- Pallof Press should be added to the blueprint.

### Anti-Lateral Flexion Pool

| Exercise | Include? | Level | Why |
|---|---:|---|---|
| Side Plank | Yes | 1 | Simple, low equipment |
| Suitcase Carry | Yes | 2-3 | Strong carryover to loaded bracing |
| Farmer Carry | Yes | 3 | Bilateral loaded bracing |
| Side Bend | Maybe | 2 | Useful if controlled, but easy to misuse |
| Offset Goblet Carry | Later | 2-3 | Useful but not essential |

Notes:

- Suitcase Carry should be preferred over Side Bend for many users because it trains posture under load without encouraging heavy side flexion reps.
- Side Bend can remain but should be conservative.

### Hip Extension / Posterior Chain Pool

| Exercise | Include? | Level | Why |
|---|---:|---|---|
| Glute Bridge | Yes | 1 | Easy hip-extension entry |
| Single Leg Glute Bridge | Yes | 1-2 | Pelvic control and unilateral hip extension |
| Hip Thrust | Yes | 2-3 | Loadable hip extension |
| Back Extension | Yes | 2-3 | Posterior-chain endurance |
| Back Extension Hold | Yes | 2 | Isometric endurance |
| Reverse Hyper | Yes | 2-3 | Glute/hip extension tolerance if equipment exists |
| Pull Through | Yes | 2-3 | Hinge exposure with cable |
| Weighted Back Extension | Yes | 3 | Load tolerance, but not early |
| Good Morning | No default | 3 | Too close to main strength work; higher skill/fatigue |
| Romanian Deadlift | No default | 3 | Already main/accessory lift; too fatiguing for capacity default |

Notes:

- The capacity system should not prescribe heavy hinge lifts as “capacity” by default.
- Progressive hinge exposure can use Pull Through, Back Extension, or Hip Hinge Drill before heavier patterns.

### Pelvic Control / Single-Leg Pool

| Exercise | Include? | Level | Why |
|---|---:|---|---|
| Bird Dog | Yes | 1 | Pelvis quiet while limbs move |
| Single Leg Glute Bridge | Yes | 1-2 | Pelvic control plus hip extension |
| Single-Leg Back Extension | Yes | 3 | Higher demand, useful if controlled |
| Split Squat Iso | Later | 2 | Useful bridge to lower-body control |
| Hip Airplane Regression | Later | 3 | Good but needs coaching clarity |

Notes:

- Single-leg work should not overwhelm the low-back system.
- Use it when asymmetry/pelvic control is the target.

### Load Tolerance Pool

| Exercise | Include? | Level | Why |
|---|---:|---|---|
| Goblet Hold | Yes | 2 | Simple loaded brace |
| Suitcase Carry | Yes | 2-3 | Asymmetrical bracing |
| Farmer Carry | Yes | 3 | Bilateral load tolerance |
| Weighted Back Extension | Yes | 3 | Direct posterior-chain load tolerance |
| Pull Through | Yes | 2-3 | Hinge exposure without barbell complexity |
| Sled Drag | Later | 2-3 | Low eccentric, useful but not low-back specific |

Notes:

- Load tolerance should be the end of the progression, not the first step.
- It must be capped around heavy squat/deadlift days.

## Recommended Progression Model

### Progression Priorities

Use this hierarchy:

1. Control quality
2. Range ownership
3. Hold time or reps
4. Density / repeatability
5. Load
6. Complexity / instability

Do not start with load for most users.

### Why This Is Best for App Users

The app does not use RPE/RIR, and capacity work should not require subjective precision. The safest and easiest progression model is:

- complete prescribed work cleanly
- add a little time/reps
- then add small load or harder variation
- reduce when fatigue, pain, or main-lift interference appears

### Progression by Exercise Type

#### Isometric Bracing

Examples:

- Side Plank
- Front Plank
- Back Extension Hold
- Goblet Hold

Progress:

- 10 sec
- 15 sec
- 20 sec
- 25 sec
- harder lever or light load

Cap:

- Avoid very long holds that become boring or sloppy.
- Prefer 10-30 sec quality holds.

#### Control Reps

Examples:

- Dead Bug
- Bird Dog
- Hip Hinge Drill

Progress:

- 5 reps
- 6-8 reps
- longer reach
- slower tempo
- brief pause

Cap:

- Stop before trunk/pelvis control breaks.

#### Hip Extension Reps

Examples:

- Glute Bridge
- Back Extension
- Reverse Hyper
- Pull Through

Progress:

- reps first
- then range/tempo
- then small load

Default:

- 2 sets of 8-15
- Level 3 can use 2-3 sets of 10-20 for lower-load movements

#### Carries

Examples:

- Suitcase Carry
- Farmer Carry

Progress:

- posture quality
- distance
- then load

Default:

- 2 x 20-40 m

Cap:

- Avoid grip-destroying carries before heavy pull days.

### Autoregulation Rules

Capacity work should reduce or hold when:

- main lower-body performance is declining
- user reports fatigue/manual finish
- shutdown/drop-off is regressive or systemic
- heavy deadlift/squat is within the next 24 hours
- user is in Peak or Recovery Window

Capacity work can progress when:

- completed consistently
- no pain/limitation notes
- main training is stable or improving
- user is not accumulating systemic fatigue
- work feels repeatable across multiple exposures

## Frequency Recommendations

### Minimum Effective Dose

Minimum:

- 1 exposure per week

Better for most:

- 2 exposures per week

Higher frequency:

- 3 exposures per week only when short, low-fatigue, and not interfering with lower-body training

### Recommended Frequency by User State

| User State | Frequency | Notes |
|---|---:|---|
| No back history | 1-2x/week | Support training longevity |
| Occasional flare-ups | 2x/week | Conservative, mostly Level 1-2 |
| Frequent flare-ups | 2-3x/week but low dose | Strong safety copy; avoid heavy loading; not medical care |
| Powerlifter | 1-2x/week | Avoid near heavy squat/deadlift; carries/hinges carefully placed |
| Bodybuilder | 1-2x/week | Can use posterior-chain endurance if recoverable |
| General lifter | 1-2x/week | Keep simple and repeatable |

### Volume Guidelines

Foundation:

- 3-4 exercises
- 1-2 sets each
- 5-8 minutes

Resilience:

- 3-4 exercises
- 2 sets each
- 6-10 minutes

Capacity:

- 3-4 exercises
- 2-3 sets for one main capacity movement
- 8-12 minutes

Avoid:

- 8-10 exercise circuits
- failure
- soreness-chasing
- heavy loaded hinges as extra work

## App Integration Recommendation

### Best Architecture: D) Hybrid

Recommended:

1. **Separate capacity session** for the full track.
2. **Optional short add-on** after compatible workouts.
3. **Recovery-day work** when fatigue is low/moderate and timing is sensible.

Do not force capacity work into every workout.

### Why Not Only Separate Sessions?

Separate sessions are clean, but users may skip them. A 5-8 minute add-on after compatible upper or lower sessions may improve adherence.

### Why Not Only After Workouts?

Capacity work sometimes needs freshness and focus, especially carries and posterior-chain loading. Always placing it after training can turn it into rushed junk volume.

### Recommended Delivery Modes

#### Mode 1: Short Capacity Add-On

Use when:

- user has time
- session was not fatiguing
- next heavy lower session is not too soon

Prescription:

- 2-3 exercises
- 4-7 minutes
- mostly Level 1-2

#### Mode 2: Separate Capacity Session

Use when:

- user selected Low Back focus
- weekly training stress allows
- capacity work includes loaded tolerance

Prescription:

- 3-4 exercises
- 6-12 minutes

#### Mode 3: Recovery-Day Capacity

Use when:

- no heavy lower/body pull day next
- fatigue is low/moderate
- user is not in Peak

Prescription:

- Level 1-2
- low fatigue
- no hard loaded hinge work

## User-Type Recommendations

### No Back History

Goal:

- general robustness and trunk/hip tolerance

Default:

- Level 1 or Level 2
- 1-2x/week
- short add-ons or separate sessions

Avoid:

- making the user feel fragile
- excessive prehab work

### Occasional Flare-Ups

Goal:

- consistent low-fatigue exposure
- better control and tolerance

Default:

- Level 1 first
- progress only after consistent completion
- avoid aggressive loaded tolerance at first

Copy:

- “Keep this controlled and comfortable.”
- “This supports training tolerance.”

### Frequent Flare-Ups

Goal:

- conservative exposure
- strong safety boundaries
- avoid pretending the app is a clinician

Default:

- Level 1 only initially
- 2-3 short exposures/week
- stop if symptoms worsen

Required copy:

- “This is not medical care.”
- “If symptoms are severe, worsening, radiating, or associated with weakness/numbness, seek qualified medical advice.”

### Powerlifters

Goal:

- support squat/deadlift tolerance without adding disruptive fatigue

Default:

- 1-2x/week
- bracing/carries/anti-rotation
- hip extension only when it does not interfere

Avoid:

- hard back extensions before deadlift
- grip-heavy carries before heavy pulls
- loaded hinge capacity during late Peak

### Bodybuilders

Goal:

- posterior-chain tolerance and session durability

Default:

- 1-2x/week
- back extension/reverse hyper/glute bridge options
- more tolerance for moderate pump-style posterior-chain work if recovery is good

Avoid:

- turning capacity into a second hamstring/glute workout

### General Lifters

Goal:

- simple, repeatable, low-friction support

Default:

- Level 1-2
- 1-2x/week
- mostly bodyweight/band/light machine

Avoid:

- complex drills
- excessive explanation
- specialist equipment dependence

## Recommended Low Back Capacity Levels

### Level 1: Foundation

Goal:

- bracing
- trunk endurance
- anti-extension
- anti-lateral flexion
- pelvic control

Default session:

- Cat-Camel or easy movement prep
- McGill Curl-Up or Dead Bug
- Side Plank
- Bird Dog

Dose:

- 5-8 minutes
- 2-4x/week optional

Progression:

- cleaner control
- slightly longer holds
- slightly more reps

### Level 2: Resilience

Goal:

- bridge from control to training tolerance
- introduce hip extension and simple loaded bracing

Default session:

- Dead Bug or McGill Curl-Up
- Back Extension Hold or Glute Bridge
- Pallof Press or Side Plank
- Suitcase Carry or Goblet Hold

Dose:

- 6-10 minutes
- 1-3x/week

Progression:

- reps/hold time
- distance
- small load only after repeatability

### Level 3: Capacity

Goal:

- build posterior-chain and trunk load tolerance
- keep stress productive but recoverable

Default session:

- Back Extension or Reverse Hyper
- Pallof Press or Suitcase Carry
- Hip Thrust / Pull Through / Single-Leg Glute Bridge
- optional Farmer Carry or Back Extension Hold

Dose:

- 8-12 minutes
- 1-2x/week for most
- 3x/week only if very low-fatigue and recovery is good

Progression:

- reps first
- load second
- frequency last

Hard cap:

- never let capacity work compromise the next main lower session

## Implementation Recommendation

### Domain Types

Future implementation should add concepts similar to:

```ts
type CapacityAdaptationBucket =
  | "bracing"
  | "anti_extension"
  | "anti_rotation"
  | "anti_lateral_flexion"
  | "hip_extension"
  | "pelvic_control"
  | "single_leg_control"
  | "load_tolerance";
```

Capacity exercise metadata should include:

- focus area
- adaptation buckets
- level range
- equipment
- fatigue cost
- risk level
- beginner suitability
- default dose
- progression method
- regression

### Session Selection

Low Back Capacity session should select:

- 1 bracing/control bucket
- 1 anti-rotation or anti-lateral flexion bucket
- 1 hip-extension/load-tolerance bucket
- optional movement-prep or carry bucket

Target:

- 3-4 exercises
- no random menu of 9 exercises
- no high-fatigue stack

### Progression State

Track per bucket:

- current level
- last completed dose
- completion streak
- recent skip/manual stop
- discomfort/pain flag if existing systems support it
- interference with main training

Progress only after:

- 2-3 successful exposures
- no pain/limitation finish
- no clear main-lift interference
- no systemic fatigue spike

### Integration With Existing Systems

Must remain separate from:

- main workout progression
- PR tracking
- e1RM
- Strength Dashboard
- training-week advancement
- target-zone learning

Can inform:

- recovery/capacity reporting
- user adherence
- optional capacity recommendations
- whether to hold/reduce capacity work

## Future Extensibility

The same architecture should support future tracks:

```text
Capacity Focus
↓
Adaptation Bucket
↓
Exercise Pool
↓
Progression
↓
Capacity Session
```

### Shoulder Capacity Example

Focus:

- Shoulder

Buckets:

- rotator cuff
- scapular control
- serratus/upward rotation
- overhead control
- load tolerance

### Hip / Pelvic Capacity Example

Focus:

- Hip / Pelvic

Buckets:

- glute function
- hip control
- pelvic control
- single-leg stability
- adductor capacity

### Ankle Capacity Example

Focus:

- Ankle

Buckets:

- dorsiflexion
- calf/soleus function
- tibialis function
- foot stability
- single-leg control

### Neck Capacity Example

Focus:

- Neck

Buckets:

- isometric flexion
- isometric extension
- lateral flexion
- rotation control
- position tolerance

Recommendation:

- defer Neck until later.
- avoid bridges as default.

## Final Verdict

Low Back Capacity is worth implementing as the first real capacity track.

The current system should not be expanded by adding more random exercises. It should be rebuilt around adaptation buckets and progression.

Recommended implementation verdict:

**B) refine Low Back now, using a redesigned architecture.**

Do this before implementing Shoulder, Hip/Pelvic, Ankle, or Neck.

The ideal first release of Low Back Capacity should be:

- short
- low friction
- non-medical
- progressive
- bucket-balanced
- separate from main workout evidence
- sensitive to heavy lower-body training
- easy for users to understand

That would make it a defensible capacity system rather than a generic corrective-exercise list.

