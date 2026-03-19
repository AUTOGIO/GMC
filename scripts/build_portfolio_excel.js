#!/usr/bin/env node
/**
 * GMC Portfolio — Excel workbook generator
 * Produces a dashboard-ready .xlsx from gmc_portfolio_state.json
 * Aligned with Microsoft docs: PivotTables, Slicers, Data Model (Power Pivot).
 */

import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_PATH = join(ROOT, 'data', 'portfolio', 'gmc_portfolio_state.json');
const OUT_PATH = join(ROOT, 'data', 'portfolio', 'GMC_Portfolio_Dashboard.xlsx');

const state = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

// --- Flat rows for PivotTable / Slicers (one row per instrument)
function buildInstrumentRows() {
  const rows = [];
  for (const ac of state.asset_allocation || []) {
    const assetClass = ac.asset_class || ac.asset_class_id;
    const group = ac.dashboard?.group || 'Other';
    const colorTag = ac.dashboard?.color_tag || 'neutral';
    for (const inst of ac.instruments || []) {
      rows.push({
        Asset_Class: assetClass,
        Group: group,
        Color_Tag: colorTag,
        Ticker: inst.ticker ?? '',
        Name: inst.name ?? inst.instrument_id,
        Type: inst.instrument_type ?? '',
        Custodian: inst.custodian ?? '',
        Target_Weight_Pct: inst.target_weight != null ? (inst.target_weight * 100).toFixed(2) : '',
        Amount_USD: inst.amount_usd ?? 0,
        Currency: inst.currency ?? 'USD',
        Region: inst.regional_exposure ?? '',
        Status: inst.execution_status ?? '',
        Notes: (inst.notes || '').slice(0, 200),
      });
    }
  }
  return rows;
}

// --- Gavetas (buckets) summary
function buildGavetasSheet() {
  const header = ['Bucket ID', 'Bucket Name', 'Role', 'Target Weight %', 'Target Amount (USD)', 'Asset Class', 'Component Weight %', 'Component Amount (USD)'];
  const rows = [header];
  for (const g of state.gavetas || []) {
    const tw = (g.target_weight * 100).toFixed(1);
    const ta = g.target_amount_usd;
    for (const c of g.components || []) {
      rows.push([
        g.bucket_id,
        g.name,
        g.role,
        tw,
        ta,
        c.asset_class,
        (c.weight * 100).toFixed(1),
        c.amount_usd,
      ]);
    }
  }
  return rows;
}

// --- Asset allocation summary (one row per asset class)
function buildAllocationSummary() {
  const header = ['Asset Class', 'Group', 'Role', 'Target Weight %', 'Min %', 'Max %', 'Amount (USD)', 'Volatility', 'Liquidity', 'Display Order'];
  const rows = [header];
  for (const ac of state.asset_allocation || []) {
    rows.push([
      ac.asset_class || ac.asset_class_id,
      ac.dashboard?.group ?? '',
      ac.role ?? '',
      (ac.target_weight * 100).toFixed(1),
      ac.min_weight != null ? (ac.min_weight * 100).toFixed(1) : '',
      ac.max_weight != null ? (ac.max_weight * 100).toFixed(1) : '',
      ac.amount_usd ?? 0,
      ac.volatility_profile ?? '',
      ac.liquidity_profile ?? '',
      ac.dashboard?.display_order ?? '',
    ]);
  }
  return rows;
}

// --- Regime targets (for slicer / scenario view)
function buildRegimeSheet() {
  const header = ['Regime ID', 'Label', 'Cash %', 'Bonds %', 'Gold %', 'Equities %', 'Bitcoin %'];
  const rows = [header];
  for (const r of state.regime_engine?.regime_definitions || []) {
    const w = r.target_weights || {};
    rows.push([
      r.regime_id,
      r.label,
      (w.cash * 100).toFixed(1),
      (w.bonds * 100).toFixed(1),
      (w.gold * 100).toFixed(1),
      (w.equities * 100).toFixed(1),
      (w.bitcoin * 100).toFixed(1),
    ]);
  }
  return rows;
}

// --- Stress scenarios
function buildStressSheet() {
  const header = ['Scenario ID', 'Description', 'Expected Winners', 'Expected Losers'];
  const rows = [header];
  for (const s of state.risk_framework?.stress_scenarios || []) {
    rows.push([
      s.scenario_id,
      s.description,
      (s.expected_winners || []).join(', '),
      (s.expected_losers || []).join(', '),
    ]);
  }
  return rows;
}

// --- MODEL: aggregation by Asset_Class (PivotTable-like)
function buildModelByAssetClass() {
  const total = state.portfolio_summary?.total_capital_usd ?? 0;
  const header = ['Asset Class', 'Group', 'Amount (USD)', 'Weight %', 'Instruments'];
  const rows = [header];
  for (const ac of state.asset_allocation || []) {
    const amt = ac.amount_usd ?? 0;
    const pct = total ? ((amt / total) * 100).toFixed(1) : '0';
    const n = (ac.instruments || []).length;
    rows.push([ac.asset_class || ac.asset_class_id, ac.dashboard?.group ?? '', amt, pct + '%', n]);
  }
  return rows;
}

// --- MODEL: aggregation by Group (PivotTable-like)
function buildModelByGroup() {
  const total = state.portfolio_summary?.total_capital_usd ?? 0;
  const byGroup = {};
  for (const ac of state.asset_allocation || []) {
    const g = ac.dashboard?.group || 'Other';
    if (!byGroup[g]) byGroup[g] = { amount: 0, count: 0 };
    byGroup[g].amount += ac.amount_usd ?? 0;
    byGroup[g].count += (ac.instruments || []).length;
  }
  const header = ['Group', 'Amount (USD)', 'Weight %', 'Asset classes'];
  const rows = [header];
  for (const [g, v] of Object.entries(byGroup)) {
    const pct = total ? ((v.amount / total) * 100).toFixed(1) : '0';
    rows.push([g, v.amount, pct + '%', v.count]);
  }
  return rows;
}

// --- DASHBOARD: professional layout — KPI row, then model tables, then interaction instructions
function buildDashboardSheet() {
  const summary = state.portfolio_summary || {};
  const total = summary.total_capital_usd ?? 0;
  const byAc = buildModelByAssetClass();
  const byGr = buildModelByGroup();
  const rows = [
    ['GMC Portfolio — Dashboard'],
    ['Last updated: ' + (state.last_update || '')],
    [],
    ['KPI CARDS'],
    ['Total Capital (USD)', 'Cash-like %', 'Defensive %', 'Growth %', 'Convex %'],
    [total, (summary.cash_like_weight * 100).toFixed(1) + '%', (summary.defensive_weight * 100).toFixed(1) + '%', (summary.growth_weight * 100).toFixed(1) + '%', (summary.convex_weight * 100).toFixed(1) + '%'],
    [],
    ['ALLOCATION BY ASSET CLASS (from Data Model)'],
    ...byAc,
    [],
    ['ALLOCATION BY GROUP'],
    ...byGr,
    [],
    ['GAVETAS AT A GLANCE'],
    ['Bucket', 'Target Weight', 'Target Amount (USD)'],
    ...(state.gavetas || []).map(g => [g.name, (g.target_weight * 100).toFixed(1) + '%', g.target_amount_usd]),
    [],
    ['--- INTERACTION LAYER ---'],
    ['Add Slicers: Insert → Slicer → connect to PivotTables built from sheet DATA. Fields: Asset_Class, Group, Status.'],
    ['Add PivotCharts: Insert → PivotTable from DATA → then Insert → PivotChart (Bar for allocation, Pie for weights).'],
    ['Timeline: If you add a Date column to DATA, use Insert → Timeline for period filtering.'],
  ];
  return rows;
}

// --- Dashboard instructions (text sheet)
function buildInstructionsSheet() {
  return [
    ['GMC Portfolio — Excel Dashboard Guide'],
    [],
    ['1. DATA SOURCE'],
    ['   • Sheet "DATA" = raw instrument-level table. Convert to Table (Ctrl+T) and use as PivotTable source.'],
    ['   • Sheet "MODEL" = pre-aggregated by Asset Class and Group. Sheet "Allocation_Summary" = full asset-class detail.'],
    [],
    ['2. CREATE PIVOTCHARTS + SLICERS (Microsoft support)'],
    ['   • Insert → PivotTable → use "DATA" (or This Workbook Data Model for Power Pivot).'],
    ['   • Rows: Asset_Class, Group. Values: Sum of Amount_USD, Sum of Target_Weight_Pct.'],
    ['   • Insert → PivotChart: choose Bar or Pie for allocation.'],
    ['   • Insert → Slicer: select fields Asset_Class, Group, or Status. Connect to all PivotTables.'],
    ['   • Slicers: https://support.microsoft.com/en-us/office/use-slicers-to-filter-data-249f966b-a9d5-4b0f-b31a-12651785d29d'],
    [],
    ['3. DASHBOARD LAYOUT'],
    ['   • Put KPIs (total capital, cash %, convex %) at top; PivotCharts below; Slicers on left or right.'],
    ['   • Create & share dashboard: https://support.microsoft.com/en-us/office/create-and-share-a-dashboard-with-excel-and-microsoft-groups-ad92a34d-38d0-4fdd-b8b1-b702c8a95eb5'],
    [],
    ['4. POWER QUERY + POWER PIVOT (fiscal/audit)'],
    ['   • Get & Transform: load Instruments + Regimes + Stress into Data Model; relate by key fields.'],
    ['   • DAX measures: SUM(Instruments[Amount_USD]), time intelligence if you add dates.'],
    ['   • https://support.microsoft.com/en-us/office/learn-to-use-power-query-and-power-pivot-in-excel-42d895c2-d1d7-41d0-88da-d1ed7ecc102d'],
    [],
    ['5. PORTFOLIO METADATA'],
    ['Portfolio', state.portfolio_name || ''],
    ['Entity', state.entity_name || ''],
    ['Base currency', state.base_currency || 'USD'],
    ['Last update', state.last_update || ''],
    ['Total capital (USD)', state.portfolio_summary?.total_capital_usd ?? ''],
    ['Current regime', state.source_context?.current_macro_regime || state.regime_engine?.current_regime || ''],
  ];
}

// --- MODEL sheet: By Asset Class + By Group (PivotTable-style summaries)
function buildModelSheet() {
  const byAc = buildModelByAssetClass();
  const byGr = buildModelByGroup();
  return [
    ['Model — Allocation by Asset Class'],
    [],
    ...byAc,
    [],
    [],
    ['Model — Allocation by Group'],
    [],
    ...byGr,
  ];
}

// --- Workbook assembly (4-layer: DATA → MODEL → DASHBOARD + CHARTS area → Guide)
function run() {
  const wb = XLSX.utils.book_new();

  // 1) DATA layer: raw instrument-level data (convert to Table in Excel for PivotTables)
  const instruments = buildInstrumentRows();
  const wsData = XLSX.utils.json_to_sheet(instruments);
  XLSX.utils.book_append_sheet(wb, wsData, 'DATA');
  wsData['!cols'] = [
    { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 32 }, { wch: 10 }, { wch: 10 },
    { wch: 14 }, { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 10 }, { wch: 36 },
  ];

  // 2) MODEL layer: pre-aggregated tables (PivotTable-like)
  const wsModel = XLSX.utils.aoa_to_sheet(buildModelSheet());
  XLSX.utils.book_append_sheet(wb, wsModel, 'MODEL');

  // 3) DASHBOARD: KPIs + visualization tables + interaction instructions
  const wsDashboard = XLSX.utils.aoa_to_sheet(buildDashboardSheet());
  XLSX.utils.book_append_sheet(wb, wsDashboard, 'DASHBOARD');

  // Supporting sheets
  const wsGavetas = XLSX.utils.aoa_to_sheet(buildGavetasSheet());
  XLSX.utils.book_append_sheet(wb, wsGavetas, 'Gavetas');

  const wsAlloc = XLSX.utils.aoa_to_sheet(buildAllocationSummary());
  XLSX.utils.book_append_sheet(wb, wsAlloc, 'Allocation_Summary');

  const wsRegime = XLSX.utils.aoa_to_sheet(buildRegimeSheet());
  XLSX.utils.book_append_sheet(wb, wsRegime, 'Regimes');

  const wsStress = XLSX.utils.aoa_to_sheet(buildStressSheet());
  XLSX.utils.book_append_sheet(wb, wsStress, 'Stress_Scenarios');

  const wsInstructions = XLSX.utils.aoa_to_sheet(buildInstructionsSheet());
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Dashboard_Guide');

  XLSX.writeFile(wb, OUT_PATH);
  console.log('Written:', OUT_PATH);
}

run();
