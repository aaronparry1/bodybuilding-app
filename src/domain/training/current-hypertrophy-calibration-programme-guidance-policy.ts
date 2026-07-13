import {
  copyCurrentPrescriptionSlotDefinitions,
  fingerprintCurrentProgrammeGuidancePolicy,
  validateCurrentPrescriptionSlotDefinition,
  type CurrentProgrammeGuidancePolicyInput,
  type CurrentProgrammeGuidancePolicyResult,
  type CurrentPrescriptionSlotDefinition,
} from "@/domain/training/current-programme-guidance-policy-contracts";

export const CALIBRATION_POLICY_ID =
  "intermediate_upper_lower_hypertrophy_calibration_v1" as const;
export const CALIBRATION_GUIDANCE_POLICY_VERSION =
  "hypertrophy_calibration_guidance_v1" as const;
export const CALIBRATION_CONSTRUCTION_POLICY_VERSION =
  "hypertrophy_calibration_construction_v1" as const;

type CalibrationPurpose = "primary_compound" | "secondary_compound" | "isolation";

function stableCalibrationSlot(
  ordinal: string,
  targetId: string,
  purpose: CalibrationPurpose,
  recommendedMinSets: number,
  recommendedMaxSets: number,
  muscle: string,
): CurrentPrescriptionSlotDefinition {
  const definition: CurrentPrescriptionSlotDefinition = {
    schemaVersion: "v1",
    target: { domain: "movement_pattern", id: targetId },
    purpose,
    ordinal,
    recommendedMinSets,
    recommendedMaxSets,
    constraints: {
      allowedMuscles: [muscle],
      allowedMovementPatterns: [targetId],
      exerciseClass: purpose === "isolation" ? "isolation" : "compound",
      equipmentCapabilities: ["full_gym"],
      // Selection and interventions consume this later: calibration itself selects nothing.
      substitutionPolicy: "preserve_target_and_movement",
      prohibitedExerciseIds: [],
    },
    requirement: "required",
    omissionPolicy: "never_omit",
    guidancePolicyVersion: CALIBRATION_GUIDANCE_POLICY_VERSION,
    constructionPolicyVersion: CALIBRATION_CONSTRUCTION_POLICY_VERSION,
    rationaleCode: "calibration_stable_repeatable_exposure",
  };

  const validationError = validateCurrentPrescriptionSlotDefinition(definition);
  if (validationError) throw new Error(validationError);
  return definition;
}

function unsupported(
  status: Exclude<CurrentProgrammeGuidancePolicyResult["status"], "resolved">,
  reason: string,
): Exclude<CurrentProgrammeGuidancePolicyResult, { status: "resolved" }> {
  return { status, reason };
}

function validateCalibrationInput(
  input: CurrentProgrammeGuidancePolicyInput,
): Exclude<CurrentProgrammeGuidancePolicyResult, { status: "resolved" }> | null {
  if (input.goal !== "build_muscle") {
    return unsupported("unsupported_goal", "calibration_policy_requires_build_muscle");
  }
  if (input.mesocyclePurpose !== "hypertrophy_calibration") {
    return unsupported("unsupported_mesocycle_purpose", "calibration_purpose_required");
  }
  if (input.experienceLevel !== "intermediate") {
    return unsupported("unsupported_experience_level", "calibration_intermediate_only");
  }
  if (input.trainingDays !== 4 || input.split !== "upper_lower") {
    return unsupported("unsupported_split", "calibration_family_not_supported");
  }
  if (input.microcyclePriority !== "normal_productive") {
    return unsupported("insufficient_policy", "calibration_priority_not_supported");
  }
  if (!input.equipmentCapabilities.includes("full_gym")) {
    return unsupported("equipment_incompatible", "calibration_requires_full_gym");
  }
  return null;
}

function calibrationSlots(sessionIdentity: string): readonly CurrentPrescriptionSlotDefinition[] | null {
  switch (sessionIdentity) {
    case "upper-a":
      return [
        stableCalibrationSlot("01-primary-horizontal-press", "horizontal_press", "primary_compound", 2, 3, "chest"),
        stableCalibrationSlot("02-primary-horizontal-pull", "horizontal_pull", "primary_compound", 2, 3, "upper_back"),
        stableCalibrationSlot("03-vertical-press", "vertical_press", "secondary_compound", 1, 2, "shoulders"),
        stableCalibrationSlot("04-vertical-pull", "vertical_pull", "secondary_compound", 1, 2, "lats"),
        stableCalibrationSlot("05-lateral-deltoid", "shoulder_abduction", "isolation", 1, 2, "lateral_deltoids"),
      ];
    case "upper-b":
      return [
        stableCalibrationSlot("01-primary-vertical-pull", "vertical_pull", "primary_compound", 2, 3, "lats"),
        stableCalibrationSlot("02-primary-vertical-press", "vertical_press", "primary_compound", 2, 3, "shoulders"),
        stableCalibrationSlot("03-horizontal-pull", "horizontal_pull", "secondary_compound", 1, 2, "upper_back"),
        stableCalibrationSlot("04-horizontal-press", "horizontal_press", "secondary_compound", 1, 2, "chest"),
        stableCalibrationSlot("05-lateral-deltoid", "shoulder_abduction", "isolation", 1, 2, "lateral_deltoids"),
      ];
    case "lower-a":
      return [
        stableCalibrationSlot("01-primary-knee-dominant", "knee_dominant", "primary_compound", 2, 3, "quadriceps"),
        stableCalibrationSlot("02-primary-hip-hinge", "hip_hinge", "primary_compound", 2, 3, "hamstrings"),
        stableCalibrationSlot("03-knee-flexion", "knee_flexion", "isolation", 1, 2, "hamstrings"),
        stableCalibrationSlot("04-calf", "plantar_flexion", "isolation", 1, 2, "calves"),
      ];
    case "lower-b":
      return [
        stableCalibrationSlot("01-primary-hip-hinge", "hip_hinge", "primary_compound", 2, 3, "hamstrings"),
        // D2.5D3A: two exposures provide useful quadriceps calibration evidence
        // without adding a posterior-chain job, restoring the locked 6–10 total.
        stableCalibrationSlot("02-knee-dominant", "knee_dominant", "secondary_compound", 2, 3, "quadriceps"),
        stableCalibrationSlot("03-knee-flexion", "knee_flexion", "isolation", 1, 2, "hamstrings"),
        stableCalibrationSlot("04-calf", "plantar_flexion", "isolation", 1, 2, "calves"),
      ];
    default:
      return null;
  }
}

export function resolveCurrentHypertrophyCalibrationProgrammeGuidance(
  input: CurrentProgrammeGuidancePolicyInput,
): CurrentProgrammeGuidancePolicyResult {
  const inputFailure = validateCalibrationInput(input);
  if (inputFailure) return inputFailure;

  const expectedRole = input.sessionIdentity.startsWith("upper-") ? "Upper" : "Lower";
  if (input.sessionRole !== expectedRole) {
    return unsupported("unsupported_session_role", "calibration_session_identity_role_conflict");
  }

  const definitions = calibrationSlots(input.sessionIdentity);
  if (!definitions) {
    return unsupported("unsupported_session_role", "calibration_session_not_supported");
  }

  return {
    status: "resolved",
    definitions: copyCurrentPrescriptionSlotDefinitions(definitions),
    policyFingerprint: `${CALIBRATION_POLICY_ID}|${fingerprintCurrentProgrammeGuidancePolicy(input)}`,
  };
}
