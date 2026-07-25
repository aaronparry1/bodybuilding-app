import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { constructRepresentativeMethodSessions, type RepresentativeMethodFixtureInput } from "../tests/helpers/canonical-method-fixtures";
import { canonicalTrainingMethodDefinitions, CANONICAL_TRAINING_METHOD_POLICY_ID } from "../src/domain/training/canonical-training-method-policy";
import { exerciseDisplayName, methodDisplayName } from "../src/application/training/display-labels";

const root = process.cwd();
const output = join(root, "qa-reports", "workout-correction");
mkdirSync(output, { recursive: true });

const goalCases: readonly Readonly<{
  goal: RepresentativeMethodFixtureInput["goal"];
  mesocycleId: RepresentativeMethodFixtureInput["mesocycleId"];
  split: RepresentativeMethodFixtureInput["split"];
  daysPerWeek: RepresentativeMethodFixtureInput["daysPerWeek"];
}>[] = [
  { goal: "build_muscle", mesocycleId: "hypertrophy_volume", split: "push_pull_legs", daysPerWeek: 5 },
  { goal: "build_strength", mesocycleId: "strength_accumulation", split: "upper_lower", daysPerWeek: 4 },
  { goal: "build_muscle_and_strength", mesocycleId: "powerbuilding_hypertrophy", split: "let_app_choose", daysPerWeek: 5 },
  { goal: "athletic_performance", mesocycleId: "athletic_general", split: "full_body", daysPerWeek: 3 },
  { goal: "get_leaner", mesocycleId: "hypertrophy_volume", split: "upper_lower", daysPerWeek: 4 },
] as const;
const experiences = ["beginner", "intermediate", "advanced"] as const;

const reachability = goalCases.flatMap((goalCase) => experiences.map((experience) => {
  const id = `audit:${goalCase.goal}:${experience}`;
  let sessions: ReturnType<typeof constructRepresentativeMethodSessions>;
  try {
    sessions = constructRepresentativeMethodSessions({ ...goalCase, id, experience, established: experience !== "beginner" });
  } catch (error) {
    return {
      id,
      goal: goalCase.goal,
      experience,
      mesocyclePurpose: goalCase.mesocycleId,
      status: "fail_closed" as const,
      reason: error instanceof Error ? error.message : "construction_failed",
      sessionCount: 0,
      workingSets: 0,
      methods: {},
      executableStructures: {},
      sessions: [],
    };
  }
  const methods = sessions.flatMap((session) => session.snapshot.slots.map((slot) => slot.method));
  return {
    id,
    goal: goalCase.goal,
    experience,
    mesocyclePurpose: goalCase.mesocycleId,
    status: "constructed" as const,
    sessionCount: sessions.length,
    workingSets: sessions.reduce((sum, session) => sum + session.snapshot.slots.reduce((slotSum, slot) => slotSum + slot.settings.requiredSets, 0), 0),
    methods: count(methods),
    executableStructures: count(sessions.flatMap((session) => session.snapshot.slots.map((slot) => slot.methodStructure?.kind ?? "missing"))),
    sessions: sessions.map((session) => ({
      role: session.role,
      workingSets: session.snapshot.slots.reduce((sum, slot) => sum + slot.settings.requiredSets, 0),
      durationMinutes: session.snapshot.estimatedDurationMinutes ?? null,
      methods: count(session.snapshot.slots.map((slot) => slot.method)),
    })),
  };
}));

write("production-method-reachability-audit.json", {
  schemaVersion: "canonical_production_method_reachability_audit_v1",
  generatedFrom: "real_canonical_session_construction_v3",
  policyId: CANONICAL_TRAINING_METHOD_POLICY_ID,
  calibrationBoundary: "Initial calibration remains deliberately straight; later established-load Mesocycles may select bounded methods.",
  cases: reachability,
  allConstructedProductionMethodsHaveExecutableStructure: reachability.filter((entry) => entry.status === "constructed").every((entry) => Object.keys(entry.executableStructures).every((key) => key !== "missing")),
  failClosedCases: reachability.filter((entry) => entry.status === "fail_closed").map((entry) => ({ id: entry.id, reason: entry.reason })),
  unsupportedMethodsFailClosed: canonicalTrainingMethodDefinitions.filter((definition) => definition.status === "unsupported").map((definition) => definition.method),
});

const hypertrophy = constructRepresentativeMethodSessions({ id: "example:hypertrophy", goal: "build_muscle", mesocycleId: "hypertrophy_volume", experience: "intermediate", daysPerWeek: 5, split: "push_pull_legs", established: true });
const powerbuilding = constructRepresentativeMethodSessions({ id: "example:powerbuilding", goal: "build_muscle_and_strength", mesocycleId: "powerbuilding_hypertrophy", experience: "intermediate", daysPerWeek: 5, split: "let_app_choose", established: true });
const strength = constructRepresentativeMethodSessions({ id: "example:strength", goal: "build_strength", mesocycleId: "strength_accumulation", experience: "intermediate", daysPerWeek: 4, split: "upper_lower", established: true });
const athletic = constructRepresentativeMethodSessions({ id: "example:athletic", goal: "athletic_performance", mesocycleId: "athletic_general", experience: "intermediate", daysPerWeek: 3, split: "full_body", established: true });

const selected = [
  ["intermediate hypertrophy Push", findRole(hypertrophy, "push")],
  ["intermediate hypertrophy Pull", findRole(hypertrophy, "pull")],
  ["intermediate hypertrophy Legs", findRole(hypertrophy, "legs")],
  ["intermediate powerbuilding upper", findRole(powerbuilding, "upper")],
  ["intermediate strength primary-lift session", strength[0]!],
  ["intermediate athletic session", athletic[0]!],
] as const;

write("representative-corrected-sessions.json", {
  schemaVersion: "canonical_representative_corrected_sessions_v1",
  policyId: CANONICAL_TRAINING_METHOD_POLICY_ID,
  source: "canonical_session_snapshot_v3",
  sessions: selected.map(([label, session]) => ({
    label,
    sessionId: session.snapshot.sessionId,
    sessionRole: session.role,
    mesocyclePurpose: label.includes("hypertrophy") ? "hypertrophy_volume" : label.includes("powerbuilding") ? "powerbuilding_hypertrophy" : label.includes("strength") ? "strength_accumulation" : "athletic_general",
    expectedDurationMinutes: session.snapshot.estimatedDurationMinutes ?? null,
    workingSets: session.snapshot.slots.reduce((sum, slot) => sum + slot.settings.requiredSets, 0),
    exercises: session.snapshot.slots.map((slot) => ({
      order: slot.index + 1,
      exerciseId: slot.exerciseId,
      exercise: exerciseDisplayName(slot.exerciseId),
      role: slot.selection?.suitability ?? "canonical_selected",
      method: slot.method,
      methodLabel: methodDisplayName(slot.method),
      execution: slot.methodStructure,
      sets: slot.settings.requiredSets,
      exactReps: slot.exactTargets ?? Array.from({ length: slot.settings.requiredSets }, () => slot.targetReps),
      loadState: slot.loadPrescription.state,
      prescribedBaseLoadKg: slot.loadPrescription.state === "established" ? slot.loadPrescription.prescribedBaseLoad : null,
      restSeconds: slot.rest.seconds,
      progression: slot.progression,
      stopRule: slot.stopRule,
      why: slot.methodStructure?.reasonCodes ?? [slot.reason],
    })),
  })),
  mesocycleProgression: [
    { phase: "hypertrophy_calibration", methodBoundary: "straight sets only", reason: "establish reproducible exercise, load and recovery evidence" },
    { phase: "hypertrophy_base", methodBoundary: "canonical standalone methods only", reason: "build stable overload without density-first pairing" },
    { phase: "hypertrophy_volume", methodBoundary: "one eligible antagonist pair and at most one eligible rest-pause movement", reason: "bounded density and source-backed stable-movement exposure" },
    { phase: "hypertrophy_specialisation", methodBoundary: "same bounded policy, never random rotation", reason: "retain only methods compatible with current evidence and recovery" },
    { phase: "consolidation/deload/transition", methodBoundary: "straight sets", reason: "repeatability and fatigue reduction override method variety" },
  ],
});

function sessionRole(value: string): string { return value.toLowerCase().replaceAll("-", " "); }
function findRole(sessions: ReturnType<typeof constructRepresentativeMethodSessions>, fragment: string) {
  return sessions.find((session) => sessionRole(session.role).includes(fragment)) ?? sessions[0]!;
}
function count(values: readonly string[]): Record<string, number> {
  return Object.fromEntries([...new Set(values)].sort().map((value) => [value, values.filter((candidate) => candidate === value).length]));
}
function write(name: string, value: unknown): void {
  writeFileSync(join(output, name), `${JSON.stringify(value, null, 2)}\n`);
}
