import { describe, expect, it } from "vitest";
import { runCanonicalPipelineCertification } from "@/../qa-reports/legacy-migration-change-control/canonical-certification-evidence";

describe("canonical certification evidence connection", () => {
  it("executes real producers through one certification entry point", () => {
    const result = runCanonicalPipelineCertification();
    expect(result.predicates.orchestration_matrix_passed).toBe(true);
    expect(result.predicates.repository_roundtrip_passed).toBe(true);
    expect(result.predicates.atomic_failures_contained).toBe(true);
    expect(result.productionSwitchCompleted).toBe(false);
  });
});
