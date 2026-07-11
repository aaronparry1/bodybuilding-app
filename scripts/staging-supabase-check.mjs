#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envFiles = [".env", ".env.local", ".env.staging"];
for (const file of envFiles) {
  if (!existsSync(file)) continue;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    if (!process.env[key]) {
      process.env[key] = rest.join("=").replace(/^['"]|['"]$/g, "");
    }
  }
}

const requiredTables = [
  "profiles",
  "exercises",
  "programmes",
  "programme_days",
  "planned_exercises",
  "workout_sessions",
  "performed_exercises",
  "performed_sets",
  "user_settings",
  "subscription_statuses",
  "sync_queue",
];

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`OK   ${message}`);
}

function redactUrl(url) {
  return url.replace(/^https:\/\/([^.]+)\./, "https://[redacted].");
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) fail("Missing EXPO_PUBLIC_SUPABASE_URL.");
if (!publishableKey) fail("Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
if (process.exitCode) process.exit();

ok(`Supabase URL present: ${redactUrl(supabaseUrl)}`);
ok("Supabase publishable key present.");

const supabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const authProbe = await supabase.auth.getSession();
if (authProbe.error) {
  fail(`Supabase auth endpoint failed: ${authProbe.error.message}`);
} else {
  ok("Supabase auth endpoint reachable.");
}

for (const table of requiredTables) {
  const { error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) {
    fail(`Table check failed for ${table}: ${error.message}`);
  } else {
    ok(`Table reachable through REST: ${table}`);
  }
}

const testEmail = process.env.STAGING_TEST_EMAIL;
const testPassword = process.env.STAGING_TEST_PASSWORD;
if (testEmail && testPassword) {
  const signIn = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword });
  if (signIn.error) {
    const signUp = await supabase.auth.signUp({ email: testEmail, password: testPassword });
    if (signUp.error) {
      if (signUp.error.message.toLowerCase().includes("rate limit")) {
        console.log(`SKIP Auth sign-up retry is rate limited by Supabase: ${signUp.error.message}`);
      } else {
        fail(`Auth sign-in/sign-up failed for staging test user: ${signUp.error.message}`);
      }
    } else {
      ok("Staging test user sign-up endpoint accepted credentials.");
    }
  } else {
    ok("Staging test user login succeeded.");
  }

  await supabase.auth.signOut();
} else {
  console.log("SKIP Auth login test. Set STAGING_TEST_EMAIL and STAGING_TEST_PASSWORD to exercise email/password auth.");
}

if (!process.exitCode) {
  ok("Supabase staging connectivity smoke check passed.");
}
