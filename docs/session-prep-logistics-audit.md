# Session Prep Logistics Audit

Date: 2026-06-18

Status: audit only. No code changes. No tests. No EAS build.

## Executive Summary

Session Prep 2.0 is coach-approved from an exercise-selection standpoint, but the default templates are not yet fully optimised for commercial gym logistics.

The best current flows are Bench, OHP, and Squat because they can usually be completed near one rack, bench, or open floor area with a band and one light implement.

The weakest current flows are Deadlift/Hinge, Pull/Row, Pull-Up, and Full Body because they can require moving between floor space, a back-extension station, a pull-up bar, bands/cables, a bench, dumbbells, and a step. Those choices are defensible as exercises, but the combined flow can feel annoying in a busy gym.

Verdict: **B) minor improvement**.

The approved exercise pools should stay. The next implementation should add equipment clustering so prep is selected from the approved pool based on:

1. first lift
2. movement pattern
3. session type
4. available local cluster

This keeps the coach-approved pool while making the experience feel more like a practical gym flow and less like a scavenger hunt.

## Audit Method

This audit evaluates the current generated Session Prep 2.0 defaults from `src/domain/training/session-prep.ts`.

Station-change estimates assume a typical commercial gym where these areas may be separate:

- open floor/bodyweight area
- rack/platform area
- bench/dumbbell area
- cable/band anchor area
- pull-up bar
- back-extension/reverse-hyper station
- box/step area

Equipment-change estimates count meaningful setup changes, not every body position change.

## Equipment Categories

| Category | Examples | Logistics notes |
|---|---|---|
| Bodyweight | Dead Bug, Bird Dog, Side Plank, Front Plank, Push Up, Deep Squat Hold, Hip Flexor Kick Out, Cat-Camel | Lowest friction if floor space is available. |
| Band | Band Pull Apart, Band Face Pull, Straight Arm Band Pulldown, External Rotation if banded, Outer Hip Circuit if banded | Low friction if user carries a band or has a rack anchor. Higher friction if bands are stored elsewhere. |
| Barbell/rack area | Wall Slide using rack/wall, Scap Push Up using rack/floor, Push Up incline on rack | Good if first lift is already at a rack. |
| Bench area | Pullover, Trap 3 Raise if chest-supported, Cuban Press seated/standing, Push Up incline | Good for bench sessions, less good for squat/deadlift if bench is elsewhere. |
| Dumbbell/kettlebell area | Goblet Squat, Cuban Press, Pullover, Trap 3 Raise | Can be annoying if the user has to leave a rack/platform to fetch a light implement. |
| Cable station | Scapular Pull Down, Straight Arm Pulldown if cable, Face Pull if cable, External Rotation if cable | Good if the workout starts near cables; poor if user is trying to hold a rack/bench. |
| Machine/special station | Back Extension, Reverse Hyper | Highest friction because the station may be occupied or far away. |
| Box/step | Reverse Step Up | Moderate friction; often easy near turf/functional space, not always near racks. |

## Current Generated Examples

### Bench First

Generated prep:

1. Dead Bug
2. Band Pull Apart
3. Cuban Press
4. Band Face Pull
5. Push Up

Equipment:

| Exercise | Equipment category | Likely station |
|---|---|---|
| Dead Bug | Bodyweight | floor near bench/rack |
| Band Pull Apart | Band | bench/rack area if band is available |
| Cuban Press | Dumbbell or bodyweight | bench/dumbbell area |
| Band Face Pull | Band | rack/bench anchor |
| Push Up | Bodyweight | floor, bench, or rack |

Equipment changes: **3**: floor/bodyweight, band, light dumbbells/no-load shoulder drill.

Station changes: **1-2** if the user has a band and light dumbbells nearby; **2-3** if dumbbells or band storage are elsewhere.

Logistics score: **Good**.

Assessment:

This is practical if framed as a bench-area cluster: floor next to bench, band on rack, very light dumbbells if available. The only friction is Cuban Press if dumbbells are not nearby. It can be performed no-load if needed, so this is acceptable.

### Overhead Press First

Generated prep:

1. Front Plank
2. Trap 3 Raise
3. External Rotation
4. Wall Slide
5. Scap Push Up

Equipment:

| Exercise | Equipment category | Likely station |
|---|---|---|
| Front Plank | Bodyweight | floor near rack |
| Trap 3 Raise | Dumbbell/bench or bodyweight | bench/dumbbell area, or hinge position near rack |
| External Rotation | Band/cable | rack/band anchor or cable |
| Wall Slide | Bodyweight/rack/wall | wall or rack upright |
| Scap Push Up | Bodyweight | floor/rack |

Equipment changes: **2-3**: floor, band/cable, optional bench/dumbbell.

Station changes: **1-2** if done around a rack with a band; **3** if Trap 3 Raise needs a bench and External Rotation needs cable.

Logistics score: **Good**.

Assessment:

This can be very practical if implemented as a rack/band cluster. The default should prefer no-load or band versions before cable/dumbbell versions when the first lift is OHP at a rack.

### Squat First

Generated prep:

1. Side Plank
2. Deep Squat Hold
3. Hip Flexor Kick Out
4. Reverse Step Up
5. Goblet Squat

Equipment:

| Exercise | Equipment category | Likely station |
|---|---|---|
| Side Plank | Bodyweight | floor near rack |
| Deep Squat Hold | Bodyweight | rack/open floor |
| Hip Flexor Kick Out | Bodyweight | rack/open floor |
| Reverse Step Up | Box/step | box, bench, or plate stack |
| Goblet Squat | Dumbbell/kettlebell | dumbbell/kettlebell area |

Equipment changes: **3**: floor/bodyweight, step/box, dumbbell/kettlebell.

Station changes: **2-3** depending on box and dumbbell location.

Logistics score: **Acceptable**.

Assessment:

Coach-approved, but not perfectly clustered. In a busy gym, leaving a squat rack to find a box and goblet load can feel clunky. A rack-area variant should be available: Side Plank, Deep Squat Hold, Hip Flexor Kick Out, Full Range Split Squat, bodyweight squat pattern. Goblet Squat is excellent but should be selected when a dumbbell/kettlebell is already easy to access.

### Deadlift / Hinge First

Generated prep:

1. Bird Dog
2. Back Extension
3. Single Leg Glute Bridge
4. Active Hang
5. Outer Hip Circuit

Equipment:

| Exercise | Equipment category | Likely station |
|---|---|---|
| Bird Dog | Bodyweight | floor/platform |
| Back Extension | Machine/special station | back-extension bench |
| Single Leg Glute Bridge | Bodyweight | floor/platform |
| Active Hang | Pull-up bar | rack or pull-up station |
| Outer Hip Circuit | Band or bodyweight | band/open floor |

Equipment changes: **4**: floor, back-extension station, pull-up bar, band/open floor.

Station changes: **3-4** in most commercial gyms.

Logistics score: **Annoying**.

Assessment:

This is the clearest logistics miss. Every exercise is defensible, but the flow may send a user from deadlift platform to back-extension station, then pull-up bar, then band/open floor. That is not ideal before deadlifting in a busy gym.

The hinge template needs clustering. A platform/rack-friendly hinge prep should prefer: Bird Dog, Single Leg Glute Bridge, Hip Hinge Drill if re-approved or retained elsewhere, Outer Hip Circuit with a band, and optional Active Hang if the pull-up bar is attached to the rack. Back Extension should be optional when the station is nearby, not a default requirement.

### Pull / Row First

Generated prep:

1. Bird Dog
2. Back Extension
3. Trap 3 Raise
4. Band Pull Apart
5. Straight Arm Band Pulldown

Equipment:

| Exercise | Equipment category | Likely station |
|---|---|---|
| Bird Dog | Bodyweight | floor |
| Back Extension | Machine/special station | back-extension bench |
| Trap 3 Raise | Dumbbell/bench or bodyweight | bench/dumbbell area |
| Band Pull Apart | Band | rack/bench/cable area |
| Straight Arm Band Pulldown | Band/cable | rack/cable anchor |

Equipment changes: **4**: floor, back-extension station, bench/dumbbell, band/cable.

Station changes: **3-4**.

Logistics score: **Annoying**.

Assessment:

The row prep template is good anatomically but not gym-efficient. If a row starts on a cable, the prep should cluster around the cable/band station. If it starts on a bench-supported row, the prep should cluster around bench + band/dumbbell. If it starts as a barbell row, the prep should cluster around rack/platform + band.

Back Extension as a default creates avoidable friction unless the first lift is actually hinge-dominant or the back-extension station is near the pull area.

### Pull-Up / Pulldown First

Generated prep:

1. Dead Bug
2. Scapular Pull Down
3. Pullover
4. Active Hang

Equipment:

| Exercise | Equipment category | Likely station |
|---|---|---|
| Dead Bug | Bodyweight | floor |
| Scapular Pull Down | Cable/band | cable station or band anchor |
| Pullover | Bench/dumbbell/band | bench/dumbbell area or band |
| Active Hang | Pull-up bar | pull-up station |

Equipment changes: **3-4**: floor, cable/band, bench/dumbbell/band, pull-up bar.

Station changes: **2-4** depending on whether the pullover is banded and whether the cable station has a pull-up bar.

Logistics score: **Acceptable to Annoying**.

Assessment:

This can be good if the user is at a cable tower with a pull-up bar and a band: Dead Bug nearby, Scapular Pull Down, band Pullover, Active Hang. It becomes annoying if Pullover means bench/dumbbell and Scapular Pull Down means cable while Active Hang is elsewhere.

Implementation should choose either a cable cluster or a pull-up-bar/rack cluster, not mix both by default.

### Full Body

Generated prep:

1. Dead Bug
2. Band Pull Apart
3. Goblet Squat
4. Pullover
5. Reverse Step Up

Equipment:

| Exercise | Equipment category | Likely station |
|---|---|---|
| Dead Bug | Bodyweight | floor |
| Band Pull Apart | Band | rack/open floor |
| Goblet Squat | Dumbbell/kettlebell | dumbbell/kettlebell area |
| Pullover | Bench/dumbbell/band | bench/dumbbell area or band |
| Reverse Step Up | Box/step | box/bench/step |

Equipment changes: **4-5**: floor, band, dumbbell/kettlebell, bench/dumbbell/band, step/box.

Station changes: **3-5**.

Logistics score: **Annoying**.

Assessment:

Full Body currently feels purposeful from a movement standpoint but not clustered. It tries to touch upper and lower patterns, but the selected combination may require collecting a band, dumbbell/kettlebell, bench, and step. In a busy gym this is a lot for a short prep.

Full Body needs the strongest cluster logic. It should be generated from the first major lift and the nearest compatible cluster, not from a fixed mixed template.

## Logistics Summary

| Scenario | Equipment changes | Station changes | Score |
|---|---:|---:|---|
| Bench first | 3 | 1-3 | Good |
| OHP first | 2-3 | 1-3 | Good |
| Squat first | 3 | 2-3 | Acceptable |
| Deadlift first | 4 | 3-4 | Annoying |
| Pull / row first | 4 | 3-4 | Annoying |
| Pull-up / pulldown first | 3-4 | 2-4 | Acceptable to Annoying |
| Full body | 4-5 | 3-5 | Annoying |

## Clustering Opportunities

### Bench Cluster

Target station: bench/rack area.

Best cluster:

- Dead Bug or Front Plank
- Band Pull Apart
- Band Face Pull
- Push Up on floor/bench/rack
- Cuban Press no-load or light dumbbells only if already nearby

Avoid by default:

- Pullover requiring a separate bench/dumbbell setup if bench is not already used.
- Cable Face Pull if it means leaving the bench/rack.

Score after clustering: **Excellent to Good**.

### OHP Cluster

Target station: rack/wall/band area.

Best cluster:

- Front Plank
- Wall Slide using rack/wall
- External Rotation with band
- Scap Push Up
- Trap 3 Raise no-load or band-supported if practical

Avoid by default:

- Cable External Rotation if the user is at a rack.
- Chest-supported Trap 3 Raise if it requires a bench trip.

Score after clustering: **Excellent to Good**.

### Squat Cluster

Target station: rack/platform area.

Best cluster:

- Side Plank
- Deep Squat Hold
- Hip Flexor Kick Out
- Full Range Split Squat
- Goblet Squat only if dumbbell/kettlebell is available near rack
- Reverse Step Up only if a box/bench is nearby

Avoid by default:

- Pairing Reverse Step Up and Goblet Squat when both require leaving the rack.

Score after clustering: **Good**.

### Deadlift Cluster

Target station: platform/rack area.

Best cluster:

- Bird Dog
- Single Leg Glute Bridge
- Outer Hip Circuit if band is available
- Active Hang only if the rack has a pull-up bar
- Back Extension only if the station is close and available

Avoid by default:

- Back Extension plus Active Hang plus band work when those are at separate stations.
- Reverse Hyper as default unless the user is already near the machine.

Score after clustering: **Good**.

### Pull / Row Cluster

Target station depends on first lift:

- cable row / pulldown: cable cluster
- chest-supported row: bench cluster
- barbell row: rack/platform cluster

Cable cluster:

- Bird Dog or Dead Bug nearby
- Straight Arm Band Pulldown or cable pulldown
- Band Pull Apart or cable Face Pull
- Scapular Pull Down if vertical-pull emphasis

Bench cluster:

- Bird Dog
- Trap 3 Raise
- Pullover
- Band Pull Apart

Rack/platform cluster:

- Bird Dog
- Band Pull Apart
- Straight Arm Band Pulldown with rack anchor
- Active Hang if pull-up bar is on rack

Avoid by default:

- Back Extension unless hinge demand is high or station proximity is known.

Score after clustering: **Good**.

### Pull-Up / Pulldown Cluster

Target station: pull-up bar or cable tower.

Pull-up-bar cluster:

- Dead Bug
- Active Hang
- Scapular Pull Up
- Pullover only if banded

Cable/pulldown cluster:

- Dead Bug
- Scapular Pull Down
- Straight-arm band/cable pulldown if available
- Pullover only if band/cable variant is used

Avoid by default:

- Bench/dumbbell Pullover if that sends the user away from the pull-up/cable station.

Score after clustering: **Excellent to Good**.

### Full Body Cluster

Current Full Body should not be fixed-mixed by default.

Better approach:

1. Determine first major lift.
2. Choose that lift's cluster.
3. Add one low-friction opposite-pattern movement if it does not require a station change.

Examples:

If Full Body starts with Squat:

- Dead Bug
- Deep Squat Hold
- Hip Flexor Kick Out
- Goblet Squat or Full Range Split Squat
- Band Pull Apart only if band is available at rack

If Full Body starts with Bench:

- Dead Bug
- Band Pull Apart
- Band Face Pull
- Push Up
- Goblet Squat only if dumbbell/kettlebell is already nearby

Score after clustering: **Good**.

## Recommended Architecture

Current selection:

```text
First lift
+
Movement pattern
+
Session type
```

Recommended selection:

```text
First lift
+
Movement pattern
+
Session type
+
equipment cluster
+
fallback cluster
```

### Why Add Equipment Clustering?

The first-lift model answers: "What should this prep support?"

The equipment-cluster model answers: "Can the user actually do this without losing their rack, bench, cable, or machine?"

Both are needed for a premium gym experience.

### Proposed Cluster Model

Add a lightweight cluster tag to prep exercises:

- `bodyweight_floor`
- `rack_band`
- `bench_db`
- `cable`
- `pullup_bar`
- `box_step`
- `back_extension_station`
- `machine_specialty`

Then select prep with rules like:

- Start with one universal core/bracing drill.
- Prefer exercises in the same cluster as the first lift.
- Allow one low-friction adjacent cluster.
- Avoid more than two station changes.
- Avoid specialty stations unless first lift or user context makes them likely.
- Prefer band/bodyweight versions before cable/dumbbell/machine versions when multiple versions satisfy the same purpose.

### Practical Defaults

For normal commercial gym use:

- Maximum equipment changes: **3**
- Maximum station changes: **2**
- Target station changes: **0-1**
- Maximum prep exercises: **5**
- Preferred prep exercises: **4**

### Fallback Behaviour

If the ideal prep exercise is not cluster-friendly, use a same-purpose alternative from the approved pool:

| Purpose | Higher-friction option | Lower-friction fallback |
|---|---|---|
| Posterior-chain prep | Back Extension | Single Leg Glute Bridge |
| Vertical-pull prep | Scapular Pull Down at cable | Active Hang / Scapular Pull Up |
| Upper-back prep | Cable Face Pull | Band Pull Apart / Band Face Pull |
| Squat rehearsal | Goblet Squat | Deep Squat Hold / Full Range Split Squat |
| Step/knee control | Reverse Step Up | Full Range Split Squat |
| Shoulder prep | Dumbbell Cuban Press | No-load Cuban Press / External Rotation band |

## Area-by-Area Verdicts

### Bench

Verdict: **Keep with minor clustering polish**.

Bench prep can be excellent if treated as a bench/rack cluster. Cuban Press should be no-load acceptable. Band Face Pull should be band-first, cable-optional.

### OHP

Verdict: **Keep with minor clustering polish**.

OHP prep should live around the rack/wall/band. Avoid forcing a bench or cable station.

### Squat

Verdict: **Minor improvement**.

The selected exercises are practical enough, but Reverse Step Up and Goblet Squat together can require leaving the rack. Cluster-aware substitution would make it feel smoother.

### Deadlift / Hinge

Verdict: **Minor improvement approaching redesign**.

Do not default to both Back Extension and Active Hang unless station proximity is known. The hinge prep should have a platform-friendly default.

### Pull / Row

Verdict: **Minor improvement**.

Back Extension should not be a default for every row-focused prep. Pick cable, bench, or rack cluster based on the first pull.

### Pull-Up / Pulldown

Verdict: **Minor improvement**.

Good pool. Needs cable-vs-bar cluster selection.

### Full Body

Verdict: **Minor improvement**.

Current output is purposeful but too equipment-hungry. Full Body should be first-lift-led with one optional opposite-pattern movement, not a fixed mixed equipment list.

## Implementation Recommendation

Do not change the approved exercise pools.

Implement a **Session Prep Logistics Layer** on top of the current selector:

1. Add equipment/station metadata for prep exercises.
2. Infer likely first-lift station:
   - Bench Press -> bench/rack
   - OHP -> rack
   - Squat -> rack
   - Deadlift -> platform/rack
   - Cable Row/Pulldown -> cable
   - Pull-Up -> pull-up bar
   - Machine row -> machine
3. Score candidates by:
   - purpose match
   - cluster match
   - station-change cost
   - setup complexity
   - whether it duplicates an already-covered purpose
4. Select:
   - one core/bracing movement
   - two to four specific movements
   - maximum two station changes
5. Prefer lower-friction versions:
   - band over cable when at rack
   - bodyweight over dumbbell when the dumbbell is only for prep
   - avoid machine/specialty stations unless already nearby

## Tests To Add If Implemented

- Bench prep can be completed in bench/rack cluster.
- Squat prep does not require both box and dumbbell by default.
- Deadlift prep does not require back-extension station and pull-up station together by default.
- Pull prep uses cable cluster when first lift is cable row or pulldown.
- Pull prep uses rack/band cluster when first lift is barbell row.
- Pull-up prep uses pull-up-bar cluster.
- Full Body prep is first-lift-led rather than fixed mixed equipment.
- No prep exceeds two station changes unless no lower-friction approved option exists.
- Approved exercise pools remain unchanged.

## Final Verdict

**B) minor improvement**.

Session Prep 2.0 does not need a coaching redesign. It needs a logistics selector so the same approved movements are chosen in gym-practical clusters.

The next build should prioritise this before expanding prep features further. A premium app should feel like it understands the user's actual gym floor, not just the movement checklist.
