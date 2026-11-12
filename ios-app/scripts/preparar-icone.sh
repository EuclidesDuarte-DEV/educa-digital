#!/usr/bin/env bash
set -euo pipefail
# Execute a partir da raiz do repositório, em um Mac com Xcode.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="$ROOT/public/static/icons_pwa/icon-512.png"
DEST="$ROOT/ios-app/EducaDigital/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png"
test -f "$SRC" || { echo "Ícone original não encontrado: $SRC"; exit 1; }
mkdir -p "$(dirname "$DEST")"
sips -z 1024 1024 "$SRC" --out "$DEST" >/dev/null
test -s "$DEST"
echo "Ícone Educa+ para iPhone preparado."
