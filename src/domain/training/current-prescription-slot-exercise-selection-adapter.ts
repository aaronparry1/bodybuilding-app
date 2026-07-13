import type { CurrentProgrammePrescriptionSlot, CurrentProgrammeSessionTemplate } from "@/domain/training/current-programme-specification";

export const CURRENT_EXERCISE_SELECTION_ADAPTER_VERSION = "current_d3_calibration_slot_adapter_v1" as const;
type MovementTranslation = "horizontal_push" | "horizontal_pull" | "vertical_push" | "vertical_pull" | "squat" | "hinge" | "knee_flexion" | "plantar_flexion" | "shoulder_abduction";
type PurposeTranslation = "primary_compound" | "secondary_compound" | "isolation" | "supporting_accessory";
type SourceTrace = Readonly<{ programmeId: string; programmeVersion: number; sessionTemplateId: string; prescriptionSlotId: string; targetVersion: number; policyVersion: string; adapterVersion: typeof CURRENT_EXERCISE_SELECTION_ADAPTER_VERSION }>;

export type CurrentPrescriptionSlotExerciseSelectionAdapterInput = Readonly<{ planId: string; mesocycleId: string; microcycleNumber: number; programmeId: string; programmeVersion: number; sessionTemplate: CurrentProgrammeSessionTemplate; sessionIdentity: "upper-a" | "lower-a" | "upper-b" | "lower-b"; policyVersion: string }>;
export type CurrentExerciseSelectionJob = Readonly<{ sourcePrescriptionSlotId: string; ordinal: string; targetDomain: CurrentProgrammePrescriptionSlot["targetDomain"]; targetId: string; movementPattern: MovementTranslation; muscleTarget?: string; purpose: PurposeTranslation; recommendedMinSets: number; recommendedMaxSets: number; required: boolean; omissionPolicy: string; substitutionPolicy: string; selectionConstraints: readonly string[]; sourceTrace: SourceTrace }>;
export type CurrentPrescriptionSlotExerciseSelectionAdapterResult = Readonly<{ status: "adapted"; jobs: readonly CurrentExerciseSelectionJob[]; omittedSlotOrdinals: readonly string[]; slotCount: Readonly<{ source: number; adapted: number; legacyDifference: "intentional_calibration_policy_difference" }>; translationTrace: readonly string[] }> | Readonly<{ status: "unsupported_target_domain" | "unsupported_movement_pattern" | "unsupported_slot_purpose" | "unsupported_requirement_semantics" | "unrepresentable_slot_count" | "ambiguous_legacy_mapping" | "missing_required_translation" | "invalid_source_trace" | "invalid_input" | "unsupported_adapter_version"; reason: string }>;

const movementMap: Record<string, MovementTranslation> = { horizontal_press: "horizontal_push", horizontal_pull: "horizontal_pull", vertical_press: "vertical_push", vertical_pull: "vertical_pull", knee_dominant: "squat", hip_hinge: "hinge", knee_flexion: "knee_flexion", plantar_flexion: "plantar_flexion", shoulder_abduction: "shoulder_abduction" };
const purposeMap: Record<string, PurposeTranslation> = { primary_compound: "primary_compound", secondary_compound: "secondary_compound", primary_hypertrophy: "secondary_compound", secondary_hypertrophy: "secondary_compound", isolation: "isolation", supporting_accessory: "supporting_accessory" };
const muscleMap: Record<string, string> = { lateral_deltoids: "shoulders", calves: "calves", hamstrings: "hamstrings", quadriceps: "quads", chest: "chest", upper_back: "back", lats: "back" };

export function adaptCurrentPrescriptionSlotsForExerciseSelection(input: CurrentPrescriptionSlotExerciseSelectionAdapterInput): CurrentPrescriptionSlotExerciseSelectionAdapterResult {
  if (!input.planId || !input.mesocycleId || !input.programmeId || !Number.isInteger(input.programmeVersion) || input.programmeVersion < 1 || !Number.isInteger(input.microcycleNumber) || input.microcycleNumber < 1) return { status: "invalid_input", reason: "adapter_identity_invalid" };
  if (input.sessionTemplate.programmeId !== input.programmeId || input.sessionTemplate.programmeVersion !== input.programmeVersion) return { status: "invalid_source_trace", reason: "template_parent_mismatch" };
  const jobs: CurrentExerciseSelectionJob[] = [];
  for (const slot of input.sessionTemplate.prescriptionSlots) {
    const movement = movementMap[slot.targetId];
    if (!movement) return { status: "unsupported_movement_pattern", reason: `target_not_mappable:${slot.targetId}` };
    const purpose = purposeMap[slot.purpose];
    if (!purpose) return { status: "unsupported_slot_purpose", reason: `purpose_not_mappable:${slot.purpose}` };
    if (slot.targetDomain !== "movement_pattern" && slot.targetDomain !== "muscle" && slot.targetDomain !== "exercise_slot") return { status: "unsupported_target_domain", reason: "target_domain_not_mappable" };
    const muscleTarget = muscleMap[slot.targetId];
    jobs.push({ sourcePrescriptionSlotId: slot.id, ordinal: slot.ordinal, targetDomain: slot.targetDomain, targetId: slot.targetId, movementPattern: movement, muscleTarget, purpose, recommendedMinSets: slot.recommendedMinSets, recommendedMaxSets: slot.recommendedMaxSets, required: true, omissionPolicy: "never_omit", substitutionPolicy: slot.selectionConstraints.find((value) => value.startsWith("preserve_")) ?? "preserve_target_and_movement", selectionConstraints: [...slot.selectionConstraints], sourceTrace: { programmeId: input.programmeId, programmeVersion: input.programmeVersion, sessionTemplateId: input.sessionTemplate.id, prescriptionSlotId: slot.id, targetVersion: slot.targetVersion, policyVersion: input.policyVersion, adapterVersion: CURRENT_EXERCISE_SELECTION_ADAPTER_VERSION } });
  }
  const omittedBySession: Record<string, readonly string[]> = { "upper-a": ["06-elbow-flexion", "07-elbow-extension"], "upper-b": ["06-elbow-flexion", "07-elbow-extension"], "lower-a": ["03-secondary-knee-dominant", "06-trunk"], "lower-b": ["03-secondary-knee-dominant", "06-trunk"] };
  return { status: "adapted", jobs, omittedSlotOrdinals: omittedBySession[input.sessionIdentity] ?? [], slotCount: { source: input.sessionTemplate.prescriptionSlots.length, adapted: jobs.length, legacyDifference: "intentional_calibration_policy_difference" }, translationTrace: jobs.map((job) => `${job.ordinal}:d3_${job.targetId}->${job.movementPattern}:${job.purpose}`) };
}
