# GMC TUI Django

Fresh standalone Django dashboard project with a browser-based terminal aesthetic inspired by btop/glances/lazydocker.

## Safety Note

This project is fully separate and does **not** modify anything inside:

`/Users/giovannini_nuovo/Documents/GitHub/AUTOGIO/GMC`

The new project path is:

`/Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO`

## Stack

- Django 4.2+
- SQLite
- Django templates + template inheritance
- HTMX for partial refreshes
- Chart.js for terminal-style charts
- python-decouple for environment configuration

## Visual Direction

- Dark mission-control shell
- Monospace-first typography (JetBrains Mono)
- Colorful but controlled palette (cyan/green/amber/magenta/blue/red)
- Dense boxed panels, compact tables, sticky top and bottom status bars
- Keyboard-style labels: `[F1]` `[F2]` `[F3]` `[F4]`

## Project Tree

```text
GMC_TUI_DJANGO/
├── .env.example
├── Makefile
├── README.md
├── data/
│   └── sample_portfolio.json
├── manage.py
├── requirements.txt
├── gmc_tui/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── core/
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── context_processors.py
    ├── models.py
    ├── services.py
    ├── urls.py
    ├── views.py
    ├── migrations/
    │   └── __init__.py
    ├── management/
    │   ├── __init__.py
    │   └── commands/
    │       ├── __init__.py
    │       └── seed_sample_data.py
    ├── static/
    │   └── core/
    │       ├── css/
    │       │   └── tui.css
    │       └── js/
    │           └── dashboard.js
    └── templates/
        └── core/
            ├── base.html
            ├── dashboard.html
            ├── macro.html
            ├── portfolio.html
            ├── real_estate.html
            └── partials/
                ├── allocation_table.html
                ├── kpi_grid.html
                ├── notes_feed.html
                ├── positions_table.html
                └── status_bar.html
```

## Setup

### 1. Create and activate virtual environment

```bash
cd /Users/giovannini_nuovo/Documents/GitHub/GMC_TUI_DJANGO
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Default local runtime is pinned to `127.0.0.1:8765` via `APP_HOST` and `APP_PORT`. Edit `.env` only if you need a different bind address or port.

### 4. Migrate fresh database

```bash
python manage.py makemigrations core
python manage.py migrate
```

### 5. Import GMC source data

```bash
python manage.py import_gmc_data
```

### 6. Run server

```bash
python manage.py runserver
```

Open: `http://127.0.0.1:8765/`

## Makefile shortcuts

```bash
make install
make migrate
make import_gmc
make run
```

## Pages

- `/` main dashboard
- `/portfolio/` portfolio matrix
- `/macro/` macro signal center
- `/real-estate/` real-estate exposure panel
- `/admin/` Django admin

## Django Features Used Properly

- Template inheritance (`base.html`)
- Includes for reusable panes (`partials/*`)
- Context processor for app metadata and footer status
- Management command (`seed_sample_data`) for demo data
- Clean model admin registration with `list_display`, `search_fields`, `list_filter`
- URL namespacing with `core` app namespace
- Static files in app static directory
- Environment variables via `python-decouple`

## Interactivity

- HTMX partial refresh every 60 seconds for:
  - KPI strip
  - notes feed
  - status footer
- Server-side filters for portfolio page:
  - status
  - category
  - search (`q`)
  - sortable columns via GET parameter

## Imported GMC Source Data

The project now vendors the source GMC JSON files under:

`data/gmc_source/`

The importer command reads:

- `data/gmc_source/portfolio/gmc_portfolio_state.json`
- `data/gmc_source/portfolio/current_portfolio_snapshot.json`
- `data/gmc_source/portfolio/optimized_allocation_gavetas.json`
- `data/gmc_source/portfolio/detailed_equities_visa.json`
- `data/gmc_source/portfolio/detailed_crypto_cfm.json`
- `data/gmc_source/real_estate/imoveis_state.json`
- `data/gmc_source/real_estate/property_meta.json`

`data/sample_portfolio.json` is still available as a standalone demo dataset, but the main replication path is now `python manage.py import_gmc_data`.
