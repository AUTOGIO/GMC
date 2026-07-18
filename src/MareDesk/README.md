# Mare Desk

Native macOS SwiftUI app for Giovannini Mare Capital mission control.

## Build

```bash
xcodebuild -project MareDesk.xcodeproj -scheme MareDesk -destination 'platform=macOS' build
```

## Run with GMC data

```bash
./Launch_MareDesk.command
```

Imports from `../../data/gmc_source` in the GMC repo (no sandbox rsync when repo bundle is available).

## Desks

| Shortcut | Desk |
|----------|------|
| ⌘1 | Overview |
| ⌘2 | Portfolio |
| ⌘3 | Macro |
| ⌘4 | Real Estate |
| ⌘5 | Capture History |

## Desktop shortcut

```bash
./scripts/create_desktop_shortcut.sh
```

Creates `~/Desktop/Mare Desk.app` pointing to `Launch_MareDesk.command`.
