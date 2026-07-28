# Build command and resolution

Verdict: **PROVEN**

Executed command:

`EAS_NO_VCS=1 EAS_SKIP_AUTO_FINGERPRINT=1 npx eas-cli@latest build --platform ios --profile production --non-interactive --wait`

The normal VCS archive route and its automatic fingerprint step stalled in local Git pack processing before any paid build was created. The bounded no-VCS route archived the clean, committed working tree successfully. Skipping the optional fingerprint avoided the same local Git pack defect; it did not change the production bundle.

Resolved route:

- EAS project: `@arxapps/hypertrophy-app`
- Project ID: `74af0233-9986-445e-b138-8210fa059bfc`
- Build profile: `production`
- Distribution: App Store
- Scheme: `AdaptiveStrengthCoach`
- Configuration: `Release`
- Bundle identifier: `com.aaronparry.adaptivestrengthcoach`
- Marketing version: `1.0.15`
- Candidate build number: `47`
- Version source: EAS remote
- Auto-increment: enabled
- Credentials source: EAS remote
- Production router root: `app-production`
- Development/profiling client dependency: absent

- Committed source revision: `553cbf5f5e99aeeca2c948dc07d88912958d2929`
- EAS build: `f186502a-3695-4b7a-abb0-2854e996b8ac`

EAS used the existing remote App Store distribution certificate, active provisioning profile and server-held App Store Connect API key. Credential contents were not copied into artifacts.
