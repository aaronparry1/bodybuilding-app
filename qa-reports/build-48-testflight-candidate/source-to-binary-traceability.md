# Source-to-binary traceability

| Boundary | Evidence |
| --- | --- |
| Certified onboarding repair | `dfaebe7496c4b3ec5c3c954dac3acf5642bc16f4` |
| Independent audit checkpoint | `d0981bf8c94ecc7e249fd80ec336d1df7c7c4f16` |
| Release metadata commits | `a446b71`, `0252569`, `d5038b4f167358d17d56fcef3598acfb0061a1d5` |
| Historical artifact-test compatibility | `7b2555093ef2c177e1d50304b6d53272cb3426fa` |
| Binary source commit | `d5038b4f167358d17d56fcef3598acfb0061a1d5` |
| EAS build | `2b7e3589-d8e8-4765-aa7f-798bc23a20b0` |
| EAS artifact identity | `1.0.16 (50)`, STORE, production, SDK 56 |
| EAS submission | `aa024d43-5abf-41d3-a5d6-af4a60fef719` |
| Apple application | `6762462649` |

`git diff d0981bf8c94ecc7e249fd80ec336d1df7c7c4f16..d5038b4f167358d17d56fcef3598acfb0061a1d5` contains release/native version metadata and a successor-version tolerance in an existing historical artifact test. It does not change onboarding, startup, authentication, programme restoration, programme construction, prescriptions, progression/regression, Discard, Home, Plan or Train production behavior.

The EAS build record independently reports `gitCommitHash` `d5038b4f167358d17d56fcef3598acfb0061a1d5`, `appVersion` `1.0.16`, `appBuildVersion` `50`, `distribution` `STORE` and `buildProfile` `production`. The successful EAS submission is tied to that build ID, preserving artifact identity through upload.
