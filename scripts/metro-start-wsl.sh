#!/usr/bin/env bash
# Metro WSL: /mnt/... on hidasta — tämä skripti tulostaa heti ohjeen ja käyttää --verbose.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=== Metro (WSL) ==="
if [[ "$ROOT" == /mnt/* ]]; then
  echo "Repo on Windows-levyllä (drvfs). Ensimmäinen skannaus voi kestää 10–25 min."
  echo "Tyhjä näyttö EI tarkoita välttämättä jumia — alla pitäisi tulla verbose-rivejä."
  echo ""
  echo "Jos et jaksa odottaa: käynnistä Metro Windows PowerShellissä (D:\\…\\mob-project → npm start)"
  echo "ja aja Android vain WSL:ssä (npm run android:wsl)."
  echo ""
  export CHOKIDAR_USEPOLLING="${CHOKIDAR_USEPOLLING:-1}"
fi

export REACT_NATIVE_PACKAGER_HOSTNAME="${REACT_NATIVE_PACKAGER_HOSTNAME:-127.0.0.1}"

exec npx react-native start --verbose "$@"
