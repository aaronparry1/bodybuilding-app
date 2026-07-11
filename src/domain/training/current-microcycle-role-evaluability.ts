import type { MesocycleId } from "@/domain/training/mesocycle-library";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export type RequiredPlannedRole = { occurrenceId: string; role: string; planSessionIndex: number };
export type RequiredPlannedRoleInput = { planId: string; mesocycleId: MesocycleId; microcycleNumber: number; roles: RequiredPlannedRole[] };
export type PlannedRoleFact = { workoutId: string; planId: string; mesocycleId: MesocycleId; microcycleNumber: number; planSessionIndex: number; sessionKind: "planned" | "custom" | "extra"; completion: "completed" | "open" | "skipped"; validPerformance: boolean; constructionBlocked?: boolean };
export type RoleMatch = { completed: RequiredPlannedRole[]; unresolved: RequiredPlannedRole[]; blocked: RequiredPlannedRole[]; ignoredNonPlanned: string[]; invalid: string[]; disrupted: RequiredPlannedRole[]; hasValidPerformance: boolean };
export type MicrocycleEvaluability = { status: "in_progress" | "evaluable" | "insufficient" | "disrupted" | "blocked" | "invalid"; reason: string; match: RoleMatch };

export function deriveRequiredPlannedRoles(plan: ActiveTrainingPlan): { status: "ready"; input: RequiredPlannedRoleInput } | { status: "invalid"; reason: "missing_current_identity" | "empty_session_roles" } {
  const microcycle = plan.currentMicrocycle;
  if (!plan.currentMesocycleId || !microcycle || microcycle.parentMesocycleId !== plan.currentMesocycleId) return { status: "invalid", reason: "missing_current_identity" };
  if (!microcycle.sessionRoles.length) return { status: "invalid", reason: "empty_session_roles" };
  return { status: "ready", input: { planId: plan.id, mesocycleId: plan.currentMesocycleId, microcycleNumber: microcycle.sequenceNumber, roles: microcycle.sessionRoles.map((role, planSessionIndex) => ({ role, planSessionIndex, occurrenceId: `${plan.id}:${plan.currentMesocycleId}:${microcycle.sequenceNumber}:${planSessionIndex}` })) } };
}

export function matchPlannedRoles(input: RequiredPlannedRoleInput, facts: PlannedRoleFact[]): RoleMatch {
  const completed: RequiredPlannedRole[] = []; const blocked: RequiredPlannedRole[] = []; const disrupted: RequiredPlannedRole[] = []; const ignoredNonPlanned: string[] = []; const invalid: string[] = []; const seen = new Set<number>(); let hasValidPerformance = false;
  for (const fact of facts) {
    if (fact.sessionKind !== "planned") { ignoredNonPlanned.push(fact.workoutId); continue; }
    if (fact.planId !== input.planId || fact.mesocycleId !== input.mesocycleId || fact.microcycleNumber !== input.microcycleNumber) { ignoredNonPlanned.push(fact.workoutId); continue; }
    const role = input.roles[fact.planSessionIndex]; if (!role) { invalid.push(fact.workoutId); continue; }
    if (seen.has(fact.planSessionIndex)) continue; seen.add(fact.planSessionIndex);
    if (fact.constructionBlocked) { blocked.push(role); continue; }
    if (fact.completion === "completed") { completed.push(role); hasValidPerformance ||= fact.validPerformance; continue; }
    if (fact.completion === "skipped") { disrupted.push(role); continue; }
  }
  const unresolved = input.roles.filter((role) => !completed.includes(role) && !blocked.includes(role) && !disrupted.includes(role));
  return { completed, unresolved, blocked, ignoredNonPlanned, invalid, disrupted, hasValidPerformance };
}

export function evaluateMicrocycleRoles(match: RoleMatch, minimumExposureReached: boolean): MicrocycleEvaluability {
  if (match.invalid.length) return { status: "invalid", reason: "conflicting_planned_identity", match };
  if (match.blocked.length) return { status: "blocked", reason: "required_role_construction_blocked", match };
  if (match.disrupted.length) return { status: "disrupted", reason: "required_planned_work_disrupted", match };
  if (match.unresolved.length) return { status: "in_progress", reason: "required_planned_work_open", match };
  if (!match.hasValidPerformance) return { status: "insufficient", reason: "missing_valid_performance", match };
  if (!minimumExposureReached) return { status: "in_progress", reason: "minimum_exposure_not_reached", match };
  return { status: "evaluable", reason: "required_planned_roles_complete", match };
}
