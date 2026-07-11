# Google Play Upload Key Reset

Last updated: June 21, 2026

## Purpose

Prepare the upload-key reset request for the existing Google Play listing.

The app signing key must remain unchanged. Only the Google Play upload key should be reset so Google Play accepts Android App Bundles signed by the current EAS production Android credential.

## App identity

- Package name: `com.aaronparry.adaptivestrengthcoach`
- EAS project: `@arxapps/hypertrophy-app`
- EAS profile inspected: `production`

Do not change the Android package name.

## Current mismatch

Google Play currently has these certificates for the app.

App signing key certificate:

```text
MD5:    3B:51:30:8B:51:6C:C2:86:FE:8A:A2:38:8F:46:C1:6C
SHA1:   20:64:FA:43:B7:37:6F:46:7A:9B:51:82:30:A7:BF:0D:0C:33:B3:98
SHA256: 65:41:E1:60:FE:6B:9C:DB:1F:C0:8F:2F:3C:B5:8F:6B:16:59:E0:AE:A8:F8:2F:FC:37:EA:52:0B:4E:54:CD:64
```

Upload key certificate:

```text
MD5:    8D:C0:31:C4:3C:FE:69:EC:AC:6B:15:74:66:3D:32:23
SHA1:   EC:F8:65:86:E2:3E:43:65:1E:37:0D:11:C3:B0:FD:E8:6E:92:24:84
SHA256: C9:15:3F:9D:F0:22:71:25:CA:C0:C7:47:B7:40:60:59:32:72:E2:81:AB:6B:3A:35:80:B8:28:F4:88:8D:BE:D1
```

The current EAS production Android upload certificate is:

```text
SHA1:   7C:56:70:47:44:70:8B:0B:21:19:88:B6:E7:EC:D8:EA:B3:CF:68:9B
SHA256: F7:A8:0C:8A:77:09:3B:0E:91:B6:D0:90:6D:A9:91:20:57:EB:D2:5E:5C:86:C2:FC:F2:25:D6:A8:75:FC:11:63
```

Google Play rejected the previous Android App Bundle because it was signed with the current EAS key, while Play still expects the older upload key.

The public Play Console certificate files were inspected:

```text
/Users/aaronparry/Downloads/upload_cert.der
/Users/aaronparry/Downloads/deployment_cert.der
```

These files confirm the expected fingerprints, but they cannot be used to sign Android App Bundles because they do not contain the private upload keystore.

## Exported certificate

Upload certificate file:

```text
credentials/android-upload-reset/upload_certificate.pem
```

This PEM file contains the public upload certificate only. It does not contain the private keystore or passwords.

Verified certificate details:

```text
Owner: CN=, OU=, O=, L=, ST=, C=
Issuer: CN=, OU=, O=, L=, ST=, C=
Serial number: 2d5e19ddb6677552
Valid from: Sun Jun 21 16:01:24 BST 2026
Valid until: Thu Nov 06 15:01:24 GMT 2053
Signature algorithm: SHA256withRSA
Public key: 2048-bit RSA
SHA1: 7C:56:70:47:44:70:8B:0B:21:19:88:B6:E7:EC:D8:EA:B3:CF:68:9B
SHA256: F7:A8:0C:8A:77:09:3B:0E:91:B6:D0:90:6D:A9:91:20:57:EB:D2:5E:5C:86:C2:FC:F2:25:D6:A8:75:FC:11:63
```

## Verification commands used

Credentials were inspected with:

```bash
npx eas-cli@latest credentials -p android
```

The current EAS credential was downloaded temporarily through:

```text
credentials.json: Upload/Download credentials between EAS servers and your local json
Download credentials from EAS to credentials.json
```

The public certificate was exported with:

```bash
keytool -exportcert -rfc \
  -keystore credentials/android/keystore.jks \
  -alias 4695e15a9c1892899462f3856eb4ceb8 \
  -file credentials/android-upload-reset/upload_certificate.pem
```

The certificate fingerprints were verified with:

```bash
keytool -printcert -file credentials/android-upload-reset/upload_certificate.pem
openssl x509 -in credentials/android-upload-reset/upload_certificate.pem -noout -fingerprint -sha1
openssl x509 -in credentials/android-upload-reset/upload_certificate.pem -noout -fingerprint -sha256
```

The temporary private credential files were then removed:

```text
credentials.json
credentials/android/keystore.jks
```

Only the public PEM remains.

## Google Play Console menu path

Use the Google Play Console:

```text
Google Play Console
-> Select Adaptive Strength Coach
-> Setup
-> App integrity
-> App signing
-> Upload key certificate
-> Request upload key reset
```

Depending on the Play Console layout, this may appear under:

```text
Test and release
-> App integrity
-> App signing
-> Upload key certificate
-> Request upload key reset
```

Google's Android signing documentation confirms that if Play App Signing is enabled and the upload key is lost or compromised, the upload key can be reset in Play Console without changing the app signing key.

## Reset steps for Aaron

1. Open Google Play Console.
2. Select the app with package `com.aaronparry.adaptivestrengthcoach`.
3. Go to `Setup -> App integrity`.
4. Open the `App signing` tab.
5. Scroll to `Upload key certificate`.
6. Choose `Request upload key reset`.
7. Select the reason closest to `I lost my upload key`.
8. Upload:

```text
credentials/android-upload-reset/upload_certificate.pem
```

9. Paste the support text below.
10. Submit the request.
11. Wait for Google Play to confirm the upload key reset.
12. After confirmation, run a new Android production build.
13. Upload the new `.aab` to closed testing.

Do not upload another `.aab` until Google confirms the new upload key has been accepted.

## Paste-ready Google Play request text

```text
Hello Google Play Support,

We no longer have access to the previous upload key for package com.aaronparry.adaptivestrengthcoach.

Please reset the upload key and replace it with the attached upload certificate.

New upload certificate:
SHA1: 7C:56:70:47:44:70:8B:0B:21:19:88:B6:E7:EC:D8:EA:B3:CF:68:9B
SHA256: F7:A8:0C:8A:77:09:3B:0E:91:B6:D0:90:6D:A9:91:20:57:EB:D2:5E:5C:86:C2:FC:F2:25:D6:A8:75:FC:11:63

The app signing key should remain unchanged.

Thank you.
```

## Build safety status

Android build/upload is not safe yet.

It becomes safe only after Google Play confirms that this upload certificate is accepted:

```text
SHA1: 7C:56:70:47:44:70:8B:0B:21:19:88:B6:E7:EC:D8:EA:B3:CF:68:9B
```

Until then:

- Do not start an Android production build for Play upload.
- Do not upload another `.aab`.
- Do not change the Android package name.
- Do not change RevenueCat products or entitlement configuration.

## References

- Android Developers: Sign your app - upload key reset and Play App Signing
  https://developer.android.com/studio/publish/app-signing
