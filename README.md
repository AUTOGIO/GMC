# Giovannini Mare Capital (GMC)

Native macOS operator surface (Mare Desk) for portfolio, macro, and real-estate data.

**Security:** Never commit API keys, credentials, or tenant contact PII. Keep this repository **private**. Do not publish `data/` to public hosting.

## Run Mare Desk

1. Open `src/MareDesk/MareDesk.xcodeproj` in Xcode and run (⌘R), or
2. Double-click `src/MareDesk/Launch_MareDesk.command`

Data import bundle: `data/gmc_source/` (portfolio + real_estate JSON).

Launch seeds repo data into the app sandbox container automatically. Force re-import only when needed:

```bash
MARE_DESK_FORCE_IMPORT=1 ./src/MareDesk/Launch_MareDesk.command
```

**Data policy:** keep this repo private; do not publish portfolio or real-estate JSON/CSVs to public hosting.

## Sync processed CSVs from JSON

Canonical helper (from repo root):

```bash
python3 scripts/sync_portfolio_from_json.py
```

Legacy markdown sync (`sync_engine.py`) is archived under `archive/scripts-legacy/`.

## Validate capture bundle layout

```bash
python3 tests/validate_capture_bundle.py
```

## Where things live

1. Open `src/MareDesk/MareDesk.xcodeproj` in Xcode and run (⌘R), or
2. Double-click `src/MareDesk/Launch_MareDesk.command`

Data import bundle: `data/gmc_source/` (portfolio + real_estate JSON).

Launch seeds repo data into the app sandbox container automatically. Force re-import only when needed:

```bash
MARE_DESK_FORCE_IMPORT=1 ./src/MareDesk/Launch_MareDesk.command
```

**Data policy:** keep this repo private; do not publish portfolio or real-estate JSON/CSVs to public hosting.

## Where things live

| Path | Contents |
|------|----------|
| `src/MareDesk/` | SwiftUI macOS app |
| `data/` | Portfolio JSON, Excel, CSVs (`processed/`), reports |
| `scripts/` | Sync / Numbers / Excel helpers |
| `assets/` | Logos and brand images |
| `docs/` | Guides, philosophy, prompts |
| `archive/` | Retired web docs, legacy scripts, Obsidian meta |
