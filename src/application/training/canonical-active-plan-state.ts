import { changeCanonicalSessionDuration, createCanonicalActivePlan, loadCanonicalActivePlan, type CanonicalActivePlanCreateCommand, type CanonicalActivePlanReadModel, type CanonicalSessionDurationChangeResult } from "@/application/training/canonical-active-plan-application";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { restoreCanonicalRecordedSession, type CanonicalRestorationResult, type RecordedSessionStatus } from "@/domain/training/canonical-session-restoration";
import type { CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";
import { applyCanonicalProgressDecision, type CanonicalProgressDecisionApplicationCommand, type CanonicalProgressDecisionApplicationResult } from "@/application/training/canonical-progress-decision-application";
import { commitCanonicalOnboardingPlan, type CanonicalOnboardingPlanCommitResult } from "@/application/training/canonical-release-reconciliation";

export type CanonicalActivePlanState = Readonly<{ hydration: "empty" | "hydrated" | "error"; model: CanonicalActivePlanReadModel | null; error?: string }>;

export type CanonicalActivePlanStateStore = Readonly<{ getState(): CanonicalActivePlanState; subscribe(listener: () => void): () => void; hydrate(): CanonicalActivePlanState; create(command: CanonicalActivePlanCreateCommand): CanonicalActivePlanState; completeOnboarding(command: CanonicalActivePlanCreateCommand): CanonicalOnboardingPlanCommitResult; changeSessionDuration(command: Parameters<typeof changeCanonicalSessionDuration>[0]): CanonicalSessionDurationChangeResult; applyProgressDecision(command: CanonicalProgressDecisionApplicationCommand): CanonicalProgressDecisionApplicationResult; refresh(): CanonicalActivePlanState; clear(): CanonicalActivePlanState; getReadModel(): CanonicalActivePlanReadModel | null; getPlannedSession(id: string): CanonicalPlannedSessionSnapshot | null; getNextActionableSession(): CanonicalPlannedSessionSnapshot | null; restoreRecordedSession(input: Readonly<{ snapshot: CanonicalPlannedSessionSnapshot; status: RecordedSessionStatus; expectedMicrocycleId: string; currentRevision: number; performedSets?: readonly unknown[] }>): CanonicalRestorationResult }>;

export function createCanonicalActivePlanStateStore(): CanonicalActivePlanStateStore {
  let state: CanonicalActivePlanState = { hydration: "empty", model: null };
  const listeners = new Set<() => void>();
  const publish = () => listeners.forEach((listener) => listener());
  const store: CanonicalActivePlanStateStore = {
    getState: () => state,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    hydrate: () => { const result = loadCanonicalActivePlan(); state = result.status === "ok" ? { hydration: "hydrated", model: result.model } : result.reason === "canonical_plan_missing" || result.reason === "missing" ? { hydration: "empty", model: null } : { hydration: "error", model: null, error: result.reason }; publish(); return state; },
    create: (command) => { const result = createCanonicalActivePlan(command); state = result.status === "ok" ? { hydration: "hydrated", model: result.model } : { hydration: "error", model: null, error: result.reason }; publish(); return state; },
    completeOnboarding: (command) => { const result = commitCanonicalOnboardingPlan(command); if (result.status === "saved") store.hydrate(); else { state = { hydration: "error", model: null, error: result.reason }; publish(); } return result; },
    changeSessionDuration: (command) => { const result = changeCanonicalSessionDuration(command); if (result.status === "applied" || result.status === "unchanged") store.hydrate(); return result; },
    applyProgressDecision: (command) => { const result = applyCanonicalProgressDecision(command); if (result.status === "applied" || result.status === "unchanged") store.hydrate(); return result; },
    refresh: () => store.hydrate(),
    clear: () => { canonicalActivePlanV2Repository.clear(); state = { hydration: "empty", model: null }; publish(); return state; },
    getReadModel: () => state.model,
    getPlannedSession: (id) => { const session = state.model?.plannedSessions.find((candidate) => candidate.id === id); return session ? { id: session.id, microcycleId: session.microcycleId, planSessionIndex: session.planSessionIndex, role: session.role, kind: "planned", status: session.status as "planned" | "open" | "completed", constructionVersion: session.constructionVersion, revision: session.revision, prescriptionSnapshot: session.snapshot } : null; },
    getNextActionableSession: () => { const session = state.model?.nextSession; return session ? store.getPlannedSession(session.id) : null; },
    restoreRecordedSession: (input) => restoreCanonicalRecordedSession(input),
  };
  return store;
}

/** The application-owned active-plan state boundary used by production callers. */
export const canonicalActivePlanState = createCanonicalActivePlanStateStore();
