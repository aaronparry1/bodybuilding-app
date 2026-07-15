import { constructCanonicalActivePlanFromCanonicalInputs, type CanonicalGeneratedPlanInput } from "@/application/training/canonical-active-plan-construction";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import type { CanonicalActivePlanCarrier, CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";
import type { Equipment, Exercise, ExperienceLevel, ProgrammeGoal, UnitSystem, WorkoutHistorySummary } from "@/domain/training/models";
import type { CanonicalTrainingDaysPerWeek } from "@/domain/training/microcycle-scheduler";

export type CanonicalActivePlanCreateCommand = Readonly<{
  planId: string; createdAt: string; updatedAt: string; goal: ProgrammeGoal; macrocycleGoal: CanonicalGeneratedPlanInput["macrocycleGoal"]; experienceLevel: ExperienceLevel; daysPerWeek: CanonicalTrainingDaysPerWeek; preferredSplit: CanonicalGeneratedPlanInput["preferredSplit"]; equipment: readonly Equipment[]; units: UnitSystem; targetDate?: string; exercises: readonly Exercise[]; limitations?: readonly string[]; history?: readonly WorkoutHistorySummary[]; establishedLoads?: Readonly<Record<string, number>>;
}>;

export type CanonicalActivePlanReadModel = Readonly<{ schemaVersion: "canonical_active_plan_read_model_v1"; planId: string; revision: number; macrocycle: Readonly<{ goal: string; targetDate?: string; rolling: boolean }>; mesocycle: Readonly<{ id: string; position: number; purpose: string }>; microcycle: Readonly<{ id: string; sequenceNumber: number; trainingDays: number; sessionRoles: readonly string[] }>; plannedSessions: readonly Readonly<{ id: string; microcycleId: string; role: string; planSessionIndex: number; status: string; constructionVersion: string; revision: number; snapshot: Readonly<Record<string, unknown>> }>[]; nextSession: Readonly<{ id: string; role: string }> | null; progress: Readonly<{ evidenceVersion: string; revision: number }> }>;

export type CanonicalActivePlanApplicationResult = Readonly<{ status: "ok"; model: CanonicalActivePlanReadModel }> | Readonly<{ status: "invalid"; reason: string }>;

export function createCanonicalActivePlan(command: CanonicalActivePlanCreateCommand): CanonicalActivePlanApplicationResult {
  const result = constructCanonicalActivePlanFromCanonicalInputs(command);
  if (result.status !== "constructed") return { status: "invalid", reason: result.reason };
  const saved = canonicalActivePlanV2Repository.saveAtomically(result.carrier);
  if (saved.status !== "saved") return { status: "invalid", reason: saved.status === "conflict" ? saved.reason : saved.status === "invalid" ? saved.reason : "canonical_plan_save_failed" };
  return { status: "ok", model: projectCanonicalActivePlan(saved.carrier) };
}

export function loadCanonicalActivePlan(): CanonicalActivePlanApplicationResult {
  const result = canonicalActivePlanV2Repository.get();
  return result.status === "saved" ? { status: "ok", model: projectCanonicalActivePlan(result.carrier) } : { status: "invalid", reason: result.status === "invalid" ? result.reason : "canonical_plan_missing" };
}

export function projectCanonicalActivePlan(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanReadModel {
  const plannedSessions = carrier.plannedSessions.slice().sort((a, b) => a.planSessionIndex - b.planSessionIndex).map((session) => ({ id: session.id, microcycleId: session.microcycleId, role: session.role, planSessionIndex: session.planSessionIndex, status: session.status, constructionVersion: session.constructionVersion, revision: session.revision, snapshot: session.prescriptionSnapshot }));
  const next = plannedSessions.find((session) => session.status === "planned");
  const model: CanonicalActivePlanReadModel = { schemaVersion: "canonical_active_plan_read_model_v1", planId: carrier.planId, revision: carrier.revision, macrocycle: { goal: carrier.macrocycle.output.goal, targetDate: carrier.macrocycle.output.targetDate, rolling: carrier.macrocycle.output.rolling }, mesocycle: { id: carrier.mesocycle.id, position: carrier.mesocycle.position, purpose: carrier.mesocycle.output.adaptation }, microcycle: { id: carrier.microcycle.id, sequenceNumber: carrier.microcycle.output.sequenceNumber, trainingDays: carrier.microcycle.output.trainingDays, sessionRoles: carrier.microcycle.output.sessionRoles }, plannedSessions, nextSession: next ? { id: next.id, role: next.role } : null, progress: { evidenceVersion: carrier.progress.evidenceVersion, revision: carrier.progress.revision } };
  if (containsLegacyFields(model)) throw new Error("legacy_fields_in_canonical_read_model");
  return model;
}

function containsLegacyFields(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Object.keys(value as object).some((key) => ["blocks", "activeBlockId", "blockType", "currentBlock", "trainingYear", "annualWeek"].includes(key))) return true;
  return Object.values(value as Record<string, unknown>).some(containsLegacyFields);
}

export function loadPlannedSession(id: string): CanonicalPlannedSessionSnapshot | null {
  const result = canonicalActivePlanV2Repository.get();
  if (result.status !== "saved") return null;
  return result.carrier.plannedSessions.find((session) => session.id === id && session.status === "planned") ?? null;
}
