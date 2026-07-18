import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import {
  completeCanonicalSession,
  pauseCanonicalSession,
  prescriptionHash,
  recordCanonicalPerformedWork,
  startCanonicalSession,
} from "@/application/training/canonical-recorded-session-application";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalRestTimerRepository } from "@/data/local/canonical-rest-timer-repository";
import { exerciseLibrary } from "@/domain/training/presets";

export const CANONICAL_FIVE_DAY_FIXTURE_CREATED_AT = "2026-01-01T00:00:00.000Z";
export const canonicalFiveDayFixtureProfile = {
  goal: "strength_hypertrophy",
  macrocycleGoal: "build_muscle_and_strength",
  experienceLevel: "intermediate",
  daysPerWeek: 5,
  preferredSplit: "let_app_choose",
  equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
  units: "kg",
} as const;

export type CanonicalHomeVisualState = "planned" | "active" | "paused" | "completed" | "rest_day";

export function canonicalFiveDayFixtureInput(planId: string) {
  return {
    planId,
    createdAt: CANONICAL_FIVE_DAY_FIXTURE_CREATED_AT,
    updatedAt: CANONICAL_FIVE_DAY_FIXTURE_CREATED_AT,
    ...canonicalFiveDayFixtureProfile,
    exercises: exerciseLibrary,
    history: [],
  } as const;
}

/** Shared source for the allocator certification and product-like Design-QA renders. */
export function constructCanonicalFiveDayFixture(planId = "canonical-five-day-certification") {
  return constructCanonicalActivePlanFromCanonicalInputs(canonicalFiveDayFixtureInput(planId));
}

/**
 * Builds Home states through the same active-plan, ledger, evidence and lifecycle owners as Train.
 * This helper is Design-QA only; it does not author snapshot or projection fields.
 */
export function applyCanonicalHomeVisualState(
  state: CanonicalHomeVisualState,
  options: Readonly<{ planId?: string; now?: string }> = {},
) {
  const planId = options.planId ?? `design-qa:home-${state}`;
  const now = options.now ?? "2026-07-18T10:00:00.000Z";
  resetCanonicalHomeVisualState();
  const created = canonicalActivePlanState.create(canonicalFiveDayFixtureInput(planId));
  if (created.hydration !== "hydrated" || !created.model) {
    throw new Error(`canonical_home_visual_plan_failed:${created.error ?? created.hydration}`);
  }
  if (state === "planned" || state === "rest_day") return created.model;

  const active = startFirstPlannedSession(planId, now);
  const work = recordPrescribedWork(planId, active, state === "completed");
  if (state === "paused") {
    const currentRevision = requireModel(planId, state).revision;
    const paused = pauseCanonicalSession({
      planId,
      expectedPlanRevision: currentRevision,
      recordedSessionId: active.recordedSessionId,
      expectedLedgerVersion: work.ledgerVersion,
      operationId: `${planId}:pause`,
      occurredAt: offsetIso(now, -10_000),
      provenance: "design_qa_home_visual",
    });
    if (paused.status !== "applied" && paused.status !== "idempotent") {
      throw new Error(`canonical_home_visual_pause_failed:${paused.reason}`);
    }
  }
  if (state === "completed") completeActiveSession(planId, active.recordedSessionId, active.planRevision, work.ledgerVersion, now, "first");
  return requireModel(planId, state);
}

function resetCanonicalHomeVisualState(): void {
  canonicalActivePlanState.clear();
  canonicalRecordedSessionLedger.clear();
  canonicalProgressEvidenceRepository.clear();
  canonicalRestTimerRepository.clear();
}

function startFirstPlannedSession(planId: string, at: string): Readonly<{ recordedSessionId: string; planRevision: number }> {
  const model = requireModel(planId, "planned");
  const next = model.nextSession;
  const session = next ? model.plannedSessions.find((candidate) => candidate.id === next.id) : null;
  if (!next || !session) throw new Error(`canonical_home_visual_planned_session_unavailable:${planId}`);
  const started = startCanonicalSession({
    planId,
    expectedPlanRevision: model.revision,
    plannedSessionId: next.id,
    expectedPrescriptionHash: prescriptionHash(session.snapshot),
    operationId: `${planId}:start:${session.planSessionIndex}`,
    startedAt: offsetIso(at, -60_000),
    provenance: "design_qa_home_visual",
  });
  if (!started.recordedSessionId || started.planRevision === undefined || !["started", "already_started"].includes(started.status)) {
    throw new Error(`canonical_home_visual_start_failed:${started.reason}`);
  }
  return { recordedSessionId: started.recordedSessionId, planRevision: started.planRevision };
}

function recordPrescribedWork(
  planId: string,
  active: Readonly<{ recordedSessionId: string; planRevision: number }>,
  allWorkSets: boolean,
): Readonly<{ ledgerVersion: number }> {
  const initial = canonicalRecordedSessionLedger.get(active.recordedSessionId);
  if (initial.status !== "found") throw new Error(`canonical_home_visual_ledger_unavailable:${active.recordedSessionId}`);
  const slots = Array.isArray(initial.session.prescriptionSnapshot.slots)
    ? initial.session.prescriptionSnapshot.slots as Array<Record<string, unknown>>
    : [];
  const prescribed = slots.flatMap((slot) => {
    const settings = (slot.settings ?? {}) as Record<string, unknown>;
    const required = allWorkSets ? Number(settings.requiredWorkSets ?? settings.requiredSets ?? 0) : 1;
    const exactTargets = Array.isArray(slot.exactTargets) ? slot.exactTargets.map(Number) : [];
    return Array.from({ length: Math.max(0, required) }, (_, index) => ({ slot, setOrder: index + 1, reps: exactTargets[index] ?? Number(slot.targetReps ?? 8) }));
  });
  const selected = allWorkSets ? prescribed : prescribed.slice(0, 1);
  let ledgerVersion = initial.session.version;
  selected.forEach(({ slot, setOrder, reps }, index) => {
    const work = recordCanonicalPerformedWork({
      planId,
      expectedPlanRevision: active.planRevision,
      recordedSessionId: active.recordedSessionId,
      expectedLedgerVersion: ledgerVersion,
      operationId: `${active.recordedSessionId}:work:${index + 1}`,
      occurredAt: offsetIso(initial.session.startedAt ?? initial.session.createdAt, (index + 1) * 1_000),
      provenance: "design_qa_home_visual",
      slotId: String(slot.id),
      exerciseId: String(slot.exerciseId),
      setId: `${String(slot.id)}:work:${setOrder}`,
      setOrder,
      reps,
      load: 60,
      unit: "kg",
      completion: "complete",
    });
    if (work.ledgerVersion === undefined || !["applied", "idempotent"].includes(work.status)) {
      throw new Error(`canonical_home_visual_work_failed:${work.reason}`);
    }
    ledgerVersion = work.ledgerVersion;
  });
  return { ledgerVersion };
}

function completeActiveSession(planId: string, recordedSessionId: string, planRevision: number, ledgerVersion: number, completedAt: string, suffix: string): void {
  const completed = completeCanonicalSession({
    planId,
    expectedPlanRevision: planRevision,
    recordedSessionId,
    expectedLedgerVersion: ledgerVersion,
    operationId: `${planId}:complete:${suffix}`,
    occurredAt: completedAt,
    provenance: "design_qa_home_visual",
  });
  if (completed.status !== "applied" && completed.status !== "idempotent") {
    throw new Error(`canonical_home_visual_completion_failed:${completed.reason}`);
  }
}

function requireModel(planId: string, state: CanonicalHomeVisualState) {
  const current = canonicalActivePlanState.getState();
  const model = current.model;
  if (!model || model.planId !== planId) throw new Error(`canonical_home_visual_hydration_failed:${state}:${current.hydration}:${current.error ?? "unknown"}`);
  return model;
}

function offsetIso(value: string, milliseconds: number): string {
  return new Date(Date.parse(value) + milliseconds).toISOString();
}
