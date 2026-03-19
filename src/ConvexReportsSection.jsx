/**
 * ConvexReportsSection.jsx — GMC Convex Research Library
 *
 * Reads PDFs from ~/dev/products/GMC/data/convex_reports/ via the
 * Personal_Tracker_Global backend (/reports endpoint on port 8013).
 *
 * - Auto-refreshes the file list every 30 s (picks up new reports instantly)
 * - Opens each PDF via the backend's /reports/{filename} route
 * - Falls back to an offline notice if the service is unreachable
 */

import React, { useState, useEffect, useCallback } from 'react';

const REPORTS_BASE = 'http://127.0.0.1:8013';
const POLL_MS      = 30_000; // re-scan folder every 30 s

// ── Design tokens (match GMC dark system) ────────────────────────────────────
const T = {
  bg:          'rgba(18, 18, 18, 0.6)',
  bgDeep:      'rgba(10, 10, 10, 0.5)',
  bgCard:      'rgba(14, 14, 20, 0.7)',
  border:      '1px solid rgba(74, 78, 82, 0.3)',
  borderAccent:'1px solid rgba(208, 255, 0, 0.25)',
  radius:      '12px',
  radiusLg:    '16px',
  lime:        '#D0FF00',
  silver:      '#C0C0C0',
  white:       '#F8FAFC',
  textPrimary: '#E2E8F0',
  textMuted:   '#94A3B8',
  textDim:     '#4A4E52',
  fontSerif:   "'Cormorant Garamond', Georgia, serif",
  fontSans:    "'DM Sans', sans-serif",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(mtime) {
  if (!mtime) return '—';
  try {
    return new Date(mtime * 1000).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return '—'; }
}

function cleanName(filename) {
  return filename
    .replace(/_compressed$/, '')
    .replace(/-compressed(-\d+)?$/, '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\.pdf$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ConvexReportsSection() {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [online, setOnline]     = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [search, setSearch]     = useState('');

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch(`${REPORTS_BASE}/reports`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error('non-ok');
      const data = await res.json();
      setReports(data.reports ?? []);
      setOnline(true);
      setLastScan(new Date());
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
    const id = setInterval(fetchList, POLL_MS);
    return () => clearInterval(id);
  }, [fetchList]);

  const filtered = reports.filter(r =>
    cleanName(r.name).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section style={{
      maxWidth: '1400px',
      margin: '0 auto 60px',
      padding: '0 24px',
      fontFamily: T.fontSans,
    }}>

      {/* ── Section header ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{
            fontFamily: T.fontSerif,
            fontSize: '28px',
            fontWeight: '600',
            color: T.silver,
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}>
            Convex Research Library
          </div>
          <div style={{ fontSize: '13px', color: T.textMuted, marginTop: '6px' }}>
            {online
              ? `${reports.length} report${reports.length !== 1 ? 's' : ''} · auto-synced · last scanned ${lastScan?.toLocaleTimeString() ?? '—'}`
              : 'Service offline — start backend to browse reports'}
          </div>
        </div>

        {/* Search + status */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: online ? T.lime : '#FF6B6B',
            boxShadow: online ? `0 0 6px ${T.lime}` : 'none',
            flexShrink: 0,
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reports…"
            style={{
              padding: '8px 14px',
              background: 'rgba(10, 10, 10, 0.8)',
              border: '1px solid rgba(74, 78, 82, 0.4)',
              borderRadius: '8px',
              color: T.white,
              fontSize: '13px',
              fontFamily: T.fontSans,
              width: '220px',
              outline: 'none',
            }}
          />
          <button
            onClick={fetchList}
            style={{
              padding: '8px 14px',
              background: 'rgba(208,255,0,0.1)',
              border: '1px solid rgba(208,255,0,0.3)',
              borderRadius: '8px',
              color: T.lime,
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: T.fontSans,
              fontWeight: '600',
              letterSpacing: '0.5px',
            }}
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          color: T.textDim,
          fontSize: '13px',
          background: T.bgCard,
          border: T.border,
          borderRadius: T.radiusLg,
        }}>
          Loading reports…
        </div>
      ) : !online ? (
        <div style={{
          padding: '32px 28px',
          background: T.bgCard,
          border: T.border,
          borderRadius: T.radiusLg,
          color: T.textDim,
          fontSize: '13px',
          lineHeight: '1.8',
        }}>
          Backend service not reachable at <code style={{ color: T.silver, background: 'rgba(74,78,82,0.15)', padding: '1px 5px', borderRadius: '3px' }}>127.0.0.1:8013</code>.
          <br />
          Run <code style={{ color: T.silver, background: 'rgba(74,78,82,0.15)', padding: '1px 5px', borderRadius: '3px' }}>bash setup_all.sh</code> in <code style={{ color: T.silver, background: 'rgba(74,78,82,0.15)', padding: '1px 5px', borderRadius: '3px' }}>giovannini-finance/</code> to start all services.
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          color: T.textDim,
          fontSize: '13px',
          background: T.bgCard,
          border: T.border,
          borderRadius: T.radiusLg,
        }}>
          {search ? `No reports matching "${search}"` : 'No reports found in the reports folder.'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {filtered.map(report => (
            <ReportCard key={report.name} report={report} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Report Card ───────────────────────────────────────────────────────────────
function ReportCard({ report }) {
  const [hovered, setHovered] = useState(false);
  const title = cleanName(report.name);
  const url   = `${REPORTS_BASE}/reports/${encodeURIComponent(report.name)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        textDecoration: 'none',
        background: hovered ? 'rgba(208,255,0,0.04)' : T.bgCard,
        border: hovered ? T.borderAccent : T.border,
        borderRadius: T.radiusLg,
        padding: '20px 22px',
        transition: 'background 0.15s, border-color 0.15s',
        cursor: 'pointer',
      }}
    >
      {/* PDF icon + title */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div style={{
          flexShrink: 0,
          width: '36px', height: '36px',
          background: 'rgba(208,255,0,0.08)',
          border: '1px solid rgba(208,255,0,0.15)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
        }}>
          📄
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: T.fontSans,
            fontSize: '14px',
            fontWeight: '600',
            color: hovered ? T.white : T.textPrimary,
            lineHeight: '1.4',
            marginBottom: '6px',
            transition: 'color 0.15s',
          }}>
            {title}
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            fontSize: '11px',
            color: T.textDim,
            fontFamily: T.fontSans,
          }}>
            <span>{report.size_kb} KB</span>
            <span>·</span>
            <span>{formatDate(report.modified)}</span>
          </div>
        </div>
        <div style={{
          flexShrink: 0,
          fontSize: '12px',
          color: hovered ? T.lime : T.textDim,
          marginTop: '2px',
          transition: 'color 0.15s',
        }}>
          ↗
        </div>
      </div>
    </a>
  );
}
