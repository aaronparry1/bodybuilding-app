import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "qa-reports/release-readiness";
const read = (file: string) => JSON.parse(readFileSync(`${root}/${file}`, "utf8")) as any;

describe("operational release readiness", () => {
  it("keeps roles, gates, and derived readiness honest", () => {
    const operational = read("operational-release-readiness.json");
    const roles = read("release-role-matrix.json");
    const gates = read("go-no-go-gate-matrix.json");
    expect(roles.assignedAndVerified).toBe(false);
    expect(roles.roles.every((role: any) => role.assignment !== "assigned and verified")).toBe(true);
    expect(operational.rolesAssigned).toBe(false);
    expect(gates.readyForReleaseCandidateBuild).toBe(false);
    expect(operational.readyForReleaseCandidateBuild).toBe(false);
    expect(operational.deploymentAuthorized).toBe(false);
  });

  it("keeps rollback and rollout non-authoritative", () => {
    const rollback = read("rollback-plan.json");
    const rollout = read("staged-rollout-plan.json");
    const monitoring = read("monitoring-readiness.json");
    expect(rollback.status).toBe("documented_not_executed");
    expect(rollback.constraints).toEqual(expect.arrayContaining(["never restore legacy authority", "never enable ordinary-v2 authority"]));
    expect(rollout.executed).toBe(false);
    expect(rollout.status).toBe("proposed_requires_approval");
    expect(monitoring.monitoringReady).toBe(false);
  });
});
