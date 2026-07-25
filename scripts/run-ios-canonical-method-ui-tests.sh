#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEVICE_ID="${ASC_IOS_UI_TEST_DEVICE_ID:-06EEA722-8702-40AC-81FC-53E92D205303}"
DERIVED_DATA="${ASC_IOS_UI_TEST_DERIVED_DATA:-/tmp/AdaptiveStrengthCoachWorkoutCorrectionDerivedData}"
BASELINE="${ASC_IOS_METHOD_BASELINE:-/tmp/asc-ios-method-baseline.json}"
RESULT_ROOT="${ASC_IOS_METHOD_RESULT_ROOT:-/tmp/asc-ios-method-results}"
FIXTURE="$ROOT/ios/AdaptiveStrengthCoachUITests/Fixtures/prepare_persisted_state.py"
BUILD_FIRST="${ASC_IOS_METHOD_BUILD_FIRST:-0}"
BUILT_METHOD_TESTS=0

mkdir -p "$RESULT_ROOT"
python3 "$FIXTURE" snapshot --device-id "$DEVICE_ID" --snapshot "$BASELINE"

run_method() {
  local method="$1"
  local carrier="$RESULT_ROOT/$method-carrier.json"
  local evidence="$RESULT_ROOT/$method-evidence.json"
  npx vite-node --config vitest.config.ts scripts/generate-native-method-carrier.mjs "$method" "$carrier"
  python3 "$FIXTURE" restore --device-id "$DEVICE_ID" --snapshot "$BASELINE"
  python3 "$FIXTURE" inject-method --device-id "$DEVICE_ID" --snapshot "$BASELINE" --carrier "$carrier" --evidence "$evidence"
  local test_name
  if [[ "$method" == "antagonist_superset" ]]; then
    test_name="testInjectedCanonicalAntagonistSupersetIsExecutable"
  else
    test_name="testInjectedCanonicalRestPauseIsExecutable"
  fi
  local without_building=1
  if [[ "$BUILD_FIRST" == "1" && "$BUILT_METHOD_TESTS" == "0" ]]; then
    without_building=0
    BUILT_METHOD_TESTS=1
  fi
  ASC_IOS_UI_TEST_RESET_APP=0 \
  ASC_IOS_UI_TEST_CONTENT_SIZE="${ASC_IOS_UI_TEST_CONTENT_SIZE:-medium}" \
  ASC_IOS_UI_TEST_DEVICE_ID="$DEVICE_ID" \
  ASC_IOS_UI_TEST_DERIVED_DATA="$DERIVED_DATA" \
  ASC_IOS_UI_TEST_RESULT_PATH="$RESULT_ROOT/$method.xcresult" \
  ASC_IOS_UI_TEST_ONLY_TEST="AdaptiveStrengthCoachUITests/ReleaseCandidateJourneyUITests/$test_name" \
  ASC_IOS_UI_TEST_WITHOUT_BUILDING="$without_building" \
    "$ROOT/scripts/run-ios-release-candidate-ui-tests.sh"
}

run_method antagonist_superset
run_method rest_pause
python3 "$FIXTURE" restore --device-id "$DEVICE_ID" --snapshot "$BASELINE"
