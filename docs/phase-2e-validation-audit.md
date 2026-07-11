# Phase 2E Validation Audit

Date: 2026-06-13

Scope: coaching-quality validation of the evidence-based prescription architecture after Phase 2E. This audit did not change code and did not start an EAS build.

Generation method: examples were generated through the production planned-workout path:

`buildPlannedWorkoutProgramme -> generateWorkoutByFocus -> selectPlannedExercisesForWeek -> applyPlanExerciseReplacements -> applyVolumeAdjustmentsToProgramme`

Inputs used unless otherwise stated:

- Equipment: full gym
- History: empty
- Week: currentWeek 1
- Experience: intermediate, with selected beginner/advanced checks
- Date: 2026-06-08

## 1. Generated Workout Examples

The full matrix sweep was generated for:

- Goals: Build Muscle, Build Strength, Build Muscle & Strength, Get Leaner, Athletic Performance, Powerlifting Meet
- Blocks: Hypertrophy, Powerbuilding, Strength, Power, Peak, Recovery Window
- Sessions: Push, Pull, Legs, Upper, Lower, Full Body

Body-part sessions were also sampled for Build Muscle / Hypertrophy: Chest, Back, Shoulders, Arms.

### Build Muscle / Hypertrophy / Push

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Bench Press | primary_compound | Primary chest compound | 3 | 3-5 | 6 | 6-10 | horizontal_push | Primary horizontal press anchor |
| Machine Chest Press | secondary_compound | Secondary chest press | 2 | 2-4 | 5 | 8-12 | horizontal_push | Secondary press angle |
| Plate Loaded Shoulder Press Machine | secondary_compound | Shoulder compound | 2 | 2-4 | 5 | 8-12 | vertical_push | Shoulder compound support |
| Low-to-High Cable Fly | isolation | Chest isolation | 2 | 2-4 | 5 | 10-20 | isolation | Lower-fatigue chest isolation |
| Cable Lateral Raise | isolation | Delt isolation | 2 | 2-4 | 5 | 12-25 | isolation | Side-delt hypertrophy |
| EZ-Bar Skull Crusher | isolation | Triceps isolation | 2 | 2-5 | 6 | 12-25 | isolation | Triceps accessory |

Coaching read: good hypertrophy push session. Pressing sequence is coherent, isolations are lower fatigue, and small muscles have slightly more range flexibility than big compound work.

### Build Muscle / Hypertrophy / Pull

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Pull-Up | primary_compound | Primary back compound | 3 | 3-5 | 6 | 6-10 | vertical_pull | Primary back anchor |
| Lat Pulldown Machine | secondary_compound | Vertical pull | 2 | 2-4 | 5 | 8-12 | vertical_pull | Second lat angle |
| T-Bar Row | secondary_compound | Horizontal row | 2 | 2-4 | 5 | 8-12 | horizontal_pull | Rowing volume |
| Hammer Curl | isolation | Biceps isolation | 2 | 2-5 | 6 | 12-25 | isolation | Elbow-flexion support |
| Face Pull | corrective | Rear-delt isolation | 2 | 2-5 | 6 | 12-25 | isolation | Rear-delt/scapular support |

Coaching read: strong improvement over the old shortened Pull issue. It now includes vertical pull, row, biceps, and rear-delt/scapular support.

### Build Muscle / Hypertrophy / Legs

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Hack Squat | primary_compound | Primary squat pattern | 2 | 2-4 | 5 | 6-10 | squat | Primary squat pattern |
| Snatch-Grip Deadlift | secondary_compound | Hip hinge | 2 | 2-4 | 5 | 8-12 | hinge | Posterior-chain hinge |
| Walking Lunge | secondary_compound | Glute-biased compound | 2 | 2-4 | 4 | 8-12 | lunge | Unilateral lower work |
| Leg Extension | isolation | Quad isolation | 2 | 2-4 | 5 | 10-20 | isolation | Quad isolation |
| Lying Leg Curl | isolation | Hamstring isolation | 2 | 2-4 | 5 | 10-20 | isolation | Hamstring isolation |
| Single-Leg Calf Raise | isolation | Calf isolation | 2 | 2-5 | 6 | 10-25 | isolation | Calf volume |
| Machine Crunch | accessory | Core/bracing accessory | 2 | 2-3 | 4 | 10-15 | core | Direct trunk exposure |

Coaching read: complete muscle coverage. The final refinement now makes primary slot role outrank machine equipment category, so a Hack Squat or Leg Press used as the primary lower-body slot receives the primary lower-body prescription rather than being downgraded to generic machine-compound volume.

### Build Strength / Strength / Lower

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Barbell Back Squat | primary_compound | Squat anchor | 3 | 3-5 | 5 | 3-5 | squat | Main lift practice |
| Block Pull | secondary_compound | Deadlift-family anchor/support | 2 | 2-4 | 4 | 5-8 | hinge | Deadlift support |
| Machine Glute Drive | secondary_compound | Secondary lower compound | 2 | 2-3 | 4 | 5-8 | hip_thrust | Hip extension support |
| Seated Leg Curl | isolation | Hamstring support | 2 | 2-3 | 4 | 10-15 | isolation | Hamstring support |
| Cable Crunch | accessory | Core/bracing support | 2 | 2-3 | 3 | 8-12 | core | Direct trunk support |

Coaching read: coach-approved strength lower structure. It has a squat anchor, hinge support, posterior-chain accessory, hamstring support, and direct bracing.

### Build Strength / Strength / Full Body

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Barbell Back Squat | primary_compound | Squat/deadlift lower anchor | 3 | 3-5 | 5 | 3-5 | squat | Lower strength anchor |
| Bench Press | primary_compound | Bench press anchor | 3 | 3-5 | 5 | 3-5 | horizontal_push | Upper strength anchor |
| One-Arm Cable Row | secondary_compound | OHP or upper-back support | 2 | 2-4 | 4 | 5-8 | horizontal_pull | Upper-back support |
| Front Plank | corrective | Core support | 2 | 2-3 | 3 | 8-12 | core | Trunk support |

Coaching read: simple and usable. The row fulfills upper-back support, but the slot label says “OHP or upper-back support”; if OHP exposure is required that day, this can drift away from it.

### Athletic Performance / Power / Lower

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Box Jump | power | Jump or speed squat | 3 | 3-5 | 5 | 1-5 | squat | Explosive lower output |
| Hang Power Clean | power | Explosive hinge | 3 | 3-5 | 5 | 1-3 | hinge | Explosive hinge/triple extension |
| Hack Squat Plate Loaded | secondary_compound | Strength exposure | 1 | 1-3 | 3 | 5-8 | squat | Low-volume strength support |
| Donkey Calf Raise | isolation | Calf maintenance | 1 | 1-3 | 3 | 10-25 | isolation | Lower-leg support |
| Front Plank | corrective | Core/bracing support | 2 | 2-3 | 3 | 8-12 | core | Bracing support |

Coaching read: this now looks like power training, not bodybuilding with a jump pasted on top. The top two slots are genuinely explosive, and support work is capped.

### Beginner / Power / Lower

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Box Jump | power | Jump or speed squat | 3 | 3-4 | 4 | 1-5 | squat | Beginner-safe power option |
| Hack Squat Plate Loaded | secondary_compound | Strength exposure | 1 | 1-2 | 2 | 5-8 | squat | Low-volume strength support |
| Seated Calf Raise | isolation | Calf maintenance | 1 | 1-2 | 2 | 10-25 | isolation | Low-fatigue accessory |

Coaching read: safe and conservative. The final refinement now preserves low-skill trunk/bracing work before optional lower-priority support when beginner Power Lower is trimmed.

### Powerlifting Meet / Peak / Lower

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Barbell Back Squat | primary_compound | Specific squat exposure | 2 | 2-4 | 4 | 1-3 | squat | Specific peak lift |
| Deficit Deadlift | secondary_compound | Specific deadlift exposure | 1 | 1-3 | 3 | 3-5 | hinge | Specific deadlift support |
| Machine Crunch | accessory | Minimal bracing support | 1 | 1-2 | 2 | 8-12 | core | Minimal trunk support |

Coaching read: credible peaking session: specific, low volume, low accessory count. The final refinement now makes late Powerlifting Meet Peak slots prefer canonical/specific squat, bench, deadlift, and standing overhead press exposures over novelty variants when the slot pattern calls for them.

### Powerlifting Meet / Peak / Full Body

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Barbell Back Squat | primary_compound | Specific lower exposure | 2 | 2-4 | 4 | 1-3 | squat | Specific lower exposure |
| Bench Press | primary_compound | Specific upper exposure | 2 | 2-4 | 4 | 1-3 | horizontal_push | Specific upper exposure |
| Seated Cable Row | secondary_compound | Minimal upper-back support | 1 | 1-3 | 3 | 3-5 | horizontal_pull | Low-volume upper-back support |

Coaching read: good specificity and low fatigue. The final refinement now adds direct low-volume bracing support to Powerlifting Meet Peak Full Body so squat/deadlift readiness still has a trunk-support signal without turning peak into accessory volume.

### Build Muscle / Recovery Window / Legs

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Belt Squat | secondary_compound | Easy squat or press pattern | 1 | 1-2 | 3 | 8-12 | squat | Low-complexity lower pattern |
| Standing Leg Curl | isolation | Easy hamstring support | 1 | 1-2 | 2 | 10-15 | isolation | Low-fatigue hamstring work |
| Cable Crunch | accessory | Low-fatigue core support | 1 | 1-2 | 2 | 10-15 | core | Easy trunk exposure |

Coaching read: this reads as a Recovery Window, not just a normal leg day with fewer sets. Good.

### Advanced / Hypertrophy / Push

| Exercise | Role | Slot | Required | Target | Soft cap | Reps | Pattern | Why selected |
|---|---:|---|---:|---:|---:|---:|---|---|
| Bench Press | primary_compound | Primary chest compound | 3 | 3-5 | 6 | 6-10 | horizontal_push | Primary press |
| Incline Dumbbell Press | secondary_compound | Secondary chest press | 2 | 2-5 | 6 | 8-12 | horizontal_push | Secondary press |
| Machine Shoulder Press | secondary_compound | Shoulder compound | 2 | 2-5 | 6 | 8-12 | vertical_push | Shoulder support |
| Pec Deck | isolation | Chest isolation | 2 | 2-5 | 6 | 10-20 | isolation | Chest isolation |
| Front Raise | isolation | Delt isolation | 2 | 2-5 | 6 | 12-25 | isolation | Delt isolation |
| Overhead Cable Extension | isolation | Triceps isolation | 2 | 2-6 | 7 | 12-25 | isolation | Triceps accessory |

Coaching read: advanced users can tolerate more accessory range. Minor issue: front raises are less valuable than lateral/rear-delt bias for many lifters already pressing heavily.

## 2. Coaching Review

### Hypertrophy

Working well:

- Push and Pull now feel complete.
- Pull includes biceps and rear-delt/scapular work.
- Legs includes quads, hinge, unilateral/glute work, quad isolation, hamstring isolation, calves, and core.
- Exercise order is mostly sensible: compound first, then secondary, then isolation.
- Set prescriptions are differentiated: primary press 3-5, secondary 2-4, isolation 2-4, small muscles/calves 2-5, core 2-3.

Weaknesses:

- Some shoulder/chest sessions may select front-delt work where lateral/rear-delt work would be a better hypertrophy default.

Resolved final refinement:

- Lower-body machine primary slots now keep the primary slot prescription when they are selected as the primary lower-body compound.

Verdict: a hypertrophy coach would generally approve the architecture, with a note to make slot purpose outrank exercise kind for primary machine compounds.

### Strength

Working well:

- Bench, Squat, Deadlift, and OHP anchoring is visible in Strength blocks.
- Lower sessions now include direct core/bracing.
- Full Body includes lower and upper strength anchors plus trunk support.
- Accessories are lower-volume and main-lift-supportive rather than bodybuilding leftovers.

Weaknesses:

- Upper/full-body support slot can resolve to upper-back support instead of OHP exposure. That is acceptable in some weeks, but if OHP frequency is a product promise, it needs a stronger guarantee.
- Deadlift support variants can appear in lower slots, but late-stage specificity should be stricter for meet prep.

Verdict: a strength coach would approve the direction. Minor anchoring refinements remain.

### Power

Working well:

- Power sessions contain actual power exercises: Box Jump, Speed Bench, Hang Power Clean, Speed Deadlift.
- Support work is constrained to 1-3 or 2-3 ranges.
- Power Full Body includes lower power, upper power, pull support, and core.
- Beginner power avoids Olympic derivatives in the sampled lower session.

Weaknesses:

- Intermediate Athletic Performance can receive Hang Power Clean, which is appropriate only if the user is technically prepared. Filtering appears experience-aware, but skill readiness is not deeply modeled.

Resolved final refinement:

- Beginner Power Lower now preserves direct low-skill trunk/bracing before optional support work when session trimming applies.

Verdict: it now feels like power training. Beginner trunk preservation should be tightened.

### Peak

Working well:

- Peak sessions are specific and low volume.
- Main lifts use 2-4 ranges and 1-3 rep exposure.
- Accessories are reduced to 1-2 or 1-3.
- The sessions no longer look like generic Strength templates.

Weaknesses:

- General familiarity is still inferred from scoring/history rather than a dedicated long-term familiarity flag.

Resolved final refinements:

- Powerlifting Meet Peak now prefers canonical/specific lifts over novelty variants for matching peak slots.
- Powerlifting Meet Peak Full Body now includes direct low-volume bracing.

Verdict: credible peaking architecture, but meet-prep specificity rules should be stricter late.

### Recovery Window

Working well:

- Sessions are short, low-fatigue, and low-complexity.
- Exercise choices lean machine/cable/bodyweight.
- Set targets are 1-2 or 1-3.
- It feels like a transition/recovery week, not a disguised normal block.

Weaknesses:

- Full Body Recovery Window can omit direct trunk work. This is probably acceptable, but if trunk exposure is guaranteed globally, Recovery Window should preserve a light bracing slot when possible.

Verdict: coach-approved.

## 3. Core / Trunk Review

Confirmed direct trunk exposure:

- Strength Lower: Cable Crunch 2 / 2-3 / cap 3
- Strength Full Body: Front Plank 2 / 2-3 / cap 3
- Power Lower: Front Plank 2 / 2-3 / cap 3
- Power Full Body: Standing Cable Crunch 2 / 2-3 / cap 3
- Powerlifting Meet Strength Lower: Cable Crunch 2 / 2-3 / cap 3
- Powerlifting Meet Peak Lower: Machine Crunch 1 / 1-2 / cap 2

Final refinement status:

- Beginner Power Lower now retains safe low-skill trunk/bracing when trimmed.
- Powerlifting Meet Peak Full Body now includes low-volume direct bracing.

Assessment: trunk exposure is now guaranteed in the intended Strength, Power, Powerlifting Meet, Lower, and Full Body contexts covered by this audit, while still allowing Recovery Window/taper fatigue constraints to keep the dose low.

## 4. Volume Architecture Review

The architecture is no longer mostly uniform.

Examples:

- Hypertrophy Push:
  - Bench Press: required 3, target 3-5, cap 6
  - Machine Chest Press: required 2, target 2-4, cap 5
  - Cable Fly: required 2, target 2-4, cap 5
  - EZ-Bar Skull Crusher: required 2, target 2-5, cap 6

- Strength Lower:
  - Squat: required 3, target 3-5, cap 5
  - Block Pull: required 2, target 2-4, cap 4
  - Leg Curl: required 2, target 2-3, cap 4
  - Cable Crunch: required 2, target 2-3, cap 3

- Peak Lower:
  - Squat: required 2, target 2-4, cap 4
  - Deadlift support: required 1, target 1-3, cap 3
  - Core: required 1, target 1-2, cap 2

- Recovery Window Legs:
  - Easy compound: required 1, target 1-2, cap 3
  - Isolation: required 1, target 1-2, cap 2
  - Core: required 1, target 1-2, cap 2

Final refinement status: the primary-vs-machine interaction now has a deliberate rule. Slot purpose owns the prescription first; equipment kind can affect selection/scoring, but it no longer downgrades a machine lower-body exercise that is filling the primary lower-body slot.

## 5. Coaching Panel Review

Hypertrophy coach:

- Would approve the Push/Pull/Legs coverage and differentiated ranges.
- Would ask for slightly smarter delt bias and clearer primary machine compound handling.

Strength coach:

- Would approve canonical anchors, lower-volume accessories, and direct bracing.
- Would ask for stronger guarantees around OHP exposure and deadlift specificity in late meet prep.

Powerlifting coach:

- Would approve Peak volume reduction and SBD specificity in lower/full-body examples.
- Would challenge Deficit Deadlift in Peak Lower if close to meet day.
- Would ask for bracing in Powerlifting Meet Peak Full Body.

Athletic performance coach:

- Would approve actual jumps/speed/Olympic-derivative exposure and low accessory volume.
- Would ask for clearer technical readiness controls around Olympic derivatives and direct trunk work in beginner power sessions.

## 6. Architecture Scores

| Area | Score | Rationale |
|---|---:|---|
| Hypertrophy architecture | 8.5/10 | Complete coverage and differentiated ranges; primary machine lower-body slots now keep primary prescription |
| Strength architecture | 8/10 | Strong canonical anchoring and trunk support; OHP/support guarantees can improve |
| Power architecture | 8.5/10 | Clearly power-focused; beginner core preservation is fixed; skill readiness can still improve later |
| Peak architecture | 8.5/10 | Specific and low volume; meet peak now prefers canonical lifts and retains bracing |
| Recovery Window architecture | 8.5/10 | Finally feels like recovery; mostly clean |
| Core/trunk architecture | 8.5/10 | Guaranteed in the intended Strength/Power/Meet contexts with low fatigue in Peak |
| Volume architecture | 8.5/10 | Meaningfully differentiated; slot purpose now outranks exercise kind for primary slots |

## 7. Remaining Weaknesses

High priority before freeze:

1. Slot purpose should outrank exercise kind for primary slots. Resolved.
   - Example: Hack Squat or Leg Press in a primary squat/lower slot now receives the primary lower-body prescription.
   - Implemented rule: classify by template slot first, then use exercise kind for selection/scoring context.

2. Preserve trunk/bracing over lower-priority accessories when trimming. Resolved.
   - Beginner Power Lower now keeps a low-skill trunk/bracing slot before optional accessories.

3. Powerlifting Meet Peak Full Body should include direct bracing. Resolved.
   - Peak Full Body now includes low-volume bracing support.

Medium priority:

4. Late Peak / Powerlifting Meet should prefer competition-specific exposure over novelty variations unless pain/equipment requires otherwise. Resolved for canonical peak slot selection.
   - Peak squat/bench/deadlift/OHP slots now prefer canonical/specific lifts.

5. OHP exposure should be more explicit for Strength Upper/Full Body if OHP is a protected primary lift.

6. Get Leaner currently uses Build Muscle-style lifting prescriptions in the sampled Hypertrophy Push.
   - This can be acceptable if recovery/cardio and fatigue logic handle the goal, but the lifting architecture itself does not visibly lower fatigue assumptions.

Low priority:

7. Advanced hypertrophy shoulder accessory selection can bias front delts after pressing. Lateral/rear-delt bias would usually be better.

## 8. Recommended Final Coaching Changes

The final coaching pass implemented:

1. Primary slot intent wins over machine exercise kind.
2. Beginner Power Lower preserves low-skill trunk/bracing before optional support work.
3. Powerlifting Meet Peak prefers competition/canonical lifts for matching peak slots.
4. Powerlifting Meet Peak Full Body includes direct low-volume bracing.

Deferred lower-priority coaching refinements:

1. Consider a mild Get Leaner lifting-dose modifier: same exercise quality, slightly more conservative volume expansion and soft caps.
2. Strength Upper/Full Body can still receive a stronger OHP exposure guarantee if that becomes a product promise.
3. Advanced hypertrophy shoulder accessory selection can be nudged further toward lateral/rear-delt bias.

## 9. Freeze-Or-Change Recommendation

Recommendation: A) Freeze the coaching architecture and move to monetisation.

The architecture now looks coached rather than generic, and the pre-freeze issues closest to the product promise have been addressed: primary slot authority, trunk guarantees, and meet-specific peak behavior. Remaining items are valuable beta refinements, not blockers to monetisation architecture.

Build/no-build recommendation: no EAS build from this audit/refinement pass. Run the normal regression stack before the next preview build.
