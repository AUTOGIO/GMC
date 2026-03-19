/**
 * MacroContextSection.jsx — GMC Section 9: Live Macro Context
 *
 * Displays Brazil + Global macro signals fed by Personal_Tracker_Global.
 * Accepts `macroData` and `onRefresh` as props from App.jsx.
 * Matches the GMC dark design system exactly (fonts, colors, borders, spacing).
 */

import React, { useState } from 'react';
import { getRegimeDisplay, fmtDate, MACRO_DEFAULTS } from './macroApi';

// ── Design tokens (mirroring GMC App.jsx) ────────────────────────────────────
const T = {
  bg:         'rgba(18, 18, 18, 0.6)',
  bgDeep:     'rgba(10, 10, 10, 0.5)',
  border:     '1px solid rgba(74, 78, 82, 0.3)',
  borderAccent:'1px solid rgba(208, 255, 0, 0.25)',
  radius:     '12px',
  radiusLg:   '16px',
  lime:       '#D0FF00',
  silver:     '#C0C0C0',
  white:      '#F8FAFC',
  textPrimary:'#E2E8F0',
  textMuted:  '#94A3B8',
  textDim:    '#4A4E52',
  fontSerif:  "'Cormorant Garamond', Georgia, serif",
  fontSans:   "'DM Sans', sans-serif",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(v, decimals = 2) {
  if (v == null) return '—';
  return Number(v).toFixed(decimals);
}

function fmtPct(v, decimals = 2) {
  if (v == null) return '—';
  return `${Number(v).toFixed(decimals)}%`;
}

function fmtSpread(v) {
  if (v == null) return '—';
  const n = Number(v);
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)} pp`;
}

function spreadColor(v) {
  if (v == null) return T.textMuted;
  return v > 0 ? T.lime : '#FF6B6B';
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Single KPI tile */
function KpiCard({ label, value, sub, valueColor, borderColor }) {
  return (
    <div style={{
      background:   T.bg,
      border:       borderColor ? `1px solid ${borderColor}` : T.border,
      borderRadius: T.radius,
      padding:      '18px 20px',
      display:      'flex',
      flexDirection:'column',
      gap:          '6px',
      minWidth:     0,
    }}>
      <div style={{ fontFamily: T.fontSans, fontSize: '11px', color: T.textDim, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: T.fontSans, fontSize: '22px', fontWeight: '600', color: valueColor ?? T.white, letterSpacing: '-0.3px' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: T.fontSans, fontSize: '11px', color: T.textMuted }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/** Section divider label */
function BlockLabel({ flag, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <span style={{ fontSize: '16px' }}>{flag}</span>
      <span style={{ fontFamily: T.fontSans, fontSize: '11px', color: T.textMuted, letterSpacing: '2px', textTransform: 'uppercase' }}>
        {title}
      </span>
    </div>
  );
}

/** Online / cache / offline status badge */
function StatusBadge({ macroData, refreshing, onRefresh }) {
  const isOnline   = macroData?.online;
  const isCache    = macroData?.fromCache;
  const isCacheOld = macroData?.cacheStale;

  let dot, label, color;
  if (refreshing) {
    dot = '⟳'; label = 'Refreshing…'; color = T.textMuted;
  } else if (isOnline) {
    dot = '●'; label = `Live · ${fmtDate(macroData.timestamp, 'just now')}`; color = T.lime;
  } else if (isCache && !isCacheOld) {
    const mins = Math.round((macroData.cacheAgeMs ?? 0) / 60_000);
    dot = '○'; label = `Cached · ${mins}m ago`; color = T.silver;
  } else if (isCache && isCacheOld) {
    dot = '○'; label = 'Stale cache'; color = '#F59E0B';
  } else {
    dot = '✕'; label = 'Services offline'; color = '#94A3B8';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <span style={{ fontFamily: T.fontSans, fontSize: '12px', color, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '8px' }}>{dot}</span>
        {label}
      </span>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        style={{
          fontFamily:  T.fontSans,
          fontSize:    '11px',
          color:       refreshing ? T.textDim : T.textMuted,
          background:  'transparent',
          border:      T.border,
          borderRadius:'6px',
          padding:     '4px 10px',
          cursor:      refreshing ? 'default' : 'pointer',
          letterSpacing:'0.5px',
          transition:  'color 0.2s',
        }}
      >
        {refreshing ? 'Refreshing…' : '↻ Refresh'}
      </button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MacroContextSection({ macroData, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const d = macroData ?? MACRO_DEFAULTS;
  const regime = getRegimeDisplay(d.regimeHint);

  async function handleRefresh() {
    if (refreshing || !onRefresh) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  }

  return (
    <section
      id="s9-macro-context"
      style={{ marginBottom: '48px', paddingTop: '24px', borderTop: '1px solid rgba(192, 192, 192, 0.1)' }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: T.silver, margin: 0, fontFamily: T.fontSans }}>
          9. MACRO CONTEXT
        </h2>
        <StatusBadge macroData={macroData} refreshing={refreshing} onRefresh={handleRefresh} />
      </div>

      <p style={{ fontFamily: T.fontSans, fontSize: '14px', color: T.textMuted, marginBottom: '28px', marginTop: '4px' }}>
        Live Brazil + Global signals — BCB · IBGE · FRED · ECB. Refreshed every 4 h via LaunchAgent.
      </p>

      {/* ── Regime banner ────────────────────────────────────────────────── */}
      <div style={{
        background:   T.bgDeep,
        border:       T.borderAccent,
        borderRadius: T.radius,
        padding:      '14px 20px',
        marginBottom: '24px',
        display:      'flex',
        alignItems:   'center',
        gap:          '12px',
        flexWrap:     'wrap',
      }}>
        <span style={{ fontFamily: T.fontSans, fontSize: '11px', color: T.textDim, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Macro Regime
        </span>
        <span style={{ fontFamily: T.fontSans, fontSize: '15px', fontWeight: '600', color: regime.color, letterSpacing: '0.5px' }}>
          {regime.label}
        </span>
        {d.timestamp && (
          <span style={{ fontFamily: T.fontSans, fontSize: '11px', color: T.textDim, marginLeft: 'auto' }}>
            As of {fmtDate(d.timestamp)}
          </span>
        )}
      </div>

      {/* ── Brazil block ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <BlockLabel flag="🇧🇷" title="Brazil — BCB · IBGE" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <KpiCard
            label="Selic"
            value={fmtPct(d.selic)}
            sub={d.meta?.selic?.asOf ?? 'BCB SGS 432'}
            valueColor={T.lime}
            borderColor={d.selic ? 'rgba(208, 255, 0, 0.2)' : undefined}
          />
          <KpiCard
            label="IPCA YoY"
            value={fmtPct(d.ipcaYoy)}
            sub={d.meta?.ipcaYoy?.asOf ?? 'IBGE / BCB'}
            valueColor={T.white}
          />
          <KpiCard
            label="USD / BRL"
            value={`R$ ${fmt(d.ptaxUsdBrl, 4)}`}
            sub={d.meta?.usdbrl?.asOf ?? 'BCB PTAX'}
            valueColor={T.silver}
          />
          <KpiCard
            label="Unemployment"
            value={fmtPct(d.unemploymentBr)}
            sub={d.meta?.unemploymentBr?.asOf ?? 'IBGE PNAD-C'}
            valueColor={T.textPrimary}
          />
        </div>
      </div>

      {/* ── Global block ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <BlockLabel flag="🌍" title="Global — FRED · ECB" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <KpiCard
            label="Fed Funds"
            value={fmtPct(d.fedFunds)}
            sub={d.meta?.fedFunds?.asOf ?? 'FRED FEDFUNDS'}
            valueColor={T.white}
          />
          <KpiCard
            label="US CPI YoY"
            value={fmtPct(d.usCpiYoy)}
            sub={d.meta?.usCpiYoy?.asOf ?? 'FRED'}
            valueColor={T.textPrimary}
          />
          <KpiCard
            label="US Unemployment"
            value={fmtPct(d.usUnemployment)}
            sub={d.meta?.usUnemployment?.asOf ?? 'FRED UNRATE'}
            valueColor={T.textPrimary}
          />
          <KpiCard
            label="ECB Rate"
            value={fmtPct(d.ecbRefi)}
            sub={d.meta?.ecbRefi?.asOf ?? 'ECB SDW DFR'}
            valueColor={T.textPrimary}
          />
        </div>
      </div>

      {/* ── FX block ──────────────────────────────────────────────────────── */}
      {(d.eurUsd != null || d.usdJpy != null) && (
        <div style={{ marginBottom: '24px' }}>
          <BlockLabel flag="💱" title="FX — ECB Reference" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {d.eurUsd != null && (
              <KpiCard label="EUR / USD" value={fmt(d.eurUsd, 4)} sub="ECB SDW" valueColor={T.textPrimary} />
            )}
            {d.usdJpy != null && (
              <KpiCard label="USD / JPY" value={fmt(d.usdJpy, 2)} sub="ECB cross" valueColor={T.textPrimary} />
            )}
          </div>
        </div>
      )}

      {/* ── Commodities block ─────────────────────────────────────────────── */}
      {(d.goldUsd != null || d.crudeOilWti != null) && (
        <div style={{ marginBottom: '24px' }}>
          <BlockLabel flag="🪙" title="Commodities — FRED" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {d.goldUsd != null && (
              <KpiCard
                label="Gold"
                value={`$${d.goldUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                sub="USD / troy oz · LBMA"
                valueColor="#F5C842"
              />
            )}
            {d.crudeOilWti != null && (
              <KpiCard
                label="Crude Oil WTI"
                value={`$${fmt(d.crudeOilWti, 2)}`}
                sub="USD / barrel · FRED"
                valueColor={T.textPrimary}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Derived / Comparison block ────────────────────────────────────── */}
      <div>
        <BlockLabel flag="⚖️" title="Derived Signals" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>

          {/* Carry spread */}
          <div style={{
            background:   T.bg,
            border:       T.border,
            borderRadius: T.radius,
            padding:      '18px 20px',
          }}>
            <div style={{ fontFamily: T.fontSans, fontSize: '11px', color: T.textDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Carry Spread (Selic − Fed)
            </div>
            <div style={{ fontFamily: T.fontSans, fontSize: '26px', fontWeight: '700', color: spreadColor(d.carrySpread), letterSpacing: '-0.5px' }}>
              {fmtSpread(d.carrySpread)}
            </div>
            <div style={{ marginTop: '10px', height: '4px', background: 'rgba(74, 78, 82, 0.25)', borderRadius: '2px', overflow: 'hidden' }}>
              {d.carrySpread != null && (
                <div style={{
                  height: '100%',
                  width:  `${Math.min(Math.abs(d.carrySpread) / 15 * 100, 100)}%`,
                  background: d.carrySpread > 0
                    ? 'linear-gradient(90deg, rgba(208,255,0,0.3) 0%, #D0FF00 100%)'
                    : 'linear-gradient(90deg, rgba(255,107,107,0.3) 0%, #FF6B6B 100%)',
                  borderRadius: '2px',
                  transition: 'width 0.6s ease',
                }} />
              )}
            </div>
            <div style={{ fontFamily: T.fontSans, fontSize: '11px', color: T.textMuted, marginTop: '8px' }}>
              {d.selic != null && d.fedFunds != null
                ? `Selic ${fmtPct(d.selic)} · Fed ${fmtPct(d.fedFunds)}`
                : 'Waiting for live data…'}
            </div>
          </div>

          {/* Inflation differential */}
          <div style={{
            background:   T.bg,
            border:       T.border,
            borderRadius: T.radius,
            padding:      '18px 20px',
          }}>
            <div style={{ fontFamily: T.fontSans, fontSize: '11px', color: T.textDim, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Inflation Diff (BR − US CPI)
            </div>
            <div style={{ fontFamily: T.fontSans, fontSize: '26px', fontWeight: '700', color: spreadColor(-(d.inflationDiff ?? 0)), letterSpacing: '-0.5px' }}>
              {fmtSpread(d.inflationDiff)}
            </div>
            <div style={{ marginTop: '10px', height: '4px', background: 'rgba(74, 78, 82, 0.25)', borderRadius: '2px', overflow: 'hidden' }}>
              {d.inflationDiff != null && (
                <div style={{
                  height: '100%',
                  width:  `${Math.min(Math.abs(d.inflationDiff) / 8 * 100, 100)}%`,
                  background: d.inflationDiff > 0
                    ? 'linear-gradient(90deg, rgba(255,107,107,0.3) 0%, #FF6B6B 100%)'
                    : 'linear-gradient(90deg, rgba(208,255,0,0.3) 0%, #D0FF00 100%)',
                  borderRadius: '2px',
                  transition: 'width 0.6s ease',
                }} />
              )}
            </div>
            <div style={{ fontFamily: T.fontSans, fontSize: '11px', color: T.textMuted, marginTop: '8px' }}>
              {d.ipcaYoy != null && d.usCpiYoy != null
                ? `IPCA ${fmtPct(d.ipcaYoy)} · US CPI ${fmtPct(d.usCpiYoy)}`
                : 'Waiting for live data…'}
            </div>
          </div>

        </div>
      </div>

      {/* ── Offline notice ────────────────────────────────────────────────── */}
      {!macroData?.online && !macroData?.fromCache && (
        <div style={{
          marginTop:    '20px',
          padding:      '12px 16px',
          background:   'rgba(10, 10, 10, 0.4)',
          border:       '1px solid rgba(74, 78, 82, 0.2)',
          borderRadius: T.radius,
          fontFamily:   T.fontSans,
          fontSize:     '12px',
          color:        T.textDim,
          lineHeight:   '1.6',
        }}>
          Services offline — showing defaults. Run <code style={{ color: T.silver, background: 'rgba(74,78,82,0.15)', padding: '1px 5px', borderRadius: '3px' }}>bash setup_all.sh</code> in <code style={{ color: T.silver, background: 'rgba(74,78,82,0.15)', padding: '1px 5px', borderRadius: '3px' }}>giovannini-finance/</code> to start all services.
        </div>
      )}

    </section>
  );
}
