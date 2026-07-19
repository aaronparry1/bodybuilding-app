export const CANONICAL_SESSION_DURATION_POLICY_ID = "canonical_session_duration_policy_v2" as const;
export const canonicalSessionDurationOptions = [30, 45, 60, 75, 90] as const;

export type CanonicalSessionDurationMinutes = (typeof canonicalSessionDurationOptions)[number];
export type CanonicalDurationConstructionRole = "primary" | "secondary" | "accessory";
export type CanonicalDurationLoadConfidence = "calibration_required" | "established";

export type CanonicalSessionDurationResolution =
  | Readonly<{ status: "valid"; policyId: typeof CANONICAL_SESSION_DURATION_POLICY_ID; minutes: CanonicalSessionDurationMinutes }>
  | Readonly<{ status: "invalid"; policyId: typeof CANONICAL_SESSION_DURATION_POLICY_ID; reason: "unsupported_session_duration"; customerGuidance: string }>;

export type CanonicalDurationPlanningSlot = Readonly<{
  constructionRole: CanonicalDurationConstructionRole;
  workingSets: number;
  movementPatterns: readonly string[];
  method?: string;
  prescribedRestSeconds?: number;
  loadConfidence?: CanonicalDurationLoadConfidence;
}>;

export type CanonicalSessionDurationEstimate = Readonly<{
  schemaVersion: "canonical_session_duration_estimate_v1";
  policyId: typeof CANONICAL_SESSION_DURATION_POLICY_ID;
  minutes: number;
  totalSeconds: number;
  breakdownSeconds: Readonly<{
    generalWarmup: number;
    liftSpecificRamp: number;
    workingSetExecution: number;
    prescribedInterSetRest: number;
    equipmentSetup: number;
    exerciseTransitions: number;
    unilateralOverhead: number;
    calibrationOverhead: number;
    methodOverhead: number;
  }>;
  assumptions: readonly string[];
}>;

export type CanonicalObservedDurationCalibration = Readonly<{
  schemaVersion: "canonical_observed_duration_calibration_v1";
  status: "not_available" | "calibrated";
  comparableCompletedObservations: number;
  multiplier: number;
  calibratedFutureMinutes: number;
  completedHistoryRewritten: false;
}>;

export function resolveCanonicalSessionDuration(value: unknown): CanonicalSessionDurationResolution {
  if (!canonicalSessionDurationOptions.includes(value as CanonicalSessionDurationMinutes)) {
    return {
      status: "invalid",
      policyId: CANONICAL_SESSION_DURATION_POLICY_ID,
      reason: "unsupported_session_duration",
      customerGuidance: "Choose 30, 45, 60, 75 or 90 minutes per workout.",
    };
  }
  return { status: "valid", policyId: CANONICAL_SESSION_DURATION_POLICY_ID, minutes: value as CanonicalSessionDurationMinutes };
}

export function normalizeCanonicalSessionDuration(value: unknown): CanonicalSessionDurationMinutes {
  const resolved = resolveCanonicalSessionDuration(value);
  return resolved.status === "valid" ? resolved.minutes : 75;
}

/** Deterministic construction estimate. Unlike the former set-count shortcut,
 * this accounts for the material work that makes a prescription executable.
 * Exact snapshot rest and load states may be supplied after construction; the
 * allocator uses the same model with role-owned defaults before selection. */
export function estimateCanonicalSessionDuration(
  slots: readonly CanonicalDurationPlanningSlot[],
  defaultLoadConfidence: CanonicalDurationLoadConfidence = "calibration_required",
): CanonicalSessionDurationEstimate {
  const generalWarmup = slots.length ? 240 : 0;
  let liftSpecificRamp = 0;
  let workingSetExecution = 0;
  let prescribedInterSetRest = 0;
  let unilateralOverhead = 0;
  let calibrationOverhead = 0;
  let methodOverhead = 0;

  for (const slot of slots) {
    const confidence = slot.loadConfidence ?? defaultLoadConfidence;
    liftSpecificRamp += rampSeconds(slot.constructionRole, confidence);
    const unilateral = slot.movementPatterns.includes("lunge") || slot.movementPatterns.includes("single_leg");
    workingSetExecution += slot.workingSets * 40;
    if (unilateral) unilateralOverhead += slot.workingSets * 35;
    const rest = slot.prescribedRestSeconds ?? defaultRestSeconds(slot.constructionRole);
    prescribedInterSetRest += Math.max(0, slot.workingSets - 1) * rest;
    if (confidence === "calibration_required") calibrationOverhead += 10;
    methodOverhead += methodSeconds(slot.method, slot.workingSets);
  }

  const equipmentSetup = slots.length * 30;
  const exerciseTransitions = Math.max(0, slots.length - 1) * 30;
  const breakdownSeconds = {
    generalWarmup,
    liftSpecificRamp,
    workingSetExecution,
    prescribedInterSetRest,
    equipmentSetup,
    exerciseTransitions,
    unilateralOverhead,
    calibrationOverhead,
    methodOverhead,
  };
  const totalSeconds = Object.values(breakdownSeconds).reduce((sum, seconds) => sum + seconds, 0);
  return {
    schemaVersion: "canonical_session_duration_estimate_v1",
    policyId: CANONICAL_SESSION_DURATION_POLICY_ID,
    minutes: Math.ceil(totalSeconds / 60),
    totalSeconds,
    breakdownSeconds,
    assumptions: [
      "general_warmup_included",
      "lift_specific_ramps_included",
      "prescribed_or_role_owned_rest_included",
      "set_execution_and_unilateral_time_included",
      "equipment_setup_and_transitions_included",
      "calibration_and_method_overhead_included",
    ],
  };
}

/** Calibrates future presentation only after three comparable completed
 * observations. The bounded median ratio prevents one interrupted workout
 * from rewriting future estimates and never mutates completed history. */
export function calibrateCanonicalSessionDurationEstimate(input: Readonly<{
  predictedMinutes: number;
  comparableObservedMinutes: readonly number[];
}>): CanonicalObservedDurationCalibration {
  const valid = input.comparableObservedMinutes.filter((minutes) => Number.isFinite(minutes) && minutes >= 5 && minutes <= 240).sort((a, b) => a - b);
  if (valid.length < 3 || input.predictedMinutes <= 0) {
    return { schemaVersion: "canonical_observed_duration_calibration_v1", status: "not_available", comparableCompletedObservations: valid.length, multiplier: 1, calibratedFutureMinutes: input.predictedMinutes, completedHistoryRewritten: false };
  }
  const median = valid[Math.floor(valid.length / 2)]!;
  const multiplier = Math.max(0.75, Math.min(1.25, median / input.predictedMinutes));
  return { schemaVersion: "canonical_observed_duration_calibration_v1", status: "calibrated", comparableCompletedObservations: valid.length, multiplier, calibratedFutureMinutes: Math.ceil(input.predictedMinutes * multiplier), completedHistoryRewritten: false };
}

function rampSeconds(role: CanonicalDurationConstructionRole, confidence: CanonicalDurationLoadConfidence): number {
  if (role === "primary") return confidence === "calibration_required" ? 180 : 120;
  if (role === "secondary") return 60;
  return confidence === "calibration_required" ? 30 : 0;
}

function defaultRestSeconds(role: CanonicalDurationConstructionRole): number {
  // These are conservative pre-selection allowances. Exact Session
  // Construction rest replaces them at the post-construction gate; using the
  // upper ordinary prescription prevents allocation from promising a session
  // that the immutable snapshot cannot execute inside the chosen duration.
  return role === "primary" ? 180 : role === "secondary" ? 150 : 90;
}

function methodSeconds(method: string | undefined, workingSets: number): number {
  if (method === "pyramid" || method === "back_off_sets" || method === "bbb") return workingSets * 15;
  if (method === "amrap") return 30;
  return 0;
}
