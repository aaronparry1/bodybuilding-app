import { describe, expect, it } from "vitest";
import { certifyCanonicalPipelineEvidence, REQUIRED_CANONICAL_EVIDENCE, type CanonicalEvidence } from "@/domain/training/canonical-session-construction-certification";

const evidence = Object.fromEntries(REQUIRED_CANONICAL_EVIDENCE.map((name) => [name, { evidenceVersion: "canonical_pipeline_evidence_v1", producer: name, caseIds: [`${name}:case-1`], passed: true }])) as Record<string, CanonicalEvidence>;

describe("canonical pipeline certification integration", () => {
  it("derives readiness only from executed evidence", () => {
    const result = certifyCanonicalPipelineEvidence(evidence);
    expect(result.pipelineReadyForSwitch).toBe(true);
    expect(result.productionSwitchCompleted).toBe(false);
  });
  it.each([
    ["missing evidence", () => { const copy = { ...evidence }; delete copy.orchestration_matrix_passed; return copy; }],
    ["duplicate case", () => ({ ...evidence, repository_roundtrip_passed: { ...evidence.repository_roundtrip_passed!, caseIds: ["same", "same"] } })],
    ["failed case", () => ({ ...evidence, atomic_failures_contained: { ...evidence.atomic_failures_contained!, passed: false, firstFailure: { caseId: "fault-1", reason: "write_failed" } } })],
  ])("fails closed for %s", (_label, mutate) => {
    const result = certifyCanonicalPipelineEvidence(mutate());
    expect(result.pipelineReadyForSwitch).toBe(false);
    expect(result.blockers.length).toBeGreaterThan(0);
  });
});
