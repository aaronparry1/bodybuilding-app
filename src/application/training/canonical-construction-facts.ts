import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import type { CanonicalActivePlanCarrier } from "@/domain/training/canonical-active-plan-carrier";
import type { Exercise, Equipment } from "@/domain/training/models";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import type { ExercisePreferenceRecord } from "@/domain/training/exercise-preferences";

export const CANONICAL_CONSTRUCTION_INPUTS_SCHEMA = "canonical_construction_inputs_v1" as const;
export type CanonicalConstructionInputReferences = Readonly<{ schemaVersion: typeof CANONICAL_CONSTRUCTION_INPUTS_SCHEMA; athleteId: string; exerciseCatalogueSource: string; equipmentSource: string; limitationsSource: string; preferencesSource: string; progressEvidenceScope: string; establishedLoadSource: string }>;
export type CanonicalConstructionFacts = Readonly<{
  references: CanonicalConstructionInputReferences;
  exercises: readonly Exercise[];
  equipment: readonly Equipment[];
  limitations: readonly string[];
  exercisePreferences: Readonly<Record<string, ExercisePreferenceRecord>>;
  history: readonly never[];
  establishedLoads: Readonly<Record<string, number>>;
  loadEvidence: Readonly<Record<string, CanonicalLoadEvidence>>;
}>;

export function canonicalConstructionReferencesForPlan(plan: CanonicalActivePlanCarrier): CanonicalConstructionInputReferences {
  return plan.constructionInputs ?? { schemaVersion: CANONICAL_CONSTRUCTION_INPUTS_SCHEMA, athleteId: "local-athlete", exerciseCatalogueSource: "custom-exercise-repository:v1", equipmentSource: `plan-constraints:${plan.constraints.equipment.join(",")}`, limitationsSource: "app-settings:limitations:v1", preferencesSource: "app-settings:preferences:v1", progressEvidenceScope: `${plan.planId}:microcycle:${plan.microcycle.id}`, establishedLoadSource: "canonical-progress-evidence:v1" };
}

export function resolveCanonicalConstructionFacts(plan: CanonicalActivePlanCarrier): { status: "ready"; facts: CanonicalConstructionFacts } | { status: "unavailable"; reason: "canonical_exercise_catalogue_unavailable" | "canonical_equipment_unavailable" | "canonical_exercise_identity_unavailable" | "canonical_preferences_unavailable" } {
  const catalogue = customExerciseRepository.listAll();
  const equipment = plan.constraints.equipment;
  if (!catalogue.length) return { status: "unavailable", reason: "canonical_exercise_catalogue_unavailable" };
  if (!equipment.length) return { status: "unavailable", reason: "canonical_equipment_unavailable" };
  const context = plan.constructionContext;
  const exercises = context
    ? context.exerciseCatalogueIds.flatMap((id) => catalogue.find((exercise) => exercise.id === id) ?? [])
    : catalogue;
  if (context && exercises.length !== context.exerciseCatalogueIds.length) return { status: "unavailable", reason: "canonical_exercise_identity_unavailable" };
  const inferred = context ? null : inferHistoricalContext(plan);
  if (inferred?.preferencesUnknown) return { status: "unavailable", reason: "canonical_preferences_unavailable" };
  const limitations = context?.limitations ?? inferred?.limitations ?? [];
  const exercisePreferences = context?.exercisePreferences ?? {};
  const loads = resolveExerciseScopedLoadEvidence(plan, context?.initialEstablishedLoads ?? {}, context?.initialLoadEvidence ?? {});
  const recalibrationRequired = new Set(context?.recalibrationRequiredExerciseIds ?? []);
  const establishedLoads = Object.fromEntries(Object.entries(loads.establishedLoads).filter(([exerciseId]) => !recalibrationRequired.has(exerciseId)));
  const loadEvidence = Object.fromEntries(Object.entries(loads.loadEvidence).filter(([exerciseId]) => !recalibrationRequired.has(exerciseId)));
  return {
    status: "ready",
    facts: {
      references: canonicalConstructionReferencesForPlan(plan),
      exercises,
      equipment,
      limitations,
      exercisePreferences,
      history: [],
      establishedLoads,
      loadEvidence,
    },
  };
}

function resolveExerciseScopedLoadEvidence(
  plan: CanonicalActivePlanCarrier,
  initialLoads: Readonly<Record<string, number>>,
  initialEvidence: Readonly<Record<string, CanonicalLoadEvidence>>,
): Readonly<{ establishedLoads: Readonly<Record<string, number>>; loadEvidence: Readonly<Record<string, CanonicalLoadEvidence>> }> {
  const establishedLoads: Record<string, number> = {};
  const loadEvidence: Record<string, CanonicalLoadEvidence> = {};
  for (const [exerciseId, evidence] of Object.entries(initialEvidence)) {
    const load = initialLoads[exerciseId];
    if (evidence.exerciseId !== exerciseId || !Number.isFinite(load) || Number(load) <= 0 || evidence.observedLoad !== load || evidence.calibrationStatus !== "established") continue;
    establishedLoads[exerciseId] = Number(load);
    loadEvidence[exerciseId] = evidence;
  }
  for (const historical of inferredEstablishedLoadEvidence(plan)) {
    if (loadEvidence[historical.exerciseId]) continue;
    establishedLoads[historical.exerciseId] = historical.observedLoad;
    loadEvidence[historical.exerciseId] = historical;
  }
  const relevant = canonicalProgressEvidenceRepository.list(plan.planId)
    .filter((item) => item.kind === "performance")
    .filter((item) => typeof item.observations.exerciseId === "string"
      && typeof item.observations.load === "number"
      && Number(item.observations.load) > 0
      && typeof item.observations.reps === "number"
      && Number(item.observations.reps) > 0
      && item.observations.unit === "kg"
      && item.observations.completion === "complete"
      && item.observations.substitutionId == null
      && !["bodyweight", "autoregulated", "velocity_intent", "unavailable"].includes(String(item.observations.loadingMode)))
    .sort((a, b) => a.observedAt.localeCompare(b.observedAt) || a.evidenceId.localeCompare(b.evidenceId));
  const byExercise = new Map<string, typeof relevant>();
  for (const item of relevant) {
    const exerciseId = String(item.observations.exerciseId);
    const records = byExercise.get(exerciseId);
    if (records) records.push(item);
    else byExercise.set(exerciseId, [item]);
  }
  for (const [exerciseId, records] of byExercise) {
    const latest = records.at(-1);
    if (!latest || !latest.slotId || !latest.sessionId) continue;
    const sameMoment = records.filter((item) => item.observedAt === latest.observedAt);
    if (new Set(sameMoment.map((item) => `${item.observations.load}:${item.observations.unit}`)).size > 1) {
      delete establishedLoads[exerciseId];
      delete loadEvidence[exerciseId];
      continue;
    }
    const evidence: CanonicalLoadEvidence = {
      evidenceId: latest.evidenceId,
      evidenceVersion: latest.evidenceVersion,
      athleteId: latest.athleteId,
      exerciseId,
      sourceSessionId: latest.sessionId,
      sourceSlotId: latest.slotId,
      observedLoad: Number(latest.observations.load),
      observedReps: Number(latest.observations.reps),
      baseUnit: "kg",
      freshnessVersion: Math.max(1, records.length),
      calibrationStatus: "established",
    };
    establishedLoads[exerciseId] = evidence.observedLoad;
    loadEvidence[exerciseId] = evidence;
  }
  return { establishedLoads, loadEvidence };
}

function inferredEstablishedLoadEvidence(plan: CanonicalActivePlanCarrier): CanonicalLoadEvidence[] {
  const result = new Map<string, CanonicalLoadEvidence>();
  const snapshots = plan.plannedSessions.map((session) => session.prescriptionSnapshot);
  for (const snapshot of snapshots) {
    const slots = Array.isArray((snapshot as Record<string, unknown>).slots)
      ? (snapshot as { slots: readonly Record<string, unknown>[] }).slots
      : [];
    for (const slot of slots) {
      const prescription = slot.loadPrescription as Record<string, unknown> | undefined;
      const evidence = prescription?.state === "established" ? prescription.evidence as CanonicalLoadEvidence | undefined : undefined;
      const exerciseId = typeof slot.exerciseId === "string" ? slot.exerciseId : undefined;
      if (!exerciseId || !evidence || evidence.exerciseId !== exerciseId || !Number.isFinite(evidence.observedLoad) || evidence.observedLoad <= 0 || evidence.calibrationStatus !== "established") continue;
      result.set(exerciseId, evidence);
    }
  }
  return [...result.values()];
}

function inferHistoricalContext(plan: CanonicalActivePlanCarrier): Readonly<{ limitations: readonly string[]; preferencesUnknown: boolean }> {
  const limitations = new Set<string>();
  let preferencesUnknown = false;
  for (const session of plan.plannedSessions) {
    const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
    const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
    for (const slot of slots) {
      if (Array.isArray(slot.substitutionConstraints)) for (const value of slot.substitutionConstraints) if (typeof value === "string") limitations.add(value);
      const selection = slot.selection as Record<string, unknown> | undefined;
      const reasons = Array.isArray(selection?.reasons) ? selection.reasons : [];
      if (reasons.some((reason) => typeof reason === "string" && reason.startsWith("preference_score:") && reason !== "preference_score:0")) preferencesUnknown = true;
    }
  }
  return { limitations: [...limitations].sort(), preferencesUnknown };
}
