# GMC System Architecture

## Overview

The GMC ecosystem is a multi-layer family office management system composed of four independent but interconnected layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  GMC_Launcher.html  ←→  React/Vite App  ←→  Static Pages   │
├─────────────────────────────────────────────────────────────┤
│                       DATA LAYER                            │
│       CSV files (numbers_sheets/) + Excel Dashboard         │
├─────────────────────────────────────────────────────────────┤
│                   EXTERNAL APIS                             │
│         BCB PTAX (BRL/USD)  ·  Future: market data         │
├─────────────────────────────────────────────────────────────┤
│                  DEPLOYMENT LAYER                           │
│        GitHub Pages (AUTOGIO/GMC) via GitHub Actions        │
└─────────────────────────────────────────────────────────────┘
```

---

## Modules

### 1. Mission Control Launcher — `GMC_Launcher.html`
- **Type**: Static HTML, no build step
- **Purpose**: Central hub linking all GMC tools
- **Contains**: Primary Dashboards, Spreadsheets, Data Files grid, Quick Actions
- **Live date badge**: auto-updates via JS
- **Dev server check**: pings `localhost:5173` to verify Vite is running
- **Key actions**: `launchAll()`, `launchDashboards()`, `checkDevServer()`

### 2. GMC Portfolio Dashboard — React/Vite App
- **Type**: React + Vite SPA
- **Local dev**: `npm run dev` → `localhost:5173`
- **Build output**: `dist/` → deployed to GitHub Pages
- **Entry point**: `dist/index.html` (also linked from Launcher)
- **Deployment base path**: `/GMC/` (Vite config must set `base: '/GMC/'`)

**Dashboard sections:**
| Section | Description |
|---|---|
| KPIs | Total portfolio value, BRL purchasing power, USD exposure % |
| Allocation | Pie/bar by bucket and gaveta |
| Gavetas | Drawer-by-drawer breakdown with target bands |
| Convex USD Snapshot | USD-denominated assets summary |
| Instruments | Master list of all holdings |
| Macro Context | Regime assessment, fragility indicators |
| Reports | Monthly/periodic snapshots |

**Live data**: BCB PTAX fetched on load. Fallback to last known rate if API unavailable.

### 3. Real Estate Monitor — `campinas_real_estate_monitor.html`
- **Type**: Static HTML, self-contained
- **Language**: pt-BR
- **Market**: Campinas/SP, Brazil
- **Data**: Hardcoded JS objects (no CSV dependency)
- **Key metrics**: Preço/m² by CEP, Market Pressure Index (MPI 0–100)
- **Sources**: ZAP Imóveis, VivaReal, FIPE ZAP+
- **Update**: Manual — edit `dadosMercado` and `dadosCEP` arrays

### 4. Excel Dashboard — `GMC_Portfolio_Dashboard.xlsx`
- **Sheets**: 9 total
  1. Dashboard (summary KPIs)
  2. Asset Allocation
  3. Gavetas (bucket tracking)
  4. Instruments (master inventory)
  5. Equities VISA (equity exposure tracker)
  6. Crypto CFM (Crypto Fragility Model tracker)
  7. Regime & Risk (macro regime log)
  8. Macro Context (qualitative notes)
  9. Real Estate BR (property inventory with Monitor link)
- **Currency**: BRL primary, USD flagged
- **Linked to**: Real Estate Monitor and CSV exports

---

## CSV Data Layer — `numbers_sheets/`

| File | Contents |
|---|---|
| `gmc_dashboard_summary.csv` | Top-level KPIs: total value, USD %, allocation % by bucket |
| `gmc_allocation.csv` | Current allocation % per asset class and bucket |
| `gmc_convex_gavetas_alignment.csv` | Gaveta-by-gaveta alignment vs target bands |
| `gmc_inventory_detailed.csv` | All instruments with quantity, price, value, bucket, gaveta |
| `gmc_real_estate.csv` | Real estate portfolio: address, value, type, income |
| `gmc_real_estate_inventory.csv` | Property-level detail |
| `gmc_real_estate_stats.csv` | Aggregated real estate stats |
| `gmc_cash_position.csv` | Cash and near-cash by currency and account |
| `gmc_banking.csv` | Bank accounts and custodians |
| `gmc_macro_recommendations.csv` | Regime-based allocation recommendations |
| `gmc_pending_assets.csv` | Assets in process / not yet settled |

**Root-level CSV files (repo root):**
- `gmc_convex_asset_summary.csv` — full portfolio snapshot aligned to Convex buckets
- `gmc_convex_instruments.csv` — instrument master list with Convex function tag

---

## Deployment Pipeline

```
Local edit → git push to main → GitHub Actions workflow → dist/ deployed to GitHub Pages
```

**Workflow file**: `.github/workflows/deploy-pages.yml`  
**Build command**: `npm run build` (Vite)  
**Base path**: `/GMC/` (required for GitHub Pages)  
**Live URL**: https://autogio.github.io/GMC/

**Manual deploy:**
- GitHub → Actions tab → "Deploy to GitHub Pages" → Run workflow

**Static files** (Launcher, Monitor): pushed directly, no build step.

---

## Environment & Toolchain

| Tool | Version/Detail |
|---|---|
| Runtime | Node.js (LTS) |
| Bundler | Vite |
| UI Framework | React |
| Styling | CSS custom properties (design tokens) |
| Fonts | DM Sans (body), Cormorant Garamond (display) via Google Fonts |
| Deployment | GitHub Pages + GitHub Actions |
| Local machine | macOS (M3 iMac + MacBook Air) |
| Dev path | `/Users/eduardogiovannini/dev/products/GMC/` |

---

## Data Flow Diagram

```
BCB PTAX API ──────────────────────────────────────────┐
                                                        ▼
numbers_sheets/*.csv ──► React App (Vite) ──► Portfolio Dashboard
                                ▲
gmc_convex_*.csv ───────────────┘

Manual data entry ──► Excel Dashboard ──► CSV export ──► numbers_sheets/
                              │
                              └──► Real Estate BR sheet ──► Monitor (manual sync)

GitHub push ──► Actions ──► dist/ ──► GitHub Pages ──► Public URL
```
