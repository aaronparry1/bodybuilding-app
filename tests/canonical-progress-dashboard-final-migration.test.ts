import { describe, expect, it } from "vitest";
import { projectCanonicalProgressDashboard } from "@/domain/training/canonical-progress-dashboard-projection";
import { resolveCanonicalMesocycleVolumePolicy } from "@/domain/training/canonical-mesocycle-volume-policy";
import { resolveCanonicalMicrocycleRotationPolicy } from "@/domain/training/canonical-microcycle-rotation-policy";
import { projectCanonicalSessionConstructionDisplay } from "@/domain/training/canonical-session-construction-display-projection";

describe("canonical dashboard final migration cases", () => {
  it("batch7:volume-review projects bounded policy without exact prescription", () => {
    const policy = resolveCanonicalMesocycleVolumePolicy({ planId: "p", mesocycleId: "m", purpose: "hypertrophy_base", policyProgression: "increase", recoveryAdjustment: "permitted", evidenceIds: ["e"], evidenceState: "fresh", fatigue: "stable" });
    expect(policy.disposition).toBe("review_required");
    expect(policy).not.toHaveProperty("sets");
  });
  it("batch7:rotation-review uses canonical edge facts only", () => {
    const policy = resolveCanonicalMicrocycleRotationPolicy({ microcycleId: "micro:1", mesocycleId: "meso:1", macrocycleId: "macro:1", frequency: 4, roleSignature: ["upper"], stressSignature: ["normal"], approvedEdges: [], evidenceIds: ["e"], evidenceState: "fresh", fatigue: "stable", requestedAdvance: true, compatible: true });
    expect(policy.disposition).toBe("unsupported_policy");
  });
  it("batch7:session-display resolves catalogue metadata without raw IDs", () => {
    const snapshot = { schemaVersion: "canonical_session_snapshot_v2", sessionId: "s", role: "upper", provenance: { inputVersion: "v1" }, slots: [{ index: 0, exerciseId: "e", method: "straight_sets", loadingMode: "bodyweight" }] } as never;
    const result = projectCanonicalSessionConstructionDisplay(snapshot, [{ id: "e", name: "Bench Press" } as never]);
    expect(result.status === "ready" && result.projection.slots[0]?.exerciseName).toBe("Bench Press");
  });
});
