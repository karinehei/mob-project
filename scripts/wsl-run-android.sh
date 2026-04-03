#!/usr/bin/env bash
# WSL: emulaattori Windowsissa + repo /mnt/d/... — korjaa usein "No connected devices" / väärä adb.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=/dev/null
source "$ROOT/scripts/wsl-android-env.sh"

# Windows editors often save CRLF; #!/bin/sh\r makes WSL fail to exec the wrapper (ENOENT).
if [[ -f "$ROOT/android/gradlew" ]]; then
  sed -i 's/\r$//' "$ROOT/android/gradlew" 2>/dev/null || true
fi

cd "$ROOT/android"
./gradlew --stop || true
cd "$ROOT"

adb kill-server 2>/dev/null || true
sleep 1
adb start-server
echo "--- adb devices (pitäisi näkyä emulator-...  device) ---"
adb devices

if grep -qi microsoft /proc/version 2>/dev/null; then
  echo ""
  echo "WSL2: jos build kaatuu :app:installDebug / No connected devices vaikka yllä näkyy device,"
  echo "      lisää Windowsissa tiedostoon %UserProfile%\\.wslconfig rivit [wsl2] + networkingMode=mirrored,"
  echo "      sitten wsl --shutdown. Tarkemmin: WSL.md (kohta installDebug + adb device mutta Gradle ei)."
  echo ""
fi

set +e
npx react-native run-android "$@"
code=$?
set -e
exit "$code"
