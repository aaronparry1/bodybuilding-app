#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEVICE_ID="${ASC_IOS_UI_TEST_DEVICE_ID:-06EEA722-8702-40AC-81FC-53E92D205303}"
DERIVED_DATA="${ASC_IOS_UI_TEST_DERIVED_DATA:-/tmp/AdaptiveStrengthCoachReleaseCandidateDerivedData}"
BASELINE="${ASC_IOS_PERSISTENCE_BASELINE:-/tmp/asc-ios-persistence-baseline.json}"
RESULT_ROOT="${ASC_IOS_PERSISTENCE_RESULT_ROOT:-/tmp/asc-ios-persistence-results}"
FIXTURE="$ROOT/ios/AdaptiveStrengthCoachUITests/Fixtures/prepare_persisted_state.py"

mkdir -p "$RESULT_ROOT"
python3 "$FIXTURE" snapshot --device-id "$DEVICE_ID" --snapshot "$BASELINE"

run_case() {
  local case_name="$1"
  local test_name="$2"
  local evidence="$RESULT_ROOT/$case_name.json"
  python3 "$FIXTURE" restore --device-id "$DEVICE_ID" --snapshot "$BASELINE"
  python3 "$FIXTURE" inject --device-id "$DEVICE_ID" --snapshot "$BASELINE" --case "$case_name" --evidence "$evidence"
  ASC_IOS_UI_TEST_RESET_APP=0 \
  ASC_IOS_UI_TEST_DEVICE_ID="$DEVICE_ID" \
  ASC_IOS_UI_TEST_DERIVED_DATA="$DERIVED_DATA" \
  ASC_IOS_UI_TEST_RESULT_PATH="$RESULT_ROOT/$case_name.xcresult" \
  ASC_IOS_UI_TEST_ONLY_TEST="AdaptiveStrengthCoachUITests/ReleaseCandidateJourneyUITests/$test_name" \
    "$ROOT/scripts/run-ios-release-candidate-ui-tests.sh"
  python3 "$FIXTURE" assert --device-id "$DEVICE_ID" --snapshot "$BASELINE" --evidence "$evidence"
}

run_case stale_future testInjectedHistoricalFutureReconcilesWithoutChangingCompletedHistory
# A second launch must be idempotent and must not create another revision.
ASC_IOS_UI_TEST_RESET_APP=0 \
ASC_IOS_UI_TEST_DEVICE_ID="$DEVICE_ID" \
ASC_IOS_UI_TEST_DERIVED_DATA="$DERIVED_DATA" \
ASC_IOS_UI_TEST_RESULT_PATH="$RESULT_ROOT/stale_future_idempotent.xcresult" \
ASC_IOS_UI_TEST_ONLY_TEST="AdaptiveStrengthCoachUITests/ReleaseCandidateJourneyUITests/testInjectedHistoricalFutureReconcilesWithoutChangingCompletedHistory" \
  "$ROOT/scripts/run-ios-release-candidate-ui-tests.sh"
python3 "$FIXTURE" assert --device-id "$DEVICE_ID" --snapshot "$BASELINE" --evidence "$RESULT_ROOT/stale_future.json"

run_case corrupt_plan testInjectedCorruptPlanFailsClosedWithCustomerSafeRecovery
run_case incompatible_attempt testInjectedIncompatibleAttemptFailsClosedWithoutNavigationTrap

python3 "$FIXTURE" restore --device-id "$DEVICE_ID" --snapshot "$BASELINE"
