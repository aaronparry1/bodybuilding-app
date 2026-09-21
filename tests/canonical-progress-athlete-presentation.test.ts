import { beforeEach, describe, expect, it } from "vitest";
import { applyCanonicalAdaptationVisualState, applyCanonicalHomeVisualState, applyCanonicalProgressVisualState } from "@/application/design-qa/canonical-five-day-plan-fixture";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { CANONICAL_PROGRESS_TREND_WINDOW, projectCanonicalProgressPresentation, readCanonicalProgressPresentation } from "@/application/training/canonical-progress-presentation";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import type { CanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";

const now = Date.parse("2026-07-18T12:00:00.000Z");

describe("athlete-facing canonical Progress presentation", () => {
  beforeEach(() => {
    canonicalActivePlanState.clear();
    canonicalRecordedSessionLedger.clear();
    canonicalProgressEvidenceRepository.clear();
  });

  it("shows an honest zero-history state and excludes merely started work", () => {
    const model = applyCanonicalHomeVisualState("active", { planId: "progress-started-only", now: "2026-07-18T10:00:00.000Z" });
    const progress = readCanonicalProgressPresentation({ now });
    expect(progress.status).toBe("zero");
    expect(progress.overview).toBeUndefined();
    expect(progress.progressionHighlight).toBeUndefined();
    expect(progress.trend).toBeUndefined();
    expect(progress.nextWorkout?.action).toMatchObject({ type: "open_planned_session", planId: "progress-started-only", planRevision: model.revision });
    expect(JSON.stringify(progress)).not.toMatch(/On track|evidence count|refresh/i);
  });

  it("shows one completed workout as early history without a single-point trend", () => {
    applyCanonicalProgressVisualState("one_completed", { planId: "progress-one" });
    const progress = readCanonicalProgressPresentation({ now });
    expect(progress.status).toBe("early");
    expect(progress.overview).toMatchObject({ completedWorkouts: 1 });
    expect(progress.recentTraining).toHaveLength(1);
    expect(progress.recentTraining[0]!.detail).toBe("15 of 15 working sets completed · 45 min");
    expect(progress.overview).toMatchObject({ completedSummary: "1 workout completed", recentConsistency: "Trained 1 of the last 4 weeks", phaseProgress: "1 session this phase" });
    expect(progress.overview?.guidance).toBe("Keep training—your first reliable trends will appear after 2 more comparable workouts.");
    expect(progress.trend).toBeUndefined();
    expect(progress.overview?.statusLabel).toBeUndefined();
  });

  it("shows established comparable history without inventing an improvement", () => {
    applyCanonicalProgressVisualState("established", { planId: "progress-established" });
    const progress = readCanonicalProgressPresentation({ now });
    expect(progress.status).toBe("established");
    expect(progress.overview).toMatchObject({ completedWorkouts: 3, statusLabel: "Training consistently" });
    expect(progress.progressionHighlight).toBeUndefined();
    expect(progress.trend?.observations).toHaveLength(3);
    expect(progress.trend).toMatchObject({ direction: "stable", metric: "e1rm", summary: "Bench Press is holding steady at 70 kg estimated 1RM across 3 completed workouts." });
    expect(progress.overview).toMatchObject({ completedSummary: "3 workouts completed", recentConsistency: "Trained 3 of the last 4 weeks", phaseProgress: "3 sessions this phase" });
    expect(progress.overview?.calculationDisclosure).toContain("3 completed workouts and 3 comparable exercise observations");
    expect(progress.recentTraining.every((session) => session.detail.startsWith("15 of 15 working sets completed · "))).toBe(true);
    expect(progress.recentTraining.every((session) => session.action.label === "View workout")).toBe(true);
    expect(new Set(progress.recentTraining.map((session) => session.id)).size).toBe(progress.recentTraining.length);
  });

  it("bounds the chart to the latest comparable-workout window", () => {
    applyCanonicalProgressVisualState("established", { planId: "progress-window" });
    const model = canonicalActivePlanState.getReadModel()!;
    const source = canonicalRecordedSessionLedger.exportPlan(model.planId);
    const records = Array.from({ length: 15 }, (_, index) => {
      const base = source[index % source.length]!;
      const recordedSessionId = `progress-window:comparison:${String(index + 1).padStart(2, "0")}`;
      const occurredAt = new Date(Date.UTC(2026, 0, index + 1, 12)).toISOString();
      return {
        ...base,
        session: { ...base.session, recordedSessionId },
        events: base.events.map((event) => ({ ...event, eventId: `${recordedSessionId}:${event.type}:${event.expectedVersion}`, aggregateId: recordedSessionId, occurredAt })),
      };
    });

    const progress = projectCanonicalProgressPresentation({ status: "ready", plan: model, completedAggregates: records, now });

    expect(progress.trend?.observations).toHaveLength(CANONICAL_PROGRESS_TREND_WINDOW);
    expect(progress.trend?.observations[0]?.label).toBe("4");
    expect(progress.trend?.observations.at(-1)?.label).toBe("15");
    expect(progress.trend?.windowLabel).toBe("Last 12 comparable workouts");
  });

  it("respects display units without altering canonical performed loads", () => {
    applyCanonicalProgressVisualState("genuine_pr", { planId: "progress-lb" });
    const kg = readCanonicalProgressPresentation({ now, displayUnit: "kg" });
    const lb = readCanonicalProgressPresentation({ now, displayUnit: "lb" });
    expect(kg.progressionHighlight?.current).toBe("65 kg");
    expect(kg.overview?.statusLabel).toBe("Building momentum");
    expect(lb.progressionHighlight?.current).toBe("143.3 lb");
    expect(kg.progressionHighlight?.exerciseId).toBe(lb.progressionHighlight?.exerciseId);
    const loads = canonicalProgressEvidenceRepository.list("progress-lb").filter((item) => item.kind === "performance").map((item) => item.observations.load);
    expect(loads).toContain(65);
    expect(loads).not.toContain(143.3);
  });

  it("withholds status and trend when only two comparable workouts exist", () => {
    applyCanonicalProgressVisualState("insufficient_trend", { planId: "progress-insufficient" });
    const progress = readCanonicalProgressPresentation({ now });
    expect(progress.status).toBe("early");
    expect(progress.overview?.completedWorkouts).toBe(2);
    expect(progress.overview?.statusLabel).toBeUndefined();
    expect(progress.trend).toBeUndefined();
    expect(progress.progressionHighlight?.exerciseName).toBe("Bench Press");
    expect(progress.overview?.guidance).toBe("Keep training—your first reliable trends will appear after another comparable workout.");
  });

  it("excludes incompatible loading modes from PR comparison", () => {
    applyCanonicalProgressVisualState("established", { planId: "progress-incompatible-base" });
    const model = canonicalActivePlanState.getReadModel()!;
    const records = canonicalRecordedSessionLedger.exportPlan(model.planId);
    const incompatible = records.map((record, index) => ({
      ...record,
      session: { ...record.session, prescriptionSnapshot: replaceLoadingMode(record.session.prescriptionSnapshot, index === 2 ? "bodyweight" : `mode-${index}`) },
    }));
    const progress = projectCanonicalProgressPresentation({ status: "ready", plan: model, completedAggregates: incompatible, evidence: canonicalProgressEvidenceRepository.list(model.planId), now });
    expect(progress.progressionHighlight).toBeUndefined();
    expect(progress.trend).toBeUndefined();
    expect(progress.overview?.statusLabel).toBeUndefined();
  });

  it("uses reps for bodyweight progress and never presents zero as a load", () => {
    applyCanonicalProgressVisualState("genuine_pr", { planId: "progress-bodyweight" });
    const model = canonicalActivePlanState.getReadModel()!;
    const records = canonicalRecordedSessionLedger.exportPlan(model.planId);
    const bodyweight = records.map((record, index) => ({
      ...record,
      session: { ...record.session, prescriptionSnapshot: replaceLoadingMode(record.session.prescriptionSnapshot, "bodyweight") },
      events: record.events.map((event) => {
        const payload = event.payload as Record<string, unknown>;
        return "exerciseId" in payload ? { ...event, payload: { ...payload, load: 0, reps: Number(payload.reps ?? 0) + index } } : event;
      }),
    })) as unknown as typeof records;
    const progress = projectCanonicalProgressPresentation({ status: "ready", plan: model, completedAggregates: bodyweight, evidence: canonicalProgressEvidenceRepository.list(model.planId), now });
    expect(progress.progressionHighlight).toMatchObject({ category: "reps", previous: "7 reps", current: "8 reps", improvement: "+1 reps" });
    expect(JSON.stringify(progress.progressionHighlight)).not.toMatch(/0 kg|0 lb/);
  });

  it("does not present assisted work as a PR or comparable trend", () => {
    applyCanonicalProgressVisualState("genuine_pr", { planId: "progress-assisted" });
    const model = canonicalActivePlanState.getReadModel()!;
    const records = canonicalRecordedSessionLedger.exportPlan(model.planId).map((record) => ({
      ...record,
      session: { ...record.session, prescriptionSnapshot: replaceLoadingMode(record.session.prescriptionSnapshot, "assisted_bodyweight") },
    }));
    const progress = projectCanonicalProgressPresentation({ status: "ready", plan: model, completedAggregates: records, evidence: canonicalProgressEvidenceRepository.list(model.planId), now });
    expect(progress.progressionHighlight).toBeUndefined();
    expect(progress.trend).toBeUndefined();
  });

  it("does not calculate estimated 1RM from calibration-only or invalid-effort work", () => {
    applyCanonicalProgressVisualState("established", { planId: "progress-estimate-guard" });
    const model = canonicalActivePlanState.getReadModel()!;
    const records = canonicalRecordedSessionLedger.exportPlan(model.planId);
    const calibration = records.map((record) => ({
      ...record,
      session: { ...record.session, prescriptionSnapshot: replaceLoadState(record.session.prescriptionSnapshot, "calibration_required") },
    }));
    const calibrationProjection = projectCanonicalProgressPresentation({ status: "ready", plan: model, completedAggregates: calibration, evidence: canonicalProgressEvidenceRepository.list(model.planId), now });
    expect(calibrationProjection.trend?.metric).not.toBe("e1rm");
    const invalidEffort = records.map((record) => ({ ...record, events: record.events.map((event) => event.type === "performance" ? { ...event, payload: { ...event.payload, effort: 99 } } : event) }));
    const invalidEffortProjection = projectCanonicalProgressPresentation({ status: "ready", plan: model, completedAggregates: invalidEffort, evidence: canonicalProgressEvidenceRepository.list(model.planId), now });
    expect(invalidEffortProjection.trend?.metric).not.toBe("e1rm");
    expect(JSON.stringify([calibrationProjection.trend, invalidEffortProjection.trend])).not.toMatch(/Estimated 1RM/i);
  });

  it("builds completed visual history with every prescribed set and plausible fake-clock duration", () => {
    applyCanonicalProgressVisualState("established", { planId: "progress-fixture-integrity" });
    const records = canonicalRecordedSessionLedger.exportPlan("progress-fixture-integrity");
    expect(records).toHaveLength(3);
    for (const record of records) {
      const slots = Array.isArray(record.session.prescriptionSnapshot.slots) ? record.session.prescriptionSnapshot.slots as Array<Record<string, unknown>> : [];
      const prescribed = slots.reduce((sum, slot) => { const settings = (slot.settings ?? {}) as Record<string, unknown>; return sum + Number(settings.requiredWorkSets ?? settings.requiredSets ?? 0); }, 0);
      const performed = effectiveCanonicalPerformedWork(record.events);
      const completedAt = record.events.find((event) => event.type === "completed")?.occurredAt;
      expect(record.session.status).toBe("completed");
      expect(prescribed).toBe(15);
      expect(performed).toHaveLength(prescribed);
      expect(performed.every((event) => event.payload.completion === "complete")).toBe(true);
      expect((Date.parse(completedAt!) - Date.parse(record.session.startedAt!)) / 60_000).toBeGreaterThanOrEqual(45);
      expect(performed.every((event) => Date.parse(event.occurredAt) > Date.parse(record.session.startedAt!) && Date.parse(event.occurredAt) < Date.parse(completedAt!))).toBe(true);
    }
  });

  it("does not duplicate an achievement after canonical state hydration", () => {
    applyCanonicalProgressVisualState("genuine_pr", { planId: "progress-relaunch" });
    const before = readCanonicalProgressPresentation({ now }).progressionHighlight;
    canonicalActivePlanState.hydrate();
    const after = readCanonicalProgressPresentation({ now }).progressionHighlight;
    expect(after).toEqual(before);
    expect(after?.sessionId).toBe("progress-relaunch:comparison:3");
  });

  it("explains an applied adaptive change with before, next and completed-training evidence", () => {
    applyCanonicalProgressVisualState("established", { planId: "progress-adaptation" });
    const model = canonicalActivePlanState.getReadModel()!;
    const decision = adaptationDecision(model.planId, model.revision, model.mesocycle.id);
    const progress = projectCanonicalProgressPresentation({
      status: "ready",
      plan: model,
      completedAggregates: canonicalRecordedSessionLedger.exportPlan(model.planId),
      evidence: canonicalProgressEvidenceRepository.list(model.planId),
      decision,
      now,
    });
    expect(progress.review).toMatchObject({
      title: "Your programme adapted",
      statusLabel: "Applied to future workouts",
      sourceLabel: "Adaptive coaching",
      applicationStatus: "applied",
      evidenceSummary: "3 comparable exposures · targets completed · recovery stable",
    });
    expect(progress.review?.changes).toEqual([{
      exerciseName: "Bench Press",
      before: "65 kg · 3 × 5 reps",
      after: "67.5 kg · 3 × 5 reps",
      reason: "Load progressed after 3 comparable workouts.",
    }]);
    expect(displayText(progress.review)).toContain("not a manual programme edit");
    expect(displayText(progress.review)).not.toMatch(/canonical|decision identity|evidence id/i);
  });

  it("keeps an applied adaptation visible after its decision has been consumed", () => {
    applyCanonicalAdaptationVisualState({ planId: "progress-consumed-adaptation" });
    const progress = readCanonicalProgressPresentation({ now });
    expect(progress.review).toMatchObject({
      title: "Your programme adapted",
      statusLabel: "Applied to future workouts",
      applicationStatus: "applied",
    });
    expect(progress.review?.changes[0]).toMatchObject({
      before: "65 kg · 3 × 5 reps",
      after: "67.5 kg · 3 × 5 reps",
    });
  });

  it("fails closed for recovery and storage errors", () => {
    const recoverable = projectCanonicalProgressPresentation({ status: "recoverable_error", plan: null });
    const storage = projectCanonicalProgressPresentation({ status: "storage_error", plan: null });
    expect(recoverable.primaryAction).toMatchObject({ type: "retry" });
    expect(recoverable.progressionHighlight).toBeUndefined();
    expect(storage.attention?.detail).toContain("No history has been overwritten");
  });

  it("keeps customer copy free of evaluator and internal state language", () => {
    applyCanonicalProgressVisualState("established", { planId: "progress-copy" });
    const text = displayText(readCanonicalProgressPresentation({ now }));
    expect(text).not.toMatch(/canonical|evaluator|evidence count|microcycle|mesocycle|decision identity|raw/i);
    expect(text).not.toContain("progress-copy");
  });
});

function replaceLoadingMode(snapshot: Readonly<Record<string, unknown>>, loadingMode: string): Readonly<Record<string, unknown>> {
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  return { ...snapshot, slots: slots.map((slot) => ({ ...slot, loadPrescription: { ...((slot.loadPrescription ?? {}) as Record<string, unknown>), loadingMode } })) };
}

function replaceLoadState(snapshot: Readonly<Record<string, unknown>>, state: string): Readonly<Record<string, unknown>> {
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  return { ...snapshot, slots: slots.map((slot) => ({ ...slot, loadPrescription: { ...((slot.loadPrescription ?? {}) as Record<string, unknown>), state } })) };
}

function displayText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(displayText).join(" ");
  if (!value || typeof value !== "object") return "";
  return Object.entries(value as Record<string, unknown>).filter(([key]) => !/(^id$|sessionId|exerciseId|planId|planRevision|contractVersion)/i.test(key)).map(([, item]) => displayText(item)).join(" ");
}

function adaptationDecision(planId: string, revision: number, mesocycleId: string): CanonicalProgressDecision {
  return {
    schemaVersion: "canonical_progress_decision_v1",
    decisionId: "adaptation-decision",
    planId,
    expectedPlanRevision: revision,
    macrocycleId: `${planId}:macrocycle`,
    mesocycleId,
    microcycleId: `${planId}:microcycle`,
    evaluationId: "adaptation-evaluation",
    evidenceIds: ["evidence-1", "evidence-2", "evidence-3"],
    outcome: "continue",
    owner: "mesocycle",
    reason: "comparable_training_progressed",
    explanation: "Your completed Bench Press work supported a small load increase for future sessions.",
    status: "current",
    phaseOne: {
      schemaVersion: "canonical_coaching_decision_details_v1",
      decisionType: "advance_microcycle",
      sourceRecordedSessionId: "progress-adaptation:comparison:3",
      sourcePrescriptionHash: "prescription-hash",
      reasonCodes: ["comparable_success_threshold_met"],
      evidenceSummary: { targetCompletion: "successful", comparableExposureCount: 3, repDropOff: false, recoveryEvidence: "stable", transitionEligible: false, deloadEligible: false },
      priorFutureSessionIds: ["future-session"],
      result: "future_prescription_change",
      boundedAdjustment: {
        kind: "construct_next_microcycle",
        exerciseIds: ["ex-bench-press"],
        numericLoadAdjustmentAuthorised: true,
        numericDecisions: [{
          schemaVersion: "canonical_numeric_prescription_decision_v1",
          policyId: "canonical_numeric_progression_policy_v1",
          outcome: "progress_load",
          comparableExposureKey: "bench-comparable",
          exerciseId: "ex-bench-press",
          planSessionIndex: 0,
          sessionRole: "Upper strength",
          constructionRole: "primary",
          exerciseRole: "primary_compound",
          lane: "strength",
          method: "straight_sets",
          progressionRule: "load_progression",
          evidenceIds: ["evidence-1", "evidence-2", "evidence-3"],
          exposureCount: 3,
          successfulExposureCount: 3,
          failedExposureCount: 0,
          reasonCode: "comparable_success_threshold_met",
          before: { prescribedBaseLoad: 65, exactTargets: [5, 5, 5] },
          after: { prescribedBaseLoad: 67.5, exactTargets: [5, 5, 5] },
          exactNumericDelta: { loadKg: 2.5, repetitions: [0, 0, 0] },
        }],
      },
      contextIdentity: { macrocycleId: `${planId}:macrocycle`, mesocycleId, microcycleId: `${planId}:microcycle` },
      decidedAt: "2026-07-18T11:00:00.000Z",
      idempotencyKey: "adaptation-idempotency",
    },
    phaseOneApplication: {
      schemaVersion: "canonical_coaching_application_receipt_v2",
      status: "applied",
      actualResult: "future_prescription_change",
      reasonCode: "numeric_progression_applied",
      explanation: "Your completed Bench Press work supported a small load increase for future sessions.",
      priorRevision: revision,
      newRevision: revision + 1,
      resultingFutureSessionIds: ["future-session"],
      materialDeltas: [{ schemaVersion: "canonical_material_prescription_delta_v1", sessionKey: "0:Upper strength:planned", slotKey: "0:ex-bench-press", field: "loadPrescription.prescribedBaseLoad", before: 65, after: 67.5 }],
      appliedAt: "2026-07-18T11:00:01.000Z",
    },
  };
}
