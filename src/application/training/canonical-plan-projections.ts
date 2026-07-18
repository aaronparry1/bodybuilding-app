import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";

export type CanonicalPlanProjection = Readonly<{
  planId: string;
  macrocycle: Readonly<{ goal: string; targetDate?: string; rolling: boolean }>;
  mesocycle: Readonly<{ id: string; position: number; purpose: string }>;
  microcycle: Readonly<{ id: string; sequenceNumber: number; trainingDays: number; sessionRoles: readonly string[] }>;
  plannedSessions: readonly Readonly<{ id: string; role: string; planSessionIndex: number; status: string }>[];
  nextActionableSession: Readonly<{ id: string; role: string }> | null;
  activeSession: Readonly<{ id: string; role: string; status: string }> | null;
  progress: Readonly<{ evidenceVersion: string; revision: number }>;
}>;

/** Read-only presentation projection; it performs no planning or prescription decisions. */
export function projectCanonicalPlan(readModel: CanonicalActivePlanReadModel): CanonicalPlanProjection {
  return {
    planId: readModel.planId,
    macrocycle: { ...readModel.macrocycle },
    mesocycle: { ...readModel.mesocycle },
    microcycle: { ...readModel.microcycle, sessionRoles: [...readModel.microcycle.sessionRoles] },
    plannedSessions: readModel.plannedSessions.map((session) => ({ id: session.id, role: session.role, planSessionIndex: session.planSessionIndex, status: session.status })),
    nextActionableSession: readModel.nextSession ? { ...readModel.nextSession } : null,
    activeSession: readModel.activeRecordedSession ? { id: readModel.activeRecordedSession.recordedSessionId, role: readModel.activeRecordedSession.role, status: readModel.activeRecordedSession.status } : null,
    progress: { ...readModel.progress },
  };
}
