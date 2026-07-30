# Source-to-binary traceability

Trace:

`3d52cd057e60b1d8c34eb74c98ed8067b1caf7d2`
→ `2b537854018bbaec4f0b77243b6320c13131e341`
→ `9d40e8c573cc92fda5526851c36c3cf9b406a863`
→ `f2dd468d37b7756ba7fa40be778db79361f17d59`
→ EAS build `c969f577-11cb-4bb2-9dde-9dc530f3ff93`
→ EAS submission `cd96192e-7b35-49a5-b85e-d74fd2594e56`
→ App Store Connect build `f059fc8b-77c4-451a-b546-2dd9a3167126`.

`git merge-base --is-ancestor` returned success for both repair `3d52cd057e60b1d8c34eb74c98ed8067b1caf7d2` and audit `2b537854018bbaec4f0b77243b6320c13131e341` against release source `f2dd468d37b7756ba7fa40be778db79361f17d59`.

EAS independently recorded `gitCommitHash` as `f2dd468d37b7756ba7fa40be778db79361f17d59`, version `1.0.17`, and build `52`. This proves the production-route repair is an ancestor of the uploaded binary.

The production application resolves Expo Router root `app-production`. The protected production layout uses canonical retained-training inspection and release reconciliation rather than directly routing from `onboardingCompleted` alone. Startup and Create Programme share the canonical retained-training classification contracts.
