#!/bin/bash
set -euo pipefail

GMC_ROOT="${GMC_ROOT:-$HOME/Library/Mobile Documents/com~apple~CloudDocs/Projects (Essential)/GitHub/AUTOGIO/GMC}"
SOURCE_DIR="${SOURCE_DIR:-$GMC_ROOT/data/gmc_source}"
LEGACY_DIR="$GMC_ROOT/.GMC_TUI_DJANGO/data/gmc_source"
DEST_DIR="${DEST_DIR:-$HOME/Library/Containers/com.giovanninimare.MareDesk/Data/Library/Application Support/gmc_capture}"

if [[ ! -f "$SOURCE_DIR/portfolio/gmc_portfolio_state.json" && -f "$LEGACY_DIR/portfolio/gmc_portfolio_state.json" ]]; then
  SOURCE_DIR="$LEGACY_DIR"
fi

if [[ ! -f "$SOURCE_DIR/portfolio/gmc_portfolio_state.json" ]]; then
  echo "Missing GMC source bundle at: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
rsync -a --delete "$SOURCE_DIR/" "$DEST_DIR/"

echo "Seeded capture bundle:"
echo "  from: $SOURCE_DIR"
echo "  to:   $DEST_DIR"
