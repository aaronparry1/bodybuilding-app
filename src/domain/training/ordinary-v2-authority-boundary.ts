export const ORDINARY_V2_CERTIFICATION_ID = "ordinary-v2-certified.v1" as const;
export const ORDINARY_V2_ROLLBACK_BOUNDARY = "ordinary-v2-authority-boundary.v1" as const;

export type OrdinaryV2Role = "primary_compound" | "secondary_compound" | "accessory";
export type OrdinaryV2AuthorityPolicy = Readonly<{ mode: "production_only" | "ordinary_v2_canary"; certificationId?: string; rollbackBoundary?: string }>;
export type OrdinaryV2Decision<T> = Readonly<{ authority: "production" | "v2_ordinary_canary"; value: T; reason: string }>;

export const ORDINARY_V2_DISABLED_POLICY: OrdinaryV2AuthorityPolicy = Object.freeze({ mode: "production_only" });

export type OrdinaryV2BoundaryInput<T> = Readonly<{
  family: string;
  role: string;
  production: OrdinaryV2Decision<T>;
  translatedV2?: OrdinaryV2Decision<T> | null;
  v2Resolved: boolean;
  translationValid: boolean;
  requiredFieldsComplete: boolean;
  unsupportedMethodPresent: boolean;
  certificationId?: string;
  rollbackBoundary?: string;
}>;

export function resolveOrdinaryV2Authority<T>(input: OrdinaryV2BoundaryInput<T>, policy: OrdinaryV2AuthorityPolicy = ORDINARY_V2_DISABLED_POLICY): OrdinaryV2Decision<T> {
  const canary = policy.mode === "ordinary_v2_canary";
  const safe = input.family === "ordinary" && (input.role === "primary_compound" || input.role === "secondary_compound" || input.role === "accessory") && canary && policy.certificationId === ORDINARY_V2_CERTIFICATION_ID && policy.rollbackBoundary === ORDINARY_V2_ROLLBACK_BOUNDARY && input.certificationId === ORDINARY_V2_CERTIFICATION_ID && input.rollbackBoundary === ORDINARY_V2_ROLLBACK_BOUNDARY && input.v2Resolved && input.translationValid && input.requiredFieldsComplete && !input.unsupportedMethodPresent && input.translatedV2?.authority === "v2_ordinary_canary";
  return safe ? input.translatedV2! : { ...input.production, authority: "production", reason: "production_default_or_canary_safety_failure" };
}
