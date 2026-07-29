# Replacement TestFlight candidate

Verdict: **PROVEN** for the production build and upload. Genuine iPhone verification remains **NOT PROVEN**.

The certified starting checkpoint was `d0981bf8c94ecc7e249fd80ec336d1df7c7c4f16`, containing production repair `dfaebe7496c4b3ec5c3c954dac3acf5642bc16f4`. Apple rejected the first replacement archive, `1.0.15 (48)`, because the already approved `1.0.15` train is closed. A second archive was stopped before compilation when its native `Info.plist` was found to retain the closed version. The successful candidate is therefore `1.0.16 (50)`.

- Production bundle: `com.aaronparry.adaptivestrengthcoach`
- EAS build: `2b7e3589-d8e8-4765-aa7f-798bc23a20b0`
- EAS submission: `aa024d43-5abf-41d3-a5d6-af4a60fef719`
- App Store Connect application: `6762462649`
- Apple status at handoff: upload accepted; processing
- TestFlight availability: **NOT PROVEN**
- App Review submission: did not occur
- Public release: did not occur

The source difference from the certified checkpoint is limited to release/native version metadata, a historical artifact-consistency test made tolerant of successor versions, and this attributable evidence. Product and coaching behavior, programme identity, history, cycle identity, active-workout behavior and prescriptions were not changed.
