import { describe, expect, it } from "vitest";
import { processCoachingEvidence } from "@/domain/training/coaching-evidence-engine";

describe("coaching evidence engine", () => {
  it("creates training-evidence provenance without restoring living-athlete model terminology", () => {
    const result = processCoachingEvidence({
      currentDate: "2026-07-11T12:00:00.000Z",
      raw_evidence: [
        { sessionId: "session-1", occurredAt: "2026-07-10T12:00:00.000Z", signal: "performance_improved" },
        { sessionId: "session-2", occurredAt: "2026-07-11T12:00:00.000Z", signal: "performance_improved" },
      ],
    });

    expect(result.update_proposals).toHaveLength(1);
    expect(result.reason_codes).toContain("training_evidence_proposal_created");
    expect(result.reason_codes).not.toContain("living_athlete_model_update_proposed");
  });
});
