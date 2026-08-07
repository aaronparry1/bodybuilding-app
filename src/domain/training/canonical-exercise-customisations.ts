import type { CanonicalActivePlanCarrier, CanonicalExerciseCustomisation, CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";

export function reapplyCanonicalExerciseCustomisations(sessions: readonly CanonicalPlannedSessionSnapshot[], customisations: readonly CanonicalExerciseCustomisation[], revision: number): CanonicalPlannedSessionSnapshot[] {
  return sessions.map((session) => {
    let slots = sourceSlots(session.prescriptionSnapshot);
    for (const edit of customisations) {
      if (edit.action === "replace" && edit.sourceExerciseId && edit.replacementExerciseId) {
        const replacementExerciseId = edit.replacementExerciseId;
        slots = slots.map((slot) => slot.exerciseId === edit.sourceExerciseId ? recalibratedReplacement(slot, replacementExerciseId) : slot);
      }
      else if (edit.action === "remove" && edit.sourceExerciseId) slots = slots.filter((slot) => slot.exerciseId !== edit.sourceExerciseId);
      else if (edit.action === "add" && edit.planSessionIndex === session.planSessionIndex && edit.slotSnapshot && !slots.some((slot) => slot.exerciseId === edit.replacementExerciseId)) slots = [...slots, { ...edit.slotSnapshot }];
    }
    return { ...session, revision, prescriptionSnapshot: { ...session.prescriptionSnapshot, slots: slots.map((slot, index) => ({ ...slot, index })) } };
  });
}

export function exerciseCustomisations(carrier: CanonicalActivePlanCarrier): readonly CanonicalExerciseCustomisation[] { return carrier.operational.exerciseCustomisations ?? []; }
function sourceSlots(snapshot: Readonly<Record<string, unknown>>): Array<Record<string, unknown>> { return Array.isArray(snapshot.slots) ? (snapshot.slots as Array<Record<string, unknown>>).map((slot) => ({ ...slot })) : []; }
function recalibratedReplacement(slot: Record<string, unknown>, replacementExerciseId: string): Record<string, unknown> { return { ...slot, exerciseId: replacementExerciseId, prescribedLoad: undefined, loadPrescription: { schemaVersion: "canonical_load_prescription_v1", state: "calibration_required", loadingMode: String(slot.loadingMode ?? "external_load"), instruction: "Establish a safe working load for this exercise.", reason: "replacement_requires_own_exercise_evidence", evidenceStatus: "incompatible" }, selection: { policyId: "canonical_user_exercise_edit_v1", suitability: "recalibration_required", reasons: ["user_selected", "history_kept_by_exercise_identity"], repeatReason: "not_repeated" } }; }
