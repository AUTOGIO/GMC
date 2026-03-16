import React, { useState, useEffect, useRef } from 'react';
import { isNexusEnabled, trpcGet, trpcPost, uploadReportPdf } from './nexusApi';

const REPORT_TYPES = ['macro', 'bitcoin', 'visa', 'real_estate', 'emerging_markets', 'quantum', 'special'];

const cardStyle = {
  background: 'rgba(18, 18, 18, 0.6)',
  border: '1px solid rgba(74, 78, 82, 0.3)',
  borderRadius: '16px',
  padding: '28px',
};
const labelStyle = {
  fontSize: '12px',
  color: '#4A4E52',
  fontFamily: "'DM Sans', sans-serif",
  letterSpacing: '1px',
  marginBottom: '8px',
};
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(10, 10, 10, 0.8)',
  border: '1px solid rgba(74, 78, 82, 0.4)',
  borderRadius: '8px',
  color: '#F8FAFC',
  fontSize: '14px',
  fontFamily: "'DM Sans', sans-serif",
};
const btnAccent = {
  padding: '10px 20px',
  background: 'rgba(208, 255, 0, 0.15)',
  border: '1px solid rgba(208, 255, 0, 0.4)',
  borderRadius: '8px',
  color: '#D0FF00',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  fontWeight: '600',
};

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsText(file);
  });
}

export default function ReportsSection() {
  const [ingestOpen, setIngestOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportType, setReportType] = useState('macro');
  const [file, setFile] = useState(null);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestError, setIngestError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef(null);

  const [reportsList, setReportsList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const loadList = async () => {
    setListLoading(true);
    try {
      const data = await trpcGet('reports.list', null);
      const list = data?.[0]?.result?.data?.json ?? [];
      setReportsList(Array.isArray(list) ? list : []);
    } catch (e) {
      setReportsList([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (inView && isNexusEnabled()) loadList();
  }, [inView]);

  useEffect(() => {
    if (!isNexusEnabled() || searchQuery.trim().length <= 3) {
      setSearchResults(null);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await trpcGet('reports.search', { query: searchQuery.trim(), topK: 5 });
        const raw = data?.[0]?.result?.data?.json;
        setSearchResults(Array.isArray(raw) ? raw : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  const handleIngest = async () => {
    if (!file) {
      setIngestError('Select a file');
      return;
    }
    setIngestError(null);
    setIngestLoading(true);
    try {
      const title = reportTitle || file.name;
      const filename = file.name;
      const reportDateVal = reportDate || new Date().toISOString().slice(0, 10);
      const ext = (filename.split('.').pop() || '').toLowerCase();
      if (ext === 'pdf') {
        await uploadReportPdf(file, { title, reportDate: reportDateVal, reportType });
      } else {
        const content = await readFileAsText(file);
        await trpcPost('reports.ingest', { title, filename, reportDate: reportDateVal, reportType, content });
      }
      setReportTitle('');
      setFile(null);
      setIngestOpen(false);
      loadList();
    } catch (e) {
      const msg = e?.message || '';
      const isNetworkOrCors = msg === 'Failed to fetch' || msg === 'Load failed' || msg === 'NetworkError when attempting to fetch resource';
      setIngestError(isNetworkOrCors
        ? 'Cannot reach NEXUS (localhost:3000). Is it running? If yes, set CORS_ORIGIN=http://localhost:5173 in NEXUS .env.'
        : (msg || 'Ingest failed'));
    } finally {
      setIngestLoading(false);
    }
  };

  if (!isNexusEnabled()) {
    return (
      <section id="reports" ref={sectionRef} style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
          REPORTS — Convex Research Library
        </h2>
        <div style={cardStyle}>
          <p style={{ color: '#94A3B8', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
            Reports and semantic search require the NEXUS backend. Set <code style={{ background: 'rgba(74,78,82,0.3)', padding: '2px 6px', borderRadius: '4px' }}>VITE_NEXUS_URL</code> in your environment to connect.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="reports" ref={sectionRef} style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
        REPORTS — Convex Research Library
      </h2>
      <div style={cardStyle}>

        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setIngestOpen((o) => !o)}
            style={btnAccent}
          >
            {ingestOpen ? 'Hide ingest' : 'Ingest Report'}
          </button>
        </div>

        {ingestOpen && (
          <div style={{ marginBottom: '28px', padding: '20px', background: 'rgba(10, 10, 10, 0.4)', borderRadius: '12px', border: '1px solid rgba(74, 78, 82, 0.2)' }}>
            <div style={{ ...labelStyle, marginTop: 0 }}>REPORT TITLE</div>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Title"
              style={{ ...inputStyle, marginBottom: '16px' }}
            />
            <div style={labelStyle}>REPORT DATE</div>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              style={{ ...inputStyle, marginBottom: '16px' }}
            />
            <div style={labelStyle}>REPORT TYPE</div>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ ...inputStyle, marginBottom: '16px' }}
            >
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div style={labelStyle}>FILE (.pdf, .txt, .md)</div>
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ ...inputStyle, marginBottom: '16px' }}
            />
            {ingestError && <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{ingestError}</div>}
            <button type="button" onClick={handleIngest} disabled={ingestLoading} style={btnAccent}>
              {ingestLoading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        )}

        <div style={labelStyle}>SEARCH ACROSS ALL REPORTS</div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search across all reports…"
          style={{ ...inputStyle, marginBottom: '16px' }}
        />
        {searchLoading && <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '12px' }}>Searching…</div>}
        {searchResults && searchResults.length === 0 && searchQuery.trim().length > 3 && (
          <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '12px' }}>No matches.</div>
        )}
        {searchResults && searchResults.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            {searchResults.map((hit, i) => (
              <div
                key={i}
                style={{
                  padding: '14px',
                  background: 'rgba(10, 10, 10, 0.5)',
                  border: '1px solid rgba(74, 78, 82, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                }}
              >
                <div style={{ color: '#D0FF00', fontWeight: '600', marginBottom: '4px' }}>{hit.title ?? hit.reportTitle ?? '—'}</div>
                <div style={{ color: '#94A3B8', marginBottom: '4px' }}>
                  {hit.reportDate ?? hit.date ?? '—'} {hit.section ? ` · ${hit.section}` : ''} {hit.similarity != null ? ` · score: ${Number(hit.similarity).toFixed(2)}` : ''}
                </div>
                <div style={{ color: '#CBD5E1', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                  {(hit.text || hit.content || hit.preview || '').split('\n').slice(0, 3).join('\n')}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={labelStyle}>INGESTED REPORTS</div>
        {listLoading && <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '12px' }}>Loading…</div>}
        {!listLoading && reportsList.length === 0 && <div style={{ color: '#4A4E52', fontSize: '13px', marginBottom: '12px' }}>No reports yet.</div>}
        {!listLoading && reportsList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reportsList.map((r) => {
              const id = r.id ?? r.reportId ?? r.title ?? JSON.stringify(r);
              const expanded = expandedId === id;
              return (
                <div
                  key={id}
                  style={{
                    background: 'rgba(10, 10, 10, 0.5)',
                    border: '1px solid rgba(74, 78, 82, 0.3)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedId(expanded ? null : id)}
                    onKeyDown={(e) => e.key === 'Enter' && setExpandedId(expanded ? null : id)}
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: '#F8FAFC', fontWeight: '500' }}>{r.title ?? r.filename ?? '—'}</span>
                    <span style={{ color: '#94A3B8' }}>{r.reportDate ?? r.date ?? '—'}</span>
                    <span style={{ padding: '4px 8px', background: 'rgba(208, 255, 0, 0.15)', borderRadius: '6px', color: '#D0FF00', fontSize: '11px', textTransform: 'uppercase' }}>
                      {r.reportType ?? r.type ?? 'macro'}
                    </span>
                    <span style={{ color: '#4A4E52' }}>{(r.chunkCount ?? r.chunks ?? 0)} chunks</span>
                  </div>
                  {expanded && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(74, 78, 82, 0.2)', color: '#94A3B8', fontSize: '12px' }}>
                      Filename: {r.filename ?? r.title ?? '—'}<br />
                      Ingested: {r.ingestedAt ?? r.createdAt ?? '—'}<br />
                      Total chunks: {r.chunkCount ?? r.chunks ?? 0}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
