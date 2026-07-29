# Build result

## Successful replacement

- Status: `FINISHED`
- Version/build: `1.0.16 (50)`
- Bundle: `com.aaronparry.adaptivestrengthcoach`
- EAS build ID: `2b7e3589-d8e8-4765-aa7f-798bc23a20b0`
- Source commit: `d5038b4f167358d17d56fcef3598acfb0061a1d5`
- Build page: https://expo.dev/accounts/arxapps/projects/hypertrophy-app/builds/2b7e3589-d8e8-4765-aa7f-798bc23a20b0
- Exact IPA artifact: https://expo.dev/artifacts/eas/DNe6rZbNcSOUO4Ia8611PTZoRtywZ2h5--7jGDAW8rA.ipa
- Created: `2026-07-29T21:25:23.615Z`
- Completed: `2026-07-29T21:33:21.068Z`
- Queue duration: `28.325 s`
- Build duration: `446.654 s`

The archive used the existing EAS `production` profile, App Store distribution, Release configuration and production scheme. It was not a simulator, development-client, profiling, preview, ad-hoc or internal-distribution build.

## Superseded attempts

1. Build `6eede039-38e9-49f8-b37e-cdacd13e9717`, version `1.0.15 (48)`, finished successfully. Apple rejected only the closed version train (`ITMS-90062`, `ITMS-90186`).
2. Build `9f7594fa-ce23-44b1-85ad-59f606de04d4`, remote build `49`, was cancelled before archive after inspection found native `Info.plist` still resolving `1.0.15`. It was never uploaded.

The build-49 cancellation prevented knowingly producing another invalid binary. Native metadata was then aligned before build 50.
