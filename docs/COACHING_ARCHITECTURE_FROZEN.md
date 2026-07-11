# Coaching Architecture Frozen

Freeze date: 2026-06-14

## 1. Executive Summary

The Adaptive Strength Coach coaching engine is considered feature-complete for the current release cycle.

This freeze does not mean the coaching system is perfect or permanently finished. It means the current architecture is sufficiently complete, validated, and product-truthful to stop adding new coaching scope before commercial release work.

The product should now move from coaching expansion to release readiness:

- website conversion
- subscription/paywall
- entitlement handling
- analytics
- crash reporting
- beta testing

Future coaching changes should be treated as deliberate post-freeze changes, not casual polish.

## 2. Frozen Systems

The following systems are frozen for the current release cycle.

### Evidence-Based Prescription Architecture

The app now uses a bounded evidence-based model for workload, set ranges, exercise roles, block context, goal context, and experience level.

Autoregulation remains the core principle, but it operates inside sensible prescription boundaries rather than generic defaults.

Frozen status: frozen.

### Slot Prescription Matrix

Slot-specific prescriptions now distinguish primary compounds, secondary compounds, machine compounds, unilateral work, isolation, small muscle work, power movements, peak lifts, core/bracing, and recovery movements.

Slot role owns the prescription before equipment category.

Frozen status: frozen.

### Exercise-Specific Target Zone Learning

The app learns where each exercise progresses best using performance outcomes, not user preference.

It supports:

- insufficient data
- balanced defaults
- load-biased evidence
- balanced evidence
- rep-biased evidence
- biased low-only / high-only caution
- pain, equipment, manual finish, shutdown, and drop-off suppression

Frozen status: frozen.

### Recovery Window Architecture

Rigid user-facing Deload framing has been replaced with Recovery Window framing.

Recovery Windows are planned recovery opportunities, while reactive fatigue/readiness systems can still adjust training outside those windows.

Frozen status: frozen.

### Hypertrophy Architecture

Hypertrophy templates now prioritise muscle coverage, productive volume, differentiated slot prescriptions, controlled accessory work, and recovery-aware volume expansion.

Frozen status: frozen.

### Powerbuilding Architecture

Powerbuilding now blends heavier strength exposure with hypertrophy support, rather than behaving like generic hypertrophy with heavier compounds.

Frozen status: frozen.

### Strength Architecture

Strength templates are anchored around the canonical strength lifts and supporting movement patterns:

- Bench Press
- Squat
- Deadlift
- Standing Barbell Overhead Press

Support work is intended to improve the main lifts, not simply fill bodybuilding volume.

Frozen status: frozen.

### Power Architecture

Power blocks now prioritise fast output, low fatigue, speed/power work, beginner-safe power options, and power quality protection.

Frozen status: frozen.

### Peak Architecture

Peak templates are dedicated, specific, low-volume, low-novelty, and readiness-focused.

Powerlifting Meet peak handling strongly favours canonical/specific squat, bench, and deadlift exposure near the meet.

Frozen status: frozen.

### Recovery & Capacity System

Recovery/Cardio now exists as a recovery and work-capacity support layer, not a fat-loss product.

It includes:

- Recovery & Cardio preference
- Recovery Cardio
- Capacity Cardio
- Performance Conditioning where appropriate
- weekly Recovery & Capacity targets
- direct start actions
- timing guidance
- interference rules
- completion tracking separate from lifting

Frozen status: frozen.

### Progression Throttle

Progression uses push, hold, and pull-back decisions based on goal, block, lane, performance, fatigue, history, power quality, taper context, and recovery constraints.

Frozen status: frozen.

### Fatigue Separation

Fatigue is separated into:

- exercise-specific fatigue
- muscle-local fatigue
- systemic fatigue
- mixed fatigue
- insufficient data

This supports better progression, variation, volume, and deload/recovery recommendations.

Frozen status: frozen.

### Volume Learning

The app learns whether muscles need more, less, or the same work over time, while respecting evidence-based caps and fatigue constraints.

Frozen status: frozen.

### Exercise Selection

Exercise selection now supports:

- goal-specific bias
- block-specific lanes
- body-part templates
- controlled rotation
- deterministic variation
- equipment filtering
- beginner filtering
- preference learning
- pain/unavailable suppression
- suitable crossover between session contexts

Frozen status: frozen.

### Primary Lift Variations

Primary lift variations are structured and protected. Main lifts remain stable unless there is a deliberate reason to vary them.

Frozen status: frozen.

### Strength Dashboard

The Strength Dashboard answers whether the user is getting stronger without requiring 1RM testing.

It includes:

- current e1RM
- best e1RM
- 30-day change
- 90-day change
- trends
- Powerlifting Meet total where relevant

Frozen status: frozen.

### PR Tracking

PR tracking surfaces meaningful load, rep, and e1RM progress while treating first exposures as baselines rather than noisy PR spam.

Frozen status: frozen.

### Advanced Reporting

Progress reporting now includes:

- Strength Report
- Volume Report
- Recovery & Capacity Report
- Consistency Report

Frozen status: frozen.

### Social Sharing

Branded share cards exist for PRs, strength progress, powerlifting totals, and workout summaries, with smart download-link payloads.

Frozen status: frozen.

### Workout Review

Workout Review now understands:

- first-exposure caution
- PRs and baselines
- target-zone-aware progression
- manual finish reasons
- pain/equipment reasons
- deleted set exclusion
- warm-up exclusion
- double-progression prevention after in-session escalation

Frozen status: frozen.

## 3. Validation History

### Template Architecture Audit

Conclusion: the original templates needed stronger training intent, especially Peak, Recovery/Deload, Strength anchoring, and Power specificity.

Outcome: dedicated Peak and Recovery Window templates were implemented, Strength was anchored to canonical lifts, and Power templates were tightened.

### Set Prescription Trace

Conclusion: set prescriptions were not sufficiently transparent and could look too uniform across exercise roles.

Outcome: the set architecture was replaced with an evidence-based prescription model and slot-specific prescription matrix.

### Truthfulness Validation Audit

Conclusion: the app’s major claims are now mostly truthful, including adaptive progression, goal-specific programming, Recovery Window logic, Powerlifting Meet specificity, and Recovery & Capacity support.

Outcome: remaining weak promises were addressed or deferred, and the product can truthfully market itself as Adaptive Strength Coach and Auto-Regulated Strength & Hypertrophy Coaching.

### Phase 2E Validation Audit

Conclusion: generated workouts are now coachable, recognisable, and aligned with block intent across hypertrophy, powerbuilding, strength, power, peak, and Recovery Window.

Outcome: minor final refinements were implemented for primary machine lower-body prescription, beginner Power Lower trunk retention, Powerlifting Meet Peak Full Body bracing, and late Peak novelty avoidance.

### Training Methods Audit

Conclusion: training methods can add value later, but they are not required for the current release cycle and should not become random novelty.

Outcome: training methods are deferred. If implemented later, they should be tightly eligible, labelled, explained, and limited by fatigue/history/goal/block context.

## 4. Deferred Features

The following are future candidates, not release blockers.

### Training Methods

Potential future methods:

- Short Pyramid
- Heavy Five + Backoffs
- Heavy Triple + Backoffs
- tightly constrained Last Set AMRAP

Deferred because they require method-specific set modelling, UI explanation, fatigue accounting, and Workout Review interpretation.

### Familiarity Memory

Future system that tracks which exercises and variations the user is already familiar with, especially for late Peak, Powerlifting Meet, and Recovery Window novelty control.

Deferred because current novelty controls are sufficient for release.

### Coach Audit Mode

Future internal/debug mode that explains why a workout was generated the way it was.

Deferred because it is useful for QA and transparency, but not essential for users.

### Weekly Muscle Volume Dashboard

Future user-facing dashboard showing weekly productive set exposure by muscle group.

Deferred because Advanced Reporting already gives enough progress visibility for launch.

### Other Non-Essential Coaching Enhancements

Examples:

- deeper event-type specialisation
- more granular sport-conditioning logic
- advanced power quality variants
- more detailed equipment/familiarity modelling
- expanded coaching explanations

Deferred unless real users expose clear demand.

## 5. Reopen Conditions

The coaching architecture may only be reopened for one of the following reasons:

1. Bug

A verified defect causes incorrect workouts, incorrect progression, data loss, broken recommendations, or misleading user-facing behaviour.

2. User confusion

Users misunderstand a coaching concept or cannot act on a recommendation.

3. User feedback

Beta users consistently report that a coaching choice is unhelpful, unclear, too repetitive, too aggressive, too conservative, or misaligned with their goal.

4. Real-world performance evidence

Logged beta data shows the coaching model is producing poor outcomes, repeated stalls, excessive fatigue, poor adherence, or inappropriate progression.

5. New research evidence

High-quality evidence or strong coaching consensus materially contradicts a frozen assumption.

6. Commercial requirement

A release, subscription, retention, onboarding, or support requirement cannot be solved without changing coaching behaviour.

## 6. Current Recommendation

Freeze coaching architecture and move focus to commercial release readiness.

Priority order:

1. Website conversion
2. RevenueCat
3. Paywall
4. Entitlement handling
5. Analytics
6. Crash reporting
7. Beta testing

Do not add new coaching features before subscription/paywall implementation unless a reopen condition is met.

No EAS build was started for this freeze document.

## 7. Freeze Reopen Addendum: Recovery Window Trigger Classification

The coaching architecture freeze was temporarily reopened for a permitted reason: real-world testing exposed a misleading Recovery Window trigger risk.

Issue:

Shutdown/drop-off events could be counted as recovery pressure even when the user had completed useful hypertrophy work, matched or improved performance, and then correctly shut the exercise down.

Resolution:

Adaptive Strength Coach now distinguishes:

- productive shutdown
- expected local fatigue
- neutral shutdown
- regressive shutdown
- systemic fatigue

Recovery Window pressure now depends on regressive/systemic evidence, not raw shutdown count alone.

Productive hypertrophy shutdowns should support "hard productive work" or "local fatigue expected" copy, not automatic Recovery Window pressure.

Recovery Window remains appropriate when shutdown evidence is early, regressive, compound-heavy, performance-declining, or spread across multiple unrelated lifts/sessions.

The coaching architecture can be re-frozen after this correction passes full regression.

## 8. Freeze Reopened and Re-frozen

The coaching architecture freeze was reopened for a permitted correction after real-use testing found that productive hypertrophy shutdowns could be overcounted as recovery pressure.

Reason:

Hard productive hypertrophy work can correctly end in a shutdown/drop-off after useful work is complete. Treating those shutdowns the same as early regressive performance failures risked pushing users toward a Recovery Window too aggressively.

Fix implemented:

Adaptive Strength Coach now distinguishes productive vs regressive fatigue classification.

Affected systems:

- `fatigue-evidence`
- strategic coaching
- fatigue classifier
- volume landmarks
- progress dashboard
- Recovery Window/deload prescription

Validation:

- `npm test`: 78 files / 913 tests passed
- `npx tsc --noEmit`: passed
- `npx expo export --platform web`: passed
- iOS simulator build passed with 0 errors / 0 warnings

The coaching architecture is re-frozen after this correction.

Future coaching changes still require one of the approved reopen conditions:

- bug
- user confusion
- user feedback
- real-world performance evidence
- new research evidence
- commercial requirement that cannot be solved elsewhere

No EAS build was started for this re-freeze update.
