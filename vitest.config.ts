export default {
  resolve: {
    alias: {
      "@": decodeURIComponent(new URL("./src", import.meta.url).pathname),
    },
  },
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/dist/**", "research/adaptive_stress_lab/tests/**/*.mjs", "qa-reports/legacy-migration-change-control/originals/**"],
    maxWorkers: 2,
    testTimeout: 30000,
  },
};
