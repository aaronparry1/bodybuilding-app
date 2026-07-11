# Template Architecture Audit

Date: 2026-06-12

Scope: Adaptive Strength Coach workout generator template architecture.

Status: implemented refactor complete for the highest-priority findings. No EAS build was started for the refactor.

Primary production files audited:

- `src/domain/training/ad-hoc-workout-generator.ts`
- `src/domain/training/block-training-lanes.ts`
- `src/domain/training/productive-set-targets.ts`
- `src/domain/training/planned-workout.ts`
- `src/domain/training/exercise-selection.ts`
- `src/domain/training/presets.ts`

## 1. Executive summary

Adaptive Strength Coach has a strong template foundation for hypertrophy, powerbuilding, strength, and power. The templates are deterministic, slot-based, block-aware, equipment-aware, and linked to training lanes, hybrid set ranges, progression throttle, fatigue signals, preference learning, and controlled rotation.

The architecture is not random workouts in a trench coat. It has deliberate structure.

However, it is not yet fully coach-grade across every block.

Post-refactor status:

- Dedicated Peak templates now exist instead of reusing Strength templates.
- Dedicated Deload templates now exist instead of reusing Hypertrophy templates.
- Strength templates now bias canonical Bench Press, Barbell Back Squat, Deadlift, and Military Press/standing OHP anchors where the slot calls for them.
- Power templates now use stricter power slot pools so they start from actual power-role work rather than general compounds.

Original audit findings:

- Hypertrophy templates are generally good: good muscle coverage, sensible exercise counts, compounds plus isolation, and appropriate support work.
- Powerbuilding templates are mostly credible: they add heavy primary exposures while retaining hypertrophy support. Some sessions are still closer to "hypertrophy with heavier first slots" than a fully integrated powerbuilding model.
- Strength templates are acceptable for general strength, but not yet specific enough for a serious strength coach. They lack explicit Bench/Squat/Deadlift/OHP anchoring by session and are light on targeted weak-point architecture.
- Power templates are directionally right but uneven. They include power slots and lower fatigue lanes, but some sessions can still look like general lifting with a power label.
- Peak does not have dedicated templates. Peak currently maps to the strength template family and relies on peak lane constraints to reduce dose. That is a meaningful gap.
- Deload does not have dedicated templates. Deload currently maps to the hypertrophy template family and relies on maintenance/recovery constraints to reduce dose. That is a bigger gap.
- Chest/Back/Shoulders body-part templates are now conceptually much better than crude push/pull/upper fallbacks, but they still need long-term tuning around frequency and overlap.
- The set-range and lane systems improve the templates, but they cannot fully compensate for block templates that are not block-specific.

Build/no-build recommendation:

This is not a build blocker if the next build is meant to test app stability and broad coaching logic. The highest-priority architecture fixes from this audit have now been implemented; remaining work is tuning and beta-feedback calibration.

## 2. Current template catalogue

Important architecture note:

The generator has four concrete template families:

- `hypertrophy`
- `powerbuilding`
- `strength`
- `power`

Current mapping:

- Hypertrophy block -> hypertrophy templates
- Powerbuilding block -> powerbuilding templates
- Strength block -> strength templates
- Peak block -> strength templates, then peak lane/set constraints
- Power block -> power templates
- Deload block -> hypertrophy templates, then maintenance/recovery constraints

This means Peak and Deload have lane-specific prescription behaviour, but not dedicated slot architecture.

Set-range philosophy:

- Hypertrophy primary: normally moderate/high productive ranges, often 3-5 or 4-6 depending role and context.
- Hypertrophy secondary/isolation: normal productive volume, with soft caps acting as guardrails.
- Powerbuilding primary: heavier strength lane, usually lower soft-cap bias.
- Strength primary: lower reps, fewer total slots, controlled accessory dose.
- Power: power lane with strict soft caps; maintenance work for accessories.
- Peak: peak/maintenance constraints layered onto strength slots.
- Deload: maintenance/recovery constraints layered onto hypertrophy slots.

Lane philosophy:

- `hypertrophy`: build useful work; volume learning applies strongly.
- `hypertrophy_strength`: heavy enough to matter without burying the session.
- `strength`: heavy work, controlled dose.
- `strength_support`: support strength while controlling fatigue.
- `power`: fast output, no grinders.
- `peak`: express strength, drop fatigue.
- `maintenance`: keep the quality alive.
- `recovery`: low fatigue, no chasing.

### Hypertrophy templates

| Session | Count | Slot structure | Target muscles | Philosophy |
|---|---:|---|---|---|
| Push | 6 | Primary chest compound; secondary chest press; shoulder compound; chest isolation; delt isolation; triceps isolation | Chest, shoulders, triceps | Strong bodybuilding push coverage with stable press targets plus isolation. |
| Pull | 5 | Primary back compound; vertical pull; horizontal row; biceps isolation; rear-delt isolation | Back, biceps, rear delts | Coherent pull session; enough back angles plus arm/rear-delt support. |
| Legs | 6 | Squat; hinge; glute/lunge/hip thrust; quad isolation; hamstring isolation; calf isolation | Quads, hamstrings, glutes, calves | Well-rounded lower hypertrophy template. |
| Upper | 6 | Press; row; shoulder press; vertical pull; triceps; biceps | Chest, back, shoulders, arms | Balanced upper day; good for frequency. |
| Lower | 5 | Squat; hinge; glute/leg compound; hamstring isolation; calf isolation | Quads, hamstrings, glutes, calves | Solid lower template but quad isolation is less explicit than Legs. |
| Full Body | 6 | Squat; push; pull; hinge; shoulder; core | Quads, chest, back, hamstrings, shoulders, abs | Practical full-body architecture; high compound density. |
| Chest | 5 | Chest compound; incline/secondary press; pec isolation; pressing support; small push accessory | Chest, triceps, shoulders | Good chest-specialisation day. |
| Back | 5 | Vertical pull; row; lat/upper-back accessory; biceps; rear-delt/trap | Back, rear delts, traps, biceps | Good back-specialisation day after recent template work. |
| Shoulders | 5 | Shoulder press; lateral delt; rear delt; trap/scapular; optional support | Shoulders, rear delts, traps, triceps | Strong shoulder coverage; good crossover logic. |
| Arms | 5 | Triceps compound; biceps; triceps; brachialis/forearm; long-head triceps | Biceps, triceps, forearms | Direct arm day is coherent. |

### Powerbuilding templates

| Session | Count | Slot structure | Target muscles | Philosophy |
|---|---:|---|---|---|
| Push | 6 | Heavy primary press; hypertrophy press; shoulder compound; triceps compound; delt isolation; triceps isolation | Chest, shoulders, triceps | Good blend of heavy press plus hypertrophy support. |
| Pull | 5 | Heavy row; vertical pull; supported row; biceps; rear delt | Back, biceps, rear delts | Heavy pull emphasis with support. Slightly row-dominant. |
| Legs | 5 | Heavy squat; heavy hinge; single-leg/glute compound; quad isolation; hamstring isolation | Quads, hamstrings, glutes | Strong lower powerbuilding template. Calves are omitted by default. |
| Upper | 6 | Heavy press; heavy pull; shoulder compound; vertical pull; triceps; biceps | Chest, back, shoulders, arms | Good upper strength/hypertrophy blend. |
| Lower | 5 | Heavy squat; heavy hinge; glute compound; hamstring isolation; calf isolation | Quads, hamstrings, glutes, calves | Good but could use quad isolation in some contexts. |
| Full Body | 6 | Heavy lower; heavy push; heavy pull; posterior chain; delt isolation; arms | Quads, chest, back, hamstrings, shoulders, arms | Dense but plausible. Fatigue can climb quickly. |
| Chest | 5 | Heavy chest press; hypertrophy press; pec isolation; triceps-biased press; triceps support | Chest, triceps, shoulders | Strong chest/powerbuilding day. |
| Back | 5 | Heavy row; vertical pull; upper-back row; biceps; rear-delt/trap | Back, biceps, rear delts, traps | Solid. |
| Shoulders | 5 | Heavy shoulder press; lateral delt; rear delt; trap/scapular; pressing support | Shoulders, rear delts, traps, triceps | Good shoulder powerbuilding day. |
| Arms | 5 | Heavy triceps compound; biceps; triceps; brachialis/forearm; long-head triceps | Biceps, triceps, forearms | Reasonable, though "heavy arms" is inherently less primary-lift specific. |

### Strength templates

| Session | Count | Slot structure | Target muscles | Philosophy |
|---|---:|---|---|---|
| Push | 4 | Heavy primary press; heavy secondary press; shoulder strength-hypertrophy; triceps dose | Chest, shoulders, triceps | Good general press-strength support. |
| Pull | 4 | Heavy row; heavy vertical pull; rear-delt dose; biceps dose | Back, biceps, rear delts | General upper-back strength. Not deadlift-specific. |
| Legs | 4 | Heavy squat; heavy hinge; secondary lower compound; hamstring dose | Quads, hamstrings, glutes | Good lower strength architecture. |
| Upper | 4 | Heavy press; heavy pull; shoulder secondary; small arm dose | Chest, back, shoulders, arms | Efficient upper strength template. |
| Lower | 4 | Heavy squat; heavy hinge; secondary lower compound; calf dose | Quads, hamstrings, glutes, calves | Solid, though calf support is not strength-critical. |
| Full Body | 4 | Heavy lower; heavy push; heavy pull; core | Quads, chest, back, abs | Good minimalist strength day. |
| Chest | 4 | Heavy chest press; secondary press; small chest isolation; triceps | Chest, triceps | Good chest strength support. |
| Back | 4 | Heavy row; heavy vertical pull; upper-back support; biceps | Back, rear delts, traps, biceps | Good upper-back strength support, not deadlift-specific. |
| Shoulders | 4 | Heavy shoulder press; lateral delt; rear delt; trap/scapular | Shoulders, rear delts, traps | Good OHP support, but lacks explicit trunk/bracing support. |
| Arms | 4 | Heavy triceps compound; biceps; triceps; direct arm support | Biceps, triceps | Fine for arm maintenance/support, less relevant for pure strength. |

### Power templates

| Session | Count | Slot structure | Target muscles | Philosophy |
|---|---:|---|---|---|
| Push | 4 | Explosive push; explosive overhead; strength exposure; shoulder maintenance | Chest, shoulders, triceps | Has clear power intent. |
| Pull | 4 | Explosive hinge; strength pull; vertical pull maintenance; biceps maintenance | Back, hamstrings, glutes, biceps | Better viewed as posterior-chain/pull power than pure pull. |
| Legs | 4 | Jump pattern; explosive hinge; squat strength exposure; hamstring maintenance | Quads, hamstrings, glutes | Strong power lower template. |
| Upper | 4 | Explosive push; explosive overhead; pull strength; delt maintenance | Chest, shoulders, back | Reasonable upper power template. |
| Lower | 4 | Jump pattern; explosive hinge; squat strength exposure; calf maintenance | Quads, hamstrings, glutes, calves | Good. |
| Full Body | 4 | Lower power; upper power; pull strength; core maintenance | Quads, chest, back, abs | Good compact power day. |
| Chest | 4 | Explosive chest press; press strength; chest maintenance; triceps maintenance | Chest, triceps | Good for power push/chest. |
| Back | 4 | Explosive pull; pull strength exposure; lat maintenance; rear-delt/trap maintenance | Back, rear delts, traps | Directionally good, but explosive pull candidate quality matters. |
| Shoulders | 4 | Explosive shoulder press; shoulder strength; lateral delt maintenance; rear-delt/trap maintenance | Shoulders, rear delts, traps | Good if exercise pool selects true power movements. |
| Arms | 4 | Explosive shoulder/triceps; triceps strength; biceps maintenance; triceps maintenance | Shoulders, triceps, biceps | Weakest power template. Arms are not a natural power session. |

### Peak templates

Peak now has a dedicated slot table rather than reusing Strength.

Current peak behaviour:

- Templates prioritise specific Bench/Squat/Deadlift/OHP-style exposures.
- Secondary slots are close support movements at low dose.
- Accessories are minimal maintenance/support.
- Primary/heavy slots become `peak`.
- Secondary/heavy support slots become `strength_support`.
- Accessories become `maintenance`.
- Recommended set ranges and soft caps are reduced by lane constraints.

This now gives both lower fatigue and a more specific slot structure. Remaining limitation: exact competition-lift selection still depends on the exercise library, equipment, and primary-lift variation state.

### Recovery Window templates

Recovery Window uses the internal deload block mechanics and now has a dedicated slot table rather than reusing Hypertrophy.

Current Recovery Window behaviour:

- Templates use fewer slots than normal hypertrophy.
- Slots prefer easy secondary patterns and low-fatigue isolation/support.
- Set ranges are reduced by productive-target and lane logic.
- Progression chasing is suppressed by downstream systems.

This reduces dose, complexity, and novelty risk by template design. Remaining limitation: "familiar movement" is still inferred from history/scoring rather than guaranteed by a dedicated familiarity flag.

## 3. Hypertrophy audit

Overall grade: good.

Hypertrophy templates are the strongest part of the current generator.

What works well:

- Most sessions combine stable compounds with enough isolation to cover local muscles.
- Push includes chest, shoulder, and triceps.
- Pull includes vertical pull, row, biceps, and rear-delt support.
- Legs covers squat, hinge, glute/lunge, quad isolation, hamstring isolation, and calves.
- Upper and Full Body templates are compound-dense but sensible for lower-frequency training.
- Body-part templates now have first-class chest, back, and shoulder logic.
- Set-range philosophy is compatible with hypertrophy: useful productive ranges, soft caps as guardrails, and volume learning layered later.

Literature/practical alignment:

- Current hypertrophy evidence broadly supports using sufficient weekly volume, training muscles more than once weekly where practical, and distributing volume in ways the user can recover from. The templates align with that by using moderate exercise counts and multiple muscle exposures.
- Load range is not overly narrow. This matches the practical evidence that hypertrophy can occur across a broad loading spectrum when sets are challenging enough, while heavier loading remains more specific to maximal strength.
- The app's volume ladder and soft caps help avoid treating "more sets" as always better.

Potential weaknesses:

- Lower templates may underrepresent adductors/abductors unless exercise selection or user-added work fills the gap.
- Hypertrophy Full Body is high compound density; good for efficiency, but some users may need more isolation distribution over the week.
- Chest and Back specialisation templates are good, but weekly overlap with Push/Pull/Upper can create redundant stress if body-part split is mixed with other sessions.
- Shoulders template is well covered but needs guardrails around pressing overlap in Push/Upper weeks.

Would a hypertrophy-focused lifter be happy?

Mostly yes. A coach in the Israetel/Bennett orbit would probably like the muscle coverage, direct isolation, and adjustable volume ladder. They would likely ask for better weekly muscle-volume accounting across split types and more explicit low-fatigue machine/cable bias in high-volume phases.

## 4. Powerbuilding audit

Overall grade: good but less distinctive than hypertrophy.

Powerbuilding templates add heavy primary slots and retain hypertrophy support. That is fundamentally correct.

What works:

- Push, Legs, Upper, Chest, Back, and Shoulders all include heavy exposure plus accessory work.
- Heavy lower and heavy hinge exposures appear in lower sessions.
- Arms remain accessory-oriented, which is appropriate.
- Full Body is dense but recognisably powerbuilding.

What is partial:

- Some templates read as hypertrophy templates with "heavy" labels rather than a fully integrated strength-plus-hypertrophy design.
- Powerbuilding Pull anchors on heavy row rather than a clearer deadlift/hinge or weighted pull-up hierarchy. That may be fine for general powerbuilding but not for users expecting SBD-style strength.
- Lower templates are strong, but fatigue management depends heavily on downstream throttle rather than template-level heavy exposure spacing.

Coaching assessment:

Most respected coaches would accept these as general powerbuilding templates. A more strength-specific coach would want explicit primary-lift anchoring and planned secondary variations by block segment.

## 5. Strength audit

Overall grade: acceptable for general strength, not yet strong enough for serious strength-specialist programming.

What works:

- Strength sessions reduce exercise count.
- Heavy primary and heavy secondary exposures are present.
- Pressing days include triceps/shoulder support.
- Lower days include squat and hinge patterns.
- Back days include upper-back and biceps support.
- Full Body strength is compact and fatigue-aware.

Main concerns:

- Bench, Squat, Deadlift, and Standing OHP are not explicitly guaranteed by template architecture. The exercise-selection system and primary-lift variation logic help, but the template itself is pattern-based, not canonical-lift-based.
- Deadlift support is indirect. Pull strength templates are upper-back-focused, while Legs/Lower carry hinge work. This may be okay for general strength, but it is not a complete powerlifting strength template.
- Core/bracing support is sparse outside Full Body.
- Unilateral lower work exists in Legs/Lower, but strength-specific unilateral dosage is not systematic.
- Weak-point support is generic. There is no slot-level distinction such as lockout press, pause squat, off-floor deadlift, upper-back bracing, triceps overload, etc.

Coach-lens assessment:

- Greg Nuckols/Eric Helms style: acceptable for broad strength and hypertrophy, but would likely want clearer lift specificity, volume/intensity landmarks per lift, and variation periods.
- Mike Tuchscherer style: would likely want more explicit stress management, lift-specific slots, and fatigue/readiness constraints beyond pattern templates.

Recommended direction:

Strength templates should become canonical-lift aware:

- Push/Chest: Bench or OHP primary depending session context.
- Legs/Lower: Squat primary and deadlift/hinge secondary, or vice versa.
- Pull/Back: upper-back support plus deadlift support where relevant.
- Full Body: one SBD/OHP emphasis plus reduced support, not always all heavy patterns.

## 6. Power audit

Overall grade: partial.

What works:

- Power slots exist.
- Power lane constraints suppress grinders and high fatigue.
- Lower and Full Body power templates are credible.
- Push/Chest/Shoulders power templates can work if the exercise pool selects speed-oriented movements.

What is risky:

- Some power templates are still bodybuilding-shaped: power slot, strength slot, maintenance isolation.
- Arm power is not a natural programming category. It can be support work, but a "Power Arms" session is not very coach-recognisable.
- The system does not measure bar velocity; it infers power quality from reps, consistency, missed work, drop-off, and fatigue. That is honest, but limits precision.
- Exercise selection quality matters enormously. If a power slot picks a movement that is not truly ballistic or speed-focused, the session can drift.

Coach-lens assessment:

A performance coach would likely say: "Good start, but power is not just lower reps. Where are the jumps, throws, Olympic derivatives, and strict fatigue cutoffs?" The app has some of this in the exercise library and power-quality model, but the template architecture could make it more explicit.

Recommended direction:

Power templates should generally be:

1. Explosive low-fatigue movement
2. Strength-speed or strength support
3. Low-volume assistance
4. Trunk/landing/position support where relevant

Avoid high-volume bodybuilding accessories inside power sessions unless they are clearly maintenance.

## 7. Peak audit

Overall grade after refactor: good foundation, still needs event-specific tuning.

Peak now has dedicated templates with specific primary exposures, low-volume close support, and minimal accessory work.

What works:

- Lane constraints reduce recommended sets and soft caps.
- Progression throttle, event/taper logic, and primary-lift specificity can help downstream.
- Accessories become maintenance rather than hypertrophy drivers.

Remaining limitations:

- Clear separation between peak week, taper week, and strength intensification.
- Meet-specific variation selection still depends on primary-lift variation and event/taper layers.

Coach-lens assessment:

A serious powerlifting or peaking coach would not call the current peak template architecture complete. They may accept the downstream constraints as safety rails, but the slot structure itself should be peak-specific.

Recommended peak architecture:

- Primary specific lift exposure
- Optional very close variation or secondary specific exposure
- Minimal low-fatigue support
- Optional trunk/upper-back maintenance
- No novel accessories
- Very low total exercise count

## 8. Recovery Window audit

Overall grade after refactor: good foundation, still needs familiarity tuning.

Recovery Window now has dedicated lower-complexity templates and reduced slot counts.

What works:

- Set targets are reduced.
- Progression chasing is suppressed elsewhere.
- The overall workload should fall.

Remaining limitations:

- Familiar movement bias.
- Separate "movement practice" versus "recovery pump" templates.

Risk:

The Recovery Window structure is now intentionally easier, but exact familiarity still depends on scoring/history.

Coach-lens assessment:

Most coaches would agree recovery weeks can be handled by reducing volume/intensity on familiar lifts. But they would not want a recovery-window generator to accidentally introduce new high-skill or unfamiliar movements just because the general hypertrophy template asks for a slot.

Recommended deload architecture:

- Familiar primary pattern, easy dose
- One or two low-fatigue accessories
- Optional mobility/prep/resilience work
- No novelty unless replacing painful/unavailable movements
- Low total exercise count

## 9. Volume architecture review

### Push/Pull/Legs coherence

Push and Legs are six-slot hypertrophy templates. Pull is five slots. This is coherent if Pull includes enough back and arm support, which it now does.

Potential issue:

Back can often tolerate and require substantial volume. Some users may need an optional second biceps or lat isolation slot in high-volume hypertrophy or body-part phases.

### Chest/Back/Shoulders coherence

Chest, Back, and Shoulders are now real body-part templates, not crude aliases.

Strengths:

- Chest is chest-dominant.
- Back includes vertical pull, row, biceps, rear-delt/trap.
- Shoulders includes press, lateral delt, rear delt, trap/scapular support.

Risks:

- Shoulder overlap with Push/Upper can accumulate quickly.
- Back overlap with Pull/Upper can be productive but needs weekly volume controls.
- Chest specialisation plus Push/Upper can overdo pressing if recovery is poor.

### Full Body coherence

Full Body templates are sensible for 1-3 day users and compact for strength/power phases.

Risk:

Hypertrophy Full Body has high compound density. This is efficient but may be fatiguing for newer users if not moderated by experience and session length.

### Compound/isolation balance

Hypertrophy:

- Good compound plus isolation mix.
- Machines/cables are available through exercise selection, but templates do not explicitly bias toward low-fatigue machine compounds in high-volume contexts.

Powerbuilding:

- Good heavy plus accessory mix.
- Some sessions need more specificity to separate them from heavy hypertrophy.

Strength:

- Good exercise count control.
- Needs stronger canonical lift anchoring and weak-point support.

Power:

- Exercise count is controlled.
- Power slot quality must be protected.

Peak/Deload:

- Main architecture weakness: inherited templates.

## 10. Literature comparison

This assessment is grounded in broad evidence and practical coaching consensus rather than one isolated study.

Useful references:

- ACSM progression models for resistance training: https://pubmed.ncbi.nlm.nih.gov/19204579/
- Resistance training volume review: https://pmc.ncbi.nlm.nih.gov/articles/PMC8884877/
- Resistance training frequency and hypertrophy meta-analysis: https://pubmed.ncbi.nlm.nih.gov/27102172/
- Low-load vs high-load hypertrophy/strength evidence: https://pmc.ncbi.nlm.nih.gov/articles/PMC7706639/
- Resistance training load effects on hypertrophy and strength: https://pmc.ncbi.nlm.nih.gov/articles/PMC8126497/
- Resistance training variables umbrella review: https://pmc.ncbi.nlm.nih.gov/articles/PMC9302196/
- Power training comparison review: https://pmc.ncbi.nlm.nih.gov/articles/PMC9367108/

Practical synthesis:

- Hypertrophy benefits from enough weekly hard sets, adequate muscle coverage, progression, and recoverability. Current hypertrophy templates are broadly aligned.
- Strength is more load- and skill-specific. Current strength templates are directionally aligned but need stronger canonical lift specificity.
- Power training should emphasise intent, speed, low fatigue, and quality. Current power templates include that idea but should more strongly privilege explosive exercise categories.
- Peak/taper training should reduce fatigue, reduce novelty, and preserve specificity. Current peak architecture is not specific enough.
- Deloads should reduce stress and complexity while preserving movement familiarity. Current deload architecture is too dependent on set reduction.

Coach archetype assessment:

- Mike Israetel: likely approves hypertrophy volume structure and muscle coverage; likely asks for clearer volume landmarks by muscle across the week and better deload template specificity.
- Eric Helms: likely appreciates evidence-based flexibility and autoregulation; likely asks for clearer specificity and fatigue management in strength/peak phases.
- Greg Nuckols: likely accepts general strength templates but wants more lift-specific progression and less generic accessory prescription for strength blocks.
- Mike Tuchscherer: likely wants more explicit stress/fatigue classification tied to lift-specific decisions and clearer peaking architecture.
- Joe Bennett: likely likes direct muscle coverage and machine/cable potential; likely wants more exercise-order intent and better low-fatigue hypertrophy exercise bias.

## 11. Recommended architecture

These are recommendations only. Do not implement from this document without a separate scoped build request.

### Hypertrophy

Hypertrophy Push:

1. Stable press or machine press
2. Secondary press at different angle
3. Shoulder/delt movement
4. Chest isolation
5. Lateral delt isolation
6. Triceps isolation

Hypertrophy Pull:

1. Stable vertical or row primary
2. Opposite-plane back movement
3. Lat or upper-back accessory
4. Rear-delt/trap support
5. Biceps isolation
6. Optional second biceps/lat slot when volume ladder supports it

Hypertrophy Legs:

1. Squat or press pattern
2. Hinge or hamstring compound
3. Unilateral/glute slot
4. Quad isolation
5. Hamstring isolation
6. Calves
7. Optional adductor/abductor where body-part/full-gym context supports it

### Powerbuilding

Powerbuilding sessions should have:

1. Heavy primary lift or close variation
2. Secondary compound with hypertrophy-friendly reps
3. Low-to-moderate fatigue accessory
4. Targeted isolation/support
5. Optional arm/delt/calf work depending split

Add more explicit primary-lift intent:

- Bench/OHP on Push/Chest/Shoulders
- Squat/Deadlift on Legs/Lower
- Heavy row/weighted pull-up as support, not replacement for deadlift where deadlift is the goal

### Strength

Strength Push:

1. Bench or OHP primary
2. Close secondary press
3. Targeted triceps/upper-back/shoulder support
4. Low-fatigue accessory
5. Optional core/bracing

Strength Pull:

1. Heavy upper-back or weighted pull-up
2. Deadlift-support slot if goal/block needs it
3. Rear-delt/trap/upper-back support
4. Biceps/elbow-flexion maintenance

Strength Legs/Lower:

1. Squat or deadlift primary
2. Opposite lower primary/support
3. Unilateral or posterior-chain support
4. Hamstring/quad support
5. Core/bracing

### Power

Power sessions should be:

1. Explosive movement first
2. Strength-speed/support movement second
3. Low-volume assistance
4. Trunk/landing/scapular position support

Avoid:

- high-volume isolation
- power arms as a major template identity
- slow grindy exercise choices in power slots

### Peak

Create dedicated peak templates.

Peak Push/Chest:

1. Specific bench/OHP exposure
2. Very close secondary or technical exposure
3. Minimal triceps/upper-back support

Peak Legs/Lower:

1. Specific squat or deadlift exposure
2. Very close opposite lift or technical variant
3. Minimal posterior-chain/core support

Peak Full Body:

1. One or two specific lifts
2. Minimal support
3. No novelty

### Deload

Create dedicated deload templates.

Deload template principles:

1. Familiar primary movement, easy dose
2. One or two low-fatigue accessories
3. Optional recovery/prep movement
4. No new high-skill variations
5. Low total exercise count

## 12. Template quality scoring

Scale:

- 1-3: poor fit
- 4-6: partial/usable but needs work
- 7-8: good
- 9-10: excellent

Columns:

- H = Hypertrophy suitability
- S = Strength suitability
- FM = Fatigue management
- EQ = Exercise selection quality
- PF = Progression friendliness
- RF = Recovery friendliness

### Hypertrophy

| Template | H | S | FM | EQ | PF | RF | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| Push | 9 | 6 | 7 | 8 | 8 | 7 | Strong coverage. |
| Pull | 8 | 6 | 7 | 8 | 8 | 7 | Good after biceps ordering fix; optional extra slot later. |
| Legs | 9 | 6 | 6 | 8 | 8 | 6 | Great coverage; fatigue can climb. |
| Upper | 8 | 6 | 7 | 8 | 8 | 7 | Balanced. |
| Lower | 8 | 6 | 7 | 7 | 8 | 7 | Could add quad/adductor option. |
| Full Body | 8 | 7 | 6 | 8 | 7 | 6 | Efficient but compound-dense. |
| Chest | 9 | 6 | 7 | 8 | 8 | 7 | Strong specialization. |
| Back | 9 | 6 | 7 | 8 | 8 | 7 | Strong specialization. |
| Shoulders | 9 | 5 | 7 | 8 | 8 | 7 | Good delt/trap/rear-delt balance. |
| Arms | 9 | 4 | 8 | 8 | 8 | 8 | Good direct arm template. |

### Powerbuilding

| Template | H | S | FM | EQ | PF | RF | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| Push | 8 | 8 | 6 | 8 | 8 | 6 | Strong blend. |
| Pull | 7 | 7 | 7 | 7 | 8 | 7 | Good, but heavy row focus may not satisfy all strength users. |
| Legs | 8 | 8 | 6 | 8 | 8 | 6 | Strong but demanding. |
| Upper | 8 | 8 | 6 | 8 | 8 | 6 | Dense. |
| Lower | 7 | 8 | 7 | 7 | 8 | 7 | Good. |
| Full Body | 7 | 8 | 5 | 8 | 7 | 5 | High density. |
| Chest | 8 | 8 | 6 | 8 | 8 | 6 | Good. |
| Back | 8 | 7 | 7 | 8 | 8 | 7 | Good. |
| Shoulders | 8 | 7 | 7 | 8 | 8 | 7 | Good. |
| Arms | 8 | 5 | 8 | 7 | 7 | 8 | Fine as support. |

### Strength

| Template | H | S | FM | EQ | PF | RF | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| Push | 5 | 8 | 8 | 7 | 8 | 8 | Good press strength support. |
| Pull | 5 | 6 | 8 | 7 | 7 | 8 | Upper-back strength, not deadlift-specific. |
| Legs | 5 | 8 | 7 | 8 | 8 | 7 | Good lower strength. |
| Upper | 5 | 8 | 8 | 7 | 8 | 8 | Efficient. |
| Lower | 4 | 8 | 8 | 7 | 8 | 8 | Good, calf slot less strength-critical. |
| Full Body | 4 | 8 | 8 | 7 | 8 | 8 | Minimal and useful. |
| Chest | 5 | 8 | 8 | 7 | 8 | 8 | Good bench support. |
| Back | 5 | 6 | 8 | 7 | 7 | 8 | Needs deadlift/brace specificity if strength goal. |
| Shoulders | 5 | 7 | 8 | 7 | 8 | 8 | Good OHP support. |
| Arms | 7 | 4 | 8 | 7 | 7 | 8 | Supportive, not core strength architecture. |

### Power

| Template | H | S | FM | EQ | PF | RF | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| Push | 4 | 6 | 8 | 7 | 7 | 8 | Good if power exercise selection is clean. |
| Pull | 3 | 6 | 7 | 6 | 7 | 7 | Hinge/pull identity can blur. |
| Legs | 3 | 7 | 8 | 8 | 7 | 8 | Strong. |
| Upper | 3 | 6 | 8 | 7 | 7 | 8 | Good. |
| Lower | 3 | 7 | 8 | 8 | 7 | 8 | Strong. |
| Full Body | 3 | 7 | 8 | 8 | 7 | 8 | Good compact power day. |
| Chest | 4 | 6 | 8 | 7 | 7 | 8 | Good. |
| Back | 3 | 6 | 7 | 6 | 7 | 7 | Needs clearer explosive pull pool. |
| Shoulders | 3 | 6 | 8 | 7 | 7 | 8 | Good if movement selection is right. |
| Arms | 5 | 4 | 8 | 5 | 6 | 8 | Weakest conceptual fit. |

### Peak

Because Peak uses strength templates, scores reflect the current inherited architecture, not an ideal peak system.

| Template | H | S | FM | EQ | PF | RF | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| Push | 2 | 7 | 7 | 6 | 6 | 7 | Needs specific peak slots. |
| Pull | 2 | 5 | 7 | 5 | 5 | 7 | Not meet-specific. |
| Legs | 2 | 7 | 7 | 6 | 6 | 7 | Better, but still inherited. |
| Upper | 2 | 6 | 7 | 6 | 6 | 7 | Too generic. |
| Lower | 2 | 7 | 7 | 6 | 6 | 7 | Usable but not peak-grade. |
| Full Body | 2 | 7 | 8 | 6 | 6 | 8 | Best inherited option. |
| Chest | 2 | 7 | 7 | 6 | 6 | 7 | Needs bench specificity. |
| Back | 2 | 5 | 7 | 5 | 5 | 7 | Not peak-specific. |
| Shoulders | 2 | 6 | 7 | 5 | 5 | 7 | Not specific enough. |
| Arms | 3 | 2 | 8 | 4 | 4 | 8 | Should rarely be a peak focus. |

### Deload

Because Deload uses hypertrophy templates, scores reflect the current inherited architecture, not an ideal deload system.

| Template | H | S | FM | EQ | PF | RF | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| Push | 3 | 3 | 6 | 5 | 4 | 6 | Normal push structure with reduced dose. |
| Pull | 3 | 3 | 6 | 5 | 4 | 6 | Normal pull structure with reduced dose. |
| Legs | 3 | 3 | 5 | 5 | 4 | 5 | Too many lower slots for some deload contexts. |
| Upper | 3 | 3 | 6 | 5 | 4 | 6 | Usable but generic. |
| Lower | 3 | 3 | 6 | 5 | 4 | 6 | Better than Legs. |
| Full Body | 3 | 3 | 5 | 5 | 4 | 5 | Compound-dense for deload. |
| Chest | 3 | 3 | 6 | 5 | 4 | 6 | Usable if familiar. |
| Back | 3 | 3 | 6 | 5 | 4 | 6 | Usable if familiar. |
| Shoulders | 3 | 3 | 6 | 5 | 4 | 6 | Could work if low-load. |
| Arms | 4 | 2 | 7 | 6 | 4 | 7 | Low systemic fatigue, but still not deload-specific. |

## 13. Priority fixes

### Completed high-priority fixes

1. Dedicated Peak templates.
2. Dedicated Deload templates.
3. Canonical-lift-aware Strength anchoring.
4. Stricter Power template pools.

### Remaining high priority

1. Add familiarity scoring for Deload so the app can prefer movements the user already knows.
2. Add event-specific Peak variants for Powerlifting Meet versus general peak/readiness phases.
3. Add more explicit weak-point support slots inside Strength blocks once objective weak-point evidence exists.

### Medium priority

5. Add optional high-volume Pull/Back expansion slot.

Why:

Back and biceps can be underdosed for some hypertrophy users unless volume learning adds work later.

Risk/complexity:

Low/medium.

6. Add lower-body adductor/abductor optional slots.

Why:

Useful hypertrophy and physique coverage, especially for body-part or machine-rich contexts.

Risk/complexity:

Low/medium.

7. Make Body-part split weekly overlap more explicit.

Why:

Chest/Back/Shoulders sessions are good, but weekly overlap with Push/Pull/Upper requires careful volume accounting.

Risk/complexity:

Medium.

### Low priority polish

8. Rename or constrain Power Arms.

Why:

Power Arms is not a strong coaching concept. It may be better as Arms maintenance during power blocks.

Risk/complexity:

Low.

9. Add template intent copy for advanced users/coaches.

Why:

Helps explain why a session is built the way it is.

Risk/complexity:

Low.

## 14. Build/no-build recommendation

No-build recommendation for this audit:

Do not block a preview build solely because of template architecture quality.

Reason:

The current templates are coherent enough for beta testing, especially for hypertrophy, powerbuilding, and general strength. The most serious gaps are product-quality improvements, not immediate app stability bugs.

However:

Before a serious public beta or paid coaching positioning push, implement:

1. Dedicated Peak templates.
2. Dedicated Deload templates.
3. Canonical-lift-aware Strength templates.
4. More explicit Power exercise pools.

These changes would make Adaptive Strength Coach feel less like a good generator and more like a coach-built training system.
