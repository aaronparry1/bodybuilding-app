export const CANONICAL_SESSION_DURATION_POLICY_ID = "canonical_session_duration_policy_v1" as const;
export const canonicalSessionDurationOptions = [30, 45, 60, 75, 90] as const;

export type CanonicalSessionDurationMinutes = (typeof canonicalSessionDurationOptions)[number];

export type CanonicalSessionDurationResolution =
  | Readonly<{ status: "valid"; policyId: typeof CANONICAL_SESSION_DURATION_POLICY_ID; minutes: CanonicalSessionDurationMinutes; maximumWorkingSets: number }>
  | Readonly<{ status: "invalid"; policyId: typeof CANONICAL_SESSION_DURATION_POLICY_ID; reason: "unsupported_session_duration"; customerGuidance: string }>;

/** Session duration is a planning constraint, not a promise of elapsed time.
 * The allocator reserves eight minutes for setup/transitions and three minutes
 * per working set. Only these explicit options are accepted so persisted plans
 * cannot acquire arbitrary or ambiguous time limits. */
export function resolveCanonicalSessionDuration(value: unknown): CanonicalSessionDurationResolution {
  if (!canonicalSessionDurationOptions.includes(value as CanonicalSessionDurationMinutes)) {
    return {
      status: "invalid",
      policyId: CANONICAL_SESSION_DURATION_POLICY_ID,
      reason: "unsupported_session_duration",
      customerGuidance: "Choose 30, 45, 60, 75 or 90 minutes per workout.",
    };
  }
  const minutes = value as CanonicalSessionDurationMinutes;
  return { status: "valid", policyId: CANONICAL_SESSION_DURATION_POLICY_ID, minutes, maximumWorkingSets: Math.floor((minutes - 8) / 3) };
}

export function normalizeCanonicalSessionDuration(value: unknown): CanonicalSessionDurationMinutes {
  const resolved = resolveCanonicalSessionDuration(value);
  return resolved.status === "valid" ? resolved.minutes : 75;
}
