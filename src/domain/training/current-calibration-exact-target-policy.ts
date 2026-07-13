export const CURRENT_CALIBRATION_EXACT_TARGET_POLICY_ID = "hypertrophy_calibration_exact_target_policy_v1" as const;
export const CURRENT_CALIBRATION_EXACT_TARGET_POLICY_VERSION = "v1" as const;
export const CURRENT_CALIBRATION_EXACT_TARGET_CERTIFICATION_ID = "hypertrophy_calibration_exact_target_certification_v1" as const;

export type CalibrationSessionIdentity = "upper-a" | "lower-a" | "upper-b" | "lower-b";
export type CalibrationSlotPurpose = "primary_compound" | "secondary_compound" | "isolation" | "supporting_accessory";
export type CalibrationExerciseClass = "primary_compound" | "secondary_compound" | "isolation";
export type CalibrationLane = "primary_compound_calibration" | "secondary_compound_calibration" | "isolation_calibration";
export type CalibrationHistoryState = "no_usable_history" | "sparse_history" | "established_history";

export type CurrentExactTargetPolicyResolutionInput = Readonly<{
  schemaVersion: "v1";
  policyRegistryVersion: "v1";
  goal: "build_muscle";
  experience: "intermediate";
  mesocyclePurpose: "hypertrophy_calibration";
  microcyclePriority: "normal_calibration";
  sessionIdentity: CalibrationSessionIdentity;
  sessionRole: "Upper" | "Lower";
  slotPurpose: CalibrationSlotPurpose;
  targetId: string;
  movementPattern: string;
  selectedExerciseClass: CalibrationExerciseClass;
  loadingCapability: "incremental" | "bodyweight" | "duration";
  historyState: CalibrationHistoryState;
  recommendedMinSets: number;
  recommendedMaxSets: number;
}>;

export type CurrentExactTargetPolicy = Readonly<{
  policyId: typeof CURRENT_CALIBRATION_EXACT_TARGET_POLICY_ID;
  policyVersion: typeof CURRENT_CALIBRATION_EXACT_TARGET_POLICY_VERSION;
  certificationId: typeof CURRENT_CALIBRATION_EXACT_TARGET_CERTIFICATION_ID;
  supportedFamily: "intermediate_four_day_full_gym_upper_lower";
  repStrategy: Readonly<{ id: string; domain: Readonly<{ min: number; max: number }>; exactRule: "deterministic_internal_target"; routineAmrap: false; intentionalFailure: false }>;
  lane: Readonly<{ id: CalibrationLane; supportedPurposes: readonly CalibrationSlotPurpose[]; selectedExerciseClass: CalibrationExerciseClass }>;
  setConstruction: Readonly<{ id: string; guidancePrecedence: "slot_envelope_first"; initialCount: "minimum" | "within_envelope_by_history"; maximumRespected: true; dropOffMayTerminate: true }>;
  startingLoad: Readonly<{ id: string; evidenceOrder: readonly ["established_history", "sparse_history", "exercise_specific_calibration", "explicit_review"]; roundsToAvailableIncrement: true }>;
  dropOff: Readonly<{ id: string; thresholdPercent: 15; reference: "best_valid_working_set"; minimumValidWorkingSets: 2; excludesWarmups: true }>;
  shutdown: Readonly<{ id: string; scope: "exercise"; retainTriggeringValidSet: true; cancelRemainingSets: true; addReplacementSets: false; laterJobsContinue: true }>;
  effort: Readonly<{ id: string; intentionalFailure: false; amrap: false; userRir: false; userRpe: false; failuresAreEvidence: true }>;
  suitability: Readonly<{ id: string; outcomes: readonly ["suitable", "unsupported_slot_lane", "unsupported_exercise_class", "unsupported_loading_method", "invalid_guidance", "unsupported_microcycle_priority", "insufficient_policy", "invalid_combination"] }>;
  fingerprint: string;
}>;

export type CurrentExactTargetPolicyResolutionResult = Readonly<{ status: "resolved"; policy: CurrentExactTargetPolicy; fingerprint: string }> | Readonly<{ status: "insufficient_policy" | "unsupported_purpose" | "unsupported_microcycle_priority" | "unsupported_session" | "unsupported_slot_purpose" | "unsupported_target" | "unsupported_exercise_class" | "unsupported_loading_capability" | "invalid_guidance" | "invalid_input" | "unsupported_policy_version"; reason: string; fingerprint: string }>;

const laneFor: Record<CalibrationExerciseClass, CalibrationLane> = { primary_compound: "primary_compound_calibration", secondary_compound: "secondary_compound_calibration", isolation: "isolation_calibration" };

export function resolveCurrentCalibrationExactTargetPolicy(input: CurrentExactTargetPolicyResolutionInput): CurrentExactTargetPolicyResolutionResult {
  const fingerprint = policyInputFingerprint(input);
  const fail = (status: Exclude<CurrentExactTargetPolicyResolutionResult["status"], "resolved">, reason: string): CurrentExactTargetPolicyResolutionResult => ({ status, reason, fingerprint });
  if (input.schemaVersion !== "v1" || input.policyRegistryVersion !== "v1") return fail("unsupported_policy_version", "policy_version_not_supported");
  if (input.goal !== "build_muscle" || input.experience !== "intermediate" || input.mesocyclePurpose !== "hypertrophy_calibration") return fail("unsupported_purpose", "calibration_scope_mismatch");
  if (input.microcyclePriority !== "normal_calibration") return fail("unsupported_microcycle_priority", "calibration_priority_required");
  if ((input.sessionIdentity.startsWith("upper") ? input.sessionRole !== "Upper" : input.sessionRole !== "Lower")) return fail("unsupported_session", "session_role_mismatch");
  if (!input.targetId || !input.movementPattern) return fail("unsupported_target", "target_missing");
  if (!Object.keys(laneFor).includes(input.selectedExerciseClass)) return fail("unsupported_exercise_class", "exercise_class_not_supported");
  if (input.loadingCapability !== "incremental" && input.loadingCapability !== "bodyweight" && input.loadingCapability !== "duration") return fail("unsupported_loading_capability", "loading_capability_not_supported");
  if (!Number.isInteger(input.recommendedMinSets) || !Number.isInteger(input.recommendedMaxSets) || input.recommendedMinSets < 1 || input.recommendedMaxSets < input.recommendedMinSets) return fail("invalid_guidance", "guidance_envelope_invalid");
  const lane = laneFor[input.selectedExerciseClass];
  const domain = input.selectedExerciseClass === "primary_compound" ? { min: 6, max: 10 } : input.selectedExerciseClass === "secondary_compound" ? { min: 8, max: 12 } : { min: 10, max: 15 };
  const policy: CurrentExactTargetPolicy = {
    policyId: CURRENT_CALIBRATION_EXACT_TARGET_POLICY_ID, policyVersion: CURRENT_CALIBRATION_EXACT_TARGET_POLICY_VERSION, certificationId: CURRENT_CALIBRATION_EXACT_TARGET_CERTIFICATION_ID, supportedFamily: "intermediate_four_day_full_gym_upper_lower",
    repStrategy: { id: `calibration_rep_${input.selectedExerciseClass}_v1`, domain, exactRule: "deterministic_internal_target", routineAmrap: false, intentionalFailure: false },
    lane: { id: lane, supportedPurposes: input.selectedExerciseClass === "primary_compound" ? ["primary_compound"] : input.selectedExerciseClass === "secondary_compound" ? ["secondary_compound", "supporting_accessory"] : ["isolation"], selectedExerciseClass: input.selectedExerciseClass },
    setConstruction: { id: "calibration_slot_envelope_v1", guidancePrecedence: "slot_envelope_first", initialCount: input.historyState === "established_history" ? "within_envelope_by_history" : "minimum", maximumRespected: true, dropOffMayTerminate: true },
    startingLoad: { id: "calibration_exercise_history_first_v1", evidenceOrder: ["established_history", "sparse_history", "exercise_specific_calibration", "explicit_review"], roundsToAvailableIncrement: true },
    dropOff: { id: "calibration_dropoff_15_percent_v1", thresholdPercent: 15, reference: "best_valid_working_set", minimumValidWorkingSets: 2, excludesWarmups: true },
    shutdown: { id: "calibration_exercise_shutdown_v1", scope: "exercise", retainTriggeringValidSet: true, cancelRemainingSets: true, addReplacementSets: false, laterJobsContinue: true },
    effort: { id: "calibration_controlled_effort_v1", intentionalFailure: false, amrap: false, userRir: false, userRpe: false, failuresAreEvidence: true },
    suitability: { id: "calibration_semantic_suitability_v1", outcomes: ["suitable", "unsupported_slot_lane", "unsupported_exercise_class", "unsupported_loading_method", "invalid_guidance", "unsupported_microcycle_priority", "insufficient_policy", "invalid_combination"] },
    fingerprint: `${fingerprint}|${lane}|${domain.min}-${domain.max}`,
  };
  if (!policy.lane.supportedPurposes.includes(input.slotPurpose)) return fail("unsupported_slot_purpose", "slot_lane_mismatch");
  return { status: "resolved", policy, fingerprint };
}

export function policyInputFingerprint(input: CurrentExactTargetPolicyResolutionInput): string {
  return [input.schemaVersion, input.policyRegistryVersion, input.goal, input.experience, input.mesocyclePurpose, input.microcyclePriority, input.sessionIdentity, input.sessionRole, input.slotPurpose, input.targetId, input.movementPattern, input.selectedExerciseClass, input.loadingCapability, input.historyState, input.recommendedMinSets, input.recommendedMaxSets].join("|");
}

export function copyCurrentExactTargetPolicy(policy: CurrentExactTargetPolicy): CurrentExactTargetPolicy { return JSON.parse(JSON.stringify(policy)) as CurrentExactTargetPolicy; }

export function certifyCurrentCalibrationExactTargetPolicy(inputs: readonly CurrentExactTargetPolicyResolutionInput[]): { status: "certified"; certificationId: typeof CURRENT_CALIBRATION_EXACT_TARGET_CERTIFICATION_ID; resolvedCount: number; fingerprint: string } | { status: "incomplete_slot_coverage" | "invalid_input"; reason: string } {
  if (inputs.length === 0) return { status: "invalid_input", reason: "no_policy_inputs" };
  const results = inputs.map(resolveCurrentCalibrationExactTargetPolicy);
  if (results.some((result) => result.status !== "resolved")) return { status: "incomplete_slot_coverage", reason: "unresolved_calibration_slot_policy" };
  return { status: "certified", certificationId: CURRENT_CALIBRATION_EXACT_TARGET_CERTIFICATION_ID, resolvedCount: results.length, fingerprint: results.map((result) => result.status === "resolved" ? result.policy.fingerprint : "").join("|") };
}
