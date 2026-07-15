import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { applyCanonicalActiveSessionFixture, readCanonicalFixtureSession } from "@/application/design-qa/canonical-session-fixtures";
import { jsonStore } from "@/data/local/json-store";

export type CanonicalTrainProjection = Readonly<{ fixtureId: string; planId: string; revision: number; recordedSessionId: string; role: string; lifecycle: string; slots: number; performedSets: number; action: "resume" | "record"; snapshotVersion: string; loadState: string; prescribedBaseLoad?: number; loadingMode: string; loadInstruction?: string; loadReason?: string; evidenceStatus?: string; substitution?: string; stopRule?: string; stopOutcome?: "continue" | "warning" | "stopped"; completionSummaryId?: string; progressEvidence?: "pending" | "complete" }>;
const projectionKey = "iron-logic.canonical-train-projection";

export function createCanonicalTrainProjection(fixtureId: string): CanonicalTrainProjection {
  const setup = applyCanonicalActiveSessionFixture(fixtureId);
  const model = canonicalActivePlanState.getReadModel();
  const aggregate = setup.recordedSessionId ? readCanonicalFixtureSession(setup.recordedSessionId) : null;
  if (!model || !setup.recordedSessionId || !aggregate || aggregate.status !== "found") throw new Error(setup.reason);
  const performance = aggregate.events.find((event) => event.type === "performance");
  const snapshot = aggregate.session.prescriptionSnapshot as Record<string, unknown>;
  const firstSlot = Array.isArray(snapshot.slots) ? snapshot.slots[0] as Record<string, unknown> : undefined;
  const load = firstSlot?.loadPrescription as Record<string, unknown> | undefined;
  const stopRule = firstSlot?.stopRule;
  const completion = aggregate.events.find((event) => event.type === "completed");
  const projection = { fixtureId, planId: model.planId, revision: model.revision, recordedSessionId: setup.recordedSessionId, role: aggregate.session.role, lifecycle: aggregate.session.status, slots: Array.isArray(snapshot.slots) ? snapshot.slots.length : 0, performedSets: aggregate.events.filter((event) => event.type === "performance").length, action: "record" as const, snapshotVersion: String(snapshot.schemaVersion), loadState: String(load?.state ?? "unavailable"), ...(typeof load?.prescribedBaseLoad === "number" ? { prescribedBaseLoad: load.prescribedBaseLoad } : {}), loadingMode: String(load?.loadingMode ?? firstSlot?.loadingMode ?? "unavailable"), ...(typeof load?.instruction === "string" ? { loadInstruction: load.instruction } : {}), ...(typeof load?.reason === "string" ? { loadReason: load.reason } : {}), ...(typeof load?.evidenceStatus === "string" ? { evidenceStatus: load.evidenceStatus } : {}), ...(performance?.payload.substitutionId ? { substitution: String(performance.payload.substitutionId) } : {}), ...(stopRule ? { stopRule: JSON.stringify(stopRule), stopOutcome: fixtureId.includes("shutdown") ? "stopped" as const : fixtureId.includes("threshold") ? "warning" as const : "continue" as const } : {}), ...(completion ? { completionSummaryId: `${setup.recordedSessionId}:completion:${aggregate.events.length}`, progressEvidence: "complete" as const } : {}) };
  jsonStore.set(projectionKey, projection);
  return projection;
}

export function readCanonicalTrainProjection(): CanonicalTrainProjection | null { return jsonStore.get<CanonicalTrainProjection | null>(projectionKey, null); }
