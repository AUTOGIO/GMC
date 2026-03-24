/**
 * RealEstateSection.jsx — GMC Real Estate
 *
 * Tab 1 · Portfolio      — Property inventory (existing cards)
 * Tab 2 · Fontes         — 12 data sources table
 * Tab 3 · Preço/m²       — Formula + normalisation + Python pipeline + agg table
 * Tab 4 · MPI            — Market Pressure Index formula, components, scale, code
 * Tab 5 · Arquitetura    — ASCII pipeline diagram + no-code option
 * Tab 6 · Automação      — Frequency cards + alerts table + KPI wireframe
 * Tab 7 · Plano          — Options A/B + implementation steps + tech stack
 */

import React, { useState } from 'react';
import { MapPin, Edit3, DollarSign, Users, CreditCard, Wrench, TrendingUp, BarChart2 } from 'lucide-react';

// ─── design tokens ───────────────────────────────────────────────────────────
const T = {
  surface:  'rgba(18, 18, 18, 0.6)',
  surface2: 'rgba(10, 10, 10, 0.5)',
  border:   'rgba(74, 78, 82, 0.3)',
  border2:  'rgba(74, 78, 82, 0.2)',
  lime:     '#D0FF00',
  silver:   '#C0C0C0',
  text:     '#F8FAFC',
  muted:    '#4A4E52',
  muted2:   '#94A3B8',
  blue:     '#7ab8ff',
  blueB:    'rgba(79,142,247,0.15)',
  blueBB:   'rgba(79,142,247,0.35)',
  green:    '#22c55e',
  yellow:   '#f59e0b',
  red:      '#ef4444',
  orange:   '#f97316',
  font:     "'DM Sans', sans-serif",
};

const TABS = [
  { id: 'portfolio',    label: 'Portfolio' },
  { id: 'gestao',       label: 'Gestão' },
  { id: 'financeiro',   label: 'Financeiro' },
  { id: 'fontes',       label: 'Fontes de Dados' },
  { id: 'preco',        label: 'Preço/m²' },
  { id: 'mpi',          label: 'Índice MPI' },
  { id: 'arquitetura',  label: 'Arquitetura' },
  { id: 'automacao',    label: 'Automação' },
  { id: 'plano',        label: 'Plano de Ação' },
];

// ─── small helpers ────────────────────────────────────────────────────────────
const SectionH3 = ({ children }) => (
  <h3 style={{ fontSize: '14px', letterSpacing: '1.5px', color: T.silver,
    fontFamily: T.font, margin: '28px 0 14px', textTransform: 'uppercase' }}>
    {children}
  </h3>
);

const FormulaBox = ({ title, formula, legend }) => (
  <div style={{ background: 'rgba(30,34,50,0.8)', border: `1px solid ${T.border}`,
    borderLeft: `3px solid ${T.blue}`, borderRadius: '8px', padding: '20px 24px', margin: '12px 0' }}>
    <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
      color: T.blue, fontWeight: 700, marginBottom: '10px', fontFamily: T.font }}>{title}</div>
    <pre style={{ fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace", fontSize: '13px',
      color: T.text, margin: '0 0 12px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{formula}</pre>
    <div style={{ fontSize: '12px', color: T.muted2, lineHeight: 1.85, fontFamily: T.font }}
      dangerouslySetInnerHTML={{ __html: legend }} />
  </div>
);

const CodeBlock = ({ children }) => (
  <pre style={{ background: 'rgba(14,17,26,0.95)', border: `1px solid ${T.border}`,
    borderRadius: '8px', padding: '18px 22px', fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace",
    fontSize: '12px', lineHeight: 1.8, overflowX: 'auto', margin: '12px 0', color: '#abb2bf',
    whiteSpace: 'pre' }}>{children}</pre>
);

const TableWrap = ({ children }) => (
  <div style={{ overflowX: 'auto', borderRadius: '10px', border: `1px solid ${T.border}`, margin: '12px 0' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(18,18,18,0.9)' }}>
      {children}
    </table>
  </div>
);

const TH = ({ children, style = {} }) => (
  <th style={{ textAlign: 'left', padding: '11px 14px', fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.07em', color: T.muted2,
    borderBottom: `1px solid ${T.border}`, background: 'rgba(30,34,50,0.8)',
    whiteSpace: 'nowrap', fontFamily: T.font, ...style }}>{children}</th>
);

const TD = ({ children, style = {} }) => (
  <td style={{ padding: '10px 14px', borderBottom: `1px solid rgba(74,78,82,0.15)`,
    fontSize: '13px', verticalAlign: 'top', color: T.muted2, fontFamily: T.font, ...style }}>{children}</td>
);

const Badge = ({ color, bg, border, children }) => (
  <span style={{ display: 'inline-block', borderRadius: '4px', padding: '2px 8px',
    fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap',
    color, background: bg, border: `1px solid ${border}` }}>{children}</span>
);

const Alert = ({ icon, bg, border, children }) => (
  <div style={{ borderRadius: '8px', padding: '13px 16px', margin: '14px 0',
    fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'flex-start',
    background: bg, border: `1px solid ${border}`, color: T.muted2, fontFamily: T.font }}>
    <span style={{ fontSize: '16px', lineHeight: 1.4 }}>{icon}</span>
    <div>{children}</div>
  </div>
);

const Panel = ({ title, children }) => (
  <div style={{ background: 'rgba(18,18,18,0.8)', border: `1px solid ${T.border}`,
    borderRadius: '10px', padding: '18px 20px' }}>
    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em',
      fontWeight: 700, color: T.blue, marginBottom: '12px', fontFamily: T.font }}>{title}</div>
    {children}
  </div>
);

const PanelList = ({ items }) => (
  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
    {items.map((item, i) => (
      <li key={i} style={{ padding: '5px 0', fontSize: '13px', color: T.muted2,
        borderBottom: i < items.length - 1 ? `1px solid rgba(74,78,82,0.25)` : 'none',
        fontFamily: T.font }}
        dangerouslySetInnerHTML={{ __html: item }} />
    ))}
  </ul>
);

const TwoCol = ({ left, right }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '12px 0' }}>
    {left}{right}
  </div>
);

// ─── Tab 1: Portfolio (existing property cards) ────────────────────────────
function PortfolioTab({ properties, exchangeRate, displayCurrency, setDisplayCurrency,
  editingProperty, setEditingProperty, selectedProperty, setSelectedProperty,
  realEstateValue, realEstateValueUsd, updatePropertyPrice,
  formatBRL, formatUsdOnly, getCalculatedValue, getTypeIcon }) {

  const formatRealEstate = (v) =>
    displayCurrency === 'USD' ? formatUsdOnly(v / exchangeRate) : formatBRL(v);

  return (
    <div>
      {/* Currency toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px',
          background: 'rgba(18,18,18,0.8)', border: `1px solid rgba(74,78,82,0.4)`, borderRadius: '12px' }}>
          <DollarSign size={15} style={{ color: T.silver }} />
          {['BRL','USD'].map(cur => (
            <button key={cur} onClick={() => setDisplayCurrency(cur)} style={{
              padding: '5px 11px',
              background: displayCurrency === cur ? 'rgba(208,255,0,0.2)' : 'transparent',
              border: displayCurrency === cur ? '1px solid rgba(208,255,0,0.4)' : '1px solid transparent',
              borderRadius: '6px', color: displayCurrency === cur ? T.lime : T.muted,
              cursor: 'pointer', fontFamily: T.font, fontSize: '12px' }}>{cur}</button>
          ))}
        </div>
      </div>

      {/* Summary header */}
      <div style={{ padding: '16px 20px', background: 'rgba(10,10,10,0.5)',
        borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderRadius: '10px 10px 0 0',
        border: `1px solid ${T.border}` }}>
        <h3 style={{ fontSize: '13px', fontFamily: T.font, letterSpacing: '1.5px',
          color: T.silver, margin: 0, textTransform: 'uppercase' }}>
          Property Inventory — Exposure Summary
        </h3>
        <div style={{ fontFamily: T.font, fontSize: '12px', color: T.muted }}>
          Total: <span style={{ color: T.lime, fontWeight: 600 }}>{formatRealEstate(realEstateValue)}</span>
          <span style={{ marginLeft: '8px', fontSize: '11px', color: T.muted }}>
            ({displayCurrency === 'USD' ? formatBRL(realEstateValue) : formatUsdOnly(realEstateValueUsd)})
          </span>
        </div>
      </div>

      {/* Property cards */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px',
        background: 'rgba(18,18,18,0.6)', border: `1px solid ${T.border}`,
        borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
        {properties.map((property) => {
          const calculatedValue = getCalculatedValue(property);
          const isEditing = editingProperty === property.id;
          return (
            <div key={property.id} onClick={() => setSelectedProperty(selectedProperty === property.id ? null : property.id)}
              style={{ background: selectedProperty === property.id ? 'rgba(192,192,192,0.1)' : 'rgba(10,10,10,0.5)',
                border: selectedProperty === property.id ? '1px solid rgba(192,192,192,0.4)' : `1px solid ${T.border2}`,
                borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s ease' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>{getTypeIcon(property.type)}</span>
                  <div>
                    <div style={{ fontWeight: 500, color: T.text, marginBottom: '2px', fontFamily: T.font }}>
                      {property.type}
                      {property.building && <span style={{ color: T.muted2, fontWeight: 400 }}> — {property.building}</span>}
                    </div>
                    <div style={{ fontFamily: T.font, fontSize: '12px', color: T.muted }}>
                      ID: {property.id}{property.matricula && ` • Matrícula: ${property.matricula}`}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 500, color: T.lime }}>{formatRealEstate(calculatedValue)}</div>
                  <div style={{ fontSize: '12px', color: T.muted, fontFamily: T.font }}>
                    {displayCurrency === 'USD' ? formatBRL(calculatedValue) : formatUsdOnly(calculatedValue / exchangeRate)}
                  </div>
                </div>
              </div>

              <div style={{ fontFamily: T.font, fontSize: '13px', color: '#CBD5E1', marginBottom: '10px' }}>
                {property.address}
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                {property.area && (
                  <div style={{ padding: '5px 10px', background: 'rgba(192,192,192,0.1)', borderRadius: '6px',
                    fontFamily: T.font, fontSize: '12px', color: T.silver }}>
                    📐 {property.area} m²
                  </div>
                )}
                {property.area && property.pricePerM2 !== null && (
                  <div onClick={(e) => { e.stopPropagation(); setEditingProperty(property.id); }}
                    style={{ padding: '5px 10px', background: isEditing ? 'rgba(192,192,192,0.2)' : 'rgba(192,192,192,0.1)',
                      border: '1px dashed rgba(192,192,192,0.4)', borderRadius: '6px', fontFamily: T.font,
                      fontSize: '12px', color: T.silver, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    {isEditing ? (
                      <>
                        <span>R$/m²:</span>
                        <input type="number" defaultValue={property.pricePerM2}
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => {
                            if (e.key === 'Enter') updatePropertyPrice(property.id, e.target.value);
                            if (e.key === 'Escape') setEditingProperty(null);
                          }}
                          onBlur={e => updatePropertyPrice(property.id, e.target.value)}
                          autoFocus
                          style={{ width: '65px', padding: '2px 5px', background: 'rgba(10,10,10,0.8)',
                            border: '1px solid rgba(192,192,192,0.4)', borderRadius: '4px',
                            color: T.text, fontSize: '12px', fontFamily: T.font }} />
                      </>
                    ) : (
                      <>
                        <span>R$ {property.pricePerM2?.toLocaleString('pt-BR')}/m²</span>
                        <Edit3 size={10} />
                      </>
                    )}
                  </div>
                )}
                {property.garages && (
                  <div style={{ padding: '5px 10px', background: 'rgba(192,192,192,0.1)', borderRadius: '6px',
                    fontFamily: T.font, fontSize: '12px', color: T.silver }}>
                    🚗 {property.garages} vagas
                  </div>
                )}
                {property.mapsUrl && (
                  <a href={property.mapsUrl} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ padding: '5px 10px', background: 'rgba(208,255,0,0.1)',
                      border: '1px solid rgba(208,255,0,0.3)', borderRadius: '6px',
                      fontFamily: T.font, fontSize: '12px', color: T.lime, textDecoration: 'none',
                      display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={11} /> Google Maps
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Gestão (Inquilinos + Pagamentos + Despesas) ─────────────────────
function GestaoTab({ inquilinos = [], pagamentos = [], despesas = [], formatBRL }) {
  const [sub, setSub] = useState('inquilinos');

  const statusColor = (s) => {
    if (!s) return T.muted2;
    const l = s.toLowerCase();
    if (l === 'ativo' || l === 'recebido') return T.green;
    if (l === 'pendente') return T.yellow;
    if (l === 'vencido' || l === 'atrasado') return T.red;
    return T.muted2;
  };
  const statusBg = (s) => {
    if (!s) return 'rgba(74,78,82,0.15)';
    const l = s.toLowerCase();
    if (l === 'ativo' || l === 'recebido') return 'rgba(34,197,94,0.12)';
    if (l === 'pendente') return 'rgba(245,158,11,0.12)';
    if (l === 'vencido' || l === 'atrasado') return 'rgba(239,68,68,0.12)';
    return 'rgba(74,78,82,0.15)';
  };
  const statusBd = (s) => {
    if (!s) return 'rgba(74,78,82,0.3)';
    const l = s.toLowerCase();
    if (l === 'ativo' || l === 'recebido') return 'rgba(34,197,94,0.3)';
    if (l === 'pendente') return 'rgba(245,158,11,0.3)';
    if (l === 'vencido' || l === 'atrasado') return 'rgba(239,68,68,0.3)';
    return 'rgba(74,78,82,0.3)';
  };

  const SUBS = [
    { id: 'inquilinos', label: 'Inquilinos', icon: Users },
    { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
    { id: 'despesas',   label: 'Despesas',   icon: Wrench },
  ];

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {SUBS.map(s => {
          const Icon = s.icon;
          const active = sub === s.id;
          return (
            <button key={s.id} onClick={() => setSub(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: active ? 'rgba(122,184,255,0.12)' : 'rgba(18,18,18,0.6)',
              border: active ? `1px solid rgba(122,184,255,0.35)` : `1px solid ${T.border}`,
              borderRadius: '8px', cursor: 'pointer', fontFamily: T.font, fontSize: '12px',
              fontWeight: active ? 600 : 400,
              color: active ? T.blue : T.muted2,
              transition: 'all 0.15s ease',
            }}>
              <Icon size={13} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* INQUILINOS */}
      {sub === 'inquilinos' && (
        <div>
          <div style={{ fontSize: '11px', color: T.muted2, marginBottom: '12px', fontFamily: T.font }}>
            {inquilinos.length} contratos registrados
          </div>
          <TableWrap>
            <thead>
              <tr>
                <TH>Imóvel</TH><TH>Inquilino</TH><TH>Telefone</TH><TH>Email</TH>
                <TH>Início</TH><TH>Término</TH><TH>Status</TH>
              </tr>
            </thead>
            <tbody>
              {inquilinos.map((t, i) => (
                <tr key={i}>
                  <TD style={{ color: T.lime, fontWeight: 600 }}>#{t.idImovel}</TD>
                  <TD style={{ color: T.text, fontWeight: 500 }}>{t.nome}</TD>
                  <TD>{t.telefone}</TD>
                  <TD style={{ fontSize: '12px' }}>{t.email}</TD>
                  <TD>{t.dataInicio}</TD>
                  <TD>{t.dataTermino}</TD>
                  <TD>
                    <Badge color={statusColor(t.status)} bg={statusBg(t.status)} border={statusBd(t.status)}>
                      {t.status}
                    </Badge>
                  </TD>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* PAGAMENTOS */}
      {sub === 'pagamentos' && (
        <div>
          {(() => {
            const totalEsperado = pagamentos.reduce((s, p) => s + (p.valorEsperado || 0), 0);
            const totalRecebido = pagamentos.reduce((s, p) => s + (p.valorRecebido || 0), 0);
            const inadimplencia = totalEsperado - totalRecebido;
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Esperado', val: totalEsperado, color: T.silver },
                  { label: 'Recebido', val: totalRecebido, color: T.green },
                  { label: 'Inadimplência', val: inadimplencia, color: inadimplencia > 0 ? T.red : T.green },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ background: 'rgba(18,18,18,0.8)', border: `1px solid ${T.border}`,
                    borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: T.muted2, fontFamily: T.font, marginBottom: '6px' }}>{label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color, fontFamily: T.font }}>
                      {formatBRL ? formatBRL(val) : `R$ ${val.toLocaleString('pt-BR')}`}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          <TableWrap>
            <thead>
              <tr>
                <TH>Imóvel</TH><TH>Mês/Ano</TH><TH>Esperado</TH><TH>Recebido</TH>
                <TH>Data Pgto</TH><TH>Status</TH>
              </tr>
            </thead>
            <tbody>
              {pagamentos.map((p, i) => (
                <tr key={i}>
                  <TD style={{ color: T.lime, fontWeight: 600 }}>#{p.idImovel}</TD>
                  <TD style={{ color: T.text }}>{p.mesAno}</TD>
                  <TD>{p.valorEsperado != null ? `R$ ${p.valorEsperado.toLocaleString('pt-BR')}` : '—'}</TD>
                  <TD style={{ color: p.valorRecebido > 0 ? T.green : T.red }}>
                    {p.valorRecebido != null ? `R$ ${p.valorRecebido.toLocaleString('pt-BR')}` : '—'}
                  </TD>
                  <TD>{p.dataPagamento || '—'}</TD>
                  <TD>
                    <Badge color={statusColor(p.status)} bg={statusBg(p.status)} border={statusBd(p.status)}>
                      {p.status}
                    </Badge>
                  </TD>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* DESPESAS */}
      {sub === 'despesas' && (
        <div>
          {(() => {
            const total = despesas.reduce((s, d) => s + (d.valor || 0), 0);
            return (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(18,18,18,0.8)', border: `1px solid ${T.border}`,
                  borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: T.muted2, fontFamily: T.font, marginBottom: '6px' }}>Total Despesas</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: T.orange, fontFamily: T.font }}>
                    {formatBRL ? formatBRL(total) : `R$ ${total.toLocaleString('pt-BR')}`}
                  </div>
                </div>
                <div style={{ background: 'rgba(18,18,18,0.8)', border: `1px solid ${T.border}`,
                  borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: T.muted2, fontFamily: T.font, marginBottom: '6px' }}>Registros</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: T.text, fontFamily: T.font }}>
                    {despesas.length}
                  </div>
                </div>
              </div>
            );
          })()}
          <TableWrap>
            <thead>
              <tr>
                <TH>Imóvel</TH><TH>Data</TH><TH>Tipo</TH><TH>Descrição</TH><TH>Valor</TH><TH>Fornecedor</TH>
              </tr>
            </thead>
            <tbody>
              {despesas.map((d, i) => (
                <tr key={i}>
                  <TD style={{ color: T.lime, fontWeight: 600 }}>#{d.idImovel}</TD>
                  <TD>{d.data}</TD>
                  <TD>
                    <Badge color={T.orange} bg="rgba(249,115,22,0.1)" border="rgba(249,115,22,0.25)">
                      {d.tipo}
                    </Badge>
                  </TD>
                  <TD style={{ color: T.text }}>{d.descricao}</TD>
                  <TD style={{ color: T.orange, fontWeight: 500 }}>
                    R$ {d.valor?.toLocaleString('pt-BR')}
                  </TD>
                  <TD>{d.fornecedor}</TD>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Financeiro (Monthly Report + Annual ROI + Type Breakdown) ────────
function FinanceiroTab({ relatorioMensal = {}, relatorioAnual = {}, dashboardKpis = {}, formatBRL }) {
  const [sub, setSub] = useState('mensal');
  const fmt = (v) => formatBRL ? formatBRL(v) : `R$ ${(v || 0).toLocaleString('pt-BR')}`;
  const pct = (v) => `${(v ?? 0).toFixed(2)}%`;

  const SUBS = [
    { id: 'mensal',  label: 'Mensal',        icon: CreditCard },
    { id: 'anual',   label: 'Anual / ROI',   icon: TrendingUp },
    { id: 'kpis',    label: 'Dashboard KPIs', icon: BarChart2 },
  ];

  const rentColor = (r) => {
    if (!r) return T.muted2;
    const l = r.toLowerCase();
    if (l === 'excelente') return T.green;
    if (l === 'boa')       return T.blue;
    if (l === 'moderada')  return T.yellow;
    return T.red;
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {SUBS.map(s => {
          const Icon = s.icon;
          const active = sub === s.id;
          return (
            <button key={s.id} onClick={() => setSub(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: active ? 'rgba(208,255,0,0.1)' : 'rgba(18,18,18,0.6)',
              border: active ? `1px solid rgba(208,255,0,0.3)` : `1px solid ${T.border}`,
              borderRadius: '8px', cursor: 'pointer', fontFamily: T.font, fontSize: '12px',
              fontWeight: active ? 600 : 400,
              color: active ? T.lime : T.muted2,
              transition: 'all 0.15s ease',
            }}>
              <Icon size={13} />{s.label}
            </button>
          );
        })}
      </div>

      {/* MENSAL */}
      {sub === 'mensal' && (
        <div>
          <SectionH3>{relatorioMensal.periodo || 'Relatório Mensal'}</SectionH3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Renda Esperada',  val: relatorioMensal.rendaEsperada,  color: T.silver },
              { label: 'Renda Recebida',  val: relatorioMensal.rendaRecebida,  color: T.green },
              { label: 'Inadimplência',   val: relatorioMensal.inadimplencia,  color: T.red },
              { label: 'Despesas',        val: relatorioMensal.despesas,       color: T.orange },
              { label: 'Lucro Líquido',   val: relatorioMensal.lucroLiquido,   color: T.lime },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: 'rgba(18,18,18,0.8)', border: `1px solid ${T.border}`,
                borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: T.muted2, fontFamily: T.font, marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color, fontFamily: T.font }}>
                  {fmt(val)}
                </div>
              </div>
            ))}
          </div>
          {relatorioMensal.rendaEsperada && relatorioMensal.rendaRecebida && (
            <Alert icon="💡" bg="rgba(208,255,0,0.05)" border="rgba(208,255,0,0.2)">
              Taxa de recebimento:{' '}
              <strong style={{ color: T.lime }}>
                {((relatorioMensal.rendaRecebida / relatorioMensal.rendaEsperada) * 100).toFixed(1)}%
              </strong>
              {' '}·{' '}Margem líquida:{' '}
              <strong style={{ color: T.lime }}>
                {((relatorioMensal.lucroLiquido / relatorioMensal.rendaRecebida) * 100).toFixed(1)}%
              </strong>
            </Alert>
          )}
        </div>
      )}

      {/* ANUAL / ROI */}
      {sub === 'anual' && (
        <div>
          <SectionH3>Resumo Anual {relatorioAnual.ano}</SectionH3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Receita Anual',   val: fmt(relatorioAnual.resumo?.receitaAnualEstimada), color: T.green },
              { label: 'Despesas Anuais', val: fmt(relatorioAnual.resumo?.despesasAnuaisEstimadas), color: T.orange },
              { label: 'Lucro Bruto',     val: fmt(relatorioAnual.resumo?.lucrobrutoanual), color: T.lime },
              { label: 'ROI Nominal',     val: pct(relatorioAnual.resumo?.roiNominalPct), color: T.blue },
              { label: `ROI Real (IPCA ${relatorioAnual.ipcaAnual}%)`, val: pct(relatorioAnual.resumo?.roiAjustadoPct), color: relatorioAnual.resumo?.roiAjustadoPct < 0 ? T.red : T.green },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: 'rgba(18,18,18,0.8)', border: `1px solid ${T.border}`,
                borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: T.muted2, fontFamily: T.font, marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color, fontFamily: T.font }}>{val}</div>
              </div>
            ))}
          </div>

          <SectionH3>ROI por Imóvel</SectionH3>
          <TableWrap>
            <thead>
              <tr>
                <TH>ID</TH><TH>Tipo</TH><TH>Aluguel Anual</TH><TH>Valor Venda</TH>
                <TH>ROI Nominal</TH><TH>ROI Real</TH><TH>Rentabilidade</TH>
              </tr>
            </thead>
            <tbody>
              {(relatorioAnual.roiPorImovel || []).map((r, i) => (
                <tr key={i}>
                  <TD style={{ color: T.lime, fontWeight: 600 }}>#{r.id}</TD>
                  <TD style={{ color: T.text }}>{r.tipo}</TD>
                  <TD>{fmt(r.aluguelAnual)}</TD>
                  <TD>{fmt(r.valorVenda)}</TD>
                  <TD style={{ color: r.roiNominalPct > 0 ? T.green : T.muted2, fontWeight: 500 }}>
                    {pct(r.roiNominalPct)}
                  </TD>
                  <TD style={{ color: r.roiAjustadoPct >= 0 ? T.green : T.red, fontWeight: 500 }}>
                    {pct(r.roiAjustadoPct)}
                  </TD>
                  <TD>
                    <Badge color={rentColor(r.rentabilidade)} bg={`${rentColor(r.rentabilidade)}18`} border={`${rentColor(r.rentabilidade)}40`}>
                      {r.rentabilidade}
                    </Badge>
                  </TD>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          {relatorioAnual.resumo?.roiAjustadoPct < 0 && (
            <Alert icon="⚠️" bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.2)">
              <strong style={{ color: T.red }}>ROI real negativo em 2025.</strong>{' '}
              O portfólio rendeu {pct(relatorioAnual.resumo.roiNominalPct)} nominal mas perdeu{' '}
              {pct(Math.abs(relatorioAnual.resumo.roiAjustadoPct))} acima da inflação (IPCA {relatorioAnual.ipcaAnual}%).
              Imóveis com rentabilidade Baixa/Moderada puxam o ROI médio para baixo.
            </Alert>
          )}
        </div>
      )}

      {/* DASHBOARD KPIs */}
      {sub === 'kpis' && (
        <div>
          <SectionH3>Indicadores do Portfólio</SectionH3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Total Imóveis',       val: dashboardKpis.totalImoveis,         color: T.text },
              { label: 'Valor do Portfólio',  val: fmt(dashboardKpis.valorTotalPortfolio), color: T.lime },
              { label: 'Renda Mensal (potencial)', val: fmt(dashboardKpis.rendaMensalEstimada), color: T.silver },
              { label: 'Imóveis Alugados',    val: dashboardKpis.imoveisAlugados,       color: T.green },
              { label: 'Taxa de Ocupação',    val: `${dashboardKpis.taxaOcupacao}%`,    color: T.blue },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: 'rgba(18,18,18,0.8)', border: `1px solid ${T.border}`,
                borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: T.muted2, fontFamily: T.font, marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color, fontFamily: T.font }}>{val}</div>
              </div>
            ))}
          </div>

          <SectionH3>Receita por Tipo</SectionH3>
          <TableWrap>
            <thead><tr><TH>Tipo</TH><TH>Receita Mensal</TH><TH>% do Total</TH></tr></thead>
            <tbody>
              {(dashboardKpis.receitaPorTipo || []).map((r, i) => {
                const total = (dashboardKpis.receitaPorTipo || []).reduce((s, x) => s + x.receitaMensal, 0);
                const pctVal = total > 0 ? ((r.receitaMensal / total) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={i}>
                    <TD style={{ color: T.text, fontWeight: 500 }}>{r.tipo}</TD>
                    <TD style={{ color: T.lime, fontWeight: 600 }}>{fmt(r.receitaMensal)}</TD>
                    <TD>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(74,78,82,0.3)', borderRadius: '3px' }}>
                          <div style={{ width: `${pctVal}%`, height: '100%', background: T.lime, borderRadius: '3px' }} />
                        </div>
                        <span style={{ color: T.muted2, fontSize: '12px', minWidth: '36px' }}>{pctVal}%</span>
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>

          <SectionH3>Top 5 por Rentabilidade Anual</SectionH3>
          <TableWrap>
            <thead><tr><TH>#</TH><TH>Imóvel</TH><TH>Tipo</TH><TH>Aluguel Mensal</TH><TH>Valor Venda</TH><TH>Rentabilidade Anual</TH></tr></thead>
            <tbody>
              {(dashboardKpis.top5Rentabilidade || []).map((r, i) => (
                <tr key={i}>
                  <TD style={{ color: T.lime, fontWeight: 700 }}>#{i + 1}</TD>
                  <TD style={{ color: T.text }}>#{r.id}</TD>
                  <TD>{r.tipo}</TD>
                  <TD style={{ color: T.green, fontWeight: 500 }}>{fmt(r.aluguelMensal)}</TD>
                  <TD>{fmt(r.valorVenda)}</TD>
                  <TD style={{ color: T.green, fontWeight: 600 }}>{pct(r.rentabilidadeAnualPct)}</TD>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Fontes ─────────────────────────────────────────────────────────
function FontesTab() {
  const TypeBadge = ({ type, color, bg }) => (
    <span style={{ display: 'inline-block', borderRadius: '4px', padding: '2px 7px',
      fontSize: '11px', fontWeight: 600, color, background: bg }}>{type}</span>
  );

  const sources = [
    { name: 'ZAP Imóveis', url: 'zapimoveis.com.br', type: 'Listagem', typeColor: '#7ab8ff', typeBg: 'rgba(79,142,247,0.1)', dados: 'Preço, área, tipo, bairro, CEP, fotos, tempo de anúncio', acesso: 'Scraping / API parceira (OLX Group)', rel: 'Alta', pri: 'P1' },
    { name: 'VivaReal', url: 'vivareal.com.br', type: 'Listagem', typeColor: '#7ab8ff', typeBg: 'rgba(79,142,247,0.1)', dados: 'Preço, área, tipo, CEP, geolocalização, dorm/vagas', acesso: 'Scraping (mesma base ZAP/OLX Group)', rel: 'Alta', pri: 'P1' },
    { name: 'OLX Imóveis', url: 'olx.com.br', type: 'Listagem', typeColor: '#7ab8ff', typeBg: 'rgba(79,142,247,0.1)', dados: 'Preço, área, bairro, data de publicação, telefone', acesso: 'Scraping HTML / app mobile', rel: 'Média', pri: 'P1' },
    { name: 'QuintoAndar', url: 'quintoandar.com', type: 'Listagem', typeColor: '#7ab8ff', typeBg: 'rgba(79,142,247,0.1)', dados: 'Aluguel + venda; área, condomínio, localização precisa', acesso: 'Scraping (JS-heavy, Playwright)', rel: 'Alta', pri: 'P2' },
    { name: 'Imovelweb', url: 'imovelweb.com.br', type: 'Listagem', typeColor: '#7ab8ff', typeBg: 'rgba(79,142,247,0.1)', dados: 'Preço, área, tipo, bairro (cobertura de imobiliárias locais)', acesso: 'Scraping HTML', rel: 'Média', pri: 'P2' },
    { name: 'CRECI-SP', url: 'crecisp.gov.br', type: 'Registro', typeColor: '#5eead4', typeBg: 'rgba(20,207,198,0.1)', dados: 'Cadastro de imobiliárias ativas em Campinas, relatórios regionais', acesso: 'Manual / download PDF', rel: 'Média', pri: 'P3' },
    { name: 'Cartório RGI Campinas', url: 'rgi.com.br / ONR', type: 'Cartório', typeColor: '#5eead4', typeBg: 'rgba(20,207,198,0.1)', dados: 'Transações reais de compra/venda (valor declarado), matrículas', acesso: 'API ONR — custo por consulta', rel: 'Muito Alta', pri: 'P2' },
    { name: 'Prefeitura Campinas — IPTU', url: 'campinas.sp.gov.br', type: 'Gov', typeColor: '#a78bfa', typeBg: 'rgba(124,92,252,0.1)', dados: 'Valor venal por CEP, planta genérica de valores (PGV)', acesso: 'Portal de dados abertos / shapefile', rel: 'Alta', pri: 'P2' },
    { name: 'FIPE ZAP+ Index', url: 'fipezap.zapimoveis.com.br', type: 'Índice', typeColor: '#fdba74', typeBg: 'rgba(249,115,22,0.1)', dados: 'Variação mensal R$/m² por cidade e tipo; série histórica', acesso: 'Download CSV gratuito', rel: 'Alta', pri: 'P1' },
    { name: 'ABECIP IGMI-R', url: 'abecip.org.br', type: 'Índice', typeColor: '#fdba74', typeBg: 'rgba(249,115,22,0.1)', dados: 'Índice Geral do Mercado Imobiliário Residencial — séries estaduais', acesso: 'Download PDF/Excel mensal', rel: 'Alta', pri: 'P2' },
    { name: 'FGV IVAR', url: 'portalibre.fgv.br', type: 'Índice', typeColor: '#fdba74', typeBg: 'rgba(249,115,22,0.1)', dados: 'Índice de Variação de Aluguéis Residenciais — mensal', acesso: 'Download Excel', rel: 'Alta', pri: 'P2' },
    { name: 'Imobiliárias Locais', url: 'Lopes, RE/MAX, Graal', type: 'Local', typeColor: '#86efac', typeBg: 'rgba(34,197,94,0.1)', dados: 'Listagens exclusivas, preço de fechamento (negociação direta)', acesso: 'Scraping individual + contato direto', rel: 'Média', pri: 'P3' },
  ];

  const relColor = { 'Alta': T.green, 'Muito Alta': T.green, 'Média': T.yellow };
  const relBg   = { 'Alta': 'rgba(34,197,94,0.12)', 'Muito Alta': 'rgba(34,197,94,0.12)', 'Média': 'rgba(245,158,11,0.12)' };
  const relBd   = { 'Alta': 'rgba(34,197,94,0.25)', 'Muito Alta': 'rgba(34,197,94,0.25)', 'Média': 'rgba(245,158,11,0.25)' };

  return (
    <div>
      <TableWrap>
        <thead>
          <tr>
            <TH>Fonte</TH>
            <TH>Tipo</TH>
            <TH>Dados Fornecidos</TH>
            <TH>Acesso</TH>
            <TH>Confiabilidade</TH>
            <TH>Prioridade</TH>
          </tr>
        </thead>
        <tbody>
          {sources.map((s, i) => (
            <tr key={i}>
              <TD style={{ color: T.text }}>
                <strong style={{ color: T.text }}>{s.name}</strong>
                <br /><small style={{ color: T.muted, fontSize: '11px' }}>{s.url}</small>
              </TD>
              <TD><TypeBadge type={s.type} color={s.typeColor} bg={s.typeBg} /></TD>
              <TD>{s.dados}</TD>
              <TD>{s.acesso}</TD>
              <TD><Badge color={relColor[s.rel]} bg={relBg[s.rel]} border={relBd[s.rel]}>{s.rel}</Badge></TD>
              <TD><Badge color={T.blue} bg={T.blueB} border={T.blueBB}>{s.pri}</Badge></TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <Alert icon="ℹ️" bg="rgba(79,142,247,0.06)" border="rgba(79,142,247,0.2)">
        <strong style={{ color: T.text }}>Deduplicação crítica:</strong>{' '}
        ZAP e VivaReal compartilham base (OLX Group). Use o campo <code style={{ background: 'rgba(74,78,82,0.3)', padding: '1px 5px', borderRadius: '3px', fontSize: '11.5px', color: '#98c379' }}>id_anuncio</code> + hash de (endereço, área, preço) para identificar duplicatas entre os dois portais antes de qualquer agregação.
      </Alert>
    </div>
  );
}

// ─── Tab 3: Preço/m² ──────────────────────────────────────────────────────
function PrecoTab() {
  return (
    <div>
      <SectionH3>Fórmula Base</SectionH3>
      <FormulaBox
        title="Fórmula de Preço/m² por Listagem"
        formula={`ppm2_i = preco_total_i / area_util_i

ppm2_cep = mediana({ ppm2_i : CEP_i = cep, tipo_i = tipo, |z_score(ppm2_i)| < 2.5 })`}
        legend={`<b style="color:#e2e8f0">ppm2_i</b> = preço/m² do anúncio individual i (R$/m²)<br>
<b style="color:#e2e8f0">preco_total_i</b> = preço pedido do anúncio (R$)<br>
<b style="color:#e2e8f0">area_util_i</b> = área útil em m² (preferência sobre área total quando disponível)<br>
<b style="color:#e2e8f0">ppm2_cep</b> = mediana ajustada por CEP e tipo, após remoção de outliers (z-score > 2.5)<br>
<b style="color:#e2e8f0">Mediana</b> preferida sobre média por robustez a anúncios com preços atípicos`}
      />

      <SectionH3>Normalização e Limpeza</SectionH3>
      <TwoCol
        left={
          <Panel title="Regras de Filtro">
            <PanelList items={[
              '<b style="color:#e2e8f0">Área mínima:</b> apartamento ≥ 20m², casa ≥ 40m²',
              '<b style="color:#e2e8f0">Área máxima:</b> apartamento ≤ 500m², casa ≤ 2.000m²',
              '<b style="color:#e2e8f0">Preço mínimo:</b> R$ 60.000 (abaixo = dado suspeito)',
              '<b style="color:#e2e8f0">Preço máximo:</b> R$ 30.000.000 (acima = segmento alto)',
              '<b style="color:#e2e8f0">Outlier R$/m²:</b> excluir se z-score > 2.5 dentro do grupo CEP+tipo',
              '<b style="color:#e2e8f0">Duplicatas:</b> hash(CEP+área+quartos+preço) → manter 1 por semana',
            ]} />
          </Panel>
        }
        right={
          <Panel title="Campos Obrigatórios">
            <PanelList items={[
              '<b style="color:#e2e8f0">preco_total</b> — valor numérico em R$',
              '<b style="color:#e2e8f0">area_util</b> — m² (aceitar area_total se util ausente, com flag)',
              '<b style="color:#e2e8f0">tipo</b> — {apartamento, casa, terreno, comercial}',
              '<b style="color:#e2e8f0">cep</b> — 8 dígitos (validar via ViaCEP API)',
              '<b style="color:#e2e8f0">bairro</b> — normalizado via tabela de-para (CEP → bairro oficial)',
              '<b style="color:#e2e8f0">data_coleta</b> — timestamp ISO 8601 · <b style="color:#e2e8f0">fonte</b> — portal',
            ]} />
          </Panel>
        }
      />

      <SectionH3>Pipeline de Dados (Python)</SectionH3>
      <CodeBlock>{`# Pipeline de extração e normalização — Campinas/SP
# Dependências: requests, beautifulsoup4, pandas, sqlalchemy

import pandas as pd
import numpy  as np
from scipy import stats
import requests

# ── 1. COLETA ─────────────────────────────────────────────────────────
def scrape_zapimoveis(cidade="campinas-sp", tipo="apartamentos", paginas=50):
    """Retorna lista de dicts com campos normalizados."""
    base_url = f"https://www.zapimoveis.com.br/venda/{tipo}/{cidade}/"
    headers  = {"User-Agent": "Mozilla/5.0 ...", "Accept-Language": "pt-BR"}
    listings = []
    for page in range(1, paginas + 1):
        # Parse JSON embutido no __NEXT_DATA__ da página
        r    = requests.get(f"{base_url}?pagina={page}", headers=headers, timeout=15)
        data = extract_next_data(r.text)    # parse do script JSON
        listings.extend(parse_listings(data))
    return listings

# ── 2. NORMALIZAÇÃO ───────────────────────────────────────────────────
def normalize(df: pd.DataFrame) -> pd.DataFrame:
    df["preco"] = pd.to_numeric(df["preco"].str.replace(r"[R$\.\\s]","",regex=True), errors="coerce")
    df["area"]  = pd.to_numeric(df["area"].str.replace(r"[m²\\s]","",regex=True),  errors="coerce")
    df = df.dropna(subset=["preco","area","cep"])
    df = df[(df["preco"] > 60_000) & (df["preco"] < 30_000_000)]
    df = df[(df["area"]  > 15)     & (df["area"]  < 2_000)]
    df["ppm2"] = df["preco"] / df["area"]
    return df

# ── 3. REMOÇÃO DE OUTLIERS POR GRUPO ──────────────────────────────────
def remove_outliers(df, grupo=["cep","tipo"], threshold=2.5):
    def zscore_filter(g):
        z = np.abs(stats.zscore(g["ppm2"].dropna()))
        return g[z < threshold]
    return df.groupby(grupo, group_keys=False).apply(zscore_filter)

# ── 4. AGREGAÇÃO POR CEP ──────────────────────────────────────────────
def aggregate_by_cep(df) -> pd.DataFrame:
    return (
        df.groupby(["cep","bairro","tipo"])
          .agg(
              ppm2_mediana = ("ppm2",  "median"),
              ppm2_p25     = ("ppm2",  lambda x: x.quantile(0.25)),
              ppm2_p75     = ("ppm2",  lambda x: x.quantile(0.75)),
              n_anuncios   = ("ppm2",  "count"),
              preco_min    = ("preco", "min"),
              preco_max    = ("preco", "max"),
          )
          .reset_index()
    )`}</CodeBlock>

      <SectionH3>Estratégia de Agregação por Granularidade</SectionH3>
      <TableWrap>
        <thead><tr>
          <TH>Nível</TH><TH>Agrupamento</TH><TH>Mínimo de amostras</TH>
          <TH>Métrica principal</TH><TH>Atualização</TH>
        </tr></thead>
        <tbody>
          {[
            ['Rua',    'logradouro + tipo',       '≥ 5 anúncios ativos', 'Mediana ppm2 + variação 30d',             'Semanal'],
            ['CEP',    'CEP (8 dígitos) + tipo',  '≥ 10 anúncios',       'Mediana + P25/P75 + série histórica',      'Semanal'],
            ['Bairro', 'bairro_normalizado + tipo','≥ 20 anúncios',       'Mediana + tendência 90d',                  'Quinzenal'],
            ['Cidade', 'Campinas + tipo',          'Sem mínimo',          'Mediana + comparativo FIPE ZAP+',          'Mensal'],
          ].map(([n,g,m,met,at]) => (
            <tr key={n}>
              <TD style={{ color: T.text }}><strong style={{ color: T.text }}>{n}</strong></TD>
              <TD>{g}</TD><TD>{m}</TD><TD>{met}</TD><TD>{at}</TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <Alert icon="⚠️" bg="rgba(245,158,11,0.07)" border="rgba(245,158,11,0.2)">
        <strong style={{ color: '#fcd34d' }}>Área útil vs. área total:</strong>{' '}
        ZAP e VivaReal frequentemente misturam os dois campos. Sempre registre qual foi usado (<code style={{ background: 'rgba(74,78,82,0.3)', padding: '1px 5px', borderRadius: '3px', fontSize: '11.5px', color: '#98c379' }}>area_flag: "util" | "total"</code>) e aplique fator de correção de 0.85–0.90 quando apenas área total estiver disponível para apartamentos.
      </Alert>
    </div>
  );
}

// ─── Tab 4: MPI ────────────────────────────────────────────────────────────
function MpiTab() {
  const mpiZones = [
    { range: '0–20',   label: '❄️ Mercado Frio',        desc: 'Excesso de oferta; preços em queda ou estáveis; imóveis demoram >120 dias', bg: 'rgba(79,142,247,0.15)',  lc: '#93c5fd' },
    { range: '21–40',  label: '🟢 Oferta Equilibrada',   desc: 'Equilíbrio leve de oferta; comprador tem poder de negociação',             bg: 'rgba(34,197,94,0.12)',   lc: '#86efac' },
    { range: '41–60',  label: '🟡 Mercado Neutro',       desc: 'Oferta e demanda balanceadas; negociações típicas de 5–10% de desconto',   bg: 'rgba(245,158,11,0.12)',  lc: '#fcd34d' },
    { range: '61–80',  label: '🟠 Mercado Aquecido',     desc: 'Demanda supera oferta; imóveis saem em <45 dias; poucos descontos',        bg: 'rgba(249,115,22,0.15)',  lc: '#fdba74' },
    { range: '81–100', label: '🔴 Alta Pressão',         desc: 'Mercado muito competitivo; guerras de preço; imóveis saem em <15 dias',    bg: 'rgba(239,68,68,0.15)',   lc: '#f87171' },
  ];

  const components = [
    ['S1 — Estoque',       'N° anúncios ativos',           '1 - normalize(n_ativos) — Menos estoque = mais pressão',       'Estoque baixo vs. média histórica (6 meses)'],
    ['S2 — Novos anúncios','Novos listings/semana',        '1 - normalize(novos_7d)',                                       'Pouca reposição de oferta'],
    ['S3 — Tempo on-market','Dias médios até remoção',     '1 - normalize(dom_mediano) — DoM = Days on Market',            'Anúncios saem rápido (< 30 dias)'],
    ['D1 — Absorção',      'Taxa de remoção semanal',      'normalize(removidos / ativos)',                                 'Alta taxa de saída de anúncios'],
    ['D2 — Pressão preço', '% anúncios com preço aumentado','normalize(n_aumentos / n_total)',                             'Proprietários subindo preço = confiança'],
    ['D3 — Redução zero',  '% anúncios sem desconto',      'normalize(1 - taxa_reducao)',                                  'Sem descontos = demanda forte'],
    ['V — Velocidade',     'Absorption Rate mensal',       'normalize(vendas_estimadas / estoque)',                        'Absorção > 20% ao mês = mercado quente'],
    ['P — Tendência',      'Variação R$/m² 30d',           'normalize(delta_ppm2_30d)',                                    'Preço subindo > 2% no mês'],
  ];

  return (
    <div>
      <p style={{ color: T.muted2, fontSize: '13px', fontFamily: T.font, lineHeight: 1.7, marginBottom: '4px' }}>
        O MPI é uma pontuação de 0 a 100 que sintetiza sinais de oferta e demanda em um mercado local (nível CEP ou bairro).
        Scores altos = mercado aquecido (vendedores no controle). Scores baixos = excesso de oferta (compradores no controle).
      </p>

      <SectionH3>Fórmula do MPI</SectionH3>
      <FormulaBox
        title="Market Pressure Index — Fórmula Composta"
        formula="MPI = 0.35 × S_score + 0.35 × D_score + 0.20 × V_score + 0.10 × P_score"
        legend={`<b style="color:#e2e8f0">S_score</b> (Supply Score) = sinal de oferta normalizado 0–100<br>
<b style="color:#e2e8f0">D_score</b> (Demand Score) = sinal de demanda normalizado 0–100<br>
<b style="color:#e2e8f0">V_score</b> (Velocity Score) = velocidade de absorção do mercado<br>
<b style="color:#e2e8f0">P_score</b> (Price Score) = tendência de preço recente<br>
<b style="color:#e2e8f0">Pesos:</b> Supply e Demand têm peso igual e dominante (70% juntos); ajustáveis por contexto`}
      />

      <SectionH3>Componentes Detalhados</SectionH3>
      <TableWrap>
        <thead><tr>
          <TH>Componente</TH><TH>Variável</TH><TH>Cálculo</TH><TH>Sinal → Pressão Alta</TH>
        </tr></thead>
        <tbody>
          {components.map(([comp, varv, calc, sinal]) => (
            <tr key={comp}>
              <TD style={{ color: T.text }}><strong style={{ color: T.text }}>{comp}</strong></TD>
              <TD>{varv}</TD>
              <TD><code style={{ background: 'rgba(74,78,82,0.25)', padding: '1px 5px', borderRadius: '3px', fontSize: '11px', color: '#98c379' }}>{calc}</code></TD>
              <TD>{sinal}</TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <SectionH3>Normalização dos Sub-scores</SectionH3>
      <FormulaBox
        title="Min-Max Normalização com Winsorizing"
        formula={`normalize(x) = (x_w - min_hist) / (max_hist - min_hist)

x_w = clip(x, percentil_5, percentil_95)`}
        legend={`<b style="color:#e2e8f0">min_hist</b> e <b style="color:#e2e8f0">max_hist</b> = valores de referência dos últimos 12 meses para o mesmo CEP/bairro<br>
<b style="color:#e2e8f0">Winsorizing</b> (clip ao P5–P95) evita que eventos extremos distorçam a escala<br>
<b style="color:#e2e8f0">Resultado:</b> cada sub-score entre 0 (sem pressão) e 1 (máxima pressão)`}
      />

      <SectionH3>Escala de Interpretação</SectionH3>
      <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${T.border}`, margin: '12px 0' }}>
        {mpiZones.map(z => (
          <div key={z.range} style={{ flex: 1, padding: '14px 10px', textAlign: 'center', background: z.bg }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: T.text }}>{z.range}</div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '4px', color: z.lc }}>{z.label}</div>
            <div style={{ fontSize: '11px', color: T.muted2, marginTop: '4px', fontFamily: T.font }}>{z.desc}</div>
          </div>
        ))}
      </div>

      <SectionH3>Código de Cálculo (Python)</SectionH3>
      <CodeBlock>{`import pandas as pd
import numpy  as np

def winsorize_normalize(series, hist_df, col):
    """Normaliza com base no histórico de 12 meses."""
    p5  = hist_df[col].quantile(0.05)
    p95 = hist_df[col].quantile(0.95)
    clipped = np.clip(series, p5, p95)
    return (clipped - p5) / (p95 - p5 + 1e-9)

def compute_mpi(current: pd.Series, hist: pd.DataFrame) -> float:
    # Supply Score (alta = pouca oferta = mais pressão)
    s1 = 1 - winsorize_normalize(current["n_ativos"],    hist, "n_ativos")
    s2 = 1 - winsorize_normalize(current["novos_7d"],    hist, "novos_7d")
    s3 = 1 - winsorize_normalize(current["dom_mediano"], hist, "dom_mediano")
    S_score = (s1 + s2 + s3) / 3

    # Demand Score (alta = absorção forte = mais pressão)
    d1 = winsorize_normalize(current["taxa_absorcao"], hist, "taxa_absorcao")
    d2 = winsorize_normalize(current["pct_aumentos"],  hist, "pct_aumentos")
    d3 = 1 - winsorize_normalize(current["taxa_reducao"], hist, "taxa_reducao")
    D_score = (d1 + d2 + d3) / 3

    # Velocity + Price Trend
    V_score = winsorize_normalize(current["absorption_rate"], hist, "absorption_rate")
    P_score = winsorize_normalize(current["delta_ppm2_30d"],  hist, "delta_ppm2_30d")

    # MPI final (0–100)
    mpi = (0.35 * S_score + 0.35 * D_score + 0.20 * V_score + 0.10 * P_score) * 100
    return round(mpi, 1)`}</CodeBlock>
    </div>
  );
}

// ─── Tab 5: Arquitetura ───────────────────────────────────────────────────
function ArquiteturaTab() {
  return (
    <div>
      <SectionH3>Diagrama de Arquitetura</SectionH3>
      <CodeBlock>{`╔══════════════════════════════════════════════════════════════════╗
║                    CAMADA DE INGESTÃO                           ║
╚══════════════════════════════════════════════════════════════════╝

  [ZAP/VivaReal] ──→ [Scrapy Spider]          # Python scrapy + rotating proxies
  [OLX Imóveis]  ──→ [Playwright]             # JS-rendered pages
  [FIPE ZAP+ CSV]──→ [CSV Downloader]         # download automático mensal
  [IPTU Prefeitura]→ [GeoJSON Parser]         # Planta Genérica de Valores
  [ONR / Cartório]──→ [API Client]            # transações reais (custo por query)
                          │
                          ▼
╔══════════════════════════════════════════════════════════════════╗
║                  CAMADA DE PROCESSAMENTO                        ║
╚══════════════════════════════════════════════════════════════════╝

  [Raw Collector]
      ├──→ [Validador]        # schema check, tipo, CEP via ViaCEP
      ├──→ [Deduplicador]     # hash(CEP+área+quartos+preço)
      ├──→ [Normalizador]     # R$/m², area_flag, tipo padronizado
      ├──→ [Outlier Remover]  # z-score > 2.5 por grupo CEP+tipo
      └──→ [MPI Calculator]   # S_score, D_score, V_score, P_score
                          │
                          ▼
╔══════════════════════════════════════════════════════════════════╗
║                    CAMADA DE ARMAZENAMENTO                      ║
╚══════════════════════════════════════════════════════════════════╝

  [PostgreSQL + PostGIS]
      ├── listings_raw         # todos os anúncios coletados
      ├── listings_clean       # pós-normalização e dedup
      ├── ppm2_snapshot_weekly # série histórica por CEP+tipo
      ├── mpi_snapshot_weekly  # MPI por CEP+tipo por semana
      └── geo_campinas         # polígonos de bairros e CEPs
                          │
                          ▼
╔══════════════════════════════════════════════════════════════════╗
║                    CAMADA DE VISUALIZAÇÃO                       ║
╚══════════════════════════════════════════════════════════════════╝

  [Looker Studio]   # dashboard principal (gratuito, conecta ao PostgreSQL)
  [Kepler.gl]       # mapa geoespacial de calor de preços
  [HTML estático]   # relatório semanal gerado automaticamente
                          │
                          ▼
╔══════════════════════════════════════════════════════════════════╗
║                    CAMADA DE ALERTAS                            ║
╚══════════════════════════════════════════════════════════════════╝

  [Python alerter] ──→ [Email / WhatsApp API]
  Triggers:
      • ppm2 variação > ±5% em 7 dias num CEP
      • MPI cruza limiar (e.g., 60→61 ou 40→39)
      • Queda abrupta de estoque (>20% em 7d)
      • Novo anúncio com ppm2 >15% abaixo da mediana do CEP`}</CodeBlock>

      <SectionH3>Opção No-Code (Google Sheets + Make.com)</SectionH3>
      <TwoCol
        left={
          <Panel title="Componentes No-Code">
            <PanelList items={[
              '<b style="color:#e2e8f0">Phantombuster:</b> scraping de ZAP/VivaReal → Google Sheets',
              '<b style="color:#e2e8f0">Make.com:</b> orquestração de fluxo (trigger semanal)',
              '<b style="color:#e2e8f0">Google Sheets:</b> tabela central de anúncios + fórmulas de ppm2',
              '<b style="color:#e2e8f0">Looker Studio:</b> dashboard conectado ao Sheets',
              '<b style="color:#e2e8f0">ViaCEP API:</b> enriquecimento de bairro via IMPORTDATA()',
              '<b style="color:#e2e8f0">Gmail / WhatsApp Business:</b> alertas via Make.com',
            ]} />
          </Panel>
        }
        right={
          <Panel title="Fórmulas Google Sheets — ppm2">
            <PanelList items={[
              '<b style="color:#e2e8f0">Preço/m²:</b> =B2/C2 (preço/área)',
              '<b style="color:#e2e8f0">Mediana CEP:</b> =MEDIAN(IF(F:F=F2,D:D))',
              '<b style="color:#e2e8f0">Outlier flag:</b> =IF(ABS((D2-MEDIAN(D:D))/STDEV(D:D))>2.5,"outlier","")',
              '<b style="color:#e2e8f0">Variação 30d:</b> =(mediana_atual-mediana_30d)/mediana_30d',
              '<b style="color:#e2e8f0">MPI simples:</b> Score ponderado manual por 4 colunas de input',
            ]} />
          </Panel>
        }
      />
    </div>
  );
}

// ─── Tab 6: Automação ──────────────────────────────────────────────────────
function AutomacaoTab() {
  const freqItems = [
    { freq: 'Diário', title: 'Varredura de Alertas', items: 'Variações bruscas de preço, remoção de anúncios, novos listings abaixo da mediana' },
    { freq: 'Semanal', title: 'Atualização de Listing', items: 'Scraping completo ZAP + VivaReal + OLX. Recalculação de ppm2 e MPI por CEP' },
    { freq: 'Quinzenal', title: 'Relatório de Bairro', items: 'Consolidação por bairro, tendência 30/90d, comparativo entre bairros de Campinas' },
    { freq: 'Mensal', title: 'Benchmarking', items: 'Atualização FIPE ZAP+, IGMI-R, IVAR. Validação cruzada entre fontes. Relatório gerencial' },
  ];

  const alerts = [
    { name: 'Queda de Preço',      trigger: 'ppm2 mediana do CEP cai > 5% em 7 dias',                   canal: 'Email + Dashboard',          sev: 'Médio',   sc: T.yellow, sb: 'rgba(245,158,11,0.12)', sbd: 'rgba(245,158,11,0.25)' },
    { name: 'Alta de Preço',       trigger: 'ppm2 mediana do CEP sobe > 5% em 7 dias',                  canal: 'Email + Dashboard',          sev: 'Médio',   sc: T.yellow, sb: 'rgba(245,158,11,0.12)', sbd: 'rgba(245,158,11,0.25)' },
    { name: 'Oportunidade',        trigger: 'Novo anúncio com ppm2 > 15% abaixo da mediana do CEP',     canal: 'WhatsApp / Email imediato',  sev: 'Alto',    sc: T.green,  sb: 'rgba(34,197,94,0.12)',   sbd: 'rgba(34,197,94,0.25)' },
    { name: 'Explosão de Demanda', trigger: 'Taxa de remoção semanal > 30% do estoque (MPI spike)',     canal: 'Email + Dashboard',          sev: 'Alto',    sc: T.green,  sb: 'rgba(34,197,94,0.12)',   sbd: 'rgba(34,197,94,0.25)' },
    { name: 'Colapso de Oferta',   trigger: 'Estoque do CEP cai > 20% em 7 dias',                       canal: 'Dashboard',                  sev: 'Médio',   sc: T.yellow, sb: 'rgba(245,158,11,0.12)', sbd: 'rgba(245,158,11,0.25)' },
    { name: 'MPI Limiar',          trigger: 'MPI cruza 40 ou 60 (mudança de zona)',                      canal: 'Email semanal',              sev: 'Baixo',   sc: T.red,    sb: 'rgba(239,68,68,0.12)',   sbd: 'rgba(239,68,68,0.25)' },
    { name: 'Dados Escassos',      trigger: 'CEP com < 5 anúncios na semana (confiabilidade baixa)',    canal: 'Dashboard (flag visual)',    sev: 'Info',    sc: T.blue,   sb: T.blueB,                  sbd: T.blueBB },
  ];

  return (
    <div>
      <SectionH3>Frequência de Atualização</SectionH3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px,1fr))', gap: '12px', margin: '12px 0' }}>
        {freqItems.map(f => (
          <div key={f.freq} style={{ background: 'rgba(18,18,18,0.8)', border: `1px solid ${T.border}`,
            borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#a78bfa', fontFamily: T.font }}>{f.freq}</div>
            <div style={{ color: T.text, fontSize: '13px', fontWeight: 600, marginTop: '4px', fontFamily: T.font }}>{f.title}</div>
            <div style={{ color: T.muted2, fontSize: '12px', marginTop: '6px', fontFamily: T.font, lineHeight: 1.6 }}>{f.items}</div>
          </div>
        ))}
      </div>

      <SectionH3>Sistema de Alertas</SectionH3>
      <TableWrap>
        <thead><tr><TH>Alerta</TH><TH>Gatilho</TH><TH>Canal</TH><TH>Severidade</TH></tr></thead>
        <tbody>
          {alerts.map(a => (
            <tr key={a.name}>
              <TD style={{ color: T.text }}><strong style={{ color: T.text }}>{a.name}</strong></TD>
              <TD>{a.trigger}</TD>
              <TD>{a.canal}</TD>
              <TD><Badge color={a.sc} bg={a.sb} border={a.sbd}>{a.sev}</Badge></TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <SectionH3>Estrutura do Dashboard de KPIs</SectionH3>
      <CodeBlock>{`┌─────────────────────────────────────────────────────────────────┐
│  MONITOR IMOBILIÁRIO — CAMPINAS/SP          [Data: semana atual] │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│ R$/m² Median │ Δ 7 dias     │ MPI Score    │ Estoque Ativo      │
│  R$ 8.240    │  +1.2% ▲     │  67 / 100    │  1.847 anúncios    │
│  Apartamentos│  (campinas)  │  🟠 Aquecido  │  Δ -8% 7d          │
├──────────────┴──────────────┴──────────────┴────────────────────┤
│  MAPA DE CALOR — R$/m² por CEP                                   │
│  [Kepler.gl ou Looker Studio heatmap por polígono de CEP]        │
├───────────────────────────────┬─────────────────────────────────┤
│  TOP 5 CEPs — MAIOR R$/m²     │  TOP 5 CEPs — MAIOR MPI          │
│  13025-XXX: R$ 11.200         │  13070-161:  MPI 78              │
│  13015-XXX: R$ 10.800         │  13025-XXX:  MPI 74              │
│  13070-XXX: R$  9.600         │  13015-XXX:  MPI 69              │
│  ...                          │  ...                             │
├───────────────────────────────┴─────────────────────────────────┤
│  SÉRIE HISTÓRICA ppm2 (12 meses) — por tipo e bairro             │
│  [Linha: Apartamento | Casa | Comparativo FIPE ZAP+ Campinas]    │
├─────────────────────────────────────────────────────────────────┤
│  ALERTAS ATIVOS: 2 oportunidades detectadas │ 1 MPI limiar       │
└─────────────────────────────────────────────────────────────────┘`}</CodeBlock>
    </div>
  );
}

// ─── Tab 7: Plano de Ação ─────────────────────────────────────────────────
function PlanoTab() {
  const steps = [
    { n: 1, title: 'Semana 1 — Infra & Fonte FIPE ZAP+', body: 'Configurar VPS (Ubuntu 22), PostgreSQL com PostGIS, e ambiente Python (scrapy, pandas, sqlalchemy). Baixar série histórica FIPE ZAP+ para Campinas e popular tabela de referência. Validar pipeline de transformação básica.' },
    { n: 2, title: 'Semana 2 — Spider ZAP + VivaReal', body: 'Desenvolver e testar spiders Scrapy para ZAP e VivaReal com rotação de proxies. Implementar parser do __NEXT_DATA__ JSON embutido (mais estável que HTML scraping). Criar módulo de deduplicação. Meta: >1.000 anúncios de Campinas na primeira coleta.' },
    { n: 3, title: 'Semana 3 — Normalização + cálculo ppm2', body: 'Implementar pipeline de normalização completo: validação de CEP via ViaCEP API, normalização de área, remoção de outliers por z-score. Calcular e persistir snapshot semanal de ppm2 por CEP+tipo. Adicionar spider OLX e QuintoAndar.' },
    { n: 4, title: 'Semana 4 — Motor MPI', body: 'Implementar e calibrar o modelo MPI. Construir histórico de 4 semanas coletando manualmente (ou importando dados da FIPE) para calibrar os min/max de normalização. Validar scores contra percepção qualitativa do mercado de Campinas.' },
    { n: 5, title: 'Semana 5 — Dashboard + Looker Studio', body: 'Conectar PostgreSQL ao Looker Studio via BigQuery connector ou pg_connector. Construir dashboard com KPIs principais, mapa de calor (Kepler.gl ou Looker Studio Maps), série histórica e tabela de alertas ativos.' },
    { n: 6, title: 'Semana 6 — Automação e Alertas', body: 'Configurar cron jobs semanais e diários. Implementar módulo de alertas com envio via Gmail API ou WhatsApp Business API. Testar pipeline end-to-end. Documentar thresholds de alertas com base nas primeiras 4 semanas de dados.' },
    { n: 7, title: 'Mês 2–3 — Enriquecimento', body: 'Integrar dados IPTU/Planta Genérica de Valores da Prefeitura de Campinas para validação cruzada de R$/m². Configurar consultas ONR para transações reais (ground-truth). Refinar pesos do MPI com pelo menos 8 semanas de histórico.' },
  ];

  const stack = [
    ['Scraping',       'Scrapy + Playwright',          'Scrapy para HTML estático; Playwright para JS-heavy (QuintoAndar)',     'Gratuito'],
    ['Proxies',        'BrightData ou ScraperAPI',     'Rotação de IP para evitar bloqueio nos portais',                        '~R$ 150–300'],
    ['Processamento',  'Python (pandas, numpy, scipy)','Ecossistema consolidado para análise de dados',                         'Gratuito'],
    ['Banco de dados', 'PostgreSQL + PostGIS',         'SQL robusto + suporte geoespacial nativo',                              '~R$ 50 (VPS)'],
    ['Orquestração',   'Apache Airflow (ou cron)',     'DAGs semanais; cron para MVP inicial',                                  'Gratuito'],
    ['Dashboard',      'Looker Studio + Kepler.gl',    'Gratuito; Looker para KPIs; Kepler para mapas de calor',               'Gratuito'],
    ['Alertas',        'Python + Gmail API / Make.com','Gmail API gratuita; Make.com para no-code triggers',                   '~R$ 0–100'],
    ['CEP enrichment', 'ViaCEP API',                   'API pública gratuita para validar e enriquecer CEPs',                  'Gratuito'],
  ];

  return (
    <div>
      <TwoCol
        left={
          <Panel title="Opção A — No-Code (2–3 semanas)">
            <PanelList items={[
              '<b style="color:#e2e8f0">Custo:</b> ~R$ 200–400/mês (Phantombuster + Make.com + proxies)',
              '<b style="color:#e2e8f0">Habilidade:</b> Google Sheets avançado',
              '<b style="color:#e2e8f0">Limitação:</b> Volume de dados < 5.000 anúncios/semana; sem geoespacial avançado',
              '<b style="color:#e2e8f0">Ideal para:</b> validação inicial do modelo antes de escalar',
            ]} />
          </Panel>
        }
        right={
          <Panel title="Opção B — Python/Code (4–6 semanas)">
            <PanelList items={[
              '<b style="color:#e2e8f0">Custo:</b> ~R$ 100–200/mês (VPS + proxies)',
              '<b style="color:#e2e8f0">Habilidade:</b> Python intermediário, SQL, Docker básico',
              '<b style="color:#e2e8f0">Capacidade:</b> 50.000+ anúncios/semana; análise geoespacial; MPI completo',
              '<b style="color:#e2e8f0">Ideal para:</b> sistema de produção escalável e automatizado',
            ]} />
          </Panel>
        }
      />

      <SectionH3>Fases de Implementação (Opção B — Código)</SectionH3>
      <ul style={{ listStyle: 'none', margin: '12px 0', padding: 0 }}>
        {steps.map(s => (
          <li key={s.n} style={{ display: 'flex', gap: '14px', padding: '14px 0',
            borderBottom: `1px solid rgba(74,78,82,0.3)`, alignItems: 'flex-start' }}>
            <div style={{ background: '#7c5cfc', color: '#fff', borderRadius: '50%',
              width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{s.n}</div>
            <div>
              <h4 style={{ color: T.text, fontSize: '14px', marginBottom: '4px', fontFamily: T.font, fontWeight: 600 }}>{s.title}</h4>
              <p style={{ color: T.muted2, fontSize: '13px', fontFamily: T.font, lineHeight: 1.65, margin: 0 }}>{s.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <SectionH3>Stack Tecnológica Recomendada</SectionH3>
      <TableWrap>
        <thead><tr><TH>Camada</TH><TH>Ferramenta</TH><TH>Justificativa</TH><TH>Custo Mensal</TH></tr></thead>
        <tbody>
          {stack.map(([camada, ferr, just, custo]) => (
            <tr key={camada}>
              <TD style={{ color: T.text }}><strong style={{ color: T.text }}>{camada}</strong></TD>
              <TD style={{ color: T.blue }}>{ferr}</TD>
              <TD>{just}</TD>
              <TD>{custo}</TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <Alert icon="✅" bg="rgba(34,197,94,0.07)" border="rgba(34,197,94,0.2)">
        <strong style={{ color: '#86efac' }}>Custo total estimado (Opção B — Código):</strong>{' '}
        R$ 300–550/mês, sendo o maior custo em proxies rotativos. Com volume limitado ({'<'}10.000 req/semana), é possível reduzir para R$ 100–150/mês usando proxies residenciais compartilhados.
      </Alert>
      <Alert icon="⚠️" bg="rgba(245,158,11,0.07)" border="rgba(245,158,11,0.2)">
        <strong style={{ color: '#fcd34d' }}>Ponto crítico de validação:</strong>{' '}
        Nas primeiras 4 semanas, valide os dados coletados comparando o ppm2 mediano calculado com os dados FIPE ZAP+ para Campinas. Divergências {'>'} 15% indicam problema no parser de área. Corrija antes de escalar.
      </Alert>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function RealEstateSection({
  properties, exchangeRate, displayCurrency, setDisplayCurrency,
  editingProperty, setEditingProperty, selectedProperty, setSelectedProperty,
  realEstateValue, realEstateValueUsd, updatePropertyPrice,
  formatBRL, formatUsdOnly, getCalculatedValue, getTypeIcon,
  inquilinos = [], pagamentos = [], despesas = [],
  relatorioMensal = {}, relatorioAnual = {}, dashboardKpis = {},
}) {
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <section id="s2b-realestate" style={{ marginBottom: '48px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: T.silver, margin: 0,
          fontFamily: T.font, textTransform: 'uppercase' }}>
          Real Estate — Campinas/SP
        </h2>
        <span style={{ padding: '3px 10px', background: 'rgba(208,255,0,0.1)',
          border: '1px solid rgba(208,255,0,0.3)', borderRadius: '20px',
          fontSize: '11px', color: T.lime, fontFamily: T.font, letterSpacing: '0.05em' }}>
          {properties.length} imóveis
        </span>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '0',
        background: 'rgba(10,10,10,0.5)', border: `1px solid ${T.border}`,
        borderRadius: '12px 12px 0 0', padding: '6px', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '7px 14px',
            background: activeTab === tab.id ? 'rgba(208,255,0,0.12)' : 'transparent',
            border: activeTab === tab.id ? '1px solid rgba(208,255,0,0.3)' : '1px solid transparent',
            borderRadius: '8px', cursor: 'pointer', fontFamily: T.font, fontSize: '12px',
            fontWeight: activeTab === tab.id ? 600 : 400,
            color: activeTab === tab.id ? T.lime : T.muted2,
            transition: 'all 0.15s ease', whiteSpace: 'nowrap',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: 'rgba(14,16,22,0.7)', border: `1px solid ${T.border}`,
        borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
        {activeTab === 'portfolio'   && <PortfolioTab {...{ properties, exchangeRate, displayCurrency, setDisplayCurrency, editingProperty, setEditingProperty, selectedProperty, setSelectedProperty, realEstateValue, realEstateValueUsd, updatePropertyPrice, formatBRL, formatUsdOnly, getCalculatedValue, getTypeIcon }} />}
        {activeTab === 'gestao'      && <GestaoTab {...{ inquilinos, pagamentos, despesas, formatBRL }} />}
        {activeTab === 'financeiro'  && <FinanceiroTab {...{ relatorioMensal, relatorioAnual, dashboardKpis, formatBRL }} />}
        {activeTab === 'fontes'      && <FontesTab />}
        {activeTab === 'preco'       && <PrecoTab />}
        {activeTab === 'mpi'         && <MpiTab />}
        {activeTab === 'arquitetura' && <ArquiteturaTab />}
        {activeTab === 'automacao'   && <AutomacaoTab />}
        {activeTab === 'plano'       && <PlanoTab />}
      </div>
    </section>
  );
}
