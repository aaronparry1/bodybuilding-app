import { describe, expect, it } from "vitest";
import {
  CANONICAL_SUPERSET_AUTHORITY_COMPARISON_VERSION,
  runCanonicalSupersetAuthorityComparison,
} from "@/application/design-qa/canonical-superset-authority-comparison";

describe("antagonist-superset generic, shadow and certification comparison", () => {
  const rows = runCanonicalSupersetAuthorityComparison();

  it("covers the complete frozen matrix with no unexplained disagreement", () => {
    expect(rows).toHaveLength(11);
    expect(rows.every((row) => row.schemaVersion === CANONICAL_SUPERSET_AUTHORITY_COMPARISON_VERSION)).toBe(true);
    expect(rows.every((row) => row.disagreementClassification !== undefined)).toBe(true);
    expect(rows.every((row) => row.safety === "passed" && row.reconstruction === "identical")).toBe(true);
  });

  it("keeps generic authority out of grouped-method mutation and applies certification exactly once", () => {
    expect(rows.every((row) => row.genericDecision === "phase_prohibited")).toBe(true);
    expect(rows.filter((row) => row.certificationDecision === "applied")).toHaveLength(6);
    expect(rows.filter((row) => row.certificationDecision === "held")).toHaveLength(5);
    expect(rows.every((row) => row.receiptAvailable === (row.certificationDecision === "applied"))).toBe(true);
  });

  it("classifies every applied difference as an intended bounded method improvement", () => {
    const differences = rows.filter((row) => !row.agreement);
    expect(differences).toHaveLength(6);
    expect(differences.every((row) => row.disagreementClassification === "intended_method_specific_improvement")).toBe(true);
    expect(differences.every((row) => Math.abs(row.workloadDeltaRepetitions) <= 6)).toBe(true);
    expect(differences.every((row) => row.durationDeltaMinutes >= 0 && row.durationDeltaMinutes <= 1)).toBe(true);
  });

  it("never combines a generic and method-specific application", () => {
    expect(rows.every((row) => !(row.genericDecision !== "phase_prohibited" && row.certificationDecision === "applied"))).toBe(true);
  });
});
