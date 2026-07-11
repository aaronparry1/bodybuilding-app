import type { BlockType } from "@/domain/training/annual-models";
import type { ExerciseFamily, ExerciseRole, MuscleGroup, ProgressionSettings } from "@/domain/training/models";
import { resolveProductiveSetTarget } from "@/domain/training/productive-set-targets";

export interface SetPrescriptionContext {
  blockType?: BlockType | null;
  exerciseRole?: ExerciseRole | null;
  exerciseFamily?: ExerciseFamily | null;
  primaryMuscles?: MuscleGroup[];
}

export interface HybridSetPrescription {
  requiredSets: number;
  recommendedMinSets: number;
  recommendedMaxSets: number;
  softCapSets: number;
  hardCapSets?: number;
  source: NonNullable<ProgressionSettings["setRangeSource"]>;
  coachingIntent?: ProgressionSettings["volumeCoachingIntent"];
}

export function resolveSetPrescription(
  settings: ProgressionSettings,
  context: SetPrescriptionContext = {},
): HybridSetPrescription {
  const productiveTarget = resolveProductiveSetTarget(context);
  const hasTrainingContext = Boolean(context.blockType || context.exerciseRole || context.exerciseFamily || context.primaryMuscles?.length);
  const legacyRequired = finitePositiveInteger(settings.requiredWorkSets, 3);
  const requiredSets = finitePositiveInteger(settings.requiredSets, legacyRequired);
  const fallbackRecommendedMin = requiredSets;
  const fallbackRecommendedMax = Math.max(requiredSets, Math.min(productiveTarget.targetMax, requiredSets + 2));
  const recommendedMinSets = finitePositiveInteger(settings.recommendedMinSets, fallbackRecommendedMin);
  const recommendedMaxSets = Math.max(
    recommendedMinSets,
    finitePositiveInteger(settings.recommendedMaxSets, fallbackRecommendedMax),
  );
  const softCapSets = Math.max(
    recommendedMaxSets,
    finitePositiveInteger(settings.softCapSets, hasTrainingContext ? productiveTarget.softCap : 8),
  );

  return {
    requiredSets,
    recommendedMinSets,
    recommendedMaxSets,
    softCapSets,
    hardCapSets: settings.hardCapSets ?? productiveTarget.hardCap,
    source: settings.setRangeSource ?? "legacy",
    coachingIntent: settings.volumeCoachingIntent,
  };
}

export function withSetPrescription(
  settings: ProgressionSettings,
  context: SetPrescriptionContext = {},
  overrides: Partial<Pick<HybridSetPrescription, "requiredSets" | "recommendedMinSets" | "recommendedMaxSets" | "softCapSets" | "hardCapSets" | "source" | "coachingIntent">> = {},
): ProgressionSettings {
  const base = resolveSetPrescription(settings, context);
  const requiredSets = finitePositiveInteger(overrides.requiredSets, base.requiredSets);
  const recommendedMinSets = finitePositiveInteger(overrides.recommendedMinSets, Math.max(requiredSets, base.recommendedMinSets));
  const recommendedMaxSets = Math.max(
    recommendedMinSets,
    finitePositiveInteger(overrides.recommendedMaxSets, base.recommendedMaxSets),
  );
  const softCapSets = Math.max(
    recommendedMaxSets,
    finitePositiveInteger(overrides.softCapSets, base.softCapSets),
  );

  return {
    ...settings,
    requiredWorkSets: requiredSets,
    requiredSets,
    recommendedMinSets,
    recommendedMaxSets,
    softCapSets,
    hardCapSets: overrides.hardCapSets ?? base.hardCapSets,
    setRangeSource: overrides.source ?? base.source,
    volumeCoachingIntent: overrides.coachingIntent ?? base.coachingIntent,
  };
}

export function shiftRecommendedSetRange(settings: ProgressionSettings, delta: number, context: SetPrescriptionContext = {}): ProgressionSettings {
  const prescription = resolveSetPrescription(settings, context);
  const upperBoundary = delta > 0 ? clampSetCount(prescription.hardCapSets ?? prescription.softCapSets) : 10;
  const recommendedMinSets = Math.min(clampSetCount(prescription.recommendedMinSets + delta), upperBoundary);
  const recommendedMaxSets = Math.max(recommendedMinSets, Math.min(clampSetCount(prescription.recommendedMaxSets + delta), upperBoundary));
  const requiredSets =
    delta < 0
      ? Math.min(prescription.requiredSets, recommendedMinSets)
      : prescription.requiredSets;

  return withSetPrescription(settings, context, {
    requiredSets,
    recommendedMinSets,
    recommendedMaxSets,
    softCapSets: Math.max(recommendedMaxSets, Math.min(prescription.softCapSets, upperBoundary)),
    hardCapSets: prescription.hardCapSets,
    source: "volume_adjustment",
  });
}

export function getRequiredSets(settings: ProgressionSettings, context: SetPrescriptionContext = {}): number {
  return resolveSetPrescription(settings, context).requiredSets;
}

export function getRecommendedSetRange(settings: ProgressionSettings, context: SetPrescriptionContext = {}): { min: number; max: number } {
  const prescription = resolveSetPrescription(settings, context);
  return { min: prescription.recommendedMinSets, max: prescription.recommendedMaxSets };
}

function finitePositiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value) || value == null) return clampSetCount(fallback);
  return clampSetCount(Math.round(value));
}

function clampSetCount(value: number): number {
  return Math.max(1, Math.min(10, value));
}
