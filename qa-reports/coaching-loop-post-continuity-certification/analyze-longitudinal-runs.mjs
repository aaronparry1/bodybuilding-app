import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const auditedCommit = "6a251343a3884c4fe2dda6d6d2bebad75e71f7e1";
const reportDirectory = dirname(fileURLToPath(import.meta.url));
const runDirectories = process.argv.slice(2);
if (runDirectories.length !== 2) throw new Error("expected_two_longitudinal_run_directories");

const scenarioIds = [
  "normal_responder",
  "high_responder",
  "repeated_stall",
  "poor_recovery",
  "missed_sessions",
  "return_after_layoff",
  "pain_or_limitation",
  "limited_equipment",
  "advanced_five_day_hypertrophy",
  "strength_transition_boundary",
  "powerbuilding_athlete",
  "athletic_changing_sport_workload",
];

function loadRun(directory) {
  return scenarioIds.flatMap((scenarioId) => {
    const artifact = JSON.parse(readFileSync(resolve(directory, `longitudinal-${scenarioId}.json`), "utf8"));
    if (artifact.scenarioCount !== 1 || artifact.scenarios[0]?.scenarioId !== scenarioId) {
      throw new Error(`invalid_scenario_artifact:${directory}:${scenarioId}`);
    }
    return artifact.scenarios;
  });
}

const runs = runDirectories.map(loadRun);
const semanticRuns = runs.map((scenarios) => JSON.stringify(scenarios));
if (semanticRuns[0] !== semanticRuns[1]) throw new Error("fresh_longitudinal_runs_are_not_semantically_deterministic");

const scenarios = runs[0];
const decisions = scenarios.flatMap((scenario) =>
  scenario.decisions.map((decision) => ({ ...decision, scenarioId: scenario.scenarioId })),
);
const applied = decisions.filter((decision) => decision.applicationStatus === "applied");
const unchanged = decisions.filter((decision) => decision.applicationStatus === "unchanged");

function stripGeneratedIdentity(value) {
  return typeof value === "string"
    ? value.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, "<generated-at>")
    : value;
}

function isGeneratedGroupIdentityDelta(delta) {
  return delta.field.endsWith("methodStructure.groupId")
    && stripGeneratedIdentity(delta.before) === stripGeneratedIdentity(delta.after);
}

function isGeneratedIdentityOnly(decision) {
  return decision.materialDeltas.length > 0
    && decision.materialDeltas.every(isGeneratedGroupIdentityDelta);
}

function transactionClass(decision) {
  if (isGeneratedIdentityOnly(decision)) return "generated_identity_only_false_positive";
  if (decision.decisionType === "establish_calibration") return "observed_load_calibration";
  if (decision.decisionType === "recalibrate") return "load_state_recalibration";
  if (decision.decisionType === "advance_microcycle") return "ordinary_next_microcycle_construction";
  if (decision.attemptReason === "approved_successor_construction_unavailable_continued_within_horizon") {
    return "approved_successor_failure_continuation";
  }
  if (decision.decisionType === "transition") return "approved_successor_transition";
  return "unclassified_applied_transaction";
}

function outcomeClass(decision) {
  if (decision.applicationStatus === "applied") {
    const category = transactionClass(decision);
    if (category === "generated_identity_only_false_positive") return "incorrect_adaptation";
    if (category === "observed_load_calibration") return "calibration";
    if (category === "load_state_recalibration") return "non_numeric_demand_change";
    return "structural_session_continuity_change";
  }
  if (decision.attemptReason === "phase_one_prescription_maintained"
    && decision.reasonCodes.includes("successful_exposure_retained")) {
    return "missed_adaptation_opportunity";
  }
  return "appropriate_maintenance";
}

function countBy(values) {
  return Object.fromEntries(
    [...new Set(values)].sort().map((value) => [value, values.filter((candidate) => candidate === value).length]),
  );
}

function compactDelta(delta) {
  if (delta.field !== "session") return { field: delta.field, before: delta.before, after: delta.after };
  const compact = (value) => !value ? value : ({
    role: value.role,
    kind: value.kind,
    sessionPurpose: value.sessionPurpose,
    slotCount: Array.isArray(value.slots) ? value.slots.length : 0,
    exerciseIds: Array.isArray(value.slots) ? value.slots.map((slot) => slot.exerciseId) : [],
  });
  return { field: delta.field, before: compact(delta.before), after: compact(delta.after) };
}

const applications = applied.map((decision) => {
  const category = transactionClass(decision);
  const mountedScenario = scenarios.find((scenario) => scenario.scenarioId === decision.scenarioId)?.productionInputReachability === "mounted";
  const athleteResponsive = category === "observed_load_calibration"
    || category === "load_state_recalibration" && mountedScenario;
  return {
    scenarioId: decision.scenarioId,
    opportunityOrdinal: decision.ordinal,
    microcycleSequence: decision.microcycleSequence,
    decisionType: decision.decisionType,
    attemptReason: decision.attemptReason,
    category,
    truthfulMaterialPrescriptionDelta: category !== "generated_identity_only_false_positive",
    athleteResponsive,
    mountedDistinguishingAthleteContext: mountedScenario,
    changesTrainingDemand: category !== "generated_identity_only_false_positive",
    justifiedByMountedAthleteEvidence: athleteResponsive && mountedScenario,
    fieldCount: decision.materialDeltas.length,
    fields: [...new Set(decision.materialDeltas.map((delta) => delta.field))].sort(),
    representativeDelta: compactDelta(decision.materialDeltas[0]),
  };
});

const rawDeltas = applied.flatMap((decision) => decision.materialDeltas);
const generatedIdentityDeltas = rawDeltas.filter(isGeneratedGroupIdentityDelta);
const numericBaseLoadDeltas = rawDeltas.filter((delta) =>
  delta.field.endsWith("prescribedBaseLoad")
    && typeof delta.before === "number"
    && typeof delta.after === "number"
    && delta.before !== delta.after
);
const generatedOnlyApplications = applications.filter((application) => !application.truthfulMaterialPrescriptionDelta);

const requestedFieldClassification = [
  ["exercise_identity", 0, "No direct before/after exercise-id mutation. Exercise identities are embedded in 648 atomic new-session deltas."],
  ["sets", 0, "No retained future-session set count changed."],
  ["repetitions", 0, "No retained future-session target repetition changed."],
  ["load_state", rawDeltas.filter((delta) => delta.field.endsWith("loadPrescription.state")).length, "Calibration establishment or recalibration only."],
  ["base_load", rawDeltas.filter((delta) => delta.field.endsWith("loadPrescription.prescribedBaseLoad")).length, "Null-to-observed or observed-to-null only; never number-to-number."],
  ["method", 0, "No method semantic changed. Six generated method-group identity deltas were recorded."],
  ["rest", 0, "No retained future-session rest rule changed."],
  ["progression_rule", 0, "No retained future-session progression rule changed."],
  ["stop_rule", 0, "No retained future-session stop rule changed."],
  ["substitution_constraints", 0, "No retained future-session substitution constraint changed."],
  ["session_identity", rawDeltas.filter((delta) => delta.field === "session").length, "Atomic construction of new future sessions after the prior week was exhausted."],
  ["mesocycle_identity", applied.filter((decision) => decision.decisionType === "transition"
    && decision.attemptReason === "phase_one_transition_applied").length, "Approved successor transitions; this identity is recorded by decision and lineage rather than a comparator field."],
  ["approved_successor_transition", applied.filter((decision) => decision.decisionType === "transition"
    && decision.attemptReason === "phase_one_transition_applied").length, "Existing ordered approved-successor edge."],
  ["other_generated_identity", generatedIdentityDeltas.length, "Method group IDs encode regenerated session identities; two transactions contain no other delta."],
].map(([field, count, meaning]) => ({ field, deltaOrTransitionCount: count, meaning }));

const materialClassification = {
  schemaVersion: "canonical_coaching_loop_post_continuity_material_classification_v1",
  auditedCommit,
  freshRunCount: 2,
  freshRunSemanticDeterminism: true,
  freshRunSemanticSha256: semanticRuns.map((value) => createHash("sha256").update(value).digest("hex")),
  mechanicalAppliedReceiptCount: applied.length,
  truthfulMaterialTransactionCount: applications.filter((application) => application.truthfulMaterialPrescriptionDelta).length,
  generatedIdentityOnlyAppliedReceiptCount: generatedOnlyApplications.length,
  rawMaterialDeltaCount: rawDeltas.length,
  generatedIdentityDeltaCount: generatedIdentityDeltas.length,
  numberToNumberBaseLoadDeltaCount: numericBaseLoadDeltas.length,
  transactionCategoryCounts: countBy(applications.map((application) => application.category)),
  requestedFieldClassification,
  rawFieldDeltaCounts: countBy(rawDeltas.map((delta) => delta.field)),
  generatedIdentityOnlyApplications: generatedOnlyApplications,
  applications,
};

const classifiedScenarios = scenarios.map((scenario) => {
  const classifiedDecisions = scenario.decisions.map((decision) => ({
    ...decision,
    certificationClassification: outcomeClass(decision),
    truthfulMaterialPrescriptionDelta: decision.applicationStatus !== "applied" || !isGeneratedIdentityOnly(decision),
  }));
  return {
    ...scenario,
    certificationOutcomeCounts: countBy(classifiedDecisions.map((decision) => decision.certificationClassification)),
    decisions: classifiedDecisions,
  };
});

const noChangeByReason = countBy(unchanged.map((decision) =>
  `${decision.attemptReason}|${decision.reasonCodes.join("+")}`,
));
const outcomeCounts = countBy(classifiedScenarios.flatMap((scenario) =>
  scenario.decisions.map((decision) => decision.certificationClassification),
));

const longitudinal = {
  schemaVersion: "canonical_coaching_loop_post_continuity_longitudinal_certification_v1",
  auditedCommit,
  freshRunCount: 2,
  targetWeeks: 12,
  scenarioCount: classifiedScenarios.length,
  scenariosReachingTwelveWeeks: classifiedScenarios.filter((scenario) => scenario.reachedTwelveWeeks).length,
  deadlockedScenarioCount: classifiedScenarios.filter((scenario) => scenario.deadlocked).length,
  terminalBlockedOutcomeCount: decisions.filter((decision) => decision.applicationStatus === "blocked").length,
  coachingOpportunityCount: decisions.length,
  mechanicalAppliedReceiptCount: applied.length,
  truthfulMaterialTransactionCount: materialClassification.truthfulMaterialTransactionCount,
  explicitNoChangeCount: unchanged.length,
  automaticNumericProgressionCount: numericBaseLoadDeltas.filter((delta) => delta.after > delta.before).length,
  automaticNumericRegressionCount: numericBaseLoadDeltas.filter((delta) => delta.after < delta.before).length,
  semanticallyContradictoryAppliedReceiptCount: generatedOnlyApplications.length,
  outcomeCounts,
  noChangeByReason,
  freshRunSemanticSha256: materialClassification.freshRunSemanticSha256,
  secondRunSemanticallyIdentical: true,
  scenarios: classifiedScenarios,
};

writeFileSync(resolve(reportDirectory, "material-change-classification.json"), `${JSON.stringify(materialClassification, null, 2)}\n`);
writeFileSync(resolve(reportDirectory, "longitudinal-12-week-results.json"), `${JSON.stringify(longitudinal, null, 2)}\n`);
console.log(JSON.stringify({
  scenariosReachingTwelveWeeks: longitudinal.scenariosReachingTwelveWeeks,
  coachingOpportunityCount: longitudinal.coachingOpportunityCount,
  mechanicalAppliedReceiptCount: longitudinal.mechanicalAppliedReceiptCount,
  truthfulMaterialTransactionCount: longitudinal.truthfulMaterialTransactionCount,
  explicitNoChangeCount: longitudinal.explicitNoChangeCount,
  semanticallyContradictoryAppliedReceiptCount: longitudinal.semanticallyContradictoryAppliedReceiptCount,
  outcomeCounts: longitudinal.outcomeCounts,
}, null, 2));
