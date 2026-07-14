import type { MacrocycleSpec } from "@/domain/training/macrocycle-engine";
import type { MesocycleSpec, MesocycleId } from "@/domain/training/mesocycle-library";
import type { MicrocyclePlan } from "@/domain/training/microcycle-scheduler";
import type { Equipment, ExperienceLevel, ProgrammeGoal, UnitSystem } from "@/domain/training/models";

/** Persisted migration target. This module stores owner outputs; it makes no training decisions. */
export const CANONICAL_ACTIVE_PLAN_SCHEMA = "canonical_plan_v2" as const;
export type CanonicalActivePlanSchema = typeof CANONICAL_ACTIVE_PLAN_SCHEMA;

export type CanonicalPlannedSessionSnapshot = Readonly<{
  id: string;
  microcycleId: string;
  planSessionIndex: number;
  role: string;
  kind: "planned" | "extra" | "custom";
  status: "planned" | "open" | "completed";
  constructionVersion: string;
  revision: number;
  /** Output snapshot from Session Construction; runtime services/functions never cross persistence. */
  prescriptionSnapshot: Readonly<Record<string, unknown>>;
}>;

export type CanonicalProgressSnapshot = Readonly<{
  evidenceVersion: string;
  readinessReference?: string;
  decisionReference?: string;
  completionReference?: string;
  recoveryState?: string;
  revision: number;
}>;

export type CanonicalActivePlanCarrier = Readonly<{
  schema: CanonicalActivePlanSchema;
  planId: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  macrocycle: Readonly<{ id: string; output: MacrocycleSpec; owner: "Macrocycle" }>;
  mesocycle: Readonly<{ id: MesocycleId; output: MesocycleSpec; owner: "Mesocycle"; position: number; transitionReference?: string }>;
  microcycle: Readonly<{ id: string; output: MicrocyclePlan; owner: "Microcycle"; position: number; constructionVersion: string }>;
  plannedSessions: readonly CanonicalPlannedSessionSnapshot[];
  progress: CanonicalProgressSnapshot;
  constraints: Readonly<{
    goal: ProgrammeGoal;
    experienceLevel: ExperienceLevel;
    daysPerWeek: number;
    preferredSplit: string;
    equipment: readonly Equipment[];
    units: UnitSystem;
    targetDate?: string;
    customSequence?: readonly string[];
  }>;
  operational: Readonly<{ openWorkoutId?: string; migrationId?: string; recoverySourceReference?: string; syncRevision?: string }>;
}>;

export type CanonicalCarrierAssemblyInput = Readonly<{
  planId: string;
  createdAt: string;
  updatedAt: string;
  macrocycle: MacrocycleSpec & { id?: string };
  mesocycle: MesocycleSpec & { position?: number; transitionReference?: string };
  microcycle: MicrocyclePlan & { id?: string; position?: number; constructionVersion?: string };
  plannedSessions: readonly CanonicalPlannedSessionSnapshot[];
  progress: CanonicalProgressSnapshot;
  constraints: CanonicalActivePlanCarrier["constraints"];
  operational?: CanonicalActivePlanCarrier["operational"];
}>;

export type CanonicalCarrierValidation =
  | Readonly<{ status: "valid"; carrier: CanonicalActivePlanCarrier }>
  | Readonly<{ status: "invalid"; reason: CanonicalCarrierValidationCode; path?: string }>;

export type CanonicalCarrierValidationCode =
  | "invalid_schema" | "invalid_identity" | "invalid_timestamp" | "invalid_macrocycle"
  | "invalid_mesocycle" | "invalid_microcycle" | "mesocycle_link_mismatch" | "microcycle_link_mismatch"
  | "session_link_mismatch" | "session_role_mismatch" | "duplicate_session_id" | "duplicate_session_index"
  | "invalid_prescription_snapshot" | "invalid_progress_reference" | "legacy_authority_present" | "invalid_revision";

export type CanonicalDeepEquivalence = Readonly<{ status: "equivalent" } | { status: "different"; path: string }>;

export function compareCanonicalActivePlans(left: CanonicalActivePlanCarrier, right: CanonicalActivePlanCarrier): CanonicalDeepEquivalence {
  const a = serializeCanonicalActivePlan(left);
  const b = serializeCanonicalActivePlan(right);
  return a === b ? { status: "equivalent" } : { status: "different", path: "$" };
}

export function assembleCanonicalActivePlan(input: CanonicalCarrierAssemblyInput): CanonicalCarrierValidation {
  const carrier: CanonicalActivePlanCarrier = {
    schema: CANONICAL_ACTIVE_PLAN_SCHEMA,
    planId: input.planId,
    revision: input.progress.revision,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    macrocycle: { id: input.macrocycle.id ?? `${input.planId}:macrocycle`, output: input.macrocycle, owner: "Macrocycle" },
    mesocycle: { id: input.mesocycle.id, output: input.mesocycle, owner: "Mesocycle", position: input.mesocycle.position ?? 0, transitionReference: input.mesocycle.transitionReference },
    microcycle: { id: input.microcycle.id ?? `${input.planId}:microcycle:${input.microcycle.sequenceNumber}`, output: input.microcycle, owner: "Microcycle", position: input.microcycle.position ?? input.microcycle.sequenceNumber, constructionVersion: input.microcycle.constructionVersion ?? "microcycle_v1" },
    plannedSessions: input.plannedSessions,
    progress: input.progress,
    constraints: input.constraints,
    operational: input.operational ?? {},
  };
  return validateCanonicalActivePlan(carrier);
}

export function validateCanonicalActivePlan(value: unknown): CanonicalCarrierValidation {
  if (!value || typeof value !== "object") return { status: "invalid", reason: "invalid_identity" };
  const candidate = value as Partial<CanonicalActivePlanCarrier> & Record<string, unknown>;
  if (candidate.schema !== CANONICAL_ACTIVE_PLAN_SCHEMA) return { status: "invalid", reason: "invalid_schema", path: "schema" };
  if (typeof candidate.planId !== "string" || !candidate.planId) return { status: "invalid", reason: "invalid_identity", path: "planId" };
  if (typeof candidate.revision !== "number" || candidate.revision < 0) return { status: "invalid", reason: "invalid_revision", path: "revision" };
  if (typeof candidate.createdAt !== "string" || Number.isNaN(Date.parse(candidate.createdAt)) || typeof candidate.updatedAt !== "string" || Number.isNaN(Date.parse(candidate.updatedAt))) return { status: "invalid", reason: "invalid_timestamp" };
  if ("blocks" in candidate || "activeBlockId" in candidate || "currentBlock" in candidate || "nextBlock" in candidate || "annualWeek" in candidate || "trainingYear" in candidate) return { status: "invalid", reason: "legacy_authority_present" };
  if (!candidate.macrocycle || typeof candidate.macrocycle !== "object" || !candidate.mesocycle || typeof candidate.mesocycle !== "object") return { status: "invalid", reason: "invalid_macrocycle" };
  const meso = candidate.mesocycle as CanonicalActivePlanCarrier["mesocycle"];
  const micro = candidate.microcycle as CanonicalActivePlanCarrier["microcycle"] | undefined;
  if (!micro || micro.output.parentMesocycleId !== meso.id) return { status: "invalid", reason: "microcycle_link_mismatch", path: "microcycle.output.parentMesocycleId" };
  if (!Array.isArray(candidate.plannedSessions)) return { status: "invalid", reason: "session_link_mismatch" };
  const ids = new Set<string>(); const indexes = new Set<number>();
  for (const [index, session] of candidate.plannedSessions.entries()) {
    if (!session || session.microcycleId !== micro.id) return { status: "invalid", reason: "session_link_mismatch", path: `plannedSessions.${index}` };
    if (ids.has(session.id)) return { status: "invalid", reason: "duplicate_session_id", path: `plannedSessions.${index}.id` };
    if (indexes.has(session.planSessionIndex)) return { status: "invalid", reason: "duplicate_session_index", path: `plannedSessions.${index}.planSessionIndex` };
    if (typeof session.prescriptionSnapshot !== "object" || session.prescriptionSnapshot === null || typeof session.constructionVersion !== "string") return { status: "invalid", reason: "invalid_prescription_snapshot", path: `plannedSessions.${index}` };
    const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
    if (snapshot.schemaVersion === "canonical_session_snapshot_v2" && !isCompleteSessionSnapshot(snapshot)) return { status: "invalid", reason: "invalid_prescription_snapshot", path: `plannedSessions.${index}.prescriptionSnapshot` };
    ids.add(session.id); indexes.add(session.planSessionIndex);
  }
  if (!candidate.progress || typeof candidate.progress !== "object" || typeof candidate.progress.evidenceVersion !== "string" || typeof candidate.progress.revision !== "number") return { status: "invalid", reason: "invalid_progress_reference", path: "progress" };
  if (candidate.progress.revision !== candidate.revision) return { status: "invalid", reason: "invalid_progress_reference", path: "progress.revision" };
  return { status: "valid", carrier: value as CanonicalActivePlanCarrier };
}

function isCompleteSessionSnapshot(snapshot: Record<string, unknown>): boolean {
  if (typeof snapshot.sessionId !== "string" || typeof snapshot.role !== "string" || !Array.isArray(snapshot.slots) || !snapshot.slots.length || !snapshot.provenance || typeof snapshot.provenance !== "object") return false;
  const ids = new Set<string>(); const indexes = new Set<number>();
  for (const slot of snapshot.slots) {
    if (!slot || typeof slot !== "object") return false;
    const value = slot as Record<string, unknown>;
    if (typeof value.id !== "string" || typeof value.index !== "number" || ids.has(value.id) || indexes.has(value.index) || typeof value.exerciseId !== "string" || typeof value.lane !== "string" || typeof value.method !== "string" || !value.settings || typeof value.settings !== "object" || !value.rest || !value.progression || !value.stopRule || typeof value.loadingMode !== "string" || !Array.isArray(value.substitutionConstraints) || typeof value.reason !== "string") return false;
    ids.add(value.id); indexes.add(value.index);
  }
  return true;
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)]));
}

export function serializeCanonicalActivePlan(carrier: CanonicalActivePlanCarrier): string {
  const result = validateCanonicalActivePlan(carrier);
  if (result.status !== "valid") throw new Error(`invalid canonical active plan: ${result.reason}`);
  return JSON.stringify(stable(carrier));
}

export function parseCanonicalActivePlan(serialized: string): CanonicalCarrierValidation {
  try { return validateCanonicalActivePlan(JSON.parse(serialized) as unknown); } catch { return { status: "invalid", reason: "invalid_identity" }; }
}
