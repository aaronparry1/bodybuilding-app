import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";

const sdk = vi.hoisted(() => ({
  configure: vi.fn(), isConfigured: vi.fn(), logIn: vi.fn(), logOut: vi.fn(),
  setEmail: vi.fn(), setDisplayName: vi.fn(), getCustomerInfo: vi.fn(),
  enableAdServicesAttributionTokenCollection: vi.fn(), getOfferings: vi.fn(),
}));
vi.mock("react-native-purchases", () => ({ default: sdk }));
vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
vi.mock("expo-constants", () => ({ default: { expoConfig: { extra: {} } } }));
vi.mock("@/lib/supabase/client", () => ({ getSupabaseClient: vi.fn(), getOptionalSupabaseClient: vi.fn() }));
import { SupabaseAuthService } from "@/application/auth/auth-provider";
import type { AppSupabaseClient } from "@/lib/supabase/client";
import { RevenueCatGateway } from "@/application/billing/revenuecat-gateway";
import { syncRevenueCatAuthSession } from "@/application/billing/revenuecat-auth-listener";

const userId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const session = (id = userId, email: string | undefined = "reviewer@example.com") => ({ user: { id, email } }) as Pick<Session, "user">;
const info = { originalAppUserId: userId, entitlements: { active: { premium: { identifier: "premium", periodType: "NORMAL", productIdentifier: "subscription_monthly_1" } } } };
let configured: boolean;
beforeEach(() => {
  vi.resetAllMocks(); configured = false;
  vi.spyOn(console, "warn").mockImplementation(() => {});
  sdk.configure.mockImplementation(() => { configured = true; });
  sdk.isConfigured.mockImplementation(async () => configured);
  sdk.logIn.mockResolvedValue({ customerInfo: info });
  sdk.logOut.mockResolvedValue(info);
  sdk.getCustomerInfo.mockResolvedValue(info);
  sdk.setEmail.mockResolvedValue(undefined); sdk.setDisplayName.mockResolvedValue(undefined);
  sdk.enableAdServicesAttributionTokenCollection.mockResolvedValue(undefined);
  sdk.getOfferings.mockResolvedValue({ current: null });
});

describe("RevenueCat auth session listener", () => {
  it("forwards a restored Supabase session and SIGNED_OUT through the auth listener", async () => {
    let emit!: (event: string, value: Session | null) => void;
    const unsubscribe = vi.fn();
    const client = { auth: { onAuthStateChange: vi.fn(callback => {
      emit = callback;
      return { data: { subscription: { unsubscribe } } };
    }) } } as unknown as AppSupabaseClient;
    const service = new SupabaseAuthService(client);
    const gateway = new RevenueCatGateway("appl_test");
    let pending: ReturnType<typeof syncRevenueCatAuthSession>;
    const stop = service.onAuthStateChange(value => {
      pending = syncRevenueCatAuthSession(gateway, value);
    });
    emit("INITIAL_SESSION", session() as Session);
    await pending!;
    expect(sdk.logIn).toHaveBeenCalledWith(userId);
    expect(sdk.setEmail).toHaveBeenCalledWith("reviewer@example.com");
    emit("SIGNED_OUT", null);
    await pending!;
    expect(sdk.logOut).toHaveBeenCalledTimes(1);
    stop();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
  for (const event of ["INITIAL_SESSION / restored launch", "SIGNED_IN", "signed-up session"]) {
    it(`${event}: configures, logs in with Supabase UUID, then attaches email`, async () => {
      const gateway = new RevenueCatGateway("appl_test");
      const result = await syncRevenueCatAuthSession(gateway, session());
      expect(result?.isPremium).toBe(true);
      expect(sdk.configure).toHaveBeenCalledWith({ apiKey: "appl_test" });
      expect(sdk.logIn).toHaveBeenCalledWith(userId);
      expect(sdk.setEmail).toHaveBeenCalledWith("reviewer@example.com");
      expect(sdk.configure.mock.invocationCallOrder[0]).toBeLessThan(sdk.logIn.mock.invocationCallOrder[0]);
      expect(sdk.logIn.mock.invocationCallOrder[0]).toBeLessThan(sdk.setEmail.mock.invocationCallOrder[0]);
      expect(sdk.setDisplayName).not.toHaveBeenCalled();
    });
  }
  it("never logs in or sets attributes when configuration is not complete", async () => {
    sdk.configure.mockImplementation(() => {});
    await expect(syncRevenueCatAuthSession(new RevenueCatGateway("appl_test"), session())).rejects.toThrow("configuration did not complete");
    expect(sdk.logIn).not.toHaveBeenCalled(); expect(sdk.setEmail).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });
  it("deduplicates repeated sessions but updates a changed email", async () => {
    const gateway = new RevenueCatGateway("appl_test");
    await Promise.all([syncRevenueCatAuthSession(gateway, session()), syncRevenueCatAuthSession(gateway, session())]);
    await syncRevenueCatAuthSession(gateway, session(userId, "updated@example.com"));
    expect(sdk.configure).toHaveBeenCalledTimes(1); expect(sdk.logIn).toHaveBeenCalledTimes(1);
    expect(sdk.setEmail).toHaveBeenLastCalledWith("updated@example.com");
  });
  it("uses a loaded profile only for the matching account and preserves setter order", async () => {
    const gateway = new RevenueCatGateway("appl_test");
    await syncRevenueCatAuthSession(gateway, session(), { id: userId, display_name: "Reviewer" });
    expect(sdk.setDisplayName).toHaveBeenCalledWith("Reviewer");
    expect(sdk.setEmail.mock.invocationCallOrder[0]).toBeLessThan(sdk.setDisplayName.mock.invocationCallOrder[0]);
    sdk.setDisplayName.mockClear();
    await syncRevenueCatAuthSession(gateway, session(), { id: "different-user", display_name: "Other person" });
    expect(sdk.setDisplayName).not.toHaveBeenCalled();
  });
  it("clears absent email and a loaded empty display name", async () => {
    await syncRevenueCatAuthSession(new RevenueCatGateway("appl_test"), { user: { id: userId } } as Pick<Session,"user">, { id: userId, display_name: null });
    expect(sdk.setEmail).toHaveBeenCalledWith(""); expect(sdk.setDisplayName).toHaveBeenCalledWith("");
  });
  it("logs out on sign-out and allows the same user to sign back in", async () => {
    const gateway = new RevenueCatGateway("appl_test");
    await syncRevenueCatAuthSession(gateway, session());
    await syncRevenueCatAuthSession(gateway, null);
    expect(sdk.logOut).toHaveBeenCalledTimes(1);
    await syncRevenueCatAuthSession(gateway, session()); expect(sdk.logIn).toHaveBeenCalledTimes(2);
  });
  it("ignores only the already-anonymous logout error", async () => {
    sdk.logOut.mockRejectedValueOnce({ code: "22" });
    const gateway = new RevenueCatGateway("appl_test");
    await expect(syncRevenueCatAuthSession(gateway, null)).resolves.toBeDefined();
    expect(console.warn).not.toHaveBeenCalled();
    sdk.logOut.mockRejectedValueOnce(new Error("network"));
    await expect(syncRevenueCatAuthSession(gateway, null)).rejects.toThrow("network");
    expect(console.warn).toHaveBeenCalled();
  });
  it("does not discard valid entitlement state or relogin after a metadata failure", async () => {
    const gateway = new RevenueCatGateway("appl_test"); sdk.setEmail.mockRejectedValueOnce(new Error("offline"));
    expect((await syncRevenueCatAuthSession(gateway, session()))?.isPremium).toBe(true);
    await syncRevenueCatAuthSession(gateway, session());
    expect(sdk.logIn).toHaveBeenCalledTimes(1); expect(sdk.setEmail).toHaveBeenCalledTimes(2); expect(console.warn).toHaveBeenCalled();
  });
  it("recovers the queue after a failed login without calling attribute setters", async () => {
    const gateway = new RevenueCatGateway("appl_test"); sdk.logIn.mockRejectedValueOnce(new Error("offline"));
    await expect(syncRevenueCatAuthSession(gateway, session())).rejects.toThrow("offline");
    expect(sdk.setEmail).not.toHaveBeenCalled();
    await syncRevenueCatAuthSession(gateway, session()); expect(sdk.setEmail).toHaveBeenCalledWith("reviewer@example.com");
  });
  it("serializes account changes while an earlier login is in flight", async () => {
    const calls: string[] = []; let finish!: () => void;
    sdk.logIn.mockImplementationOnce(async () => { calls.push("login-a"); await new Promise<void>(resolve => { finish = resolve; }); return { customerInfo: info }; });
    sdk.logIn.mockImplementationOnce(async () => { calls.push("login-b"); return { customerInfo: info }; });
    sdk.setEmail.mockImplementation(async email => { calls.push(email); });
    sdk.logOut.mockImplementation(async () => { calls.push("logout"); return info; });
    const gateway = new RevenueCatGateway("appl_test");
    const a = syncRevenueCatAuthSession(gateway, session(userId,"a@example.com"));
    await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
    const out = syncRevenueCatAuthSession(gateway,null);
    const b = syncRevenueCatAuthSession(gateway,session("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","b@example.com"));
    expect(sdk.logOut).not.toHaveBeenCalled(); finish(); await Promise.all([a,out,b]);
    expect(calls).toEqual(["login-a","a@example.com","logout","login-b","b@example.com"]);
  });
  it("shares one configure operation with simultaneous billing reads", async () => {
    const gateway = new RevenueCatGateway("appl_test");
    await Promise.all([gateway.getOfferings(), syncRevenueCatAuthSession(gateway,session())]);
    expect(sdk.configure).toHaveBeenCalledTimes(1);
  });
});
