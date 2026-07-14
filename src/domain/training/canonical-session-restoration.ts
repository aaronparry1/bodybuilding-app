import type { CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";

export type RecordedSessionStatus = "started" | "paused" | "completed" | "legacy_historical";
export type CanonicalRestorationResult = Readonly<{ status: "restored"; snapshot: CanonicalPlannedSessionSnapshot; recordedStatus: RecordedSessionStatus }> | Readonly<{ status: "rejected"; reason: "unsupported_snapshot" | "invalid_status" | "invalid_linkage" | "stale_revision" | "legacy_authority_present" }>;

/** Restores recorded facts only. This module intentionally has no Session Construction dependency. */
export function restoreCanonicalRecordedSession(input: Readonly<{ snapshot: CanonicalPlannedSessionSnapshot; status: RecordedSessionStatus; expectedMicrocycleId: string; currentRevision: number; performedSets?: readonly unknown[] }>): CanonicalRestorationResult {
  const snapshot = input.snapshot;
  if (!snapshot || typeof snapshot.prescriptionSnapshot !== "object" || snapshot.prescriptionSnapshot === null) return { status: "rejected", reason: "unsupported_snapshot" };
  if (snapshot.microcycleId !== input.expectedMicrocycleId) return { status: "rejected", reason: "invalid_linkage" };
  if (snapshot.revision < input.currentRevision) return { status: "rejected", reason: "stale_revision" };
  if (input.status !== "legacy_historical" && !["started", "paused", "completed"].includes(input.status)) return { status: "rejected", reason: "invalid_status" };
  const value = snapshot.prescriptionSnapshot as Record<string, unknown>;
  if ("blocks" in value || "activeBlockId" in value || "trainingYear" in value || "currentBlock" in value) return { status: "rejected", reason: "legacy_authority_present" };
  void input.performedSets;
  return { status: "restored", snapshot, recordedStatus: input.status };
}
