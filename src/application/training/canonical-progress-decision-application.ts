import { loadCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { resolveCanonicalMesocycleSuccessor } from "@/domain/training/canonical-mesocycle-successor";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { resolveCanonicalConstructionFacts } from "@/application/training/canonical-construction-facts";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";

export type CanonicalProgressDecisionApplicationCommand = Readonly<{ planId: string; expectedPlanRevision: number; macrocycleId: string; mesocycleId: string; microcycleId: string; decisionId: string; evaluationId: string; expectedEvidenceIds: readonly string[] }>;
export type CanonicalProgressDecisionApplicationResult = Readonly<{ status: "unchanged" | "applied" | "rejected"; reason: string; planId: string; priorRevision: number; newRevision: number; decisionId: string; stateChanged: boolean; futureSessionsRegenerated: boolean; reviewRequired: boolean }>;

/** Coordinates canonical identity validation. Transition/regeneration remains owned by Mesocycle/Microcycle/Session Construction. */
export function applyCanonicalProgressDecision(command: CanonicalProgressDecisionApplicationCommand): CanonicalProgressDecisionApplicationResult {
  const loaded = loadCanonicalActivePlan();
  if (loaded.status !== "ok") return rejected(command, 0, "canonical_plan_unavailable");
  const plan = loaded.model;
  if (plan.planId !== command.planId || plan.revision !== command.expectedPlanRevision) return rejected(command, plan.revision, "stale_plan_revision");
  if (plan.macrocycle.goal === "" || plan.mesocycle.id !== command.mesocycleId || plan.microcycle.id !== command.microcycleId) return rejected(command, plan.revision, "canonical_identity_mismatch");
  const decision = canonicalProgressDecisionRepository.get(command.decisionId);
  if (decision.status !== "found") return rejected(command, plan.revision, "decision_not_found");
  if (decision.decision.planId !== command.planId || decision.decision.expectedPlanRevision !== command.expectedPlanRevision || decision.decision.evaluationId !== command.evaluationId || decision.decision.mesocycleId !== command.mesocycleId || decision.decision.microcycleId !== command.microcycleId) return rejected(command, plan.revision, "decision_chain_mismatch");
  const expected = [...command.expectedEvidenceIds].sort();
  const actual = [...decision.decision.evidenceIds].sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual) || actual.some((id) => canonicalProgressEvidenceRepository.get(id).status !== "found")) return rejected(command, plan.revision, "evidence_chain_mismatch");
  if (decision.decision.status === "consumed") return { status: "unchanged", reason: "decision_already_consumed", planId: plan.planId, priorRevision: plan.revision, newRevision: plan.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false };
  if (decision.decision.outcome !== "continue") {
    const successor = resolveCanonicalMesocycleSuccessor({ macrocycleId: `${plan.planId}:macrocycle`, macrocycleEngine: engineForGoal(plan.macrocycle.goal), currentMesocycleId: command.mesocycleId as never, decisionId: decision.decision.decisionId, evaluationId: command.evaluationId, evidenceIds: actual, outcome: decision.decision.outcome === "transition" ? "transition" : "deload", successorMesocycleId: decision.decision.successorMesocycleId as never, sequenceNumber: plan.microcycle.sequenceNumber + 1, planRevision: plan.revision });
    if (successor.status !== "resolved") return rejected(command, plan.revision, successor.reason);
    const raw = canonicalActivePlanV2Repository.get();
    if (raw.status !== "saved") return rejected(command, plan.revision, "canonical_plan_unavailable");
    const facts = resolveCanonicalConstructionFacts(raw.carrier);
    if (facts.status !== "ready") return rejected(command, plan.revision, facts.reason);
    const constructed = constructCanonicalActivePlanFromCanonicalInputs({ planId: raw.carrier.planId, createdAt: raw.carrier.createdAt, updatedAt: new Date().toISOString(), goal: raw.carrier.constraints.goal, macrocycleGoal: successor.successor.engine === "hypertrophy" ? "build_muscle" : successor.successor.engine === "powerbuilding" ? "build_muscle_and_strength" : successor.successor.engine === "strength" ? "build_strength" : "athletic_performance", experienceLevel: raw.carrier.constraints.experienceLevel, daysPerWeek: raw.carrier.constraints.daysPerWeek as 2 | 3 | 4 | 5 | 6, preferredSplit: raw.carrier.constraints.preferredSplit as never, equipment: facts.facts.equipment, units: raw.carrier.constraints.units, exercises: facts.facts.exercises, limitations: facts.facts.limitations, history: facts.facts.history, establishedLoads: facts.facts.establishedLoads });
    if (constructed.status !== "constructed") return rejected(command, plan.revision, "canonical_future_session_construction_failed");
    const nextRevision = raw.carrier.revision + 1;
    const successorMicrocycleId = `${raw.carrier.planId}:microcycle:${successor.sequenceNumber}`;
    const successorMesocycle = { id: successor.successor.id, output: successor.successor, owner: "Mesocycle" as const, position: raw.carrier.mesocycle.position + 1, transitionReference: decision.decision.decisionId };
    const generated = { ...constructed.carrier, mesocycle: successorMesocycle, microcycle: { ...constructed.carrier.microcycle, id: successorMicrocycleId, output: { ...constructed.carrier.microcycle.output, id: successorMicrocycleId, parentMesocycleId: successor.successor.id }, position: successor.sequenceNumber }, plannedSessions: constructed.carrier.plannedSessions.map((session) => ({ ...session, microcycleId: successorMicrocycleId })), revision: nextRevision, progress: { ...constructed.carrier.progress, revision: nextRevision }, constructionInputs: facts.facts.references, recordedSessionReferences: raw.carrier.recordedSessionReferences ?? [], cycleLineage: [...(raw.carrier.cycleLineage ?? []), { schemaVersion: "canonical_session_lineage_v1" as const, planId: raw.carrier.planId, macrocycleId: raw.carrier.macrocycle.id, mesocycleId: raw.carrier.mesocycle.id, microcycleId: raw.carrier.microcycle.id, revision: raw.carrier.revision, sequenceNumber: raw.carrier.microcycle.output.sequenceNumber, status: "predecessor" as const, transitionDecisionId: decision.decision.decisionId }] };
    const saved = canonicalActivePlanV2Repository.saveAtomically(generated, raw.carrier.revision);
    if (saved.status !== "saved") return rejected(command, plan.revision, saved.status === "conflict" ? "stale_plan_revision" : "canonical_plan_save_failed");
    return { status: "applied", reason: "canonical_successor_applied", planId: command.planId, priorRevision: raw.carrier.revision, newRevision: nextRevision, decisionId: command.decisionId, stateChanged: true, futureSessionsRegenerated: true, reviewRequired: false };
  }
  return { status: "unchanged", reason: "continue_requires_no_plan_change", planId: plan.planId, priorRevision: plan.revision, newRevision: plan.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false };
}

function rejected(command: CanonicalProgressDecisionApplicationCommand, revision: number, reason: string): CanonicalProgressDecisionApplicationResult { return { status: "rejected", reason, planId: command.planId, priorRevision: revision, newRevision: revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false }; }

function engineForGoal(goal: string): "hypertrophy" | "powerbuilding" | "strength" | "athletic_performance" { return goal === "build_muscle_and_strength" ? "powerbuilding" : goal === "build_strength" || goal === "powerlifting_meet" ? "strength" : goal === "athletic_performance" ? "athletic_performance" : "hypertrophy"; }
