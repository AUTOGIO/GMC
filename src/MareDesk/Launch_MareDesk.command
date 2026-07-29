#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Repo root is two levels above src/MareDesk
GMC_ROOT="${GMC_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
SEED_SCRIPT="$SCRIPT_DIR/scripts/seed_capture_bundle.sh"
REPO_BUNDLE="$GMC_ROOT/data/gmc_source"
CONTAINER_BUNDLE="$HOME/Library/Containers/com.giovanninimare.MareDesk/Data/Library/Application Support/gmc_capture"
find_debug_app() {
  # Use BSD stat — GNU coreutils `stat` in PATH breaks `-f '%m %N'`.
  local bsd_stat="/usr/bin/stat"
  find "$HOME/Library/Developer/Xcode/DerivedData" -path '*/Build/Products/Debug/MareDesk.app' 2>/dev/null \
    | while IFS= read -r candidate; do
        "$bsd_stat" -f '%m %N' "$candidate"
      done \
    | sort -rn \
    | head -1 \
    | cut -d' ' -f2-
}

APP_PATH="$(find_debug_app)"

if [[ ! -x "$SEED_SCRIPT" ]]; then
  chmod +x "$SEED_SCRIPT"
fi

# Seed repo data into the sandbox container so the app can read it without extra entitlements.
if [[ -f "$REPO_BUNDLE/portfolio/gmc_portfolio_state.json" ]]; then
  SOURCE_DIR="$REPO_BUNDLE" DEST_DIR="$CONTAINER_BUNDLE" "$SEED_SCRIPT"
elif [[ ! -f "$CONTAINER_BUNDLE/portfolio/gmc_portfolio_state.json" ]]; then
  echo "No GMC capture bundle found at $REPO_BUNDLE" >&2
  exit 1
fi
BUNDLE_DIR="$CONTAINER_BUNDLE"

if [[ -z "$APP_PATH" || ! -d "$APP_PATH" ]]; then
  echo "Building Mare Desk..."
  xcodebuild -project "$SCRIPT_DIR/MareDesk.xcodeproj" -scheme MareDesk -destination 'platform=macOS' -configuration Debug build >/dev/null
  APP_PATH="$(find_debug_app)"
fi

export MARE_DESK_CAPTURE_BUNDLE="$BUNDLE_DIR"
export MARE_DESK_FORCE_IMPORT="${MARE_DESK_FORCE_IMPORT:-0}"
export GMC_WEBAPP_ROOT="$GMC_ROOT"

echo "Importing GMC data from:"
echo "  $BUNDLE_DIR"

defaults write com.giovanninimare.MareDesk MareDesk.preferredCaptureBundlePath -string "$BUNDLE_DIR" 2>/dev/null || true
CONTAINER_PREFS="$HOME/Library/Containers/com.giovanninimare.MareDesk/Data/Library/Preferences/com.giovanninimare.MareDesk.plist"
if [[ -f "$CONTAINER_PREFS" ]]; then
  defaults write "$CONTAINER_PREFS" MareDesk.preferredCaptureBundlePath -string "$BUNDLE_DIR" 2>/dev/null || true
fi

osascript -e 'tell application "Mare Desk" to quit' 2>/dev/null || true
sleep 1

# `open` does not pass env vars; launch the binary directly for forced import.
env MARE_DESK_CAPTURE_BUNDLE="$BUNDLE_DIR" \
    MARE_DESK_FORCE_IMPORT="$MARE_DESK_FORCE_IMPORT" \
    GMC_WEBAPP_ROOT="$GMC_ROOT" \
    "$APP_PATH/Contents/MacOS/MareDesk" &

echo "Mare Desk launched."
