import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveCanonicalCycleBoundary } from "@/domain/training/canonical-cycle-boundary-resolution";
import { mesocycleLibrary } from "@/domain/training/mesocycle-library";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";

describe("independent final P0 recertification", () => {
  it("derives and resolves the complete boundary equivalence space from production policy", () => {
    const executed: string[] = [];
    for (const mesocycle of mesocycleLibrary) {
      const resolved = resolveMesocyclePrescriptionPolicy(mesocycle.id, { goal: goalFor(mesocycle.engine) });
      expect(resolved.status, mesocycle.id).toBe("resolved");
      if (resolved.status !== "resolved") continue;
      const counts = [...new Set([
        0,
        Math.max(0, mesocycle.defaultWeeks - 1),
        mesocycle.defaultWeeks,
        Math.max(0, mesocycle.maximumWeeks - 1),
        mesocycle.maximumWeeks,
      ])].sort((left, right) => left - right);

      for (const targetCompletion of ["successful", "partial", "failed"] as const) {
        const ordinary = resolveCanonicalCycleBoundary({
          microcycleComplete: false,
          completedMicrocyclesInMesocycle: mesocycle.maximumWeeks,
          mesocycle,
          policy: resolved.policy,
          targetCompletion,
        });
        expect(ordinary.status, `${mesocycle.id}:ordinary:${targetCompletion}`).toBe("not_at_boundary");
        executed.push(`${mesocycle.id}:ordinary:${targetCompletion}`);
      }

      for (const targetCompletion of ["partial", "failed"] as const) {
        for (const completed of [...new Set([0, mesocycle.defaultWeeks, mesocycle.maximumWeeks])]) {
          const incomplete = resolveCanonicalCycleBoundary({
            microcycleComplete: true,
            completedMicrocyclesInMesocycle: completed,
            mesocycle,
            policy: resolved.policy,
            targetCompletion,
          });
          expect(incomplete.status, `${mesocycle.id}:${targetCompletion}:${completed}`).toBe("continue_current_phase");
          executed.push(`${mesocycle.id}:${targetCompletion}:${completed}`);
        }
      }

      for (const availability of ["declared", "unavailable"] as const) {
        const policy = availability === "declared"
          ? resolved.policy
          : { ...resolved.policy, transition: { ...resolved.policy.transition, approvedSuccessors: [] } };
        for (const completed of counts) {
          const result = resolveCanonicalCycleBoundary({
            microcycleComplete: true,
            completedMicrocyclesInMesocycle: completed,
            mesocycle,
            policy,
            targetCompletion: "successful",
          });
          expect(["continue_current_phase", "transition_approved", "review_required"]).toContain(result.status);
          if (result.status === "transition_approved") {
            expect(availability).toBe("declared");
            expect(resolved.policy.transition.approvedSuccessors).toContain(result.successorMesocycleId);
            expect(mesocycle.nextStates).toContain(result.successorMesocycleId);
          }
          if (availability === "unavailable" && completed >= mesocycle.maximumWeeks) {
            expect(result).toMatchObject({
              status: "review_required",
              missingFact: "approved_successor",
              currentProgrammeSafelyUsable: false,
            });
          }
          executed.push(`${mesocycle.id}:successful:${availability}:${completed}`);
        }
      }
    }

    expect(mesocycleLibrary).toHaveLength(22);
    expect(executed).toHaveLength(394);
    expect(new Set(executed).size).toBe(executed.length);
  });

  it("keeps the independent recertification artifacts consistent with executable evidence", () => {
    const reportDirectory = join(
      process.cwd(),
      "qa-reports/coaching-loop-final-p0-independent-recertification",
    );
    const requiredArtifacts = [
      "executive-summary.md",
      "semantic-identity-certification.md",
      "field-isolation-results.json",
      "boundary-space-derivation.md",
      "exhaustive-boundary-results.json",
      "exhaustive-boundary-results.md",
      "post-cas-reconciliation-certification.md",
      "crash-window-results.json",
      "crash-window-results.md",
      "longitudinal-results.json",
      "longitudinal-results.md",
      "material-application-classification.md",
      "authority-and-reachability.md",
      "screen-consistency-results.md",
      "protected-baseline-regressions.md",
      "remaining-findings.md",
    ];

    for (const artifact of requiredArtifacts) {
      expect(existsSync(join(reportDirectory, artifact)), artifact).toBe(true);
    }

    const fields = readArtifact<{
      verdict: string;
      requestedCases: number;
      generatedIdentityOnlyApplicationCount: number;
      semanticallyFalseDeltaCount: number;
      semanticallyFalseApplicationCount: number;
    }>(reportDirectory, "field-isolation-results.json");
    expect(fields).toMatchObject({
      verdict: "PROVEN",
      requestedCases: 30,
      generatedIdentityOnlyApplicationCount: 0,
      semanticallyFalseDeltaCount: 0,
      semanticallyFalseApplicationCount: 0,
    });

    const boundaries = readArtifact<{
      verdict: string;
      mesocycleCount: number;
      uniqueEquivalenceCasesExecuted: number;
      ordinaryCases: number;
      partialOrFailedBoundaryCases: number;
      successfulBoundaryCases: number;
      inventedSuccessorEdges: number;
      permanentDeadlocks: number;
    }>(reportDirectory, "exhaustive-boundary-results.json");
    expect(boundaries).toMatchObject({
      verdict: "PROVEN",
      mesocycleCount: 22,
      uniqueEquivalenceCasesExecuted: 394,
      inventedSuccessorEdges: 0,
      permanentDeadlocks: 0,
    });
    expect(
      boundaries.ordinaryCases
      + boundaries.partialOrFailedBoundaryCases
      + boundaries.successfulBoundaryCases,
    ).toBe(boundaries.uniqueEquivalenceCasesExecuted);

    const crashWindows = readArtifact<{
      verdict: string;
      pathsTested: number;
      convergedPaths: number;
      nonConvergingPaths: number;
      duplicateApplications: number;
      contradictoryReceipts: number;
    }>(reportDirectory, "crash-window-results.json");
    expect(crashWindows).toMatchObject({
      verdict: "PROVEN",
      pathsTested: 13,
      convergedPaths: 13,
      nonConvergingPaths: 0,
      duplicateApplications: 0,
      contradictoryReceipts: 0,
    });

    const longitudinal = readArtifact<{
      verdict: string;
      freshRunCount: number;
      semanticDeterminism: boolean;
      scenarioCount: number;
      scenariosReachingTwelveWeeks: number;
      materialApplicationsPerRun: number;
      explicitNoChangePerRun: number;
      numericProgressionsPerRun: number;
      numericRegressionsPerRun: number;
      missedNumericAdaptationOpportunitiesPerRun: number;
      transactionCategoryCountsPerRun: Readonly<Record<string, number>>;
      noChangeReasonCountsPerRun: Readonly<Record<string, number>>;
      scenarios: readonly Readonly<{ sessions: number; applied: number; unchanged: number }>[];
    }>(reportDirectory, "longitudinal-results.json");
    expect(longitudinal).toMatchObject({
      verdict: "PROVEN",
      freshRunCount: 2,
      semanticDeterminism: true,
      scenarioCount: 12,
      scenariosReachingTwelveWeeks: 12,
      materialApplicationsPerRun: 155,
      explicitNoChangePerRun: 493,
      numericProgressionsPerRun: 0,
      numericRegressionsPerRun: 0,
      missedNumericAdaptationOpportunitiesPerRun: 452,
    });
    expect(sum(Object.values(longitudinal.transactionCategoryCountsPerRun))).toBe(
      longitudinal.materialApplicationsPerRun,
    );
    expect(sum(Object.values(longitudinal.noChangeReasonCountsPerRun))).toBe(
      longitudinal.explicitNoChangePerRun,
    );
    expect(sum(longitudinal.scenarios.map((scenario) => scenario.sessions))).toBe(
      longitudinal.materialApplicationsPerRun + longitudinal.explicitNoChangePerRun,
    );
    expect(sum(longitudinal.scenarios.map((scenario) => scenario.applied))).toBe(
      longitudinal.materialApplicationsPerRun,
    );
    expect(sum(longitudinal.scenarios.map((scenario) => scenario.unchanged))).toBe(
      longitudinal.explicitNoChangePerRun,
    );

    const comparatorSource = readFileSync(
      join(process.cwd(), "src/domain/training/canonical-material-prescription-delta.ts"),
      "utf8",
    );
    expect(comparatorSource).toContain("deriveSemanticGroupMembers");
    expect(comparatorSource).toContain("grouped_method_semantics_ambiguous");
    expect(comparatorSource).not.toMatch(/path:\s*["']groupId["']/);

    const applicationSource = readFileSync(
      join(process.cwd(), "src/application/training/canonical-progress-decision-application.ts"),
      "utf8",
    );
    expect(applicationSource).toContain('material.status === "ambiguous"');
    expect(applicationSource).toContain("unambiguous_grouped_method_prescription_semantics");
  });
});

function readArtifact<T>(directory: string, name: string): T {
  return JSON.parse(readFileSync(join(directory, name), "utf8")) as T;
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function goalFor(engine: string): "build_muscle" | "build_muscle_and_strength" | "build_strength" | "athletic_performance" {
  return engine === "powerbuilding"
    ? "build_muscle_and_strength"
    : engine === "strength"
      ? "build_strength"
      : engine === "athletic_performance"
        ? "athletic_performance"
        : "build_muscle";
}
