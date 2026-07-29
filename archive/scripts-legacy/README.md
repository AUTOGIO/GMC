# Legacy scripts

**Status:** Archived — not maintained for the Mare Desk workflow.

| Script | Notes |
|--------|--------|
| `create_dashboard.scpt` | Hard-coded paths; replaced by Mare Desk |
| `sync_trigger.scpt` | Hard-coded paths |
| `populate_dashboard.scpt` | Embedded property inventory; use `data/gmc_source` instead |
| `sync_engine.py` | Required markdown sources removed; use `scripts/sync_portfolio_from_json.py` |

Canonical sync: `python3 scripts/sync_portfolio_from_json.py`
