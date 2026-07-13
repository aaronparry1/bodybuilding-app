import { findRestrictedCalibrationProgramme } from "@/domain/training/restricted-calibration-programme-persistence";
import { classifyRestrictedCalibrationPlanMetadata } from "@/domain/training/restricted-calibration-programme-persistence";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export type CurrentSessionConstructionSource =
  | Readonly<{ status: "current_programme_specification"; guidance: CurrentSessionConstructionGuidance }>
  | Readonly<{ status: "compatibility_generated_guidance" }>
  | Readonly<{ status: "no_current_microcycle" | "missing_programme_reference" | "dangling_programme_reference" | "missing_session_template" | "invalid_programme_specification" | "unsupported_current_policy" | "invalid_input"; reason: string }>;

export type CurrentSessionConstructionGuidance = Readonly<{
  planId: string;
  mesocycleId: string;
  microcycleNumber: number;
  programmeId: string;
  programmeVersion: number;
  sessionTemplateId: string;
  sessionIdentity: string;
  sessionRole: string;
  policyVersion: string;
  slots: readonly Readonly<{
    prescriptionSlotId: string;
    targetVersion: number;
    ordinal: string;
    targetDomain: "muscle" | "movement_pattern" | "exercise_slot";
    targetId: string;
    purpose: string;
    recommendedMinSets: number;
    recommendedMaxSets: number;
    selectionConstraints: readonly string[];
    sourceTrace: Readonly<{ programmeId: string; programmeVersion: number; sessionTemplateId: string; prescriptionSlotId: string; targetVersion: number }>;
  }>[];
}>;

export function resolveCurrentSessionConstructionSource(input: Readonly<{ activePlan: ActiveTrainingPlan | null | undefined; sessionIdentity: string; sessionRole: string }>): CurrentSessionConstructionSource {
  if (!input.activePlan) return { status: "invalid_input", reason: "active_plan_missing" };
  const classification = classifyRestrictedCalibrationPlanMetadata(input.activePlan);
  if (classification.status === "compatibility") return { status: "compatibility_generated_guidance" };
  if (classification.status !== "restricted_d3_current") return { status: classification.status === "unsupported_schema" ? "unsupported_current_policy" : "invalid_programme_specification", reason: classification.reason };
  const metadata = classification.metadata;
  const reference = metadata.microcycleProgrammeReferences.find((candidate) => candidate.planId === input.activePlan!.id && candidate.mesocycleId === input.activePlan!.currentMesocycleId);
  if (!input.activePlan.currentMicrocycle) return { status: "no_current_microcycle", reason: "current_microcycle_missing" };
  if (!reference) return { status: "missing_programme_reference", reason: "exact_microcycle_reference_missing" };
  const programme = findRestrictedCalibrationProgramme(metadata, reference.programmeId, reference.programmeVersion);
  if (programme.status !== "found") return { status: "dangling_programme_reference", reason: programme.status };
  const template = programme.value.sessionTemplates.find((candidate) => candidate.orderingKey.endsWith(`-${input.sessionIdentity}`) && candidate.sessionRole === input.sessionRole);
  if (!template) return { status: "missing_session_template", reason: "exact_session_template_missing" };
  const slots = template.prescriptionSlots.map((slot) => ({
    prescriptionSlotId: slot.id,
    targetVersion: slot.targetVersion,
    ordinal: slot.ordinal,
    targetDomain: slot.targetDomain,
    targetId: slot.targetId,
    purpose: slot.purpose,
    recommendedMinSets: slot.recommendedMinSets,
    recommendedMaxSets: slot.recommendedMaxSets,
    selectionConstraints: [...slot.selectionConstraints],
    sourceTrace: { programmeId: programme.value.programmeId, programmeVersion: programme.value.version, sessionTemplateId: template.id, prescriptionSlotId: slot.id, targetVersion: slot.targetVersion },
  }));
  return { status: "current_programme_specification", guidance: { planId: input.activePlan.id, mesocycleId: programme.value.mesocycleId, microcycleNumber: reference.microcycleNumber, programmeId: programme.value.programmeId, programmeVersion: programme.value.version, sessionTemplateId: template.id, sessionIdentity: input.sessionIdentity, sessionRole: template.sessionRole, policyVersion: metadata.policyId, slots } };
}
