/**
 * macroApi.js — GMC Macro Data Client
 *
 * Connects to two local FastAPI services:
 *   • Personal_Tracker_macros  → http://127.0.0.1:8012  (Brazil BCB + IBGE)
 *   • Personal_Tracker_Global  → http://127.0.0.1:8013  (Brazil + International unified)
 *
 * Priority chain for every render:
 *   1. Live fetch from port 8013 /metrics/global   (freshest, unified schema)
 *   2. localStorage cache (TTL = 4 h)              (survives page refresh, offline, sleep)
 *   3. MACRO_DEFAULTS                              (hardcoded last-resort — never breaks UI)
 *
 * Data is considered "stale but usable" from cache; the UI badges accordingly.
 * All localStorage writes are wrapped in try/catch (private mode, full storage, etc.).
 */

// ── Endpoints ────────────────────────────────────────────────────────────────
const GLOBAL_BASE = 'http://127.0.0.1:8013';
const BRAZIL_BASE = 'http://127.0.0.1:8012';
const TIMEOUT_MS  = 4_000;

// ── Persistence ──────────────────────────────────────────────────────────────
const CACHE_KEY    = 'gmc_macro_v2';
const CACHE_TTL_MS = 4 * 60 * 60 * 1_000; // 4 hours

function cacheLoad() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, savedAt } = JSON.parse(raw);
    const ageMs = Date.now() - savedAt;
    return { ...data, fromCache: true, cacheAgeMs: ageMs, cacheStale: ageMs > CACHE_TTL_MS };
  } catch {
    return null;
  }
}

function cacheSave(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, savedAt: Date.now() }));
  } catch { /* storage unavailable or full — fail silently */ }
}

export function cacheClear() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

// ── Hardcoded defaults (shown when both live + cache are unavailable) ────────
export const MACRO_DEFAULTS = {
  // Brazil
  ptaxUsdBrl:     5.85,
  selic:          null,
  ipcaYoy:        null,
  ipcaMonthly:    null,
  ibcBr:          null,
  unemploymentBr: null,
  cdi:            null,
  igpm:           null,
  // Global
  fedFunds:       null,
  usCpiYoy:       null,
  usUnemployment: null,
  ecbRefi:        null,
  eurUsd:         null,
  usdJpy:         null,
  goldUsd:        null,
  crudeOilWti:    null,
  // Derived
  carrySpread:    null,
  inflationDiff:  null,
  // Metadata
  regimeHint:     null,
  timestamp:      null,
  meta:           {},
  // Status flags
  online:         false,
  fromCache:      false,
  cacheAgeMs:     null,
  cacheStale:     false,
};

// ── HTTP helper ───────────────────────────────────────────────────────────────
async function get(url) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── Value extractor helpers ───────────────────────────────────────────────────
function val(obj, key) {
  const v = obj?.[key]?.value;
  if (v == null || v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function asOf(obj, key) {
  return obj?.[key]?.as_of ?? null;
}

function src(obj, key) {
  return obj?.[key]?.source ?? null;
}

// ── Parse /metrics/global response into flat GMC shape ───────────────────────
function parseGlobal(raw) {
  const br  = raw?.brazil      ?? {};
  const gl  = raw?.global      ?? {};
  const cmp = raw?.comparison  ?? {};

  return {
    // Brazil
    ptaxUsdBrl:     val(br,  'usdbrl')             ?? MACRO_DEFAULTS.ptaxUsdBrl,
    selic:          val(br,  'selic'),
    ipcaYoy:        val(br,  'ipca_yoy'),
    unemploymentBr: val(br,  'unemployment'),
    // Global
    fedFunds:       val(gl,  'fed_funds'),
    usCpiYoy:       val(gl,  'us_cpi_yoy'),
    usUnemployment: val(gl,  'us_unemployment'),
    ecbRefi:        val(gl,  'ecb_refi'),
    eurUsd:         val(gl,  'eurusd'),
    usdJpy:         val(gl,  'usdjpy'),
    goldUsd:        val(gl,  'gold_usd'),
    crudeOilWti:    val(gl,  'crude_oil_wti'),
    // Derived
    carrySpread:    val(cmp, 'selic_minus_fed'),
    inflationDiff:  val(cmp, 'br_inflation_minus_us'),
    // Metadata per field (as_of, source)
    meta: {
      selic:          { asOf: asOf(br,  'selic'),          source: src(br,  'selic')          },
      ipcaYoy:        { asOf: asOf(br,  'ipca_yoy'),       source: src(br,  'ipca_yoy')       },
      usdbrl:         { asOf: asOf(br,  'usdbrl'),         source: src(br,  'usdbrl')         },
      unemploymentBr: { asOf: asOf(br,  'unemployment'),   source: src(br,  'unemployment')   },
      fedFunds:       { asOf: asOf(gl,  'fed_funds'),      source: src(gl,  'fed_funds')      },
      usCpiYoy:       { asOf: asOf(gl,  'us_cpi_yoy'),     source: src(gl,  'us_cpi_yoy')     },
      usUnemployment: { asOf: asOf(gl,  'us_unemployment'),source: src(gl,  'us_unemployment')},
      ecbRefi:        { asOf: asOf(gl,  'ecb_refi'),       source: src(gl,  'ecb_refi')       },
    },
    regimeHint: raw?.regime_hint ?? null,
    timestamp:  raw?.timestamp   ?? null,
    online:     true,
    fromCache:  false,
    cacheAgeMs: null,
    cacheStale: false,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch unified macro data from Personal_Tracker_Global.
 * Falls back to localStorage cache, then to MACRO_DEFAULTS.
 * Never throws — always returns a complete shape.
 */
export async function fetchGlobalMetrics() {
  const raw = await get(`${GLOBAL_BASE}/metrics/global`);

  if (raw) {
    const data = parseGlobal(raw);
    cacheSave(data);
    return data;
  }

  // Live unavailable — try cache
  const cached = cacheLoad();
  if (cached) return cached;

  // Both unavailable — return defaults
  return { ...MACRO_DEFAULTS };
}

/**
 * Quick liveness check for both services. Returns { macros, global }.
 */
export async function checkServices() {
  const [macros, global] = await Promise.allSettled([
    get(`${BRAZIL_BASE}/status`),
    get(`${GLOBAL_BASE}/status`),
  ]);
  return {
    macros: macros.status === 'fulfilled' && macros.value !== null,
    global: global.status === 'fulfilled' && global.value !== null,
  };
}

/**
 * Trigger a data refresh on the Global service (POST /refresh).
 * Returns the updated metrics or null on failure.
 */
export async function triggerRefresh() {
  try {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30_000); // refresh can take ~20s
    const res   = await fetch(`${GLOBAL_BASE}/refresh`, {
      method: 'POST',
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
  } catch {
    return null;
  }
  return fetchGlobalMetrics();
}

// ── Regime display helpers ────────────────────────────────────────────────────
const REGIME_MAP = {
  carry_favorable_to_brl: { label: 'Carry Favorable · BRL', color: '#D0FF00' },
  neutral:                { label: 'Neutral Regime',         color: '#94A3B8' },
};

export function getRegimeDisplay(hint) {
  if (!hint) return { label: 'Defensive Convex', color: '#C0C0C0' };
  return REGIME_MAP[hint] ?? {
    label: hint.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    color: '#94A3B8',
  };
}

/**
 * Format a UTC ISO timestamp as a local date string (YYYY-MM-DD).
 * Returns the fallback string if ts is null/undefined.
 */
export function fmtDate(ts, fallback = '—') {
  if (!ts) return fallback;
  try { return new Date(ts).toISOString().slice(0, 10); } catch { return fallback; }
}
