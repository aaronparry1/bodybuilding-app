import { exerciseDisplayName, loadingModeDisplayName, methodDisplayName, sessionRoleDisplayName } from "@/application/training/display-labels";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";

export type WorkoutLoadSemantic = "external_load" | "bodyweight" | "added_load" | "assistance" | "autoregulated" | "unavailable";

export type WorkoutSetPresentation = Readonly<{
  id: string;
  number: number;
  target: string;
  targetReps: number;
  prescribedLoad: number | null;
  defaultLoad: number | null;
  loadLabel: string;
  loadInputLabel: string;
  loadSemantic: WorkoutLoadSemantic;
  requiresLoadInput: boolean;
  unit: "kg" | "lb";
  previous: string | null;
  restSeconds: number;
  actualReps: number | null;
  actualLoad: number | null;
  state: "current" | "completed" | "upcoming";
  role: "standard" | "top_set" | "back_off" | "activation" | "mini_set";
}>;

export type WorkoutCalibrationPresentation = Readonly<{
  required: boolean;
  title: string;
  instruction: string;
  rampInstruction: string;
  successCriteria: string;
  targetReps: number;
  evidenceStatus: string;
}>;

export type WorkoutMethodExecutionPresentation = Readonly<{
  policyId: string;
  kind: "standalone" | "linked_rounds" | "rest_pause";
  groupId: string | null;
  sequenceLabel: string | null;
  rounds: number;
  intraMethodRestSeconds: number | null;
  interRoundRestSeconds: number;
  instruction: string;
}>;

export type WorkoutExercisePresentation = Readonly<{
  id: string;
  order: number;
  name: string;
  method: string;
  groupType: "straight_set" | "superset" | "triset" | "giant_set" | "circuit";
  methodExecution: WorkoutMethodExecutionPresentation;
  loadState: string;
  loadSemantic: WorkoutLoadSemantic;
  previousPerformance: string | null;
  coachingNote: string | null;
  calibration: WorkoutCalibrationPresentation | null;
  sets: readonly WorkoutSetPresentation[];
}>;

export type WorkoutPresentation = Readonly<{
  id: string;
  title: string;
  purpose: string;
  lifecycle: "planned" | "starting" | "active" | "paused" | "completed" | "unavailable";
  completedSets: number;
  totalSets: number;
  progressPercent: number;
  finishAllowed: boolean;
  finishBlockedReason: string | null;
  exercises: readonly WorkoutExercisePresentation[];
  estimatedDurationMinutes: number | null;
  elapsedSeconds: number;
  displayUnit: "kg" | "lb";
}>;

type SnapshotSlot = Readonly<Record<string, unknown>>;

export function projectCanonicalWorkoutPresentation(input: Readonly<{
  session: CanonicalRecordedSession | null;
  snapshot: Readonly<Record<string, unknown>>;
  events?: readonly CanonicalRecordedSessionEvent[];
  evidence?: readonly CanonicalProgressEvidence[];
  displayUnit?: "kg" | "lb";
  now?: number;
}>): WorkoutPresentation {
  const events = input.events ?? [];
  const performance = effectiveCanonicalPerformedWork(events);
  const displayUnit = input.displayUnit ?? "kg";
  const slots = Array.isArray(input.snapshot.slots) ? input.snapshot.slots as SnapshotSlot[] : [];
  const projectedExercises = slots.slice().sort((left, right) => number(left.index, 0) - number(right.index, 0)).map((slot, index) => {
    const settings = object(slot.settings);
    const range = object(settings.repRange);
    const min = number(range.min, 1);
    const max = number(range.max, min);
    const requiredSets = Math.max(1, number(settings.requiredSets, number(settings.requiredWorkSets, 1)));
    const restSeconds = number(object(slot.rest).seconds, 90);
    const methodExecution = methodExecutionPresentation(slot, requiredSets, restSeconds);
    const loadPrescription = object(slot.loadPrescription);
    const loadingMode = String(loadPrescription.loadingMode ?? slot.loadingMode ?? "unavailable");
    const prescribedBaseLoad = numberOrNull(slot.prescribedLoad) ?? numberOrNull(loadPrescription.prescribedBaseLoad);
    const loadState = String(loadPrescription.state ?? loadingMode);
    const loadSemantic = loadSemanticFor(loadState, loadingMode);
    const actual = performance.filter((event) => String(event.payload.slotId) === String(slot.id));
    const compatibleEvidence = latestCompatibleLoadEvidence(input.evidence ?? [], String(slot.exerciseId), loadingMode, input.session?.recordedSessionId);
    const performedLoad = actual.map((event) => numberOrNull(event.payload.load)).find((load) => load !== null && load > 0) ?? null;
    const evidenceLoad = compatibleEvidence ? numberOrNull(compatibleEvidence.observations.load) : null;
    const baseDefaultLoad = prescribedBaseLoad ?? performedLoad ?? evidenceLoad;
    const exactTargets = Array.isArray(slot.exactTargets) ? slot.exactTargets : [];
    const contract = object(object(slot.methodStructure).contract);
    const setRoles = Array.isArray(contract.setRoles) ? contract.setRoles : [];
    const sets = Array.from({ length: requiredSets }, (_, offset) => {
      const setNumber = offset + 1;
      const event = actual.find((candidate) => String(candidate.payload.setId ?? "") === `${String(slot.id)}:set:${setNumber}` || number(candidate.payload.setOrder, 0) === setNumber);
      const targetReps = number(exactTargets[offset], number(slot.targetReps, min));
      const target = methodExecution.kind === "rest_pause"
        ? `${setNumber === 1 ? "Activation" : `Mini-set ${setNumber - 1}`} · ${targetReps} reps${setNumber === 1 ? "" : ` · ${methodExecution.intraMethodRestSeconds ?? 0} sec`}`
        : methodExecution.kind === "linked_rounds"
          ? `Round ${setNumber} · ${targetReps} reps`
          : `${targetReps} reps`;
      const displayedPrescription = toDisplayLoad(prescribedBaseLoad, displayUnit);
      const displayedDefault = toDisplayLoad(baseDefaultLoad, displayUnit);
      const actualBaseLoad = event ? numberOrNull(event.payload.load) : null;
      const actualLoad = loadSemantic === "bodyweight" ? null : toDisplayLoad(actualBaseLoad, displayUnit);
      const completed = Boolean(event);
      return {
        id: `${String(slot.id)}:set:${setNumber}`,
        number: setNumber,
        target,
        targetReps,
        prescribedLoad: displayedPrescription,
        defaultLoad: displayedDefault,
        loadLabel: loadLabelFor(loadState, loadSemantic, displayedPrescription, displayedDefault, displayUnit),
        loadInputLabel: loadInputLabelFor(loadSemantic),
        loadSemantic,
        requiresLoadInput: ["external_load", "added_load", "assistance", "autoregulated"].includes(loadSemantic),
        unit: displayUnit,
        previous: compatibleEvidence ? performanceLabel(compatibleEvidence, displayUnit, loadSemantic) : null,
        restSeconds,
        actualReps: event ? numberOrNull(event.payload.reps) : null,
        actualLoad,
        state: completed ? "completed" as const : "upcoming" as const,
        role: (["top_set", "back_off", "activation", "mini_set"].includes(String(setRoles[offset])) ? String(setRoles[offset]) : "standard") as WorkoutSetPresentation["role"],
      };
    });
    const protocol = object(loadPrescription.protocol);
    const calibrationRequired = loadState === "calibration_required" && baseDefaultLoad === null;
    const calibration = loadState === "calibration_required" ? {
      required: calibrationRequired,
      title: calibrationRequired ? "Find today’s starting load" : "Starting load ready",
      instruction: calibrationRequired ? `Build up gradually, then choose a load you can complete for ${number(protocol.targetReps, sets[0]?.targetReps ?? min)} controlled reps.` : "A compatible completed working set supplies today’s starting load.",
      rampInstruction: String(protocol.safeAdjustment ?? "Use gradual warm-up attempts. Ramp attempts do not count as working sets."),
      successCriteria: String(protocol.successCriteria ?? "Confirm a controlled working load before the first counted set."),
      targetReps: number(protocol.targetReps, sets[0]?.targetReps ?? min),
      evidenceStatus: compatibleEvidence ? "compatible_evidence" : String(loadPrescription.evidenceStatus ?? "missing"),
    } satisfies WorkoutCalibrationPresentation : null;
    return {
      id: String(slot.id),
      order: index + 1,
      name: exerciseDisplayName(String(slot.exerciseId)),
      method: methodDisplayName(String(slot.method)),
      groupType: groupTypeForMethod(String(slot.method)),
      methodExecution,
      loadState: loadStateLabel(loadState, loadSemantic),
      loadSemantic,
      previousPerformance: compatibleEvidence ? performanceLabel(compatibleEvidence, displayUnit, loadSemantic) : null,
      coachingNote: actionableCoaching(slot, sets),
      calibration,
      sets,
    };
  });
  const nextSetId = methodExecutionOrder(projectedExercises).find((setId) =>
    projectedExercises.some((exercise) => exercise.sets.some((set) => set.id === setId && set.state !== "completed")));
  const exercises = projectedExercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => set.id === nextSetId ? { ...set, state: "current" as const } : set),
  }));
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const completedSets = exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.state === "completed").length, 0);
  const lifecycle = input.session ? input.session.status === "started" ? "active" : input.session.status === "paused" ? "paused" : input.session.status === "completed" ? "completed" : "unavailable" : "planned";
  const constructedDurationMinutes = numberOrNull(input.snapshot.estimatedDurationMinutes);
  const estimatedDurationMinutes = constructedDurationMinutes && constructedDurationMinutes > 0
    ? Math.round(constructedDurationMinutes)
    : totalSets ? Math.max(1, Math.round((totalSets * 60 + exercises.reduce((sum, exercise) => sum + exercise.sets.reduce((setSum, set) => setSum + set.restSeconds, 0), 0)) / 60)) : null;
  const elapsedSeconds = input.session ? activeElapsedSeconds(input.session, events, input.now ?? Date.now()) : 0;
  return {
    id: input.session?.recordedSessionId ?? String(input.snapshot.sessionId ?? "planned-workout"),
    title: sessionRoleDisplayName(String(input.snapshot.role ?? input.session?.role ?? "Training session")),
    purpose: String(input.snapshot.purpose ?? "Complete the exact working-set prescription with controlled technique."),
    lifecycle,
    completedSets,
    totalSets,
    progressPercent: totalSets ? Math.round((completedSets / totalSets) * 100) : 0,
    finishAllowed: completedSets > 0 && (lifecycle === "active" || lifecycle === "paused"),
    finishBlockedReason: completedSets > 0 ? null : "Complete at least one valid working set before finishing.",
    exercises,
    estimatedDurationMinutes,
    elapsedSeconds,
    displayUnit,
  };
}

export function activeElapsedSeconds(session: CanonicalRecordedSession, events: readonly CanonicalRecordedSessionEvent[], now: number): number {
  const startedAt = session.startedAt ? Date.parse(session.startedAt) : Date.parse(session.createdAt);
  if (!Number.isFinite(startedAt)) return 0;
  let activeFrom: number | null = startedAt;
  let elapsed = 0;
  for (const event of events) {
    const at = Date.parse(event.occurredAt);
    if (!Number.isFinite(at)) continue;
    if (event.type === "paused" && activeFrom !== null) { elapsed += Math.max(0, at - activeFrom); activeFrom = null; }
    if (event.type === "resumed" && activeFrom === null) activeFrom = at;
    if (event.type === "completed" && activeFrom !== null) { elapsed += Math.max(0, at - activeFrom); activeFrom = null; }
  }
  if (activeFrom !== null && session.status === "started") elapsed += Math.max(0, now - activeFrom);
  return Math.min(24 * 60 * 60, Math.floor(elapsed / 1000));
}

export function displayLoadFromBaseKg(load: number, unit: "kg" | "lb"): number { return unit === "lb" ? round(load * 2.2046226218, 1) : round(load, 2); }
export function baseKgFromDisplayLoad(load: number, unit: "kg" | "lb"): number { return unit === "lb" ? round(load / 2.2046226218, 4) : round(load, 4); }

function latestCompatibleLoadEvidence(evidence: readonly CanonicalProgressEvidence[], exerciseId: string, loadingMode: string, currentSessionId?: string): CanonicalProgressEvidence | null {
  return evidence.filter((item) => item.kind === "performance"
      && item.sessionId !== currentSessionId
      && item.observations.exerciseId === exerciseId
      && item.observations.loadingMode === loadingMode
      && item.observations.completion === "complete"
      && typeof item.observations.load === "number"
      && item.observations.load > 0)
    .sort((left, right) => right.observedAt.localeCompare(left.observedAt) || right.evidenceId.localeCompare(left.evidenceId))[0] ?? null;
}

function performanceLabel(evidence: CanonicalProgressEvidence, unit: "kg" | "lb", semantic: WorkoutLoadSemantic): string {
  const reps = number(evidence.observations.reps, 0);
  if (semantic === "bodyweight") return `${reps} reps · Bodyweight`;
  const load = toDisplayLoad(numberOrNull(evidence.observations.load), unit);
  const prefix = semantic === "assistance" ? "assisted" : semantic === "added_load" ? "added" : "";
  return load === null ? `${reps} reps` : `${reps} reps · ${prefix ? `${prefix} ` : ""}${load} ${unit}`;
}

function actionableCoaching(slot: SnapshotSlot, sets: readonly WorkoutSetPresentation[]): string | null {
  const stopRule = object(slot.stopRule);
  if (Object.keys(stopRule).length) return "Stop if the prescribed drop-off or technique rule is reached.";
  if (sets[0]?.restSeconds) return null;
  return null;
}

function loadSemanticFor(loadState: string, loadingMode: string): WorkoutLoadSemantic {
  const normalized = `${loadState}:${loadingMode}`.toLowerCase();
  if (normalized.includes("assisted")) return "assistance";
  if (normalized.includes("weighted_bodyweight") || normalized.includes("added_load")) return "added_load";
  if (loadState === "bodyweight" || loadingMode === "bodyweight") return "bodyweight";
  if (loadState === "autoregulated") return "autoregulated";
  if (loadState === "unavailable") return "unavailable";
  return "external_load";
}

function loadStateLabel(loadState: string, semantic: WorkoutLoadSemantic): string {
  if (semantic === "bodyweight") return "Bodyweight";
  if (semantic === "added_load") return "Weighted bodyweight";
  if (semantic === "assistance") return "Assisted";
  if (loadState === "calibration_required") return "First-exposure calibration";
  if (loadState === "established") return "Prescribed load";
  if (loadState === "autoregulated") return "Autoregulated load";
  if (loadState === "unavailable") return "Load unavailable";
  return loadingModeDisplayName(loadState);
}

function loadLabelFor(loadState: string, semantic: WorkoutLoadSemantic, prescribed: number | null, fallback: number | null, unit: "kg" | "lb"): string {
  if (semantic === "bodyweight") return "Bodyweight";
  if (semantic === "added_load") return fallback === null ? "Added load" : `+${fallback} ${unit}`;
  if (semantic === "assistance") return fallback === null ? "Assistance" : `${fallback} ${unit} assistance`;
  if (semantic === "autoregulated") return fallback === null ? "Choose by effort" : `${fallback} ${unit}`;
  if (semantic === "unavailable") return "Load unavailable";
  if (prescribed !== null) return `${prescribed} ${unit}`;
  if (fallback !== null) return `${fallback} ${unit} starting load`;
  if (loadState === "calibration_required") return "Find starting load";
  return "Load unavailable";
}

function loadInputLabelFor(semantic: WorkoutLoadSemantic): string {
  if (semantic === "added_load") return "Added load";
  if (semantic === "assistance") return "Assistance";
  return "Load";
}

function toDisplayLoad(load: number | null, unit: "kg" | "lb"): number | null { return load === null ? null : displayLoadFromBaseKg(load, unit); }
function round(value: number, places: number): number { const factor = 10 ** places; return Math.round(value * factor) / factor; }
function groupTypeForMethod(method: string): WorkoutExercisePresentation["groupType"] { if (/triset/i.test(method)) return "triset"; if (/super/i.test(method)) return "superset"; if (/giant/i.test(method)) return "giant_set"; if (/circuit/i.test(method)) return "circuit"; return "straight_set"; }
function methodExecutionPresentation(slot: SnapshotSlot, requiredSets: number, restSeconds: number): WorkoutMethodExecutionPresentation {
  const structure = object(slot.methodStructure);
  const kind = structure.kind === "linked_rounds" || structure.kind === "rest_pause" ? structure.kind : "standalone";
  const position = number(structure.position, 0);
  const sequenceLabel = kind === "linked_rounds" && (position === 1 || position === 2) ? String.fromCharCode(64 + position) : null;
  const intraMethodRestSeconds = kind === "linked_rounds" || kind === "rest_pause" ? number(structure.intraMethodRestSeconds, 0) : null;
  return {
    policyId: String(structure.policyId ?? "canonical_training_method_policy_v1"),
    kind,
    groupId: kind === "linked_rounds" ? String(structure.groupId ?? "") || null : null,
    sequenceLabel,
    rounds: number(structure.rounds, requiredSets),
    intraMethodRestSeconds,
    interRoundRestSeconds: number(structure.interRoundRestSeconds, restSeconds),
    instruction: String(structure.executionLabel ?? `${requiredSets} standalone working sets`),
  };
}

function methodExecutionOrder(exercises: readonly WorkoutExercisePresentation[]): string[] {
  const order: string[] = [];
  const consumedGroups = new Set<string>();
  for (const exercise of exercises) {
    const execution = exercise.methodExecution;
    if (execution.kind !== "linked_rounds" || !execution.groupId) {
      order.push(...exercise.sets.map((set) => set.id));
      continue;
    }
    if (consumedGroups.has(execution.groupId)) continue;
    const group = exercises
      .filter((candidate) => candidate.methodExecution.groupId === execution.groupId)
      .sort((left, right) => (left.methodExecution.sequenceLabel ?? "").localeCompare(right.methodExecution.sequenceLabel ?? ""));
    consumedGroups.add(execution.groupId);
    for (let round = 0; round < execution.rounds; round += 1) {
      for (const member of group) {
        const set = member.sets[round];
        if (set) order.push(set.id);
      }
    }
  }
  return order;
}
function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" ? value as Record<string, unknown> : {}; }
function number(value: unknown, fallback: number): number { return typeof value === "number" && Number.isFinite(value) ? value : fallback; }
function numberOrNull(value: unknown): number | null { return typeof value === "number" && Number.isFinite(value) ? value : null; }
