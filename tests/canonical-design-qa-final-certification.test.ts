import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { certifyCanonicalDesignQaMatrix } from "@/application/design-qa/canonical-design-qa-final-certification";

describe("final canonical Design-QA certification", () => {
  it("certifies the complete declared matrix and publishes deterministic evidence", () => {
    const result = certifyCanonicalDesignQaMatrix();
    expect(result.fixtureCount).toBe(86);
    expect(result.familyCounts).toEqual({ plan_state: 13, session_lifecycle: 37, progress_decision: 36 });
    expect(result.uniqueIds).toBe(true);
    expect(result.allCanonicalSetup).toBe(true);
    expect(result.designQaCanonicalMatrixComplete).toBe(true);
    expect(result.designQaLegacyReachabilityZero).toBe(true);
    expect(result.pipelineReadyForSwitch).toBe(true);
    expect(result.productionSwitchCompleted).toBe(false);
    writeFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-design-qa-final-certification.json"), `${JSON.stringify({ schemaVersion: "canonical_design_qa_final_certification_v1", ...result }, null, 2)}\n`);
  });
});
