#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GMC_ROOT="${GMC_ROOT:-$(cd "$SCRIPT_DIR/../../.." && pwd)}"
SOURCE_DIR="${SOURCE_DIR:-$GMC_ROOT/data/gmc_source}"
DEST_DIR="${DEST_DIR:-$HOME/Library/Containers/com.giovanninimare.MareDesk/Data/Library/Application Support/gmc_capture}"

if [[ ! -f "$SOURCE_DIR/portfolio/gmc_portfolio_state.json" ]]; then
  echo "Missing GMC source bundle at: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
rsync -a --delete "$SOURCE_DIR/" "$DEST_DIR/"

echo "Seeded capture bundle:"
echo "  from: $SOURCE_DIR"
echo "  to:   $DEST_DIR"
