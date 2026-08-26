import type { CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { MesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import type { CanonicalRecordedSession } from "@/domain/training/canonical-recorded-session-ledger";

export const CANONICAL_COMPARABLE_EXPOSURE_VERSION = "canonical_comparable_exposure_v1" as const;
export const CANONICAL_NUMERIC_PROGRESSION_POLICY = "canonical_numeric_progression_policy_v1" as const;

export type CanonicalNumericDecisionOutcome =
  | "calibrate"
  | "progress_load"
  | "progress_repetitions"
  | "hold"
  | "regress_load"
  | "regress_repetitions"
  | "insufficient_evidence"
  | "incomparable_evidence"
  | "phase_prohibited"
  | "safety_blocked"
  | "factual_review_required";

export type CanonicalNumericPrescriptionState = Readonly<{
  prescribedBaseLoad: number;
  exactTargets: readonly number[];
}>;

export type CanonicalNumericPrescriptionDecision = Readonly<{
  schemaVersion: "canonical_numeric_prescription_decision_v1";
  policyId: typeof CANONICAL_NUMERIC_PROGRESSION_POLICY;
  outcome: CanonicalNumericDecisionOutcome;
  comparableExposureKey: string;
  exerciseId: string;
  planSessionIndex: number;
  sessionRole: string;
  constructionRole: "primary" | "secondary" | "accessory";
  exerciseRole: string;
  lane: string;
  method: string;
  progressionRule: string;
  evidenceIds: readonly string[];
  exposureCount: number;
  successfulExposureCount: number;
  failedExposureCount: number;
  reasonCode: string;
  before: CanonicalNumericPrescriptionState;
  after?: CanonicalNumericPrescriptionState;
  exactNumericDelta?: Readonly<{ loadKg: number; repetitions: readonly number[] }>;
  /** Decision that authorised this adjustment when it is carried to a later comparable slot. */
  sourceDecisionId?: string;
}>;

type ComparableExposure = Readonly<{
  key: string;
  sessionId: string;
  observedAt: string;
  evidenceIds: readonly string[];
  exerciseId: string;
  planSessionIndex: number;
  sessionRole: string;
  constructionRole: "primary" | "secondary" | "accessory";
  exerciseRole: string;
  lane: string;
  method: string;
  progressionRule: string;
  loadState: string;
  loadingMode: string;
  prescribedBaseLoad: number;
  increment: number;
  exactTargets: readonly number[];
  completedReps: readonly number[];
  completedLoad: number;
  successful: boolean;
  valid: boolean;
}>;

/**
 * Stable semantic identity for completed exercise exposures. Persistence ids,
 * timestamps, revisions, display units and regenerated nested objects are
 * intentionally absent.
 */
export function canonicalComparableExposureKey(input: Readonly<{
  mesocycleId: string;
  exerciseId: string;
  planSessionIndex: number;
  sessionRole: string;
  constructionRole: string;
  exerciseRole: string;
  lane: string;
  method: string;
  methodSemantic: string;
  progressionRule: string;
  prescribedSets: number;
  loadState: string;
  loadingMode: string;
  substitutionConstraints: readonly string[];
}>): string {
  return [
    CANONICAL_COMPARABLE_EXPOSURE_VERSION,
    input.mesocycleId,
    input.exerciseId,
    input.planSessionIndex,
    input.sessionRole,
    input.constructionRole,
    input.exerciseRole,
    input.lane,
    input.method,
    input.methodSemantic,
    input.progressionRule,
    input.prescribedSets,
    input.loadState,
    input.loadingMode,
    [...input.substitutionConstraints].sort().join(","),
  ].map(encodeURIComponent).join("|");
}

export function canonicalSessionRoleFamily(role: string): string {
  return role.trim().replace(/\s+[A-Z]$/u, "").replace(/\s+\d+$/u, "");
}

export function canonicalMethodSemanticFingerprint(slot: Readonly<Record<string, unknown>>): string {
  const structure = isRecord(slot.methodStructure) ? slot.methodStructure : {};
  return JSON.stringify({
    method: String(slot.method ?? "straight_sets"),
    kind: String(structure.kind ?? "standalone"),
    rounds: finiteOrNull(structure.rounds),
    groupSize: finiteOrNull(structure.groupSize),
    position: finiteOrNull(structure.position),
    segmentsPerRound: finiteOrNull(structure.segmentsPerRound),
    activationReps: finiteOrNull(structure.activationReps),
    miniSetTargetReps: finiteOrNull(structure.miniSetTargetReps),
    minimumMiniSetReps: finiteOrNull(structure.minimumMiniSetReps),
    maximumMiniSets: finiteOrNull(structure.maximumMiniSets),
    intraMethodRestSeconds: finiteOrNull(structure.intraMethodRestSeconds),
    interRoundRestSeconds: finiteOrNull(structure.interRoundRestSeconds),
    policyId: String(structure.policyId ?? "canonical_training_method_policy_v1"),
  });
}

export function comparableExposureObservationFacts(
  snapshot: Readonly<Record<string, unknown>>,
  slot: Readonly<Record<string, unknown>>,
): Readonly<Record<string, string | number | boolean | null>> {
  const settings = isRecord(slot.settings) ? slot.settings : {};
  const load = isRecord(slot.loadPrescription) ? slot.loadPrescription : {};
  const progression = isRecord(slot.progression) ? slot.progression : {};
  const rounding = isRecord(load.rounding) ? load.rounding : {};
  const prescribedSets = Number(settings.requiredSets ?? settings.requiredWorkSets ?? 0);
  const constructionRole = String(slot.constructionRole ?? "");
  const exerciseRole = String(slot.exerciseRole ?? "");
  const loadState = String(load.state ?? "");
  const loadingMode = String(load.loadingMode ?? slot.loadingMode ?? "");
  const substitutionConstraints = Array.isArray(slot.substitutionConstraints)
    && slot.substitutionConstraints.every((item) => typeof item === "string")
    ? [...slot.substitutionConstraints].sort()
    : [];
  const comparableFactsComplete = Boolean(
    String(snapshot.mesocycleId ?? "")
    && String(slot.exerciseId ?? "")
    && Number.isInteger(Number(snapshot.planSessionIndex))
    && String(snapshot.role ?? "")
    && constructionRole
    && exerciseRole
    && String(slot.lane ?? "")
    && String(slot.method ?? "")
    && String(progression.rule ?? "")
    && Number.isInteger(prescribedSets)
    && prescribedSets > 0
    && loadState
    && loadingMode,
  );
  const facts = {
    comparableExposureVersion: CANONICAL_COMPARABLE_EXPOSURE_VERSION,
    sessionRole: canonicalSessionRoleFamily(String(snapshot.role ?? "")),
    planSessionIndex: Number(snapshot.planSessionIndex),
    constructionRole,
    exerciseRole,
    lane: String(slot.lane ?? ""),
    methodSemantic: canonicalMethodSemanticFingerprint(slot),
    prescribedBaseLoad: Number(load.prescribedBaseLoad ?? slot.prescribedLoad ?? 0),
    availableIncrementKg: Number(rounding.increment ?? 0),
    loadState,
    loadingMode,
    substitutionConstraints: substitutionConstraints.join(","),
    comparableFactsComplete,
  };
  const key = canonicalComparableExposureKey({
    mesocycleId: String(snapshot.mesocycleId ?? ""),
    exerciseId: String(slot.exerciseId ?? ""),
    planSessionIndex: facts.planSessionIndex,
    sessionRole: facts.sessionRole,
    constructionRole,
    exerciseRole,
    lane: facts.lane,
    method: String(slot.method ?? "straight_sets"),
    methodSemantic: facts.methodSemantic,
    progressionRule: String(progression.rule ?? "unknown"),
    prescribedSets,
    loadState,
    loadingMode,
    substitutionConstraints,
  });
  return { ...facts, comparableExposureKey: key };
}

/**
 * Derives bounded numeric decisions from completed, immutable evidence only.
 * This function does not mutate prescriptions and is not an application
 * authority.
 */
export function deriveCanonicalNumericPrescriptionDecisions(input: Readonly<{
  session: CanonicalRecordedSession;
  evidence: readonly CanonicalProgressEvidence[];
  policy: MesocyclePrescriptionPolicy;
}>): readonly CanonicalNumericPrescriptionDecision[] {
  const snapshot = input.session.prescriptionSnapshot as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const exposures = deriveComparableExposures(input.evidence);
  const byKey = new Map<string, ComparableExposure[]>();
  for (const exposure of exposures) byKey.set(exposure.key, [...(byKey.get(exposure.key) ?? []), exposure]);

  return slots.map((slot) => {
    const slotFacts = comparableExposureObservationFacts(
      { ...snapshot, mesocycleId: input.session.mesocycleId },
      slot,
    );
    const key = String(slotFacts.comparableExposureKey);
    const matching = (byKey.get(key) ?? [])
      .filter((item) => item.observedAt <= completedAt(input.session, input.evidence))
      .sort((left, right) => left.observedAt.localeCompare(right.observedAt) || left.sessionId.localeCompare(right.sessionId));
    const current = matching.findLast((item) => item.sessionId === input.session.recordedSessionId);
    const load = isRecord(slot.loadPrescription) ? slot.loadPrescription : {};
    const exactTargets = numericArray(slot.exactTargets).length
      ? numericArray(slot.exactTargets)
      : Array.from({ length: positiveInteger((slot.settings as Record<string, unknown> | undefined)?.requiredSets) ?? 0 }, () => Number(slot.targetReps ?? 0));
    const before = {
      prescribedBaseLoad: Number(load.prescribedBaseLoad ?? slot.prescribedLoad ?? 0),
      exactTargets,
    };
    const base = {
      schemaVersion: "canonical_numeric_prescription_decision_v1",
      policyId: CANONICAL_NUMERIC_PROGRESSION_POLICY,
      comparableExposureKey: key,
      exerciseId: String(slot.exerciseId ?? ""),
      planSessionIndex: Number(snapshot.planSessionIndex),
      sessionRole: String(slotFacts.sessionRole),
      constructionRole: normalConstructionRole(slot.constructionRole),
      exerciseRole: String(slot.exerciseRole ?? ""),
      lane: String(slot.lane ?? ""),
      method: String(slot.method ?? ""),
      progressionRule: String((slot.progression as Record<string, unknown> | undefined)?.rule ?? ""),
      evidenceIds: matching.flatMap((item) => item.evidenceIds).sort(),
      exposureCount: matching.length,
      successfulExposureCount: matching.filter((item) => item.successful).length,
      failedExposureCount: matching.filter((item) => !item.successful).length,
      before,
    } as const;
    const finish = (
      outcome: CanonicalNumericDecisionOutcome,
      reasonCode: string,
      after?: CanonicalNumericPrescriptionState,
    ): CanonicalNumericPrescriptionDecision => ({
      ...base,
      outcome,
      reasonCode,
      ...(after ? {
        after,
        exactNumericDelta: {
          loadKg: round(after.prescribedBaseLoad - before.prescribedBaseLoad),
          repetitions: after.exactTargets.map((target, index) => target - (before.exactTargets[index] ?? target)),
        },
      } : {}),
    });

    if (input.policy.specialState !== "standard") return finish("phase_prohibited", `numeric_change_prohibited_in_${input.policy.specialState}`);
    if (String(slot.method) !== "straight_sets" || String(slotFacts.methodSemantic).includes('"kind":"linked_')) return finish("phase_prohibited", "numeric_change_requires_comparable_straight_sets");
    if (!["rep_progression", "load_progression"].includes(base.progressionRule)) return finish("phase_prohibited", `numeric_change_not_supported_for_${base.progressionRule || "unknown"}_rule`);
    if (load.state === "calibration_required") return finish("calibrate", "established_load_required_before_numeric_change");
    if (load.state === "bodyweight") return finish("hold", "bodyweight_numeric_state_not_mounted");
    if (load.state !== "established" || before.prescribedBaseLoad <= 0) return finish("safety_blocked", "valid_established_external_load_required");
    if (!current) return finish("incomparable_evidence", "current_completed_exposure_not_comparable");
    if (!current.valid) return finish("factual_review_required", "completed_exposure_facts_invalid");
    if (matching.length < 3) return finish("insufficient_evidence", `comparable_exposure_count_${matching.length}_below_3`);

    const recent = matching.slice(-3);
    const envelope = input.policy.targetEnvelopes[base.constructionRole][base.lane as keyof typeof input.policy.targetEnvelopes[typeof base.constructionRole]];
    if (!envelope) return finish("phase_prohibited", "target_envelope_unavailable");
    const increment = current.increment;
    if (!Number.isFinite(increment) || increment <= 0) return finish("safety_blocked", "available_equipment_increment_unavailable");

    if (recent.every((item) => item.successful)) {
      if (base.progressionRule === "rep_progression" && before.exactTargets.some((target) => target < envelope.maxReps)) {
        const nextTargets = before.exactTargets.map((target) => Math.min(envelope.maxReps, target + 1));
        if (sameNumbers(nextTargets, before.exactTargets)) return finish("hold", "rep_adjustment_rounded_to_no_change");
        return finish("progress_repetitions", "three_comparable_successful_exposures_progress_repetitions", {
          prescribedBaseLoad: before.prescribedBaseLoad,
          exactTargets: nextTargets,
        });
      }
      const nextLoad = roundToIncrement(before.prescribedBaseLoad + increment, increment);
      if (nextLoad <= before.prescribedBaseLoad) return finish("hold", "load_adjustment_rounded_to_no_change");
      return finish("progress_load", "three_comparable_successful_exposures_progress_load", {
        prescribedBaseLoad: nextLoad,
        exactTargets: base.progressionRule === "rep_progression"
          ? before.exactTargets.map(() => envelope.minReps)
          : before.exactTargets,
      });
    }

    const lastTwo = matching.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every((item) => !item.successful)) {
      if (base.progressionRule === "rep_progression" && before.exactTargets.some((target) => target > envelope.minReps)) {
        const nextTargets = before.exactTargets.map((target) => Math.max(envelope.minReps, target - 1));
        if (!sameNumbers(nextTargets, before.exactTargets)) {
          return finish("regress_repetitions", "two_comparable_failed_exposures_regress_repetitions", {
            prescribedBaseLoad: before.prescribedBaseLoad,
            exactTargets: nextTargets,
          });
        }
      }
      const nextLoad = roundToIncrement(Math.max(increment, before.prescribedBaseLoad - increment), increment);
      if (nextLoad >= before.prescribedBaseLoad) return finish("hold", "load_regression_reached_safe_floor");
      return finish("regress_load", "two_comparable_failed_exposures_regress_load", {
        prescribedBaseLoad: nextLoad,
        exactTargets: before.exactTargets,
      });
    }
    return finish("hold", current.successful ? "successful_exposure_without_consistent_trend" : "single_or_nonconsecutive_underperformance");
  });
}

export function applyCanonicalNumericDecisionsToPlannedSessions(
  sessions: readonly CanonicalPlannedSessionSnapshot[],
  decisions: readonly CanonicalNumericPrescriptionDecision[],
): Readonly<{
  sessions: readonly CanonicalPlannedSessionSnapshot[];
  applied: readonly CanonicalNumericPrescriptionDecision[];
  unresolved: readonly CanonicalNumericPrescriptionDecision[];
}> {
  const actionable = decisions.filter((item) => item.after && ["progress_load", "progress_repetitions", "regress_load", "regress_repetitions"].includes(item.outcome));
  const applied: CanonicalNumericPrescriptionDecision[] = [];
  const resolvedNoOps = new Set<CanonicalNumericPrescriptionDecision>();
  const targetCounts = new Map<CanonicalNumericPrescriptionDecision, number>();
  for (const decision of actionable) {
    let matches = 0;
    for (const session of sessions) {
      const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
      const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
      matches += slots.filter((slot) => matchesNumericTarget(session, slot, decision)).length;
    }
    targetCounts.set(decision, matches);
  }
  const mutable = sessions.map((session) => {
    const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
    if (!Array.isArray(snapshot.slots)) return session;
    const slots = (snapshot.slots as Array<Record<string, unknown>>).map((slot) => {
      const match = actionable.find((decision) =>
        targetCounts.get(decision) === 1 && matchesNumericTarget(session, slot, decision));
      if (!match?.after) return slot;
      const load = isRecord(slot.loadPrescription) ? slot.loadPrescription : {};
      const settings = isRecord(slot.settings) ? slot.settings : {};
      const currentTargets = numericArray(slot.exactTargets).length
        ? numericArray(slot.exactTargets)
        : Array.from(
          { length: positiveInteger(settings.requiredSets ?? settings.requiredWorkSets) ?? 0 },
          () => Number(slot.targetReps ?? 0),
        );
      const currentLoad = Number(load.prescribedBaseLoad ?? slot.prescribedLoad ?? 0);
      if (currentLoad === match.after.prescribedBaseLoad
        && sameNumbers(currentTargets, match.after.exactTargets)) {
        resolvedNoOps.add(match);
        return slot;
      }
      applied.push(match);
      return {
        ...slot,
        targetReps: match.after.exactTargets[0] ?? slot.targetReps,
        exactTargets: [...match.after.exactTargets],
        settings: {
          ...settings,
          repRange: {
            min: Math.min(...match.after.exactTargets),
            max: Math.max(...match.after.exactTargets),
          },
        },
        prescribedLoad: match.after.prescribedBaseLoad,
        loadPrescription: load.state === "established"
          ? { ...load, prescribedBaseLoad: match.after.prescribedBaseLoad }
          : load,
      };
    });
    return { ...session, prescriptionSnapshot: { ...snapshot, slots } };
  });
  const appliedSet = new Set(applied);
  return {
    sessions: mutable,
    applied,
    unresolved: actionable.filter((item) => !appliedSet.has(item) && !resolvedNoOps.has(item)),
  };
}

function matchesNumericTarget(
  session: CanonicalPlannedSessionSnapshot,
  slot: Record<string, unknown>,
  decision: CanonicalNumericPrescriptionDecision,
): boolean {
  return decision.planSessionIndex === session.planSessionIndex
    && decision.sessionRole === canonicalSessionRoleFamily(session.role)
    && decision.exerciseId === String(slot.exerciseId)
    && decision.constructionRole === normalConstructionRole(slot.constructionRole)
    && decision.exerciseRole === String(slot.exerciseRole ?? "")
    && decision.lane === String(slot.lane)
    && decision.method === String(slot.method)
    && decision.progressionRule === String((slot.progression as Record<string, unknown> | undefined)?.rule ?? "");
}

function deriveComparableExposures(evidence: readonly CanonicalProgressEvidence[]): ComparableExposure[] {
  const completionSessions = new Set(evidence.filter((item) => item.kind === "completion" && item.observations.completion === "complete" && item.sessionId).map((item) => item.sessionId!));
  const performance = evidence.filter((item) => item.kind === "performance" && item.sessionId && typeof item.observations.comparableExposureKey === "string");
  const groups = new Map<string, CanonicalProgressEvidence[]>();
  for (const item of performance) {
    const key = `${item.sessionId}|${String(item.observations.comparableExposureKey)}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.values()].map((records) => {
    const ordered = records.slice().sort((left, right) => Number(left.observations.setOrder) - Number(right.observations.setOrder) || left.evidenceId.localeCompare(right.evidenceId));
    const first = ordered[0]!;
    const o = first.observations;
    const prescribedSets = Number(o.prescribedSets);
    const setOrders = new Set(ordered.map((item) => Number(item.observations.setOrder)));
    const exactTargets = ordered.map((item) => Number(item.observations.prescribedTargetReps));
    const completedReps = ordered.map((item) => Number(item.observations.reps));
    const completedLoads = [...new Set(ordered.map((item) => Number(item.observations.load)))];
    const valid = completionSessions.has(first.sessionId!)
      && o.comparableFactsComplete === true
      && Number.isInteger(prescribedSets) && prescribedSets > 0
      && ordered.length === prescribedSets && setOrders.size === prescribedSets
      && ordered.every((item) => item.observations.completion === "complete"
        && item.observations.unit === "kg"
        && item.observations.substitutionId == null
        && Number.isInteger(item.observations.reps) && Number(item.observations.reps) >= 0
        && Number.isFinite(item.observations.load) && Number(item.observations.load) > 0)
      && completedLoads.length === 1
      && completedLoads[0] === Number(o.prescribedBaseLoad);
    return {
      key: String(o.comparableExposureKey),
      sessionId: first.sessionId!,
      observedAt: ordered.at(-1)!.observedAt,
      evidenceIds: ordered.map((item) => item.evidenceId).sort(),
      exerciseId: String(o.exerciseId),
      planSessionIndex: Number(o.planSessionIndex),
      sessionRole: String(o.sessionRole),
      constructionRole: normalConstructionRole(o.constructionRole),
      exerciseRole: String(o.exerciseRole),
      lane: String(o.lane),
      method: String(o.method),
      progressionRule: String(o.progressionRule),
      loadState: String(o.loadState),
      loadingMode: String(o.loadingMode),
      prescribedBaseLoad: Number(o.prescribedBaseLoad),
      increment: Number(o.availableIncrementKg),
      exactTargets,
      completedReps,
      completedLoad: completedLoads[0] ?? 0,
      successful: valid && completedReps.every((reps, index) => reps >= Number(exactTargets[index])),
      valid,
    };
  });
}

function completedAt(session: CanonicalRecordedSession, evidence: readonly CanonicalProgressEvidence[]): string {
  return evidence
    .filter((item) => item.sessionId === session.recordedSessionId)
    .map((item) => item.observedAt)
    .sort()
    .at(-1) ?? "9999-12-31T23:59:59.999Z";
}

function normalConstructionRole(value: unknown): "primary" | "secondary" | "accessory" {
  return value === "primary" || value === "secondary" ? value : "accessory";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function numericArray(value: unknown): number[] {
  return Array.isArray(value) && value.every((item) => Number.isFinite(item))
    ? value.map(Number)
    : [];
}

function positiveInteger(value: unknown): number | undefined {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : undefined;
}

function finiteOrNull(value: unknown): number | null {
  return Number.isFinite(value) ? Number(value) : null;
}

function round(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function roundToIncrement(value: number, increment: number): number {
  return round(Math.round(value / increment) * increment);
}

function sameNumbers(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
