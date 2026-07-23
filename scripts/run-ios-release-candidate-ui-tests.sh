#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEVICE_ID="${ASC_IOS_UI_TEST_DEVICE_ID:-06EEA722-8702-40AC-81FC-53E92D205303}"
RESULT_PATH="${ASC_IOS_UI_TEST_RESULT_PATH:-/tmp/AdaptiveStrengthCoachReleaseCandidate.xcresult}"
DERIVED_DATA="${ASC_IOS_UI_TEST_DERIVED_DATA:-/tmp/AdaptiveStrengthCoachReleaseCandidateDerivedData}"
CONTENT_SIZE="${ASC_IOS_UI_TEST_CONTENT_SIZE:-large}"
RESET_APP="${ASC_IOS_UI_TEST_RESET_APP:-1}"
ONLY_TEST="${ASC_IOS_UI_TEST_ONLY_TEST:-AdaptiveStrengthCoachUITests/ReleaseCandidateJourneyUITests/testFreshInstallSixtyMinuteJourneyAndRecovery}"

cd "$ROOT"
ruby scripts/configure-ios-ui-tests.rb
xcrun simctl boot "$DEVICE_ID" >/dev/null 2>&1 || true
xcrun simctl bootstatus "$DEVICE_ID" -b
xcrun simctl ui "$DEVICE_ID" content_size "$CONTENT_SIZE"
if [[ "$RESET_APP" == "1" ]]; then
  xcrun simctl uninstall "$DEVICE_ID" com.aaronparry.adaptivestrengthcoach >/dev/null 2>&1 || true
fi
rm -rf "$RESULT_PATH"
if [[ "${ASC_IOS_UI_TEST_CLEAN:-0}" == "1" ]]; then
  rm -rf "$DERIVED_DATA"
fi

export APP_ENV=production
export EAS_BUILD_PROFILE=production
export EXPO_NO_DOTENV=1
export EXPO_PUBLIC_SUPABASE_URL=https://example.invalid
export EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=disabled
unset EXPO_PUBLIC_REVENUECAT_TEST_API_KEY
unset EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
unset EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
export ASC_COACHING_ENGINE_V3=true
export ASC_V3_ACTIVE_WORKOUT=true
export ASC_V3_QUALITY_GATE_STRICT=true
export ASC_V3_SHADOW_MODE=false

xcodebuild -quiet test \
  -workspace ios/AdaptiveStrengthCoach.xcworkspace \
  -scheme AdaptiveStrengthCoachReleaseCandidate \
  -configuration Release \
  -destination "platform=iOS Simulator,id=$DEVICE_ID" \
  -derivedDataPath "$DERIVED_DATA" \
  -resultBundlePath "$RESULT_PATH" \
  "-only-testing:$ONLY_TEST" \
  ONLY_ACTIVE_ARCH=YES \
  CODE_SIGNING_ALLOWED=NO
