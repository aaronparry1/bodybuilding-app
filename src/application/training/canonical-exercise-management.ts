import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { validateCanonicalActivePlan, type CanonicalActivePlanCarrier } from "@/domain/training/canonical-active-plan-carrier";
import { withCanonicalCalibrationProtocol } from "@/domain/training/canonical-load-prescription";
import type { Exercise } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";

export type ExerciseEditScope = "current_session" | "future_programme";
export type ExerciseEditAction = "replace" | "add" | "remove";
export type ExerciseCompatibility = "equivalent" | "recalibration_required" | "invalid";
export type ExerciseEditCommand = Readonly<{
  action: ExerciseEditAction;
  scope: ExerciseEditScope;
  planId: string;
  expectedPlanRevision: number;
  operationId: string;
  occurredAt: string;
  plannedSessionId?: string;
  recordedSessionId?: string;
  expectedLedgerVersion?: number;
  slotId?: string;
  sourceExerciseId?: string;
  exerciseId?: string;
}>;
export type ExerciseEditResult = Readonly<{
  status: "applied" | "idempotent" | "rejected" | "retryable";
  reason: string;
  changedSessions: number;
  planRevision?: number;
  ledgerVersion?: number;
}>;

type Slot = Record<string, unknown>;

export function availableExerciseCatalogue(): Exercise[] {
  const byId = new Map([...exerciseLibrary, ...customExerciseRepository.listAll()].map((exercise) => [exercise.id, exercise]));
  return [...byId.values()];
}

export function rankExerciseReplacements(slot: Readonly<Slot>, equipment: readonly string[], catalogue = availableExerciseCatalogue()) {
  const current = catalogue.find((exercise) => exercise.id === slot.exerciseId);
  return catalogue
    .filter((exercise) => exercise.id !== slot.exerciseId)
    .map((exercise) => ({ exercise, compatibility: compatibility(current, exercise, slot, equipment) }))
    .filter((candidate) => candidate.compatibility !== "invalid")
    .sort((left, right) => compatibilityRank(left.compatibility) - compatibilityRank(right.compatibility) || left.exercise.name.localeCompare(right.exercise.name));
}

export function editCanonicalExercise(command: ExerciseEditCommand): ExerciseEditResult {
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved" || loaded.carrier.planId !== command.planId) return rejected("canonical_plan_unavailable");
  if (command.scope === "current_session") return editCurrentSession(command, loaded.carrier);
  return editFutureProgramme(command, loaded.carrier);
}

function editCurrentSession(command: ExerciseEditCommand, carrier: CanonicalActivePlanCarrier): ExerciseEditResult {
  if (!command.recordedSessionId || command.expectedLedgerVersion === undefined) return rejected("active_session_required");
  const aggregate = canonicalRecordedSessionLedger.get(command.recordedSessionId);
  if (aggregate.status !== "found" || aggregate.session.planId !== carrier.planId) return rejected("active_session_required");
  if (aggregate.events.some((event) => event.operationId === command.operationId)) {
    return { status: "idempotent", reason: "edit_already_applied", changedSessions: 0, ledgerVersion: aggregate.session.version };
  }
  if (aggregate.session.version !== command.expectedLedgerVersion) return rejected("stale_ledger_version");
  const changed = editSnapshot(aggregate.session.prescriptionSnapshot, command, carrier);
  if (changed.status !== "changed") return { status: changed.status === "unchanged" ? "idempotent" : "rejected", reason: changed.reason, changedSessions: 0, ledgerVersion: aggregate.session.version };
  if (performedSlotIds(aggregate.events).has(command.slotId ?? "")) return rejected("performed_exercise_cannot_be_changed");
  const saved = canonicalRecordedSessionLedger.adjustActivePrescription(command.recordedSessionId, aggregate.session.version, command.operationId, command.occurredAt, changed.snapshot, { action: command.action, scope: command.scope, slotId: command.slotId ?? null, exerciseId: command.exerciseId ?? null, originalPrescriptionHash: aggregate.session.prescriptionHash });
  if (saved.status === "duplicate") return { status: "idempotent", reason: "edit_already_applied", changedSessions: 0, ledgerVersion: saved.session.version };
  if (saved.status !== "saved") return { status: saved.status === "stale" || saved.status === "storage_failure" ? "retryable" : "rejected", reason: saved.reason ?? saved.status, changedSessions: 0 };
  canonicalActivePlanState.hydrate();
  return { status: "applied", reason: changed.reason, changedSessions: 1, ledgerVersion: saved.session.version };
}

function editFutureProgramme(command: ExerciseEditCommand, carrier: CanonicalActivePlanCarrier): ExerciseEditResult {
  if (carrier.revision !== command.expectedPlanRevision) return rejected("stale_plan_revision");
  const sourceSession = carrier.plannedSessions.find((session) => session.id === command.plannedSessionId);
  const sourceSlots = Array.isArray(sourceSession?.prescriptionSnapshot.slots) ? sourceSession.prescriptionSnapshot.slots as Slot[] : [];
  const sourceExerciseId = sourceSlots.find((slot) => String(slot.id) === command.slotId)?.exerciseId ?? command.sourceExerciseId;
  if (command.action !== "add" && typeof sourceExerciseId !== "string") return rejected("exercise_slot_not_found");
  let changedSessions = 0;
  let failure: string | null = null;
  const plannedSessions = carrier.plannedSessions.map((session) => {
    if (command.action === "add" && session.id !== command.plannedSessionId) return session;
    const sessionSlots = Array.isArray(session.prescriptionSnapshot.slots) ? session.prescriptionSnapshot.slots as Slot[] : [];
    const targetSlot = command.action === "add" ? command.slotId : sessionSlots.find((slot) => slot.exerciseId === sourceExerciseId)?.id;
    if (command.action !== "add" && !targetSlot) return session;
    const result = editSnapshot(session.prescriptionSnapshot, { ...command, slotId: String(targetSlot) }, carrier);
    if (result.status === "invalid") { failure ??= result.reason; return session; }
    if (result.status === "unchanged") return session;
    changedSessions += 1;
    return { ...session, revision: carrier.revision + 1, prescriptionSnapshot: result.snapshot };
  });
  if (failure) return rejected(failure);
  if (!changedSessions) return { status: "idempotent", reason: "edit_already_applied", changedSessions: 0, planRevision: carrier.revision };
  const revision = carrier.revision + 1;
  const editedSession = plannedSessions.find((session) => session.id === command.plannedSessionId);
  const editedSlots = Array.isArray(editedSession?.prescriptionSnapshot.slots) ? editedSession.prescriptionSnapshot.slots as Slot[] : [];
  const addedSlot = command.action === "add" ? editedSlots.find((slot) => slot.exerciseId === command.exerciseId) : undefined;
  const journalEntry = { id: command.operationId, action: command.action, sourceExerciseId: typeof sourceExerciseId === "string" ? sourceExerciseId : undefined, replacementExerciseId: command.exerciseId, planSessionIndex: sourceSession?.planSessionIndex, slotSnapshot: addedSlot, occurredAt: command.occurredAt };
  const priorJournal = carrier.operational.exerciseCustomisations ?? [];
  const next = { ...carrier, revision, updatedAt: command.occurredAt, plannedSessions, progress: { ...carrier.progress, revision }, operational: { ...carrier.operational, exerciseCustomisations: [...priorJournal.filter((entry) => entry.id !== command.operationId), journalEntry] } };
  const valid = validateCanonicalActivePlan(next);
  if (valid.status !== "valid") return rejected(`invalid_programme_edit:${valid.reason}`);
  const saved = canonicalActivePlanV2Repository.saveAtomically(valid.carrier, carrier.revision);
  if (saved.status !== "saved") return { status: "retryable", reason: saved.status === "missing" ? "canonical_plan_save_failed" : saved.reason, changedSessions: 0 };
  canonicalActivePlanState.hydrate();
  return { status: "applied", reason: command.action === "replace" ? "future_exercises_replaced" : command.action === "add" ? "future_exercise_added" : "future_optional_exercises_removed", changedSessions, planRevision: revision };
}

function editSnapshot(snapshot: Readonly<Record<string, unknown>>, command: ExerciseEditCommand, carrier: CanonicalActivePlanCarrier): Readonly<{ status: "changed" | "unchanged" | "invalid"; reason: string; snapshot: Readonly<Record<string, unknown>> }> {
  const slots = Array.isArray(snapshot.slots) ? (snapshot.slots as Slot[]).map((slot) => ({ ...slot })) : [];
  const index = slots.findIndex((slot) => String(slot.id) === command.slotId);
  if (command.action !== "add" && index < 0) return { status: "unchanged", reason: "edit_already_applied", snapshot };
  if (command.action === "remove") {
    const slot = slots[index]!;
    if (!isOptional(slot)) return { status: "invalid", reason: "required_exercise_requires_replacement", snapshot };
    if (isGrouped(slot)) return { status: "invalid", reason: "grouped_exercise_requires_replacement", snapshot };
    slots.splice(index, 1);
    return { status: "changed", reason: "optional_exercise_removed", snapshot: reindex(snapshot, slots) };
  }
  const replacement = availableExerciseCatalogue().find((exercise) => exercise.id === command.exerciseId);
  if (!replacement) return { status: "invalid", reason: "exercise_not_found", snapshot };
  if (slots.some((slot, slotIndex) => slotIndex !== index && slot.exerciseId === replacement.id)) return { status: "invalid", reason: "duplicate_exercise_not_allowed", snapshot };
  if (command.action === "replace") {
    const current = availableExerciseCatalogue().find((exercise) => exercise.id === slots[index]!.exerciseId);
    const suitability = compatibility(current, replacement, slots[index]!, carrier.constraints.equipment);
    if (suitability === "invalid") return { status: "invalid", reason: "incompatible_replacement", snapshot };
    slots[index] = replacementSlot(slots[index]!, replacement, suitability);
    return { status: "changed", reason: suitability === "equivalent" ? "exercise_replaced" : "exercise_replaced_recalibration_required", snapshot: reindex(snapshot, slots) };
  }
  if (slots.length >= 8) return { status: "invalid", reason: "session_exercise_limit_reached", snapshot };
  const template = [...slots].reverse().find(isOptional);
  if (!template || !replacement.roles.some((role) => ["accessory", "isolation", "corrective", "secondary_compound"].includes(role))) return { status: "invalid", reason: "only_optional_exercises_can_be_added", snapshot };
  const newSlot = replacementSlot({ ...template, id: `${String(snapshot.sessionId)}:user-slot:${replacement.id}`, methodStructure: undefined, settings: { ...(template.settings as Record<string, unknown>), requiredSets: Math.min(2, Number((template.settings as Record<string, unknown>)?.requiredSets ?? 2)) }, reason: "user-added optional exercise" }, replacement, "recalibration_required");
  slots.push(newSlot);
  return { status: "changed", reason: "optional_exercise_added", snapshot: reindex(snapshot, slots) };
}

function replacementSlot(slot: Slot, exercise: Exercise, suitability: Exclude<ExerciseCompatibility, "invalid">): Slot {
  const settings = slot.settings as Record<string, unknown>;
  const targetReps = Number(slot.targetReps ?? (settings?.repRange as Record<string, unknown> | undefined)?.min ?? 8);
  const workingSets = Number(settings?.requiredSets ?? settings?.requiredWorkSets ?? 1);
  const bodyweight = exercise.kind === "bodyweight";
  const loadPrescription = bodyweight
    ? { schemaVersion: "canonical_load_prescription_v1", state: "bodyweight", loadingMode: "bodyweight", instruction: "Use controlled bodyweight repetitions." }
    : withCanonicalCalibrationProtocol({ schemaVersion: "canonical_load_prescription_v1", state: "calibration_required", loadingMode: String(slot.loadingMode ?? "external_load"), instruction: "Establish a safe working load for this exercise.", reason: suitability === "equivalent" ? "replacement_requires_own_exercise_evidence" : "incompatible_mechanics", evidenceStatus: "incompatible" }, targetReps, workingSets);
  return { ...slot, exerciseId: exercise.id, exerciseRole: exercise.roles.includes(String(slot.exerciseRole) as never) ? slot.exerciseRole : exercise.roles[0], prescribedLoad: undefined, loadPrescription, selection: { policyId: "canonical_user_exercise_edit_v1", suitability, reasons: ["user_selected", "history_kept_by_exercise_identity"], repeatReason: "not_repeated" } };
}

function compatibility(current: Exercise | undefined, candidate: Exercise, slot: Readonly<Slot>, equipment: readonly string[]): ExerciseCompatibility {
  if (!candidate.equipment.some((item) => equipment.includes(item)) || !candidate.roles.includes(String(slot.exerciseRole) as never)) return "invalid";
  if (!current) return "recalibration_required";
  const samePattern = candidate.movementPattern === current.movementPattern;
  const sameTarget = candidate.primaryMuscles.some((muscle) => current.primaryMuscles.includes(muscle));
  if (!sameTarget) return "invalid";
  return samePattern ? "equivalent" : "recalibration_required";
}

function reindex(snapshot: Readonly<Record<string, unknown>>, slots: Slot[]): Readonly<Record<string, unknown>> {
  return { ...snapshot, slots: slots.map((slot, index) => ({ ...slot, index })) };
}
function isOptional(slot: Readonly<Slot>): boolean { return slot.constructionRole === "accessory" && slot.exerciseRole !== "primary_compound"; }
function isGrouped(slot: Readonly<Slot>): boolean { const structure = slot.methodStructure as Record<string, unknown> | undefined; return Boolean(structure && structure.kind !== "standalone"); }
function compatibilityRank(value: ExerciseCompatibility): number { return value === "equivalent" ? 0 : value === "recalibration_required" ? 1 : 2; }
function performedSlotIds(events: readonly { type: string; payload: Readonly<Record<string, unknown>> }[]): Set<string> { return new Set(events.filter((event) => event.type === "performance").map((event) => String(event.payload.slotId))); }
function rejected(reason: string): ExerciseEditResult { return { status: "rejected", reason, changedSessions: 0 }; }
