# Recovery Window Trigger Audit

## 1. Current Trigger Logic

This audit reviewed the current production logic around Recovery Window, recovery priority, fatigue classification, volume reduction, and shutdown/drop-off evidence.

Primary files inspected:

- `src/domain/training/strategic-coaching.ts`
- `src/domain/training/deload-prescription.ts`
- `src/domain/training/fatigue-classifier.ts`
- `src/domain/training/volume-landmarks.ts`
- `src/domain/training/progress-dashboard.ts`
- `src/domain/training/workout-history.ts`
- `src/domain/training/progression-throttle.ts`
- `src/domain/training/success-model.ts`

### Strategic coaching

`adaptHistoryToStrategicSignals` builds the strategic signal set from recent completed workouts.

Important inputs:

- recent completed sessions
- exercise summaries
- progression earned rate
- quality set trend
- exercise performance trend
- shutdown/drop-off rate
- recovery placeholder signals
- undertrained and overreached muscles

Shutdown handling:

```text
shutdownRate = stoppedByDropOff exercise entries / exercise entries
```

That shutdown rate feeds `deriveFatigueTrend`:

```text
shutdownRate >= 0.50 -> +3 fatigue score
shutdownRate >= 0.35 -> +2 fatigue score
shutdownRate >= 0.18 -> +1 fatigue score
qualitySetTrend falling -> +1
exercisePerformanceTrend falling -> +1

score >= 3 -> high fatigue
score >= 1 -> moderate fatigue
else -> low fatigue
```

This means shutdown rate can create moderate or high fatigue even before the system knows whether the shutdown was productive or regressive.

`recommendStrategicAction` then resolves a deload prescription and can recommend `deload_then_continue` when:

- a deload prescription exists, and
- readiness score is low, fatigue trend is high, or the goal biases toward earlier deloading.

There is an important safeguard: `hasDeloadEvidence` must pass before `resolveDeloadPrescription` returns a prescription.

### Deload prescription

`hasDeloadEvidence` requires enough completed evidence:

```text
sessionsAnalyzed >= 3
exerciseEntriesAnalyzed >= 3
```

Then it accepts evidence when any of these are true:

- fatigue trend is high
- volume tolerance is declining and exercise performance is not rising
- quality set trend is falling and shutdown rate is at least 18%

`resolveDeloadPrescription` can return:

- `mild`
- `clear`
- `severe`

Severe can be selected when readiness is very low, or fatigue, quality sets, and performance are all moving negatively, or shutdown rate is at least 50% with low average quality sets.

Clear can be selected when readiness is low, fatigue trend is high, or volume tolerance is declining while performance is falling.

Current conclusion:

The deload layer is not blindly recommending Recovery Window from one shutdown. It requires repeated completed-session evidence. However, the evidence quality is still blunt because shutdowns are binary.

### Fatigue classifier

`classifyFatigue` separates fatigue into:

- exercise-specific
- muscle-local
- systemic
- mixed
- insufficient data

Inputs include:

- workout history
- exercise trends
- muscle volume signals
- shutdown/drop-off history
- progression throttle outcomes
- extra-session workload
- training gap state
- deload state

Important shutdown logic:

```text
shutdownEntries = entries where stoppedByDropOff
sessionsWithShutdown = recent sessions containing any stoppedByDropOff entry
```

Systemic signal is true when any of these are true:

- unrelated declines >= 3
- sessionsWithShutdown >= 3
- shutdownEntries.length >= 4
- extra workload >= 3
- hold/pull throttle rate >= 60%
- extended training gap

Exercise decline signals are built from recent exercise entries:

- shutdowns >= 2
- strictly declining quality sets
- strictly declining best-set reps

Current conclusion:

The fatigue classifier does separate local, systemic, and mixed fatigue, but it does not classify shutdown quality. A shutdown after successful target work and a shutdown before useful work are both `stoppedByDropOff: true`.

### Volume landmarks

`analyzeMuscleVolumeLandmarks` calculates weekly productive sets, progression rate, shutdown rate, and performance trend by muscle.

The key rule:

```text
highFatigue = shutdownRate >= 0.5 || performanceTrend === "declining"
```

Then:

- near MRV plus high fatigue -> `deload`
- above MAV max plus high fatigue -> `reduce_volume`
- no progress plus high fatigue -> `reduce_volume`

Current conclusion:

The muscle-volume layer is especially vulnerable to productive-shutdown misclassification. A high shutdown rate alone can become high fatigue for a muscle, even if those shutdowns occurred after enough productive hypertrophy work.

### Progress dashboard Recovery Window surfacing

`progress-dashboard.ts` surfaces the Recovery Window action when recovery is considered priority.

`isRecoveryPriority` returns true when:

- separated fatigue is systemic or mixed, high severity, and not low confidence
- strategic recommendation title includes deload, recovery window, or reduce
- momentum is declining
- readiness includes deload or recovery window

The action copy is:

```text
Recovery Window recommended
Performance is dropping and fatigue is rising.
```

There is also a positive recent-progress fallback:

```text
{exerciseName} hit the stop point. Productive work was capped cleanly.
```

Current conclusion:

The user-facing copy already understands that a shutdown can be productive, but the upstream fatigue and Recovery Window logic does not yet use that distinction.

## 2. Shutdown Classification

The current model effectively has one shutdown category:

```text
stoppedByDropOff = true
```

That is not enough. A better model should distinguish these categories.

### A. Productive shutdown

Definition:

The user completed enough useful work, matched or improved performance, and then the app ended the exercise at the correct point.

Signals:

- required work completed
- target zone hit
- productive sets completed
- load, reps, e1RM, or target-zone result maintained or improved
- shutdown happens after strong work
- mostly isolation, accessory, or local hypertrophy fatigue
- session quality is stable or rising
- performance trend is not falling

Interpretation:

Neutral to mildly positive in hypertrophy. It says the user trained hard and the app capped further work.

Recommended response:

- keep block going
- hold volume
- monitor the next exposure
- possibly reduce only the affected exercise if repeated
- do not recommend Recovery Window from this alone

### B. Expected hypertrophy fatigue

Definition:

Local fatigue appears late in the exercise or late in the session after target work has already been completed.

Signals:

- later-set drop-off after required work
- soft cap reached or approached
- isolation or machine accessory affected
- local muscle fatigue without broad performance decline
- quality work still completed

Interpretation:

Expected in hypertrophy and some powerbuilding work. It should not automatically become systemic fatigue.

Recommended response:

- maintain or slightly trim local volume
- keep the block going
- avoid adding extra sets to the same muscle immediately
- monitor trend

### C. Regressive shutdown

Definition:

The user is losing performance before useful work is completed, or repeated shutdowns show worsening output.

Signals:

- shutdown before required work
- sharp early drop-off
- quality sets falling
- best-set reps falling
- load falling
- target zone missed repeatedly
- repeated failure on primary or secondary compounds
- progression throttle already holding or pulling back

Interpretation:

Real fatigue or under-recovery signal.

Recommended response:

- hold or reduce load/volume
- reduce local stress
- consider exercise-specific or muscle-local intervention
- recommend Recovery Window only when spread and trend justify it

### D. Systemic fatigue

Definition:

Multiple unrelated lifts or sessions are affected, especially compounds, and performance is falling despite conservative adjustments.

Signals:

- multiple sessions affected
- unrelated muscles/lifts affected
- primary compounds affected
- quality sets falling across sessions
- performance trend falling
- extra workload high
- training gap/re-entry context
- repeated hold/pull throttle outcomes
- fatigue persists despite reduced work

Interpretation:

Valid Recovery Window evidence.

Recommended response:

- broad hold or pullback
- Recovery Window when repeated and high confidence
- avoid aggressive progression and new volume

## 3. Block-Specific Interpretation

The current code has goal-specific readiness weights and success model bias, but shutdown interpretation itself is not strongly block-specific.

### Hypertrophy

Current behavior:

- shutdown rate contributes to fatigue trend
- repeated shutdowns are failure indicators in the Build Muscle success model
- volume landmarks can treat high shutdown rate as high fatigue

Expected behavior:

Hypertrophy should tolerate more local fatigue when:

- required work is completed
- target zone is hit
- load/reps are stable or improving
- shutdown is late and local
- isolation or machine work is affected

Hypertrophy should become concerned when:

- target work is not completed
- performance trends down
- multiple compounds regress
- local fatigue repeatedly prevents useful work

Assessment:

Current logic is too blunt for hypertrophy. It can overvalue shutdown count/rate when the shutdown is actually productive.

### Powerbuilding

Current behavior:

- same broad shutdown inputs feed fatigue trend and deload evidence
- success model balances progression, quality sets, fatigue, and volume tolerance

Expected behavior:

Powerbuilding should tolerate some local hypertrophy fatigue, but protect heavy compound performance.

Assessment:

Reasonable at a high level, but still needs shutdown quality to avoid treating accessory fatigue like main-lift regression.

### Strength

Current behavior:

- Build Strength biases deload earlier
- failure indicators include early shutdowns on main lifts
- fatigue gets more weight than in Build Muscle

Expected behavior:

Shutdowns on primary lifts should matter more, especially if early or repeated. Isolation shutdowns should matter less.

Assessment:

Goal bias is sensible, but exercise-role weighting is incomplete.

### Power

Current behavior:

- Athletic Performance biases fatigue earlier
- Power quality model exists elsewhere

Expected behavior:

Power should be stricter because speed/quality matters. Shutdowns and output degradation should be interpreted earlier, especially on power movements.

Assessment:

The stricter goal bias helps, but shutdown quality and role are still not explicit enough.

### Peak

Current behavior:

- Peak constraints exist in generation and progression systems
- powerlifting meet success model biases fatigue earlier

Expected behavior:

Peak should be strictest. Any meaningful regression on specific lifts near a meet matters. Productive isolation shutdowns should be rare because accessory volume should already be low.

Assessment:

Likely acceptable in broad direction, but late-peak logic should avoid counting low-volume support work the same way as competition-lift regression.

### Recovery Window

Current behavior:

- active deload/recovery state forces fatigue classification to systemic/high
- recovery templates are low fatigue

Expected behavior:

Recovery Window should not accumulate aggressive fatigue evidence from deliberately reduced work.

Assessment:

No immediate issue found, but future shutdown-quality logic should avoid penalizing Recovery Window sessions unless performance is genuinely regressive.

## 4. Exercise-Role Weighting

Current classifier role weighting is mostly indirect:

- Exercise family and muscles determine related vs unrelated declines.
- Primary muscles determine local muscle signals.
- The model does not visibly weight shutdowns by slot role, exercise role, or block role.

Current strategic coaching also treats shutdown rate as an exercise-entry ratio, not a role-weighted signal.

### Expected weighting

Primary compounds:

- early shutdown is strong negative evidence
- repeated regression should matter
- late productive shutdown after completed target work is still worth monitoring

Secondary compounds:

- moderate evidence
- stronger concern if repeated or paired with primary compound decline

Machine compounds:

- moderate evidence
- can be productive local fatigue in hypertrophy
- stronger concern if target work is missed

Unilateral work:

- moderate-to-low systemic evidence
- often local or stability fatigue

Isolation:

- weak systemic evidence when target work is completed
- local-volume evidence at most
- should not drive Recovery Window alone

Calves:

- weak systemic evidence
- local-volume evidence

Core/bracing:

- depends on block and goal
- in strength/powerlifting contexts, repeated failure can matter
- in hypertrophy, should usually be low systemic impact

Power movements:

- stricter quality interpretation
- degradation matters earlier
- should not be treated like hypertrophy shutdown

Current assessment:

The system does not yet have enough exercise-role weighting for shutdown interpretation. This is a real modeling gap.

## 5. Progress Context Analysis

The app currently tracks many useful progress signals:

- progression earned
- quality sets
- best-set reps
- exercise performance trend
- volume load
- e1RM and PR data elsewhere
- target-zone learning and occupancy elsewhere
- manual finish reasons
- pain/equipment reasons

However, the Recovery Window trigger path does not fully ask:

- Was required work completed before shutdown?
- Was the target zone hit?
- Did load increase?
- Did reps improve?
- Did e1RM improve?
- Did this exercise hit a PR or new baseline?
- Was the shutdown late and local?
- Was the affected exercise an isolation/accessory?
- Was this a primary compound?
- Was performance improving despite shutdown?

This creates a mismatch.

Example:

```text
Lateral Raise
Week 1: 12kg x 18, 16, 14, shutdown
Week 2: 12kg x 20, 17, 15, shutdown
Week 3: 14kg x 16, 14, 12, shutdown
```

Current system sees repeated shutdowns.

A coach may see productive hypertrophy work if:

- required sets were completed
- target zone was hit
- load or reps improved
- shutdown occurred after useful work

The system should not treat that like:

```text
Squat
Week 1: 140kg x 5, 5, 5
Week 2: 140kg x 4, 3, shutdown
Week 3: 135kg x 3, shutdown
```

Those are materially different signals.

## 6. Screenshot Scenario Assessment

Scenario:

- hypertrophy block
- 4 completed workouts analysed
- 3 sessions include shutdown/drop-off
- user pushed hard intentionally
- some shutdowns likely happened after productive target work

### What the current app likely sees

Depending on the exact exercise summaries, the app may see:

- `sessionsAnalyzed = 4`
- enough entries for deload evidence
- shutdown rate high enough to raise fatigue trend
- sessionsWithShutdown high enough to contribute to systemic or mixed fatigue
- volume landmark shutdown rate possibly high for affected muscles
- Recovery Window recommendation if readiness/fatigue thresholds align

Because shutdown is binary, the app cannot reliably know whether those were:

- productive local shutdowns after target work, or
- regressive early shutdowns before useful work

### Would a good coach recommend immediate Recovery Window?

Not automatically.

A good coach would ask:

- Did the user complete required productive work?
- Did performance improve or at least match?
- Were shutdowns mostly isolation/local?
- Were primary compounds stable?
- Is the same muscle repeatedly failing early?
- Is the whole session declining?
- Are unrelated lifts dropping?
- Is fatigue carrying across sessions?

If shutdowns happened after productive target work, with improving or stable performance, a good coach would probably recommend:

- keep the block going
- hold volume
- avoid adding more volume immediately
- monitor the next session
- reduce only the affected exercise or muscle if needed

If shutdowns were early, repeated, and affecting compounds or unrelated sessions, a Recovery Window would be appropriate.

### Current answer

The current app may be too aggressive in this scenario if the shutdowns were productive hypertrophy shutdowns. The system has safeguards, but not the specific safeguard needed here: shutdown-quality classification.

## 7. Recommendation

Code should change in a focused follow-up.

The change should not weaken autoregulation. It should improve evidence quality.

Recommended model:

```text
shutdown_evidence_quality:
  productive_shutdown
  expected_local_fatigue
  regressive_shutdown
  systemic_fatigue
```

### Productive shutdown

Classify when:

- required sets completed
- target zone achieved
- performance matched or improved
- progression earned or target-zone improvement exists
- shutdown occurred after enough productive work
- affected exercise is isolation, machine/accessory, calves, or local hypertrophy work

Effect:

- neutral or weak local fatigue
- not systemic
- not Recovery Window evidence by itself
- can support "hard training detected; monitor next session"

### Expected local fatigue

Classify when:

- target work completed
- later-set drop-off occurs
- one muscle/exercise family affected
- no broad decline

Effect:

- local volume monitoring
- possible hold/reduce local accessory volume
- no Recovery Window unless combined with regressive trends

### Regressive shutdown

Classify when:

- shutdown before required work
- low quality sets
- target zone missed
- best-set reps falling
- load falling
- repeated on same exercise
- primary/secondary compound affected

Effect:

- stronger fatigue evidence
- exercise-specific or local recommendation
- Recovery Window only if spread/systemic evidence appears

### Systemic fatigue

Classify when:

- multiple unrelated exercises or sessions affected
- compounds affected
- quality sets and performance trend falling
- shutdowns repeat despite conservative work
- extra workload/recovery context supports it

Effect:

- Recovery Window eligible
- broad progression hold/pullback

### Where to apply

The new evidence quality should feed:

- `fatigue-classifier.ts`
- `strategic-coaching.ts`
- `deload-prescription.ts`
- `volume-landmarks.ts`
- `progress-dashboard.ts` evidence copy
- possibly `progression-throttle.ts` if repeated shutdowns are currently too broad

### Important implementation notes

Do not remove shutdown/drop-off as a fatigue signal.

Do not make every hard hypertrophy set positive.

Do not require RPE/RIR.

Use objective data only:

- sets completed
- required sets
- target zone
- best set reps
- load trend
- progression earned
- target-zone improvement
- exercise role
- session/block
- manual finish reason
- pain/equipment suppression

## 8. Proposed Tests

Add tests if a fix is implemented:

1. Hypertrophy isolation shutdown after target work does not trigger Recovery Window.

2. Productive shutdown with load/reps progress is neutral or weak local evidence.

3. Productive shutdown can still produce "monitor hard training" copy without deload.

4. Repeated compound early shutdown triggers exercise-specific or local fatigue concern.

5. Multiple unrelated compound shutdowns with falling performance trigger systemic fatigue.

6. Power and Peak blocks treat shutdown/output degradation more strictly than Hypertrophy.

7. Local fatigue does not become systemic fatigue automatically.

8. Recovery Window recommendation requires regressive/systemic evidence, not shutdown count alone.

9. Required work completed before shutdown lowers shutdown severity.

10. Shutdown before required work raises shutdown severity.

11. Progression earned or target-zone improvement suppresses aggressive Recovery Window recommendation unless systemic evidence also exists.

12. Volume landmarks do not recommend deload from high shutdown rate alone when performance is rising and target work is completed.

13. Primary compound shutdowns are weighted more strongly than isolation shutdowns.

14. Pain/manual finish/equipment finish remains separate and does not count as failed performance.

15. Recovery Window sessions do not accumulate aggressive fatigue evidence from intentionally reduced work.

## 9. Whether Code Should Change

Yes, but as a narrow coaching-evidence refinement rather than a broad architecture change.

The current logic is not reckless:

- it requires repeated completed-session evidence
- it combines shutdown rate with readiness, quality set trend, performance trend, volume tolerance, and fatigue classification
- it already separates exercise-specific, muscle-local, systemic, and mixed fatigue
- it already avoids deloading from one weak signal

But the current logic is still incomplete:

- shutdown/drop-off is binary
- productive hypertrophy shutdowns are not separated from regressive shutdowns
- exercise role is not weighted strongly enough
- block-specific interpretation is not explicit enough
- progress context is not fully used before Recovery Window pressure increases

Build/no-build recommendation:

Do not start a fresh preview build until this is either accepted as a known limitation or fixed with tests.

Recommended next step:

Implement a small shutdown-evidence-quality layer and feed it into fatigue classification, strategic deload evidence, and muscle-volume landmarks. This should be treated as a permitted frozen-architecture correction because it prevents productive training from being misclassified as systemic fatigue.

## 10. Implemented Fix

Status: implemented after real testing confirmed the risk.

The freeze was temporarily reopened because productive hypertrophy shutdowns could be overcounted as recovery pressure. The fix adds an objective shutdown evidence classification layer:

- `productive_shutdown`
- `expected_local_fatigue`
- `neutral_shutdown`
- `regressive_shutdown`
- `systemic_fatigue`

The Recovery Window path now uses regressive shutdown pressure instead of raw shutdown count where broad fatigue decisions are made.

Updated production paths:

- strategic readiness and Recovery Window recommendation pressure
- fatigue separation classifier
- muscle-volume landmark fatigue pressure
- Progress evidence copy
- deload prescription evidence copy

Productive shutdowns are now low-negative or neutral when the evidence shows:

- hypertrophy or powerbuilding context
- useful work completed
- progression or stable/improving load/reps
- local/accessory/isolation-dominant exercise
- no pain/equipment/manual negative finish
- no wider downward trend

Regressive shutdowns still count strongly when the evidence shows:

- early shutdown before useful work
- missed useful work
- primary compound involvement
- falling load/reps/quality sets
- repeated compound decline
- strict Power or Peak context

This keeps shutdown/drop-off as a meaningful fatigue signal while preventing hard productive hypertrophy work from being treated like systemic regression.
