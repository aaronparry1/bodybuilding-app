# Build result

The first EAS client attempt reserved remote build 53 but remained in local project fingerprinting for ten minutes and never created an EAS build record. It was stopped, the remote counter was safely restored to 52 after confirming no Build 53 existed, and the same committed source was retried with EAS's recommended `EAS_SKIP_AUTO_FINGERPRINT=1` setting.

Successful build:

- EAS build ID: `31e40c45-10f5-4d95-8901-8720047c698d`;
- status: `FINISHED`;
- source: `d0e644035b974c7cf6299d491bdb3a15498cd904`;
- version/build: `1.0.18 (53)`;
- profile/distribution: `production` / `STORE`;
- SDK: `56.0.0`;
- created: `2026-08-01T06:45:23.529Z`;
- completed: `2026-08-01T06:54:02.319Z`;
- artifact: `https://expo.dev/artifacts/eas/IAGrIJj0aU1-aEqkAlUz02gRQxJdIzkqYViKu4KOpBM.ipa`;
- downloaded artifact SHA-256: `0b800e00d26c2295b69831f5e304fbb35ec3e79a1d638889e964667c42371976`.

The signed IPA's `Info.plist` independently reported the expected display name, bundle, `1.0.18`, build `53`, minimum iOS `16.4` and non-exempt encryption `false`. Its archive listing contained no development-client launcher/menu payload.
