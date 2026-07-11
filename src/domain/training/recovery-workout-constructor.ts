import { resolveWorkoutExerciseSettings } from "@/application/settings/workout-settings";
import type { AppSettings } from "@/application/settings/app-settings";
import type { Exercise, MovementPattern, ProgressionSettings, WorkoutExerciseLog, WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { resolveCurrentPlanningInput, type CurrentPlanningInput } from "@/domain/training/current-planning-input";
import { exactTargets } from "@/domain/training/prescribed-performance-progression";
import { planningSummary } from "@/domain/training/planning-summary";
import { resolveCanonicalLoadEvidence } from "@/domain/training/load-evidence-resolver";
import { selectSetMethod, setMethodExplanation } from "@/domain/training/set-method-governance";
import { resolveInterventionCandidates } from "@/domain/training/exercise-intervention-selection";

/** The one production session-construction path. Equipment is intentionally not an eligibility input. */
export type RecoverySessionRole = "push" | "pull" | "legs" | "upper" | "lower" | "full_body" | "arms";
type ConstructionRole = "primary_strength" | "primary_hypertrophy" | "secondary_developmental" | "isolation" | "structural";
type Slot = { pattern: MovementPattern; role: ConstructionRole; protected: boolean; optional?: boolean; target: string };

type SessionContract = {
  role: RecoverySessionRole;
  name: string;
  primaryTarget: string;
  secondaryTargets: string[];
  requiredSlots: Slot[];
  optionalSlots: Slot[];
  minimumExercises: number;
  targetExercises: number;
  maximumExercises: number;
  workingSetBudget: { min: number; target: number; max: number };
  durationMinutes: { min: number; target: number; max: number };
  removalOrder: string[];
  stopConditions: string[];
};

const labels: Record<RecoverySessionRole, string> = { push: "Push", pull: "Pull", legs: "Legs", upper: "Upper", lower: "Lower", full_body: "Full Body", arms: "Arms" };

export function buildRecoveryWorkoutSession(input: {
  id: string; userId?: string | null; startedAt: string; activePlan: ActiveTrainingPlan;
  appSettings: AppSettings; exercises: Exercise[]; history: WorkoutHistorySummary[]; sessionIndex: number;
}): WorkoutSession | null {
  const resolved = resolveCurrentPlanningInput(input.activePlan, input.sessionIndex);
  if (resolved.status !== "ready") return null;
  const contract = constructSessionContract(resolved.planning);
  const selected = selectSessionExercises(contract, input.exercises, input.activePlan);
  if (!selected) return null;

  const exerciseLogs = selected.map((selection, index) => createExerciseLog(selection.exercise, selection.slot, index, resolved.planning, input, selection.interventionKey));
  const session: WorkoutSession = {
    id: input.id, userId: input.userId ?? "guest-local", programmeId: input.activePlan.id,
    templateId: `session-construction-${contract.role}`, planSessionIndex: input.sessionIndex,
    planMesocycleId: resolved.planning.mesocycleId, planMicrocycleNumber: resolved.planning.microcycle.sequenceNumber, sessionKind: "planned",
    name: contract.name, startedAt: input.startedAt, updatedAt: input.startedAt, syncState: "local", exercises: exerciseLogs,
    notes: sessionNotes(contract, input.activePlan),
  };
  return isValidRecoveryWorkout(session, contract.role, input.exercises) && isWithinContract(session, contract) ? session : null;
}

export function constructSessionContract(planning: CurrentPlanningInput): SessionContract {
  const role = sessionRoleForPlan(planning.sessionRole);
  const phase = planning.mesocycleId;
  const strengthFocused = phase.startsWith("strength_") || phase.startsWith("powerbuilding_strength") || phase.includes("intensification");
  const calibration = phase.includes("calibration") || phase.includes("foundation");
  const deload = phase.includes("transition");
  const requiredSlots = slotsFor(role, strengthFocused);
  const optionalSlots: Slot[] = role === "full_body" ? [{ pattern: "isolation", role: "isolation", protected: false, optional: true, target: "low-cost priority muscle" }] : [{ pattern: "core", role: "structural", protected: false, optional: true, target: "structural support" }];
  const base = calibration ? { min: 8, target: 10, max: 15, exercises: 3, duration: 50 } : deload ? { min: 5, target: 8, max: 12, exercises: 3, duration: 45 } : strengthFocused ? { min: 8, target: 12, max: 18, exercises: 4, duration: 70 } : { min: 10, target: 15, max: 22, exercises: 5, duration: 65 };
  return {
    role, name: labels[role], primaryTarget: requiredSlots[0]?.target ?? labels[role], secondaryTargets: requiredSlots.slice(1, 3).map((slot) => slot.target), requiredSlots, optionalSlots,
    minimumExercises: calibration || deload ? 2 : 3, targetExercises: base.exercises, maximumExercises: strengthFocused ? 6 : 8,
    workingSetBudget: { min: base.min, target: base.target, max: base.max }, durationMinutes: { min: Math.max(25, base.duration - 20), target: base.duration, max: base.duration + 15 },
    removalOrder: ["optional isolation", "structural support", "secondary developmental work", "back-off volume"],
    stopConditions: ["pain or unsafe technique", "rep drop-off exceeds the exercise limit", "primary work is complete and time or global performance is limited"],
  };
}

export function sessionRoleForPlan(sessionRole: string): RecoverySessionRole {
  const value = sessionRole.toLowerCase();
  if (value.includes("push") || value.includes("bench")) return "push";
  if (value.includes("pull") || value.includes("back")) return "pull";
  if (value.includes("squat") || value.includes("deadlift") || value.includes("lower")) return "lower";
  if (value.includes("leg")) return "legs";
  if (value.includes("upper")) return "upper";
  if (value.includes("arm")) return "arms";
  return "full_body";
}

function slotsFor(role: RecoverySessionRole, strengthFocused: boolean): Slot[] {
  const primary: ConstructionRole = strengthFocused ? "primary_strength" : "primary_hypertrophy";
  const required = (pattern: MovementPattern, exerciseRole: ConstructionRole, target: string): Slot => ({ pattern, role: exerciseRole, protected: exerciseRole === primary, target });
  if (role === "push") return [required("horizontal_push", primary, "horizontal pressing"), required("vertical_push", "secondary_developmental", "vertical pressing"), required("isolation", "isolation", "chest, shoulder or triceps")];
  if (role === "pull") return [required("horizontal_pull", primary, "horizontal pulling"), required("vertical_pull", "secondary_developmental", "vertical pulling"), required("isolation", "isolation", "back or biceps")];
  if (role === "legs" || role === "lower") return [required("squat", primary, "knee-dominant lower body"), required("hinge", "secondary_developmental", "posterior chain"), required("lunge", "secondary_developmental", "single-leg lower body")];
  if (role === "upper") return [required("horizontal_push", primary, "upper-body pressing"), required("horizontal_pull", "secondary_developmental", "upper-body pulling"), required("vertical_push", "secondary_developmental", "shoulders")];
  if (role === "arms") return [required("isolation", primary, "biceps"), required("isolation", "secondary_developmental", "triceps"), required("vertical_push", "secondary_developmental", "shoulders")];
  return [required("squat", primary, "lower body"), required("horizontal_push", "secondary_developmental", "pressing"), required("horizontal_pull", "secondary_developmental", "pulling")];
}

function selectSessionExercises(contract: SessionContract, catalogue: Exercise[], plan: ActiveTrainingPlan): { exercise: Exercise; slot: Slot; interventionKey?: string }[] | null {
  const selected: { exercise: Exercise; slot: Slot; interventionKey?: string }[] = [];
  for (const slot of contract.requiredSlots) {
    const candidate = selectForSlot(slot, catalogue, plan, selected);
    if (!candidate) return null;
    selected.push(candidate);
  }
  for (const slot of contract.optionalSlots) {
    if (selected.length >= contract.targetExercises) break;
    const candidate = selectForSlot(slot, catalogue, plan, selected);
    if (candidate) selected.push(candidate);
  }
  return selected.length >= contract.minimumExercises && selected.length <= contract.maximumExercises ? selected : null;
}

function selectForSlot(slot: Slot, catalogue: Exercise[], plan: ActiveTrainingPlan, selected: Array<{ exercise: Exercise }>): { exercise: Exercise; slot: Slot; interventionKey?: string } | null {
  const candidates = catalogue.filter((exercise) => exercise.movementPattern === slot.pattern && exercise.suitability.includes(plan.experienceLevel) && !selected.some((item) => item.exercise.id === exercise.id));
  const resolved = resolveInterventionCandidates({ candidates, interventions: plan.recommendationState?.exerciseInterventions ?? [], currentMesocycleId: plan.currentMesocycleId ?? "" });
  const candidate = resolved.sort((a, b) => exerciseScore(b.exercise, slot) + b.score - exerciseScore(a.exercise, slot) - a.score || a.exercise.id.localeCompare(b.exercise.id))[0];
  return candidate ? { exercise: candidate.exercise, slot, interventionKey: candidate.interventionKey } : null;
}

function exerciseScore(exercise: Exercise, slot: Slot): number {
  // Equipment is deliberately absent: the product assumes unrestricted access.
  return (exercise.fatigueCost === "low" ? 8 : exercise.fatigueCost === "moderate" ? 5 : 2) + (exercise.tier === "A" ? 6 : exercise.tier === "B" ? 3 : 1) + (slot.role === "isolation" && exercise.role === "isolation" ? 12 : 0) + (slot.role === "primary_strength" && exercise.role === "primary_compound" ? 12 : 0);
}

function createExerciseLog(exercise: Exercise, slot: Slot, index: number, planning: CurrentPlanningInput, input: Parameters<typeof buildRecoveryWorkoutSession>[0], interventionKey?: string): WorkoutExerciseLog {
  const base = resolveWorkoutExerciseSettings(exercise, input.appSettings);
  const settings = settingsForSlot(base, slot);
  const previous = resolveCanonicalLoadEvidence(input.history, exercise.id);
  const load = exercise.kind === "bodyweight" ? 0 : previous?.load ?? 0;
  const prescribedSetTargets = exactTargets({ sets: settings.requiredWorkSets, repMin: settings.repRange.min, repMax: settings.repRange.max, mesocycleId: planning.mesocycleId });
  const method = selectSetMethod({ mesocycleId: planning.mesocycleId, experience: input.activePlan.experienceLevel, exerciseRole: exercise.role, sessionRole: slot.target });
  return { id: `${input.id}-exercise-${index + 1}`, exerciseId: exercise.id, exerciseName: exercise.name, settings, load, loadKnown: exercise.kind === "bodyweight" || previous != null, prescribedSetTargets, sets: [], status: "active", origin: "planned", notes: `${slot.role}${slot.protected ? " · protected work" : " · optional/removable work"}. Method: ${method}. ${setMethodExplanation(method)} Exact targets: ${prescribedSetTargets.join("/")}.${interventionKey ? ` Intervention:${interventionKey}.` : ""} Stop for pain, unsafe technique, or excessive performance drop-off.` };
}

function settingsForSlot(base: ProgressionSettings, slot: Slot): ProgressionSettings {
  const prescription = slot.role === "primary_strength" ? { sets: 4, min: 3, max: 6 } : slot.role === "primary_hypertrophy" ? { sets: 3, min: 6, max: 12 } : slot.role === "secondary_developmental" ? { sets: 3, min: 8, max: 15 } : slot.role === "isolation" ? { sets: 2, min: 10, max: 20 } : { sets: 2, min: 8, max: 15 };
  return { ...base, requiredWorkSets: prescription.sets, recommendedMinSets: prescription.sets, recommendedMaxSets: prescription.sets, repRange: { min: prescription.min, max: prescription.max } };
}

function sessionNotes(contract: SessionContract, plan: ActiveTrainingPlan): string {
  const hierarchy = planningSummary(plan);
  return [`Session construction v1`, `macrocycle:${hierarchy.macrocycle}`, `mesocycle:${hierarchy.mesocycle}`, `microcycle:${hierarchy.microcycle}`, `session role:${hierarchy.sessionRole}`, `primary:${contract.primaryTarget}`, `secondary:${contract.secondaryTargets.join(", ")}`, `sets:${contract.workingSetBudget.target} target (${contract.workingSetBudget.min}-${contract.workingSetBudget.max})`, `duration:${contract.durationMinutes.target} min`, `remove:${contract.removalOrder.join(" > ")}`].join(" · ");
}

function isWithinContract(session: WorkoutSession, contract: SessionContract): boolean {
  const sets = session.exercises.reduce((total, exercise) => total + exercise.settings.requiredWorkSets, 0);
  return session.exercises.length >= contract.minimumExercises && session.exercises.length <= contract.maximumExercises && sets >= contract.workingSetBudget.min && sets <= contract.workingSetBudget.max;
}

export function isValidRecoveryWorkout(session: WorkoutSession, role: RecoverySessionRole, catalogue: Exercise[]): boolean {
  if (session.exercises.length < 2 || session.exercises.length > 8) return false;
  if (new Set(session.exercises.map((exercise) => exercise.exerciseId)).size !== session.exercises.length) return false;
  const resolved = session.exercises.map((log) => catalogue.find((exercise) => exercise.id === log.exerciseId));
  if (resolved.some((exercise) => !exercise)) return false;
  if (role === "push" && resolved.some((exercise) => exercise?.movementPattern === "horizontal_pull" || exercise?.movementPattern === "vertical_pull")) return false;
  if (role === "pull" && resolved.some((exercise) => exercise?.movementPattern === "horizontal_push" || exercise?.movementPattern === "vertical_push")) return false;
  return session.exercises.every((exercise) => exercise.settings.requiredWorkSets > 0 && exercise.settings.repRange.min > 0 && exercise.settings.repRange.max >= exercise.settings.repRange.min && Number.isFinite(exercise.load));
}
