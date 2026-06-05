#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ICON_SRC="${ICON_SRC:-$SCRIPT_DIR/Assets/MareDeskIcon.png}"
DESKTOP_APP="${DESKTOP_APP:-$HOME/Desktop/Mare Desk.app}"
LAUNCH_SCRIPT="$SCRIPT_DIR/Launch_MareDesk.command"
ICONSET="$(mktemp -d)/MareDesk.iconset"
ICNS="$(mktemp -d)/AppIcon.icns"

if [[ ! -f "$ICON_SRC" ]]; then
  ICON_SRC="/Users/giovannini_nuovo/.cursor/projects/Volumes-MICRO-01-GMC-TUI-DJANGO/assets/MareDeskIcon.png"
fi

if [[ ! -f "$ICON_SRC" ]]; then
  echo "Icon not found. Set ICON_SRC to a PNG file." >&2
  exit 1
fi

mkdir -p "$ICONSET"
for size in 16 32 128 256 512; do
  sips -z "$size" "$size" "$ICON_SRC" --out "$ICONSET/icon_${size}x${size}.png" >/dev/null
  double=$((size * 2))
  sips -z "$double" "$double" "$ICON_SRC" --out "$ICONSET/icon_${size}x${size}@2x.png" >/dev/null
done
iconutil -c icns "$ICONSET" -o "$ICNS"

rm -rf "$DESKTOP_APP"
mkdir -p "$DESKTOP_APP/Contents/MacOS" "$DESKTOP_APP/Contents/Resources"
cp "$ICNS" "$DESKTOP_APP/Contents/Resources/AppIcon.icns"

cat > "$DESKTOP_APP/Contents/MacOS/launcher" <<EOF
#!/bin/bash
exec "$LAUNCH_SCRIPT"
EOF
chmod +x "$DESKTOP_APP/Contents/MacOS/launcher"

cat > "$DESKTOP_APP/Contents/Info.plist" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleExecutable</key>
	<string>launcher</string>
	<key>CFBundleIconFile</key>
	<string>AppIcon</string>
	<key>CFBundleIdentifier</key>
	<string>com.giovanninimare.MareDesk.Launcher</string>
	<key>CFBundleName</key>
	<string>Mare Desk</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSMinimumSystemVersion</key>
	<string>15.0</string>
</dict>
</plist>
EOF

touch "$DESKTOP_APP"
xattr -cr "$DESKTOP_APP" 2>/dev/null || true

echo "Created desktop shortcut: $DESKTOP_APP"
