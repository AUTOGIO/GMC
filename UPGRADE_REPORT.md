# GMC Upgrade Report

**Date:** 2026-07-29  
**Branch:** `main` (after remediation merge)  
**Prior audit:** `REPOSITORY_AUDIT.md`

This report summarizes remediation work completed after the repository audit and the Mare Desk stabilization commit (`7dd7442`).

---

## Executive summary

GMC is now aligned on a **single production path**: Mare Desk imports `data/gmc_source` via a **sandbox-safe launch flow**, with legacy web docs and broken scripts archived. Critical security remediation removed a **committed API key** and **redacted tenant PII** in tracked JSON. CI validates bundle layout and builds Mare Desk on macOS.

**Operator action still required:** Revoke the OpenAI key that was stored in `archive/openai_api.rtf` in git history (file removed; key may still be valid until revoked in OpenAI dashboard).

---

## Upgrade timeline

| Phase | Commit / action | What changed |
|-------|-----------------|--------------|
| 1 | `e9eb05f` | Mare Desk repo path → `Documents/GitHub/GMC` |
| 2 | `7dd7442` | Sandbox seeding, frozen restore, scoped imports, legacy doc archive |
| 3 | This remediation | Security cleanup, PII redaction, CI, tests, docs |

---

## Mare Desk stabilization (commit `7dd7442`)

### Sandbox import

- `Launch_MareDesk.command` seeds `data/gmc_source` into `~/Library/Containers/.../gmc_capture` before launch.
- `MARE_DESK_CAPTURE_BUNDLE` points at the container path (not the repo path).
- App Sandbox can read import data without extra entitlements.

### Import behavior

- `MARE_DESK_FORCE_IMPORT` defaults to `0` (explicit opt-in for re-import).
- `RestoreCaptureUseCase` restores from **frozen payloads** when present.
- `SecurityScopedAccess` wraps NSOpenPanel import paths.
- `replaceMemos` deletes prior memos before insert.

### Launch reliability

- BSD `/usr/bin/stat` used for DerivedData discovery (fixes Homebrew GNU `stat` conflict).

### UI honesty

- Settings warns AI/IBKR are experimental stubs.
- IBKR status: "Gateway authenticated — positions not wired (local book active)".
- Operator mode stays `LOCAL-IMPORT` even when IBKR gateway is detected.

---

## Security remediation (this pass)

| Action | Status |
|--------|--------|
| Remove `archive/openai_api.rtf` from git | Done |
| `.gitignore` blocks API key / secret filename patterns | Done |
| Redact tenant `nome` / `telefone` / `email` in `imoveis_state.json` | Done (sample placeholders) |
| Archive `populate_dashboard.scpt` (embedded addresses) | Done |
| Archive hazardous `SHARE_DASHBOARD.md` to `archive/docs-legacy/` | Done (prior commit) |

**Manual:** Revoke exposed OpenAI key at https://platform.openai.com/api-keys

---

## Repository hygiene

| Action | Status |
|--------|--------|
| Archive `sync_engine.py` (missing markdown deps) | Done → `archive/scripts-legacy/` |
| Archive legacy AppleScripts | Done |
| `archive/docs-legacy/README.md` — retired banner | Done |
| `archive/scripts-legacy/README.md` — canonical sync path | Done |
| Node `package.json` + lockfile for Excel helper | Done (prior commit) |

---

## Testing and CI

| Addition | Purpose |
|----------|---------|
| `tests/fixtures/minimal_gmc_source/` | Minimal valid capture bundle |
| `tests/validate_capture_bundle.py` | Validates portfolio + real_estate JSON layout |
| `.github/workflows/macos-build.yml` | CI: validate bundles + `xcodebuild` on push/PR to `main` |

Run locally:

```bash
python3 tests/validate_capture_bundle.py
```

---

## Documentation updates

- Root `README.md` — security banner, sync command, validation command.
- `src/MareDesk/README.md` — SwiftData store and backup paths.
- `IBKRBrokerageProvider.swift` — TLS limitation documented in source.
- `GMCJSONImporter.swift` — documents active-instrument current/target semantics.

---

## Canonical workflows (post-upgrade)

| Task | Command |
|------|---------|
| Run Mare Desk | `./src/MareDesk/Launch_MareDesk.command` |
| Force re-import | `MARE_DESK_FORCE_IMPORT=1 ./src/MareDesk/Launch_MareDesk.command` |
| Sync CSVs from JSON | `python3 scripts/sync_portfolio_from_json.py` |
| Build Excel export | `cd scripts && npm run build-portfolio-excel` |
| Validate bundles | `python3 tests/validate_capture_bundle.py` |
| Desktop shortcut | `./src/MareDesk/scripts/create_desktop_shortcut.sh` |

---

## Findings status after remediation

| ID | Original severity | Status |
|----|-------------------|--------|
| AUDIT-020 | Critical — API key in git | **Remediated** (file removed; revoke key manually) |
| AUDIT-002 | High — PII in git | **Partially remediated** (tenant contacts redacted; property addresses remain — private repo policy) |
| AUDIT-001 | High — sandbox import | **Fixed** (`7dd7442`) |
| AUDIT-003 | High — force import default | **Fixed** (`7dd7442`) |
| AUDIT-004 | High — restore semantics | **Fixed** (`7dd7442`) |
| AUDIT-005 | Medium — scoped access | **Fixed** (`7dd7442`) |
| AUDIT-006 | Medium — stale web docs | **Archived** |
| AUDIT-007 | Medium — broken scripts | **Archived** |
| AUDIT-008 | Medium — AI/IBKR stubs | **Mitigated** (UI warnings) |
| AUDIT-009 | Medium — IBKR TLS | **Documented** (deferred implementation) |
| AUDIT-010 | Medium — Node manifest | **Fixed** (`7dd7442`) |
| AUDIT-011 | Medium — sync_engine | **Archived** |
| AUDIT-012 | Medium — current vs target | **Documented** in importer |
| AUDIT-013 | Low — replaceMemos | **Fixed** (`7dd7442`) |
| AUDIT-016 | Low — shell temp cleanup | **Fixed** (`7dd7442`) |
| AUDIT-018 | Informational — no tests/CI | **Improved** (validation script + CI build) |

---

## Deferred (intentionally not done)

- Full Anthropic/OpenAI API transports
- IBKR positions driving the live book
- Notarized distribution signing
- Git LFS for large PDFs/media
- App Intents / Shortcuts
- XCTest target in Xcode (validation script + CI build substituted)
- Git history rewrite for removed API key (optional if repo was ever public)

---

## Final recommendation

1. **Revoke** the old OpenAI key today.
2. **Use Mare Desk + `data/gmc_source`** as the only production workflow.
3. **Restore real tenant data** locally if needed (not in git) — tracked JSON now uses sample tenant placeholders.
4. **Watch CI** on `main` for build regressions.

GMC is in a **stable local-operator state** suitable for daily portfolio desk use on macOS 15+.
