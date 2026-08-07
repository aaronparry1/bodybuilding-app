import type { CanonicalReleaseReconciliationResult } from "@/application/training/canonical-release-reconciliation";

export function sameCanonicalReconciliation(
  current: CanonicalReleaseReconciliationResult | null,
  next: CanonicalReleaseReconciliationResult | null,
): boolean {
  if (current === next) return true;
  if (!current || !next) return false;
  return JSON.stringify(current) === JSON.stringify(next);
}
