import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical cloud recorded-session transport boundary", () => {
  it("uses canonical ledger backup/restore and does not import legacy workout repositories", () => {
    const source = readFileSync(resolve(process.cwd(), "src/application/sync/cloud-data-sync.ts"), "utf8");
    expect(source).toContain("canonicalRecordedSessionLedger.exportPlan");
    expect(source).toContain("canonicalRecordedSessionLedger.restorePlan");
    expect(source).not.toContain('from "@/data/local/workout-session-repository"');
    expect(source).not.toContain('from "@/data/local/active-training-plan-repository"');
    expect(source).not.toContain("localWorkoutRepository.list()");
    expect(source).not.toContain("localWorkoutRepository.save");
  });
});
