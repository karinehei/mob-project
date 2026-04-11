#!/usr/bin/env bash
# CI + WSL: assembleDebug ilman emulaattoria / adb:ää (vain APK-käännös).
# Sama gradlew-CRLF -korjaus kuin wsl-run-android.sh — Windows-editorit voivat tallentaa CRLF:n.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT/android/gradlew" ]]; then
  sed -i 's/\r$//' "$ROOT/android/gradlew" 2>/dev/null || true
fi

cd "$ROOT/android"
chmod +x gradlew
exec ./gradlew assembleDebug --no-daemon
