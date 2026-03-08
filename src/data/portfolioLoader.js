/**
 * Loads GMC portfolio state from data/portfolio/gmc_portfolio_state.json
 * and exposes it in shapes expected by the dashboard (convexPortfolio, gmcGlobalPortfolio, convexIntegrated, portfolioState).
 */
import portfolioState from '../../data/portfolio/gmc_portfolio_state.json';

const state = portfolioState;
const totalUsd = state.portfolio_summary?.total_capital_usd ?? 0;

// Build allocation object for Convex section: key -> { weight_percent, vehicle_type, tickers_examples, role }
const allocation = {};
(state.asset_allocation || []).forEach((a) => {
  const tickers = (a.instruments || [])
    .map((i) => i.ticker)
    .filter(Boolean);
  allocation[a.asset_class_id] = {
    weight_percent: Math.round((a.target_weight ?? 0) * 100),
    vehicle_type: a.instruments?.[0]?.instrument_type ?? 'mixed',
    tickers_examples: tickers.length ? tickers : [a.asset_class],
    role: a.role ? [a.role] : [],
  };
});

// Convex portfolio (legacy shape for Overview + Allocation tab)
export const convexPortfolio = {
  portfolio_name: state.portfolio_name,
  version: state.last_update,
  base_currency: state.base_currency,
  allocation,
  macro_context: state.source_context
    ? {
        strategy_style: state.source_context.strategy_style,
        current_macro_regime: state.source_context.current_macro_regime,
        investment_doctrine: state.source_context.investment_doctrine,
        capital_available_usd: state.source_context.capital_available_usd,
      }
    : {},
  review_frequency:
    state.rebalancing_rules?.review_frequency?.monthly?.join(', ') ||
    state.rebalancing_rules?.default_policy ||
    'quarterly',
  total_weight_check: 100,
};

// GMC Global (target weights for Allocation pie)
const top_level_target_weights_pct = {};
(state.asset_allocation || []).forEach((a) => {
  top_level_target_weights_pct[a.asset_class_id] = Math.round((a.target_weight ?? 0) * 100);
});

export const gmcGlobalPortfolio = {
  portfolio_name: state.portfolio_name,
  as_of_date: state.last_update,
  base_currency: state.base_currency,
  top_level_target_weights_pct,
};

// Convex Integrated: gavetas as buckets for display
const buckets = {};
(state.gavetas || []).forEach((g) => {
  const key = g.bucket_id;
  buckets[key] = {
    name: g.name,
    role: g.role,
    target_weight: g.target_weight,
    target_amount_usd: g.target_amount_usd,
    components: g.components || [],
  };
});

export const convexIntegrated = {
  portfolio_name: state.portfolio_name,
  structure_reference: 'Gavetas (Survival & Optionality / Convex Growth)',
  buckets,
  notes: state.source_context?.notes || [],
};

// Flatten instruments for instrument table
export const allInstruments = (state.asset_allocation || []).flatMap((a) =>
  (a.instruments || []).map((i) => ({
    asset_class: a.asset_class,
    ...i,
  }))
);

// Snapshot derived from state (for Convex USD Snapshot / Real Holdings when Assets_.json absent)
const breakdown = {};
(state.asset_allocation || []).forEach((a) => {
  if (a.asset_class_id === 'cash') {
    (a.instruments || []).forEach((i) => {
      const k = i.instrument_id === 'usd_bank_cash' ? 'usd_bank' : 'usd_cash';
      breakdown[k] = (breakdown[k] || 0) + (i.amount_usd || 0);
    });
  } else if (a.asset_class_id === 'gold') {
    breakdown.gold_usd = (breakdown.gold_usd || 0) + (a.amount_usd || 0);
  } else if (a.asset_class_id === 'bitcoin') {
    breakdown.bitcoin_usd = (breakdown.bitcoin_usd || 0) + (a.amount_usd || 0);
  }
});

export const assetsSnapshotFromState = {
  total_usd_value: totalUsd,
  breakdown,
  normalized_percentages: totalUsd
    ? {
        gold_pct: ((breakdown.gold_usd || 0) / totalUsd) * 100,
        btc_pct: ((breakdown.bitcoin_usd || 0) / totalUsd) * 100,
        usd_bank_pct: ((breakdown.usd_bank || 0) / totalUsd) * 100,
        usd_cash_pct: ((breakdown.usd_cash || 0) / totalUsd) * 100,
      }
    : {},
  targets: {
    gold: (state.portfolio_summary?.defensive_weight ? 20 : 0) || 20,
    btc: (state.portfolio_summary?.convex_weight ? 10 : 0) || 10,
    liquidity_bucket: (state.portfolio_summary?.cash_like_weight ? 25 : 0) || 25,
  },
};

// Raw state for regime badge, summary cards, etc.
export { portfolioState };
