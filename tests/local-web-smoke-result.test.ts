import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("local web smoke evidence", () => {
  it("distinguishes server reachability from browser smoke", () => {
    const result = JSON.parse(readFileSync("qa-reports/release-readiness/local-web-smoke-result.json", "utf8"));
    expect(result.server.status).toBe("started");
    expect(result.server.httpStatus).toBe(200);
    expect(result.server.shutdown).toBe("completed");
    expect(result.webManualSmokeVerified).toBe(false);
    expect(result.webCasesPassed).toBe(0);
    expect(result.deploymentAuthorized).toBe(false);
  });
});
