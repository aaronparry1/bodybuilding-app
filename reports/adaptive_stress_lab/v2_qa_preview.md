# V2 QA Preview

Status: dev/test-only report. No simulator, network, Expo, Metro, or production navigation required.

## Summary

- Cases generated: 12
- Questionable outputs: 2

## Preview Rows

| Case | Cycle | Intent | Reps | Load | Sets | Confidence | Flags |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Hypertrophy isolation | Hypertrophy Accumulation | Verification / Balanced | Top-range check | Keep Load | One More Set | 80% | none |
| Hypertrophy compound | Hypertrophy Accumulation | Verification / Balanced | Top-range check | Keep Load | One More Set | 80% | none |
| Strength squat | Strength Intensification | Verification / Tension | Top-range check | Increase Load | One More Set | 82% | none |
| Strength bench | Strength Intensification | Verification / Tension | Top-range check | Increase Load | One More Set | 81% | none |
| Deadlift calibration | Strength Intensification | Calibration / Tension | AMRAP cap 4 | Conservative Start | Waiting for set | 63% | low_confidence |
| Athletic power movement | Athletic Performance Accumulation | Productive / Speed Power | 2-4 reps | Keep Load | One More Set | 77% | none |
| Athletic accessory | Athletic Performance Accumulation | Verification / Balanced | Top-range check | Keep Load | One More Set | 79% | none |
| Get lean poor recovery | Get Lean Deload | Recovery / Recovery | 8-12 reps | Reduce Load | One More Set | 84% | none |
| Deload | Build Muscle Strength Deload | Recovery / Recovery | 8-12 reps | Reduce Load | One More Set | 84% | none |
| Duration plank | Build Muscle Strength Accumulation | Productive / Balanced | 38 sec | No External Load | One More Set | 80% | none |
| Underloaded / top-range | Hypertrophy Accumulation | Verification / Balanced | Top-range check | Increase Load | One More Set | 81% | none |
| Unsupported fallback | Build Muscle Strength Accumulation | Calibration / Balanced | Top-range check | Conservative Start | Waiting for set | 57% | unsupported_fallback, low_confidence |

## Questionable Outputs

- deadlift_calibration: Deadlift calibration (low_confidence)
- unsupported_fallback: Unsupported fallback (unsupported_fallback, low_confidence)

