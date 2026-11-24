#!/bin/sh
# Render every spec (or the ones named) one after another; Blender runs one at a time to keep memory in check.
#   illustrations/render.sh                       all specs at 2048px, 128 samples
#   illustrations/render.sh academy-icon pixels   just these
#   SIZE=1024 SAMPLES=48 illustrations/render.sh  quick previews
cd "$(dirname "$0")"
BLENDER=${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}
SIZE=${SIZE:-2048}
SAMPLES=${SAMPLES:-128}
if [ $# -eq 0 ]; then set -- $(ls specs | sed 's/\.json$//'); fi
for name in "$@"; do
  "$BLENDER" -b --factory-startup --python render.py -- "specs/$name.json" --size "$SIZE" --samples "$SAMPLES" 2>&1 | grep -E "Rendered|Error|SystemExit" || echo "Failed: $name"
done
