#!/bin/bash
set -euo pipefail

GMC_ROOT="${GMC_ROOT:-$HOME/Library/Mobile Documents/com~apple~CloudDocs/Projects (Essential)/GitHub/AUTOGIO/GMC}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SEED_SCRIPT="$SCRIPT_DIR/scripts/seed_capture_bundle.sh"
REPO_BUNDLE="$GMC_ROOT/data/gmc_source"
CONTAINER_BUNDLE="$HOME/Library/Containers/com.giovanninimare.MareDesk/Data/Library/Application Support/gmc_capture"
APP_PATH="$(find "$HOME/Library/Developer/Xcode/DerivedData" -path '*/Build/Products/Debug/MareDesk.app' 2>/dev/null | head -1)"

if [[ ! -x "$SEED_SCRIPT" ]]; then
  chmod +x "$SEED_SCRIPT"
fi

if [[ -f "$REPO_BUNDLE/portfolio/gmc_portfolio_state.json" ]]; then
  BUNDLE_DIR="$REPO_BUNDLE"
else
  "$SEED_SCRIPT"
  BUNDLE_DIR="$CONTAINER_BUNDLE"
fi

if [[ -z "$APP_PATH" || ! -d "$APP_PATH" ]]; then
  echo "Building Mare Desk..."
  xcodebuild -project "$SCRIPT_DIR/MareDesk.xcodeproj" -scheme MareDesk -destination 'platform=macOS' -configuration Debug build >/dev/null
  APP_PATH="$(find "$HOME/Library/Developer/Xcode/DerivedData" -path '*/Build/Products/Debug/MareDesk.app' 2>/dev/null | head -1)"
fi

export MARE_DESK_CAPTURE_BUNDLE="$BUNDLE_DIR"
export MARE_DESK_FORCE_IMPORT="${MARE_DESK_FORCE_IMPORT:-1}"
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
