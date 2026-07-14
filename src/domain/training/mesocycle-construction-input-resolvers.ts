import type { ExerciseRole, TrainingLane } from "@/domain/training/models";
import { type CanonicalTargetEnvelope, type ConstructionRole, type MesocyclePrescriptionPolicy, type PrescriptionMethodFamily } from "@/domain/training/mesocycle-prescription-policy";

export type CanonicalLaneResolution = Readonly<{ status: "resolved"; candidates: readonly TrainingLane[]; preferred: TrainingLane; reason: string } | { status: "blocked"; reason: "role_not_supported" | "readiness_restriction" | "no_permitted_lane" }>;
export function resolveCanonicalLaneEnvelope(policy: MesocyclePrescriptionPolicy, role: ConstructionRole, exerciseRole?: ExerciseRole, readiness?: "ready" | "restricted"): CanonicalLaneResolution {
  if (readiness === "restricted" && policy.lane.readinessRestriction === "expression_only") return { status: "blocked", reason: "readiness_restriction" };
  const preferred = policy.concreteLanes.preferredByRole[role];
  const candidates = [preferred, ...policy.concreteLanes.fallbacksByRole[role]].filter((lane, index, all) => policy.concreteLanes.allowed.includes(lane) && !policy.concreteLanes.prohibited.includes(lane) && all.indexOf(lane) === index);
  if (!candidates.length) return { status: "blocked", reason: "no_permitted_lane" };
  if (exerciseRole === "power" && !candidates.includes("power")) return { status: "blocked", reason: "role_not_supported" };
  return { status: "resolved", candidates, preferred, reason: `mesocycle:${policy.mesocycleId}:${role}` };
}

export type CanonicalTargetResolution = Readonly<{ status: "resolved"; envelope: CanonicalTargetEnvelope; reason: string } | { status: "blocked"; reason: "lane_not_permitted" | "target_envelope_missing" | "method_not_permitted" | "established_load_required" }>;
export function resolveCanonicalTargetEnvelope(policy: MesocyclePrescriptionPolicy, role: ConstructionRole, lane: TrainingLane, hasEstablishedLoad: boolean, method: PrescriptionMethodFamily = "straight_sets"): CanonicalTargetResolution {
  if (!policy.concreteLanes.allowed.includes(lane) || policy.concreteLanes.prohibited.includes(lane)) return { status: "blocked", reason: "lane_not_permitted" };
  if (!policy.methods.permitted.includes(method) || policy.methods.prohibited.includes(method)) return { status: "blocked", reason: "method_not_permitted" };
  const envelope = policy.targetEnvelopes[role][lane];
  if (!envelope) return { status: "blocked", reason: "target_envelope_missing" };
  if (envelope.establishedLoad === "required" && !hasEstablishedLoad) return { status: "blocked", reason: "established_load_required" };
  return { status: "resolved", envelope, reason: `mesocycle:${policy.mesocycleId}:${role}:${lane}` };
}
