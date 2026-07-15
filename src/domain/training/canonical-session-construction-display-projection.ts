import type { CanonicalSessionSnapshot } from "@/domain/training/canonical-session-construction-pipeline";
import type { Exercise } from "@/domain/training/models";

export const CANONICAL_SESSION_CONSTRUCTION_DISPLAY_PROJECTION_VERSION = "canonical_session_construction_display_projection_v1" as const;
export type DisplayProjectionResult = Readonly<{ status: "ready"; projection: Readonly<{ projectionVersion: typeof CANONICAL_SESSION_CONSTRUCTION_DISPLAY_PROJECTION_VERSION; snapshotVersion: string; sessionId: string; roleLabel: string; sessionName: string; slots: readonly Readonly<{ index: number; exerciseId: string; exerciseName: string; methodLabel: string; loadStateLabel: string; accessibilityLabel: string }>[] }> }> | Readonly<{ status: "unavailable" | "corrupt"; reason: string }>;
const methodLabels: Record<string, string> = { straight_sets: "Straight sets", back_off_sets: "Back-off sets", pyramid: "Pyramid", amrap: "AMRAP", dynamic_effort: "Dynamic effort" };
const roleLabels: Record<string, string> = { primary: "Primary", secondary: "Secondary", accessory: "Accessory", upper: "Upper", lower: "Lower" };
export function projectCanonicalSessionConstructionDisplay(snapshot: CanonicalSessionSnapshot, exercises: readonly Exercise[]): DisplayProjectionResult {
  if (!snapshot || !["canonical_session_snapshot_v2", "canonical_session_snapshot_v3"].includes(snapshot.schemaVersion) || !snapshot.sessionId || !snapshot.provenance?.inputVersion) return { status: "corrupt", reason: "invalid_snapshot" };
  const names = new Map(exercises.map((exercise) => [exercise.id, exercise.name]));
  const roleLabel = roleLabels[snapshot.role];
  if (!roleLabel) return { status: "unavailable", reason: "role_metadata_missing" };
  const slots = snapshot.slots.map((slot) => { const name = names.get(slot.exerciseId); const method = methodLabels[slot.method]; if (!name) throw new Error("exercise_metadata_missing"); if (!method) throw new Error("method_metadata_missing"); const loadState = snapshot.schemaVersion === "canonical_session_snapshot_v3" ? (slot as typeof slot & { loadPrescription: { state: string } }).loadPrescription.state : slot.loadingMode; const loadStateLabel = loadState === "established" ? "Established load" : loadState === "calibration_required" ? "Calibration required" : loadState === "autoregulated" ? "Autoregulated" : loadState === "bodyweight" ? "Bodyweight" : loadState === "unavailable" ? "Load unavailable" : "Load state"; return { index: slot.index, exerciseId: slot.exerciseId, exerciseName: name, methodLabel: method, loadStateLabel, accessibilityLabel: `${name}, ${method}, ${loadStateLabel}` }; });
  return { status: "ready", projection: { projectionVersion: CANONICAL_SESSION_CONSTRUCTION_DISPLAY_PROJECTION_VERSION, snapshotVersion: snapshot.schemaVersion, sessionId: snapshot.sessionId, roleLabel, sessionName: `${roleLabel} session`, slots } };
}
