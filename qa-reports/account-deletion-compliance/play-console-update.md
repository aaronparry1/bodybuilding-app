# Google Play Data safety update

The public deployment and disposable-account deletion transaction are now green. The remaining action is to update the Google Play Console declaration; no Console submission was performed by this repository task.

## Account deletion fields

1. Open Google Play Console → Adaptive Strength Coach (`com.aaronparry.adaptivestrengthcoach`).
2. Open **Policy and programs → App content → Data safety → Manage**.
3. Confirm that the app allows users to create an account: **Yes**.
4. Confirm that users can request deletion of the account and associated data: **Yes**.
5. Enter exactly: `https://adaptivestrengthcoach.com/delete-account/`
6. Confirm the in-app path: **Account → Account controls → Delete account**. This opens the public verified flow; Logout is not deletion.
7. Disclose that store subscriptions must be cancelled separately.

## Data collection reconciliation

Use `data-safety-reconciliation.json` as evidence rather than copying old answers. The minimum current declarations supported by code are:

- email address — collected for optional cloud accounts; app functionality/account management;
- user IDs — collected by Supabase and passed to RevenueCat; app functionality/account management/security;
- purchase history — collected by RevenueCat; app functionality and analytics;
- fitness information — transmitted by signed-in cloud-sync paths when supported; app functionality/personalisation;
- other user-generated content — custom programmes, exercises, notes and settings may be transmitted by signed-in cloud-sync paths; app functionality/personalisation.

All inspected network endpoints use HTTPS. No sale of data or non-service-provider sharing was found. No advertising, behavioural analytics or crash-reporting SDK was found. No photos/files bucket, location, contacts, messages, audio, calendar or browsing collection path was found.

Because the prior submitted Data safety form itself is not stored in the repository and no authenticated Play Console session has yet been used, do not claim which old fields changed beyond the proven invalid deletion URL. Review each current Console answer against the reconciliation JSON before saving.

## Submission

After saving, open Publishing overview, confirm only the intended Data safety changes are present, then send those changes for review. Record the submission time and receipt/status here. No appeal is appropriate because the prior URL genuinely returned 404.

Current status: **ready for the owner to enter and submit in Play Console; not yet submitted**. Before sending for review, confirm Publishing overview contains only the intended Data safety/account-deletion changes.
