#!/usr/bin/env bash
set -euo pipefail

# Reliable local web launch for visual QA. This intentionally avoids CI mode
# and conflicting color env vars, both of which can wedge Metro's web bundle.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -x "/opt/homebrew/opt/node@22/bin/node" ]]; then
  export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
fi

unset FORCE_COLOR
unset NO_COLOR
unset CI

export APP_ENV="${APP_ENV:-development}"
export EXPO_PUBLIC_DESIGN_QA_MODE="${EXPO_PUBLIC_DESIGN_QA_MODE:-1}"

PORT="${ASC_WEB_QA_PORT:-8098}"
EXPO_ARGS=(start --web --port "$PORT")
if [[ "${ASC_QA_CLEAR:-0}" == "1" ]]; then
  EXPO_ARGS+=(--clear)
fi

echo "Starting ASC visual QA web server"
echo "Node: $(node -v)"
echo "Port: ${PORT}"
echo "URL:  http://localhost:${PORT}"

exec npx expo "${EXPO_ARGS[@]}"
