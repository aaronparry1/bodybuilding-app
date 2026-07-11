type AthleteTruthConfidence = "very_low" | "low" | "medium" | "moderate" | "high";
type CoachingMemoryCategory = string;
type LearnedCharacteristicId = string;
import type { TrainingEvidenceRecord } from "@/domain/training/training-evidence-record";
import type { WorkoutSession } from "@/domain/training/models";

/** Explicit evidence input for the recovered architecture; no programme authority is inferred here. */
export function evidenceFromWorkoutHistory(sessions: WorkoutSession[], records: TrainingEvidenceRecord[]): RawCoachingEvidence[] {
  return sessions.filter((session) => Boolean(session.completedAt)).map((session) => ({
    sessionId: session.id,
    occurredAt: session.completedAt!,
    signal: records.some((record) => record.sessionId === session.id && record.kind === "pain") ? "pain_reported" : "session_completed",
  }));
}

export type CoachingEvidenceCategory =
  | "performance"
  | "recovery"
  | "pain"
  | "adherence"
  | "preference"
  | "exercise"
  | "method"
  | "warmup"
  | "volume"
  | "conditioning"
  | "progression"
  | "technical"
  | "behavioural";
export type RawEvidenceSignal =
  | "performance_improved"
  | "performance_declined"
  | "recovery_rebounded"
  | "recovery_failed"
  | "pain_reported"
  | "session_completed"
  | "session_skipped"
  | "exercise_substituted"
  | "method_modified"
  | "warmup_modified"
  | "conditioning_completed"
  | "early_termination"
  | "time_compressed"
  | "failed_sets"
  | "preference_note";
export type EvidenceQuality = "rejected" | "low" | "moderate" | "high";
export type EvidenceConfidence = "very_low" | "low" | "medium" | "high";
export type CoachingEvidenceReasonCode =
  | "collect_everything"
  | "trust_only_validated_evidence"
  | "raw_workout_data_cannot_update_model"
  | "obviously_invalid_entry_rejected"
  | "incomplete_workout_confidence_reduced"
  | "injury_limited_workout_confidence_reduced"
  | "accidental_or_corrupted_logging_rejected"
  | "unrealistic_performance_rejected"
  | "emergency_termination_rejected"
  | "single_session_learning_blocked"
  | "validated_observation_created"
  | "safety_evidence_prioritised"
  | "contradiction_recorded"
  | "evidence_decay_applied"
  | "stable_traits_not_modified"
  | "training_evidence_proposal_created";

export interface RawCoachingEvidence {
  sessionId: string;
  occurredAt: string;
  signal: RawEvidenceSignal;
  completedSets?: number;
  completedReps?: number;
  loadUsed?: number;
  actualRestSeconds?: number[];
  sessionDurationMinutes?: number;
  skippedSets?: number;
  skippedExercises?: number;
  substitutions?: number;
  warmupModifications?: number;
  methodModifications?: number;
  conditioningCompleted?: boolean;
  mobilityCompleted?: boolean;
  earlyTermination?: boolean;
  timeCompression?: boolean;
  failedSets?: number;
  painFlag?: "none" | "minor" | "pain" | "technical_breakdown" | "unsafe";
  soreness?: "none" | "mild" | "moderate" | "high" | "unknown";
  recoveryResponse?: "positive" | "neutral" | "negative" | "unknown";
  readiness?: "good" | "normal" | "limited" | "poor" | "unknown";
  userNotes?: string;
  adherenceBehaviour?: "completed" | "partial" | "skipped" | "late" | "unknown";
  invalidReason?: "accidental_logging" | "corrupted_session" | "unrealistic_performance" | "emergency_termination";
}

export interface ValidatedCoachingEvidence {
  evidence_id: string;
  category: CoachingEvidenceCategory;
  signal: RawEvidenceSignal;
  confidence: EvidenceConfidence;
  evidence_count: number;
  supporting_sessions: string[];
  contradiction_count: number;
  age_days: number;
  quality: EvidenceQuality;
  validated: boolean;
  safety_priority: boolean;
  reason_codes: CoachingEvidenceReasonCode[];
}

export interface CoachingEvidenceUpdateProposal {
  target_property?: LearnedCharacteristicId;
  memory_category?: CoachingMemoryCategory;
  proposed_value: string | number | Record<string, number>;
  confidence: AthleteTruthConfidence;
  evidence_count: number;
  supporting_sessions: string[];
  contradiction_count: number;
  evidence_weight: "low" | "medium" | "high";
  reason_codes: CoachingEvidenceReasonCode[];
}

export interface CoachingEvidenceEngineResult {
  validated_evidence: ValidatedCoachingEvidence[];
  evidence_confidence: EvidenceConfidence;
  update_proposals: CoachingEvidenceUpdateProposal[];
  affected_models: Array<"training_evidence_records">;
  confidence_changes: Array<{
    target: LearnedCharacteristicId | CoachingMemoryCategory;
    direction: "increase" | "decrease" | "hold";
    reason: string;
  }>;
  decay_updates: Array<{
    evidence_id: string;
    age_days: number;
    quality_after_decay: EvidenceQuality;
  }>;
  contradiction_updates: Array<{
    evidence_id: string;
    target: LearnedCharacteristicId | CoachingMemoryCategory;
    contradiction_count: number;
  }>;
  reason_codes: CoachingEvidenceReasonCode[];
}

export interface CoachingEvidenceEngineInput {
  raw_evidence: RawCoachingEvidence[];
  currentDate: string;
}

export function processCoachingEvidence(input: CoachingEvidenceEngineInput): CoachingEvidenceEngineResult {
  const reasonCodes: CoachingEvidenceReasonCode[] = [
    "collect_everything",
    "trust_only_validated_evidence",
    "raw_workout_data_cannot_update_model",
    "stable_traits_not_modified",
  ];
  const validated = input.raw_evidence.map((item) => validateEvidence(item, input.currentDate));
  const trusted = validated.filter((item) => item.validated);
  const proposals = proposalsFor(trusted, reasonCodes);
  const decayUpdates = validated
    .filter((item) => item.age_days >= 28)
    .map((item) => ({
      evidence_id: item.evidence_id,
      age_days: item.age_days,
      quality_after_decay: decayedQuality(item),
    }));
  if (decayUpdates.length) reasonCodes.push("evidence_decay_applied");
  const contradictionUpdates = proposals
    .filter((proposal) => proposal.contradiction_count > 0 && (proposal.target_property || proposal.memory_category))
    .map((proposal) => ({
      evidence_id: proposal.supporting_sessions.join(","),
      target: (proposal.target_property ?? proposal.memory_category)!,
      contradiction_count: proposal.contradiction_count,
    }));
  if (contradictionUpdates.length) reasonCodes.push("contradiction_recorded");

  const affectedModels = proposals.length ? ["training_evidence_records" as const] : [];

  return {
    validated_evidence: validated,
    evidence_confidence: aggregateConfidence(trusted),
    update_proposals: proposals,
    affected_models: affectedModels,
    confidence_changes: proposals.map((proposal) => ({
      target: (proposal.target_property ?? proposal.memory_category)!,
      direction: proposal.contradiction_count > 0 ? "decrease" : proposal.evidence_count >= 2 ? "increase" : "hold",
      reason: proposal.contradiction_count > 0 ? "Contradictory validated evidence." : "Validated evidence accumulation.",
    })),
    decay_updates: decayUpdates,
    contradiction_updates: contradictionUpdates,
    reason_codes: unique([...reasonCodes, ...validated.flatMap((item) => item.reason_codes)]),
  };
}

function validateEvidence(raw: RawCoachingEvidence, currentDate: string): ValidatedCoachingEvidence {
  const reasons: CoachingEvidenceReasonCode[] = [];
  if (raw.invalidReason === "accidental_logging" || raw.invalidReason === "corrupted_session") {
    reasons.push("accidental_or_corrupted_logging_rejected");
    return evidence(raw, currentDate, "behavioural", "very_low", "rejected", false, false, reasons);
  }
  if (raw.invalidReason === "unrealistic_performance" || unrealisticPerformance(raw)) {
    reasons.push("unrealistic_performance_rejected");
    return evidence(raw, currentDate, "performance", "very_low", "rejected", false, false, reasons);
  }
  if (raw.invalidReason === "emergency_termination") {
    reasons.push("emergency_termination_rejected");
    return evidence(raw, currentDate, "recovery", "very_low", "rejected", false, false, reasons);
  }

  const category = classifyEvidence(raw);
  const safetyPriority = raw.painFlag === "pain" || raw.painFlag === "technical_breakdown" || raw.painFlag === "unsafe";
  if (safetyPriority) reasons.push("safety_evidence_prioritised");
  if (raw.earlyTermination || raw.adherenceBehaviour === "partial") reasons.push("incomplete_workout_confidence_reduced");
  if (raw.painFlag && raw.painFlag !== "none") reasons.push("injury_limited_workout_confidence_reduced");

  const quality = qualityFor(raw, safetyPriority);
  const confidence = confidenceFor(quality, safetyPriority);
  const validated = quality !== "rejected";
  if (validated) reasons.push("validated_observation_created");
  return evidence(raw, currentDate, category, confidence, quality, validated, safetyPriority, reasons);
}

function proposalsFor(
  validated: ValidatedCoachingEvidence[],
  reasons: CoachingEvidenceReasonCode[],
): CoachingEvidenceUpdateProposal[] {
  const grouped = groupByTarget(validated);
  const proposals: CoachingEvidenceUpdateProposal[] = [];
  for (const [target, items] of grouped.entries()) {
    const safetyItem = items.find((item) => item.safety_priority);
    if (!safetyItem && items.length < 2) {
      reasons.push("single_session_learning_blocked");
      continue;
    }
    const contradictionCount = countContradictions(items);
    const evidenceWeight = evidenceWeightFor(items);
    reasons.push("training_evidence_proposal_created");
    const reasonCodes = unique(items.flatMap((item) => item.reason_codes));
    const sessions = unique(items.flatMap((item) => item.supporting_sessions));
    if (target === "pain_trigger") {
      proposals.push({
        memory_category: "pain_trigger",
        proposed_value: safetyItem?.signal ?? "pain_flag",
        confidence: "high",
        evidence_count: items.length,
        supporting_sessions: sessions,
        contradiction_count: contradictionCount,
        evidence_weight: "high",
        reason_codes: unique([...reasonCodes, "safety_evidence_prioritised"]),
      });
      continue;
    }
    proposals.push({
      target_property: target,
      proposed_value: proposedValueFor(target, items),
      confidence: athleteConfidenceFor(items),
      evidence_count: items.length,
      supporting_sessions: sessions,
      contradiction_count: contradictionCount,
      evidence_weight: evidenceWeight,
      reason_codes: reasonCodes,
    });
  }
  return proposals;
}

function groupByTarget(validated: ValidatedCoachingEvidence[]): Map<LearnedCharacteristicId | "pain_trigger", ValidatedCoachingEvidence[]> {
  const grouped = new Map<LearnedCharacteristicId | "pain_trigger", ValidatedCoachingEvidence[]>();
  for (const item of validated) {
    const target = targetFor(item);
    if (!target) continue;
    grouped.set(target, [...grouped.get(target) ?? [], item]);
  }
  return grouped;
}

function targetFor(item: ValidatedCoachingEvidence): LearnedCharacteristicId | "pain_trigger" | null {
  if (item.safety_priority || item.category === "pain") return "pain_trigger";
  if (item.category === "performance" || item.category === "progression") return "adaptation_speed";
  if (item.category === "recovery") return "recovery_capacity";
  if (item.category === "volume") return "volume_tolerance";
  if (item.category === "conditioning") return "conditioning_responsiveness";
  if (item.category === "warmup") return "warmup_responsiveness";
  if (item.category === "method") return "method_responsiveness";
  if (item.category === "exercise" || item.category === "technical") return "exercise_responsiveness";
  if (item.category === "adherence" || item.category === "behavioural") return "adherence_reliability";
  return null;
}

function classifyEvidence(raw: RawCoachingEvidence): CoachingEvidenceCategory {
  if (raw.painFlag && raw.painFlag !== "none") return "pain";
  if (raw.signal === "performance_improved" || raw.signal === "performance_declined") return "performance";
  if (raw.signal === "recovery_rebounded" || raw.signal === "recovery_failed") return "recovery";
  if (raw.signal === "session_skipped" || raw.adherenceBehaviour === "skipped") return "adherence";
  if (raw.signal === "preference_note") return "preference";
  if (raw.signal === "exercise_substituted") return "exercise";
  if (raw.signal === "method_modified") return "method";
  if (raw.signal === "warmup_modified") return "warmup";
  if (raw.signal === "conditioning_completed") return "conditioning";
  if (raw.signal === "failed_sets" || raw.failedSets && raw.failedSets > 0) return "technical";
  if (raw.skippedSets || raw.timeCompression) return "volume";
  return "behavioural";
}

function qualityFor(raw: RawCoachingEvidence, safetyPriority: boolean): EvidenceQuality {
  if (safetyPriority) return "high";
  if (raw.earlyTermination || raw.adherenceBehaviour === "partial") return "low";
  if ((raw.completedSets ?? 0) >= 3 || raw.conditioningCompleted || raw.mobilityCompleted) return "high";
  return "moderate";
}

function confidenceFor(quality: EvidenceQuality, safetyPriority: boolean): EvidenceConfidence {
  if (safetyPriority) return "high";
  if (quality === "high") return "high";
  if (quality === "moderate") return "medium";
  if (quality === "low") return "low";
  return "very_low";
}

function evidence(
  raw: RawCoachingEvidence,
  currentDate: string,
  category: CoachingEvidenceCategory,
  confidence: EvidenceConfidence,
  quality: EvidenceQuality,
  validated: boolean,
  safetyPriority: boolean,
  reasonCodes: CoachingEvidenceReasonCode[],
): ValidatedCoachingEvidence {
  return {
    evidence_id: raw.sessionId,
    category,
    signal: raw.signal,
    confidence,
    evidence_count: validated ? 1 : 0,
    supporting_sessions: validated ? [raw.sessionId] : [],
    contradiction_count: 0,
    age_days: ageDays(raw.occurredAt, currentDate),
    quality,
    validated,
    safety_priority: safetyPriority,
    reason_codes: reasonCodes,
  };
}

function countContradictions(items: ValidatedCoachingEvidence[]): number {
  const positive = items.some((item) => positiveSignal(item.signal));
  const negative = items.some((item) => negativeSignal(item.signal));
  return positive && negative ? Math.min(items.filter((item) => negativeSignal(item.signal)).length, items.length - 1) : 0;
}

function positiveSignal(signal: RawEvidenceSignal): boolean {
  return signal === "performance_improved" || signal === "recovery_rebounded" || signal === "conditioning_completed" || signal === "session_completed";
}

function negativeSignal(signal: RawEvidenceSignal): boolean {
  return signal === "performance_declined" || signal === "recovery_failed" || signal === "failed_sets" || signal === "early_termination" || signal === "session_skipped";
}

function evidenceWeightFor(items: ValidatedCoachingEvidence[]): "low" | "medium" | "high" {
  if (items.some((item) => item.safety_priority)) return "high";
  if (items.length >= 4 && items.every((item) => item.quality === "high")) return "high";
  if (items.length >= 2) return "medium";
  return "low";
}

function athleteConfidenceFor(items: ValidatedCoachingEvidence[]): AthleteTruthConfidence {
  if (items.some((item) => item.safety_priority)) return "high";
  if (items.length >= 4 && countContradictions(items) === 0) return "medium";
  if (items.length >= 2) return "low";
  return "very_low";
}

function proposedValueFor(target: LearnedCharacteristicId, items: ValidatedCoachingEvidence[]): string {
  const contradictionCount = countContradictions(items);
  if (contradictionCount > 0) return "mixed";
  if (target === "adaptation_speed" && items.every((item) => item.signal === "performance_improved")) return "improving";
  if (target === "recovery_capacity" && items.every((item) => item.signal === "recovery_rebounded")) return "positive";
  if (target === "conditioning_responsiveness") return "responsive";
  if (target === "adherence_reliability") return items.some((item) => item.signal === "session_skipped") ? "inconsistent" : "reliable";
  return "supported";
}

function decayedQuality(item: ValidatedCoachingEvidence): EvidenceQuality {
  if (item.quality === "high" && item.age_days >= 56) return "moderate";
  if (item.quality === "moderate" && item.age_days >= 56) return "low";
  if (item.quality === "low" && item.age_days >= 56) return "low";
  return item.quality;
}

function aggregateConfidence(items: ValidatedCoachingEvidence[]): EvidenceConfidence {
  if (!items.length) return "very_low";
  if (items.some((item) => item.safety_priority)) return "high";
  if (items.length >= 4 && items.every((item) => item.quality === "high")) return "high";
  if (items.length >= 2) return "medium";
  return "low";
}

function unrealisticPerformance(raw: RawCoachingEvidence): boolean {
  return (raw.completedReps ?? 0) > 200 || (raw.loadUsed ?? 0) > 1000 || (raw.sessionDurationMinutes ?? 0) > 360;
}

function ageDays(occurredAt: string, currentDate: string): number {
  const diff = new Date(currentDate).getTime() - new Date(occurredAt).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
