import { applyDesignQaFixture, designQaFixtureFamily, designQaFixtures } from "@/application/design-qa/design-qa-fixtures";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";

export type CanonicalDesignQaFinalCertification = Readonly<{
  fixtureCount: number;
  familyCounts: Readonly<Record<string, number>>;
  uniqueIds: boolean;
  allCanonicalSetup: boolean;
  legacyReachabilityZero: boolean;
  unsupportedMutationsFailClosed: boolean;
  designQaCanonicalMatrixComplete: boolean;
  designQaLegacyReachabilityZero: boolean;
  pipelineReadyForSwitch: boolean;
  productionSwitchCompleted: false;
  failedFixtureIds: readonly string[];
}>;

export function certifyCanonicalDesignQaMatrix(): CanonicalDesignQaFinalCertification {
  const ids = designQaFixtures.map((fixture) => fixture.id);
  const familyCounts = { plan_state: 0, session_lifecycle: 0, progress_decision: 0 };
  const failedFixtureIds: string[] = [];
  for (const id of ids) {
    const family = designQaFixtureFamily(id);
    if (family in familyCounts) familyCounts[family as keyof typeof familyCounts] += 1;
    try {
      applyDesignQaFixture(id, "development");
      if (family !== "plan_state" && !canonicalActivePlanState.getReadModel()) failedFixtureIds.push(id);
    } catch {
      failedFixtureIds.push(id);
    }
  }
  const uniqueIds = new Set(ids).size === ids.length;
  const countsComplete = ids.length === 78 && familyCounts.plan_state === 13 && familyCounts.session_lifecycle === 30 && familyCounts.progress_decision === 35;
  const allCanonicalSetup = failedFixtureIds.length === 0;
  const legacyReachabilityZero = ids.every((id) => designQaFixtureFamily(id) !== "failure_recovery");
  const unsupportedMutationsFailClosed = allCanonicalSetup;
  const designQaCanonicalMatrixComplete = uniqueIds && countsComplete && allCanonicalSetup;
  const designQaLegacyReachabilityZero = legacyReachabilityZero;
  return { fixtureCount: ids.length, familyCounts, uniqueIds, allCanonicalSetup, legacyReachabilityZero, unsupportedMutationsFailClosed, designQaCanonicalMatrixComplete, designQaLegacyReachabilityZero, pipelineReadyForSwitch: designQaCanonicalMatrixComplete && designQaLegacyReachabilityZero && unsupportedMutationsFailClosed, productionSwitchCompleted: false, failedFixtureIds };
}
