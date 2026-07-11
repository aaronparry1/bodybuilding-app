import { beforeEach, describe, expect, it } from "vitest";
import { jsonStore } from "@/data/local/json-store";
import { currentReadinessSnapshotRepository } from "@/data/local/current-readiness-snapshot-repository";
import { CURRENT_READINESS_SCHEMA } from "@/domain/training/current-readiness-snapshot";
const snap=(id:string)=>({schemaVersion:CURRENT_READINESS_SCHEMA,id,planId:"p",mesocycleId:"hypertrophy_base" as const,microcycleNumber:1,createdAt:`2026-01-0${id}T00:00:00Z`,state:"in_progress" as const,sourceFingerprint:`fp-${id}`,sourceWorkoutIds:[`w-${id}`],sourceSessionIds:[`d-${id}`],requiredRoles:["Push"],completedRoles:[],unresolvedRoles:["Push"],blockedRoles:[],approvedSuccessors:[]});
describe("readiness snapshot repository",()=>{beforeEach(()=>jsonStore.remove("iron-logic.current-readiness-snapshot-store"));it("saves defensively and resolves one explicit current snapshot",()=>{expect(currentReadinessSnapshotRepository.save(snap("1")).status).toBe("saved");expect(currentReadinessSnapshotRepository.current("p","hypertrophy_base",1).status).toBe("found");expect(currentReadinessSnapshotRepository.save(snap("1")).status).toBe("duplicate_snapshot_id");});});
