# Disposable-account end-to-end result

Verdict: **NOT PROVEN — blocked before creating a disposable account**

The public request mechanism is deployed and a real mobile-WebKit submission with a synthetic unknown address returned HTTP 202 and a generic `Check your email` response. No customer data was accessed.

The complete deletion transaction cannot yet be run because Railway does not contain `REVENUECAT_SECRET_API_KEY`. RevenueCat is a real production processor keyed by the Supabase user UUID, and its public mobile SDK keys cannot delete a customer. The server therefore checks for the secret before authenticating or mutating any provider and returns HTTP 503 when it is absent.

No disposable Supabase account was created merely to leave it behind in this known blocked state. No production user or profile was read or deleted. A read-only aggregate check after public verification found 4 auth users and 3 profile rows; no row contents or identities were inspected.

## Exact unblock action

1. In the RevenueCat project used by Adaptive Strength Coach, create or select a secret API key authorised to delete the app's customer profiles through the REST v1 subscriber endpoint.
2. In Railway project `adaptive-strength-coach-site` → production service `adaptive-strength-coach-site` → Variables, add it as `REVENUECAT_SECRET_API_KEY`.
3. Do not paste the value into source control, an app `EXPO_PUBLIC_*` variable, a screenshot or this report.
4. Redeploy or allow Railway to redeploy from the variable change.
5. Run the public flow with a dedicated disposable mailbox/account, verify the email link, confirm deletion, then prove the auth user, profile and RevenueCat customer are absent.

Until that succeeds, do not submit the corrected Play Data safety declaration and do not describe account deletion as end-to-end certified.
