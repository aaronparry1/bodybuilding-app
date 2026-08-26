import { writeFileSync } from "node:fs";
import { assembleCanonicalActivePlan, serializeCanonicalActivePlan } from "../src/domain/training/canonical-active-plan-carrier";
import { createMacrocycle } from "../src/domain/training/macrocycle-engine";
import { mesocycleById } from "../src/domain/training/mesocycle-library";
import { createMicrocycle } from "../src/domain/training/microcycle-scheduler";
import { constructRepresentativeMethodSessions } from "../tests/helpers/canonical-method-fixtures";

const method = process.argv[2];
const outputPath = process.argv[3];
if (!["antagonist_superset", "rest_pause", "back_off_sets"].includes(method) || !outputPath) {
  throw new Error("usage: generate-native-method-carrier.ts <antagonist_superset|rest_pause|back_off_sets> <output-path>");
}

const fixtureId = `native-method:${method}`;
const mesocycleId = method === "back_off_sets" ? "powerbuilding_strength" : "powerbuilding_hypertrophy";
const goal = "build_muscle_and_strength";
const experience = "intermediate";
const daysPerWeek = 5;
const split = "let_app_choose";
const sessions = constructRepresentativeMethodSessions({
  id: fixtureId,
  goal,
  mesocycleId,
  experience,
  daysPerWeek,
  split,
  established: true,
});
const selected = sessions.find((session) => session.snapshot.slots.some((slot) => slot.method === method));
if (!selected) throw new Error(`real Session Construction did not produce ${method}`);

const selectedIndex = sessions.indexOf(selected);
const macrocycle = createMacrocycle(goal, experience, undefined, "2026-07-24T08:00:00.000Z");
const mesocycle = mesocycleById(mesocycleId);
if (!mesocycle) throw new Error(`missing Mesocycle ${mesocycleId}`);
const microcycle = createMicrocycle({ parentMesocycleId: mesocycleId, trainingDays: daysPerWeek, split });
const microcycleId = `${fixtureId}:microcycle`;
const assembled = assembleCanonicalActivePlan({
  planId: `${fixtureId}:plan`,
  createdAt: "2026-07-24T08:00:00.000Z",
  updatedAt: "2026-07-24T08:00:00.000Z",
  macrocycle: { ...macrocycle, id: `${fixtureId}:macrocycle` },
  mesocycle: { ...mesocycle, position: 1 },
  microcycle: { ...microcycle, id: microcycleId, position: 1, constructionVersion: "canonical_plan_v3" },
  plannedSessions: [{
    id: selected.snapshot.sessionId,
    microcycleId,
    planSessionIndex: selectedIndex,
    role: selected.role,
    kind: "planned",
    status: "planned",
    constructionVersion: "canonical_plan_v3",
    revision: 0,
    prescriptionSnapshot: selected.snapshot,
  }],
  progress: { evidenceVersion: "established-evidence-v1", revision: 0 },
  constraints: {
    goal,
    experienceLevel: experience,
    daysPerWeek,
    preferredSplit: split,
    equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
    units: "kg",
    availableSessionMinutes: 60,
  },
  operational: {},
});
if (assembled.status !== "valid") {
  throw new Error(`native method carrier failed validation: ${assembled.reason}:${assembled.path ?? "unknown"}`);
}
const carrier = {
  ...assembled.carrier,
  cycleLineage: [{
    schemaVersion: "canonical_session_lineage_v1",
    planId: assembled.carrier.planId,
    macrocycleId: assembled.carrier.macrocycle.id,
    mesocycleId: assembled.carrier.mesocycle.id,
    microcycleId: assembled.carrier.microcycle.id,
    revision: assembled.carrier.revision,
    sequenceNumber: assembled.carrier.microcycle.output.sequenceNumber,
    status: "current",
  }],
};

const methodSlots = selected.snapshot.slots
  .filter((slot) => slot.method === method)
  .map((slot) => ({
    order: slot.index + 1,
    exerciseId: slot.exerciseId,
    method: slot.method,
    executionKind: slot.methodStructure?.kind,
    groupId: slot.methodStructure?.kind === "linked_rounds" ? slot.methodStructure.groupId : null,
    rounds: slot.methodStructure?.rounds,
  }));
writeFileSync(outputPath, `${JSON.stringify({
  schemaVersion: "canonical_native_method_carrier_fixture_v1",
  method,
  selectedRole: selected.role,
  methodSlots,
  serializedCarrier: serializeCanonicalActivePlan(carrier),
}, null, 2)}\n`);
