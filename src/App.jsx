
import React, { useState, useEffect, useMemo } from 'react';
import { Shield, TrendingUp, Building2, Wallet, Globe, AlertTriangle, Activity, Gem, Target, Layers, MapPin, Edit3, DollarSign } from 'lucide-react';

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

const GMCDashboard = () => {
  // --- REAL ESTATE & OVERALL PORTFOLIO STATE ---
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  
  // Currency conversion state
  const [exchangeRate, setExchangeRate] = useState(5.85); // USD to BRL
  const [displayCurrency, setDisplayCurrency] = useState('BRL');

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

  const asOfDate = "2026-03-11";
  
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
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #121212 50%, #0A0A0A 100%)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      color: '#E2E8F0',
      padding: '24px',
    }}>
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
            <p style={{ color: '#D0FF00', fontSize: '14px', letterSpacing: '1px', margin: 0, fontFamily: "'DM Sans', sans-serif", fontWeight: 'bold' }}>
              Defensive convex regime — As of: {asOfDate}
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
          <div style={{ padding: '40px', background: 'rgba(10, 10, 10, 0.4)', border: '1px dashed rgba(74, 78, 82, 0.4)', borderRadius: '12px', color: '#4A4E52', fontFamily: "monospace", textAlign: 'center', marginBottom: '24px' }}>
            {/* CHART PLACEHOLDER: donut – USD vs Real Estate */}
            &lt;!-- CHART PLACEHOLDER: donut – USD vs Real Estate --&gt;
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

        {/* 2b. Real Estate / Property Inventory */}
        <section id="s2b-realestate" style={{ marginBottom: '48px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
             <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
               REAL ESTATE INVENTORY (BR)
             </h2>
             <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                background: 'rgba(18, 18, 18, 0.8)',
                border: '1px solid rgba(74, 78, 82, 0.4)',
                borderRadius: '12px',
              }}>
                <DollarSign size={16} style={{ color: '#C0C0C0' }} />
                <button
                  onClick={() => setDisplayCurrency('BRL')}
                  style={{
                    padding: '6px 12px',
                    background: displayCurrency === 'BRL' ? 'rgba(208, 255, 0, 0.2)' : 'transparent',
                    border: displayCurrency === 'BRL' ? '1px solid rgba(208, 255, 0, 0.4)' : '1px solid transparent',
                    borderRadius: '6px',
                    color: displayCurrency === 'BRL' ? '#D0FF00' : '#4A4E52',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                  }}
                >
                  BRL
                </button>
                <button
                  onClick={() => setDisplayCurrency('USD')}
                  style={{
                    padding: '6px 12px',
                    background: displayCurrency === 'USD' ? 'rgba(208, 255, 0, 0.2)' : 'transparent',
                    border: displayCurrency === 'USD' ? '1px solid rgba(208, 255, 0, 0.4)' : '1px solid transparent',
                    borderRadius: '6px',
                    color: displayCurrency === 'USD' ? '#D0FF00' : '#4A4E52',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                  }}
                >
                  USD
                </button>
              </div>
           </div>
           
           <div style={{
              background: 'rgba(18, 18, 18, 0.6)',
              border: '1px solid rgba(74, 78, 82, 0.3)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(74, 78, 82, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '2px',
                  color: '#C0C0C0',
                  margin: 0,
                }}>
                  PROPERTY INVENTORY — EXPOSURE SUMMARY
                </h3>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#4A4E52',
                }}>
                  Total: <span style={{ color: '#D0FF00', fontWeight: '600' }}>{formatRealEstate(realEstateValue)}</span>
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: '#4A4E52' }}>
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
                          ? 'rgba(192, 192, 192, 0.1)' 
                          : 'rgba(10, 10, 10, 0.5)',
                        border: selectedProperty === property.id 
                          ? '1px solid rgba(192, 192, 192, 0.4)'
                          : '1px solid rgba(74, 78, 82, 0.2)',
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
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#4A4E52' }}>
                              ID: {property.id} {property.matricula && `• Matrícula: ${property.matricula}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: '500', color: '#D0FF00' }}>
                            {formatRealEstate(calculatedValue)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#4A4E52', fontFamily: "'DM Sans', sans-serif" }}>
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
                            background: 'rgba(192, 192, 192, 0.1)',
                            borderRadius: '6px',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '12px',
                            color: '#C0C0C0',
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
                              background: isEditing ? 'rgba(192, 192, 192, 0.2)' : 'rgba(192, 192, 192, 0.1)',
                              border: '1px dashed rgba(192, 192, 192, 0.4)',
                              borderRadius: '6px',
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '12px',
                              color: '#C0C0C0',
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
                                    background: 'rgba(10, 10, 10, 0.8)',
                                    border: '1px solid rgba(192, 192, 192, 0.4)',
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
                            background: 'rgba(192, 192, 192, 0.1)',
                            borderRadius: '6px',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '12px',
                            color: '#C0C0C0',
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
                              background: 'rgba(208, 255, 0, 0.1)',
                              border: '1px solid rgba(208, 255, 0, 0.3)',
                              borderRadius: '6px',
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '12px',
                              color: '#D0FF00',
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
           </div>
        </section>

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

             <div style={{ padding: '40px', background: 'rgba(10, 10, 10, 0.4)', border: '1px dashed rgba(74, 78, 82, 0.4)', borderRadius: '12px', color: '#4A4E52', fontFamily: "monospace", textAlign: 'center' }}>
               {/* CHART PLACEHOLDER: bar – CURRENT VS TARGET (CONVEX USD SLEEVE) */}
               &lt;!-- CHART PLACEHOLDER: bar – CURRENT VS TARGET (CONVEX USD SLEEVE) --&gt;
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

            <div style={{ padding: '40px', marginTop: '32px', background: 'rgba(10, 10, 10, 0.4)', border: '1px dashed rgba(74, 78, 82, 0.4)', borderRadius: '12px', color: '#4A4E52', fontFamily: "monospace", textAlign: 'center' }}>
               {/* CHART PLACEHOLDER: bar – EQUITIES & DIGITAL ASSETS BY INSTRUMENT */}
               &lt;!-- CHART PLACEHOLDER: bar – EQUITIES & DIGITAL ASSETS BY INSTRUMENT --&gt;
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

        {/* 8. Pending Asset Additions & FX View */}
        <section id="s8-pending" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
            8. PENDING ASSET ADDITIONS & FX VIEW
          </h2>
          <div style={{ background: 'rgba(18, 18, 18, 0.6)', border: '1px solid rgba(74, 78, 82, 0.3)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {pendingAssets.map(({ asset, status, role }) => (
                <div key={asset} style={{ background: 'rgba(192, 192, 192, 0.05)', border: '1px solid rgba(192, 192, 192, 0.2)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#F8FAFC', fontFamily: "'DM Sans', sans-serif" }}>{asset}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#94A3B8' }}>{role}</div>
                  <div style={{ marginTop: '12px', padding: '4px 10px', background: 'rgba(192, 192, 192, 0.1)', borderRadius: '4px', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", color: '#C0C0C0', display: 'inline-block' }}>
                    {status}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '20px', background: 'rgba(10, 10, 10, 0.4)', borderRadius: '12px', borderLeft: '4px solid #D0FF00' }}>
               <h3 style={{ fontSize: '14px', color: '#D0FF00', margin: '0 0 8px 0', fontFamily: "'DM Sans', sans-serif", letterSpacing: '1px' }}>FX RATE</h3>
               <p style={{ margin: 0, fontSize: '16px', fontFamily: "'DM Sans', sans-serif", color: '#E2E8F0', fontWeight: '500' }}>1 USD = 5.85 BRL</p>
            </div>
          </div>
        </section>

        {/* 9. Historical Snapshots */}
        <section id="s9-historical" style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', letterSpacing: '2px', color: '#C0C0C0', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
            9. HISTORICAL SNAPSHOTS
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
            <div>Convex Research Framework | 1 USD = 5.85 BRL</div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default GMCDashboard;
