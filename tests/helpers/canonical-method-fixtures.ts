import { createMacrocycle } from "@/domain/training/macrocycle-engine";
import { allocateCanonicalMicrocycleVolume } from "@/domain/training/canonical-microcycle-volume-allocator";
import {
  constructCanonicalSession,
  resolveCanonicalSessionIdentity,
  type CanonicalSessionConstructionInput,
  type CanonicalSessionSnapshotV3,
} from "@/domain/training/canonical-session-construction-pipeline";
import { allMesocyclePrescriptionPolicies } from "@/domain/training/mesocycle-prescription-policy";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";
import type { ExperienceLevel } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import type { MesocycleId } from "@/domain/training/mesocycle-library";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";

export type RepresentativeMethodFixtureInput = Readonly<{
  id: string;
  goal: TrainingSetupGoal;
  mesocycleId: MesocycleId;
  experience: ExperienceLevel;
  daysPerWeek: 3 | 4 | 5;
  split: "push_pull_legs" | "upper_lower" | "full_body" | "let_app_choose";
  established: boolean;
}>;

export type RepresentativeConstructedSession = Readonly<{
  role: string;
  snapshot: CanonicalSessionSnapshotV3;
}>;

export function constructRepresentativeMethodSessions(input: RepresentativeMethodFixtureInput): readonly RepresentativeConstructedSession[] {
  const policy = allMesocyclePrescriptionPolicies().find((candidate) => candidate.mesocycleId === input.mesocycleId);
  if (!policy) throw new Error(`missing policy ${input.mesocycleId}`);
  const macrocycle = createMacrocycle(input.goal, input.experience);
  const microcycle = createMicrocycle({ parentMesocycleId: input.mesocycleId, trainingDays: input.daysPerWeek, split: input.split });
  const establishedLoads = Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, 50]));
  const loadEvidence = Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, {
    evidenceId: `${input.id}:evidence:${exercise.id}`,
    evidenceVersion: "load-evidence-v1",
    athleteId: "representative-athlete",
    exerciseId: exercise.id,
    sourceSessionId: "representative-prior-session",
    sourceSlotId: `representative-prior-slot:${exercise.id}`,
    observedLoad: 50,
    observedReps: 10,
    baseUnit: "kg" as const,
    freshnessVersion: 1,
    calibrationStatus: "established" as const,
  }]));
  const allocation = allocateCanonicalMicrocycleVolume({
    macrocycleGoal: input.goal,
    mesocycleId: input.mesocycleId,
    mesocyclePurpose: policy.purpose,
    microcyclePriority: microcycle.priority,
    microcycleSequence: microcycle.sequenceNumber,
    experience: input.experience,
    frequency: input.daysPerWeek,
    split: input.split,
    equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
    recoveryRestricted: false,
    establishedLoadExerciseIds: input.established ? exerciseLibrary.map((exercise) => exercise.id) : [],
    sessionRoles: microcycle.sessionRoles,
    sessionTypes: microcycle.sessionTypes,
  });
  const weeklyExerciseUsage: Record<string, number> = {};
  return microcycle.sessionRoles.map((role, planSessionIndex) => {
    const provisional: CanonicalSessionConstructionInput = {
      schemaVersion: "canonical_session_construction_input_v1",
      macrocycle,
      mesocycle: { id: input.mesocycleId, policy, position: input.mesocycleId.endsWith("calibration") ? 0 : 1 },
      microcycle: {
        id: `${input.id}:microcycle`,
        output: microcycle,
        sessionId: "",
        planSessionIndex,
        sessionRole: role,
        sessionOrder: planSessionIndex,
        stressIntent: microcycle.priority,
        recoveryDays: microcycle.recoveryDays,
        kind: "planned",
      },
      athlete: {
        experienceLevel: input.experience,
        preferredSplit: input.split,
        equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
        limitations: [],
        units: "kg",
        exercises: exerciseLibrary,
      },
      progress: {
        evidenceVersion: input.established ? "established-evidence-v1" : "first-exposure-v1",
        readiness: "ready",
        history: [],
        establishedLoads: input.established ? establishedLoads : {},
        loadEvidence: input.established ? loadEvidence : {},
      },
      operational: {
        constructionVersion: "canonical_plan_v3",
        seed: `${input.id}:seed:${planSessionIndex}`,
        identity: "",
        revision: "representative-revision-v1",
      },
      allocation,
      selectionContext: { weeklyExerciseUsage: { ...weeklyExerciseUsage } },
    };
    const identity = resolveCanonicalSessionIdentity(provisional);
    const result = constructCanonicalSession({
      ...provisional,
      microcycle: { ...provisional.microcycle, sessionId: identity },
      operational: { ...provisional.operational, identity },
    });
    if (result.status !== "constructed" || result.snapshot.schemaVersion !== "canonical_session_snapshot_v3") {
      throw new Error(`representative construction failed: ${input.id}:${planSessionIndex}:${result.status === "constructed" ? "wrong_version" : result.reason}`);
    }
    result.snapshot.slots.forEach((slot) => {
      weeklyExerciseUsage[slot.exerciseId] = (weeklyExerciseUsage[slot.exerciseId] ?? 0) + 1;
    });
    return { role, snapshot: result.snapshot };
  });
}
