import fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('/tmp/d4e3-audit-full.json', 'utf8'));
const rows = [];
for (const suite of report.testResults) {
  for (const assertion of (suite.assertionResults ?? []).filter((x) => x.status === 'failed')) {
    const file = suite.name.replace(`${process.cwd()}/`, '');
    const test = [...(assertion.ancestorTitles ?? []), assertion.title].join(' > ');
    const error = (assertion.failureMessages ?? [])[0]?.split('\n')[0] ?? 'unknown failure';
    let category = 'uncertain_requires_investigation';
    let cause = null;
    if (file.includes('master-architecture')) category = 'environment_tooling_configuration_failure';
    else if (file.includes('planned-workout') || file.includes('end-to-end-simulator')) category = 'incomplete_planning_context_migration';
    else if (file.includes('product-positioning') || file.includes('product-flow-architecture') || file.includes('programme-skeleton') || file.includes('paywall-trial-flow')) category = 'stale_test_asserting_intentionally_removed_behaviour';
    else if (file.includes('design-qa-fixtures')) category = 'fixture_or_evidence_artifact_drift';
    else if (file.includes('progress-dashboard')) category = 'ui_view_model_mismatch';
    else if (file.includes('recommendation-actions')) category = 'fixture_or_evidence_artifact_drift';
    else if (file.includes('event-taper') || file.includes('recovery-capacity')) category = 'legacy_block_rep_range_authority_conflict';
    else if (file.includes('load-selection') || file.includes('workout-history')) category = 'uncertain_requires_investigation';
    rows.push({ id: `D4E3-F${String(rows.length + 1).padStart(2, '0')}`, file, test, error, category, cause });
  }
}
const files = [...new Set(rows.map((r) => r.file))].sort();
const inventory = {
  phase: 'D4E3 remaining-conflicts audit',
  commit: 'b9b513d6d602fc77cf75c8e484daa077f96480bf',
  baseline: { failedTests: report.numFailedTests, passedTests: report.numPassedTests, failedFiles: files.length, historicalFailedFiles: 15 },
  source: '/tmp/d4e3-audit-full.json',
  constraints: { productionAuthority: 'production_only', runtimeShadowObservation: 'disabled', v2Authority: 'disabled', buildStarted: false, deploymentStarted: false },
  failureMatrix: 'qa-reports/legacy-migration-change-control/phase-d4e3-failure-matrix.json',
  categories: [...new Set(rows.map((r) => r.category))].sort(),
  nextTask: 'D4E3-AUDIT-1 reconcile planning-context and active-plan naming authority',
  dependencyOrder: [
    'D4E3-AUDIT-0 baseline and failure inventory (this audit)',
    'D4E3-AUDIT-1 reconcile planning-context/active-plan naming and generated session view models',
    'D4E3-AUDIT-2 replace stale UI/source architecture expectations after product contract decision',
    'D4E3-AUDIT-3 investigate numeric history/load/recovery semantics with independent fixtures',
    'D4E3-AUDIT-4 resolve missing support-function-policy architecture fixture or retire its contract',
    'D4E3-AUDIT-5 rerun full suite; zero unexplained failures before any build or rollout'
  ],
  failureRows: rows,
};
fs.writeFileSync('qa-reports/legacy-migration-change-control/phase-d4e3-failure-matrix.json', JSON.stringify({ failures: rows }, null, 2) + '\n');
fs.writeFileSync('qa-reports/legacy-migration-change-control/phase-d4e3-remaining-work-inventory.json', JSON.stringify(inventory, null, 2) + '\n');
console.log(JSON.stringify({ failedTests: rows.length, failedFiles: files.length, files }, null, 2));
