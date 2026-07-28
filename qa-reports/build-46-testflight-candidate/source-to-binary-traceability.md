# Source-to-binary traceability

Verdict: **PARTIALLY PROVEN**

- Certified source checkpoint: `f91d4ba554debd853e9fec442d836a5cf4e47b42`
- Production repair: `3c26d5002a103a14121a7a34eb74b67065cbc98d`
- Initial release metadata commit: `fd4d56db099bce2f36ca59bcdb52225d9d122d4d`
- Apple-required version commit: `553cbf5f5e99aeeca2c948dc07d88912958d2929`
- Allowed source delta: iOS release metadata and deterministic artifact-test reconciliation only
- Marketing version: `1.0.15`
- Candidate build: `47`
- Bundle identifier: `com.aaronparry.adaptivestrengthcoach`
- EAS profile: `production`
- Production build context excludes tests, QA reports, source PDFs, local environments, credentials and development output through `.easignore`.

The final archive was created from the clean committed `553cbf5` working tree and uploaded as EAS build `f186502a-3695-4b7a-abb0-2854e996b8ac`. The no-VCS archive route does not attach a Git hash to EAS server metadata, so server-side Git-hash linkage is not available; local clean-tree, commit, resolved metadata, exact build ID and exact submission ID provide the retained traceability chain.
