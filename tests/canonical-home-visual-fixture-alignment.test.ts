import { beforeEach, describe, expect, it } from "vitest";
import {
  applyCanonicalHomeVisualState,
  constructCanonicalFiveDayFixture,
} from "@/application/design-qa/canonical-five-day-plan-fixture";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { readCanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";

describe("canonical Home visual fixture alignment", () => {
  beforeEach(() => {
    canonicalActivePlanState.clear();
    canonicalRecordedSessionLedger.clear();
    canonicalProgressEvidenceRepository.clear();
  });

  it("matches the certified five-day workout identity, exercises, exact targets and working sets", () => {
    const planId = "canonical-home-visual-alignment";
    const certified = constructCanonicalFiveDayFixture(planId);
    expect(certified.status).toBe("constructed");
    if (certified.status !== "constructed") return;
    const expected = certified.carrier.plannedSessions[0]!;
    const visual = applyCanonicalHomeVisualState("planned", { planId });
    const actual = visual.plannedSessions.find((session) => session.id === visual.nextSession?.id)!;

    expect(actual.id).toBe(expected.id);
    expect(actual.role).toBe(expected.role);
    expect(snapshotSignature(actual.snapshot)).toEqual(snapshotSignature(expected.prescriptionSnapshot));
    expect(snapshotSignature(actual.snapshot)).toMatchObject({
      exerciseIds: ["ex-bench-press", "ex-decline-plate-loaded-press", "ex-chest-supported-row", "ex-cable-rope-overhead-extension", "ex-cable-lateral-raise"],
      requiredWorkSets: [4, 3, 3, 3, 2],
      totalWorkingSets: 15,
    });

    const home = readCanonicalHomeProjection();
    expect(home.primary).toMatchObject({ kind: "planned", title: "Push strength and hypertrophy", workout: { exerciseCount: 5, workingSetCount: 15 } });
  });

  it("creates active, paused and fully completed states through the canonical ledger", () => {
    applyCanonicalHomeVisualState("active", { planId: "home-active", now: "2026-07-18T10:00:00.000Z" });
    expect(readCanonicalHomeProjection({ now: Date.parse("2026-07-18T10:01:00.000Z") }).primary).toMatchObject({ kind: "active", workout: { lifecycle: "active", completedSetCount: 1, workingSetCount: 15 } });

    applyCanonicalHomeVisualState("paused", { planId: "home-paused", now: "2026-07-18T10:00:00.000Z" });
    expect(readCanonicalHomeProjection({ now: Date.parse("2026-07-18T10:01:00.000Z") }).primary).toMatchObject({ kind: "active", ctaLabel: "Resume workout", workout: { lifecycle: "paused", completedSetCount: 1, workingSetCount: 15 } });

    applyCanonicalHomeVisualState("completed", { planId: "home-completed", now: "2026-07-18T10:00:00.000Z" });
    const completed = readCanonicalHomeProjection({ now: Date.parse("2026-07-18T10:01:00.000Z") });
    expect(completed.primary).toMatchObject({ kind: "completed_today", detail: expect.stringContaining("15 working sets") });
    expect(completed.progress).toMatchObject({ historicalCount: 1, reviewAvailable: true });
    expect(completed.actions.some((action) => action.type === "open_planned_session")).toBe(true);
  });
});

function snapshotSignature(snapshot: Readonly<Record<string, unknown>>) {
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const requiredWorkSets = slots.map((slot) => Number(((slot.settings ?? {}) as Record<string, unknown>).requiredWorkSets ?? 0));
  return {
    schemaVersion: snapshot.schemaVersion,
    sessionId: snapshot.sessionId,
    role: snapshot.role,
    exerciseIds: slots.map((slot) => String(slot.exerciseId)),
    exactTargets: slots.map((slot) => slot.exactTargets),
    requiredWorkSets,
    totalWorkingSets: requiredWorkSets.reduce((sum, sets) => sum + sets, 0),
  };
}
