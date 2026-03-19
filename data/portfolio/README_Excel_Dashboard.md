# GMC Portfolio — Excel Dashboard

Professional Excel workbook for **GMC Convex Portfolio**, following the **four-layer dashboard architecture** from Microsoft’s official docs: Data → Model → Visualization → Interaction.

## Generate the workbook

From project root:

```bash
npm run excel
```

or

```bash
node scripts/build_portfolio_excel.js
```

Output: `data/portfolio/GMC_Portfolio_Dashboard.xlsx`

## Four-layer architecture

| Layer | Sheet(s) | Purpose |
|-------|----------|---------|
| **1. Data** | **DATA** | Raw instrument-level rows. Convert to Excel Table (Ctrl+T); use as PivotTable source. |
| **2. Model** | **MODEL**, Allocation_Summary | Pre-aggregated tables (by Asset Class, by Group). Use for KPIs and as second PivotTable source. |
| **3. Visualization** | **DASHBOARD** | KPI cards (Total Capital, Cash %, Defensive %, Growth %, Convex %), allocation tables, Gavetas summary. Add PivotCharts here. |
| **4. Interaction** | DASHBOARD (instructions) | Slicers and Timelines: build from DATA via PivotTables; connect to all PivotTables. |

## Workbook sheets

| Sheet | Purpose |
|-------|--------|
| **DATA** | One row per instrument (Asset_Class, Group, Ticker, Amount_USD, etc.). **PivotTable + Slicer source.** |
| **MODEL** | Allocation by Asset Class; Allocation by Group (PivotTable-style summaries). |
| **DASHBOARD** | KPI cards, allocation tables, Gavetas at a glance, and steps to add Slicers/PivotCharts. |
| **Gavetas** | Buckets (Survival & Optionality, Convex Growth) and components. |
| **Allocation_Summary** | Full asset-class detail (target %, min/max, volatility, liquidity). |
| **Regimes** | Regime targets (Liquidity Crisis, Defensive Convex, Expansion). Use with Slicer for scenario view. |
| **Stress_Scenarios** | Risk framework: scenario ID, description, expected winners/losers. |
| **Dashboard_Guide** | Step-by-step links to Microsoft support (PivotTable, PivotChart, Slicers, Timeline, Power Query, DAX). |

## Visual dashboard in Excel (quick steps)

1. **Convert DATA to Table**  
   Select the **DATA** range → Insert → Table (Ctrl+T). Keeps formulas and Slicers stable.

2. **Create PivotTable**  
   Insert → PivotTable → use Table from sheet **DATA**.  
   - Rows: `Asset_Class`, `Group`  
   - Values: `Sum of Amount_USD`  
   [Create a PivotTable](https://support.microsoft.com/en-us/office/create-a-pivottable-to-analyze-worksheet-data-a9a84538-bfe9-40a9-a8e9-f99134456576)

3. **Add PivotChart**  
   Click inside the PivotTable → Insert → PivotChart. Choose **Bar** (allocation) or **Pie** (weights). Place on **DASHBOARD** sheet.  
   [Create a PivotChart](https://support.microsoft.com/en-us/office/create-a-pivotchart-c1b1e057-6990-4c38-b52b-8255538e7b1c)

4. **Add Slicers**  
   Insert → Slicer → select **Asset_Class**, **Group**, and/or **Status**. Use Report Connections to link to all PivotTables.  
   [Use slicers to filter data](https://support.microsoft.com/en-us/office/use-slicers-to-filter-data-249f966b-a9d5-4b0f-b31a-12651785d29d)

5. **Optional: Timeline**  
   If you add a Date column to DATA, Insert → Timeline for period filtering.  
   [Create a PivotTable timeline](https://support.microsoft.com/en-us/office/create-a-pivottable-timeline-to-filter-dates-d3956083-01be-408c-906d-6fc99d9fadfa)

6. **Arrange DASHBOARD**  
   [Create and share a dashboard with Excel](https://support.microsoft.com/en-us/office/create-and-share-a-dashboard-with-excel-and-microsoft-groups-ad92a34d-38d0-4fdd-b8b1-58379aae746e)

## Power Query + Power Pivot (fiscal/audit)

- **Power Query**: Get Data → load **DATA**, **Regimes**, **Stress_Scenarios**; shape and load to **Data Model**.  
- **Power Pivot**: Relate tables; add DAX measures (e.g. `TotalUSD := SUM(DATA[Amount_USD])`).  
- **DAX time intelligence**: With a date column, use `SAMEPERIODLASTYEAR`, `DATESYTD` for period comparisons.  
  [Learn Power Query and Power Pivot](https://support.microsoft.com/en-us/office/learn-to-use-power-query-and-power-pivot-in-excel-42d895c2-d1d7-41d0-88da-d1ed7ecc102d)  
  [DAX overview](https://learn.microsoft.com/en-us/dax/dax-overview)  
  [Use PivotTables and other BI tools](https://support.microsoft.com/en-us/office/use-pivottables-and-other-business-intelligence-tools-to-analyze-your-data-da1b3e85-d3c0-4f15-8cd9-bef446762ec3)

## Data source

Workbook is built from:

`data/portfolio/gmc_portfolio_state.json`

Re-run `npm run excel` after editing the JSON to refresh the .xlsx.
