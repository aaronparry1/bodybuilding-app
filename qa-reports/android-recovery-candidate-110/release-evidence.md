# Android recovery candidate 110 evidence

Status at 2026-08-07: uploaded successfully to Google Play Alpha closed testing, but still **in review** and therefore not yet independently confirmed installable by the intended tester.

## Source and build

- Repair checkpoint: `7c238b04e70f4aef04131db33025f44b689781dd`
- Candidate metadata commit: `0c8ae3c889ee795574ef685cd7a80606b737b77c`
- EAS project: `@arxapps/hypertrophy-app`
- EAS build ID: `4a604942-e9a0-4c83-b05f-1fa409eb5dc5`
- EAS build status: finished
- Artifact: `https://expo.dev/artifacts/eas/bYCg2PsGfZ73_5-BFY37pRJuInZchUr__21AWaiboBY.aab`
- Artifact SHA-256: `8f69edb22e9034e7d2d1335bcab01b9c6b0cbdd44f270f2a019b01b0b3301004`
- Package: `com.aaronparry.adaptivestrengthcoach`
- Version name: `1.0.18`
- VersionCode: `110`
- EAS production upload certificate SHA-1: `7C:56:70:47:44:70:8B:0B:21:19:88:B6:E7:EC:D8:EA:B3:CF:68:9B`
- EAS production upload certificate SHA-256: `F7:A8:0C:8A:77:09:3B:0E:91:B6:D0:90:6D:A9:91:20:57:EB:D2:5E:5C:86:C2:FC:F2:25:D6:A8:75:FC:11:63`

The artifact identity was inspected locally before submission. The upload certificate matches the Play-accepted upload authority; Google Play App Signing retains the existing application signing identity for tester-delivered APKs.

## Distribution

- EAS submission ID: `0d837306-b381-4932-b4ae-44e646c7e302`
- Submission result: accepted by Google Play
- Track: Alpha closed testing (`alpha`)
- Play Console release record: `34`
- Play Console track state after upload: `Release 1.0.18 in review`
- Production promotion/rollout: none
- iOS change/build/submission: none

Do not instruct the tester to update until Play Console changes from **in review** to **available to selected testers**, the intended tester remains enrolled in Alpha, and Google Play offers versionCode 110 as an update to the existing package.

## Verification summary

- Focused retained-data/programme-editing/backup/diagnostic/P0/P1A tests: 120 passed
- Complete suite: 395 files, 2,407 tests passed
- TypeScript: passed
- Production Expo configuration: package/router/versionCode passed
- Production payload scan: 27 files, zero findings
- `git diff --check`: passed
- Mounted coaching authorities: 1
- Competing coaching authorities: 0
- UI adaptation authorities: 0
