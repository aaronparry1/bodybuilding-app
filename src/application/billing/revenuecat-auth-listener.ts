import type { Session } from "@supabase/supabase-js";
import type { SubscriptionGateway } from "@/application/billing/subscription";

/** Shared by restored sessions and subsequent sign-in/sign-up/sign-out changes.
 * Invoked from the subscription effect, never awaited by Supabase's auth callback.
 * The caller handles failures without changing Supabase's authenticated session.
 */
export async function syncRevenueCatAuthSession(
  gateway: SubscriptionGateway,
  session: Pick<Session, "user"> | null,
  loadedProfile?: { id: string; display_name: string | null },
) {
  return gateway.identifyUser?.(session?.user.id ?? null, {
    email: session?.user.email ?? "",
    ...(session && loadedProfile?.id === session.user.id
      ? { displayName: loadedProfile.display_name }
      : {}),
  }) ?? null;
}
