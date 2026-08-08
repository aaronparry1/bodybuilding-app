# Supabase deployment result

The controlled production migration succeeded. Post-deploy: 11/11 required tables, RLS on 11/11, 1/1 Auth identity has a profile, zero remote training rows, zero anon non-select grants, zero authenticated truncate/trigger/reference grants, and the security-definer trigger is not publicly executable.

Security advisor result: one unrelated warning remains—leaked-password protection is disabled. See [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

No remote migration was applied to the separate “Strength App” project.
