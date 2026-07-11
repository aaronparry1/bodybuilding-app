# Android Play Signing Fix

Last updated: June 21, 2026

## Summary

The existing Google Play listing for Adaptive Strength Coach expects Android App Bundles to be signed with a different upload certificate from the one currently configured in EAS.

Android builds must not be uploaded to Google Play until this is fixed.

## App identity

- Android package name: `com.aaronparry.adaptivestrengthcoach`
- EAS project: `@arxapps/hypertrophy-app`
- Build profile inspected: `production`

The package name must not be changed.

## Google Play certificates

### App signing key certificate

This is the certificate Google Play uses to sign the app distributed to users. It is not the key EAS should use to upload Android App Bundles.

```text
MD5:    3B:51:30:8B:51:6C:C2:86:FE:8A:A2:38:8F:46:C1:6C
SHA1:   20:64:FA:43:B7:37:6F:46:7A:9B:51:82:30:A7:BF:0D:0C:33:B3:98
SHA256: 65:41:E1:60:FE:6B:9C:DB:1F:C0:8F:2F:3C:B5:8F:6B:16:59:E0:AE:A8:F8:2F:FC:37:EA:52:0B:4E:54:CD:64
```

### Upload key certificate

Google Play expects the upload certificate fingerprint:

```text
MD5:    8D:C0:31:C4:3C:FE:69:EC:AC:6B:15:74:66:3D:32:23
SHA1:   EC:F8:65:86:E2:3E:43:65:1E:37:0D:11:C3:B0:FD:E8:6E:92:24:84
SHA256: C9:15:3F:9D:F0:22:71:25:CA:C0:C7:47:B7:40:60:59:32:72:E2:81:AB:6B:3A:35:80:B8:28:F4:88:8D:BE:D1
```

EAS must sign Android App Bundles with the private upload keystore corresponding to this upload key certificate.

## Current EAS production Android credential

EAS production Android credentials currently use:

```text
Configuration: Build Credentials nAnNr2j2gG (Default)
Type: JKS
Key Alias: 4695e15a9c1892899462f3856eb4ceb8
MD5: 50:FE:31:DE:C4:5F:3C:1C:46:E3:70:1A:5D:7F:79:41
SHA1: 7C:56:70:47:44:70:8B:0B:21:19:88:B6:E7:EC:D8:EA:B3:CF:68:9B
SHA256: F7:A8:0C:8A:77:09:3B:0E:91:B6:D0:90:6D:A9:91:20:57:EB:D2:5E:5C:86:C2:FC:F2:25:D6:A8:75:FC:11:63
Updated: June 21, 2026
```

Result:

```text
MISMATCH
```

Current EAS production Android builds are signed with the wrong upload key for the existing Google Play listing.

## Commands used

Credentials were inspected with:

```bash
npx eas-cli@latest credentials -p android
```

Selections:

```text
Build profile: production
Application Identifier: com.aaronparry.adaptivestrengthcoach
```

Local keystore search:

```bash
rg --files -g '*.jks' -g '*.keystore' -g '*.p12' -g '*.pfx'
find /Users/aaronparry/Downloads /Users/aaronparry/Desktop /Users/aaronparry/Documents -maxdepth 3 \( -name '*.jks' -o -name '*.keystore' \) -print
```

No original upload keystore was found in the app repo, Desktop, Downloads, or Documents search path.

The downloaded Play Console certificate files were inspected:

```text
/Users/aaronparry/Downloads/upload_cert.der
/Users/aaronparry/Downloads/deployment_cert.der
```

They match the public Google Play certificate fingerprints above, but they are public certificates only. They cannot be used by EAS to sign an Android App Bundle because they do not contain the private upload key.

## Preferred fix path: import the original upload keystore

This is the best option if Aaron has the original upload keystore for the existing Google Play app.

Required:

- Original `.jks` or `.keystore` file
- Keystore password
- Key alias
- Key password

Import path:

```bash
npx eas-cli@latest credentials -p android
```

Then:

```text
Build profile: production
Keystore: Manage everything needed to build your project
Set up a new keystore / Upload existing keystore
```

After import, verify the EAS production Android SHA1 fingerprint matches:

```text
EC:F8:65:86:E2:3E:43:65:1E:37:0D:11:C3:B0:FD:E8:6E:92:24:84
```

Only after the fingerprint matches is it safe to run an Android production build.

## Fallback path: reset upload key in Google Play

Use this only if the original upload keystore is unavailable.

The fallback is to ask Google Play to accept the current EAS upload certificate instead:

```text
SHA1: 7C:56:70:47:44:70:8B:0B:21:19:88:B6:E7:EC:D8:EA:B3:CF:68:9B
```

Manual steps:

1. Open Google Play Console.
2. Open the Adaptive Strength Coach app.
3. Go to Setup -> App integrity.
4. Find App signing / Upload key certificate.
5. Request an upload key reset.
6. Provide the public certificate for the current EAS upload key when Google asks for it.
7. Wait for Google to confirm the upload key reset.
8. Only then build and upload a new Android App Bundle from EAS.

To obtain the public certificate from the EAS keystore, use the EAS credentials manager to download the current Android keystore only if choosing this fallback path. Do not commit the keystore or passwords.

Then export the public certificate with `keytool`, using the EAS keystore alias and passwords:

```bash
keytool -export -rfc \
  -keystore path/to/eas-upload-key.jks \
  -alias 4695e15a9c1892899462f3856eb4ceb8 \
  -file upload_certificate.pem
```

Give `upload_certificate.pem` to Google Play for the upload key reset.

## Build safety verdict

Android production build/upload is not safe yet.

Safe to build only after one of these is true:

1. The original upload keystore has been imported into EAS and EAS shows SHA1 `EC:F8:65:86:E2:3E:43:65:1E:37:0D:11:C3:B0:FD:E8:6E:92:24:84`.
2. Google Play has accepted the current EAS upload certificate `7C:56:70:47:44:70:8B:0B:21:19:88:B6:E7:EC:D8:EA:B3:CF:68:9B` as the new upload key.

Until then:

- Do not run an Android production build intended for upload.
- Do not upload any `.aab` signed with SHA1 `7C:56:70:47:44:70:8B:0B:21:19:88:B6:E7:EC:D8:EA:B3:CF:68:9B`.
- Do not change the Android package name.
- Do not create a new Play app unless explicitly choosing to abandon the existing listing.

## Remaining blockers

- Original Google Play upload keystore has not been found locally.
- EAS production Android credential does not match Google Play.
- Google Play `.der` certificate files confirm the expected fingerprints but are not signing credentials.
- Android closed testing upload remains blocked until signing is corrected.
