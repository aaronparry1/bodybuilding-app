import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { createCanonicalActivePlanV2Repository, type CanonicalOpaqueStorage } from "@/data/local/canonical-active-plan-v2-repository";
import { compareCanonicalActivePlans, parseCanonicalActivePlan } from "@/domain/training/canonical-active-plan-carrier";
import { restoreCanonicalRecordedSession } from "@/domain/training/canonical-session-restoration";
import { certifyCanonicalPipelineEvidence, REQUIRED_CANONICAL_EVIDENCE, type CanonicalEvidence } from "@/domain/training/canonical-session-construction-certification";
import { exerciseLibrary } from "@/domain/training/presets";

const input = { planId: "certification-plan", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy" as const, macrocycleGoal: "build_muscle" as const, experienceLevel: "intermediate" as const, daysPerWeek: 3 as const, preferredSplit: "push_pull_legs" as const, equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const, units: "kg" as const, exercises: exerciseLibrary, history: [] };

function storage(initial: string | null = null, mode: "ok" | "read" | "write" = "ok"): CanonicalOpaqueStorage { let value = initial; return { read() { if (mode === "read") throw new Error("read_failure"); return value; }, write(next) { if (mode === "write") throw new Error("write_failure"); value = next; }, remove() { value = null; } }; }

export function runCanonicalPipelineCertification() {
  const evidence: Record<string, CanonicalEvidence> = {};
  const construction = constructCanonicalActivePlanFromCanonicalInputs(input);
  const constructed = construction.status === "constructed";
  evidence.orchestration_matrix_passed = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "real_orchestration", caseIds: ["orchestration:build_muscle:3day"], passed: constructed, firstFailure: constructed ? undefined : { caseId: "orchestration:build_muscle:3day", reason: construction.reason } };
  if (!constructed) return certifyCanonicalPipelineEvidence(evidence);
  const repository = createCanonicalActivePlanV2Repository();
  repository.clear();
  const saved = repository.saveAtomically(construction.carrier);
  const read = repository.get();
  const roundTrip = saved.status === "saved" && read.status === "saved" && compareCanonicalActivePlans(construction.carrier, read.carrier).status === "equivalent";
  evidence.repository_roundtrip_passed = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "real_repository", caseIds: ["repository:atomic_roundtrip"], passed: roundTrip, firstFailure: roundTrip ? undefined : { caseId: "repository:atomic_roundtrip", reason: "roundtrip_mismatch" } };
  const failedRead = createCanonicalActivePlanV2Repository(storage(null, "read")).saveAtomically(construction.carrier);
  const failedWrite = createCanonicalActivePlanV2Repository(storage(null, "write")).saveAtomically(construction.carrier);
  evidence.atomic_failures_contained = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "storage_fault_injection", caseIds: ["atomic:read_failure", "atomic:write_failure"], passed: failedRead.status === "invalid" && failedWrite.status === "invalid" };
  const staleCandidate = { ...construction.carrier, revision: construction.carrier.revision + 1, progress: { ...construction.carrier.progress, revision: construction.carrier.revision + 1 } };
  const staleRepository = createCanonicalActivePlanV2Repository();
  staleRepository.clear();
  staleRepository.saveAtomically(construction.carrier);
  const staleWrite = staleRepository.saveAtomically(staleCandidate, -1);
  const retry = repository.saveAtomically(construction.carrier, construction.carrier.revision);
  evidence.stale_revision_protected = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "repository_conflicts", caseIds: ["revision:stale", "revision:identical_retry"], passed: staleWrite.status === "conflict" && retry.status === "saved", firstFailure: staleWrite.status === "conflict" && retry.status === "saved" ? undefined : { caseId: "revision:stale", reason: "conflict_or_retry_not_protected" } };
  const malformed = parseCanonicalActivePlan(JSON.stringify({ ...construction.carrier, blocks: [] }));
  evidence.malformed_carriers_rejected = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "carrier_validator", caseIds: ["malformed:legacy_fields"], passed: malformed.status === "invalid" };
  const session = construction.carrier.plannedSessions[0]!;
  const restored = restoreCanonicalRecordedSession({ snapshot: session, status: "paused", expectedMicrocycleId: construction.carrier.microcycle.id, currentRevision: session.revision });
  evidence.historical_snapshots_preserved = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "recorded_restoration", caseIds: ["restoration:paused"], passed: restored.status === "restored" };
  evidence.malformed_sessions_rejected = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "session_validator", caseIds: ["malformed:wrong_linkage"], passed: restoreCanonicalRecordedSession({ snapshot: session, status: "started", expectedMicrocycleId: "wrong", currentRevision: session.revision }).status === "rejected" };
  const legacyRejected = restoreCanonicalRecordedSession({ snapshot: { ...session, prescriptionSnapshot: { blocks: [], performedSets: [] } }, status: "legacy_historical", expectedMicrocycleId: construction.carrier.microcycle.id, currentRevision: session.revision });
  evidence.legacy_history_non_authoritative = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "recorded_restoration", caseIds: ["restoration:legacy_nested_authority"], passed: legacyRejected.status === "rejected" };
  evidence.exact_prescriptions_preserved = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "real_repository", caseIds: ["prescription:roundtrip"], passed: roundTrip };
  evidence.no_legacy_fields_persisted = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "real_repository", caseIds: ["persistence:recursive_legacy_scan"], passed: !JSON.stringify(read).includes("blocks") };
  const repeated = constructCanonicalActivePlanFromCanonicalInputs(input);
  evidence.deterministic_outputs_verified = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "real_orchestration", caseIds: ["determinism:repeat_identity"], passed: repeated.status === "constructed" && compareCanonicalActivePlans(construction.carrier, repeated.carrier).status === "equivalent" };
  for (const name of REQUIRED_CANONICAL_EVIDENCE) if (!evidence[name]) evidence[name] = { evidenceVersion: "canonical_pipeline_evidence_v1", producer: "missing", caseIds: [], passed: false, firstFailure: { caseId: name, reason: "missing_producer" } };
  return certifyCanonicalPipelineEvidence(evidence);
}
