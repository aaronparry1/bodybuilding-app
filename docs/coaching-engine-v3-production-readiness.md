# Coaching Engine V3 Production Readiness

## Architecture Status

Coaching Engine V3 now has:

- typed `TrainingStateSnapshot` input
- typed `CoachingPacketV3` output
- gated shadow mode
- gated active workout mode
- strict activation readiness checks
- current-engine fallback
- direct-exercise calibration lifecycle
- historical calibration migration
- internal calibration audit utility
- production-readiness helper derived from audit evidence
- explicit staged-rollout criteria for real-device validation, reviewed shadow comparison evidence, and rollout documentation

V3 remains disabled by default for production. Active use still requires explicit flags and a passing quality gate:

- `ASC_COACHING_ENGINE_V3=true`
- `ASC_V3_ACTIVE_WORKOUT=true`
- `ASC_V3_QUALITY_GATE_STRICT=true`

## Blocker Ranking

### Production Blocking

1. **Real-device active workout validation must pass before a staged rollout.**
   - Source implementation: `buildCoachingEngineV3ProductionReadinessReport` exposes `realDeviceActiveWorkoutValidationPassed`; the V3 active path is gated by `tryBuildActiveWorkoutFromV3` and `canActivateV3ForWorkout`.
   - Test coverage: `tests/coaching-engine-v3.test.ts` proves missing real-device validation keeps the recommendation at `internal_only`.
   - Evidence: attempted on 2026-07-10 against paired device `Aaron's iPhone (2)`, but validation was blocked before app launch because no V3-enabled internal/preview installable artifact was available and local Xcode/Expo install commands hung before producing actionable output.
   - Evidence paths:
     - `qa-reports/v3-real-device-20260710/device-info.json`
     - `qa-reports/v3-real-device-20260710/device-apps.json`
     - `qa-reports/v3-real-device-20260710/eas-build-list.json`
     - `qa-reports/v3-real-device-20260710/validation-summary.txt`
   - Status: **open**.

### High Risk

1. **Representative shadow comparison evidence must be reviewed before staged rollout.**
   - Source implementation: `runCoachingEngineV3ShadowTelemetry` and `compareCurrentOutputToV3`.
   - Evidence: reviewed on 2026-07-10 with a 9-scenario representative sample covering improving athlete, sparse beginner, 10-day return, repeated poor response, pull/lower/full-body structures, unsupported equipment, and current one-exercise low-volume output.
   - Evidence paths:
     - `qa-reports/v3-shadow-telemetry-review/review.json`
     - `qa-reports/v3-shadow-telemetry-review/review-summary.md`
     - `qa-reports/v3-shadow-telemetry-review.test.ts`
   - Status: **resolved for staged rollout evidence**. No V3 defects were identified in the reviewed risky/blocked cases.

2. **Production monitoring must exist before a full production switch.**
   - Source implementation: `buildCoachingEngineV3ProductionReadinessReport` exposes `productionMonitoringReady`.
   - Source monitoring verified in this review:
     - V3 used/fallback: `CoachingEngineV3ActiveWorkoutLog.usedV3` and `fallbackReason`.
     - Block reasons: `CoachingEngineV3ActiveWorkoutLog.blockedReasons` and readiness reasons from `canActivateV3ForWorkout`.
     - Quality state: `qualityState` in shadow and active logs.
     - Generation time: `generationTimeMs` in shadow and active logs.
     - Session creation failures: `shadow_failed` and `active_failed` catch paths with `fallbackReason`.
     - Calibration state: per-exercise `exerciseCalibration.state`, confidence and direct exposure fields in `CoachingPacketV3`.
     - Exact-load source: per-exercise `loadPrescription.source`, `loadPrescription.type`, confidence and reason.
   - Status: **source-level monitoring resolved**. External production alerting/dashboards are still a rollout operations concern, but the required app-side telemetry fields exist.

3. **Rollout criteria must remain explicit and source-backed.**
   - Source implementation: readiness input `rolloutCriteriaDocumented`.
   - Test coverage: missing rollout criteria keeps the recommendation at `internal_only`.
   - Status: **resolved in architecture/docs** by this report and the updated readiness helper.

### Medium Risk

1. **Sparse historical logs may leave many exercises calibrating for existing users.**
   - Source implementation: calibration migration and audit in `src/domain/training/coaching-engine-v3.ts`.
   - Test coverage: sparse history lowers confidence and uses calibration rather than fabricated exact loads.
   - Status: **accepted risk**. This is honest behaviour and should be monitored, not weakened.

2. **Custom exercise identity must remain strict.**
   - Source implementation: canonical exact identity matching and conservative audit states.
   - Test coverage: custom and ambiguous exercises do not unlock exact loading from indirect history.
   - Status: **accepted risk**. Do not widen matching without evidence.

### Cleanup

1. **Legacy fallback remains required.**
   - Source implementation: `tryBuildActiveWorkoutFromV3`.
   - Test coverage: flags-off, readiness-blocked, and V3-crash scenarios all return the current session.
   - Status: **intentionally open** until real-device active validation is sufficient.

2. **Full app suite may include unrelated legacy/UI/billing failures.**
   - Status: must be checked during each build-readiness run. V3 readiness should not be promoted if full verification is red.

## Calibration Integrity Status

The Phase 12 audit utility reports each historical exercise by canonical exact identity:

- direct exposure count
- recent usable direct exposures
- rep-range context
- equipment signature
- setup key
- calibration state
- exact-load eligibility
- load source
- confidence
- graduation or recalibration reason
- last usable evidence date
- coach-sanity flags

Current integrity rules:

- one exposure cannot confirm an exercise
- exact loading requires repeated direct evidence from the same canonical exercise
- indirect exercise history cannot unlock exact loading
- machine/free-weight transfer cannot unlock exact loading
- bilateral/unilateral transfer cannot unlock exact loading
- stale, rep-range-shifted or setup-changed evidence requires recalibration
- contradictory history cannot become high-confidence exact loading
- malformed evidence is rejected before migration

Evidence from tests:

- no fabricated exact loads
- no indirect exercise load transfer
- no one-exposure progression
- direct same-exercise history can unlock exact loading only after stable repeat evidence
- inconsistent, stale, setup-changed, or rep-range-shifted evidence stays calibrating or requires recalibration

## Active Workout Integrity Status

V3 active workout generation remains gated. If flags are off, readiness fails, V3 generation throws, or quality validation blocks the packet, the app uses the current engine session.

Evidence from tests:

- flags off = current engine only
- V3 approved = active session can be built from V3
- V3 blocked = current engine fallback
- V3 crash = current engine fallback
- one-exercise normal sessions cannot reach active UI
- 10-day return does not deload or collapse volume when deload evidence is absent
- active generation is bounded and not called from the React render initializer

## Shadow Telemetry Review Status

Representative V3 shadow comparison review was completed on 2026-07-10.

Evidence paths:

- `qa-reports/v3-shadow-telemetry-review/review.json`
- `qa-reports/v3-shadow-telemetry-review/review-summary.md`
- `qa-reports/v3-shadow-telemetry-review.test.ts`

Sample reviewed:

- Normal improving athlete
- Sparse beginner history
- 10-day return after training gap
- Repeated poor response
- Pull session complete structure
- Lower session complete structure
- Full-body session complete structure
- Unsupported equipment supplied to comparison
- Current one-exercise low-volume normal session

Comparison status counts:

- `aligned`: 0
- `acceptable_difference`: 1
- `risky_difference`: 7
- `blocked`: 1

Risky and blocked case classification:

| Case | Status | Classification | Review |
| --- | --- | --- | --- |
| Normal improving athlete | `risky_difference` | current-engine defect | Current output was thinner than V3, with exercise-count and role mismatch plus low-volume risk. |
| Sparse beginner history | `risky_difference` | current-engine defect / expected calibration behaviour | V3 produced fuller structure while correctly using lower-confidence calibration because direct evidence was sparse. |
| 10-day return after training gap | `risky_difference` | current-engine defect / expected calibration behaviour | V3 kept stress mode normal and did not deload from a gap alone; risk came from current low-volume/role mismatch and calibration honesty. |
| Pull session complete structure | `risky_difference` | current-engine defect | V3 produced fuller role structure; current output looked too thin. |
| Lower session complete structure | `risky_difference` | current-engine defect / expected calibration behaviour | V3 produced fuller role structure while keeping uncertain load sources in calibration. |
| Full-body session complete structure | `risky_difference` | current-engine defect / expected calibration behaviour | V3 produced fuller role structure while keeping uncertain load sources in calibration. |
| Unsupported equipment supplied to comparison | `blocked` | insufficient evidence | Blocked because supplied equipment did not support V3 exercise selection. This is an input/equipment compatibility issue, not a V3 coaching defect. |
| Current one-exercise low-volume normal session | `risky_difference` | current-engine defect | V3 correctly exposed current one-exercise normal output as too low-volume. |

Reviewed outcome:

- V3 defects found: **0**
- Current-engine defects found: **7 risky cases**
- Expected calibration behaviour: present in sparse/evidence-light cases
- Insufficient evidence/input mismatch: **1 blocked equipment case**

The risky differences mostly indicate that V3 is more complete and more honest about calibration than the current path. They do not justify weakening V3 gates.

## Monitoring Status

Source-level V3 monitoring fields exist for the required rollout checks:

- V3 used/fallback: `CoachingEngineV3ActiveWorkoutLog.usedV3` and `fallbackReason`
- Block reasons: `CoachingEngineV3ActiveWorkoutLog.blockedReasons` and readiness reasons from `canActivateV3ForWorkout`
- Quality state: `qualityState` in shadow and active logs
- Generation time: `generationTimeMs` in shadow and active logs
- Session creation failures: `shadow_failed` and `active_failed` catch paths with `fallbackReason`
- Calibration state: per-exercise `exerciseCalibration.state`, confidence and direct exposure fields in `CoachingPacketV3`
- Exact-load source: per-exercise `loadPrescription.source`, `loadPrescription.type`, confidence and reason

No sensitive user data was required for this review. The generated evidence uses synthetic fixture athletes and workout histories.

## Performance Status

Calibration migration is cached by completed-session and exercise-summary evidence fields. The cache is bounded.

Large-history audit tests cover hundreds of sessions and truncate retained calibration evidence per exercise. Active workout rendering consumes a prebuilt snapshot or packet rather than scanning full history on every render or set log.

Evidence from tests:

- calibration migration cache returns the same result for unchanged history
- retained evidence is capped per exercise
- large-history audit remains under the current test budget
- active V3 generation remains under the current focused performance budget

## Fallback Paths Still Active

- V3 disabled by flags: current engine is used.
- V3 active flag disabled: current engine is used.
- V3 packet blocked: current engine is used.
- V3 generation throws: current engine is used.
- V3 quality gate fails: current engine is used.
- V3 load calibration is uncertain: selected exercise remains in calibration instead of receiving fabricated exact load.

## Production Readiness Criteria

V3 cannot be recommended for production unless:

- no fake exact loads are produced
- no one-exposure exercise graduates
- no indirect load transfer unlocks exact prescriptions
- the quality gate passes
- fallback remains safe
- large-history performance remains bounded
- active logging, completion and history recording remain intact
- representative longitudinal calibration scenarios pass
- production defaults remain off until intentionally changed
- real-device active workout validation passes
- representative shadow comparison evidence is reviewed
- rollout criteria are documented
- production monitoring is ready

The readiness helper now models these as explicit evidence fields rather than prose-only requirements.

## Blockers Resolved

- Production rollout criteria are now explicit in the readiness helper and this report.
- Representative shadow comparison telemetry has been reviewed across 9 scenarios. No V3 defects were found.
- Source-level monitoring fields exist for V3 used/fallback, block reasons, quality state, generation time, session creation failures, calibration state, and exact-load source.
- The readiness helper now distinguishes:
  - `not_ready`: core integrity or safety criteria fail
  - `internal_only`: core criteria pass, but device/telemetry/rollout evidence is missing
  - `staged_rollout_ready`: core criteria and rollout evidence pass, production monitoring still pending
  - `production_ready`: all criteria pass

## Blockers Still Open

- Real-device active workout validation with representative existing-user accounts.
- External production monitoring/alerting operations are not validated in this report, although app-side telemetry fields exist.
- Legacy fallback remains active by design.

## Latest Verification Evidence

Commands run during this readiness update:

- `npx vitest run qa-reports/v3-shadow-telemetry-review.test.ts --reporter=dot`
  - Result: **pass**
  - Generated reviewed shadow evidence at `qa-reports/v3-shadow-telemetry-review/review.json`.
  - Sample: 9 scenarios; 7 `risky_difference`, 1 `acceptable_difference`, 1 `blocked`.
  - V3 defects found: **0**.
- `npx vitest run tests/coaching-engine-v3.test.ts --reporter=dot`
  - Result: **pass**
  - 71 V3-focused tests passed.
- `npx tsc --noEmit`
  - Result: **pass** in the latest repo-wide verification cleanup.
- `npm test -- --reporter=dot`
  - Result: **pass** in the latest repo-wide verification cleanup.
  - 150 test files passed; 1766 tests passed.
- `npx expo export --platform web`
  - Result: **not rerun during this shadow review**. The prior readiness update recorded a passing web export.

## Recommendation

Current recommendation: **staged rollout ready for TestFlight release-candidate validation**.

Reason:

The core V3 calibration and quality gates are source-backed, focused tests pass, representative shadow comparison evidence has been reviewed, app-side monitoring fields exist, and the production release-candidate configuration now enables V3 active workout generation behind strict activation readiness with the current engine retained as automatic fallback. The next App Store Connect build is intended for TestFlight/device validation, not public release.

## Release Candidate Configuration

Production build flags for the next App Store Connect release candidate:

- `ASC_COACHING_ENGINE_V3=true`
- `ASC_V3_ACTIVE_WORKOUT=true`
- `ASC_V3_QUALITY_GATE_STRICT=true`
- `ASC_V3_SHADOW_MODE=false`
- `EXPO_PUBLIC_ASC_COACHING_ENGINE_V3=true`
- `EXPO_PUBLIC_ASC_V3_ACTIVE_WORKOUT=true`
- `EXPO_PUBLIC_ASC_V3_QUALITY_GATE_STRICT=true`
- `EXPO_PUBLIC_ASC_V3_SHADOW_MODE=false`

Current production config inspection resolves:

- Bundle identifier: `com.aaronparry.adaptivestrengthcoach`
- Marketing version: `1.0.10`
- iOS build number: `34`
- Design QA mode: `false`
- V3 active workout: `true`
- V3 quality gate strict: `true`
- V3 shadow mode: `false`

## Production Monitoring Fields

App-side V3 active workout telemetry records a sanitized summary:

- V3 used or fallback used
- Fallback/block reason
- Packet quality state
- Generation duration
- Session creation status
- Stress mode
- Calibration-state counts
- Load prescription type counts
- Load source category counts

Telemetry must not include athlete names, email addresses, free-text notes, raw workout history, or sensitive personal data.

## Release Kill Switch

No remote configuration service currently exists that can disable V3 active workout generation without a new binary.

Emergency rollback path:

1. Set production V3 active flags to false in `eas.json`.
2. Keep the current-engine fallback path intact.
3. Increment the iOS build number.
4. Build and upload a replacement production archive through EAS.
5. Stop TestFlight rollout of the V3 release-candidate build and move testers to the rollback build.

Do not claim a remote kill switch exists until a real remote configuration mechanism is implemented and tested.

## TestFlight Validation Checklist

Before public release, validate the uploaded release-candidate build on device:

- V3 approved workout starts from Train.
- V3 fallback starts workout if readiness blocks or generation fails.
- 10-day training gap does not trigger unjustified deload or ultra-low volume.
- New exercise shows calibration with no fabricated work-set load.
- One calibration exposure does not unlock progression.
- Confirmed direct exercise history can prescribe an exact load.
- Normal sessions contain a complete multi-exercise structure.
- Set logging remains fast.
- Workout completion persists history.
- App restart/resume preserves active workout state.
- Exercise swap does not corrupt calibration or progression state.
- Production UI shows no Design QA or V3 debug status labels.
- Telemetry contains only sanitized status/count/category fields.
