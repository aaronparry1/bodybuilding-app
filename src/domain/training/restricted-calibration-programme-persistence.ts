import { constructCurrentProgrammeSpecification, type CurrentProgrammeConstructionResult } from "@/domain/training/current-programme-specification-construction";
import { mapPolicySlotToD2Input, type CurrentProgrammeGuidancePolicyInput } from "@/domain/training/current-programme-guidance-policy-contracts";
import { resolveCurrentHypertrophyCalibrationProgrammeGuidance, CALIBRATION_POLICY_ID, CALIBRATION_CONSTRUCTION_POLICY_VERSION, CALIBRATION_GUIDANCE_POLICY_VERSION } from "@/domain/training/current-hypertrophy-calibration-programme-guidance-policy";
import { resolveCurrentMesocycleProgrammePolicyMapping, CERTIFIED_UPPER_LOWER_PROGRAMME_FAMILY, CERTIFIED_UPPER_LOWER_TEMPLATE_FAMILY, CURRENT_MESOCYCLE_PROGRAMME_POLICY_REGISTRY } from "@/domain/training/current-mesocycle-programme-policy-mapping";
import { findProgrammePrescriptionSlot, findProgrammeSessionTemplate, hydrateCurrentMesocycleProgrammeSpecification, validateMicrocycleProgrammeReference, type CurrentMesocycleProgrammeSpecification, type CurrentMicrocycleProgrammeReference, type CurrentProgrammeLookup } from "@/domain/training/current-programme-specification";
import type { TrainingSetupInput } from "@/domain/training/plan-setup";

export const RESTRICTED_CALIBRATION_CERTIFICATION_ID = "hypertrophy_calibration_upper_lower_certification_v1" as const;
export type RestrictedCalibrationMetadata = Readonly<{ schemaVersion: "d3-v1"; supportFamily: typeof CERTIFIED_UPPER_LOWER_PROGRAMME_FAMILY; templateFamily: typeof CERTIFIED_UPPER_LOWER_TEMPLATE_FAMILY; policyId: typeof CALIBRATION_POLICY_ID; policyVersion: "v1"; certificationId: typeof RESTRICTED_CALIBRATION_CERTIFICATION_ID; certificationVersion: "v1"; programmeSpecifications: readonly CurrentMesocycleProgrammeSpecification[]; microcycleProgrammeReferences: readonly CurrentMicrocycleProgrammeReference[] }>;
export type RestrictedCalibrationPersistenceResult = Readonly<{ status: "supported_calibration_programme_persistence"; metadata: RestrictedCalibrationMetadata }> | Readonly<{ status: "continue_compatibility_plan" | "invalid_input" | "unsupported_registry" | "policy_not_certified" | "incomplete_policy_coverage"; reason: string }>;
export type RestrictedCalibrationPlanMetadataClassification = Readonly<{ status: "restricted_d3_current"; metadata: RestrictedCalibrationMetadata }> | Readonly<{ status: "compatibility" }> | Readonly<{ status: "invalid_current_plan" | "unsupported_schema"; reason: string }>;
export type RestrictedCalibrationIdentityLookup<T> = CurrentProgrammeLookup<T> | Readonly<{ status: "compatibility_unavailable"; reason: string }>;

const sessions = [
  ["Upper", "upper-a"], ["Lower", "lower-a"], ["Upper", "upper-b"], ["Lower", "lower-b"],
] as const;

export function buildRestrictedCalibrationProgrammeMetadata(input: Readonly<{ setup: TrainingSetupInput; planId: string; mesocycleId: string; microcycleNumber: number; createdAt: string }>): RestrictedCalibrationPersistenceResult {
  const setup = input.setup;
  if (setup.goal !== "build_muscle" || setup.experienceLevel !== "intermediate" || setup.daysPerWeek !== 4 || setup.preferredSplit !== "upper_lower" || setup.equipmentPreset !== "full_gym" || input.mesocycleId !== "hypertrophy_calibration") return { status: "continue_compatibility_plan", reason: "restricted_calibration_family_mismatch" };
  const mapping = resolveCurrentMesocycleProgrammePolicyMapping({ schemaVersion: "v1", registryVersion: CURRENT_MESOCYCLE_PROGRAMME_POLICY_REGISTRY, goal: "build_muscle", experienceLevel: "intermediate", trainingDays: 4, split: "upper_lower", mesocyclePurpose: "hypertrophy_calibration", equipmentCapabilities: ["full_gym"], programmeFamilyId: CERTIFIED_UPPER_LOWER_PROGRAMME_FAMILY, sessionTemplateFamilyId: CERTIFIED_UPPER_LOWER_TEMPLATE_FAMILY });
  if (mapping.status !== "supported" || !mapping.capabilities.mayResolveSlots || !mapping.capabilities.mayConstructProgrammeSpecification || mapping.policy.policyId !== CALIBRATION_POLICY_ID || mapping.policy.certificationId !== RESTRICTED_CALIBRATION_CERTIFICATION_ID) return { status: "policy_not_certified", reason: "calibration_mapping_not_certified_for_persistence" };
  const programmeId = `programme-${input.planId}-calibration`;
  const policyBase: Omit<CurrentProgrammeGuidancePolicyInput, "sessionRole" | "sessionIdentity"> = { schemaVersion: "v1", goal: "build_muscle", experienceLevel: "intermediate", trainingDays: 4, split: "upper_lower", mesocyclePurpose: "hypertrophy_calibration", microcyclePriority: "normal_productive", equipmentCapabilities: ["full_gym"], constructionPolicyVersion: CALIBRATION_CONSTRUCTION_POLICY_VERSION, guidancePolicyVersion: CALIBRATION_GUIDANCE_POLICY_VERSION };
  const templates = sessions.map(([sessionRole, sessionIdentity]) => {
    const resolved = resolveCurrentHypertrophyCalibrationProgrammeGuidance({ ...policyBase, sessionRole, sessionIdentity });
    if (resolved.status !== "resolved") return null;
    const templateId = `${programmeId}-template-${sessionIdentity}`;
    return { id: templateId, orderingKey: `${sessions.findIndex((entry) => entry[1] === sessionIdentity) + 1}-${sessionIdentity}`, sessionRole, purpose: "hypertrophy_calibration", constructionPolicyVersion: CALIBRATION_CONSTRUCTION_POLICY_VERSION, prescriptionSlots: resolved.definitions.map((definition) => mapPolicySlotToD2Input(definition, `${templateId}-slot-${definition.ordinal}`)) };
  });
  if (templates.some((template) => template === null)) return { status: "incomplete_policy_coverage", reason: "calibration_session_policy_unresolved" };
  const construction: CurrentProgrammeConstructionResult = constructCurrentProgrammeSpecification({ planId: input.planId, mesocycleId: input.mesocycleId, mesocyclePurpose: input.mesocycleId, programmeId, purposePolicyVersion: CALIBRATION_POLICY_ID, creationSource: "new_current_plan", firstMicrocycleNumber: input.microcycleNumber, sessionTemplates: templates as NonNullable<typeof templates[number]>[] });
  if (construction.status !== "created" || !construction.initialMicrocycleReference) return { status: "incomplete_policy_coverage", reason: construction.status === "created" ? "initial_reference_missing" : construction.reason };
  return { status: "supported_calibration_programme_persistence", metadata: { schemaVersion: "d3-v1", supportFamily: CERTIFIED_UPPER_LOWER_PROGRAMME_FAMILY, templateFamily: CERTIFIED_UPPER_LOWER_TEMPLATE_FAMILY, policyId: CALIBRATION_POLICY_ID, policyVersion: "v1", certificationId: RESTRICTED_CALIBRATION_CERTIFICATION_ID, certificationVersion: "v1", programmeSpecifications: [construction.specification], microcycleProgrammeReferences: [construction.initialMicrocycleReference] } };
}

export function copyRestrictedCalibrationMetadata(metadata: RestrictedCalibrationMetadata): RestrictedCalibrationMetadata { return { ...metadata, programmeSpecifications: metadata.programmeSpecifications.map((specification) => ({ ...specification, sourceAdjustmentIds: [...specification.sourceAdjustmentIds], sessionTemplates: specification.sessionTemplates.map((template) => ({ ...template, prescriptionSlots: template.prescriptionSlots.map((slot) => ({ ...slot, selectionConstraints: [...slot.selectionConstraints] })) })) })), microcycleProgrammeReferences: metadata.microcycleProgrammeReferences.map((reference) => ({ ...reference })) }; }

export function classifyRestrictedCalibrationPlanMetadata(value: unknown): RestrictedCalibrationPlanMetadataClassification {
  if (!value || typeof value !== "object") return { status: "invalid_current_plan", reason: "active_plan_not_object" };
  const plan = value as { programmePolicyMetadata?: RestrictedCalibrationMetadata; programmeSpecifications?: readonly CurrentMesocycleProgrammeSpecification[]; microcycleProgrammeReferences?: readonly CurrentMicrocycleProgrammeReference[] };
  if (!plan.programmePolicyMetadata && !plan.programmeSpecifications && !plan.microcycleProgrammeReferences) return { status: "compatibility" };
  const metadata = plan.programmePolicyMetadata;
  if (!metadata || metadata.schemaVersion !== "d3-v1" || metadata.policyId !== CALIBRATION_POLICY_ID || metadata.certificationId !== RESTRICTED_CALIBRATION_CERTIFICATION_ID || metadata.supportFamily !== CERTIFIED_UPPER_LOWER_PROGRAMME_FAMILY || metadata.templateFamily !== CERTIFIED_UPPER_LOWER_TEMPLATE_FAMILY || metadata.programmeSpecifications?.length !== 1 || metadata.microcycleProgrammeReferences?.length !== 1) return { status: "invalid_current_plan", reason: "restricted_calibration_metadata_incomplete" };
  if (plan.programmeSpecifications !== undefined && plan.programmeSpecifications.length !== metadata.programmeSpecifications.length) return { status: "invalid_current_plan", reason: "programme_container_mismatch" };
  if (plan.microcycleProgrammeReferences !== undefined && plan.microcycleProgrammeReferences.length !== metadata.microcycleProgrammeReferences.length) return { status: "invalid_current_plan", reason: "programme_reference_container_mismatch" };
  const hydrated = hydrateCurrentMesocycleProgrammeSpecification(metadata.programmeSpecifications[0]);
  if (hydrated.status !== "hydrated_current_programme") return { status: hydrated.status === "unsupported_schema" ? "unsupported_schema" : "invalid_current_plan", reason: hydrated.reason };
  const specification = hydrated.specification;
  const reference = metadata.microcycleProgrammeReferences[0]!;
  if (specification.mesocycleId !== "hypertrophy_calibration" || specification.programmeId !== reference.programmeId || specification.version !== reference.programmeVersion || validateMicrocycleProgrammeReference(reference)) return { status: "invalid_current_plan", reason: "restricted_calibration_reference_mismatch" };
  return { status: "restricted_d3_current", metadata: copyRestrictedCalibrationMetadata(metadata) };
}

export function findRestrictedCalibrationProgramme(metadata: RestrictedCalibrationMetadata, programmeId: string, version: number): RestrictedCalibrationIdentityLookup<CurrentMesocycleProgrammeSpecification> { const matches = metadata.programmeSpecifications.filter((specification) => specification.programmeId === programmeId && specification.version === version); return matches.length === 1 ? { status: "found", value: matches[0]! } : matches.length === 0 ? { status: "not_found", reason: "programme_missing" } : { status: "ambiguous", reason: "duplicate_programme_version" }; }
export function findRestrictedCalibrationTemplate(metadata: RestrictedCalibrationMetadata, programmeId: string, version: number, templateId: string): RestrictedCalibrationIdentityLookup<CurrentMesocycleProgrammeSpecification["sessionTemplates"][number]> { const programme = findRestrictedCalibrationProgramme(metadata, programmeId, version); if (programme.status !== "found") return programme; return findProgrammeSessionTemplate(programme.value, templateId); }
export function findRestrictedCalibrationSlot(metadata: RestrictedCalibrationMetadata, programmeId: string, version: number, templateId: string, slotId: string): RestrictedCalibrationIdentityLookup<CurrentMesocycleProgrammeSpecification["sessionTemplates"][number]["prescriptionSlots"][number]> { const programme = findRestrictedCalibrationProgramme(metadata, programmeId, version); if (programme.status !== "found") return programme; return findProgrammePrescriptionSlot(programme.value, templateId, slotId); }
