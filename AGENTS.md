# GMC — agent notes

Personal Giovannini Mare Capital workspace: Mare Desk (macOS) plus portfolio data and helpers. Prefer MOVE over copy; do not invent new top-level folders.

## Folder layout

| Path | Role |
|------|------|
| `src/` | Application code (`src/MareDesk` SwiftUI macOS app) |
| `scripts/` | Runnable helpers (`.py`, `.scpt`, `.js`, `.command` companions) |
| `config/` | Non-secret settings |
| `data/` | CSV, JSON, Excel, exports (`data/gmc_source` for Mare Desk import; `data/processed` for CSVs) |
| `assets/` | Images, icons, logos |
| `docs/` | Guides and design notes |
| `docs/prompts/` | AI prompt files |
| `tests/` | Tests only |
| `archive/` | Obsolete files kept for reference |
| Root | Only `README.md`, `AGENTS.md`, `.gitignore`, and toolchain files |

## Rules

- No filename versioning (`Foo_v1.0.md` → `docs/foo.md`; old copy → `archive/` if unsure).
- Merge duplicate folders into the English names above.
- Do not commit secrets (`.env`, credentials). Do not put machine inventory here.
- After moves, fix broken imports/paths.
- Do not delete unless clearly a duplicate; otherwise move to `archive/`.
