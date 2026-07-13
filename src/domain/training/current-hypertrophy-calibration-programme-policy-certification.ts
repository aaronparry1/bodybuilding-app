import type { CurrentPrescriptionSlotDefinition } from "@/domain/training/current-programme-guidance-policy-contracts";
import {
  CALIBRATION_POLICY_ID,
  CALIBRATION_GUIDANCE_POLICY_VERSION,
} from "@/domain/training/current-hypertrophy-calibration-programme-guidance-policy";

export const HYPERTROPHY_CALIBRATION_PROGRAMME_CERTIFICATION =
  "hypertrophy_calibration_upper_lower_certification_v1" as const;

export type CurrentHypertrophyCalibrationProgrammeCertificationInput = Readonly<{
  certificationVersion: "v1";
  policyId: typeof CALIBRATION_POLICY_ID;
  policyVersion: "v1";
  purpose: "hypertrophy_calibration";
  programmeFamilyId: "intermediate_four_day_full_gym_upper_lower";
  templateFamilyId: "upper_lower_ab_v1";
  templateOrder: readonly string[];
  definitionsBySession: readonly Readonly<{
    sessionIdentity: string;
    definitions: readonly CurrentPrescriptionSlotDefinition[];
  }>[];
  evidenceCompatibility: "planned_roles_and_exact_targets";
  constructionVerified: boolean;
}>;

export type CurrentHypertrophyCalibrationProgrammeCertificationResult =
  | Readonly<{
      status: "certified_calibration_policy";
      certificationId: typeof HYPERTROPHY_CALIBRATION_PROGRAMME_CERTIFICATION;
      certificationVersion: "v1";
      trace: readonly string[];
      fingerprint: string;
    }>
  | Readonly<{
      status:
        | "invalid_input"
        | "unsupported_family"
        | "missing_session_role"
        | "incomplete_movement_coverage"
        | "excessive_calibration_guidance"
        | "not_conservative_relative_to_base"
        | "invalid_optionality"
        | "unstable_exercise_selection_policy"
        | "invalid_ab_differentiation"
        | "insufficient_calibration_evidence"
        | "invalid_programme";
      reason: string;
      trace: readonly string[];
      fingerprint: string;
    }>;

const expectedOrder = ["upper-a", "lower-a", "upper-b", "lower-b"];
const expectedSessionTotals = [[7, 12], [6, 10], [7, 12], [6, 10]] as const;
const requiredTargets = [
  "horizontal_press",
  "horizontal_pull",
  "vertical_press",
  "vertical_pull",
  "knee_dominant",
  "hip_hinge",
  "knee_flexion",
  "plantar_flexion",
];
const prohibitedTargets = [
  "elbow_flexion",
  "elbow_extension",
  "trunk_stability",
  "unilateral_knee_dominant",
  "knee_extension",
];

function total(definitions: readonly CurrentPrescriptionSlotDefinition[]) {
  return definitions.reduce(
    (accumulator, definition) => ({
      minimum: accumulator.minimum + definition.recommendedMinSets,
      maximum: accumulator.maximum + definition.recommendedMaxSets,
    }),
    { minimum: 0, maximum: 0 },
  );
}

export function certifyCurrentHypertrophyCalibrationProgrammePolicy(
  input: CurrentHypertrophyCalibrationProgrammeCertificationInput,
): CurrentHypertrophyCalibrationProgrammeCertificationResult {
  const sessionFingerprints = input.definitionsBySession.map(({ sessionIdentity, definitions }) =>
    `${sessionIdentity}:${definitions.map((definition) => `${definition.ordinal}/${definition.target.id}/${definition.purpose}/${definition.recommendedMinSets}-${definition.recommendedMaxSets}/${definition.constraints.substitutionPolicy}`).join(",")}`,
  );
  const fingerprint = [
    input.certificationVersion,
    input.policyId,
    input.policyVersion,
    input.purpose,
    input.programmeFamilyId,
    input.templateFamilyId,
    input.templateOrder.join(","),
    sessionFingerprints.join("|"),
    input.evidenceCompatibility,
    input.constructionVerified,
  ].join("|");
  const fail = (
    status: Exclude<CurrentHypertrophyCalibrationProgrammeCertificationResult["status"], "certified_calibration_policy">,
    reason: string,
  ): CurrentHypertrophyCalibrationProgrammeCertificationResult => ({ status, reason, trace: [], fingerprint });

  if (input.certificationVersion !== "v1" || input.policyId !== CALIBRATION_POLICY_ID || input.policyVersion !== "v1") {
    return fail("invalid_input", "calibration_policy_identity_conflict");
  }
  if (input.purpose !== "hypertrophy_calibration") return fail("invalid_input", "calibration_purpose_required");
  if (input.programmeFamilyId !== "intermediate_four_day_full_gym_upper_lower" || input.templateFamilyId !== "upper_lower_ab_v1") {
    return fail("unsupported_family", "calibration_family_not_supported");
  }
  if (JSON.stringify(input.templateOrder) !== JSON.stringify(expectedOrder) || input.definitionsBySession.length !== 4) {
    return fail("missing_session_role", "calibration_session_roles_incomplete");
  }
  if (input.definitionsBySession.some((session, index) => session.sessionIdentity !== expectedOrder[index])) {
    return fail("missing_session_role", "calibration_session_order_invalid");
  }

  const allDefinitions = input.definitionsBySession.flatMap((session) => session.definitions);
  const targets = new Set(allDefinitions.map((definition) => definition.target.id));
  if (!requiredTargets.every((target) => targets.has(target))) {
    return fail("incomplete_movement_coverage", "calibration_required_movement_missing");
  }
  if (prohibitedTargets.some((target) => targets.has(target))) {
    return fail("invalid_optionality", "calibration_omitted_accessory_reintroduced");
  }
  if (allDefinitions.some((definition) => definition.requirement !== "required" || definition.omissionPolicy !== "never_omit")) {
    return fail("invalid_optionality", "calibration_optionality_not_deterministic");
  }
  if (allDefinitions.some((definition) => definition.guidancePolicyVersion !== CALIBRATION_GUIDANCE_POLICY_VERSION)) {
    return fail("invalid_input", "calibration_guidance_policy_version_mismatch");
  }
  if (allDefinitions.some((definition) => definition.constraints.substitutionPolicy !== "preserve_target_and_movement")) {
    return fail("unstable_exercise_selection_policy", "calibration_substitution_must_preserve_target_and_movement");
  }
  if (allDefinitions.some((definition) => "id" in definition || "selectedExerciseId" in definition)) {
    return fail("invalid_programme", "calibration_policy_must_not_emit_exercise_or_slot_identity");
  }

  const sessionTotals = input.definitionsBySession.map((session) => total(session.definitions));
  if (sessionTotals.some((value, index) => value.minimum !== expectedSessionTotals[index]![0] || value.maximum !== expectedSessionTotals[index]![1])) {
    return fail("excessive_calibration_guidance", "calibration_session_guidance_outside_locked_range");
  }
  const programmeTotal = sessionTotals.reduce(
    (accumulator, value) => ({ minimum: accumulator.minimum + value.minimum, maximum: accumulator.maximum + value.maximum }),
    { minimum: 0, maximum: 0 },
  );
  if (programmeTotal.minimum !== 26 || programmeTotal.maximum !== 44) {
    return fail("excessive_calibration_guidance", "calibration_programme_guidance_outside_locked_range");
  }
  if (programmeTotal.maximum >= 58) {
    return fail("not_conservative_relative_to_base", "calibration_must_remain_below_base_minimum");
  }

  const upperA = input.definitionsBySession[0]!.definitions[0]?.target.id;
  const upperB = input.definitionsBySession[2]!.definitions[0]?.target.id;
  const lowerA = input.definitionsBySession[1]!.definitions[0]?.target.id;
  const lowerB = input.definitionsBySession[3]!.definitions[0]?.target.id;
  if (upperA !== "horizontal_press" || upperB !== "vertical_pull" || lowerA !== "knee_dominant" || lowerB !== "hip_hinge") {
    return fail("invalid_ab_differentiation", "calibration_ab_priorities_not_distinct");
  }
  if (input.definitionsBySession[3]!.definitions.filter((definition) => definition.target.id === "hip_hinge").length !== 1) {
    return fail("invalid_ab_differentiation", "lower_b_must_not_stack_heavy_hinges");
  }
  if (input.evidenceCompatibility !== "planned_roles_and_exact_targets") {
    return fail("insufficient_calibration_evidence", "calibration_evidence_contract_not_supported");
  }
  if (!input.constructionVerified) return fail("invalid_programme", "d1_d2_construction_not_verified");

  return {
    status: "certified_calibration_policy",
    certificationId: HYPERTROPHY_CALIBRATION_PROGRAMME_CERTIFICATION,
    certificationVersion: "v1",
    trace: [
      "session_roles_complete",
      "movement_coverage_complete",
      "calibration_guidance_conservative",
      "omitted_accessories_absent",
      "stable_substitution_policy",
      "ab_priority_differentiated",
      "evidence_compatible_structure",
      "d1_d2_construction_verified",
    ],
    fingerprint,
  };
}
