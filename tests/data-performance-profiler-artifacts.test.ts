import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (name: string) => JSON.parse(readFileSync(`qa-reports/data-performance-profiler/${name}`, "utf8")) as any;

describe("data performance profiler evidence", () => {
  it("does not claim interactive profiling when the runtime was unavailable", () => {
    const environment = read("environment.json");
    const budgets = read("performance-budget-results.json");
    expect(environment.browser.interactiveAvailable).toBe(false);
    expect(budgets.status).toBe("not_certified");
    expect(budgets.longLivedAccountCertified).toBe(false);
  });

  it("keeps all fixture sizes explicit", () => {
    expect(read("serialization-profile.json").fixtureSizes).toEqual([0, 100, 500, 2000, 10000]);
  });

  it("does not claim iOS profiling when the local build is blocked", () => {
    const build = read("ios-build-result.json");
    expect(build.result).toBe("blocked");
    expect(build.binaryProduced).toBe(false);
    expect(build.launch).toBe("not_attempted");
  });
});
