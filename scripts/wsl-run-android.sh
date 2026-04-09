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

# Metro (8081): emulaattorin localhost → WSL/Windows-isäntä. Ilman tätä RSOD "Unable to load script".
if adb reverse tcp:8081 tcp:8081 2>/dev/null; then
  echo "--- adb reverse tcp:8081 (Metro) OK ---"
else
  echo "--- adb reverse tcp:8081 epäonnistui (ei laitetta?) — käynnistä emulaattori ja yritä: adb reverse tcp:8081 tcp:8081" >&2
fi

# INSTALL_FAILED_INSUFFICIENT_STORAGE: poista vanha debug-asennus → vapauttaa tilaa pienellä AVD:llä.
adb uninstall com.foodstudy 2>/dev/null || true

if grep -qi microsoft /proc/version 2>/dev/null; then
  echo ""
  echo "WSL2: jos build kaatuu :app:installDebug / No connected devices vaikka yllä näkyy device,"
  echo "      lisää Windowsissa tiedostoon %UserProfile%\\.wslconfig rivit [wsl2] + networkingMode=mirrored,"
  echo "      sitten wsl --shutdown. Tarkemmin: WSL.md (kohta installDebug + adb device mutta Gradle ei)."
  echo "WSL2: jos asennus kaatuu INSTALL_FAILED_INSUFFICIENT_STORAGE, tyhjennä emulaattori (Device Manager → Wipe Data)"
  echo "      tai kasvata AVD:n Internal Storage; yllä oleva adb uninstall auttaa usein."
  echo "WSL2: punainen 'Unable to load script' → pidä Metro päällä (npx react-native start) ja adb reverse tcp:8081 (yllä)."
  echo ""
fi

set +e
npx react-native run-android "$@"
code=$?
set -e
exit "$code"
