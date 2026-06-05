---
name: gmc-system-engineering
description: >
  Giovannini Mare Capital (GMC) system engineering skill. Use when the user asks to build,
  extend, modify, or maintain any part of the GMC family office ecosystem — including the
  GMC Portfolio Dashboard (React/Vite app), Mission Control Launcher, Real Estate Monitor,
  Excel spreadsheets, CSV data pipeline, or GitHub Pages deployment. Trigger on mentions of
  GMC, Giovannini Mare Capital, portfolio dashboard, gavetas, Mission Control, real estate
  monitor, allocation, gmc-system, autogio, GMC_Launcher, campinas monitor, convex dashboard.
metadata:
  author: Eduardo Giovannini
  version: '1.0'
  entity: Giovannini Mare Capital LLC
---

# GMC System Engineering

## When to Use This Skill

Load this skill whenever the user asks to:

- Build or extend the **GMC Portfolio Dashboard** (React/Vite app)
- Update the **GMC Mission Control Launcher** (GMC_Launcher.html)
- Modify the **Real Estate Monitor** (campinas_real_estate_monitor.html)
- Add or update **data modules** (CSV files in numbers_sheets/)
- Extend the **Excel Dashboard** (GMC_Portfolio_Dashboard.xlsx)
- Deploy updates to **GitHub Pages** (https://autogio.github.io/GMC/)
- Design new **gavetas**, buckets, or allocation modules
- Build new dashboards, monitors, or tools within the GMC ecosystem

Also load `references/architecture.md` for full system map and file paths.  
Also load `references/investment-philosophy.md` for IPS, allocation logic, and Convex framework.  
Also load `references/design-system.md` for color tokens, typography, and UI conventions.

---

## GMC Identity

**Giovannini Mare Capital LLC** is a single-family office managing only its own capital using institutional-grade risk discipline and convex allocation principles. No external clients. No marketing. No fiduciary obligations.

**Principal**: Eduardo Giovannini  
**GitHub repo**: `AUTOGIO/GMC` → https://github.com/AUTOGIO/GMC  
**Live dashboard**: https://autogio.github.io/GMC/  
**Local dev**: Vite app at `localhost:5173`  
**Stack**: React + Vite (dashboard), plain HTML (launcher, monitors), Excel + CSV (data layer)

---

## Workflow When Building or Extending GMC

### Step 1 — Understand the request in context

Before writing any code, identify:
1. Which module is affected? (Dashboard React app / Launcher / Monitor / Excel / CSV)
2. Does it touch the **investment philosophy** (buckets, gavetas, allocation bands)? If yes, load `references/investment-philosophy.md` and ensure all logic is philosophy-consistent.
3. Does it produce UI? If yes, load `references/design-system.md` and follow the GMC visual identity.

### Step 2 — Architecture first, code second

For any non-trivial addition:
- Describe the data flow: Where does data come from? (CSV, live API like BCB PTAX, hardcoded)
- Describe the component hierarchy or page structure before coding
- Confirm module fits into the existing architecture

Read `references/architecture.md` for the full system map.

### Step 3 — Implement with GMC standards

**React/Vite app rules:**
- Component files in `src/components/`
- Page-level views in `src/pages/` or `src/views/`
- Shared utilities in `src/lib/` or `src/utils/`
- CSV data consumed via `fetch()` from `public/numbers_sheets/` or hardcoded in `src/data/`
- Live APIs (BCB PTAX, etc.) fetched client-side with proper error handling and fallback display
- No external UI libraries unless already in use — build from primitives using the GMC design tokens

**HTML static pages rules (Launcher, Monitor):**
- Self-contained single HTML files (inline CSS + JS, no build step)
- Follow the same GMC color tokens defined in `references/design-system.md`
- Mobile-responsive using CSS Grid / Flexbox
- No external dependencies other than Google Fonts (DM Sans, Cormorant Garamond)

**Data/CSV rules:**
- CSVs live in `numbers_sheets/` inside the repo
- Filenames use `gmc_` prefix + descriptive name: `gmc_allocation.csv`, `gmc_real_estate.csv`
- All monetary values in BRL unless explicitly tagged as USD
- Keep a `gmc_convex_asset_summary.csv` and `gmc_convex_instruments.csv` at repo root

### Step 4 — Philosophy alignment check

Every new module that touches allocation, instruments, gavetas, or risk must be validated against:
- Does it respect the three-bucket structure? (Survival & Optionality / Convex Growth / Tactical Brazil)
- Does it define risk as fragility (permanent capital loss), not volatility?
- Does it avoid prohibited practices? (no leverage, no benchmarking, no yield-chasing without asymmetry)
- Is rebalancing logic event-driven, not calendar-driven?

See `references/investment-philosophy.md` for full IPS rules.

### Step 5 — Deployment

After any change to the React/Vite app:
```bash
# Local build
npm run build   # outputs to dist/

# Deploy via git push to main (GitHub Actions auto-deploys to GitHub Pages)
git add .
git commit -m "feat: <module> — <brief description>"
git push origin main
```

For static HTML files (Launcher, Monitor), just push — no build step required.

GitHub Pages URL: **https://autogio.github.io/GMC/**

---

## Adding a New Gaveta (Bucket)

A **gaveta** (drawer) is a functional allocation bucket. Adding one requires changes across:
1. **React Dashboard** — new tab/card in the allocation view, data binding
2. **CSV layer** — add rows to `gmc_convex_gavetas_alignment.csv` and `gmc_inventory_detailed.csv`
3. **Excel Dashboard** — add to the Gavetas sheet with target range and current %
4. **IPS consistency** — the new gaveta must map to one of the three macro buckets

Standard gaveta properties:
```
name:           (string) display name
bucket:         (enum) SURVIVAL | CONVEX | TACTICAL
target_min_%:   (number) lower allocation band
target_max_%:   (number) upper allocation band
current_%:      (number) actual current weight
status:         (enum) ON_TARGET | OVERWEIGHT | UNDERWEIGHT
instruments:    (list) specific instruments held in this gaveta
```

---

## BCB PTAX API (Live FX)

The React dashboard fetches live BRL/USD from Banco Central do Brasil:

```js
// BCB PTAX — last available rate
const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${mmddyyyy}'&$top=1&$format=json`

// Always display a fallback rate if API is unavailable
// Format: BRL value displayed with 4 decimal places
```

---

## Key File Locations (Local Machine)

All paths relative to `/Users/eduardogiovannini/dev/products/GMC/`:

```
GMC/
├── GMC_Launcher.html             ← Mission Control entry point
├── campinas_real_estate_monitor.html
├── GMC_Portfolio_Dashboard.xlsx
├── numbers_sheets/               ← CSV data layer
│   ├── gmc_dashboard_summary.csv
│   ├── gmc_allocation.csv
│   ├── gmc_convex_gavetas_alignment.csv
│   ├── gmc_inventory_detailed.csv
│   ├── gmc_real_estate.csv
│   ├── gmc_real_estate_inventory.csv
│   ├── gmc_real_estate_stats.csv
│   ├── gmc_cash_position.csv
│   ├── gmc_banking.csv
│   ├── gmc_macro_recommendations.csv
│   └── gmc_pending_assets.csv
├── gmc_convex_asset_summary.csv  ← root-level summary
├── gmc_convex_instruments.csv    ← instruments master list
├── src/                          ← Vite/React app
│   ├── components/
│   ├── pages/
│   ├── data/
│   └── lib/
├── public/
├── dist/                         ← built output (GitHub Pages)
└── .github/workflows/deploy-pages.yml
```

---

## Common Tasks

### Add a new card to Mission Control Launcher
1. Copy an existing `.card` block in `GMC_Launcher.html`
2. Assign the right accent class (`card-lime`, `card-blue`, `card-purple`, etc.)
3. Update icon, title, description, `href`, and `card-action` label
4. For a new React sub-page, link to the correct route or built URL

### Add a new React dashboard tab/view
1. Create component in `src/components/` or `src/pages/`
2. Add route in the router (or conditional render in App.jsx)
3. Add navigation item following existing nav pattern
4. Wire data from CSV or inline `src/data/` constant
5. Follow design tokens — do not introduce new colors outside the palette

### Update Real Estate Monitor
- File: `campinas_real_estate_monitor.html`
- Data is hardcoded in JS objects inside the HTML (no CSV dependency)
- Update `dadosMercado` and `dadosCEP` arrays with new price/sqm and MPI values
- Timestamp in the header should reflect update date

### Update allocation bands in IPS
- Edit `references/investment-philosophy.md` in the skill
- Update the Gavetas sheet in `GMC_Portfolio_Dashboard.xlsx`
- Update `gmc_convex_gavetas_alignment.csv`
- Reflect changes in the React dashboard's allocation view

---

## Output Quality Standards

- All monetary values: format with BRL symbol and 2 decimal places (`R$ 1.234,56`)
- USD values: format with USD symbol and 2 decimal places (`USD 1,234.56`)
- Percentages: 1 decimal place (`42.3%`)
- Dates: Brazilian format `DD/MM/YYYY` in UI; ISO `YYYY-MM-DD` in CSV headers
- All UI text in the correct language for the module (Dashboard: English; Monitor: pt-BR; Launcher: English)
- Never expose raw CSV paths or internal structure in rendered UI
