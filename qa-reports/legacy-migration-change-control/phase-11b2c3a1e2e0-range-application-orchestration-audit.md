# Set guidance application orchestration audit

## Scope and conclusion

This is a design-only audit for `raise_range` and `lower_range`. No production path is routed through E2B, E2C, or E2D in this phase.

`applyAdjustmentToSlots` is not an application boundary. It is a private programme-construction helper reached through `applyVolumeAdjustmentsToProgramme` from `buildPlannedWorkoutProgramme` in `planned-workout.ts`. Its inputs are a generated programme, an active plan, exercises, equipment, and optional legacy `TrainingBlock`. They cannot prove the identity, lifecycle, or planned-workout-reference facts required by E2C/E2D. Adding repositories or inferred facts there would violate the extracted-boundary design.

## Caller and lifecycle map

| Stage | Current symbol / owner | Available facts | Writes / result | E2C/E2D suitability |
| --- | --- | --- | --- | --- |
| Recommendation | personalised-volume result consumed by `approveVolumeAdjustment` | ladder action, muscle, confidence, evidence, reason, active block compatibility | creates an `applied` or `ignored` record in `recommendationState.volumeAdjustments` | Insufficient: no programme/session/workout target identity. |
| Legacy acceptance | `approveVolumeAdjustment` in `volume-adjustments.ts` | active plan and derived active block | immutable active-plan copy with record appended | Insufficient: record creation is not programme application and marks the legacy record applied before construction. |
| Programme construction | `buildPlannedWorkoutProgramme` in `planned-workout.ts` | active plan, generated programme, exercises, optional block, selected session index | generated programme value | Insufficient: has no authoritative planned-workout reference query. |
| Legacy dispatcher | `applyVolumeAdjustmentsToProgramme` → private `applyAdjustmentToSlots` | programme slots, adjustment record, exercises/equipment, optional block | transformed programme slots | Explicitly unsuitable: it cannot identify future guidance versus an existing workout. |
| Read-only consumers | `previousVolumeLadderActions`, Home, Progress, recovery delivery | active-plan adjustment history | presentation/recommendation history | Not an application owner. |

There is one production caller of `applyVolumeAdjustmentsToProgramme`: `buildPlannedWorkoutProgramme`. Tests invoke the exported record functions directly, but are not production authority sources.

## Adjustment record audit

`VolumeAdjustmentRecord` contains `id`, muscle, action, confidence, evidence summary, status, timestamp, legacy week/block compatibility fields, affected exercise IDs, and reason. Its ID is time-derived and its lifecycle is only `applied`/`ignored`.

It does **not** contain active-plan ID, programme/template ID, mesocycle or microcycle identity, planned-session identity, workout reference, exact-target coverage, application idempotency key, or a future-guidance timing policy. Consequently it cannot prove either an E2C scope or an E2D lifecycle guard fact. Schema changes are explicitly deferred.

## Active plan and planned-workout reference resolution

The eventual orchestrator must resolve the active plan and the precise programme-guidance target before calling E2C. It must then query planned-workout storage outside the pure boundaries to establish whether a workout references that target. The proposed relationship is identity-based, never timestamp- or block/week-based:

1. active plan ID;
2. programme/template guidance identity;
3. mesocycle identity;
4. microcycle number/attempt;
5. planned session index or role; and
6. where applicable, exercise/slot identity and the adjustment muscle scope.

An open or completed workout blocks only when this relationship is proven. The current record/schema does not contain all dimensions required to establish that proof. An unknown or mixed relationship must block application rather than be treated as future guidance.

## Timing and persistence findings

Legacy behaviour appends an `applied` adjustment record, then applies it while a new programme is built. It does not model whether the change is for a later session in the same microcycle, the next microcycle, or a later mesocycle; nor does it query whether a planned workout already exists. The timing semantics are therefore a product/training-policy blocker.

Future transaction order must be: validate command and stale identities; resolve target and reference facts; E2C scope classification; E2D lifecycle guard; timing policy; E2B normalization; persist programme guidance; persist application lifecycle/audit event; publish sync work. A failed guidance write must not leave an applied record; replay must return `already_applied` without a second range shift.

## Recommended future boundary

Use a dedicated stateful `CurrentVolumeGuidanceApplicationService`, rather than expanding `applyAdjustmentToSlots` or using the current decision application service. It is the smallest owner that can coordinate repositories, validation, idempotency, persistence order, and the pure E2B/E2C/E2D boundaries without granting those boundaries repository authority.

Proposed command: `ApplyRecommendedSetGuidanceAdjustmentCommand` with adjustment-record ID, active-plan ID, guidance target identity, expected mesocycle/microcycle/session identity, raise/lower direction and magnitude, policy version, idempotency key, and externally supplied timestamp. It excludes repository handles, full `TrainingBlock`, exact-target values, and UI callbacks.

Proposed outcomes: `applied_future_guidance`, `already_applied`, `blocked_open_planned_reference`, `blocked_completed_reference`, `blocked_unresolved_target`, `stale_plan_identity`, `stale_adjustment`, `compatibility_policy_required`, `timing_policy_required`, `normalization_failed`, `persistence_failed`, and `invalid_command`.

## Product and routing gates

Product/training-policy decisions remain required for mid-microcycle timing, the effect of an already-created future workout, manual versus automatic acceptance, stale block-scoped adjustments, and the outcome when target-to-workout identity cannot be proven.

No `raise_range` or `lower_range` routing is permitted until all of the following exist: authoritative active-plan target identity; planned-workout reference resolver; explicit timing policy; idempotent lifecycle; validated persistence/failure ordering; proof of no exact-target rewrite or workout rebuild; E2C/E2D facts resolved rather than inferred; focused and full-suite verification.

## Revised implementation sequence

1. **E2E1** — command and read-only resolver types; no production caller. Commit: `refactor: define set guidance application command`.
2. **E2E2** — authoritative target/workout-reference resolver with identity tests. Commit: `refactor: resolve set guidance workout references`.
3. **E2E3** — idempotent application service without production routing. Commit: `refactor: add set guidance application service`.
4. **E2E4** — route `raise_range` after approved timing policy. Commit: `refactor: apply future set guidance increases`.
5. **E2E5** — route `lower_range` with the same resolver/lifecycle semantics. Commit: `refactor: apply future set guidance reductions`.
6. **E2E6** — migrate accepted legacy action caller and retire only replaced legacy handling. Commit: `refactor: migrate set guidance action application`.
7. **E2E7/E2H** — branch certification and cleanup. Commit: `test: certify set guidance application boundaries`.

Rollback remains each isolated command/resolver/service commit; the legacy programme-construction dispatcher remains intact until branch-specific routing passes equivalence and authority gates.
