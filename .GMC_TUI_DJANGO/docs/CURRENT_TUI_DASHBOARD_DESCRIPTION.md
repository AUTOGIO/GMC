# Current TUI Dashboard Description

## Purpose

This document describes the current state of the `GMC_TUI_DJANGO` interface as implemented in the repository today.

It is a browser-rendered Django dashboard with a terminal-inspired control-plane layout for:

- portfolio monitoring
- macro monitoring
- real-estate monitoring
- lightweight operator navigation

This is not a React SPA and not the original `AUTOGIO/GMC` app. It is a standalone Django application that now uses imported GMC source data stored locally in this repository.

## Runtime Identity

- Application title: `GMC TUI`
- Build string: `v0.1`
- Operator mode label: `LIVE-SIM`
- Default local bind: `127.0.0.1:8765`
- Main entrypoint: [manage.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/manage.py)

The current implementation makes `python manage.py runserver` default to `127.0.0.1:8765` if no explicit host/port is passed. That default is configured through:

- [.env](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/.env)
- [.env.example](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/.env.example)

## Route Structure

Primary routes:

- `/` dashboard overview
- `/portfolio/` portfolio analysis page
- `/macro/` macro signal page
- `/real-estate/` real-estate page
- `/admin/` Django admin

HTMX partial routes:

- `/htmx/kpis/`
- `/htmx/notes/`
- `/htmx/status/`

These are defined in:

- [core/urls.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/urls.py)
- [gmc_tui/urls.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/gmc_tui/urls.py)

## Global Layout

The whole UI is composed from the shared base template:

- [core/templates/core/base.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/base.html)

The layout has four major regions:

1. Top status bar
2. Left navigation pane
3. Main content area
4. Right info pane
5. Bottom sticky status line

### 1. Top Status Bar

The top bar is a compact terminal header and currently contains:

- brand text: `[GMC TUI :: v0.1]`
- subtitle: `Giovannini Mare Capital`
- navigation shortcuts:
  - `[F1] Dashboard`
  - `[F2] Portfolio`
  - `[F3] Macro`
  - `[F4] Real Estate`
- mode indicator: `MODE: LIVE-SIM`

Important current state:

- all image logos were removed from the top bar
- the top bar grid was tightened so the shortcut tabs stay inside the visible dashboard frame
- the header is sticky and remains visible during scroll

### 2. Left Pane

The left pane acts as persistent navigation and operator hint space.

It currently includes:

- Overview Control Plane
- Portfolio Matrix
- Macro Signals
- Property Exposure
- Django Admin

It also includes a small "Operator Hints" block with static guidance:

- `/` quick browser find
- `tab` cycle controls
- `cmd+r` hard refresh

### 3. Main Pane

The main pane changes by route. Every main page uses boxed panels with terminal-style titles in bracket syntax.

Examples:

- `[ OVERVIEW / KPI STRIP ]`
- `[ CATEGORY SUMMARY ]`
- `[ ALLOCATION DRIFT ]`
- `[ MACRO REGIME TABLE ]`
- `[ PROPERTY ASSETS ]`

### 4. Right Pane

The right pane is an informational sidebar. It currently contains static copy under the default `INFO` block:

- Mission Control description
- Theme description

On smaller breakpoints this pane is hidden.

### 5. Bottom Status Line

The bottom bar is sticky and updated by HTMX.

Its backing context is produced by:

- [core/context_processors.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/context_processors.py)

It exposes:

- mode
- last update timestamp
- active regime
- data source label
- keyboard hint summary

Important current implementation detail:

- `footer_status.data_source` still says `seed_sample_data`
- this is stale text relative to the actual imported GMC dataset now in use
- this is a content inconsistency, not a runtime failure

## Visual System

Main stylesheet:

- [core/static/core/css/tui.css](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/static/core/css/tui.css)

### Overall Aesthetic

The UI is a dark "mission control" TUI-inspired shell with:

- terminal panel borders
- compact density
- monospace-first typography
- sticky top and bottom bars
- boxed sections and data tables
- Chart.js charts styled to look like dashboard widgets

### Typography

Current font stack:

- `JetBrains Mono` for most UI chrome and tabular content
- `IBM Plex Sans` for supporting content blocks and notes

Current base size:

- global `html { font-size: 14px; }`

This means most `rem`-based sizing now scales from a 14px root size.

### Current Brand-Palette Usage

The dashboard overall still uses the broader TUI palette for general UI, but the portfolio sections below were explicitly restyled to the GMC palette:

- `Category Summary`
- `Allocation Drift`

GMC palette used there:

- Grigio Acheso: `#4A4E52`
- Verde Scandal: `#D0FF00`
- Carbon Black: `#0A0A0A`
- Metallic Silver: `#C0C0C0`

Those sections now use:

- dark carbon/grey panel backgrounds
- neon green titles and highlights
- silver table headers
- green positive drift
- silver negative drift
- matte grey flat/neutral drift

## Page-by-Page Description

## Dashboard Page

Template:

- [core/templates/core/dashboard.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/dashboard.html)

Backing service:

- `get_dashboard_data()` in [core/services.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/services.py)

### Components

#### KPI Strip

Auto-refreshed by HTMX.

Shows:

- NAV
- TARGET
- DRIFT
- ACTIVE
- WATCH

Current behavior:

- DRIFT is color-coded through conditional tone classes
- the KPI grid refreshes every 60 seconds

#### Allocation Summary

A category-level portfolio summary table showing:

- category code and name
- current amount
- target amount
- drift %
- weight %

The dashboard page uses the shared allocation-table partial.

#### Portfolio Composition

Chart type:

- doughnut

Driven by:

- `composition_chart`

Shows category composition by current capital.

#### Target vs Current

Chart type:

- grouped bar chart

Driven by:

- `target_chart`

Shows current and target values for the top positions.

#### Macro Regime Table

Tabular summary of macro signals including:

- signal name
- numeric signal value
- regime label
- notes

#### Recent Notes / Alerts

HTMX-refreshed note feed.

Shows recent `SystemNote` records.

#### System Health

Displays:

- positions count
- signals count
- properties count
- data age in minutes
- active regime

Also includes a strip of static market pills.

## Portfolio Page

Template:

- [core/templates/core/portfolio.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/portfolio.html)

Backing service:

- `get_portfolio_data()` in [core/services.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/services.py)

### Components

#### Portfolio Filters

Current filter controls:

- status
- category
- search
- sort

Current filter behavior:

- GET-based server-side filtering
- no client-side SPA state
- simple form submit

#### Category Summary

Uses the shared partial:

- [core/templates/core/partials/allocation_table.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/partials/allocation_table.html)

Current branded treatment:

- panel uses GMC palette styling
- table headers use metallic silver
- row hover uses a subtle neon-green tint
- drift values use GMC-specific positive/negative/flat classes

#### Allocation Drift

Chart type:

- bar chart

Client logic:

- [core/static/core/js/dashboard.js](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/static/core/js/dashboard.js)

Current branded color rules:

- positive drift: `#D0FF00`
- negative drift: `#C0C0C0`
- zero drift: `#4A4E52`
- border / tooltip grounding: `#0A0A0A`

#### Positions Matrix

Main portfolio table.

Shows position-level rows with:

- name
- ticker
- category
- bucket
- current
- target
- status
- notes

#### Liquidity / Preservation / Convexity Cards

Three metric cards beneath the table show:

- liquidity ratio
- preservation ratio
- convexity score

These cards still use the older TUI accent system rather than the GMC-specific palette applied to Category Summary and Allocation Drift.

## Macro Page

Template:

- [core/templates/core/macro.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/macro.html)

Backing service:

- `get_macro_data()` in [core/services.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/services.py)

### Components

#### Macro Cards

One card per macro signal.

Each card shows:

- signal name
- signal value
- regime
- notes

#### Signal Heat Table

Heat-style table with:

- signal
- regime
- value
- heat intensity

Intensity is derived from absolute signal value.

#### Trend Monitor

Chart type:

- line chart

This is synthetic trend rendering built from current signal values rather than a persisted historical time series.

#### Rule / Trigger Panel

Important current behavior:

- this panel now uses imported GMC macro scenario notes when available
- trigger strings come from `SystemNote` records whose titles begin with `Trigger:`
- otherwise it falls back to default generic rules

#### Operator Notes

Shows the remaining macro notes that are not used as trigger rows.

## Real-Estate Page

Template:

- [core/templates/core/real_estate.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/real_estate.html)

Backing service:

- `get_real_estate_data()` in [core/services.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/services.py)

### Components

#### Summary Strip

Shows:

- total market value
- total tax value
- total area
- tax gap %

#### Property Assets Table

Shows:

- property name
- type
- city
- market value
- tax value
- area
- status

#### Market vs Tax Chart

Chart type:

- bar chart

Shows market and tax values side by side by property.

#### Exposure by Type

Table of real-estate exposure split by asset type.

#### City / Units / Area / Valuation

Table grouped by city summarizing:

- number of units
- area
- market value
- tax value

## Data Model

Models are defined in:

- [core/models.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/models.py)

### AssetCategory

Fields:

- name
- code
- color
- sort_order

Purpose:

- classification of portfolio positions

### Position

Fields:

- name
- ticker
- category
- bucket_name
- current_value
- target_value
- status
- notes
- updated_at

Purpose:

- instrument-level portfolio rows

### MacroSignal

Fields:

- name
- signal_value
- regime
- status_color
- notes
- updated_at

Purpose:

- macro dashboard inputs

### PropertyAsset

Fields:

- name
- asset_type
- city
- market_value
- tax_value
- area_m2
- status
- updated_at

Purpose:

- real-estate inventory

### SystemNote

Panels:

- OVERVIEW
- PORTFOLIO
- MACRO
- REAL_ESTATE

Purpose:

- lightweight narrative notes shown throughout the dashboard

## Data Source and Import Path

Current data import command:

- `python manage.py import_gmc_data`

Implementation:

- [core/management/commands/import_gmc_data.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/management/commands/import_gmc_data.py)

Vendored source files:

- [data/gmc_source/portfolio/gmc_portfolio_state.json](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/data/gmc_source/portfolio/gmc_portfolio_state.json)
- [data/gmc_source/portfolio/current_portfolio_snapshot.json](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/data/gmc_source/portfolio/current_portfolio_snapshot.json)
- [data/gmc_source/portfolio/optimized_allocation_gavetas.json](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/data/gmc_source/portfolio/optimized_allocation_gavetas.json)
- [data/gmc_source/portfolio/detailed_equities_visa.json](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/data/gmc_source/portfolio/detailed_equities_visa.json)
- [data/gmc_source/portfolio/detailed_crypto_cfm.json](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/data/gmc_source/portfolio/detailed_crypto_cfm.json)
- [data/gmc_source/real_estate/imoveis_state.json](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/data/gmc_source/real_estate/imoveis_state.json)
- [data/gmc_source/real_estate/property_meta.json](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/data/gmc_source/real_estate/property_meta.json)

### Current Imported Dataset Shape

At the time of this description, the imported database contains:

- 5 asset categories
- 25 positions
- 8 macro signals
- 12 properties
- 20 notes

### Important Modeling Choice

The Django TUI currently represents the imported liquid target book as live portfolio positions. The structural current holdings from the source app are preserved in notes instead of being merged into the live `Position` table.

This means the dashboard intentionally separates:

- deployable / target liquid book
- structural / contextual holdings

## Client-Side Behavior

Main JS:

- [core/static/core/js/dashboard.js](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/static/core/js/dashboard.js)

Current client responsibilities:

- read JSON embedded with `json_script`
- create Chart.js instances
- destroy and recreate charts cleanly on repeated initialization
- style charts with a TUI or GMC-branded visual language depending on section

No heavy client-side application state exists.

## Current Known Constraints and Quirks

### 1. Footer Source Label Is Stale

`footer_status.data_source` still reports `seed_sample_data` even though the live DB is now loaded through `import_gmc_data`.

### 2. Active Regime Source Is Approximate in Shell Context

The shell context currently derives the active regime from the first macro signal ordered by name, not from a dedicated regime record lookup. This can differ from the richer `get_dashboard_data()` logic.

### 3. Mixed Palette State Across Pages

Only `Category Summary` and `Allocation Drift` have the stricter GMC palette treatment at this time. Other cards still use the previous TUI accent palette.

### 4. Logos Removed

All logo images were intentionally removed from the live layout. The interface is now text-only in the shell chrome.

## Files Most Central to the Current TUI

- [core/templates/core/base.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/base.html)
- [core/templates/core/dashboard.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/dashboard.html)
- [core/templates/core/portfolio.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/portfolio.html)
- [core/templates/core/macro.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/macro.html)
- [core/templates/core/real_estate.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/real_estate.html)
- [core/templates/core/partials/allocation_table.html](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/templates/core/partials/allocation_table.html)
- [core/static/core/css/tui.css](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/static/core/css/tui.css)
- [core/static/core/js/dashboard.js](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/static/core/js/dashboard.js)
- [core/services.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/services.py)
- [core/models.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/models.py)
- [core/management/commands/import_gmc_data.py](/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO/core/management/commands/import_gmc_data.py)

## Summary

The current TUI dashboard is a compact, server-rendered Django control plane with:

- a text-only terminal-style shell
- sticky top and bottom bars
- three operational domains: portfolio, macro, and real estate
- imported GMC source data in SQLite
- HTMX partial refresh for selected widgets
- Chart.js visualizations
- selective GMC palette branding already applied to the portfolio `Category Summary` and `Allocation Drift` sections

This file should be treated as a description of the current implemented state, not a future design target.
