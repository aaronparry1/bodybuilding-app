import { beforeEach, describe, expect, it } from "vitest";
import { migrateCanonicalRecordedSnapshots } from "@/application/training/canonical-recorded-session-migration";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";

const carrier = ({ schema: "canonical_plan_v2" as const, planId: "p", revision: 1, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", macrocycle: { id: "macro", output: { id: "macro", goal: "build_muscle", rolling: true, phases: [] } as any, owner: "Macrocycle" as const }, mesocycle: { id: "m", output: { id: "m", engine: "hypertrophy", adaptation: "accumulate", nextStates: [] } as any, owner: "Mesocycle" as const, position: 0 }, microcycle: { id: "micro", output: { id: "micro", parentMesocycleId: "m", sequenceNumber: 1, trainingDays: 2, sessionRoles: ["a"], sessions: [], constructionVersion: "v1" } as any, owner: "Microcycle" as const, position: 0, constructionVersion: "v1" }, plannedSessions: [], progress: { evidenceVersion: "v1", revision: 1 }, constraints: { goal: "strength_hypertrophy", experienceLevel: "intermediate", daysPerWeek: 2, preferredSplit: "full_body", equipment: [], units: "kg" }, operational: {} } as any);

describe("canonical history portability", () => {
  beforeEach(() => canonicalRecordedSessionLedger.clear());
  it("migrates explicit records deterministically and round trips the ledger", () => {
    const migrated = migrateCanonicalRecordedSnapshots(carrier, [{ recordedSessionId: "r", plannedSessionId: "s", planId: "p", macrocycleId: "macro", mesocycleId: "m", microcycleId: "micro", role: "a", prescriptionSnapshot: { schemaVersion: "canonical_session_snapshot_v2", slots: [] }, status: "paused", createdAt: "2026-01-01T00:00:00.000Z", athleteId: "a" }]);
    expect(migrated.status).toBe("migrated");
    if (migrated.status === "migrated") { expect(migrated.carrier.recordedSessionReferences).toHaveLength(1); expect(canonicalRecordedSessionLedger.restorePlan(migrated.sessions)).toEqual({ status: "restored" }); expect(canonicalRecordedSessionLedger.get("r").status).toBe("found"); }
  });
  it("rejects ambiguous completed history without a completion timestamp", () => expect(migrateCanonicalRecordedSnapshots(carrier, [{ recordedSessionId: "r", plannedSessionId: "s", planId: "p", macrocycleId: "macro", mesocycleId: "m", microcycleId: "micro", role: "a", prescriptionSnapshot: {}, status: "completed", createdAt: "2026-01-01T00:00:00.000Z", athleteId: "a" }])).toEqual({ status: "rejected", reason: "ambiguous_record" }));
});
