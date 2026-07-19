import { beforeEach, describe, expect, it } from "vitest";
import { applyCanonicalPlanVisualState } from "@/application/design-qa/canonical-five-day-plan-fixture";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { readCanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { projectCanonicalPlanPresentation, readCanonicalPlanPresentation } from "@/application/training/canonical-plan-presentation";
import { loadPlannedSession } from "@/application/training/canonical-active-plan-application";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";

describe("athlete-facing canonical Plan presentation", () => {
  beforeEach(() => {
    canonicalActivePlanState.clear();
    canonicalRecordedSessionLedger.clear();
    canonicalProgressEvidenceRepository.clear();
  });

  it("shows the certified five-day schedule in order with exact read-only previews", () => {
    applyCanonicalPlanVisualState("planned", { planId: "plan-presentation-planned" });
    const before = JSON.stringify(canonicalActivePlanState.getReadModel());
    const plan = readCanonicalPlanPresentation();
    const after = JSON.stringify(canonicalActivePlanState.getReadModel());

    expect(plan.status).toBe("ready");
    expect(plan.schedule).toHaveLength(5);
    expect(plan.schedule.map((session) => session.programmePosition)).toEqual([1, 2, 3, 4, 5]);
    expect(plan.schedule.map((session) => session.status)).toEqual(["next", "upcoming", "upcoming", "upcoming", "upcoming"]);
    expect(plan.schedule[0]).toMatchObject({ name: "Push strength and hypertrophy", exerciseCount: 5, workingSetCount: 15, statusLabel: "Next" });
    expect(plan.schedule[0]!.preview.exercises.map((exercise) => exercise.name)).toEqual(["Bench Press", "Decline Plate Loaded Press", "Chest Supported Row", "Rope Overhead Triceps Extension", "Cable Lateral Raise"]);
    expect(plan.schedule[0]!.preview.exercises[0]!.sets).toHaveLength(4);
    expect(plan.primaryAction).toMatchObject({ type: "open_planned_session", label: "Start next workout", planId: "plan-presentation-planned", planRevision: 0 });
    expect(after).toBe(before);
  });

  it("keeps an active workout in programme position and agrees with Home and Train", () => {
    applyCanonicalPlanVisualState("active", { planId: "plan-presentation-active" });
    const model = canonicalActivePlanState.getReadModel()!;
    const plan = readCanonicalPlanPresentation();
    const home = readCanonicalHomeProjection({ now: Date.parse("2026-07-18T10:01:00.000Z") });
    const active = plan.schedule[0]!;

    expect(active).toMatchObject({ programmePosition: 1, status: "active", statusLabel: "In progress" });
    expect(plan.primaryAction).toMatchObject({ type: "resume_recorded_session", sessionId: model.activeRecordedSession?.recordedSessionId });
    expect(home.primary).toMatchObject({ kind: "active", title: active.name });
    expect(model.activeRecordedSession?.recordedSessionId).toBe(active.id);
  });

  it("derives completed, next and upcoming states without losing the first session", () => {
    applyCanonicalPlanVisualState("partial_week", { planId: "plan-presentation-partial" });
    const model = canonicalActivePlanState.getReadModel()!;
    const plan = readCanonicalPlanPresentation();

    expect(plan.schedule.map((session) => session.status)).toEqual(["completed", "next", "upcoming", "upcoming", "upcoming"]);
    expect(plan.schedule[0]!.programmePosition).toBe(1);
    expect(plan.primaryAction).toMatchObject({ type: "open_planned_session", sessionId: model.nextSession?.id });
    expect(loadPlannedSession(model.nextSession!.id)?.planSessionIndex).toBe(1);
  });

  it("shows a completed week with no invented workout action", () => {
    applyCanonicalPlanVisualState("phase_completed", { planId: "plan-presentation-complete" });
    const plan = readCanonicalPlanPresentation();
    expect(plan.schedule).toHaveLength(5);
    expect(plan.schedule.every((session) => session.status === "completed")).toBe(true);
    expect(plan.primaryAction).toBeUndefined();
    expect(plan.subtitle).toContain("week is complete");
  });

  it("labels only approved successor directions as reviewed rather than guaranteed", () => {
    applyCanonicalPlanVisualState("planned", { planId: "plan-presentation-roadmap" });
    const plan = readCanonicalPlanPresentation();
    const next = plan.roadmap.find((item) => item.state === "reviewed_next");
    expect(next).toMatchObject({ label: "Reviewed next" });
    expect(next?.detail).toMatch(/review decides|guide what follows/i);
    expect(JSON.stringify(plan.roadmap)).not.toMatch(/guaranteed|automatic/i);
  });

  it("fails closed with one customer-facing recovery action and supports no-plan", () => {
    const recoverable = projectCanonicalPlanPresentation({ status: "recoverable_error", model: null });
    const empty = projectCanonicalPlanPresentation({ status: "empty", model: null });
    const storage = projectCanonicalPlanPresentation({ status: "storage_error", model: null });
    expect(recoverable.primaryAction).toMatchObject({ type: "retry" });
    expect(recoverable.schedule).toEqual([]);
    expect(empty.primaryAction).toMatchObject({ type: "setup_plan" });
    expect(storage.attention?.detail).toContain("Nothing has been overwritten");
  });

  it("contains no architecture dump or forbidden filler in customer copy", () => {
    applyCanonicalPlanVisualState("planned", { planId: "plan-copy" });
    const text = displayText(readCanonicalPlanPresentation());
    expect(text).not.toMatch(/canonical|macrocycle|mesocycle|microcycle|Current training phase|Next actionable session/i);
    expect(text).not.toContain("plan-copy");
  });
});

function displayText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(displayText).join(" ");
  if (!value || typeof value !== "object") return "";
  return Object.entries(value as Record<string, unknown>).filter(([key]) => !/(^id$|sessionId|exerciseId|planId|planRevision|contractVersion)/i.test(key)).map(([, item]) => displayText(item)).join(" ");
}
