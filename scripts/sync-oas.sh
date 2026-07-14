#!/usr/bin/env bash
# Sync the OAS spec from cesar to cesar-web for orval generation
set -euo pipefail

SRC="$HOME/Repos/cesar/api/openapi.yaml"
DST="$(dirname "$0")/../api/openapi.yaml"

mkdir -p "$(dirname "$DST")"
cp "$SRC" "$DST"
echo "OAS spec synced: $(wc -l < "$DST") lines"
