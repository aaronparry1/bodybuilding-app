import { jsonStore } from "@/data/local/json-store";
import { classifyPlanAuthority } from "@/domain/training/plan-authority-provenance";
import { createActiveTrainingPlan, type ActiveTrainingPlan } from "@/domain/training/plan-setup";

export const SAVED_PLAN_MIGRATION_VERSION = "saved_plan_migration_v1" as const;
const recoveryKey = "iron-logic.saved-plan-migration-recovery";

export type SavedPlanMigrationResult = Readonly<{
  status: "already_canonical" | "migrated_legacy" | "reconstructed_ambiguous" | "read_only_blocked" | "migration_failed_recoverably";
  plan: ActiveTrainingPlan;
  migrationId?: string;
  reason?: string;
}>;

export function migrateSavedActivePlan(source: ActiveTrainingPlan): SavedPlanMigrationResult {
  const authority = classifyPlanAuthority(source);
  if (authority.kind === "canonical_modern") return { status: "already_canonical", plan: source };
  const migrationId = `${SAVED_PLAN_MIGRATION_VERSION}:${source.id}`;
  try {
    const existing = jsonStore.get<Record<string, unknown>>(recoveryKey, {});
    if (!existing[migrationId]) jsonStore.set(recoveryKey, { ...existing, [migrationId]: source });
    const target = createActiveTrainingPlan({
      goal: source.goal,
      planningChoice: source.mode,
      targetDate: source.targetDate,
      eventType: source.eventType,
      equipmentPreset: "custom",
      customEquipment: source.equipment,
      daysPerWeek: source.daysPerWeek,
      preferredSplit: source.preferredSplit,
      experienceLevel: source.experienceLevel,
      recoveryCardioPreference: source.recoveryCardioPreference,
      rotationFrequency: source.rotationFrequency,
    }, source.createdAt);
    const migrated: ActiveTrainingPlan = { ...target, id: source.id, name: source.name };
    return { status: authority.kind === "legacy_compatibility" ? "migrated_legacy" : "reconstructed_ambiguous", plan: migrated, migrationId, reason: authority.kind === "legacy_compatibility" ? "legacy_source_reconstructed_canonically" : "ambiguous_source_reconstructed_from_validated_profile" };
  } catch {
    return { status: "migration_failed_recoverably", plan: source, migrationId, reason: "canonical_reconstruction_failed" };
  }
}
