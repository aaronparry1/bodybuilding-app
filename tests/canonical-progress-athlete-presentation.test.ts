import { beforeEach, describe, expect, it } from "vitest";
import { applyCanonicalHomeVisualState, applyCanonicalProgressVisualState } from "@/application/design-qa/canonical-five-day-plan-fixture";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { projectCanonicalProgressPresentation, readCanonicalProgressPresentation } from "@/application/training/canonical-progress-presentation";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";

const now = Date.parse("2026-07-18T12:00:00.000Z");

describe("athlete-facing canonical Progress presentation", () => {
  beforeEach(() => {
    canonicalActivePlanState.clear();
    canonicalRecordedSessionLedger.clear();
    canonicalProgressEvidenceRepository.clear();
  });

  it("shows an honest zero-history state and excludes merely started work", () => {
    applyCanonicalHomeVisualState("active", { planId: "progress-started-only", now: "2026-07-18T10:00:00.000Z" });
    const progress = readCanonicalProgressPresentation({ now });
    expect(progress.status).toBe("zero");
    expect(progress.overview).toBeUndefined();
    expect(progress.progressionHighlight).toBeUndefined();
    expect(progress.trend).toBeUndefined();
    expect(progress.nextWorkout?.action).toMatchObject({ type: "open_planned_session", planId: "progress-started-only", planRevision: 2 });
    expect(JSON.stringify(progress)).not.toMatch(/On track|evidence count|refresh/i);
  });

  it("shows one completed workout as early history without a single-point trend", () => {
    applyCanonicalProgressVisualState("one_completed", { planId: "progress-one" });
    const progress = readCanonicalProgressPresentation({ now });
    expect(progress.status).toBe("early");
    expect(progress.overview).toMatchObject({ completedWorkouts: 1 });
    expect(progress.recentTraining).toHaveLength(1);
    expect(progress.recentTraining[0]!.detail).toBe("11 of 11 working sets completed · 45 min");
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
    expect(progress.recentTraining.every((session) => session.detail.startsWith("11 of 11 working sets completed · "))).toBe(true);
    expect(progress.recentTraining.every((session) => session.action.label === "View workout")).toBe(true);
    expect(new Set(progress.recentTraining.map((session) => session.id)).size).toBe(progress.recentTraining.length);
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
      expect(prescribed).toBe(11);
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
