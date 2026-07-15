import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { applyCanonicalActiveSessionFixture, readCanonicalFixtureSession } from "@/application/design-qa/canonical-session-fixtures";

export type CanonicalTrainProjection = Readonly<{ fixtureId: string; planId: string; revision: number; recordedSessionId: string; role: string; lifecycle: string; slots: number; performedSets: number; action: "resume" | "record"; substitution?: string; stopRule?: string; stopOutcome?: "continue" | "warning" | "stopped" }>;

export function createCanonicalTrainProjection(fixtureId: string): CanonicalTrainProjection {
  const setup = applyCanonicalActiveSessionFixture(fixtureId);
  const model = canonicalActivePlanState.getReadModel();
  const aggregate = setup.recordedSessionId ? readCanonicalFixtureSession(setup.recordedSessionId) : null;
  if (!model || !setup.recordedSessionId || !aggregate || aggregate.status !== "found") throw new Error(setup.reason);
  const performance = aggregate.events.find((event) => event.type === "performance");
  const stopRule = (aggregate.session.prescriptionSnapshot as Record<string, unknown>).stopRule;
  return { fixtureId, planId: model.planId, revision: model.revision, recordedSessionId: setup.recordedSessionId, role: aggregate.session.role, lifecycle: aggregate.session.status, slots: Array.isArray(aggregate.session.prescriptionSnapshot.slots) ? aggregate.session.prescriptionSnapshot.slots.length : 0, performedSets: aggregate.events.filter((event) => event.type === "performance").length, action: "record", ...(performance?.payload.substitutionId ? { substitution: String(performance.payload.substitutionId) } : {}), ...(stopRule ? { stopRule: JSON.stringify(stopRule), stopOutcome: fixtureId.includes("shutdown") ? "stopped" as const : fixtureId.includes("threshold") ? "warning" as const : "continue" as const } : {}) };
}
