# Adaptive Rep Prescription Matrix v1

Status: research and audit foundation.  
Date: 2026-06-28

This document defines the intended rep-prescription matrix for Adaptive Strength Coach.

It does not change production app logic, workout generation, UI, subscriptions, recovery-week logic, or EAS build behaviour.

## Executive Summary

Adaptive Strength Coach should not treat a rep range as the coaching decision.

A rep range is a tolerance band. The prescription is the combination of:

1. Goal
2. Training phase
3. Exercise category
4. Set objective
5. Coaching bias
6. Prescription type
7. Target reps, range, or AMRAP cap
8. Load strategy
9. AMRAP/top-range policy
10. Evidence confidence

The current production engine, `decideAdaptiveRepPrescription(context)`, is a good first internal module. It correctly introduces set objective, coaching bias, fixed reps, top-range checks, AMRAP, capped AMRAP, recovery prescriptions, power prescriptions, and duration handling.

The main gap is not safety. The main gap is specificity. The current engine maps several important categories too broadly:

- Competition squat, bench, and deadlift are grouped together.
- Standing overhead press and heavy compounds are not separated enough.
- Athletic Performance treats the entire goal like power work, even when the exercise is not a power movement.
- Duration/bodyweight work uses the `target_reps` field as seconds, which is workable internally but semantically muddy.
- AMRAP calibration is currently allowed from low confidence in several contexts; the matrix wants this more goal- and exercise-specific.

## Evidence Strength Key

- Strong: major position stands, systematic reviews, meta-analyses, or repeated converging evidence.
- Moderate: controlled studies, reviews, or broad evidence-informed coaching consensus with contextual limits.
- Limited: plausible and supported by some evidence, but not enough to automate aggressively.
- Coaching judgement: widely used by successful coaches, but not directly proven in a generalisable trial.
- ASC principle: product-specific guardrail derived from the Charter and V2 research.

## Source Base

The matrix uses these sources as anchors:

- ACSM progression models for resistance training. The 2009 position stand supports goal-specific loading, broad strength rep zones, hypertrophy programming, power training, sequencing, and progression models. Source: https://pubmed.ncbi.nlm.nih.gov/19204579/
- ACSM 2026 update summary. The newer guidance places more emphasis on consistency and accessible resistance training rather than overfitting complex variables. Source: https://acsm.org/resistance-training-guidelines-update-2026/
- Schoenfeld et al. low-load vs high-load meta-analysis. Hypertrophy can be achieved across a broad load spectrum, while heavier loads are superior for maximal strength. Source: https://pubmed.ncbi.nlm.nih.gov/28834797/
- Schoenfeld/Ogborn/Krieger volume meta-analysis. Weekly set volume shows a dose-response relationship for hypertrophy up to recoverable limits. Source: https://pubmed.ncbi.nlm.nih.gov/27433992/
- Loading continuum review. The classic repetition continuum is useful but oversimplified; load and reps interact with goal, proximity to failure, exercise, and fatigue. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC7927075/
- Helms/Zourdos RIR/RPE literature. RPE/RIR can regulate intensity, but ASC should not require users to rate every set. Objective logged performance remains the preferred production input. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC4961270/
- Autoregulation review. Load and volume autoregulation can be useful, but methods and outcomes are context-dependent. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC8762534/
- Proximity-to-failure literature. Training to failure is not mandatory and has meaningful fatigue cost, especially for strength and high-fatigue compounds. Source: https://pubmed.ncbi.nlm.nih.gov/33497853/
- Powerlifting taper/peaking review. Specificity and fatigue reduction matter when expressing maximal strength. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC7552788/
- Prilepin's chart. Useful as a heavy-lift volume guardrail, but it came from Olympic weightlifting logs and should not be copied literally into commercial-gym strength/hypertrophy. Overview: https://fitatmidlife.com/prilepins-chart-explained/
- RTS / Mike Tuchscherer style autoregulation. Useful for objective adjustment and submaximal heavy practice, but ASC should avoid forcing RPE literacy on normal users. RTS Prilepin critique: https://store.reactivetrainingsystems.com/blogs/advanced-concepts/why-i-dont-use-prilepins-chart
- Louie Simmons / Westside dynamic effort principle. Power/speed prescriptions should stay low fatigue and high intent. Overview: https://gymaware.com/the-complete-guide-to-dynamic-effort-method/
- Dave Tate / EliteFTS max effort principle. High-intensity effort work should be deliberate, constrained, and not confused with ordinary volume. Source: https://elitefts.com/blogs/training/max-effort-method-101-more
- Jim Wendler 5/3/1. Strength can progress well with conservative training maxes, simple 5/3/1 exposure, and slow progression. Source: https://www.jimwendler.com/blogs/jimwendler-com/101065094-5-3-1-for-a-beginner
- Boris Sheiko. Powerlifting programming often uses repeated specific practice, moderate average intensity, and volume management rather than constant maximal expression. Overview: https://simplifaster.com/articles/sheiko-system-powerlifting/
- Mike Israetel / RP volume landmarks. Hypertrophy work should count quality working sets, use broad productive rep zones, and respect recoverability. Source: https://rpstrength.com/blogs/articles/training-volume-landmarks-muscle-growth
- Dan Green style powerlifting practice. Heavy singles/doubles and volume back-off work can coexist, but the key coaching lesson is planned specificity and building the lift rather than chasing random maxes. Overview: https://www.allthingsgym.com/dan-green-on-vegas-power-hour-podcast/

## Exercise Categories

| Category | Includes | Primary prescription concern |
|---|---|---|
| Competition squat | Competition squat / high-specificity squat | Skill, specificity, axial fatigue, peak management |
| Competition bench | Competition bench press | Specificity, technical practice, moderate fatigue tolerance |
| Competition deadlift | Competition deadlift | High fatigue, low tolerance for frequent AMRAP, peak specificity |
| Standing overhead press | Standing/military press | Strength support, shoulder fatigue, slower progression |
| Heavy compounds | Barbell row, incline dumbbell press, leg press, Romanian deadlift, heavy machine variations when used as primary | Tension and strength/hypertrophy bridge with fatigue control |
| Machine compounds | Chest press, lat pulldown, chest-supported row | Stable stimulus, lower skill cost, useful top-range checks |
| Isolation | Leg extension, hamstring curl, lateral raise, cable curl, triceps pushdown | Local stimulus, higher-rep tolerance, lower systemic cost |
| Power movements | Box jump, medicine ball throw, speed squat, speed bench | Low reps, high quality, stop before fatigue |
| Duration/bodyweight | Plank, dead hang, farmer carry | Time or distance, bracing/grip/capacity, no fake reps |

## Prescription Type Definitions

| Type | Use | Avoid |
|---|---|---|
| fixed_reps | Productive work, strength practice, controlled hypertrophy, maintenance | When load is unknown and data is needed |
| top_range_check | Verify whether the current load is too easy without full AMRAP cost | Pain, recovery week, high fatigue, low evidence safety concern |
| amrap | Low-risk calibration, selected isolation checks, stale load estimate | Routine use, peak, recovery, high-fatigue compounds |
| capped_amrap | Calibration when data is needed but fatigue/safety must be constrained | Severe fatigue, pain, recovery week |
| recovery_reps | Deload/recovery context, low-stress practice | Normal productive progression if recovery context is absent |

## Matrix

### Strength

| Goal | Phase | Exercise category | Set objective | Bias | Type | Target reps/range/cap | Load strategy | AMRAP/top-range policy | Evidence | Scientific rationale | Coaching rationale | Implementation note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Strength | Accumulation | Competition squat | Productive | Skill/tension | fixed_reps | 3-6, target 5 | conservative_load | No AMRAP by default; top-range only after repeated clean work | Strong/moderate | Strength needs heavier specific practice, but accumulation should manage fatigue | Build squat skill and tissue tolerance without peaking too early | Current engine aligns broadly with 3-6 target 5 |
| Strength | Accumulation | Competition bench | Productive | Skill/tension | fixed_reps | 4-6, target 5 | conservative_load | Top-range check can be used more often than squat/deadlift | Strong/moderate | Bench has lower systemic cost and tolerates more specific practice | Own positions and bar path while preserving joints | Current engine groups with squat/deadlift; split later |
| Strength | Accumulation | Competition deadlift | Productive | Skill/tension | fixed_reps | 2-5, target 3-4 | conservative_load | Avoid AMRAP; capped checks only with strong reason | Strong/coaching | Deadlift has high fatigue and technical cost | Enough practice, not enough fatigue to blunt the week | Current engine overgeneralises to 3-6 target 5 |
| Strength | Intensification | Competition squat | Verification/productive | Skill/peak | fixed_reps | 2-5, target 3 | heavier_specific_load | Top-range check over open AMRAP | Strong/moderate | Higher intensities require fewer reps | Practice heavier work while preserving quality | Current engine aligns |
| Strength | Intensification | Competition bench | Verification/productive | Skill/peak | fixed_reps | 2-5, target 3 | heavier_specific_load | Top-range check acceptable when recovery is good | Strong/moderate | Specific heavy exposure drives maximal strength | Bench can accumulate more heavy practice than deadlift | Current engine aligns broadly |
| Strength | Intensification | Competition deadlift | Verification/productive | Skill/peak | fixed_reps | 1-4, target 2-3 | heavier_specific_load | No open AMRAP; cap tightly if calibrating | Strong/coaching | Heavy deadlift reps accumulate fatigue quickly | Keep deadlift sharp; do not grind | Current engine too broad at 2-5 target 3 but acceptable v1 |
| Strength | Peak | Competition squat | Performance | Peak | fixed_reps | 1-3, target 1-2 | heavier_specific_load | No AMRAP unless deliberate meet-simulation test | Moderate/strong consensus | Peaking increases specificity and reduces volume | Express readiness, do not build fatigue | Current engine aligns |
| Strength | Peak | Competition bench | Performance | Peak | fixed_reps | 1-3, target 1-2 | heavier_specific_load | Rare top set; no routine AMRAP | Moderate/strong consensus | Low-rep specificity supports expression | Bench can have slightly more exposure than deadlift | Current engine aligns |
| Strength | Peak | Competition deadlift | Performance | Peak | fixed_reps | 1-2 mostly, range 1-3 | heavier_specific_load | No AMRAP | Moderate/strong consensus | Deadlift peak is fatigue-sensitive | Pull enough to stay specific, not enough to drain | Current engine target 1/2; good |
| Strength | Any productive | Standing overhead press | Productive | Tension/skill | fixed_reps | 3-6 or 5-8 support | conservative_load | Top-range after repeated clean exposures | Moderate/coaching | Press strength benefits from lower/moderate reps | Slower-loading lift needs conservative progress | Current engine treats as primary compound; acceptable |
| Strength | Any productive | Heavy compounds | Productive | Tension | fixed_reps | 5-8 | conservative_load | Top-range check, not AMRAP | Strong/moderate | Secondary strength supports main lifts | Build useful strength without competing with main lift | Current engine aligns |
| Strength | Any productive | Machine compounds | Productive | Tension/balanced | fixed_reps | 6-10 | use_current_load | Top-range check acceptable | Moderate | Stable work supports stimulus with lower skill cost | Useful support without high systemic cost | Current engine uses 5-8 for non-primary strength; may be narrow |
| Strength | Any productive | Isolation | Productive | Balanced/metabolic | fixed_reps | 8-15 | use_current_load | Low-risk top-range or capped AMRAP only if needed | Moderate/coaching | Isolation supports weak links but is not primary strength | Build tissue and support muscles | Current engine uses 5-8 for strength accessories; likely too low |
| Strength | Deload | All strength categories | Recovery | Recovery | recovery_reps | lower end of normal range | recovery_load | No AMRAP/top-range | Strong/coaching | Fatigue reduction supports adaptation | Preserve movement, reduce stress | Current engine aligns |

### Hypertrophy

| Goal | Phase | Exercise category | Set objective | Bias | Type | Target reps/range/cap | Load strategy | AMRAP/top-range policy | Evidence | Scientific rationale | Coaching rationale | Implementation note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hypertrophy | Accumulation | Competition squat | Productive | Tension | fixed_reps | 6-10, target 8 | conservative_load | Top-range only; avoid AMRAP | Strong/moderate | Hypertrophy can occur across ranges, but heavy squat fatigue is high | Get tension without turning hypertrophy into max-strength fatigue | Current engine can target 8 if prescribed range permits |
| Hypertrophy | Accumulation | Competition bench | Productive | Tension/balanced | fixed_reps | 6-12, target 8-10 | conservative_load | Top-range after repeated success | Strong/moderate | Bench is useful for chest/triceps tension | Productive volume with controlled fatigue | Current engine target by bias aligns |
| Hypertrophy | Accumulation | Competition deadlift | Productive | Tension | fixed_reps | 5-8 or 6-10 | conservative_load | Avoid AMRAP | Moderate/coaching | Deadlift is poor high-volume hypertrophy tool for many users | Use sparingly for posterior-chain tension | Current engine may allow 8-12 if supplied; needs guardrail |
| Hypertrophy | Accumulation | Standing overhead press | Productive | Tension/balanced | fixed_reps | 6-10, target 8 | conservative_load | Top-range check sparingly | Moderate | Pressing volume can support delts/triceps but joint cost matters | Build shoulders without grinding | Current engine aligns if range is sensible |
| Hypertrophy | Accumulation | Heavy compounds | Productive | Tension/balanced | fixed_reps | 8-12, target 8-10 | conservative_load | Top-range for underload; no frequent AMRAP | Strong | Moderate reps balance tension and fatigue | Stable productive work | Current engine aligns |
| Hypertrophy | Accumulation | Machine compounds | Productive | Balanced | fixed_reps | 8-12 or 10-15, target 10 | use_current_load | Top-range checks useful | Strong/moderate | Stable machines provide high stimulus with lower skill cost | Accumulate quality volume | Current engine aligns |
| Hypertrophy | Accumulation | Isolation | Productive | Metabolic | fixed_reps | 10-20 or 12-25, target 12-15 | use_current_load | AMRAP/capped AMRAP allowed for calibration | Strong/moderate | Broad rep zones work when effort is sufficient | Low systemic cost allows higher reps | Current engine target 12 may be conservative but safe |
| Hypertrophy | Verification | Machine/isolation | Verification | Balanced/metabolic | top_range_check | use existing range top | use_current_load | Prefer top-range over AMRAP | Moderate/ASC | Top-range check gives load-ease evidence with less cost | Verify underload without ego failure | Current engine aligns |
| Hypertrophy | Calibration | Isolation/low-risk machine | Calibration | Metabolic | amrap or capped_amrap | cap at range max | estimate_load | Use sparingly after stale/unknown history | Limited/coaching | AMRAP gives data but adds fatigue | Learn the useful zone | Current engine aligns |
| Hypertrophy | Deload | All categories | Recovery | Recovery | recovery_reps | lower end of range | recovery_load | No AMRAP/top-range | Strong/coaching | Reduce fatigue while maintaining movement | Let fatigue drop without losing rhythm | Current engine aligns |

### Build Muscle + Strength

| Goal | Phase | Exercise category | Set objective | Bias | Type | Target reps/range/cap | Load strategy | AMRAP/top-range policy | Evidence | Scientific rationale | Coaching rationale | Implementation note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Build Muscle + Strength | Accumulation | Competition squat | Productive | Tension/skill | fixed_reps | 4-8 or 5-10, target 6-8 | conservative_load | Top-range after repeated success | Strong/moderate | Bridge goal needs strength practice and hypertrophy volume | Own the lift without pushing peak loads | Current engine target 8/range 5-10 aligns |
| Build Muscle + Strength | Accumulation | Competition bench | Productive | Tension/balanced | fixed_reps | 5-10, target 8 | conservative_load | Top-range useful | Strong/moderate | Bench works well across strength/hypertrophy bridge | Build skill and size | Current engine aligns |
| Build Muscle + Strength | Accumulation | Competition deadlift | Productive | Tension/skill | fixed_reps | 3-6 or 4-8 | conservative_load | Avoid AMRAP except capped calibration | Moderate/coaching | Deadlift fatigue must be managed in hybrid goal | Pull enough to progress, not enough to blunt volume | Current engine may be too high at 5-10 target 8 |
| Build Muscle + Strength | Intensification | Competition lifts | Productive/verification | Tension/peak | fixed_reps | 4-8, target 5 | conservative_load | Top-range check; no frequent AMRAP | Strong/moderate | Hybrid intensification should not chase strength and volume simultaneously | Earn load while keeping muscle work productive | Current engine aligns |
| Build Muscle + Strength | Any productive | Standing overhead press | Productive | Tension | fixed_reps | 5-8 or 6-10 | conservative_load | Top-range after repeated clean work | Moderate | Press is secondary strength and hypertrophy support | Keep progress sustainable | Current engine primary-compound mapping acceptable |
| Build Muscle + Strength | Any productive | Heavy compounds | Productive | Tension/balanced | fixed_reps | 6-10 | conservative_load | Top-range preferred | Strong/moderate | Compounds supply tension but fatigue cost matters | Productive, not maximal | Current engine range 5-10 or 4-8 acceptable |
| Build Muscle + Strength | Any productive | Machine compounds | Productive | Balanced | fixed_reps | 8-12 or 8-15 | use_current_load | Top-range useful | Strong/moderate | Stable stimulus for muscle with less skill cost | Add muscle without draining main lifts | Current engine accessory branch likely aligns |
| Build Muscle + Strength | Any productive | Isolation | Productive | Metabolic | fixed_reps | 10-15 or 12-20 | use_current_load | Low-risk calibration allowed | Strong/moderate | Isolation fills hypertrophy gaps | Useful local work without load ego | Current engine aligns |
| Build Muscle + Strength | Peak | Competition lifts | Performance/verification | Peak | fixed_reps | 1-3 if truly peaking, otherwise 2-5 | heavier_specific_load | No open AMRAP | Moderate/coaching | Peak should be deliberate, not accidental | Express strength only when goal/phase justifies it | Current engine peak branch aligns, but may be too eager for hybrid goal |
| Build Muscle + Strength | Deload | All categories | Recovery | Recovery | recovery_reps | lower range | recovery_load | No AMRAP/top-range | Strong/coaching | Preserve training rhythm while reducing fatigue | Keep momentum | Current engine aligns |

### Athletic Performance

| Goal | Phase | Exercise category | Set objective | Bias | Type | Target reps/range/cap | Load strategy | AMRAP/top-range policy | Evidence | Scientific rationale | Coaching rationale | Implementation note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Athletic Performance | Accumulation | Power movements | Productive | Speed/power | fixed_reps | jumps/throws 2-4; loaded speed 1-3 | quality_speed_load | No AMRAP; stop on quality drop | Strong/moderate | Power requires high intent and low fatigue | Preserve crisp output | Current engine aligns |
| Athletic Performance | Accumulation | Competition squat | Productive | Skill/tension | fixed_reps | 3-5 or 4-6 | conservative_load | No AMRAP | Moderate | Strength supports power but should not create fatigue debt | Build force base | Current engine currently treats athletic goal as power even on non-power exercises: mismatch |
| Athletic Performance | Accumulation | Competition bench | Productive | Skill/tension | fixed_reps | 3-6 | conservative_load | No AMRAP | Moderate | Upper-body force supports throwing/contact athletes | Strength support, not bodybuilding fatigue | Current engine mismatch if goal alone triggers power prescription |
| Athletic Performance | Accumulation | Competition deadlift | Productive | Tension/skill | fixed_reps | 2-4 or 3-5 | conservative_load | No AMRAP | Moderate/coaching | Hinge strength supports power but fatigue is high | Low dose, high quality | Current engine mismatch |
| Athletic Performance | Accumulation | Standing overhead press | Productive | Tension/skill | fixed_reps | 3-6 | conservative_load | No AMRAP | Moderate | Strength support with shoulder care | Build usable force | Current engine mismatch if goal alone overrides category |
| Athletic Performance | Accumulation | Heavy compounds | Productive | Tension/balanced | fixed_reps | 4-8 | conservative_load | Top-range only if underload suspected | Moderate | Strength reserve supports athletic work | Keep gym work from stealing sport readiness | Current engine mismatch if goal alone triggers speed_power |
| Athletic Performance | Accumulation | Machine compounds | Productive | Balanced | fixed_reps | 6-10 | use_current_load | Rare top-range | Moderate/coaching | Lower skill fatigue support work | Useful support without systemic load | Current engine mismatch |
| Athletic Performance | Accumulation | Isolation | Productive/recovery | Balanced | fixed_reps | 8-15 | use_current_load | Avoid AMRAP unless rehab/prehab-like calibration is needed | Limited/coaching | Isolation may support tissue tolerance | Keep it useful and simple | Current engine mismatch |
| Athletic Performance | Deload/recovery | All categories | Recovery | Recovery | recovery_reps | lower range or duration | recovery_load | No AMRAP/top-range | Strong/coaching | Recovery protects future output | Reduce fatigue | Current engine recovery branch runs before power branch, aligns |

### Get Lean

| Goal | Phase | Exercise category | Set objective | Bias | Type | Target reps/range/cap | Load strategy | AMRAP/top-range policy | Evidence | Scientific rationale | Coaching rationale | Implementation note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Get Lean | Accumulation | Competition squat | Productive | Tension/balanced | fixed_reps | 4-8 or 5-8, target 5-6 | conservative_load | No AMRAP unless exceptional | Moderate/ASC | Cutting/recomp should preserve strength and muscle without extra fatigue | Keep quality high while recovery may be constrained | Current engine aligns |
| Get Lean | Accumulation | Competition bench | Productive | Tension/balanced | fixed_reps | 5-8 | conservative_load | Top-range only after repeated success | Moderate | Strength preservation matters | Avoid unnecessary fatigue | Current engine aligns |
| Get Lean | Accumulation | Competition deadlift | Productive | Tension/skill | fixed_reps | 2-5 or 3-6 | conservative_load | No AMRAP | Moderate/coaching | Deadlift fatigue is costly in energy deficit | Preserve skill/strength, not volume PR | Current engine may use 5-8 target 6; acceptable but watch |
| Get Lean | Accumulation | Standing overhead press | Productive | Balanced/tension | fixed_reps | 5-8 | conservative_load | No AMRAP | Moderate | Preserve strength with low complexity | Stable work | Current engine aligns |
| Get Lean | Accumulation | Heavy compounds | Productive | Balanced | fixed_reps | 5-8 or 6-10 | conservative_load | No AMRAP on poor recovery | Moderate | Maintain strength and lean mass | Quality work, low drama | Current engine aligns |
| Get Lean | Accumulation | Machine compounds | Productive | Balanced | fixed_reps | 8-12, lower if recovery poor | conservative_load/use_current_load | Top-range only when recovery is good | Moderate | Stable compounds preserve muscle | Useful training without extra stress | Current engine lowerStressRange may be too low if prescribed range is broad |
| Get Lean | Accumulation | Isolation | Productive | Balanced | fixed_reps | 8-15 or 10-15 | use_current_load | Avoid AMRAP unless very low-risk and recovery good | Moderate | Isolation helps preserve muscle with lower systemic cost | Keep joints and confidence good | Current engine lowerStressRange can be conservative |
| Get Lean | Low confidence | All categories | Productive | Balanced/recovery | fixed_reps | conservative lower/mid reps | conservative_load | No AMRAP from low confidence alone | ASC principle | Missing evidence should not create fatigue tests | Hold the line until data improves | Current engine now aligns |
| Get Lean | Deload | All categories | Recovery | Recovery | recovery_reps | lower range | recovery_load | No AMRAP/top-range | Strong/coaching | Recovery is productive | Preserve momentum | Current engine aligns |

### Maintenance

| Goal | Phase | Exercise category | Set objective | Bias | Type | Target reps/range/cap | Load strategy | AMRAP/top-range policy | Evidence | Scientific rationale | Coaching rationale | Implementation note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Maintenance | Maintenance | Competition squat | Productive | Balanced/skill | fixed_reps | 3-6 or 5-8 | conservative_load | Rare top-range, no routine AMRAP | Moderate | Lower dose can maintain strength for many users | Keep skill without chasing peaks | Current engine uses midpoint clamped 6-12; too generic |
| Maintenance | Maintenance | Competition bench | Productive | Balanced/skill | fixed_reps | 5-8 or 6-10 | conservative_load | Rare top-range | Moderate | Maintain pressing strength and skill | Controlled work | Current engine generic midpoint may be acceptable |
| Maintenance | Maintenance | Competition deadlift | Productive | Balanced/skill | fixed_reps | 2-5 or 3-6 | conservative_load | Avoid AMRAP | Moderate/coaching | Deadlift maintenance should be low fatigue | Keep pattern alive | Current engine too generic if range is broad |
| Maintenance | Maintenance | Standing overhead press | Productive | Balanced | fixed_reps | 5-8 or 6-10 | conservative_load | Rare top-range | Moderate | Maintain strength without excess fatigue | Stable simple work | Current engine generic |
| Maintenance | Maintenance | Heavy compounds | Productive | Balanced | fixed_reps | 6-10 | conservative_load | No routine AMRAP | Moderate | Moderate reps maintain muscle/strength | Simple, sustainable | Current engine generic but safe |
| Maintenance | Maintenance | Machine compounds | Productive | Balanced | fixed_reps | 8-12 | use_current_load | Top-range if stale | Moderate | Stable stimulus with low complexity | Easy to sustain | Current engine aligns if range is normal |
| Maintenance | Maintenance | Isolation | Productive | Balanced/metabolic | fixed_reps | 10-15 | use_current_load | Low-risk AMRAP only if history stale | Moderate | Small local dose maintains tissue | Enjoyable, low fatigue | Current engine generic midpoint may underuse category |
| Maintenance | Maintenance | Power movements | Productive | Speed/power | fixed_reps | 1-3 or 2-4 | quality_speed_load | No AMRAP | Moderate | Power qualities decay without exposure | Crisp small dose | Current engine aligns if archetype is power |
| Maintenance | Maintenance | Duration/bodyweight | Productive/recovery | Balanced/recovery | fixed_reps/duration | 20-60 sec depending exercise | use_current_load/recovery_load | No AMRAP wording; progress time slowly | Limited/coaching | Bracing/grip capacity benefits from time exposure | Maintain resilience | Current engine handles seconds but field naming should improve |

## AMRAP Policy

AMRAP is not a default training style.

Use AMRAP when:

- The exercise is low risk.
- Load estimate is stale or unknown.
- A plateau needs information.
- A periodic retest is deliberately scheduled.
- The athlete has sufficient recovery and safety is clear.

Use capped AMRAP when:

- The lift is important but fatigue cost is meaningful.
- A high-risk movement needs calibration.
- The app needs data but should prevent runaway effort.

Avoid AMRAP when:

- Pain/safety flag exists.
- Recovery week/deload is active.
- Fatigue is high.
- The movement is deadlift-like or high axial load.
- The goal is Get Lean and evidence/recovery confidence is low.
- A peak phase is active unless a performance test is deliberately planned.

## Top-Range Check Policy

Top-range checks are the preferred low-cost verification tool.

Use when:

- Current load may be underloaded.
- User repeatedly hits fixed reps cleanly.
- Load ownership needs confirmation.
- Adaptive Set Allocation should avoid stopping too early after easy top-range work.

Avoid when:

- Below-minimum events are present.
- Shutdown/drop-off is active.
- Recovery/deload is active.
- Pain/safety flag exists.

## Production Implications

The matrix supports the current decision to keep Adaptive Rep Prescription internal until load intent and workout wiring mature.

Next safe production steps should be:

1. Separate competition squat, bench, and deadlift behaviour.
2. Stop treating Athletic Performance as power for every exercise.
3. Add semantic duration output instead of using `target_reps` for seconds.
4. Add category-specific Maintenance prescriptions.
5. Make calibration/AMRAP policy more explicit by goal and exercise risk.

## Open Aaron Decisions

1. Should Competition Deadlift always have stricter AMRAP and rep caps than Competition Squat and Bench?
2. Should Athletic Performance include explicit non-power strength-support prescriptions now, or wait until the goal model is rebuilt?
3. Should duration/bodyweight use a separate `target_seconds` / `duration_range` output before UI wiring?
4. Should Maintenance be treated as a real goal with category-specific prescriptions, or remain a generic conservative mode?
5. Should users ever see "top-range check" language, or should it remain internal?
6. How often should ASC allow AMRAP calibration on isolation exercises?
7. Should peak prescriptions be allowed outside a powerlifting/meet-prep pathway?

