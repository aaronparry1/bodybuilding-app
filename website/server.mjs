import { createReadStream, existsSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import {
  ACCOUNT_DELETION_CONFIRM_PATH,
  ACCOUNT_DELETION_REQUEST_PATH,
  createDeletionRateLimiter,
  deleteAccountForAccessToken,
  isAllowedRequestOrigin,
  normalizeDeletionEmail,
  requestAccountDeletionLink,
  resolveDeletionConfig,
} from "./account-deletion.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "public");
const port = Number(process.env.PORT ?? 3000);
const deletionConfig = resolveDeletionConfig();
const deletionRateLimiter = createDeletionRateLimiter();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};

function resolvePath(urlPath) {
  const cleanPath = normalize(decodeURIComponent(urlPath.split("?")[0] ?? "/")).replace(/^(\.\.[/\\])+/, "");
  const direct = join(root, cleanPath);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  const indexPath = join(root, cleanPath, "index.html");
  if (existsSync(indexPath)) return indexPath;
  return join(root, "404.html");
}

export function createWebsiteServer({ fetchImpl = fetch, config = deletionConfig, rateLimiter = deletionRateLimiter } = {}) {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (request.method === "POST" && url.pathname === ACCOUNT_DELETION_REQUEST_PATH) {
      await handleDeletionRequest({ request, response, fetchImpl, config, rateLimiter });
      return;
    }
    if (request.method === "POST" && url.pathname === ACCOUNT_DELETION_CONFIRM_PATH) {
      await handleDeletionConfirmation({ request, response, fetchImpl, config, rateLimiter });
      return;
    }

    const filePath = resolvePath(request.url ?? "/");
    const status = filePath.endsWith("404.html") ? 404 : 200;
    response.writeHead(status, {
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
      ...securityHeaders(),
    });
    createReadStream(filePath).pipe(response);
  });
}

async function handleDeletionRequest({ request, response, fetchImpl, config, rateLimiter }) {
  if (!isAllowedRequestOrigin(request.headers.origin, config.siteOrigin)) {
    sendHtml(response, 403, deletionResponsePage("Request blocked", "Open the account deletion page directly and try again."));
    return;
  }

  const body = await readBody(request);
  if (body.status !== "ok") {
    sendHtml(response, 413, deletionResponsePage("Request too large", "Return to the deletion page and enter only your account email."));
    return;
  }
  const fields = new URLSearchParams(body.value);
  const email = normalizeDeletionEmail(fields.get("email"));
  const honeypot = fields.get("website")?.trim();
  if (honeypot) {
    sendHtml(response, 202, deletionResponsePage("Check your email", genericRequestMessage));
    return;
  }
  if (!email) {
    sendHtml(response, 400, deletionResponsePage("Enter a valid email", "Use the email address attached to your Adaptive Strength Coach account."));
    return;
  }

  const clientKey = request.headers["x-forwarded-for"]?.split(",")[0]?.trim() || request.socket.remoteAddress || "unknown";
  const ipLimit = rateLimiter.consume({ scope: "request-ip", value: clientKey, limit: 5, windowMs: 15 * 60_000 });
  const emailLimit = rateLimiter.consume({ scope: "request-email", value: email, limit: 3, windowMs: 60 * 60_000 });
  if (!ipLimit.allowed || !emailLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds);
    response.setHeader("Retry-After", String(retryAfter));
    sendHtml(response, 429, deletionResponsePage("Try again later", "Too many requests were received. Wait before requesting another verification link."));
    return;
  }

  const result = await requestAccountDeletionLink({ email, fetchImpl, config }).catch(() => ({ status: "unavailable" }));
  if (result.status === "rate_limited") {
    response.setHeader("Retry-After", String(result.retryAfterSeconds));
    sendHtml(response, 429, deletionResponsePage("Try again later", "Too many verification emails were requested. Wait before trying again."));
    return;
  }
  if (result.status !== "accepted") {
    sendHtml(response, 503, deletionResponsePage("Deletion service temporarily unavailable", "Your account was not changed. Try again later or contact support@adaptivestrengthcoach.com."));
    return;
  }
  sendHtml(response, 202, deletionResponsePage("Check your email", genericRequestMessage));
}

async function handleDeletionConfirmation({ request, response, fetchImpl, config, rateLimiter }) {
  if (!isAllowedRequestOrigin(request.headers.origin, config.siteOrigin)) {
    sendJson(response, 403, { status: "blocked", message: "Open the verification link directly and try again." });
    return;
  }
  const clientKey = request.headers["x-forwarded-for"]?.split(",")[0]?.trim() || request.socket.remoteAddress || "unknown";
  const limit = rateLimiter.consume({ scope: "confirm-ip", value: clientKey, limit: 8, windowMs: 15 * 60_000 });
  if (!limit.allowed) {
    response.setHeader("Retry-After", String(limit.retryAfterSeconds));
    sendJson(response, 429, { status: "rate_limited", message: "Too many confirmation attempts. Wait and try again." });
    return;
  }

  const authorization = request.headers.authorization ?? "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const result = await deleteAccountForAccessToken({ accessToken, fetchImpl, config }).catch(() => ({ status: "unavailable" }));
  if (result.status === "unauthorized") {
    sendJson(response, 401, { status: "unauthorized", message: "This verification link is invalid or has expired. Request a new link." });
    return;
  }
  if (result.status === "unavailable") {
    sendJson(response, 503, { status: "unavailable", message: "The service could not confirm that every required deletion step completed. Retry with a new verification link or contact support." });
    return;
  }
  if (result.status === "already_deleted") {
    sendJson(response, 200, { status: "already_deleted", message: "This account has already been deleted." });
    return;
  }
  sendJson(response, 200, {
    status: "deleted",
    receipt: result.receipt,
    message: "Your Adaptive Strength Coach account and associated cloud data have been deleted.",
  });
}

function readBody(request, maxBytes = 8_192) {
  return new Promise((resolve) => {
    let value = "";
    let bytes = 0;
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      bytes += Buffer.byteLength(chunk);
      if (bytes <= maxBytes) value += chunk;
    });
    request.on("end", () => resolve(bytes <= maxBytes ? { status: "ok", value } : { status: "too_large" }));
    request.on("error", () => resolve({ status: "error" }));
  });
}

function sendHtml(response, status, html) {
  response.writeHead(status, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", ...securityHeaders() });
  response.end(html);
}

function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...securityHeaders() });
  response.end(JSON.stringify(value));
}

function securityHeaders() {
  return {
    "Content-Security-Policy": "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };
}

const genericRequestMessage = "If an account exists for that address, a secure verification link will be sent. The response is intentionally the same for unknown addresses.";

function deletionResponsePage(title, message) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)} | Adaptive Strength Coach</title><link rel="stylesheet" href="/styles.css?v=20260803"></head><body><main class="section legal-page"><section class="page-hero"><p class="eyebrow">Account deletion</p><h1>${escapeHtml(title)}</h1><p class="lede">${escapeHtml(message)}</p><div class="actions"><a class="button button--primary" href="/delete-account/">Back to deletion page</a><a class="button button--secondary" href="/privacy/">Privacy policy</a></div></section></main></body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

if (process.env.NODE_ENV !== "test") createWebsiteServer().listen(port, () => {
  console.log(`Adaptive Strength Coach website running on ${port}`);
});
