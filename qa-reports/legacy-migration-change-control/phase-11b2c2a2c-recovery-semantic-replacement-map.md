# Current Progress recovery semantic-replacement map

| Helper / input | Legacy recovery source | Old behaviour | Current replacement | Intended difference | Unchanged neighbours |
| --- | --- | --- | --- | --- | --- |
| Action flow | `isRecoveryPriority(strategic, fatigue)` and accepted block deload | High historical fatigue or a legacy deload/recovery title created a deload action. | `CurrentProgressRecoveryContext` status. | Only persisted `deload` or active current deload creates recovery action. | Rotation, volume, strategic transition order. |
| Primary evidence | Legacy recovery priority plus fatigue classifier/reasons | Recovery evidence was actionable whenever legacy priority was true. | Current recovery state and historical warning. | Watch is supporting/non-actionable; only recommended/active is action evidence. | Historical, rotation, volume, strategic categories. |
| Journey actions | Legacy recovery priority boolean | Legacy fatigue priority created a recovery journey action. | Current recovery state. | Watch and unavailable states create no recovery journey action. | Rotation and strategic journey branches. |
| Verdict/action copy | Legacy recovery priority boolean; legacy recommendation copy | A legacy deload recommendation could present recovery copy. | Current recovery state, with recovery-title filtering in compatibility copy. | Current recovery action gets concise copy; legacy deload wording cannot create it. | General strategic copy, rotation and volume copy. |

Historical fatigue is carried only as the recovery context's `historicalWarning`. It is never a decision, plan, volume, progression, successor, or recovery-action authority. The action-flow order remains history gate → recovery → rotation → volume → strategic transition → default. Legacy strategic, rotation, and volume compatibility inputs remain until their separate semantic phases.
