import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDeletionRateLimiter,
  deleteAccountForAccessToken,
  isAllowedRequestOrigin,
  normalizeDeletionEmail,
  requestAccountDeletionLink,
  validateDeletionConfig,
} from "../website/account-deletion.mjs";
import { createWebsiteServer } from "../website/server.mjs";

const root = process.cwd();
const userId = "11111111-1111-4111-8111-111111111111";
const accessToken = "x".repeat(64);
const config = {
  supabaseUrl: "https://project.supabase.co",
  supabasePublishableKey: "public-key",
  supabaseServiceRoleKey: "server-secret",
  revenueCatSecretApiKey: "rc-secret",
  siteOrigin: "https://adaptivestrengthcoach.com",
};

afterEach(() => vi.restoreAllMocks());

describe("public account deletion compliance", () => {
  it("publishes the canonical app/developer identity, real POST form, privacy link, and accurate data categories", () => {
    const page = readFileSync(join(root, "website/public/delete-account/index.html"), "utf8");
    expect(page).toContain("Delete your Adaptive Strength Coach account");
    expect(page).toContain("Arx Algorithms");
    expect(page).toContain('method="post" action="/api/delete-account/request"');
    expect(page).toContain('name="email" type="email"');
    expect(page).toContain("Data deleted");
    expect(page).toContain("Data not controlled by the deleted app account");
    expect(page).toContain('href="/privacy-policy/"');
    expect(page).not.toMatch(/name="password"|type="password"/);
  });

  it("mounts a readily discoverable production Account path to the canonical web flow", () => {
    const account = readFileSync(join(root, "app/(protected)/(tabs)/account.tsx"), "utf8");
    const productionRoute = readFileSync(join(root, "app-production/(protected)/(tabs)/account.tsx"), "utf8");
    const contract = readFileSync(join(root, "src/application/account/account-deletion.ts"), "utf8");
    expect(productionRoute).toContain("app/(protected)/(tabs)/account");
    expect(account).toContain('label="Delete account"');
    expect(account).toContain("openAccountDeletionRequest");
    expect(contract).toContain("https://adaptivestrengthcoach.com/delete-account/");
    expect(account).toContain("separate from logging out");
  });

  it("validates and normalizes only a bounded email address", () => {
    expect(normalizeDeletionEmail(" Athlete@Example.COM ")).toBe("athlete@example.com");
    expect(normalizeDeletionEmail("not-an-email")).toBeNull();
    expect(normalizeDeletionEmail(`a@${"x".repeat(250)}.com`)).toBeNull();
  });

  it("hashes rate-limit identities and blocks repeated requests deterministically", () => {
    let time = 1_000;
    const limiter = createDeletionRateLimiter({ now: () => time });
    expect(limiter.consume({ scope: "email", value: "person@example.com", limit: 2, windowMs: 1_000 }).allowed).toBe(true);
    expect(limiter.consume({ scope: "email", value: "person@example.com", limit: 2, windowMs: 1_000 }).allowed).toBe(true);
    expect(limiter.consume({ scope: "email", value: "person@example.com", limit: 2, windowMs: 1_000 }).allowed).toBe(false);
    time = 2_001;
    expect(limiter.consume({ scope: "email", value: "person@example.com", limit: 2, windowMs: 1_000 }).allowed).toBe(true);
  });

  it("requests a non-creating Supabase magic link with a deletion-only redirect", async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => new Response("{}", { status: 200 }));
    await expect(requestAccountDeletionLink({ email: "person@example.com", fetchImpl, config })).resolves.toEqual({ status: "accepted" });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toContain("/auth/v1/otp?redirect_to=");
    expect(decodeURIComponent(String(url))).toContain("https://adaptivestrengthcoach.com/delete-account/verify/");
    expect(JSON.parse(String(init?.body))).toEqual({ email: "person@example.com", create_user: false });
    expect(JSON.stringify(init)).not.toContain("server-secret");
  });

  it("does not turn an unknown-account provider response into account enumeration", async () => {
    const fetchImpl = vi.fn(async () => new Response('{"error":"unknown"}', { status: 400 }));
    await expect(requestAccountDeletionLink({ email: "unknown@example.com", fetchImpl, config })).resolves.toEqual({ status: "accepted" });
  });

  it("fails closed before account mutation when the server-only RevenueCat deletion credential is absent", async () => {
    const fetchImpl = vi.fn();
    const incomplete = { ...config, revenueCatSecretApiKey: "" };
    expect(validateDeletionConfig(incomplete, { requireRevenueCat: true })).toEqual({ ready: false, missing: ["REVENUECAT_SECRET_API_KEY"] });
    await expect(deleteAccountForAccessToken({ accessToken, fetchImpl, config: incomplete })).resolves.toMatchObject({ status: "unavailable" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects an invalid or expired owner token without calling either deletion authority", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 401 }));
    await expect(deleteAccountForAccessToken({ accessToken, fetchImpl, config })).resolves.toEqual({ status: "unauthorized" });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("deletes the verified RevenueCat identity before deleting the matching Supabase auth owner", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      calls.push(`${init?.method ?? "GET"} ${url}`);
      if (url.endsWith("/auth/v1/user")) return new Response(JSON.stringify({ id: userId }), { status: 200 });
      if (url.includes("api.revenuecat.com")) return new Response(JSON.stringify({ deleted: true }), { status: 200 });
      if (url.endsWith(`/auth/v1/admin/users/${userId}`)) return new Response("{}", { status: 200 });
      return new Response("{}", { status: 500 });
    });
    const result = await deleteAccountForAccessToken({ accessToken, fetchImpl, config });
    expect(result.status).toBe("deleted");
    expect(result.receipt).toMatch(/^ASC-[A-F0-9]{8}$/);
    expect(calls).toEqual([
      "GET https://project.supabase.co/auth/v1/user",
      `DELETE https://api.revenuecat.com/v1/subscribers/${userId}`,
      `DELETE https://project.supabase.co/auth/v1/admin/users/${userId}`,
    ]);
  });

  it("does not delete Supabase when third-party erasure fails", async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/auth/v1/user")) return new Response(JSON.stringify({ id: userId }), { status: 200 });
      return new Response("{}", { status: 503 });
    });
    await expect(deleteAccountForAccessToken({ accessToken, fetchImpl, config })).resolves.toEqual({ status: "unavailable", reason: "subscription_processor" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("treats an already-absent RevenueCat identity as idempotent and never targets a body-supplied user ID", async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/auth/v1/user")) return new Response(JSON.stringify({ id: userId }), { status: 200 });
      if (url.includes("api.revenuecat.com")) return new Response("{}", { status: 404 });
      return new Response("{}", { status: 200 });
    });
    await expect(deleteAccountForAccessToken({ accessToken, fetchImpl, config })).resolves.toMatchObject({ status: "deleted" });
    expect(fetchImpl.mock.calls.map(([url]) => String(url)).join("\n")).not.toContain("22222222-2222-4222-8222-222222222222");
  });

  it("accepts only the canonical same-origin form submission when Origin is present", () => {
    expect(isAllowedRequestOrigin(undefined)).toBe(true);
    expect(isAllowedRequestOrigin("https://adaptivestrengthcoach.com")).toBe(true);
    expect(isAllowedRequestOrigin("https://attacker.example")).toBe(false);
  });

  it("accepts WebKit's opaque Origin only for a same-site form navigation to the canonical host", async () => {
    const provider = vi.fn(async () => new Response("{}", { status: 200 }));
    const server = createWebsiteServer({ fetchImpl: provider, config, rateLimiter: createDeletionRateLimiter() });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server address unavailable");
    try {
      const submit = (site: string, host: string) => fetch(`http://127.0.0.1:${address.port}/api/delete-account/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Forwarded-Host": host,
          Origin: "null",
          "Sec-Fetch-Site": site,
        },
        body: new URLSearchParams({ email: "private@example.com" }),
      });
      expect((await submit("same-origin", "adaptivestrengthcoach.com")).status).toBe(202);
      expect((await submit("cross-site", "adaptivestrengthcoach.com")).status).toBe(403);
      expect((await submit("same-origin", "attacker.example")).status).toBe(403);
      expect(provider).toHaveBeenCalledTimes(1);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("serves a JavaScript-free valid request confirmation without reflecting the email", async () => {
    const provider = vi.fn(async () => new Response("{}", { status: 200 }));
    const server = createWebsiteServer({ fetchImpl: provider, config, rateLimiter: createDeletionRateLimiter() });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server address unavailable");
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/delete-account/request`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email: "private@example.com" }),
      });
      const html = await response.text();
      expect(response.status).toBe(202);
      expect(html).toContain("Check your email");
      expect(html).not.toContain("private@example.com");
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it("returns a bounded validation error and never contacts the provider for malformed input", async () => {
    const provider = vi.fn();
    const server = createWebsiteServer({ fetchImpl: provider, config, rateLimiter: createDeletionRateLimiter() });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server address unavailable");
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/delete-account/request`, {
        method: "POST",
        body: new URLSearchParams({ email: "invalid" }),
      });
      expect(response.status).toBe(400);
      expect(provider).not.toHaveBeenCalled();
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
