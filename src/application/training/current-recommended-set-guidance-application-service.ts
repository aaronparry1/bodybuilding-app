import { transformRecommendedSetCountGuidance, type RecommendedSetCountGuidanceRange } from "@/domain/training/current-recommended-set-count-range";
import type { CurrentRecommendedSetGuidanceAdjustmentRecord } from "@/domain/training/current-recommended-set-guidance-adjustment-record";

export type ApplyCurrentRecommendedSetGuidanceAdjustmentCommand = Readonly<{ schemaVersion: "v1"; recordId: string; expectedIdempotencyKey: string; appliedAt: string; absoluteMinimum: number; absoluteMaximum: number }>;
export type GuidanceTargetForApplication = Readonly<{ id: string; version: string; range: RecommendedSetCountGuidanceRange }>;
export type CurrentGuidanceApplicationRepository = Readonly<{ getRecord: (id: string) => CurrentRecommendedSetGuidanceAdjustmentRecord | null; getTarget: (id: string, version: string) => GuidanceTargetForApplication | null; hasCreatedWorkout: (planId: string, mesocycleId: string, microcycle: number) => boolean; saveTarget: (target: GuidanceTargetForApplication & Readonly<{ nextVersion: string; nextRange: RecommendedSetCountGuidanceRange }>) => void; saveAppliedRecord: (record: CurrentRecommendedSetGuidanceAdjustmentRecord) => void }>;
export type CurrentGuidanceApplicationResult = Readonly<{ status: "applied" | "already_applied" | "record_not_found" | "invalid_record" | "target_not_found" | "target_version_changed" | "blocked_created_workout" | "normalization_failed" | "plan_persistence_failed" | "partial_application_recovery_required"; reason: string; record?: CurrentRecommendedSetGuidanceAdjustmentRecord }>;

/** Narrow, injected application boundary. Real repository binding remains deferred until a persisted guidance target exists. */
export function applyCurrentRecommendedSetGuidanceAdjustment(command: ApplyCurrentRecommendedSetGuidanceAdjustmentCommand, repository: CurrentGuidanceApplicationRepository): CurrentGuidanceApplicationResult {
  const record = repository.getRecord(command.recordId);
  if (!record) return { status: "record_not_found", reason: "record_missing" };
  if (record.semanticIdempotencyKey !== command.expectedIdempotencyKey) return { status: "invalid_record", reason: "idempotency_mismatch" };
  if (record.lifecycle === "applied") return { status: "already_applied", reason: "already_applied", record };
  if (record.lifecycle !== "ready" || record.timing.state !== "resolved_next_normal_microcycle") return { status: "invalid_record", reason: "record_not_ready" };
  const effective = record.timing.effective;
  if (repository.hasCreatedWorkout(effective.planId, effective.mesocycleId, effective.effectiveMicrocycleNumber)) return { status: "blocked_created_workout", reason: "created_workout_exists" };
  const target = repository.getTarget(record.target.guidanceSlotId, record.expectedTargetVersion);
  if (!target) return { status: "target_not_found", reason: "target_missing_or_version_changed" };
  const normalized = transformRecommendedSetCountGuidance({ range: target.range, direction: record.direction, shiftMagnitude: record.magnitude, absoluteMinimum: command.absoluteMinimum, absoluteMaximum: command.absoluteMaximum, normalizationPolicy: record.normalizationPolicyVersion as "legacy_programme_guidance_v1" });
  if (!normalized.range || (normalized.status !== "transformed" && normalized.status !== "unchanged")) return { status: "normalization_failed", reason: normalized.reason };
  const nextVersion = `${target.version}:guidance:${record.id}`;
  try { repository.saveTarget({ ...target, nextVersion, nextRange: normalized.range }); } catch { return { status: "plan_persistence_failed", reason: "target_write_failed" }; }
  const applied = { ...record, lifecycle: "applied" as const };
  try { repository.saveAppliedRecord(applied); } catch { return { status: "partial_application_recovery_required", reason: "target_written_record_write_failed" }; }
  return { status: "applied", reason: normalized.reason, record: applied };
}
