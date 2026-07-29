import { jsonStore } from "@/data/local/json-store";

const key = "iron-logic.canonical-active-plan-owner-v1";
const schemaVersion = "canonical_active_plan_owner_v1" as const;

export type CanonicalActivePlanOwnerRecord = Readonly<{
  schemaVersion: typeof schemaVersion;
  planId: string;
  ownerUserId: string;
  boundAt: string;
  provenance: "existing_authenticated_device_migration" | "authenticated_onboarding" | "cloud_restore";
}>;

export type CanonicalActivePlanOwnerResult =
  | Readonly<{ status: "owned"; record: CanonicalActivePlanOwnerRecord }>
  | Readonly<{ status: "missing" }>
  | Readonly<{ status: "invalid"; reason: string }>;

export const canonicalActivePlanOwnerRepository = {
  get(): CanonicalActivePlanOwnerResult {
    let value: unknown;
    try {
      value = jsonStore.get<unknown>(key, null);
    } catch {
      return { status: "invalid", reason: "owner_storage_read_failed" };
    }
    if (value === null) return { status: "missing" };
    if (!value || typeof value !== "object") return { status: "invalid", reason: "owner_record_malformed" };
    const candidate = value as Partial<CanonicalActivePlanOwnerRecord>;
    if (
      candidate.schemaVersion !== schemaVersion
      || typeof candidate.planId !== "string"
      || candidate.planId.length === 0
      || typeof candidate.ownerUserId !== "string"
      || candidate.ownerUserId.length === 0
      || typeof candidate.boundAt !== "string"
      || !["existing_authenticated_device_migration", "authenticated_onboarding", "cloud_restore"].includes(String(candidate.provenance))
    ) {
      return { status: "invalid", reason: "owner_record_malformed" };
    }
    return { status: "owned", record: candidate as CanonicalActivePlanOwnerRecord };
  },

  save(record: Omit<CanonicalActivePlanOwnerRecord, "schemaVersion">): CanonicalActivePlanOwnerResult {
    try {
      jsonStore.set(key, { schemaVersion, ...record });
      const readBack = this.get();
      if (
        readBack.status !== "owned"
        || readBack.record.planId !== record.planId
        || readBack.record.ownerUserId !== record.ownerUserId
      ) {
        return { status: "invalid", reason: "owner_read_back_mismatch" };
      }
      return readBack;
    } catch {
      return { status: "invalid", reason: "owner_storage_write_failed" };
    }
  },

  clear(): void {
    jsonStore.remove(key);
  },
};
