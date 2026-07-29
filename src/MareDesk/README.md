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

`Launch_MareDesk.command` seeds `data/gmc_source` from the repo into the app sandbox container (`~/Library/Containers/com.giovanninimare.MareDesk/.../gmc_capture`) and points Mare Desk there. This keeps import working under App Sandbox without extra entitlements.

Force a re-import on launch only when needed:

```bash
MARE_DESK_FORCE_IMPORT=1 ./Launch_MareDesk.command
```

## Environment variables

| Variable | Role |
|----------|------|
| `MARE_DESK_CAPTURE_BUNDLE` | Override capture bundle directory |
| `MARE_DESK_FORCE_IMPORT` | `1` forces re-import even when holdings exist (default `0`) |
| `GMC_WEBAPP_ROOT` / `GMC_ROOT` | Repo root for launch and seed scripts |

## Data policy

- Keep the GMC repo **private**.
- Do not publish portfolio or real-estate JSON/CSVs to public hosting.
- Tenant contact fields in source JSON are sensitive — treat `data/gmc_source` as confidential.

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

## Manual seed (optional)

```bash
./scripts/seed_capture_bundle.sh
```

Copies `data/gmc_source` into the sandbox container without launching the app.
