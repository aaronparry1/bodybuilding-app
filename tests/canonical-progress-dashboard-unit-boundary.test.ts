import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
describe("canonical dashboard unit boundary", () => { it("contains no legacy dashboard builder/context references", () => { const source = readFileSync("tests/progress-dashboard.test.ts", "utf8"); expect(source).not.toContain("buildProgressDashboardViewModel"); expect(source).not.toContain("resolveCurrentProgressContext"); expect(source).not.toContain("ActiveTrainingPlan"); expect(source).not.toContain("activeBlockId"); }); });
