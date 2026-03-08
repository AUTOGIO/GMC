import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Shield, TrendingUp, Building2, Wallet, Globe, AlertTriangle, Activity, Gem, Target, Layers, MapPin, Edit3, Check, X, DollarSign, ArrowRightLeft } from 'lucide-react';
import {
  convexPortfolio,
  gmcGlobalPortfolio,
  convexIntegrated,
  allInstruments,
  assetsSnapshotFromState,
  portfolioState,
} from './data/portfolioLoader';
const assetsSnapshot = assetsSnapshotFromState;

const gmcLogo = null;

const GMCDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [animatedValues, setAnimatedValues] = useState({ cash: 0, realEstate: 0, total: 0 });
  
  // Currency conversion state
  const [exchangeRate, setExchangeRate] = useState(5.85); // USD to BRL
  const [displayCurrency, setDisplayCurrency] = useState('BRL');
  const [editingRate, setEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState('5.85');

  // Properties with configurable m² prices
  const [properties, setProperties] = useState([
    { id: 1, type: 'Terreno', address: 'Loteamento Paraná Regina, SN, Nova Veneza', cep: '13183-513', area: null, pricePerM2: null, marketValue: 450000, taxAssessment: 130000, building: null, garages: null, mapsUrl: 'https://maps.google.com/?q=Loteamento+Parana+Regina+Nova+Veneza' },
    { id: 2, type: 'Apartamento', address: 'Rua Buarque de Macedo, 635, Vila Nova, Campinas', cep: '13073-018', area: 280, pricePerM2: 7377, marketValue: null, taxAssessment: 129173, building: 'Edifício Populus', garages: 4, mapsUrl: 'https://maps.google.com/?q=Rua+Buarque+de+Macedo+635+Campinas' },
    { id: 3, type: 'Casa', address: 'Av. Imperatriz Leopoldina, 10, Vila Nova, Campinas', cep: '13073-035', area: 50, pricePerM2: 7194, marketValue: null, taxAssessment: 26000, building: null, garages: null, mapsUrl: 'https://maps.google.com/?q=Av+Imperatriz+Leopoldina+10+Campinas' },
    { id: 4, type: 'Casa', address: 'Rua Franz Wilhelm Daffert, 484, Chapadão, Campinas', cep: '13070-161', area: 380, pricePerM2: 6139, marketValue: null, taxAssessment: 153307, building: null, garages: null, mapsUrl: 'https://maps.google.com/?q=Rua+Franz+Wilhelm+Daffert+484+Campinas' },
    { id: 5, type: 'Apartamento', address: 'Rua Hércules Florence, 367, Botafogo, Campinas', cep: '13020-170', area: 50, pricePerM2: 6432, marketValue: null, taxAssessment: 48100, building: null, garages: null, mapsUrl: 'https://maps.google.com/?q=Rua+Hercules+Florence+367+Campinas' },
    { id: 6, type: 'Apartamento', address: 'Rua Falcão Filho, 103, Campinas', cep: '13020-158', area: 70, pricePerM2: 6432, marketValue: null, taxAssessment: 82864, building: null, garages: null, mapsUrl: 'https://maps.google.com/?q=Rua+Falcao+Filho+103+Campinas' },
    { id: 7, type: 'Casa', address: 'Av. Imperatriz Leopoldina, 405, Vila Nova, Campinas', cep: '13073-035', area: 130, pricePerM2: 7194, marketValue: null, taxAssessment: 139000, building: null, garages: null, mapsUrl: 'https://maps.google.com/?q=Av+Imperatriz+Leopoldina+405+Campinas' },
    { id: 8, type: 'Apartamento', address: 'Rua Paulo Setúbal, 367 – Apt 41, 4º andar, Edifício Ébano, Campinas/SP', cep: null, area: 69, pricePerM2: 1631, marketValue: null, venalValue: 112493.80, taxAssessment: null, building: 'Edifício Ébano', garages: null, matricula: '103.496', cartorio: '2º Cartório de Registro de Imóveis', mapsUrl: 'https://maps.google.com/?q=Rua+Paulo+Setubal+367+Campinas' },
    { id: 9, type: 'Apartamento', address: 'Rua 14 de Dezembro, 51-59 – Apt 215, Edifício Pitangueiras, Campinas/SP', cep: null, area: 39, pricePerM2: 2717, marketValue: null, venalValue: 105961.38, taxAssessment: null, building: 'Edifício Pitangueiras', garages: null, matricula: '37.776', cartorio: '2º Cartório de Registro de Imóveis', mapsUrl: 'https://maps.google.com/?q=Rua+14+de+Dezembro+51+Campinas' },
    { id: 10, type: 'Apartamento', address: 'Rua Coronel Manuel de Morais, 317 – Apt 11, Edifício Pitangua, Campinas/SP', cep: null, area: 110, pricePerM2: 3624, marketValue: null, venalValue: 398687.67, taxAssessment: null, building: 'Edifício Pitangua', garages: null, matricula: '95.359', cartorio: '2º Cartório de Registro de Imóveis', mapsUrl: 'https://maps.google.com/?q=Rua+Coronel+Manuel+de+Morais+317+Campinas' },
    { id: 11, type: 'Vaga', address: 'Rua Coronel Manuel de Morais, 317 – Vaga 01, Edifício Pitangua, Campinas/SP', cep: null, area: null, pricePerM2: null, marketValue: null, venalValue: 17030.68, taxAssessment: null, building: 'Edifício Pitangua', garages: null, matricula: '95.360', cartorio: '2º Cartório de Registro de Imóveis', mapsUrl: 'https://maps.google.com/?q=Rua+Coronel+Manuel+de+Morais+317+Campinas' },
    { id: 12, type: 'Vaga', address: 'Rua Coronel Manuel de Morais, 317 – Vaga 02, Edifício Pitangua, Campinas/SP', cep: null, area: null, pricePerM2: null, marketValue: null, venalValue: 17030.68, taxAssessment: null, building: 'Edifício Pitangua', garages: null, matricula: '95.361', cartorio: '2º Cartório de Registro de Imóveis', mapsUrl: 'https://maps.google.com/?q=Rua+Coronel+Manuel+de+Morais+317+Campinas' },
  ]);

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

  // Liquid capital in USD; real estate stays in BRL (conversion only on Real Estate tab)
  const cashPositionUsd = 320000;
  const realEstateValueUsd = realEstateValue / exchangeRate;
  const totalPortfolioUsd = cashPositionUsd + realEstateValueUsd;

  // Format helpers: portfolio-level is always USD; Real Estate tab uses displayCurrency (BRL or USD)
  const formatUsdOnly = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatBRL = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatCurrency = (value, forceType = null) => {
    const currency = forceType || displayCurrency;
    const converted = currency === 'USD' ? value / exchangeRate : value;
    return currency === 'USD' ? formatUsdOnly(converted) : formatBRL(converted);
  };
  const formatRealEstate = (valueBRL) => displayCurrency === 'USD' ? formatUsdOnly(valueBRL / exchangeRate) : formatBRL(valueBRL);

  // Animation effect
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedValues({
        cash: Math.floor(cashPositionUsd * eased),
        realEstate: Math.floor(realEstateValueUsd * eased),
        total: Math.floor(totalPortfolioUsd * eased),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [realEstateValue, exchangeRate]);

  // Update property price per m²
  const updatePropertyPrice = (propertyId, newPrice) => {
    setProperties(prev => prev.map(p => 
      p.id === propertyId ? { ...p, pricePerM2: parseFloat(newPrice) || 0 } : p
    ));
    setEditingProperty(null);
  };

  // Target allocation from gmc_portfolio_state.json (Q1 2026 USD-only)
  const GMC_LABELS = {
    cash: 'Cash',
    bonds: 'Bonds',
    gold: 'Gold',
    equities: 'Equities',
    bitcoin: 'Bitcoin',
  };
  const GMC_COLORS = ['#D4AF37', '#F59E0B', '#8B5CF6', '#10B981', '#3B82F6', '#6366F1', '#EF4444', '#64748B'];
  const targetWeights = gmcGlobalPortfolio?.top_level_target_weights_pct || {};
  const allocationData = Object.entries(targetWeights).map(([key, value], i) => ({
    name: GMC_LABELS[key] || key,
    value: Number(value) || 0,
    color: GMC_COLORS[i % GMC_COLORS.length],
    description: gmcGlobalPortfolio.base_currency === 'USD' ? 'USD' : '',
  }));

  const currentAllocation = [
    { name: 'Cash (USD)', value: cashPositionUsd, color: '#10B981' },
    { name: 'Real Estate (USD equiv.)', value: realEstateValueUsd, color: '#6366F1' },
  ];

  // Convex allocation — from convex_portfolio_updated_holdings01 (target weights + macro)
  const allocationObj = convexPortfolio.allocation || {};
  const ALLOC_LABELS = { cash: 'Cash', bonds: 'Bonds', gold: 'Gold', equities: 'Equities', bitcoin: 'Bitcoin' };
  const ALLOC_COLORS = ['#D4AF37', '#F59E0B', '#8B5CF6', '#10B981', '#3B82F6', '#6366F1', '#EF4444', '#64748B'];
  const convexAllocationPie = Object.entries(allocationObj).map(([key, v], i) => ({ name: ALLOC_LABELS[key] || key, value: v.weight_percent ?? 0, color: ALLOC_COLORS[i % ALLOC_COLORS.length] }));
  const macroContext = convexPortfolio.macro_context || {};
  const formatUsd = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  // Macro signals
  const macroSignals = [
    { indicator: 'CFM (Crypto)', value: '10%', status: 'caution', description: 'Fragility elevated' },
    { indicator: 'VISA Ações', value: '30%', status: 'active', description: 'Moderate exposure' },
    { indicator: 'Gold', value: 'No cap', status: 'safe', description: 'Fully justified' },
    { indicator: 'BRL', value: 'Underweight', status: 'caution', description: 'Tactical only' },
  ];

  const pendingAssets = [
    { asset: 'Gold (oz)', status: 'Planned', role: 'Anti-fragile reserve' },
    { asset: 'Bitcoin (BTC)', status: 'Planned', role: 'Convex optionality' },
    { asset: 'Foreign ETFs', status: 'Planned', role: 'Global equities' },
    { asset: 'USD Exposure', status: 'Planned', role: 'BRL hedge' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return '#10B981';
      case 'active': return '#3B82F6';
      case 'caution': return '#F59E0B';
      case 'danger': return '#EF4444';
      default: return '#6B7280';
    }
  };

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

  // Currency Toggle Component
  const CurrencyToggle = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      background: 'rgba(30, 41, 59, 0.8)',
      border: '1px solid rgba(71, 85, 105, 0.4)',
      borderRadius: '12px',
    }}>
      <DollarSign size={16} style={{ color: '#D4AF37' }} />
      
      <button
        onClick={() => setDisplayCurrency('BRL')}
        style={{
          padding: '6px 12px',
          background: displayCurrency === 'BRL' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
          border: displayCurrency === 'BRL' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
          borderRadius: '6px',
          color: displayCurrency === 'BRL' ? '#10B981' : '#64748B',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          fontWeight: '600',
        }}
      >
        R$ BRL
      </button>
      
      <ArrowRightLeft size={14} style={{ color: '#475569' }} />
      
      <button
        onClick={() => setDisplayCurrency('USD')}
        style={{
          padding: '6px 12px',
          background: displayCurrency === 'USD' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
          border: displayCurrency === 'USD' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
          borderRadius: '6px',
          color: displayCurrency === 'USD' ? '#3B82F6' : '#64748B',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          fontWeight: '600',
        }}
      >
        $ USD
      </button>

      <div style={{ 
        width: '1px', 
        height: '24px', 
        background: 'rgba(71, 85, 105, 0.4)',
        margin: '0 4px',
      }} />

      {editingRate ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#64748B', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }}>1 USD =</span>
          <input
            type="number"
            value={tempRate}
            onChange={(e) => setTempRate(e.target.value)}
            style={{
              width: '60px',
              padding: '4px 8px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '4px',
              color: '#F8FAFC',
              fontSize: '12px',
              fontFamily: "'DM Sans', sans-serif",
            }}
            step="0.01"
          />
          <span style={{ color: '#64748B', fontSize: '11px' }}>BRL</span>
          <button
            onClick={() => {
              setExchangeRate(parseFloat(tempRate) || 5.85);
              setEditingRate(false);
            }}
            style={{
              padding: '4px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Check size={12} style={{ color: '#10B981' }} />
          </button>
          <button
            onClick={() => {
              setTempRate(exchangeRate.toString());
              setEditingRate(false);
            }}
            style={{
              padding: '4px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={12} style={{ color: '#EF4444' }} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditingRate(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            background: 'transparent',
            border: '1px dashed rgba(71, 85, 105, 0.4)',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#94A3B8',
            fontSize: '11px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span>1 USD = {exchangeRate.toFixed(2)} BRL</span>
          <Edit3 size={10} />
        </button>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      color: '#E2E8F0',
      padding: '24px',
    }}>
      {/* GMC logo watermark background (optional: add Giovannini_Mare_Capital/logotype/gmc_logo.jpg) */}
      {gmcLogo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url(${gmcLogo})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.12,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}
      {/* Noise overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity: 0.03,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <Gem size={28} style={{ color: '#D4AF37' }} />
              <h1 style={{
                fontSize: '32px',
                fontWeight: '600',
                letterSpacing: '3px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4E4BC 50%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
              }}>
                GIOVANNINI MARE CAPITAL
              </h1>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '14px', letterSpacing: '2px', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              SINGLE-FAMILY OFFICE • RISK-FIRST ALLOCATION
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Activity size={14} style={{ color: '#10B981' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#10B981', letterSpacing: '1px' }}>
                  DEFENSIVE-CONVEX
                </span>
              </div>
              <span style={{ color: '#64748B', fontFamily: "'DM Sans', sans-serif", fontSize: '12px' }}>
                Q1 2026
              </span>
            </div>
            {activeTab === 'properties' && <CurrencyToggle />}
          </div>
        </header>

        {/* Navigation */}
        <nav style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'overview', label: 'Portfolio Overview', icon: Layers },
            { id: 'allocation', label: 'Asset Allocation', icon: PieChart },
            { id: 'properties', label: 'Real Estate', icon: Building2 },
            { id: 'macro', label: 'Macro Signals', icon: Globe },
            { id: 'philosophy', label: 'Philosophy', icon: Target },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '12px 24px',
                background: activeTab === id 
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)'
                  : 'rgba(30, 41, 59, 0.5)',
                border: activeTab === id ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '8px',
                color: activeTab === id ? '#D4AF37' : '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Key Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
            }}>
              {[
                { label: 'Total Portfolio', value: animatedValues.total, icon: Wallet, color: '#D4AF37', gradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)' },
                { label: 'Liquid Capital', value: animatedValues.cash, icon: Shield, color: '#10B981', gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)' },
                { label: 'Real Estate', value: animatedValues.realEstate, icon: Building2, color: '#6366F1', gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)' },
              ].map(({ label, value, icon: Icon, color, gradient }) => (
                <div key={label} style={{
                  background: gradient,
                  border: `1px solid ${color}33`,
                  borderRadius: '16px',
                  padding: '28px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '100px',
                    height: '100px',
                    background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                    borderRadius: '50%',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      background: `${color}20`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={22} style={{ color }} />
                    </div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#94A3B8', letterSpacing: '1px' }}>
                      {label.toUpperCase()}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '500',
                    color: '#F8FAFC',
                    letterSpacing: '-1px',
                  }}>
                    {formatUsdOnly(value)}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}>
              {[
                { label: 'Properties', value: '12', sublabel: 'Total units' },
                { label: 'Total Area', value: `${properties.reduce((sum, p) => sum + (p.area || 0), 0).toLocaleString()} m²`, sublabel: 'Built area' },
                { label: 'Cash Ratio', value: `${((cashPositionUsd / totalPortfolioUsd) * 100).toFixed(1)}%`, sublabel: 'of portfolio (USD)' },
              ].map(({ label, value, sublabel }) => (
                <div key={label} style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>
                    {label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '500', color: '#F8FAFC', marginBottom: '4px' }}>
                    {value}
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#94A3B8' }}>
                    {sublabel}
                  </div>
                </div>
              ))}
            </div>

            {/* Regime badge from portfolio state */}
            {portfolioState?.regime_engine?.current_regime && (
              <div style={{
                marginBottom: '24px',
                padding: '10px 16px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#A5B4FC',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <span style={{ color: '#64748B', marginRight: '8px' }}>Regime:</span>
                {String(portfolioState.regime_engine.current_regime).replace(/_/g, ' ')}
              </div>
            )}

            {/* Convex allocation — from gmc_portfolio_state.json */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '32px',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '2px',
                color: '#F59E0B',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <TrendingUp size={16} />
                {convexPortfolio.portfolio_name ?? 'Convex Allocation'} — {convexPortfolio.version ?? ''} ({convexPortfolio.base_currency})
              </h3>
              {Object.keys(macroContext).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', marginBottom: '20px', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#94A3B8' }}>
                  {Object.entries(macroContext).map(([k, v]) => (
                    <div key={k} style={{ padding: '8px', background: 'rgba(71, 85, 105, 0.3)', borderRadius: '6px' }}>
                      <span style={{ color: '#64748B' }}>{String(k).replace(/_/g, ' ')}:</span> {String(v)}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {Object.entries(allocationObj).map(([key, v], idx) => (
                  <div key={key} style={{
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '8px',
                    padding: '14px',
                  }}>
                    <div style={{ fontWeight: '500', color: '#F8FAFC', marginBottom: '4px' }}>{ALLOC_LABELS[key] || key}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', color: '#F59E0B', marginBottom: '6px' }}>{v.weight_percent}%</div>
                    {(v.vehicle_type || v.ticker || v.duration_target) && (
                      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>{v.vehicle_type || v.ticker || v.duration_target}</div>
                    )}
                    {Array.isArray(v.tickers_examples) && v.tickers_examples.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '6px' }}>Instruments: {v.tickers_examples.join(', ')}</div>
                    )}
                    {Array.isArray(v.role) && v.role.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{v.role.join(' · ')}</div>
                    )}
                  </div>
                ))}
              </div>
              {convexPortfolio.review_frequency && (
                <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748B', fontFamily: "'DM Sans', sans-serif" }}>Review: {convexPortfolio.review_frequency}</div>
              )}
            </div>

            {/* Real Holdings — physical/cash (from Assets_) */}
            {assetsSnapshot?.real_holdings && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '32px',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#D4AF37',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Shield size={16} />
                  Real Holdings (no valuation / no FX)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                  {Object.entries(assetsSnapshot.real_holdings).map(([key, val]) => (
                    <div key={key} style={{
                      background: 'rgba(212, 175, 55, 0.06)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      borderRadius: '8px',
                      padding: '14px',
                    }}>
                      <div style={{ fontSize: '11px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#F8FAFC' }}>
                        {typeof val === 'number' && key.includes('oz') ? `${val} oz` : typeof val === 'number' && key.includes('btc') ? `${val.toFixed(8)} BTC` : typeof val === 'number' && key.includes('chf') ? `${val.toLocaleString('en-US')} CHF` : typeof val === 'number' && (key.includes('usd') || key.includes('bank')) ? formatUsd(val) : typeof val === 'number' ? formatUsd(val) : String(val)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Convex USD Snapshot — from Assets_ (live-updates when JSON changes) */}
            {assetsSnapshot && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '32px',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#10B981',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Wallet size={16} />
                  Convex USD Snapshot
                </h3>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
                  Source: <code style={{ background: 'rgba(71, 85, 105, 0.4)', padding: '2px 6px', borderRadius: '4px' }}>data/portfolio/gmc_portfolio_state.json</code>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '14px',
                  }}>
                    <div style={{ fontSize: '11px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>TOTAL (USD)</div>
                    <div style={{ fontSize: '22px', fontWeight: '600', color: '#10B981' }}>{formatUsd(assetsSnapshot.total_usd_value ?? 0)}</div>
                  </div>
                  {assetsSnapshot.breakdown && (() => {
                    const pctKey = { bitcoin_usd: 'btc_pct', gold_usd: 'gold_pct', usd_bank: 'usd_bank_pct', usd_cash: 'usd_cash_pct' };
                    return Object.entries(assetsSnapshot.breakdown).map(([key, val]) => (
                      <div key={key} style={{
                        background: 'rgba(71, 85, 105, 0.2)',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        borderRadius: '8px',
                        padding: '14px',
                      }}>
                        <div style={{ fontSize: '11px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>
                          {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#F8FAFC' }}>{formatUsd(val)}</div>
                        {assetsSnapshot.normalized_percentages?.[pctKey[key]] != null && (
                          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                            {Number(assetsSnapshot.normalized_percentages[pctKey[key]]).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
                {assetsSnapshot.normalized_percentages && assetsSnapshot.targets && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', fontSize: '12px', color: '#94A3B8' }}>
                    <strong style={{ color: '#E2E8F0' }}>Current vs target (%):</strong> Gold {assetsSnapshot.normalized_percentages.gold_pct?.toFixed(1)}% (target {assetsSnapshot.targets.gold}%) · BTC {assetsSnapshot.normalized_percentages.btc_pct?.toFixed(1)}% (target {assetsSnapshot.targets.btc}%) · Liquidity (bank+cash) {((assetsSnapshot.normalized_percentages.usd_bank_pct ?? 0) + (assetsSnapshot.normalized_percentages.usd_cash_pct ?? 0)).toFixed(1)}% (target {assetsSnapshot.targets.liquidity_bucket}%)
                  </div>
                )}
              </div>
            )}

            {/* Rebalance Engine — steps + inputs (from Assets_.rebalance_engine) */}
            {assetsSnapshot?.rebalance_engine && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '32px',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#6366F1',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Target size={16} />
                  Rebalance Engine
                </h3>
                {assetsSnapshot.rebalance_engine.inputs && (
                  <div style={{ marginBottom: '16px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px' }}>
                    <div style={{ color: '#64748B', marginBottom: '8px' }}>Deviation threshold: {assetsSnapshot.rebalance_engine.inputs.deviation_threshold_pct}%</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', color: '#94A3B8' }}>
                      {assetsSnapshot.rebalance_engine.inputs.current_usd_values && Object.entries(assetsSnapshot.rebalance_engine.inputs.current_usd_values).map(([k, v]) => (
                        <span key={k}>{k.replace(/_/g, ' ')}: {formatUsd(v)}</span>
                      ))}
                    </div>
                  </div>
                )}
                <ol style={{ margin: 0, paddingLeft: '20px', color: '#E2E8F0', fontSize: '13px', lineHeight: '1.8' }}>
                  {(assetsSnapshot.rebalance_engine.steps || []).map((step, idx) => (
                    <li key={idx}>
                      <strong style={{ color: '#A5B4FC' }}>{step.name}</strong> — {step.action}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Convex Integrated Portfolio — gavetas from gmc_portfolio_state.json */}
            {convexIntegrated?.portfolio_name && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '32px',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#F59E0B',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <TrendingUp size={16} />
                  {convexIntegrated.portfolio_name}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>Structure: {convexIntegrated.structure_reference}</div>
                {convexIntegrated.buckets && Object.entries(convexIntegrated.buckets).map(([bucketKey, bucket]) => (
                  <div key={bucketKey} style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
                      {bucket.name} — {(bucket.target_weight * 100).toFixed(0)}% · {formatUsd(bucket.target_amount_usd ?? 0)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>{bucket.role}</div>
                    {bucket.components?.length > 0 && (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.5)' }}>
                              <th style={{ padding: '8px', textAlign: 'left', color: '#64748B' }}>Asset Class</th>
                              <th style={{ padding: '8px', textAlign: 'right', color: '#64748B' }}>Weight</th>
                              <th style={{ padding: '8px', textAlign: 'right', color: '#64748B' }}>Amount USD</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bucket.components.map((c, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.2)' }}>
                                <td style={{ padding: '8px', color: '#F8FAFC' }}>{c.asset_class}</td>
                                <td style={{ padding: '8px', textAlign: 'right', color: '#F59E0B' }}>{(c.weight * 100).toFixed(0)}%</td>
                                <td style={{ padding: '8px', textAlign: 'right', color: '#94A3B8' }}>{formatUsd(c.amount_usd ?? 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
                {convexIntegrated.notes?.length > 0 && (
                  <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748B' }}>
                    {convexIntegrated.notes.map((n, i) => (
                      <div key={i} style={{ marginBottom: '4px' }}>• {n}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Instrument table from gmc_portfolio_state.json */}
            {allInstruments?.length > 0 && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '32px',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#94A3B8',
                  marginBottom: '16px',
                }}>
                  Portfolio instruments (target)
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.5)' }}>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#64748B' }}>Asset</th>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#64748B' }}>Name</th>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#64748B' }}>Ticker</th>
                        <th style={{ padding: '8px', textAlign: 'right', color: '#64748B' }}>Amount USD</th>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#64748B' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allInstruments.map((inst, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.2)' }}>
                          <td style={{ padding: '8px', color: '#F8FAFC' }}>{inst.asset_class}</td>
                          <td style={{ padding: '8px', color: '#E2E8F0' }}>{inst.name}</td>
                          <td style={{ padding: '8px', color: '#94A3B8' }}>{inst.ticker ?? '—'}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: '#10B981' }}>{formatUsd(inst.amount_usd ?? 0)}</td>
                          <td style={{ padding: '8px', color: '#F59E0B' }}>{inst.execution_status ?? 'planned'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pending Assets */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '16px',
              padding: '28px',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '2px',
                color: '#F59E0B',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <AlertTriangle size={16} />
                PENDING ASSET ADDITIONS
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {pendingAssets.map(({ asset, status, role }) => (
                  <div key={asset} style={{
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '8px',
                    padding: '16px',
                  }}>
                    <div style={{ fontWeight: '500', marginBottom: '4px', color: '#F8FAFC' }}>{asset}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#94A3B8' }}>{role}</div>
                    <div style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#F59E0B',
                      display: 'inline-block',
                    }}>
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Allocation Tab */}
        {activeTab === 'allocation' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              {/* Target Allocation */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '16px',
                padding: '28px',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#D4AF37',
                  marginBottom: '24px',
                }}>
                  {gmcGlobalPortfolio?.portfolio_name ?? 'TARGET ALLOCATION'} — {gmcGlobalPortfolio?.as_of_date ?? 'Q1 2026'} ({gmcGlobalPortfolio?.base_currency ?? 'USD'})
                </h3>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '20px' }}>
                  {allocationData.map(({ name, value, color, description }) => (
                    <div key={name} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }} />
                        <div>
                          <div style={{ fontWeight: '500', color: '#F8FAFC' }}>{name}</div>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#64748B' }}>{description}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '500', color }}>{value}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Allocation */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '16px',
                padding: '28px',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#D4AF37',
                  marginBottom: '24px',
                }}>
                  CURRENT ALLOCATION
                </h3>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {currentAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '20px' }}>
                  {currentAllocation.map(({ name, value, color }) => (
                    <div key={name} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }} />
                        <span style={{ fontWeight: '500', color: '#F8FAFC' }}>{name}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '18px', fontWeight: '500', color }}>{formatUsdOnly(value)}</span>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#64748B', marginLeft: '8px' }}>
                          ({((value / totalPortfolioUsd) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Convex target allocation (holdings01) */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '16px',
                padding: '28px',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#F59E0B',
                  marginBottom: '8px',
                }}>
                  CONVEX TARGET — {convexPortfolio.portfolio_name ?? 'Global USD'} ({convexPortfolio.total_weight_check ?? 100}%)
                </h3>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={convexAllocationPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {convexAllocationPie.map((entry, index) => (
                          <Cell key={`convex-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '20px' }}>
                  {convexAllocationPie.map(({ name, value, color }) => (
                    <div key={name} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }} />
                        <span style={{ fontWeight: '500', color: '#F8FAFC' }}>{name}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '500', color }}>{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barbell Strategy */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '16px',
              padding: '28px',
              marginTop: '24px',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '2px',
                color: '#D4AF37',
                marginBottom: '24px',
              }}>
                BARBELL STRATEGY — CONVEX ALLOCATION
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '32px',
                alignItems: 'center',
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Shield size={20} style={{ color: '#10B981' }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', letterSpacing: '1px', color: '#10B981' }}>
                      PROTECTION SIDE
                    </span>
                  </div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>Don't Die</div>
                  <ul style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#94A3B8', margin: '12px 0', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '6px' }}>Cash / T-bills</li>
                    <li style={{ marginBottom: '6px' }}>USD exposure</li>
                    <li style={{ marginBottom: '6px' }}>Gold / Reserve assets</li>
                    <li>Sovereign bonds</li>
                  </ul>
                </div>

                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)',
                  border: '2px solid rgba(212, 175, 55, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  color: '#D4AF37',
                  textAlign: 'center',
                  letterSpacing: '1px',
                }}>
                  REBALANCE<br/>ENGINE
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <TrendingUp size={20} style={{ color: '#F59E0B' }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', letterSpacing: '1px', color: '#F59E0B' }}>
                      OPTIONALITY SIDE
                    </span>
                  </div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>Asymmetric Upside</div>
                  <ul style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#94A3B8', margin: '12px 0', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '6px' }}>Bitcoin / Crypto</li>
                    <li style={{ marginBottom: '6px' }}>Select equities</li>
                    <li style={{ marginBottom: '6px' }}>Commodities</li>
                    <li>REITs / Real assets</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Property Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}>
              {[
                { label: 'Total Properties', value: '12' },
                { label: 'Apartments', value: properties.filter(p => p.type === 'Apartamento').length },
                { label: 'Houses', value: properties.filter(p => p.type === 'Casa').length },
                { label: 'Parking', value: properties.filter(p => p.type === 'Vaga').length },
                { label: 'Land', value: properties.filter(p => p.type === 'Terreno').length },
                { label: 'Total Area', value: `${properties.reduce((sum, p) => sum + (p.area || 0), 0).toLocaleString()} m²` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '8px',
                  padding: '14px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: '#64748B', letterSpacing: '1px', marginBottom: '4px' }}>
                    {label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '500', color: '#6366F1' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Property Cards */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#D4AF37',
                  margin: 0,
                }}>
                  PROPERTY INVENTORY — CLICK TO EDIT m² PRICE
                </h3>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#64748B',
                }}>
                  Total: <span style={{ color: '#10B981', fontWeight: '600' }}>{formatRealEstate(realEstateValue)}</span>
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: '#64748B' }}>
                    ({displayCurrency === 'USD' ? formatBRL(realEstateValue) : formatUsdOnly(realEstateValueUsd)})
                  </span>
                </div>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {properties.map((property) => {
                  const calculatedValue = getCalculatedValue(property);
                  const isEditing = editingProperty === property.id;
                  
                  return (
                    <div
                      key={property.id}
                      style={{
                        background: selectedProperty === property.id 
                          ? 'rgba(99, 102, 241, 0.1)' 
                          : 'rgba(15, 23, 42, 0.5)',
                        border: selectedProperty === property.id 
                          ? '1px solid rgba(99, 102, 241, 0.4)'
                          : '1px solid rgba(71, 85, 105, 0.2)',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => setSelectedProperty(selectedProperty === property.id ? null : property.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>{getTypeIcon(property.type)}</span>
                          <div>
                            <div style={{ fontWeight: '500', color: '#F8FAFC', marginBottom: '2px' }}>
                              {property.type}
                              {property.building && <span style={{ color: '#94A3B8', fontWeight: '400' }}> — {property.building}</span>}
                            </div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#64748B' }}>
                              ID: {property.id} {property.matricula && `• Matrícula: ${property.matricula}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: '500', color: '#10B981' }}>
                            {formatRealEstate(calculatedValue)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', fontFamily: "'DM Sans', sans-serif" }}>
                            {displayCurrency === 'USD' ? formatBRL(calculatedValue) : formatUsdOnly(calculatedValue / exchangeRate)}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#CBD5E1', marginBottom: '12px' }}>
                        {property.address}
                      </div>

                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {property.area && (
                          <div style={{
                            padding: '6px 12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '6px',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '12px',
                            color: '#3B82F6',
                          }}>
                            📐 {property.area} m²
                          </div>
                        )}

                        {property.area && property.pricePerM2 !== null && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProperty(property.id);
                            }}
                            style={{
                              padding: '6px 12px',
                              background: isEditing ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.1)',
                              border: '1px dashed rgba(212, 175, 55, 0.4)',
                              borderRadius: '6px',
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '12px',
                              color: '#D4AF37',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            {isEditing ? (
                              <>
                                <span>R$/m²:</span>
                                <input
                                  type="number"
                                  defaultValue={property.pricePerM2}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updatePropertyPrice(property.id, e.target.value);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingProperty(null);
                                    }
                                  }}
                                  onBlur={(e) => updatePropertyPrice(property.id, e.target.value)}
                                  autoFocus
                                  style={{
                                    width: '70px',
                                    padding: '2px 6px',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(212, 175, 55, 0.4)',
                                    borderRadius: '4px',
                                    color: '#F8FAFC',
                                    fontSize: '12px',
                                    fontFamily: "'DM Sans', sans-serif",
                                  }}
                                />
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
                          <div style={{
                            padding: '6px 12px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '6px',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '12px',
                            color: '#8B5CF6',
                          }}>
                            🚗 {property.garages} vagas
                          </div>
                        )}

                        {property.mapsUrl && (
                          <a
                            href={property.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '6px',
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '12px',
                              color: '#10B981',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <MapPin size={12} />
                            Google Maps
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{
                padding: '16px 24px',
                background: 'rgba(15, 23, 42, 0.5)',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                borderTop: '1px solid rgba(71, 85, 105, 0.3)',
              }}>
                <span style={{ color: '#64748B' }}>Total Market Value</span>
                <div>
                  <span style={{ color: '#10B981', fontWeight: '600', fontSize: '18px' }}>{formatRealEstate(realEstateValue)}</span>
                  <span style={{ color: '#64748B', marginLeft: '12px' }}>
                    ({displayCurrency === 'USD' ? formatBRL(realEstateValue) : formatUsdOnly(realEstateValueUsd)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Macro Tab */}
        {activeTab === 'macro' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(30, 41, 59, 0.6) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Globe size={24} style={{ color: '#10B981' }} />
                <h3 style={{ fontSize: '18px', margin: 0, color: '#F8FAFC' }}>Current Macro Environment — Q1 2026</h3>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: '#CBD5E1',
              }}>
                <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px' }}>
                  <strong style={{ color: '#F59E0B' }}>Geopolitical:</strong> Iran in existential crisis → elevated oil/commodity risk premium
                </div>
                <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px' }}>
                  <strong style={{ color: '#F59E0B' }}>US Macro:</strong> Potential debt monetization → USD structural fragility building
                </div>
                <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px' }}>
                  <strong style={{ color: '#F59E0B' }}>Brazil:</strong> BRL under pressure → structural underweight, tactical only
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '16px',
              padding: '28px',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '2px',
                color: '#D4AF37',
                marginBottom: '24px',
              }}>
                ALLOCATION SIGNALS
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {macroSignals.map(({ indicator, value, status, description }) => (
                  <div key={indicator} style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: `1px solid ${getStatusColor(status)}33`,
                    borderRadius: '12px',
                    padding: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: getStatusColor(status),
                      boxShadow: `0 0 8px ${getStatusColor(status)}`,
                    }} />
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#64748B', letterSpacing: '1px', marginBottom: '8px' }}>
                      {indicator.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '500', color: getStatusColor(status), marginBottom: '4px' }}>
                      {value}
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#94A3B8' }}>
                      {description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Philosophy Tab */}
        {activeTab === 'philosophy' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(30, 41, 59, 0.6) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '16px',
              padding: '40px',
              marginBottom: '24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '3px', color: '#D4AF37', marginBottom: '20px' }}>
                CORE DOCTRINE
              </div>
              <blockquote style={{
                fontSize: '22px',
                fontStyle: 'italic',
                color: '#F8FAFC',
                lineHeight: '1.6',
                margin: '0 auto',
                maxWidth: '800px',
              }}>
                "Capital is preserved by surviving adverse regimes and compounded by exploiting asymmetries — not by prediction, leverage, or constant activity."
              </blockquote>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '24px',
            }}>
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '16px',
                padding: '28px',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#D4AF37',
                  marginBottom: '20px',
                }}>
                  CORE OBJECTIVES (HIERARCHY)
                </h3>
                <ol style={{ margin: 0, paddingLeft: '24px' }}>
                  {[
                    'Avoid permanent capital loss',
                    'Preserve purchasing power (BRL-real terms)',
                    'Exploit macro regime transitions',
                    'Capture convex asymmetries',
                    'Compound capital selectively',
                  ].map((item, idx) => (
                    <li key={idx} style={{
                      padding: '12px 0',
                      borderBottom: idx < 4 ? '1px solid rgba(71, 85, 105, 0.2)' : 'none',
                      fontFamily: "'DM Sans', sans-serif",
                      color: idx === 0 ? '#EF4444' : idx === 1 ? '#F59E0B' : '#94A3B8',
                      fontWeight: idx < 2 ? '500' : '400',
                    }}>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '16px',
                padding: '28px',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#EF4444',
                  marginBottom: '20px',
                }}>
                  PROHIBITED PRACTICES
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {[
                    'Excess leverage (any form)',
                    'Illiquid structured products',
                    'Benchmark hugging',
                    'Yield-chasing without risk asymmetry',
                    'Short-term trading as core strategy',
                    'Home-country bias (Brazil overweight)',
                  ].map((item, idx) => (
                    <li key={idx} style={{
                      padding: '10px 0',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '13px',
                      color: '#94A3B8',
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(30, 41, 59, 0.6) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '16px',
              padding: '28px',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '2px',
                color: '#EF4444',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <AlertTriangle size={18} />
                RISK DEFINITION
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}>
                {[
                  'Permanent capital impairment',
                  'Forced liquidation',
                  'Loss of optionality during crises',
                ].map((risk, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#F8FAFC',
                  }}>
                    {risk}
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: '#10B981',
                textAlign: 'center',
              }}>
                <strong>Volatility alone is NOT risk.</strong>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(71, 85, 105, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          color: '#64748B',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            © 2026 Giovannini Mare Capital LLC — Single-Family Office
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Last Updated: February 23, 2026</span>
            <span style={{ color: '#475569' }}>|</span>
            <span>Convex Research Framework</span>
            <span style={{ color: '#475569' }}>|</span>
            <span>Rate: 1 USD = {exchangeRate.toFixed(2)} BRL</span>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        * {
          box-sizing: border-box;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }
        
        button:hover {
          filter: brightness(1.1);
        }
        
        a:hover {
          filter: brightness(1.2);
        }
        
        input:focus {
          outline: none;
          border-color: rgba(212, 175, 55, 0.6) !important;
        }
      `}</style>
    </div>
  );
};

export default GMCDashboard;
