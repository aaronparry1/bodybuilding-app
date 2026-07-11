import type { ExperienceLevel } from "@/domain/training/models";
import { mesocycleById, type MesocycleId, type MesocycleSpec } from "@/domain/training/mesocycle-library";
import type { CurrentReadinessSnapshot } from "@/domain/training/current-readiness-snapshot";

export const CURRENT_EXPOSURE_POLICY_VERSION = 1 as const;

export type MesocycleExposurePolicy = Readonly<{
  id: string;
  version: typeof CURRENT_EXPOSURE_POLICY_VERSION;
  minimumEvaluableAttempts: number;
  expectedAttempts: number;
  maximumEvaluableAttempts: number;
}>;

export type ExposureResult =
  | Readonly<{ status: "ready"; evaluableMicrocyclesCompleted: number; observedAttempts: readonly number[]; currentAttempt: number; minimumExposureReached: boolean; expectedWindow: "below_expected" | "within_expected" | "above_expected"; maximumExposureReached: boolean; countedSnapshotIds: readonly string[]; excludedSnapshotIds: readonly Readonly<{ id: string; reason: string }>[]; policyId: string; policyVersion: number }>
  | Readonly<{ status: "insufficient_history"; reason: "no_current_snapshot" | "current_attempt_missing" }>
  | Readonly<{ status: "insufficient_policy"; reason: "missing_exposure_policy" }>
  | Readonly<{ status: "invalid_policy"; reason: "unsupported_policy_version" | "invalid_policy_bounds" }>
  | Readonly<{ status: "invalid_history"; reason: "identity_conflict" | "competing_current_attempt" | "supersession_conflict" }>;

export function exposurePolicyFromMesocycle(spec: Pick<MesocycleSpec, "id" | "minimumWeeks" | "defaultWeeks" | "maximumWeeks">): MesocycleExposurePolicy {
  return {
    id: `mesocycle-exposure:${spec.id}:v1`,
    version: CURRENT_EXPOSURE_POLICY_VERSION,
    minimumEvaluableAttempts: spec.minimumWeeks,
    expectedAttempts: spec.defaultWeeks,
    maximumEvaluableAttempts: spec.maximumWeeks,
  };
}

function validateExposurePolicy(policy: MesocycleExposurePolicy | undefined): ExposureResult | undefined {
  if (!policy) return { status: "insufficient_policy", reason: "missing_exposure_policy" };
  if (policy.version !== CURRENT_EXPOSURE_POLICY_VERSION) return { status: "invalid_policy", reason: "unsupported_policy_version" };
  if (![policy.minimumEvaluableAttempts, policy.expectedAttempts, policy.maximumEvaluableAttempts].every((value) => Number.isInteger(value) && value > 0) || policy.minimumEvaluableAttempts > policy.expectedAttempts || policy.expectedAttempts > policy.maximumEvaluableAttempts) {
    return { status: "invalid_policy", reason: "invalid_policy_bounds" };
  }
  return undefined;
}

export function deriveMesocycleExposure(input: Readonly<{ planId: string; mesocycleId: MesocycleId; currentAttempt: number; snapshots: readonly CurrentReadinessSnapshot[]; policy?: MesocycleExposurePolicy }>): ExposureResult {
  const policyIssue = validateExposurePolicy(input.policy);
  if (policyIssue) return policyIssue;
  if (!Number.isInteger(input.currentAttempt) || input.currentAttempt < 1) return { status: "insufficient_history", reason: "current_attempt_missing" };
  const matching = input.snapshots.filter((snapshot) => snapshot.planId === input.planId && snapshot.mesocycleId === input.mesocycleId);
  if (input.snapshots.some((snapshot) => snapshot.planId === input.planId && snapshot.mesocycleId !== input.mesocycleId)) return { status: "invalid_history", reason: "identity_conflict" };
  if (!matching.length) return { status: "insufficient_history", reason: "no_current_snapshot" };
  const ids = new Set(matching.map((snapshot) => snapshot.id));
  if (matching.some((snapshot) => snapshot.supersededSnapshotId && !ids.has(snapshot.supersededSnapshotId))) return { status: "invalid_history", reason: "supersession_conflict" };
  const superseded = new Set(matching.flatMap((snapshot) => snapshot.supersededSnapshotId ? [snapshot.supersededSnapshotId] : []));
  const active = matching.filter((snapshot) => !superseded.has(snapshot.id));
  const byAttempt = new Map<number, CurrentReadinessSnapshot[]>();
  for (const snapshot of active) byAttempt.set(snapshot.microcycleNumber, [...(byAttempt.get(snapshot.microcycleNumber) ?? []), snapshot]);
  if ([...byAttempt.values()].some((snapshots) => snapshots.length > 1)) return { status: "invalid_history", reason: "competing_current_attempt" };
  const excluded: Array<{ id: string; reason: string }> = [];
  const counted = active.filter((snapshot) => {
    if (snapshot.state === "ready") return true;
    excluded.push({ id: snapshot.id, reason: `snapshot_${snapshot.state}` });
    return false;
  });
  const policy = input.policy!;
  const count = counted.length;
  return {
    status: "ready",
    evaluableMicrocyclesCompleted: count,
    observedAttempts: [...byAttempt.keys()].sort((a, b) => a - b),
    currentAttempt: input.currentAttempt,
    minimumExposureReached: count >= policy.minimumEvaluableAttempts,
    expectedWindow: count < policy.expectedAttempts ? "below_expected" : count === policy.expectedAttempts ? "within_expected" : "above_expected",
    maximumExposureReached: count >= policy.maximumEvaluableAttempts,
    countedSnapshotIds: counted.map((snapshot) => snapshot.id).sort(),
    excludedSnapshotIds: excluded.sort((a, b) => a.id.localeCompare(b.id)),
    policyId: policy.id,
    policyVersion: policy.version,
  };
}

export type SuccessorContext =
  | Readonly<{ status: "ready"; approvedCandidateIds: readonly MesocycleId[]; eligibleCandidateIds: readonly MesocycleId[]; ineligibleCandidates: readonly Readonly<{ id: MesocycleId; reason: "experience_ineligible" | "engine_mismatch" }>[]; lowStressCandidateIds: readonly MesocycleId[]; lowStressMetadata: "unavailable" }>
  | Readonly<{ status: "no_candidates"; reason: "no_successor_configured" }>
  | Readonly<{ status: "no_eligible_candidates"; approvedCandidateIds: readonly MesocycleId[]; ineligibleCandidates: readonly Readonly<{ id: MesocycleId; reason: "experience_ineligible" | "engine_mismatch" }>[]; lowStressMetadata: "unavailable" }>
  | Readonly<{ status: "invalid"; reason: "unknown_current_mesocycle" | "duplicate_candidate" | "unknown_candidate" | "self_transition" }>;

export function resolveApprovedSuccessorContext(input: Readonly<{ currentMesocycleId: MesocycleId; experienceLevel: ExperienceLevel }>): SuccessorContext {
  const current = mesocycleById(input.currentMesocycleId);
  if (!current) return { status: "invalid", reason: "unknown_current_mesocycle" };
  if (!current.nextStates.length) return { status: "no_candidates", reason: "no_successor_configured" };
  if (new Set(current.nextStates).size !== current.nextStates.length) return { status: "invalid", reason: "duplicate_candidate" };
  if (current.nextStates.includes(current.id)) return { status: "invalid", reason: "self_transition" };
  const ineligible: Array<{ id: MesocycleId; reason: "experience_ineligible" | "engine_mismatch" }> = [];
  const eligible: MesocycleId[] = [];
  for (const id of current.nextStates) {
    const candidate = mesocycleById(id);
    if (!candidate) return { status: "invalid", reason: "unknown_candidate" };
    if (candidate.engine !== current.engine) ineligible.push({ id, reason: "engine_mismatch" });
    else if (!candidate.eligibility.includes(input.experienceLevel)) ineligible.push({ id, reason: "experience_ineligible" });
    else eligible.push(id);
  }
  if (!eligible.length) return { status: "no_eligible_candidates", approvedCandidateIds: [...current.nextStates], ineligibleCandidates: ineligible, lowStressMetadata: "unavailable" };
  return { status: "ready", approvedCandidateIds: [...current.nextStates], eligibleCandidateIds: eligible, ineligibleCandidates: ineligible, lowStressCandidateIds: [], lowStressMetadata: "unavailable" };
}

/** The current library exposes descriptive criteria only; C2 deliberately has no executable criterion family. */
export type ObjectivePolicy = Readonly<{ id: string; version: 1; criteria: readonly string[] }>;
export type ObjectiveStatus =
  | Readonly<{ status: "concluded"; policyId: string; policyVersion: number }>
  | Readonly<{ status: "not_concluded"; policyId: string; policyVersion: number }>
  | Readonly<{ status: "insufficient_evidence"; reason: "exposure_not_ready" }>
  | Readonly<{ status: "insufficient_policy"; reason: "missing_machine_evaluable_objective_policy" }>
  | Readonly<{ status: "invalid"; reason: "unsupported_objective_policy" | "invalid_exposure" }>;

export function evaluateMesocycleObjective(policy: ObjectivePolicy | undefined, exposure: ExposureResult): ObjectiveStatus {
  if (!policy) return { status: "insufficient_policy", reason: "missing_machine_evaluable_objective_policy" };
  if (policy.version !== 1 || !policy.id || !policy.criteria.length) return { status: "invalid", reason: "unsupported_objective_policy" };
  // No current machine-evaluable criterion can be satisfied by snapshot fields alone.
  // Exposure permits assessment but can never prove the mesocycle objective concluded.
  void exposure;
  return { status: "invalid", reason: "unsupported_objective_policy" };
}

export type CurrentMesocycleReadinessContext = Readonly<{ exposure: ExposureResult; successors: SuccessorContext; objective: ObjectiveStatus }>;
export function deriveCurrentMesocycleReadinessContext(input: Readonly<{ planId: string; mesocycleId: MesocycleId; currentAttempt: number; snapshots: readonly CurrentReadinessSnapshot[]; exposurePolicy?: MesocycleExposurePolicy; objectivePolicy?: ObjectivePolicy; experienceLevel: ExperienceLevel }>): CurrentMesocycleReadinessContext {
  const exposure = deriveMesocycleExposure({
    planId: input.planId,
    mesocycleId: input.mesocycleId,
    currentAttempt: input.currentAttempt,
    snapshots: input.snapshots,
    policy: input.exposurePolicy,
  });
  return { exposure, successors: resolveApprovedSuccessorContext({ currentMesocycleId: input.mesocycleId, experienceLevel: input.experienceLevel }), objective: evaluateMesocycleObjective(input.objectivePolicy, exposure) };
}
