import { describe, expect, it } from "vitest";
import { createMacrocycle } from "@/domain/training/macrocycle-engine";
import { selectMesocycles } from "@/domain/training/mesocycle-library";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";
import { assembleCanonicalActivePlan, compareCanonicalActivePlans, parseCanonicalActivePlan, serializeCanonicalActivePlan } from "@/domain/training/canonical-active-plan-carrier";

function fixture() {
  const macrocycle = createMacrocycle("build_muscle_and_strength", "intermediate", undefined, "2026-01-01T00:00:00.000Z");
  const mesocycle = selectMesocycles("powerbuilding", "intermediate")[0]!;
  const microcycle = createMicrocycle({ parentMesocycleId: mesocycle.id, trainingDays: 5, split: "upper_lower" });
  return assembleCanonicalActivePlan({
    planId: "carrier-fixture",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    macrocycle,
    mesocycle,
    microcycle: { ...microcycle, id: "carrier-fixture:microcycle:1", constructionVersion: "microcycle_v1" },
    plannedSessions: microcycle.sessionRoles.map((role, planSessionIndex) => ({ id: `session-${planSessionIndex}`, microcycleId: "carrier-fixture:microcycle:1", planSessionIndex, role, kind: "planned" as const, status: "planned" as const, constructionVersion: "session_construction_v1", revision: 0, prescriptionSnapshot: { owner: "Session Construction", slots: [] } })),
    progress: { evidenceVersion: "progress_v1", revision: 0 },
    constraints: { goal: "strength_hypertrophy", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "upper_lower", equipment: ["barbell", "dumbbell"], units: "kg" },
  });
}

describe("canonical active-plan carrier", () => {
  it("assembles canonical owner outputs without making decisions", () => {
    const result = fixture();
    expect(result.status).toBe("valid");
    if (result.status === "valid") {
      expect(result.carrier.schema).toBe("canonical_plan_v2");
      expect(result.carrier.macrocycle.owner).toBe("Macrocycle");
      expect(result.carrier.mesocycle.owner).toBe("Mesocycle");
      expect(result.carrier.microcycle.owner).toBe("Microcycle");
      expect(result.carrier.plannedSessions).toHaveLength(5);
      expect(result.carrier).not.toHaveProperty("blocks");
      expect(result.carrier).not.toHaveProperty("activeBlockId");
    }
  });

  it("round-trips deterministically", () => {
    const result = fixture();
    expect(result.status).toBe("valid");
    if (result.status === "valid") {
      const serialized = serializeCanonicalActivePlan(result.carrier);
      expect(serializeCanonicalActivePlan(result.carrier)).toBe(serialized);
      expect(parseCanonicalActivePlan(serialized)).toEqual(result);
      expect(compareCanonicalActivePlans(result.carrier, result.carrier)).toEqual({ status: "equivalent" });
    }
  });

  it("rejects incomplete v2 prescription snapshots", () => {
    const result = fixture();
    expect(result.status).toBe("valid");
    if (result.status !== "valid") return;
    const invalid = { ...result.carrier, plannedSessions: [{ ...result.carrier.plannedSessions[0], prescriptionSnapshot: { schemaVersion: "canonical_session_snapshot_v2", sessionId: "s", role: "primary", slots: [] } }] };
    expect(parseCanonicalActivePlan(JSON.stringify(invalid))).toEqual({ status: "invalid", reason: "invalid_prescription_snapshot", path: "plannedSessions.0.prescriptionSnapshot" });
  });

  it.each<[string, Record<string, unknown>]>([
    ["blocks", { blocks: [] }],
    ["activeBlockId", { activeBlockId: "legacy" }],
    ["duplicate session IDs", { duplicate: "id" }],
  ])("fails closed for %s", (_label, mutation) => {
    const result = fixture();
    expect(result.status).toBe("valid");
    if (result.status !== "valid") return;
    const invalid = mutation.duplicate
      ? { ...result.carrier, plannedSessions: [result.carrier.plannedSessions[0], result.carrier.plannedSessions[0]] }
      : { ...result.carrier, ...mutation };
    expect((parseCanonicalActivePlan(JSON.stringify(invalid))).status).toBe("invalid");
  });
});
