# Candidate 111 artifact inspection

Result: **passed**.

The downloaded 75 MB AAB matched SHA-256 `1a1e3564a4b381800119c980f62c0cb9e923501c6fabf6c5f72201dc8e8354d6`. Its binary manifest contains package `com.aaronparry.adaptivestrengthcoach`, versionName 1.0.18 and versionCode 111. Embedded Expo configuration reports `app-production`, `production`, and the configured production Supabase hostname; only a SHA-256 of that hostname was retained in inspection output.

The extracted 1,476-file payload passed the canonical production-payload marker scan. Additional scans found no service-role/DB credential markers, private keys, staging-test passwords, dev-client launcher, profiling route, or QA fixture markers. No repository QA report, environment file, test suite, or unrelated untracked directory was packaged. Native debug-symbol metadata is present for Play crash symbolication and is not development-client tooling.

Signature container files are present and the upload certificate was extracted without exposing credentials. Artifact inspection did not modify the repository or any user data.
