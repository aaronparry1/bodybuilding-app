import { describe, expect, it } from "vitest";
import { projectCanonicalCompletionSummary } from "@/application/training/canonical-completion-summary-presentation";
describe("canonical completion summary", () => {
  it("projects evidence-backed sets, exercises, duration and meaningful volume", () => {
    const session: any = { recordedSessionId: "s", role: "Push", createdAt: "2026-01-01T00:00:00.000Z", startedAt: "2026-01-01T00:00:00.000Z", prescriptionSnapshot: { slots: [{ id: "slot", method: "straight_sets" }] }, version: 2 };
    const events: any[] = [{ type: "performance", payload: { slotId: "slot", exerciseId: "e", load: 80, reps: 8, completion: "complete" } }, { type: "completed", occurredAt: "2026-01-01T00:45:00.000Z" }];
    expect(projectCanonicalCompletionSummary({ session, events, now: Date.parse("2026-01-01T00:45:00.000Z") })).toMatchObject({ title: "Workout complete", completion: "complete", completionLabel: "Full session completed", completedWorkingSets: 1, exercisesCompleted: 1, prescribedExercises: 1, totalVolume: 640, elapsedSeconds: 2700, methodsPerformed: ["Straight sets"] });
  });

  it("labels an honest early finish without presenting it as full completion", () => {
    const session: any = { recordedSessionId: "partial", role: "Lower", createdAt: "2026-01-01T00:00:00.000Z", prescriptionSnapshot: { slots: [{ id: "done" }, { id: "skipped" }] }, version: 2 };
    const events: any[] = [{ type: "performance", payload: { slotId: "done", exerciseId: "squat", load: 100, reps: 5, completion: "complete" } }, { type: "completed", occurredAt: "2026-01-01T00:20:00.000Z" }];
    expect(projectCanonicalCompletionSummary({ session, events })).toMatchObject({ completion: "partial", completionLabel: "Partial session saved", exercisesCompleted: 1, prescribedExercises: 2 });
  });
});
