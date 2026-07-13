import type { BlockType } from "@/domain/training/annual-models";
import {
  COMPATIBILITY_PRESCRIPTION_REGISTRY_VERSION,
  type CompatibilityBlockClassification,
  type CompatibilityBranchKey,
  type CompatibilityExerciseClass,
  type CompatibilityHistoryState,
  type CompatibilityLoadingCapability,
  type CompatibilityPrescriptionResolution,
  lookupCompatibilityPrescriptionSemantics,
  validateCompatibilityPrescriptionSemantics,
  copyCompatibilityPrescriptionSemantics,
} from "@/domain/training/compatibility-prescription-semantics";

export type CompatibilityPrescriptionResolutionInput = Readonly<{
  registryVersion: typeof COMPATIBILITY_PRESCRIPTION_REGISTRY_VERSION;
  blockClassification: CompatibilityBlockClassification | string;
  exerciseClass: CompatibilityExerciseClass | string;
  slotRole: CompatibilityBranchKey["slotRole"] | string;
  movementFamily: CompatibilityBranchKey["movementFamily"] | string;
  historyState: CompatibilityHistoryState | string;
  loadingCapability: CompatibilityLoadingCapability | string;
  equipmentIncrementClass: "standard" | "small" | "bodyweight" | "duration" | "any";
  guidanceEnvelope: CompatibilityBranchKey["guidanceEnvelope"] | string;
  prescriptionState: "normal" | "evidence_rich" | "invalid";
  specialMethod: "standard" | "none" | "unsupported";
  sessionContext: "generated_slot";
}>;

export type CompatibilityProjectedInput = Readonly<{ status: "projected"; input: CompatibilityPrescriptionResolutionInput } | { status: "unsupported" | "invalid"; reasonCode: string }>;

const blockClasses = new Set<CompatibilityBlockClassification>(["hypertrophy", "strength", "power", "deload"]);
const exerciseClasses = new Set<CompatibilityExerciseClass>(["primary_compound", "secondary_compound", "accessory"]);
const histories = new Set<CompatibilityHistoryState>(["none", "sparse", "established", "any"]);
const loading = new Set<CompatibilityLoadingCapability>(["percentage_capable", "small_increment", "history_derived", "any"]);
const roles = new Set(["primary", "secondary", "accessory", "any"]);
const movements = new Set(["compound", "isolation", "any"]);
const envelopes = new Set(["compound", "accessory", "strength", "power", "deload"]);

function invalid(reasonCode: string): CompatibilityProjectedInput { return { status: "invalid", reasonCode }; }
function normalizeBlock(value: string): CompatibilityBlockClassification | undefined {
  if (value === "hypertrophy" || value === "strength" || value === "power" || value === "deload") return value;
  return undefined;
}
function normalizeExercise(value: string): CompatibilityExerciseClass | undefined {
  if (value === "primary_compound" || value === "secondary_compound" || value === "accessory") return value;
  return undefined;
}

export function buildCompatibilityPrescriptionResolutionInput(input: Readonly<Omit<CompatibilityPrescriptionResolutionInput, "registryVersion"> & { registryVersion?: string; blockType?: BlockType | string }>): CompatibilityProjectedInput {
  const block = normalizeBlock(input.blockClassification ?? input.blockType ?? "");
  const exerciseClass = normalizeExercise(input.exerciseClass);
  if (!block) return invalid("unsupported_block_classification");
  if (!exerciseClass) return { status: "unsupported", reasonCode: "unsupported_exercise_class" };
  if (input.registryVersion && input.registryVersion !== COMPATIBILITY_PRESCRIPTION_REGISTRY_VERSION) return invalid("unsupported_registry_version");
  if (!roles.has(input.slotRole) || !movements.has(input.movementFamily) || !histories.has(input.historyState as CompatibilityHistoryState) || !loading.has(input.loadingCapability as CompatibilityLoadingCapability) || !envelopes.has(input.guidanceEnvelope)) return invalid("branch_fact_invalid");
  if (input.prescriptionState === "invalid" || input.specialMethod === "unsupported") return invalid("contradictory_branch");
  return { status: "projected", input: { ...input, registryVersion: COMPATIBILITY_PRESCRIPTION_REGISTRY_VERSION, blockClassification: block, exerciseClass, slotRole: input.slotRole as CompatibilityBranchKey["slotRole"], movementFamily: input.movementFamily as CompatibilityBranchKey["movementFamily"], historyState: input.historyState as CompatibilityHistoryState, loadingCapability: input.loadingCapability as CompatibilityLoadingCapability, guidanceEnvelope: input.guidanceEnvelope as CompatibilityBranchKey["guidanceEnvelope"] } };
}

export function resolveCompatibilityPrescriptionAggregate(input: CompatibilityPrescriptionResolutionInput): CompatibilityPrescriptionResolution {
  if (input.registryVersion !== COMPATIBILITY_PRESCRIPTION_REGISTRY_VERSION) return { status: "unsupported_registry_version", reasonCode: "unsupported_registry_version" };
  const projected = buildCompatibilityPrescriptionResolutionInput(input);
  if (projected.status !== "projected") return { status: projected.status === "unsupported" ? "unsupported_exercise_class" : "invalid_input", reasonCode: projected.reasonCode };
  const normalized = projected.input;
  if (normalized.exerciseClass === "primary_compound" && normalized.slotRole !== "primary" && normalized.slotRole !== "any") return { status: "unsupported_slot_role", reasonCode: "primary_role_required" };
  const key: CompatibilityBranchKey = { blockClassification: normalized.blockClassification as CompatibilityBlockClassification, exerciseClass: normalized.exerciseClass as CompatibilityExerciseClass, slotRole: normalized.slotRole as CompatibilityBranchKey["slotRole"], movementFamily: normalized.movementFamily as CompatibilityBranchKey["movementFamily"], historyState: normalized.historyState as CompatibilityHistoryState, loadingCapability: normalized.loadingCapability as CompatibilityLoadingCapability, guidanceEnvelope: normalized.guidanceEnvelope as CompatibilityBranchKey["guidanceEnvelope"], sessionContext: "generated_slot" };
  const found = lookupCompatibilityPrescriptionSemantics(key);
  if (found.status !== "found") return { status: found.status === "missing" ? "unsupported_branch" : "contradictory_branch", reasonCode: found.reasonCode };
  const issues = validateCompatibilityPrescriptionSemantics(found.semantics);
  if (issues.length) return { status: "contradictory_branch", reasonCode: issues.join(",") };
  return { status: "resolved", semantics: copyCompatibilityPrescriptionSemantics(found.semantics) };
}

export function compatibilityResolverHasArithmeticDependencies(): false { return false; }
