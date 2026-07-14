#!/usr/bin/env bash
#
# sync-oas.sh — Copy the OpenAPI spec from cesar to cesar-web
#
# The canonical API contract lives at cesar/api/openapi.yaml (the backend
# owns the spec). This script copies it into cesar-web's api/ directory
# so orval can generate typed TanStack Query hooks from it.
#
# The copy is gitignored (api/openapi.yaml) because cesar-web is a consumer,
# not the source of truth. After running this script, run:
#
#     npm run gen:api
#
# to regenerate the orval API client from the updated spec.

set -euo pipefail

SRC="$HOME/Repos/cesar/api/openapi.yaml"
DST="$(dirname "$0")/../api/openapi.yaml"

if [ ! -f "$SRC" ]; then
    echo "error: source spec not found at $SRC"
    echo ""
    echo "This script copies the OpenAPI spec from the cesar backend repo."
    echo "Make sure cesar is checked out at ~/Repos/cesar/ and run:"
    echo ""
    echo "    git -C ~/Repos/cesar status"
    echo ""
    exit 1
fi

mkdir -p "$(dirname "$DST")"
cp "$SRC" "$DST"
echo "OAS spec synced: $(wc -l < "$DST") lines"
echo ""
echo "Next step: regenerate orval types"
echo ""
echo "    npm run gen:api"
