import type { CanonicalActivePlanReadModel, CanonicalRecordedSessionProjection } from "@/application/training/canonical-active-plan-application";

export type CanonicalHomeStatus = "hydrating" | "ready" | "empty" | "recorded_history_recovery_required" | "storage_error";
export type CanonicalHomeAction = Readonly<{ type: "open_planned_session" | "resume_recorded_session" | "open_progress" | "setup_plan"; planId?: string; planRevision?: number; sessionId?: string }>;
export type CanonicalHomeProjection = Readonly<{ status: CanonicalHomeStatus; planId?: string; revision?: number; macrocycle?: string; mesocyclePurpose?: string; microcycleId?: string; nextSession?: { id: string; role: string }; nextSessionSummary?: { exerciseCount: number; setCount: number }; activeRecordedSession?: CanonicalRecordedSessionProjection; historicalCount: number; progress: { evidenceVersion?: string; revision?: number }; actions: readonly CanonicalHomeAction[] }>;

export function projectCanonicalHome(input: Readonly<{ status: "hydrating" | "empty" | "error" | "ready"; model?: CanonicalActivePlanReadModel | null }>): CanonicalHomeProjection {
  if (input.status === "hydrating") return { status: "hydrating", historicalCount: 0, progress: {}, actions: [] };
  if (input.status === "empty") return { status: "empty", historicalCount: 0, progress: {}, actions: [{ type: "setup_plan" }] };
  if (!input.model) return { status: "storage_error", historicalCount: 0, progress: {}, actions: [] };
  const model = input.model;
  const actions: CanonicalHomeAction[] = [];
  if (model.activeRecordedSession) actions.push({ type: "resume_recorded_session", planId: model.planId, planRevision: model.revision, sessionId: model.activeRecordedSession.recordedSessionId });
  else if (model.nextSession) actions.push({ type: "open_planned_session", planId: model.planId, planRevision: model.revision, sessionId: model.nextSession.id });
  actions.push({ type: "open_progress", planId: model.planId, planRevision: model.revision });
  const nextSnapshot = model.nextSession ? model.plannedSessions.find((session) => session.id === model.nextSession?.id)?.snapshot : null;
  const nextSlots = nextSnapshot && Array.isArray(nextSnapshot.slots) ? nextSnapshot.slots as Array<Record<string, unknown>> : [];
  const setCount = nextSlots.reduce((sum, slot) => { const settings = slot.settings && typeof slot.settings === "object" ? slot.settings as Record<string, unknown> : {}; return sum + (typeof settings.requiredSets === "number" ? settings.requiredSets : 1); }, 0);
  return { status: "ready", planId: model.planId, revision: model.revision, macrocycle: model.macrocycle.goal, mesocyclePurpose: model.mesocycle.purpose, microcycleId: model.microcycle.id, ...(model.nextSession ? { nextSession: model.nextSession, nextSessionSummary: { exerciseCount: nextSlots.length, setCount } } : {}), ...(model.activeRecordedSession ? { activeRecordedSession: model.activeRecordedSession } : {}), historicalCount: model.historicalRecordedSessions?.length ?? 0, progress: { evidenceVersion: model.progress.evidenceVersion, revision: model.progress.revision }, actions };
}
