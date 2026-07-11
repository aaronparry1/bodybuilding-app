# Baseline commit inventory

Decision date: 2026-07-11. This inventory covers the initial local commit only.

| Path | Classification | Decision / rationale |
| --- | --- | --- |
| `app/`, `src/`, `tests/` | Include | Application, domain, infrastructure and test source. |
| `assets/`, `website/`, `plugins/` | Include | Product assets and checked-in product/supporting source. |
| `package.json`, `package-lock.json`, `tsconfig.json`, `vitest.config.ts`, `metro.config.js`, `eas.json`, `app.config.ts`, `.easignore` | Include | Reproducible application/build configuration, subject to secret scan. |
| `ios/` excluding `Pods/`, `build/`, local Xcode state | Include | Native source/project configuration is reproducible build input. |
| `supabase/` | Include | Schema/migrations/scripts; inspected as database code, not a data dump. |
| `docs/`, `research/`, `reports/`, `scripts/`, `AGENTS.md`, `CLAUDE.md`, `LICENSE` | Include | Architecture, research, guidance and essential scripts. Marketing ZIP archives and generated documentation/report screenshots are excluded. |
| `qa-reports/legacy-migration-change-control/{manifest.md,baseline-failures.md,baseline-commit-inventory.md}` | Include | Durable migration governance records. |
| `qa-reports/legacy-migration-change-control/originals/` | Exclude as local-only | Per-file recovery copies; must never become baseline source. |
| `.env.local`, `.env`, `.env.development`, `.env.staging`, `.env.production` | Exclude as sensitive/local-only | Local environment credentials/configuration. |
| `.env.example`, `.env.local.example`, `.env.production.example`, `.env.staging.example` | Exclude pending user decision | Nonempty Supabase/RevenueCat-related values and staging credential variable names require explicit confirmation before versioning. |
| `credentials/` and `credentials/android-upload-reset/upload_certificate.pem` | Exclude as sensitive | Certificate material. |
| `node_modules/`, `.expo/`, `dist/`, `web-build/`, `ios/Pods/`, `ios/build/` | Exclude as generated | Dependency and generated native/web build output. |
| `qa-screenshots/`, `screenshots/`, `docs/screenshots/`, report screenshot folders, `test-results/`, `output/`, most `qa-reports/` | Exclude as generated | QA images, test output, generated reports and an accidentally test-discovered QA artifact. |
| `.claude/`, `.idea/`, `.vscode/`, `.DS_Store`, logs and swap files | Exclude as local-only | Editor/OS temporary state. |
| `hf_portfolio_backtest/` | Exclude pending user decision | Separate Forex/backtest project, not demonstrably part of Bodybuilding App. |

No environment file or certificate is staged. The pending paths remain intentionally untracked rather than force-ignored, so an owner can review them later.
