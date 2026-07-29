# Repository Audit Report

**Repository:** `AUTOGIO/GMC` (private)  
**Branch audited:** `cursor/update-maredesk-repo-path` (1 commit ahead of `origin/main`; large uncommitted working-tree delta)  
**Audit date:** 2026-07-29  
**Mode:** Read-only except this report file  
**Scope:** Full pass over `src/MareDesk/`, `scripts/`, `docs/`, `config/`, `data/gmc_source/`, `archive/` (sampled). Generated media, Obsidian plugin blobs, and large PDFs sampled for hygiene only — not line-audited.

---

## 1. Executive Summary

GMC is a **personal family-office workspace** whose production surface is **Mare Desk**, a sandboxed SwiftUI macOS 15+ app that imports portfolio and real-estate JSON into local SwiftData. Supporting Python/Node/AppleScript helpers and a large `data/` tree remain from earlier Excel/Numbers/web workflows.

The implementation **matches current README intent** (native Mare Desk + `data/gmc_source`). A substantial **uncommitted stabilization pass** on branch `cursor/update-maredesk-repo-path` fixes several prior high-severity issues: sandbox seeding via `Launch_MareDesk.command`, default `MARE_DESK_FORCE_IMPORT=0`, frozen-payload restore, security-scoped panel imports, and `replaceMemos` cleanup. **These fixes are not yet on `main`.**

**Highest immediate risk:** a **committed OpenAI API key** in `archive/openai_api.rtf` (Critical). **Second:** financial book and tenant PII tracked in git (High). There are **no automated tests** and **no CI workflows**. Stabilization work should be **committed and the API key rotated/revoked** before further feature work.

**Verdict:** Usable as a local operator desk after committing sandbox fixes and revoking the exposed key. Not production-hardened for distribution or public hosting.

---

## 2. Audit Scope and Limitations

| In scope | Out of scope / blocked |
|----------|------------------------|
| Mare Desk Swift sources (~3,737 LOC) | Live IBKR Gateway TLS verification (no Gateway running) |
| Launch/seed/shell scripts | Network calls to Anthropic/OpenAI |
| `data/gmc_source` schema and PII field presence | Dependency CVE scan for undeclared Node `xlsx` (manifest exists only in uncommitted tree) |
| Python/Node helper scripts | Full line audit of `archive/obsidian` plugin JS |
| Documentation vs implementation | Installing missing packages |
| Git hygiene and large assets | Production deployment or migrations |

**Assumptions:** Operator on Apple Silicon macOS 15+; repo stays private; ad-hoc Debug signing (`CODE_SIGN_IDENTITY = -`) is intentional for personal use.

---

## 3. Initial Repository State

| Item | Value |
|------|-------|
| Root | `/Users/eduardofgiovannini/Documents/GitHub/GMC` |
| Branch | `cursor/update-maredesk-repo-path` |
| Remote | `origin` → `https://github.com/AUTOGIO/GMC.git` |
| Ahead of `main` | 1 commit (`e9eb05f` — Mare Desk repo path update) |
| Working tree | **Dirty** — 22 modified paths, 6 untracked paths (including stabilization fixes) |
| Submodules | None |
| Worktrees | None detected |
| Size | ~242 MB working tree |
| Recent commits | Mare Desk migration (`6cb2f03`), repo layout (`a5eb7d9`), path update (`e9eb05f`) |

**Uncommitted highlights (stabilization, not on `main`):**

- `Launch_MareDesk.command` — seeds container bundle, `MARE_DESK_FORCE_IMPORT` default `0`
- `RestoreCaptureUseCase.swift` / `ImportCaptureUseCase.swift` — frozen restore path
- `SecurityScopedAccess.swift` — panel import scoped access
- `SwiftDataRepositories.swift` — `replaceMemos` deletes before insert
- Stale docs moved to `archive/docs-legacy/`; broken scripts to `archive/scripts-legacy/`
- `scripts/package.json` + `package-lock.json` added (untracked)

---

## 4. Repository Purpose

| Question | Assessment |
|----------|------------|
| What it does | Displays Giovannini Mare Capital portfolio allocation, macro regime, Brazilian real-estate book, and import/capture history on macOS. |
| Likely user | Single operator / family office. |
| Primary workflows | Launch Mare Desk → import `data/gmc_source` → review desks; optional CSV/Excel/Numbers export via scripts. |
| Inputs | JSON under `data/gmc_source/` (`portfolio/` + `real_estate/`); optional IBKR Client Portal Gateway; optional AI API env vars (stubs). |
| Outputs | SwiftData store; UI desks; optional Excel/CSV via scripts. |
| Persistent data | SwiftData in app container; seeded copy at `~/Library/Containers/com.giovanninimare.MareDesk/.../gmc_capture`. |
| External services | Optional `https://localhost:5001` (IBKR); optional Anthropic/OpenAI/Ollama/LM Studio — stubs or probes only. |
| Deployment model | Local macOS Debug build; no server, no CI, no container deploy. |

**Doc vs code**

| Source | Status |
|--------|--------|
| `README.md`, `AGENTS.md`, `src/MareDesk/README.md` | **Accurate** for Mare Desk (including sandbox seeding in uncommitted README) |
| `archive/docs-legacy/system-engineering/*` | **Obsolete** — describes retired React/Vite + GitHub Pages stack |
| `archive/docs-legacy/SHARE_DASHBOARD.md` | **Hazardous** — public Pages sharing guidance for private financial data |

---

## 5. Repository Map

```text
GMC/
├── src/MareDesk/           SwiftUI macOS app (primary product)
├── data/
│   ├── gmc_source/         Canonical Mare Desk import bundle
│   ├── processed/          CSV exports (legacy/sync)
│   ├── portfolio/          Excel workbooks + JSON
│   ├── real_estate/        Excel + metadata
│   └── convex_reports/     Large research PDFs
├── scripts/                Python sync, Node Excel, AppleScript/Numbers
├── docs/                   Philosophy, convex instruments, prompts/
├── archive/                Retired web UI, Obsidian, legacy docs/scripts, API key RTF
├── assets/                 Logos, images, videos
├── config/                 Color palette notes
├── tests/                  Empty (.gitkeep only)
├── reports/session/        Agent session notes
└── .github/workflows/      Empty (no CI)
```

---

## 6. Technology Stack

| Layer | Technology | Evidence |
|-------|------------|----------|
| App UI | SwiftUI, MenuBarExtra | `src/MareDesk/` |
| Language | Swift 6.0 / 6.4 toolchain | `project.pbxproj`, `swift --version` |
| Persistence | SwiftData | `ModelContainerFactory`, repositories |
| Min OS | macOS 15.0 | Build settings |
| Signing | Hardened Runtime, App Sandbox, ad-hoc identity | `MareDesk.entitlements`, xcodebuild settings |
| Bundle ID | `com.giovanninimare.MareDesk` | Xcode project |
| Python helpers | stdlib only | `scripts/sync_engine.py`, `sync_portfolio_from_json.py` |
| Node helpers | `xlsx` (uncommitted manifest) | `scripts/package.json` (untracked) |
| Automation | AppleScript (Numbers) | `scripts/populate_dashboard.scpt` |
| CI/CD | **None** | Empty `.github/workflows/` |
| SPM packages | **None** | No external Swift deps |

---

## 7. Architecture Overview

```text
  data/gmc_source (repo)
         │
         ▼ seed_capture_bundle.sh / Launch_MareDesk.command
  App Support/gmc_capture (container)
         │
         ▼ GMCJSONImporter → ImportCaptureUseCase
         │
         ▼ SwiftData (holdings, properties, captures, frozen payloads, memos)
         │
         ▼ Use cases → ViewModels → SwiftUI desks (Overview, Portfolio, Macro, Real Estate, History)
         │
    ┌────┴────┐
    ▼         ▼
 AI stubs   IBKR probe (optional localhost:5001)
```

**Strengths:** Clear layered layout; single GMC schema importer; local-first persistence; sandbox-aware launch path (uncommitted).

**Weaknesses:** Ambition–Capacity Mismatch — AI provider matrix, brokerage coordinator, capture freezing, and legacy Excel/Numbers/CSV pipelines exceed what a single-operator v1 needs while AI/IBKR transports remain stubbed.

---

## 8. Build, Test, and Run Procedure

### Prepare

1. macOS 15+, Xcode with macOS SDK.
2. Clone to a stable path (app prefers `~/Documents/GitHub/GMC` among candidates).
3. Ensure `data/gmc_source/portfolio/gmc_portfolio_state.json` and `data/gmc_source/real_estate/imoveis_state.json` exist.

### Build

```bash
cd src/MareDesk
xcodebuild -project MareDesk.xcodeproj -scheme MareDesk -destination 'platform=macOS' build
```

### Run

```bash
./src/MareDesk/Launch_MareDesk.command
```

Launch seeds repo data into the sandbox container, sets `MARE_DESK_CAPTURE_BUNDLE` to the container path, defaults `MARE_DESK_FORCE_IMPORT=0`, and launches the Debug binary from DerivedData.

Force re-import when needed:

```bash
MARE_DESK_FORCE_IMPORT=1 ./src/MareDesk/Launch_MareDesk.command
```

### Test

**None.** `tests/` is empty; no XCTest target.

### Environment variables

| Variable | Role |
|----------|------|
| `MARE_DESK_CAPTURE_BUNDLE` | Override capture bundle directory |
| `MARE_DESK_FORCE_IMPORT` | `1` forces re-import (default `0` in uncommitted Launch) |
| `GMC_WEBAPP_ROOT` / `GMC_ROOT` | Repo root for launch/seed scripts |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | Stub AI providers check presence only |
| `GMC_REPORTS_DIRECTORY` | In `.env.example` only — not referenced in Mare Desk Swift sources |

### Conflicts

- `scripts/sync_engine.py` requires markdown sources that do not exist (now fails loudly with exit code 1).
- Canonical JSON sync: `scripts/sync_portfolio_from_json.py`.
- Legacy docs in `archive/docs-legacy/` still describe `npm run build` / GitHub Pages.

---

## 9. Commands Executed

| Command | Exit | Result |
|---------|------|--------|
| `pwd` | 0 | `/Users/eduardofgiovannini/Documents/GitHub/GMC` |
| `git status --short` | 0 | Dirty working tree (22 modified, 6 untracked) |
| `git branch --show-current` | 0 | `cursor/update-maredesk-repo-path` |
| `git remote -v` | 0 | `origin` → GitHub |
| `git log -10 --oneline` | 0 | See Initial Repository State |
| `git submodule status` | 0 | No submodules |
| `du -sh .` | 0 | 242M |
| `swift --version` | 0 | Swift 6.4, arm64 macOS 27 |
| `python3 --version` | 0 | 3.14.6 |
| `node --version` | 0 | v26.5.0 |
| `zsh --version` | 0 | 5.9 |
| `git diff --check` | 0 | No conflict markers |
| `xcodebuild ... build` | 0 | **BUILD SUCCEEDED** |
| `python3 scripts/sync_engine.py` | 1 | Missing markdown sources (expected, loud failure) |
| `git ls-files archive/openai_api.rtf` | 0 | File **tracked** in git |

**Skipped:** `swift test` (no test target); `npm test`; live IBKR Gateway probe; dependency installs.

---

## 10. Findings Summary

| ID | Severity | Priority | Category | Finding | Confidence |
|----|----------|----------|----------|---------|--------------|
| AUDIT-020 | Critical | P0 | Security | Committed OpenAI API key in `archive/openai_api.rtf` | Confirmed |
| AUDIT-002 | High | P1 | Security | Financial book + tenant PII tracked in git | Confirmed |
| AUDIT-008 | Medium | P2 | Correctness | AI and IBKR surfaces are stubs; mode signaling misleading | Confirmed |
| AUDIT-009 | Medium | P2 | Reliability | IBKR localhost TLS likely incompatible with default URLSession | Probable |
| AUDIT-010 | Medium | P2 | Dependency | Node Excel script manifest only in uncommitted tree | Confirmed |
| AUDIT-011 | Medium | P2 | Reliability | `sync_engine.py` depends on missing markdown (now fails loud) | Confirmed |
| AUDIT-012 | Medium | P2 | Correctness | Active-instrument "current" equals target in importer | High confidence |
| AUDIT-014 | Low | P3 | macOS | Hard-coded `Documents/GitHub/GMC` primary path | Confirmed |
| AUDIT-015 | Low | P3 | Reliability | `ModelContainer` failure uses `fatalError` | Confirmed |
| AUDIT-016 | Low | P3 | Shell | Desktop shortcut script temp dirs not cleaned | Confirmed |
| AUDIT-017 | Informational | P3 | Documentation | Settings Shortcuts claim without implementation | Confirmed |
| AUDIT-018 | Informational | P3 | Testing | Empty test scaffold and no CI | Confirmed |
| AUDIT-019 | Informational | P3 | macOS | Ad-hoc signing / empty Development Team | Confirmed |

**Resolved in uncommitted working tree (commit before treating as fixed on `main`):**

| Prior ID | Resolution |
|----------|------------|
| AUDIT-001 | Launch seeds container `gmc_capture`; app reads sandbox path |
| AUDIT-003 | `MARE_DESK_FORCE_IMPORT` defaults to `0` |
| AUDIT-004 | `restoreFromFrozen` + `importFromFrozenPayloads` implemented |
| AUDIT-005 | `SecurityScopedAccess.withAccess` on panel imports |
| AUDIT-006 | Stale web docs moved to `archive/docs-legacy/` |
| AUDIT-007 | Broken AppleScripts moved to `archive/scripts-legacy/` |
| AUDIT-013 | `replaceMemos` now deletes all memos before insert |

---

## 11. Critical Findings

### [AUDIT-020] Committed OpenAI API key in archive

- Severity: Critical
- Priority: P0
- Confidence: Confirmed
- Category: Security
- File: `archive/openai_api.rtf`
- Location: RTF body, line 9
- Evidence:
  - File is **tracked in git** (`git ls-files archive/openai_api.rtf`).
  - Contains a `sk-proj-…` OpenAI project API key ([REDACTED] — not reproduced here).
  - File lives under `archive/` but remains in repository history once committed.
- Impact:
  - Key compromise via clone, backup, fork, or accidental share; unauthorized API usage and billing.
- Recommendation:
  - **Immediately revoke/rotate the key** in OpenAI dashboard.
  - Remove file from git (`git rm`) and purge from history if repo was ever public or widely shared.
  - Add `*.rtf` with secrets patterns or explicit path to `.gitignore`; never store API keys in repo.
- Validation:
  - `git grep sk-proj` returns no matches; OpenAI dashboard shows old key revoked.

---

## 12. High Findings

### [AUDIT-002] Sensitive financial and tenant PII tracked in git

- Severity: High
- Priority: P1
- Confidence: Confirmed
- Category: Security / Privacy
- File: `data/gmc_source/real_estate/imoveis_state.json`, `data/gmc_source/portfolio/gmc_portfolio_state.json`, `data/processed/*.csv`, `scripts/populate_dashboard.scpt`
- Location: tenant `nome` / `email` / `telefone`; property addresses; portfolio capital figures; embedded Numbers tables in AppleScript
- Evidence:
  - `imoveis_state.json` contains multiple tenant contact records with non-empty values (field names verified; values not reproduced).
  - `populate_dashboard.scpt` embeds full street addresses, matrícula numbers, and R$ market values inline (lines 23–33).
  - Repo is private — mitigates public crawl, not clone/backup/mis-share risk.
  - `archive/docs-legacy/SHARE_DASHBOARD.md` still instructs public GitHub Pages sharing.
- Impact:
  - Accidental publicity or following stale share docs could expose family-office and tenant personal data.
- Recommendation:
  - Keep repo private; redact or relocate PII to gitignored local paths; scrub `populate_dashboard.scpt` or move to archive; ensure share docs cannot be mistaken as current policy.
- Validation:
  - Scan for tenant email/phone patterns returns none in tracked files; no doc recommends public Pages for this dataset.

---

## 13. Medium Findings

### [AUDIT-008] AI and IBKR surfaces are stubs / incomplete

- Severity: Medium
- Priority: P2
- Confidence: Confirmed
- Category: Correctness / Architecture
- File: `AIProviders.swift`, `IBKRBrokerageProvider.swift`, `SettingsView.swift`, `OperatorRuntimeStatus.swift`
- Location: `complete` returns placeholder strings; IBKR probes `https://localhost:5001`
- Evidence:
  - Comments state transport "intentionally stubbed".
  - Settings now shows experimental warning (uncommitted) — partial mitigation.
  - `OperatorRuntimeStatus` can label IBKR-LIVE when gateway probe succeeds while book remains local JSON.
- Impact:
  - Operator may trust live brokerage/AI capability that does not drive the book.
- Recommendation:
  - Hide or clearly mark experimental until transport ships; do not set live mode unless holdings come from IBKR.
- Validation:
  - With gateway up, UI either uses IBKR positions or states "gateway detected, book still local".

### [AUDIT-009] IBKR Client Portal TLS likely incompatible with default URLSession

- Severity: Medium
- Priority: P2
- Confidence: Probable
- Category: Reliability / Security
- File: `IBKRBrokerageProvider.swift`
- Location: `baseURL = https://localhost:5001/v1/api`, `URLSession.shared`
- Evidence:
  - IBKR Gateway commonly uses self-signed cert; no custom delegate or ATS exception.
- Impact:
  - Availability probes fail even when Gateway is running.
- Recommendation:
  - Document Gateway TLS setup; implement constrained localhost trust or cert install path.
- Validation:
  - With authenticated Gateway, `isAuthenticated()` returns true under chosen trust model.

### [AUDIT-010] Excel generator Node manifest only in uncommitted tree

- Severity: Medium
- Priority: P2
- Confidence: Confirmed
- Category: Dependency
- File: `scripts/build_portfolio_excel.js`, `scripts/package.json` (untracked)
- Location: `import * as XLSX from 'xlsx'`
- Evidence:
  - `package.json` + lockfile exist as **untracked** files; not on `main`.
  - `scripts/node_modules` present locally (gitignored).
- Impact:
  - Clean clone on `main` cannot run Excel script without manual `npm install`.
- Recommendation:
  - Commit `package.json` + lockfile or archive script; document one regeneration command.
- Validation:
  - Fresh clone after commit: documented install + script succeeds.

### [AUDIT-011] Sync engine depends on missing markdown sources

- Severity: Medium
- Priority: P2
- Confidence: Confirmed
- Category: Reliability
- File: `scripts/sync_engine.py`
- Location: `required_sources` — `docs/real_estate_master.md`, `docs/Banking.md`, `docs/MACRO_SUMMARY.md`
- Evidence:
  - Files absent; script now exits 1 with clear stderr (uncommitted improvement).
  - Points operators to `sync_portfolio_from_json.py` instead.
- Impact:
  - Operators may still run wrong sync script expecting CSV refresh.
- Recommendation:
  - Archive `sync_engine.py` or redirect README to JSON sync only.
- Validation:
  - README documents canonical sync path only.

### [AUDIT-012] Active-instrument "current" amount equals target

- Severity: Medium
- Priority: P2
- Confidence: High confidence
- Category: Correctness
- File: `GMCJSONImporter.swift`
- Location: `resolveCurrentAmount` — `.active` returns `targetAmount`
- Evidence:
  - Snapshot class totals applied only for non-active statuses.
- Impact:
  - Drift KPIs may understate deviation from structural snapshot.
- Recommendation:
  - Use explicit per-instrument current fields when present; or document that "current" means executed target book.
- Validation:
  - Fixture with snapshot ≠ target for active class produces expected drift.

---

## 14. Low and Informational Findings

### [AUDIT-014] Hard-coded primary path `Documents/GitHub/GMC`

- Severity: Low | Priority: P3 | Confidence: Confirmed | Category: macOS
- File: `CaptureBundleLocator.swift` — `primaryGMCRepositoryRoot`
- Mitigated by env, UserDefaults, `#filePath` walk, seed script.

### [AUDIT-015] Persistence failure uses `fatalError`

- Severity: Low | Priority: P3 | Confidence: Confirmed | Category: Reliability
- File: `AppDependencies.swift` — `live()` catch → `fatalError`

### [AUDIT-016] Desktop shortcut script temp dirs not cleaned

- Severity: Low | Priority: P3 | Confidence: Confirmed | Category: Shell
- File: `src/MareDesk/scripts/create_desktop_shortcut.sh` — `mktemp` without `trap` cleanup

### [AUDIT-017] Settings mention Shortcuts without implementation

- Severity: Informational | Priority: P3 | Confidence: Confirmed | Category: Documentation
- File: `SettingsView.swift` — no App Intents / Shortcuts files in tree

### [AUDIT-018] Empty test and CI scaffolds

- Severity: Informational | Priority: P3 | Confidence: Confirmed | Category: Testing
- `tests/.gitkeep` only; `.github/workflows/` empty

### [AUDIT-019] Ad-hoc code signing / empty Development Team

- Severity: Informational | Priority: P3 | Confidence: Confirmed | Category: macOS
- Fine for personal Debug; blocks Notarization until team signing configured.

---

## 15. Security Assessment

| Risk | Status |
|------|--------|
| Committed API key | **Critical** — `archive/openai_api.rtf` |
| PII in tracked data | **High** — tenant contacts, addresses, capital figures |
| `.env` handling | Good — gitignored; `.env.example` has no secrets |
| Hard-coded keys in Swift/Python | None found in active app code |
| AI stub exfiltration | Stubs return placeholders only; check env presence |
| Stale public-share docs | Hazardous copy in `archive/docs-legacy/` |
| Sandbox | Enabled with minimal entitlements — appropriate after container seeding |
| IBKR TLS | Probable localhost trust gap |

**Redaction policy:** Secret and PII values are not copied into this report (`[REDACTED]` where needed).

---

## 16. Correctness Assessment

- **Importer** (`GMCJSONImporter`) is the correctness critical path — ~550 LOC, no automated fixtures.
- **Restore** semantics fixed in uncommitted tree (frozen payload path).
- **Drift math** may understate active-instrument deviation (AUDIT-012).
- **AI/IBKR** do not affect book data — stubs only.
- **Import errors** logged; sidebar shows alert on failure (uncommitted).

---

## 17. Reliability and Operational Stability

1. **API key exposure** — rotate immediately (AUDIT-020).
2. **Uncommitted fixes** — sandbox launch path not on `main` until merged.
3. **IBKR/AI mode signaling** — can mislead operator (AUDIT-008).
4. **Legacy scripts** — `sync_engine.py` fails loud; `populate_dashboard.scpt` still embeds stale inventory.
5. **DerivedData selection** — Launch `find ... | head -1` may pick stale build if multiple DerivedData folders exist.
6. **No monitoring/backup** for SwiftData store — undocumented.
7. **Capture history growth** — each manual import inserts new `CaptureEvent` and frozen payloads (expected; force-import default now off).

---

## 18. Architecture and Complexity Assessment

**Ambition–Capacity Mismatch:** Clean Architecture layers, four AI providers, brokerage coordinator, capture freezing, and parallel Excel/Numbers/CSV pipelines exceed single-operator maintenance capacity while AI/IBKR/restore were incomplete until recent uncommitted work.

**Multiple sources of truth:** `gmc_source` JSON, `data/processed` CSVs, Excel workbooks, SwiftData, embedded AppleScript tables.

**Recommendation:** Simplify around `gmc_source` → seed → import → SwiftData → UI. Demote Excel/Numbers/AI/IBKR to optional satellites.

---

## 19. Dependency Assessment

| Area | Assessment |
|------|------------|
| Mare Desk | No SPM packages — minimal |
| Python | Stdlib only |
| Node | `package.json` uncommitted; `node_modules` local only |
| Archive | Obsidian plugin, large PDFs/zip — inflate clone, not runtime |
| CVE scan | No Swift/third-party lockfiles for app; Node lockfile uncommitted |

---

## 20. Testing Assessment

| Item | Status |
|------|--------|
| Frameworks | None |
| `tests/` | Empty |
| XCTest target | Not present |
| Critical untested paths | JSON import, drift math, frozen restore, sandbox import, IBKR parsing |

**Gap:** Largest maintainability hole for a finance operator surface.

---

## 21. Documentation Assessment

| Doc | Accuracy |
|-----|----------|
| `README.md` | Accurate |
| `AGENTS.md` | Accurate |
| `src/MareDesk/README.md` | Accurate (uncommitted — includes sandbox seeding) |
| `archive/docs-legacy/*` | Obsolete / hazardous |
| `.env.example` | `GMC_REPORTS_DIRECTORY` unused by app |

---

## 22. macOS and Apple-Specific Assessment

| Topic | Finding |
|-------|---------|
| Apple Silicon | Native SwiftUI — OK |
| Sandbox | Enabled; container seeding fixes import (uncommitted) |
| Hardened Runtime | Enabled |
| Entitlements | Minimal — appropriate |
| Keychain | Not used for API keys |
| Absolute paths | Legacy docs/scripts; Swift prefers `Documents/GitHub/GMC` |
| Signing | Ad-hoc Debug — personal use only |

---

## 23. Shell Script Assessment

| Script | Assessment |
|--------|------------|
| `Launch_MareDesk.command` | `set -euo pipefail`; seeds container; good (uncommitted) |
| `seed_capture_bundle.sh` | `set -euo pipefail`; `rsync --delete` — good |
| `create_desktop_shortcut.sh` | Strict mode; temp dir cleanup missing (AUDIT-016) |
| `populate_dashboard.scpt` | Embeds sensitive property data inline |

---

## 24. Repository Hygiene

| Check | Result |
|-------|--------|
| `.gitignore` | Good for `.env`, DerivedData, venv, node_modules |
| Secrets tracked | **Yes** — `archive/openai_api.rtf` API key |
| Sensitive data tracked | Yes — portfolio + tenant PII |
| Large files | PDFs, MP4, PNG, xlsx, zip (~242 MB tree) |
| Git LFS | Not used |
| `archive/` | Legacy docs, Obsidian, API key RTF |
| CI | Empty |
| Working tree | Large uncommitted stabilization delta not on `main` |

---

## 25. Prioritized Remediation Plan

### Stage 0 — Preserve and Validate

1. **Revoke OpenAI key** exposed in `archive/openai_api.rtf` immediately.
2. Confirm Time Machine / clone backup of repo + SwiftData store.
3. Record `git rev-parse HEAD` and branch.
4. On-device: verify Launch imports holdings after uncommitted fixes.
5. Do not follow `archive/docs-legacy/SHARE_DASHBOARD.md`.

### Stage 1 — Critical Stabilization

| Priority | Item | Action |
|----------|------|--------|
| P0 | AUDIT-020 | Revoke key; remove RTF from git; scan history |
| P1 | Uncommitted fixes | **Commit and merge** sandbox seeding, force-import default, frozen restore, scoped access |
| P1 | AUDIT-002 | Redact/relocate PII; scrub `populate_dashboard.scpt` |

### Stage 2 — Reliability Improvements

- AUDIT-008/009 — honest runtime mode + IBKR TLS plan or hide IBKR.
- AUDIT-010 — commit Node manifest or archive Excel script.
- AUDIT-011 — archive `sync_engine.py` or document JSON sync only.
- Launch DerivedData: prefer newest mtime build.

### Stage 3 — Simplification

- Archive obsolete `archive/docs-legacy` web guidance with clear "retired" banner.
- Single pipeline: `gmc_source` canonical.
- Mark or remove AI stubs from Settings until wired.

### Stage 4 — Maintainability

- XCTest target with golden JSON fixtures.
- Document env vars, sandbox notes, data policy in README.
- Optional CI build on macOS runner.

**Rollback:** Stage 1 commits are reversible via git; key revocation is not — rotate before cleanup.

**Do not attempt yet:** Full AI transport, IBKR book reconciliation, Notarization, public deploy.

---

## 26. Quick Wins

1. Revoke and remove `archive/openai_api.rtf` from git (P0).
2. Commit uncommitted stabilization branch work to `main`.
3. Commit `scripts/package.json` + lockfile or archive Excel script.
4. Add `trap` cleanup to `create_desktop_shortcut.sh`.
5. Point README sync section to `sync_portfolio_from_json.py` only.
6. Add banner in root README: "never commit API keys or tenant PII".
7. Redact tenant contacts in `imoveis_state.json` or move to gitignored local overlay.
8. Archive or scrub `populate_dashboard.scpt` embedded addresses.
9. Add one XCTest with minimal fixture bundle.
10. Document SwiftData store backup path in `src/MareDesk/README.md`.

---

## 27. Deferred Improvements

- Full Anthropic/OpenAI URLSession transports + Keychain storage.
- True IBKR-driven book with reconciliation UI.
- Notarized distribution signing.
- Git LFS or external storage for PDFs/MP4.
- App Intents / Shortcuts.
- Automated CI on macOS runners.
- Metrics "convexity" naming alignment with investment language.

---

## 28. Unresolved Questions

1. Was `archive/openai_api.rtf` ever pushed to a public fork or shared clone?
2. Is tenant data in `imoveis_state.json` production or fixture/sample data?
3. Is IBKR Gateway intended for near-term use or display-only probe?
4. Should `data/processed` CSVs remain canonical or be generated-only artifacts?

---

## 29. Final Recommendation

**Immediate:** Revoke the exposed OpenAI key and remove `archive/openai_api.rtf` from git. **Then commit** the uncommitted Mare Desk stabilization work (sandbox seeding, force-import default, frozen restore, scoped imports) to `main`.

Treat **Mare Desk + `data/gmc_source`** as the sole production path. Defer AI, IBKR depth, and legacy Excel/Numbers pipelines until import/history is trustworthy and covered by fixture tests.

Do not rewrite the Swift app — it is the right shape for a personal macOS operator surface. Simplify ambition (stubs, parallel data pipelines, archived web docs) to match single-operator capacity.

---

*Audit performed read-only per `repository-audit` skill. Only this file was created/updated.*
