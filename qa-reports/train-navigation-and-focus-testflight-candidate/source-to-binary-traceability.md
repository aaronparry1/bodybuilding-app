# Source-to-binary traceability

Source chain:

`71333d44befd19ab700ab97aa1b3a6b40b9213ce`
→ `4f10250d0d7a7e710c9ced5b77a40862b2aba5e6`
→ `d0e644035b974c7cf6299d491bdb3a15498cd904`
→ EAS build `31e40c45-10f5-4d95-8901-8720047c698d`
→ EAS submission `13e673a9-88dd-4ce7-b6fb-6f9465c009ea`
→ App Store Connect processing receipt for `1.0.18 (53)`.

`git merge-base --is-ancestor` returned success for both the production repair and its audit certification against the release source. EAS independently recorded `gitCommitHash` as `d0e644035b974c7cf6299d491bdb3a15498cd904`. The signed IPA independently reported the production bundle and exact candidate version/build.

The diff from certified repair HEAD to release source contains only release/native metadata plus the necessary historical Build 52 evidence-test correction. It contains no prescription, workout, coaching, startup, Discard, dependency or UI behavior change.
