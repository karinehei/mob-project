#!/usr/bin/env bash
# Source from WSL before android-komentoja:  . ./scripts/wsl-android-env.sh
# Asettaa ANDROID_HOME/sdk.dir-polusta ja laittaa Windows-SDK:n platform-tools PATHin *alkuun*
# (jotta /usr/bin/adb ei voita Gradlen adb-kutsuja).

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "wsl-android-env: source tämä tiedosto:  . scripts/wsl-android-env.sh" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROP="$ROOT/android/local.properties"

if [[ ! -f "$PROP" ]]; then
  echo "wsl-android-env: puuttuu $PROP — kopioi android/local.properties.example → local.properties ja sdk.dir." >&2
  return 1
fi

# sdk.dir=/mnt/c/Users/.../Sdk  (yksi rivi)
SDK_DIR="$(grep -E '^[[:space:]]*sdk\.dir=' "$PROP" | head -1 | sed 's/^[[:space:]]*sdk\.dir=//' | tr -d '\r')"
if [[ -z "$SDK_DIR" || ! -d "$SDK_DIR/platform-tools" ]]; then
  echo "wsl-android-env: sdk.dir puuttuu tai ei löydy platform-tools: $SDK_DIR" >&2
  return 1
fi

export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"
export PATH="$SDK_DIR/platform-tools:$SDK_DIR/emulator:${PATH}"
