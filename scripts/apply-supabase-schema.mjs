#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

for (const file of [".env", ".env.local", ".env.staging"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    if (!process.env[key]) {
      process.env[key] = rest.join("=").replace(/^['"]|['"]$/g, "");
    }
  }
}

const databaseUrl = process.env.SUPABASE_DB_URL;
if (!databaseUrl) {
  console.error("Missing SUPABASE_DB_URL. Add a staging database connection string to .env.local or the shell.");
  process.exit(1);
}

const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", "supabase/schema.sql"], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
