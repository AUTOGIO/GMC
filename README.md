# Giovannini Mare Capital (GMC)

Native macOS operator surface for Giovannini Mare Capital portfolio, macro, and real-estate operations.

## Operator UI — Mare Desk (native Apple app)

**Mare Desk is the only operator interface.** It is a SwiftUI macOS app — not Django, not React, not a web wrapper.

### Quick start

1. Open `MareDesk/MareDesk.xcodeproj` in Xcode
2. Build and run (⌘R) — targets macOS 15+, Apple Silicon
3. Or double-click `~/Desktop/Mare Desk.app` (Desktop launcher)

### Data import

Mare Desk reads GMC JSON bundles from:

```
data/gmc_source/
├── portfolio/     # gmc_portfolio_state.json, snapshots, gavetas
└── real_estate/   # imoveis_state.json, property_meta.json
```

Launch script (seeds + imports + runs):

```bash
./MareDesk/Launch_MareDesk.command
```

### IBKR live feed (optional)

Start IBKR Client Portal Gateway on `localhost:5001`. Mare Desk detects authentication and switches operator mode to `IBKR-LIVE`.

## Data layer (kept in repo)

| Path | Purpose |
|------|---------|
| `data/portfolio/` | Canonical portfolio JSON |
| `data/gmc_source/` | Import bundle for Mare Desk |
| `numbers_sheets/` | CSV exports |
| `scripts/` | Python + Excel build scripts |
| `Giovannini_Mare_Capital/` | Obsidian vault |
| `gmc-system-engineering/` | Architecture docs |

## Retired (removed)

- Django TUI (`.GMC_TUI_DJANGO/`)
- React SPA (`src/`, `dist/`, npm toolchain)
- WKWebView wrapper (`AppWrapper/`)
- HTML launchers (`LAUNCHERS_GMC/`)
- GitHub Pages deploy workflow
