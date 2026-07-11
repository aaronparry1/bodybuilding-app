import { describe, expect, it } from "vitest";
import { resolveCanonicalLoadEvidence } from "@/domain/training/load-evidence-resolver";

const summary = (id: string, date: string, load: number, sets = 3, kind: "planned" | "extra_full" = "planned") => ({ sessionId: id, completedAt: date, cardioLog: undefined, sessionKind: kind, exerciseSummaries: [{ sessionId: id, completedAt: date, exerciseId: "bench", exerciseName: "Bench", load, nextRecommendedLoad: load + 2.5, setsCompleted: sets, bestSetReps: 10 }] } as any);

describe("canonical load evidence", () => {
  it("uses the newest matching exercise across multiple sessions even when stored out of order", () => {
    const result = resolveCanonicalLoadEvidence([summary("new", "2026-07-03", 100), summary("old", "2026-07-01", 90)], "bench");
    expect(result?.load).toBe(102.5);
  });
  it("ignores cardio and zero-set records", () => {
    const cardio = { ...summary("cardio", "2026-07-04", 200), cardioLog: { sessionType: "recovery_cardio" } };
    expect(resolveCanonicalLoadEvidence([cardio, summary("zero", "2026-07-03", 150, 0), summary("valid", "2026-07-02", 80)], "bench")?.load).toBe(82.5);
  });
  it("returns no record for a swapped exercise with no own history", () => {
    expect(resolveCanonicalLoadEvidence([summary("bench", "2026-07-03", 100)], "row")).toBeNull();
  });
  it("returns the same answer regardless of planned or extra session kind", () => {
    expect(resolveCanonicalLoadEvidence([summary("extra", "2026-07-03", 70, 3, "extra_full")], "bench")?.load).toBe(72.5);
  });
});
