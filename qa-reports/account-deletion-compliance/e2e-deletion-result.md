# Disposable-account end-to-end result

Verdict: **PROVEN for the production-hosted deletion transaction**

On 2026-08-04 a disposable synthetic identity was created across the live configured providers without reading or changing any real customer record:

- Supabase auth user: created;
- cascade-linked `public.profiles` row: 1;
- RevenueCat customer under the same Supabase UUID: created.

The public production endpoint `POST https://adaptivestrengthcoach.com/api/delete-account/confirm` was called with a valid short-lived bearer token for that disposable owner. It returned HTTP 200, status `deleted`, and a correctly shaped non-sensitive receipt. Follow-up provider checks proved:

- Supabase auth user absent;
- profile rows for the disposable owner: 0;
- RevenueCat customer absent.

The read-only live aggregates returned to 4 auth users and 3 profiles, matching their pre-test values. No real record identity or content was inspected. No Apple or Google store subscription was created or cancelled.

The server derives the owner from the bearer token; the client cannot choose a user ID. RevenueCat deletion completes before Supabase deletion, so the endpoint does not claim completion while a configured processor still retains the customer.

## Request-link scope

The public passwordless request form was separately exercised in mobile WebKit and returned HTTP 202 with the generic `Check your email` result, no address reflection and no enumeration. The destructive transaction used an equivalent valid Supabase owner bearer obtained for the disposable account in the isolated test harness. Delivery and consumption of a real email through an external disposable mailbox was not exercised, so that narrow mail-deliverability detail remains outside this result.
