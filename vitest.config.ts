import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/dist/**", "research/adaptive_stress_lab/tests/**/*.mjs", "qa-reports/legacy-migration-change-control/originals/**"],
    maxWorkers: 2,
    testTimeout: 30000,
  },
});
