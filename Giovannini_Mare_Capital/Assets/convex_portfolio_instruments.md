# GMC Convex Portfolio — Instrument List

Source: `gmc_portfolio_state.json` (gmc_convex_2026_q1). Total capital: USD 440,000. Last update: 2026-03-08.

## All instruments (target allocation)

| Asset Class | Instrument ID | Name | Ticker | Type | Custodian | Target Weight | Amount USD | Currency | Execution Status | Notes |
|-------------|---------------|------|--------|------|-----------|---------------|------------|----------|-------------------|-------|
| Cash | usd_bank_cash | USD Bank Cash | — | cash | bank | 0.1364 | 60000 | USD | planned | Immediate liquidity reserve. |
| Cash | sgov | iShares 0-3 Month Treasury Bond ETF | SGOV | etf | brokerage | 0.1136 | 50000 | USD | planned | Ultra-short Treasury parking sleeve. |
| Bonds | ief | iShares 7-10 Year Treasury Bond ETF | IEF | etf | brokerage | 0.0750 | 33000 | USD | planned | Intermediate duration exposure. |
| Bonds | tlt | iShares 20+ Year Treasury Bond ETF | TLT | etf | brokerage | 0.0750 | 33000 | USD | planned | Long duration convex sleeve. |
| Gold | gldm | SPDR Gold MiniShares Trust | GLDM | etf | brokerage | 0.1364 | 60000 | USD | planned | Liquid gold proxy. |
| Gold | physical_gold | Physical Gold | — | physical_asset | vault_or_personal_custody | 0.0636 | 28000 | USD | planned | Offline anti-fragile reserve. |
| Equities | vt | Vanguard Total World Stock ETF | VT | etf | brokerage | 0.1182 | 52000 | USD | planned | Broad global equity core. |
| Equities | qqq | Invesco QQQ Trust | QQQ | etf | brokerage | 0.0909 | 40000 | USD | planned | Higher beta growth sleeve. |
| Equities | vti | Vanguard Total Stock Market ETF | VTI | etf | brokerage | 0.0909 | 40000 | USD | planned | US broad equity sleeve. |
| Bitcoin | btc_spot | Bitcoin Spot | BTC | digital_asset | cold_storage_or_exchange | 0.0682 | 30000 | USD | planned | Direct BTC ownership. |
| Bitcoin | ibit | iShares Bitcoin Trust ETF | IBIT | etf | brokerage | 0.0318 | 14000 | USD | planned | Listed BTC sleeve for operational simplicity. |

## Asset class summary

| Asset Class | Target Weight | Amount USD | Min Weight | Max Weight | Role |
|-------------|---------------|------------|------------|------------|------|
| Cash | 0.25 | 110000 | 0.15 | 0.35 | Liquidity and optionality reserve |
| Bonds | 0.15 | 66000 | 0.10 | 0.25 | Risk-off ballast and yield capture |
| Gold | 0.20 | 88000 | 0.15 | 0.35 | Anti-fragile reserve and debasement hedge |
| Equities | 0.30 | 132000 | 0.15 | 0.40 | Selective global growth exposure |
| Bitcoin | 0.10 | 44000 | 0.05 | 0.20 | Convex asymmetric optionality |

## Gavetas (buckets)

| Bucket | Target Weight | Target USD | Components |
|--------|---------------|------------|------------|
| Survival & Optionality | 0.60 | 264000 | Cash 25%, Bonds 15%, Gold 20% |
| Convex Growth | 0.40 | 176000 | Equities 30%, Bitcoin 10% |
