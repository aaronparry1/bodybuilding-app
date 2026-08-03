import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

export const ACCOUNT_DELETION_PATH = "/delete-account/";
export const ACCOUNT_DELETION_VERIFY_PATH = "/delete-account/verify/";
export const ACCOUNT_DELETION_REQUEST_PATH = "/api/delete-account/request";
export const ACCOUNT_DELETION_CONFIRM_PATH = "/api/delete-account/confirm";
export const CANONICAL_SITE_ORIGIN = "https://adaptivestrengthcoach.com";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveDeletionConfig(env = process.env) {
  return {
    supabaseUrl: trimTrailingSlash(env.SUPABASE_URL),
    supabasePublishableKey: env.SUPABASE_PUBLISHABLE_KEY?.trim() ?? "",
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
    revenueCatSecretApiKey: env.REVENUECAT_SECRET_API_KEY?.trim() ?? "",
    siteOrigin: trimTrailingSlash(env.PUBLIC_SITE_ORIGIN?.trim() || CANONICAL_SITE_ORIGIN),
  };
}

export function validateDeletionConfig(config, { requireRevenueCat = false } = {}) {
  const missing = [];
  if (!isHttpsUrl(config.supabaseUrl)) missing.push("SUPABASE_URL");
  if (!config.supabasePublishableKey) missing.push("SUPABASE_PUBLISHABLE_KEY");
  if (!config.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (requireRevenueCat && !config.revenueCatSecretApiKey) missing.push("REVENUECAT_SECRET_API_KEY");
  if (!isHttpsUrl(config.siteOrigin)) missing.push("PUBLIC_SITE_ORIGIN");
  return { ready: missing.length === 0, missing };
}

export function normalizeDeletionEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || !emailPattern.test(email)) return null;
  return email;
}

export function createDeletionRateLimiter({ now = Date.now } = {}) {
  const attempts = new Map();

  function consume({ scope, value, limit, windowMs }) {
    const key = `${scope}:${hashIdentifier(value)}`;
    const timestamp = now();
    const current = attempts.get(key);
    if (!current || current.resetAt <= timestamp) {
      attempts.set(key, { count: 1, resetAt: timestamp + windowMs });
      pruneAttempts(attempts, timestamp);
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (current.count >= limit) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - timestamp) / 1000)) };
    }
    current.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return { consume, size: () => attempts.size };
}

export async function requestAccountDeletionLink({ email, fetchImpl = fetch, config = resolveDeletionConfig() }) {
  const readiness = validateDeletionConfig(config);
  if (!readiness.ready) return { status: "unavailable", reason: "server_configuration" };

  const redirectUrl = `${config.siteOrigin}${ACCOUNT_DELETION_VERIFY_PATH}`;
  const response = await fetchImpl(`${config.supabaseUrl}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectUrl)}`, {
    method: "POST",
    headers: {
      apikey: config.supabasePublishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, create_user: false }),
  });

  if (response.status === 429) return { status: "rate_limited", retryAfterSeconds: parseRetryAfter(response) };
  if (response.status >= 500) return { status: "unavailable", reason: "authentication_provider" };

  // Supabase may return a different 4xx response for an unknown account. The
  // public response intentionally remains indistinguishable to prevent account
  // enumeration, while a real provider outage is still reported as unavailable.
  return { status: "accepted" };
}

export async function deleteAccountForAccessToken({ accessToken, fetchImpl = fetch, config = resolveDeletionConfig() }) {
  const readiness = validateDeletionConfig(config, { requireRevenueCat: true });
  if (!readiness.ready) return { status: "unavailable", reason: "server_configuration", missing: readiness.missing };
  if (!isPlausibleAccessToken(accessToken)) return { status: "unauthorized" };

  const userResponse = await fetchImpl(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!userResponse.ok) return { status: "unauthorized" };

  const user = await safeJson(userResponse);
  if (!user || !uuidPattern.test(user.id ?? "")) return { status: "unauthorized" };

  const revenueCat = await deleteRevenueCatCustomer({ userId: user.id, fetchImpl, config });
  if (revenueCat.status !== "deleted" && revenueCat.status !== "absent") {
    return { status: "unavailable", reason: "subscription_processor" };
  }

  const authDeletion = await fetchImpl(`${config.supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
    method: "DELETE",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
    },
  });

  if (authDeletion.status === 404) return { status: "already_deleted" };
  if (!authDeletion.ok) return { status: "unavailable", reason: "account_store" };

  return {
    status: "deleted",
    receipt: `ASC-${randomUUID().split("-")[0].toUpperCase()}`,
    deleted: ["authentication account", "cloud profile", "account-linked cloud rows", "RevenueCat customer profile"],
  };
}

export async function deleteRevenueCatCustomer({ userId, fetchImpl = fetch, config = resolveDeletionConfig() }) {
  if (!config.revenueCatSecretApiKey) return { status: "unavailable" };
  const response = await fetchImpl(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${config.revenueCatSecretApiKey}`,
      "Content-Type": "application/json",
    },
  });
  if (response.status === 404) return { status: "absent" };
  return response.ok ? { status: "deleted" } : { status: "unavailable" };
}

export function isAllowedRequestOrigin(origin, siteOrigin = CANONICAL_SITE_ORIGIN) {
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    return safeEqual(parsed.origin, new URL(siteOrigin).origin);
  } catch {
    return false;
  }
}

export function isPlausibleAccessToken(value) {
  return typeof value === "string" && value.length >= 32 && value.length <= 8192 && !/[\r\n]/.test(value);
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function hashIdentifier(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function pruneAttempts(attempts, timestamp) {
  if (attempts.size < 2_000) return;
  for (const [key, entry] of attempts) if (entry.resetAt <= timestamp) attempts.delete(key);
}

function parseRetryAfter(response) {
  const seconds = Number.parseInt(response.headers?.get?.("retry-after") ?? "", 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 60;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function trimTrailingSlash(value = "") {
  return value.replace(/\/+$/, "");
}
