/**
 * realEstateLoader.js
 * Loads GMC real-estate administration state from
 * data/real_estate/imoveis_state.json (merged from
 * Administracao_Imoveis_Completa + Avancada).
 *
 * Merge strategy:
 *   Completa  → imoveis, inquilinos, pagamentos (7), despesas (4), relatorios
 *   Avancada  → dashboard_kpis (taxa_ocupacao, receita_por_tipo, top5)
 */

import state from '../../data/real_estate/imoveis_state.json';

// ── Raw entity arrays ───────────────────────────────────────────────────────

/** @type {Array} All 12 properties with aluguelMensal */
export const imoveis = state.imoveis;

/** @type {Array} 9 tenant contracts */
export const inquilinos = state.inquilinos;

/** @type {Array} 7 payment records (Completa base) */
export const pagamentos = state.pagamentos;

/** @type {Array} 4 expense records (Completa base) */
export const despesas = state.despesas;

// ── Reports ─────────────────────────────────────────────────────────────────

/** Monthly financial summary (Março/2026) */
export const relatorioMensal = state.relatorio_mensal;

/** Annual performance report (2025) — ROI per property, monthly evolution */
export const relatorioAnual = state.relatorio_anual;

/** Dashboard KPIs from Avancada — occupancy, revenue by type, top-5 */
export const dashboardKpis = state.dashboard_kpis;

// ── Derived helpers ──────────────────────────────────────────────────────────

/** Total portfolio value (sum of valorVenda) */
export const portfolioTotalBRL = imoveis.reduce(
  (acc, p) => acc + (p.valorVenda ?? 0),
  0
);

/** Total estimated monthly rental income (all properties, if fully occupied) */
export const rendaMensalEstimada = imoveis.reduce(
  (acc, p) => acc + (p.aluguelMensal ?? 0),
  0
);

/** Map idImovel → inquilino (most recent active or last known) */
export const inquilinoByImovel = inquilinos.reduce((acc, t) => {
  acc[t.idImovel] = t;
  return acc;
}, {});

/** Map idImovel → latest pagamento */
export const ultimoPagamentoByImovel = pagamentos.reduce((acc, p) => {
  if (!acc[p.idImovel] || p.mesAno > acc[p.idImovel].mesAno) {
    acc[p.idImovel] = p;
  }
  return acc;
}, {});

/** Map idImovel → ROI data from annual report */
export const roiByImovel = (relatorioAnual.roiPorImovel || []).reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {});

/** Meta */
export const lastUpdate = state.last_update;
