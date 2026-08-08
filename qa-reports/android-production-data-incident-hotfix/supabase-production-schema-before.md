# Supabase production schema — before

Environment resolution proved the shipped EAS production configuration and checked production configuration use the same endpoint. Its dashboard name contains “staging,” which is a naming/configuration hazard, but switching to the other project would change Auth UUID authority and orphan existing owner bindings.

Before migration: 1 Auth user, 0 profiles, all 11 required public tables present, RLS enabled on all 11, and 0 rows in every public table. There were no recorded migrations. Policies targeted `public`, anon/authenticated roles had broad table privileges including truncate/trigger/reference grants, and the security-definer profile trigger function was executable by `public`.

No identifiers, credentials, emails or training rows are included in this report.
