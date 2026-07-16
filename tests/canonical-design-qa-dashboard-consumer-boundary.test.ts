import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Design-QA dashboard consumer boundary", () => {
  it("contains no legacy dashboard/context consumer or dashboard-only legacy fields", () => {
    const source = readFileSync(resolve(process.cwd(), "tests/design-qa-fixtures.test.ts"), "utf8");
    for (const forbidden of ["buildProgressDashboardViewModel", "resolveCurrentProgressContext"]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
