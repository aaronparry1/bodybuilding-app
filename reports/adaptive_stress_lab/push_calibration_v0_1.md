# Push Calibration v0.1

Generated: 2026-06-28T14:31:04.405Z

## Scope

Sprint 12 hardens V2 lab push behaviour after the Coaching Opportunity Audit showed that push recommendations were overconfident and often premature.

This is research-lab calibration only. Production app code, V1 workout generation, V1 progression, and subscription logic were not touched.

## Calibration Changes

- Raised push eligibility from broad excellent-state evidence to strict repeated same-exercise evidence.
- Push now requires:
  - Safety Gate `clear`
  - evidence quality `>= 90`
  - at least `3` successful comparable exposures of the same exercise
  - no pain flags
  - no recent shutdowns
  - no recent missed minimum range
  - no swap or new-exercise uncertainty
  - recovery capacity `>= 80`
  - momentum `>= 75`
  - adaptation `>= 75`
  - confidence `>= 70`
  - goal-progress evidence strong enough to support a push
  - no recent recovery compression
  - no high workload density warning
- Push confidence is capped:
  - evidence quality `90-94`: max push confidence `75`
  - evidence quality `95+`: max push confidence `85`
- Push recommendations now carry an internal category:
  - `micro_push`
  - `volume_push`
  - `load_push`
- Default push category is `micro_push`.
- Mixed evidence now prefers `hold` or `consolidate`; `reduce` is reserved for objective decline or safety-relevant local issues.
- High compound/axial loading is no longer treated as a structural stress problem by itself.

## Before / After

| Metric | Before | After |
|---|---:|---:|
| Total decisions audited | 1040 | 1040 |
| Overall correctness | 74% | 85% |
| Four-week positive outcome rate | 58% | 59% |
| Push count | 216 | 238 |
| Push correctness | 45% | 63% |
| Premature pushes | 118 | 88 |
| Missed pushes | 72 | 20 |
| High-confidence wrong decisions | 198 | 0 |
| Total opportunity cost | 2096 | 1055 |
| Average opportunity cost | 2 | 1 |
| Too conservative | 94 | 0 |
| Too aggressive | 55 | 45 |
| Unnecessary recovery | 0 | 0 |

## Current Decision Calibration

| Recommendation | Total | Correct | Correctness Rate | Avg Confidence |
|---|---:|---:|---:|---:|
| `consolidate` | 315 | 270 | 86% | 90 |
| `hold` | 232 | 212 | 91% | 73 |
| `push` | 238 | 150 | 63% | 81 |
| `recover` | 75 | 75 | 100% | 92 |
| `reduce` | 140 | 140 | 100% | 78 |
| `stop_movement` | 40 | 40 | 100% | 100 |

## Simulation v0.2 Snapshot After Calibration

- Athletes: `20`
- Weeks: `1040`
- Verdict: `promising`
- Final V1 progress: `64`
- Final V2 progress: `71`
- Average V1 progress: `73`
- Average V2 progress: `76`
- V1 over-aggressive pushes: `220`
- V2 over-aggressive pushes: `0`
- V2 unnecessary recovery weeks: `0`
- V2 missed unsafe pain responses: `0`
- V2 under-aggressive holds: `20`
- Average V2 decision confidence: `83`

## Findings

Push calibration improved materially without collapsing push behaviour.

The coach still pushes `238` times across `1040` simulated weeks, so this did not become a no-push engine. Push correctness improved from `45%` to `63%`, premature pushes dropped from `118` to `88`, and high-confidence wrong decisions dropped from `198` to `0`.

The biggest useful change was separating “progressing” from “ready to push.” Goal-progress support now blocks pushes when progress is mixed, body-composition confidence is low, or the goal-specific evidence does not justify extra stress.

The high-confidence wrong `reduce` problem was also fixed. The lab had been treating ordinary strength-plan compound density as a stress-management issue. It now requires density plus actual stress pressure before reducing.

## Remaining Weaknesses

- Push correctness is better but still only `63%`; V2 still needs finer distinction between `micro_push`, `volume_push`, and `load_push`.
- Premature pushes remain at `88`; most are now lower-confidence, but the coach can still over-read normal progress.
- The audit ideal action is heuristic, so the exact correctness rate should not be treated as biological truth.
- Four-week outcomes remain synthetic and simplified.
- `recover` is perfect in this audit, but some Get Lean recovery decisions still have low body-composition confidence; the distinction between training recovery and body-composition confidence needs more modeling.

## Recommended Next Tuning

1. Split push evaluation by category:
   - `micro_push` correctness
   - `volume_push` correctness
   - `load_push` correctness
2. Add a cost model for push type:
   - micro-push should be cheap
   - load-push should require exceptional evidence
   - performance-push should remain rare
3. Add goal-specific push policies:
   - Get Lean should treat performance preservation as success unless body-composition evidence is strong.
   - Build Muscle should prefer volume quality before load escalation.
   - Strength should require same-exercise evidence on the competition lifts before load push.
4. Add a “push withheld” audit table to show whether withheld pushes later became missed opportunities.

## Open Aaron Decisions

- Should V2 eventually expose push categories in reports, or keep them internal?
- Should `performance_push` be unavailable until a much later validation phase?
- Should Get Lean ever push training stress without body-fat or waist evidence?
- Should push confidence cap stay at `85`, or should exceptional multi-block evidence allow `90+`?

## Production Safety Confirmation

- Production app code was not touched.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Subscription/paywall logic was not modified.
- No EAS build was started.
