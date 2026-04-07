
import React, { useState, useEffect, useMemo } from 'react';
import { Shield, TrendingUp, Building2, Wallet, Globe, AlertTriangle, Activity, Gem, Target, Layers, Home, PieChart as PieChartIcon, FileText, BarChart2, Terminal } from 'lucide-react';

const TUI_DASHBOARD_URL = (import.meta.env.VITE_TUI_DASHBOARD_URL ?? '').trim();
import ConvexReportsSection from './ConvexReportsSection';
import MacroContextSection from './MacroContextSection';
import RealEstateSection from './RealEstateSection';
import { fetchGlobalMetrics, triggerRefresh, getRegimeDisplay, fmtDate } from './macroApi';

import {
  convexPortfolio,
  gmcGlobalPortfolio,
  convexIntegrated,
  allInstruments,
  assetsSnapshotFromState,
  portfolioState,
  currentPortfolioSnapshot,
  optimizedAllocationGavetas,
  detailedEquitiesVisa,
  detailedCryptoCfm,
} from './data/portfolioLoader';

import {
  imoveis as imoveisData,
  inquilinos,
  pagamentos,
  despesas,
  relatorioMensal,
  relatorioAnual,
  dashboardKpis,
} from './data/realEstateLoader';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label, currency = 'USD' }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10, 10, 10, 0.95)',
        border: '1px solid rgba(74, 78, 82, 0.5)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <p style={{ color: '#E2E8F0', margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold' }}>{label || payload[0].name}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', fontSize: '12px', marginBottom: index === payload.length - 1 ? 0 : '4px' }}>
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span style={{ color: '#F8FAFC', fontWeight: '500' }}>
              {currency === 'USD' 
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(entry.value)
                : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(entry.value)
              }
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const GMCDashboard = () => {
  // --- REAL ESTATE & OVERALL PORTFOLIO STATE ---
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  
  // Currency conversion state — seeded from BCB PTAX on mount
  const [exchangeRate, setExchangeRate] = useState(5.85); // USD to BRL

  // Live macro data from Personal_Tracker_Global (port 8013)
  const [macroData, setMacroData] = useState(null);

  useEffect(() => {
    fetchGlobalMetrics().then(data => {
      setMacroData(data);
      // Replace the hardcoded exchange rate with live BCB PTAX
      const live = data?.ptaxUsdBrl;
      if (live && live > 1 && live < 20) setExchangeRate(live);
    });
  }, []);
  const [displayCurrency, setDisplayCurrency] = useState('BRL');

  // ─── SIDEBAR: active section tracking ───
  const [activeSection, setActiveSection] = useState('s1-overview');

  const navItems = [
    { id: 's1-overview',       label: 'Overview',          icon: Home },
    { id: 's2-allocation',     label: 'Allocation',        icon: PieChartIcon },
    { id: 's2b-realestate',    label: 'Real Estate',       icon: Building2 },
    { id: 's3-regime',         label: 'Convex Portfolio',  icon: Shield },
    { id: 's4-usd-snapshot',   label: 'USD Snapshot',      icon: Wallet },
    { id: 's5-gavetas',        label: 'Gavetas',           icon: Layers },
    { id: 's6-optimized-alloc',label: 'Optimized Alloc',   icon: Target },
    { id: 's7-instruments',    label: 'Instruments',       icon: Activity },
    { id: 's8-historical',     label: 'Historical',        icon: BarChart2 },
    { id: 's9-macro',          label: 'Macro Context',     icon: Globe },
    { id: 's10-reports',       label: 'Reports',           icon: FileText },
  ];

  const scrollToSection = (id) => {
    const mainEl = document.getElementById('main-scroll');
    const sectionEl = document.getElementById(id);
    if (mainEl && sectionEl) {
      mainEl.scrollTo({ top: sectionEl.offsetTop - 24, behavior: 'smooth' });
    }
    setActiveSection(id);
  };

  useEffect(() => {
    const mainEl = document.getElementById('main-scroll');
    if (!mainEl) return;
    const sectionIds = navItems.map(n => n.id);
    const handleScroll = () => {
      const scrollTop = mainEl.scrollTop;
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollTop + 120) current = id;
      }
      setActiveSection(current);
    };
    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', handleScroll);
  }, []);

  // Properties: base metadata (cep, building, pricePerM2, etc.) merged with
  // aluguelMensal + valorVenda from realEstateLoader (imoveis_state.json).
  const PROPERTY_META = {
    1:  { cep: '13183-513', area: null,  pricePerM2: null, marketValue: 450000,  taxAssessment: 130000,    building: null,                  garages: null, matricula: null,    cartorio: null,                               mapsUrl: 'https://maps.google.com/?q=Loteamento+Parana+Regina+Nova+Veneza' },
    2:  { cep: '13073-018', area: 280,   pricePerM2: 7377, marketValue: null,    taxAssessment: 129173,    building: 'Edifício Populus',     garages: 4,    matricula: null,    cartorio: null,                               mapsUrl: 'https://maps.google.com/?q=Rua+Buarque+de+Macedo+635+Campinas' },
    3:  { cep: '13073-035', area: 50,    pricePerM2: 7194, marketValue: null,    taxAssessment: 26000,     building: null,                  garages: null, matricula: null,    cartorio: null,                               mapsUrl: 'https://maps.google.com/?q=Av+Imperatriz+Leopoldina+10+Campinas' },
    4:  { cep: '13070-161', area: 380,   pricePerM2: 6139, marketValue: null,    taxAssessment: 153307,    building: null,                  garages: null, matricula: null,    cartorio: null,                               mapsUrl: 'https://maps.google.com/?q=Rua+Franz+Wilhelm+Daffert+484+Campinas' },
    5:  { cep: '13020-170', area: 50,    pricePerM2: 6432, marketValue: null,    taxAssessment: 48100,     building: null,                  garages: null, matricula: null,    cartorio: null,                               mapsUrl: 'https://maps.google.com/?q=Rua+Hercules+Florence+367+Campinas' },
    6:  { cep: '13020-158', area: 70,    pricePerM2: 6432, marketValue: null,    taxAssessment: 82864,     building: null,                  garages: null, matricula: null,    cartorio: null,                               mapsUrl: 'https://maps.google.com/?q=Rua+Falcao+Filho+103+Campinas' },
    7:  { cep: '13073-035', area: 130,   pricePerM2: 7194, marketValue: null,    taxAssessment: 139000,    building: null,                  garages: null, matricula: null,    cartorio: null,                               mapsUrl: 'https://maps.google.com/?q=Av+Imperatriz+Leopoldina+405+Campinas' },
    8:  { cep: null,         area: 69,   pricePerM2: 1631, marketValue: null,    venalValue: 112493.80,    building: 'Edifício Ébano',       garages: null, matricula: '103.496', cartorio: '2º Cartório de Registro de Imóveis', mapsUrl: 'https://maps.google.com/?q=Rua+Paulo+Setubal+367+Campinas' },
    9:  { cep: null,         area: 39,   pricePerM2: 2717, marketValue: null,    venalValue: 105961.38,    building: 'Edifício Pitangueiras', garages: null, matricula: '37.776',  cartorio: '2º Cartório de Registro de Imóveis', mapsUrl: 'https://maps.google.com/?q=Rua+14+de+Dezembro+51+Campinas' },
    10: { cep: null,         area: 110,  pricePerM2: 3624, marketValue: null,    venalValue: 398687.67,    building: 'Edifício Pitangua',    garages: null, matricula: '95.359',  cartorio: '2º Cartório de Registro de Imóveis', mapsUrl: 'https://maps.google.com/?q=Rua+Coronel+Manuel+de+Morais+317+Campinas' },
    11: { cep: null,         area: null, pricePerM2: null, marketValue: null,    venalValue: 17030.68,     building: 'Edifício Pitangua',    garages: 1,    matricula: '95.360',  cartorio: '2º Cartório de Registro de Imóveis', mapsUrl: 'https://maps.google.com/?q=Rua+Coronel+Manuel+de+Morais+317+Campinas' },
    12: { cep: null,         area: null, pricePerM2: null, marketValue: null,    venalValue: 17030.68,     building: 'Edifício Pitangua',    garages: 1,    matricula: '95.361',  cartorio: '2º Cartório de Registro de Imóveis', mapsUrl: 'https://maps.google.com/?q=Rua+Coronel+Manuel+de+Morais+317+Campinas' },
  };

  // Merge xlsx data (valorVenda, aluguelMensal) with local metadata (cep, building, pricePerM2…)
  const [properties, setProperties] = useState(
    imoveisData.map(p => ({
      id:            p.id,
      type:          p.tipo,
      address:       p.endereco,
      aluguelMensal: p.aluguelMensal,
      ...(PROPERTY_META[p.id] || {}),
    }))
  );

  // Calculate market value based on area and price per m²
  const getCalculatedValue = (property) => {
    if (property.marketValue) return property.marketValue;
    if (property.area && property.pricePerM2) {
      return property.area * property.pricePerM2;
    }
    if (property.venalValue) return property.venalValue;
    return 0;
  };

  // Calculate totals
  const realEstateValue = useMemo(() => {
    return properties.reduce((sum, p) => sum + getCalculatedValue(p), 0);
  }, [properties]);

  const cashPositionUsd = 460000;
  const realEstateValueUsd = realEstateValue / exchangeRate;
  const totalPortfolioUsd = cashPositionUsd + realEstateValueUsd;

  // Update property price per m²
  const updatePropertyPrice = (propertyId, newPrice) => {
    setProperties(prev => prev.map(p => 
      p.id === propertyId ? { ...p, pricePerM2: parseFloat(newPrice) || 0 } : p
    ));
    setEditingProperty(null);
  };

  // --- HELPERS ---

  // Use live macro timestamp when available; fall back to last hard-coded snapshot date
  const asOfDate = fmtDate(macroData?.timestamp, '2026-03-11');
  
  // Quick stats
  const totalProperties = properties.length;
  const totalArea = properties.reduce((sum, p) => sum + (p.area || 0), 0);
  const cashRatio = ((cashPositionUsd / totalPortfolioUsd) * 100).toFixed(1);

  const formatUsdOnly = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatBRL = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatUsd = formatUsdOnly;
  const formatRealEstate = (valueBRL) => displayCurrency === 'USD' ? formatUsdOnly(valueBRL / exchangeRate) : formatBRL(valueBRL);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Apartamento':
      case 'Apartment': return '🏢';
      case 'Casa': return '🏠';
      case 'Terreno': return '📍';
      case 'Vaga':
      case 'Parking Space': return '🅿️';
      default: return '🏗️';
    }
  };

  const assetsSnapshot = assetsSnapshotFromState;
  
  const pendingAssets = [
    { asset: 'Gold (USD)', status: 'Planned', role: 'Anti-fragile reserve' },
    { asset: 'Bitcoin (USD)', status: 'Planned', role: 'Convex optionality' },
    { asset: 'Foreign ETFs', status: 'Planned', role: 'Global equities' },
    { asset: 'USD Exposure', status: 'Planned', role: 'BRL hedge' },
  ];

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #121212 50%, #0A0A0A 100%)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      color: '#E2E8F0',
    }}>

      {/* ─── SIDEBAR NAVIGATION ─── */}
      <nav style={{
        width: '200px',
        minWidth: '200px',
        height: '100vh',
        overflowY: 'auto',
        background: 'rgba(6, 6, 6, 0.98)',
        borderRight: '1px solid rgba(192, 192, 192, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo block */}
        <div style={{ padding: '24px 18px 18px', borderBottom: '1px solid rgba(192,192,192,0.08)' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '4px', color: '#C0C0C0', fontFamily: "'DM Sans', sans-serif" }}>GMC</div>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#4A4E52', fontFamily: "'DM Sans', sans-serif", marginTop: '5px', textTransform: 'uppercase' }}>Portfolio Dashboard</div>
        </div>

        {TUI_DASHBOARD_URL ? (
          <div style={{ padding: '0 14px 14px', borderBottom: '1px solid rgba(192,192,192,0.08)' }}>
            <a
              href={TUI_DASHBOARD_URL}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(208, 255, 0, 0.35)',
                background: 'rgba(208, 255, 0, 0.06)',
                color: '#D0FF00',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              <Terminal size={14} style={{ flexShrink: 0 }} />
              TUI shell
            </a>
          </div>
        ) : null}

        {/* Nav links */}
        <div style={{ padding: '10px 0', flex: 1 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 18px',
                  background: isActive ? 'rgba(208, 255, 0, 0.07)' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '2px solid #D0FF00' : '2px solid transparent',
                  cursor: 'pointer',
                  color: isActive ? '#D0FF00' : '#94A3B8',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'color 0.15s, background 0.15s',
                  letterSpacing: '0.4px',
                  lineHeight: '1',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#E2E8F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <Icon size={13} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom regime pill */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(192,192,192,0.08)', fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ fontSize: '9px', letterSpacing: '1px', color: '#4A4E52', marginBottom: '4px', textTransform: 'uppercase' }}>Regime</div>
          <div style={{ fontSize: '11px', color: getRegimeDisplay(macroData?.regimeHint).color, fontWeight: 'bold', letterSpacing: '0.5px' }}>
            {getRegimeDisplay(macroData?.regimeHint).label}
          </div>
        </div>
      </nav>

      {/* ─── MAIN SCROLLABLE CONTENT ─── */}
      <main id="main-scroll" style={{ flex: 1, height: '100vh', overflowY: 'auto', padding: '24px' }}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* 1. Overview & KPI Strip */}
        <section id="s1-overview" style={{ marginBottom: '48px', paddingBottom: '24px', borderBottom: '1px solid rgba(192, 192, 192, 0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '600', letterSpacing: '3px', background: 'linear-gradient(135deg, #C0C0C0 0%, #FFFFFF 50%, #C0C0C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 8px 0', paddingBottom: '16px', borderBottom: '1px solid rgba(192, 192, 192,0.2)' }}>
              GIOVANNINI MARE CAPITAL
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '15px', letterSpacing: '2px', margin: '16px 0 8px 0', fontFamily: "'DM Sans', sans-serif" }}>
              SINGLE-FAMILY OFFICE • RISK-FIRST ALLOCATION
            </p>
            <p style={{ color: getRegimeDisplay(macroData?.regimeHint).color, fontSize: '14px', letterSpacing: '1px', margin: 0, fontFamily: "'DM Sans', sans-serif", fontWeight: 'bold' }}>
              {getRegimeDisplay(macroData?.regimeHint).label} — As of: {asOfDate}
            </p>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            background: 'rgba(10, 10, 10, 0.6)',
            border: '1px solid rgba(74, 78, 82, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px'
          }}>
            <div style={{ padding: '0 12px', borderRight: '1px solid rgba(74, 78, 82, 0.5)' }}>
              <span style={{ color: '#4A4E52' }}>Total Portfolio:</span> <span style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{formatUsd(totalPortfolioUsd)}</span>
            </div>
            <div style={{ padding: '0 12px', borderRight: '1px solid rgba(74, 78, 82, 0.5)' }}>
              <span style={{ color: '#4A4E52' }}>Liquid Capital:</span> <span style={{ color: '#D0FF00', fontWeight: 'bold' }}>{formatUsd(cashPositionUsd)}</span>
            </div>
            <div style={{ padding: '0 12px', borderRight: '1px solid rgba(74, 78, 82, 0.5)' }}>
              <span style={{ color: '#4A4E52' }}>Real Estate (Brazil, structural):</span> <span style={{ color: '#C0C0C0', fontWeight: 'bold' }}>{formatUsd(realEstateValueUsd)}</span>
            </div>
            <div style={{ padding: '0 12px', borderRight: '1px solid rgba(74, 78, 82, 0.5)' }}>
              <span style={{ color: '#4A4E52' }}>Properties:</span> <span style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{totalProperties}</span>
            </div>
            <div style={{ padding: '0 12px', borderRight: '1px solid rgba(74, 78, 82, 0.5)' }}>
              <span style={{ color: '#4A4E52' }}>Total Area:</span> <span style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{totalArea} m² (Built area)</span>
            </div>
            <div style={{ padding: '0 12px', borderRight: '1px solid rgba(74, 78, 82, 0.5)' }}>
              <span style={{ color: '#4A4E52' }}>Cash Ratio:</span> <span style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{cashRatio}% of portfolio (USD)</span>
            </div>
            <div style={{ padding: '0 12px' }}>
              <span style={{ color: '#4A4E52' }}>Regime:</span> <span style={{ color: '#D0FF00', fontWeight: 'bold' }}>Defensive convex</span>
            </div>
          </div>
        </section>

        {/* 2. Total Portfolio Allocation (USD vs Real Estate) */}
        <section id="s2-allocation" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif" }}>
            2. TOTAL PORTFOLIO ALLOCATION (USD VS REAL ESTATE)
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>
            Highlights the structural tilt to BR real estate vs liquid convex USD sleeve.
          </p>
          <div style={{ height: '350px', width: '100%', marginBottom: '24px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Liquid USD', value: cashPositionUsd },
                    { name: 'Real Estate (BR)', value: realEstateValueUsd }
                  ]}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#D0FF00" />
                  <Cell fill="#4A4E52" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fill: '#F8FAFC',
                    fontSize: '20px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 'bold'
                  }}
                >
                  {formatUsd(totalPortfolioUsd)}
                </text>
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(74, 78, 82, 0.3)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#4A4E52', letterSpacing: '1px', marginBottom: '8px' }}>PROPERTIES</div>
              <div style={{ fontSize: '24px', fontWeight: '500', color: '#F8FAFC' }}>{totalProperties}</div>
            </div>
            <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(74, 78, 82, 0.3)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#4A4E52', letterSpacing: '1px', marginBottom: '8px' }}>TOTAL AREA</div>
              <div style={{ fontSize: '24px', fontWeight: '500', color: '#F8FAFC' }}>{totalArea} m²</div>
            </div>
            <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(74, 78, 82, 0.3)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#4A4E52', letterSpacing: '1px', marginBottom: '8px' }}>CASH RATIO</div>
              <div style={{ fontSize: '24px', fontWeight: '500', color: '#F8FAFC' }}>{cashRatio}%</div>
            </div>
          </div>
        </section>

        {/* 2b. Real Estate — tabbed section (Portfolio + Monitor Campinas) */}
        <RealEstateSection
          properties={properties}
          exchangeRate={exchangeRate}
          displayCurrency={displayCurrency}
          setDisplayCurrency={setDisplayCurrency}
          editingProperty={editingProperty}
          setEditingProperty={setEditingProperty}
          selectedProperty={selectedProperty}
          setSelectedProperty={setSelectedProperty}
          realEstateValue={realEstateValue}
          realEstateValueUsd={realEstateValueUsd}
          updatePropertyPrice={updatePropertyPrice}
          formatBRL={formatBRL}
          formatUsdOnly={formatUsdOnly}
          getCalculatedValue={getCalculatedValue}
          getTypeIcon={getTypeIcon}
          inquilinos={inquilinos}
          pagamentos={pagamentos}
          despesas={despesas}
          relatorioMensal={relatorioMensal}
          relatorioAnual={relatorioAnual}
          dashboardKpis={dashboardKpis}
        />

        {/* 3. Convex Portfolio Regime & Doctrine */}
        <section id="s3-regime" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
            3. GMC CONVEX PORTFOLIO
          </h2>
          <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(74, 78, 82, 0.3)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#4A4E52', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', marginBottom: '8px' }}>STRATEGY STYLE</div>
                <div style={{ fontSize: '16px', color: '#F8FAFC' }}>Macro-driven, regime-aware</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#4A4E52', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', marginBottom: '8px' }}>CURRENT REGIME</div>
                <div style={{ fontSize: '16px', color: '#D0FF00', fontWeight: 'bold' }}>Defensive convex</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#4A4E52', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', marginBottom: '8px' }}>REVIEW FREQUENCY</div>
                <div style={{ fontSize: '16px', color: '#F8FAFC' }}>Quarterly</div>
              </div>
            </div>
            
            <div style={{ padding: '20px', background: 'rgba(10, 10, 10, 0.4)', borderRadius: '12px', borderLeft: '4px solid #C0C0C0' }}>
              <div style={{ fontSize: '13px', color: '#C0C0C0', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', marginBottom: '12px', fontWeight: 'bold' }}>INVESTMENT DOCTRINE</div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#CBD5E1', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', lineHeight: '1.6' }}>
                <li style={{ marginBottom: '8px' }}>Preserve purchasing power first.</li>
                <li style={{ marginBottom: '8px' }}>Deploy aggressively only when asymmetry is clear.</li>
                <li>Maintain liquidity and optionality for future rebalancing.</li>
              </ul>
            </div>

            <p style={{ marginTop: '24px', fontSize: '14px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.6' }}>
              Structure targets a standard <strong>25/15/20/30/10</strong> model (Cash/Bonds/Gold/Equities/Bitcoin) to maintain a highly resilient barbell approach. This explicitly maps into <strong>60% Survival & Optionality</strong> (Cash, Bonds, and Gold) and <strong>40% Convex Growth</strong> (Equities and Bitcoin).
            </p>
          </div>
        </section>

        {/* 4. Convex USD Snapshot (Current vs Target) */}
        <section id="s4-usd-snapshot" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif" }}>
            4. CONVEX USD SNAPSHOT (CURRENT VS TARGET)
          </h2>
          <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(208, 255, 0, 0.3)', borderRadius: '16px', padding: '28px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'rgba(208, 255, 0, 0.08)', border: '1px solid rgba(208, 255, 0, 0.2)', borderRadius: '8px', padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#4A4E52', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', marginBottom: '8px' }}>TOTAL LIQUID (USD)</div>
                  <div style={{ fontSize: '28px', fontWeight: '600', color: '#D0FF00' }}>{formatUsd(460000)}</div>
                </div>
                {assetsSnapshot?.breakdown && ['usd_bank', 'usd_cash', 'gold_usd', 'bitcoin_usd'].map(key => {
                  const val = assetsSnapshot.breakdown[key] || 0;
                  const label = key === 'usd_bank' ? 'Bank (USD)' : key === 'usd_cash' ? 'Cash (USD)' : key === 'gold_usd' ? 'Gold (USD)' : 'Bitcoin (USD)';
                  const targetGrp = key.includes('gold') ? 20 : key.includes('bitcoin') ? 10 : 25; // 25 for liquid
                  const currentPct = ((val / 460000) * 100).toFixed(1);
                  return (
                    <div key={key} style={{ background: 'rgba(74, 78, 82, 0.2)', border: '1px solid rgba(74, 78, 82, 0.3)', borderRadius: '8px', padding: '20px' }}>
                      <div style={{ fontSize: '12px', color: '#4A4E52', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', marginBottom: '8px' }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: '20px', fontWeight: '500', color: '#F8FAFC' }}>{formatUsd(val)}</div>
                      <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '8px', fontFamily: "'DM Sans', sans-serif" }}>
                        Cur: {currentPct}% <span style={{color: '#4A4E52'}}>| Tgt: {targetGrp}%</span>
                      </div>
                    </div>
                  );
                })}
             </div>

             <div style={{ height: '300px', width: '100%' }}>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart
                   data={[
                     { name: 'Bank', current: assetsSnapshot?.breakdown?.usd_bank || 0, target: 460000 * 0.25 },
                     { name: 'Cash', current: assetsSnapshot?.breakdown?.usd_cash || 0, target: 460000 * 0.25 },
                     { name: 'Gold', current: assetsSnapshot?.breakdown?.gold_usd || 0, target: 460000 * 0.20 },
                     { name: 'Bitcoin', current: assetsSnapshot?.breakdown?.bitcoin_usd || 0, target: 460000 * 0.10 }
                   ]}
                   margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                 >
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(74, 78, 82, 0.2)" vertical={false} />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#4A4E52', fontSize: 12 }} 
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#4A4E52', fontSize: 12 }}
                     tickFormatter={(value) => `$${value/1000}k`}
                   />
                   <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(208, 255, 0, 0.05)' }} />
                   <Legend 
                     verticalAlign="top" 
                     align="right"
                     wrapperStyle={{ paddingBottom: '20px' }}
                     formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase' }}>{value}</span>}
                   />
                   <Bar dataKey="current" name="Current" fill="#D0FF00" radius={[4, 4, 0, 0]} barSize={30} />
                   <Bar dataKey="target" name="Target" fill="#4A4E52" radius={[4, 4, 0, 0]} barSize={30} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </section>

        {/* 5. Gavetas: Survival & Optionality vs Convex Growth */}
        <section id="s5-gavetas" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
            5. GAVETAS: SURVIVAL & OPTIONALITY VS CONVEX GROWTH
          </h2>
          <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(74, 78, 82, 0.3)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'flex', height: '40px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif" }}>
               <div style={{ width: '60%', background: '#D0FF00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                 Survival (60%) - {formatUsd(276000)}
               </div>
               <div style={{ width: '40%', background: '#C0C0C0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                 Convex (40%) - {formatUsd(184000)}
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
              <div style={{ background: 'rgba(208, 255, 0, 0.05)', border: '1px solid rgba(208, 255, 0, 0.3)', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#D0FF00', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif", fontWeight: 'bold' }}>Survival & Optionality</h3>
                <table style={{ width: '100%', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(74, 78, 82, 0.3)' }}><td style={{ padding: '8px 0', color: '#E2E8F0' }}>Cash</td><td style={{ textAlign: 'right', color: '#94A3B8' }}>25%</td><td style={{ textAlign: 'right', color: '#D0FF00' }}>{formatUsd(115000)}</td></tr>
                    <tr style={{ borderBottom: '1px solid rgba(74, 78, 82, 0.3)' }}><td style={{ padding: '8px 0', color: '#E2E8F0' }}>Bonds</td><td style={{ textAlign: 'right', color: '#94A3B8' }}>15%</td><td style={{ textAlign: 'right', color: '#D0FF00' }}>{formatUsd(69000)}</td></tr>
                    <tr><td style={{ padding: '8px 0', color: '#E2E8F0' }}>Gold</td><td style={{ textAlign: 'right', color: '#94A3B8' }}>20%</td><td style={{ textAlign: 'right', color: '#D0FF00' }}>{formatUsd(92000)}</td></tr>
                  </tbody>
                </table>
              </div>
              
              <div style={{ background: 'rgba(192, 192, 192, 0.05)', border: '1px solid rgba(192, 192, 192, 0.3)', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', color: '#C0C0C0', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif", fontWeight: 'bold' }}>Convex Growth</h3>
                <table style={{ width: '100%', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(74, 78, 82, 0.3)' }}><td style={{ padding: '8px 0', color: '#E2E8F0' }}>Equities</td><td style={{ textAlign: 'right', color: '#94A3B8' }}>30%</td><td style={{ textAlign: 'right', color: '#C0C0C0' }}>{formatUsd(138000)}</td></tr>
                    <tr><td style={{ padding: '8px 0', color: '#E2E8F0' }}>Bitcoin</td><td style={{ textAlign: 'right', color: '#94A3B8' }}>10%</td><td style={{ textAlign: 'right', color: '#C0C0C0' }}>{formatUsd(46000)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Optimized Allocation for US$460,000 */}
        <section id="s6-optimized-alloc" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
            6. OPTIMIZED ALLOCATION FOR US$460,000
          </h2>
          <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(192, 192, 192, 0.3)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {(optimizedAllocationGavetas?.gavetas || []).map((g, i) => (
                <div key={i} style={{ background: 'rgba(192, 192, 192, 0.05)', border: '1px solid rgba(192, 192, 192, 0.2)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontWeight: 'bold', color: '#F8FAFC', marginBottom: '8px', fontSize: '15px', fontFamily: "'DM Sans', sans-serif" }}>{g.gaveta}</div>
                  <div style={{ fontSize: '20px', color: '#C0C0C0', marginBottom: '8px' }}>{g.percent}% · {formatUsd(g.allocation_usd ?? 0)}</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.5' }}>{g.rationale}</div>
                </div>
              ))}
            </div>

            {(optimizedAllocationGavetas?.implementation_notes || []).length > 0 && (
              <div style={{ padding: '20px', background: 'rgba(10, 10, 10, 0.4)', borderRadius: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                <strong style={{ color: '#E2E8F0', fontSize: '14px' }}>Implementation:</strong>
                <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', color: '#94A3B8', fontSize: '14px', lineHeight: '1.6' }}>
                  {(optimizedAllocationGavetas.implementation_notes || []).map((n, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* 7. Portfolio Instruments (Target) */}
        <section id="s7-instruments" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
            7. PORTFOLIO INSTRUMENTS (TARGET)
          </h2>
          <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(74, 78, 82, 0.3)', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(74, 78, 82, 0.5)' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4A4E52' }}>Asset Class</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4A4E52' }}>Name</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4A4E52' }}>Ticker</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', color: '#4A4E52' }}>Amount (USD)</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4A4E52' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(allInstruments || []).map((inst, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(74, 78, 82, 0.2)' }}>
                      <td style={{ padding: '12px 8px', color: '#F8FAFC' }}>{inst.asset_class}</td>
                      <td style={{ padding: '12px 8px', color: '#E2E8F0' }}>{inst.name}</td>
                      <td style={{ padding: '12px 8px', color: '#94A3B8' }}>{inst.ticker ?? '—'}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: '#D0FF00', fontWeight: '500' }}>{formatUsd(inst.amount_usd ?? 0)}</td>
                      <td style={{ padding: '12px 8px', color: '#C0C0C0', textTransform: 'capitalize' }}>{(inst.execution_status || 'planned').replace(/_/g, ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '24px', marginTop: '32px', background: 'rgba(10, 10, 10, 0.4)', border: '1px solid rgba(74, 78, 82, 0.2)', borderRadius: '12px' }}>
               <h3 style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '20px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px', textTransform: 'uppercase' }}>Equities & Digital Assets Exposure</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                 {(() => {
                   const filtered = (allInstruments || []).filter(i => 
                     ['Equities', 'Digital Assets', 'Crypto'].some(c => (i.asset_class || '').includes(c))
                   );
                   
                   if (filtered.length === 0) {
                     return <div style={{color: '#4A4E52', fontSize: '13px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif"}}>Awaiting instrument data...</div>;
                   }
                   
                   const maxVal = Math.max(...filtered.map(i => i.amount_usd || 0), 1000);
                   
                   return filtered.sort((a, b) => (b.amount_usd || 0) - (a.amount_usd || 0)).map((inst, i) => {
                     const pct = ((inst.amount_usd || 0) / maxVal) * 100;
                     const isCrypto = (inst.asset_class || '').includes('Digital') || (inst.asset_class || '').includes('Crypto');
                     
                     return (
                       <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                         <div style={{ width: '100px', fontSize: '12px', color: '#C0C0C0', fontFamily: "'DM Sans', sans-serif", fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {inst.ticker || inst.name}
                         </div>
                         <div style={{ flex: 1, height: '6px', background: 'rgba(74, 78, 82, 0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                           <div style={{ 
                             width: `${pct}%`, 
                             height: '100%', 
                             background: isCrypto ? 'linear-gradient(90deg, #4A4E52 0%, #C0C0C0 100%)' : 'linear-gradient(90deg, #4A4E52 0%, #D0FF00 100%)',
                             borderRadius: '3px'
                           }} />
                         </div>
                         <div style={{ width: '80px', textAlign: 'right', fontSize: '13px', color: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
                           {formatUsd(inst.amount_usd || 0)}
                         </div>
                       </div>
                     );
                   });
                 })()}
               </div>
            </div>
          </div>
          
          {/* EQUITIES (VISA) & CRYPTO (CFM) TABLES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            {detailedEquitiesVisa?.instruments?.length > 0 && (
              <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(192, 192, 192, 0.3)', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '16px', color: '#C0C0C0', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif" }}>Equities (VISA) Composition</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(74, 78, 82, 0.5)' }}>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4A4E52' }}>Ticker</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#4A4E52' }}>Weight %</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#4A4E52' }}>Amount (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedEquitiesVisa.instruments.map((inst, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(74, 78, 82, 0.2)' }}>
                          <td style={{ padding: '12px 8px', color: '#C0C0C0', fontWeight: '500' }}>{inst.ticker}</td>
                          <td style={{ padding: '12px 8px', textAlign: 'right', color: '#94A3B8' }}>{inst.weight_percent}%</td>
                          <td style={{ padding: '12px 8px', textAlign: 'right', color: '#D0FF00' }}>{formatUsd(inst.allocation_usd ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {detailedCryptoCfm?.instruments?.length > 0 && (
              <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(192, 192, 192, 0.3)', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '16px', color: '#C0C0C0', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif" }}>Crypto (CFM) Composition</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(74, 78, 82, 0.5)' }}>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4A4E52' }}>Ticker</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#4A4E52' }}>Weight %</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#4A4E52' }}>Amount (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedCryptoCfm.instruments.map((inst, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(74, 78, 82, 0.2)' }}>
                          <td style={{ padding: '12px 8px', color: '#C0C0C0', fontWeight: '500' }}>{inst.ticker}</td>
                          <td style={{ padding: '12px 8px', textAlign: 'right', color: '#94A3B8' }}>{inst.adjusted_weight_percent ?? inst.original_weight_percent}%</td>
                          <td style={{ padding: '12px 8px', textAlign: 'right', color: '#D0FF00' }}>{formatUsd(inst.allocation_usd ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 8. Historical Snapshots */}
        <section id="s8-historical" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
            8. HISTORICAL SNAPSHOTS
          </h2>
          <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(74, 78, 82, 0.3)', borderRadius: '16px', padding: '28px' }}>
            <h3 style={{ fontSize: '16px', color: '#E2E8F0', marginBottom: '12px', fontFamily: "'DM Sans', sans-serif" }}>### Historical Snapshot (as of 2026-02-23)</h3>
            <p style={{ color: '#94A3B8', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', marginBottom: '12px' }}>
              Historical snapshot for comparison only.
            </p>
            <div style={{ padding: '16px', background: 'rgba(10, 10, 10, 0.4)', borderRadius: '8px', borderLeft: '2px solid rgba(74, 78, 82, 0.6)' }}>
              <p style={{ color: '#CBD5E1', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", margin: 0, lineHeight: '1.6' }}>
                Total portfolio: ~US$1,646,000. Incorporates structural BR real estate (~US$1,178,000) and physical gold (~US$8,000).
              </p>
            </div>
          </div>
        </section>

        {/* 10. Footer & Changelog */}
        <footer style={{ borderTop: '1px solid rgba(74, 78, 82, 0.3)', paddingTop: '32px', paddingBottom: '32px' }}>
          <section id="changelog" style={{ marginBottom: '32px' }}>
             <h3 style={{ fontSize: '16px', color: '#E2E8F0', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif" }}>### Changelog</h3>
             <ul style={{ color: '#94A3B8', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", paddingLeft: '20px', margin: 0 }}>
               <li>2026-03-13: Automated structural and consistency pass (totals, doctrine, mission-control header) by Antigravity agent.</li>
               <li>2026-03-13: Restored real estate Property Inventory correctly into dynamic view.</li>
               <li>2026-03-11: Automated structural and consistency pass by Antigravity agent.</li>
             </ul>
          </section>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#4A4E52', flexWrap: 'wrap', gap: '16px' }}>
            <div>© 2026 Giovannini Mare Capital LLC — Single-Family Office</div>
            <div>Convex Research Framework | 1 USD = {exchangeRate.toFixed(4)} BRL{macroData?.online ? ' · live' : macroData?.fromCache ? ' · cached' : ' · fallback'}</div>
          </div>
        </footer>

        {/* 9. MACRO CONTEXT — Live Brazil + Global Signals */}
        <div id="s9-macro">
          <MacroContextSection
            macroData={macroData}
            onRefresh={async () => {
              const fresh = await triggerRefresh();
              if (fresh) {
                setMacroData(fresh);
                const live = fresh.ptaxUsdBrl;
                if (live && live > 1 && live < 20) setExchangeRate(live);
              }
            }}
          />
        </div>

        {/* REPORTS — Convex Research Library */}
        <div id="s10-reports">
          <ConvexReportsSection />
        </div>

      </div>
      </main>
    </div>
  );
};

export default GMCDashboard;
