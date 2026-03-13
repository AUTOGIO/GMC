# GMC Convex Portfolio — Instrument List

Source: `gmc_portfolio_state.json` (gmc_convex_2026_q1). Total capital: USD 460,000. Last update: 2026-03-11.

## All instruments (target allocation)

| Asset Class | Instrument ID | Name | Ticker | Type | Custodian | Target Weight | Amount USD | Currency | Execution Status | Notes |
|-------------|-------------|-------------|-------------|-------------|-------------|-------------|-------------|-------------|-------------|-------------|
| Cash | usd_bank_cash | USD Bank Cash | — | cash | bank | 0.1364 | 62727 | USD | planned | Immediate liquidity reserve. |
| Cash | tflo | iShares Treasury Floating Rate Bond ETF | TFLO | etf | brokerage | 0.1136 | 52273 | USD | planned | Ultra-short Treasury parking sleeve; low-vol yield. |
| Bonds | ief | iShares 7-10 Year Treasury Bond ETF | IEF | etf | brokerage | 0.075 | 34500 | USD | planned | Intermediate duration exposure; aligns with Treasury QE theme. |
| Bonds | tlt | iShares 20+ Year Treasury Bond ETF | TLT | etf | brokerage | 0.075 | 34500 | USD | planned | Long duration convex sleeve; Warsh-era liquidity hedge. |
| Gold | gldm | SPDR Gold MiniShares Trust | GLDM | etf | brokerage | 0.1364 | 62727 | USD | planned | Liquid gold proxy; supplements existing physical holdings. |
| Gold | gdx | VanEck Gold Miners ETF | GDX | etf | brokerage | 0.0636 | 29273 | USD | planned | Gold miners for geo premium leverage; VISA-aligned hedge. |
| Equities | tflo | iShares Treasury Floating Rate Bond ETF | TFLO | etf | brokerage | 0.15 | 69000 | USD | planned | Liquidity buffer within equities; rebalancing tool. |
| Equities | ewz | iShares MSCI Brazil ETF | EWZ | etf | brokerage | 0.0165 | 7590 | USD | planned | Tactical EM exposure; opportunistic only. |
| Equities | spy | SPDR S&P 500 ETF Trust | SPY | etf | brokerage | 0.0135 | 6210 | USD | planned | Core US growth; secular tech/IA tailwinds. |
| Equities | gdx | VanEck Gold Miners ETF | GDX | etf | brokerage | 0.0135 | 6210 | USD | planned | Geo hedge; supports gold premium on Iran risks. |
| Equities | xlu | Utilities Select Sector SPDR Fund | XLU | etf | brokerage | 0.0067 | 3105 | USD | planned | Defensive sector; duration-like stability. |
| Equities | vxx | iPath Series B S&P 500 VIX Short-Term Futures ETN | VXX | etn | brokerage | 0.0067 | 3105 | USD | planned | Convex hedge against drawdowns. |
| Equities | fxi | iShares China Large-Cap ETF | FXI | etf | brokerage | 0.015 | 6900 | USD | planned | China recovery play; new bull wave imminent. |
| Equities | ewh | iShares MSCI Hong Kong ETF | EWH | etf | brokerage | 0.015 | 6900 | USD | planned | China proxy; undervalued asymmetry. |
| Equities | baba | Alibaba Group Holding Limited ADR | BABA | adr | brokerage | 0.015 | 6900 | USD | planned | China tech; regulatory tailwinds. |
| Equities | bidu | Baidu Inc ADR | BIDU | adr | brokerage | 0.015 | 6900 | USD | planned | China AI/search; undervalued. |
| Equities | mstr | MicroStrategy Incorporated | MSTR | stock | brokerage | 0.006 | 2760 | USD | planned | BTC proxy; leveraged crypto exposure. |
| Equities | riot | Riot Platforms Inc | RIOT | stock | brokerage | 0.006 | 2760 | USD | planned | BTC mining; efficiency edge. |
| Equities | clsk | CleanSpark Inc | CLSK | stock | brokerage | 0.006 | 2760 | USD | planned | BTC mining; green energy asymmetry. |
| Equities | coin | Coinbase Global Inc | COIN | stock | brokerage | 0.006 | 2760 | USD | planned | Crypto exchange; ecosystem convexity. |
| Equities | tsla | Tesla Inc | TSLA | stock | brokerage | 0.009 | 4140 | USD | planned | EV/IA secular growth. |
| Bitcoin | btc_spot | Bitcoin Spot | BTC | digital_asset | brokerage | 0.08 | 36800 | USD | planned | Direct BTC ownership; core reserve. |
| Bitcoin | eth_spot | Ethereum Spot | ETH | digital_asset | brokerage | 0.0125 | 5750 | USD | planned | Scaling layer; quantum resilience. |
| Bitcoin | ltc_spot | Litecoin Spot | LTC | digital_asset | brokerage | 0.0056 | 2576 | USD | planned | Payment efficiency; low fragility. |
| Bitcoin | link_spot | Chainlink Spot | LINK | digital_asset | brokerage | 0.0019 | 874 | USD | planned | Oracles; ecosystem convexity. |

## Asset class summary

| Asset Class | Target Weight | Amount USD | Min Weight | Max Weight | Role |
|-------------|-------------|-------------|-------------|-------------|-------------|
| Cash | 0.25 | 115000 | 0.15 | 0.35 | Liquidity and optionality reserve |
| Bonds | 0.15 | 69000 | 0.1 | 0.25 | Risk-off ballast and yield capture |
| Gold | 0.2 | 92000 | 0.15 | 0.35 | Anti-fragile reserve and debasement hedge |
| Equities | 0.3 | 138000 | 0.15 | 0.4 | Selective global growth exposure |
| Bitcoin | 0.1 | 46000 | 0.05 | 0.2 | Convex asymmetric optionality |

## Gavetas (buckets)

| Bucket | Target Weight | Target USD | Components |
|--------|---------------|------------|------------|
| Survival & Optionality | 0.6 | 276000 | Cash 25%, Bonds 15%, Gold 20% |
| Convex Growth | 0.4 | 184000 | Equities 30%, Bitcoin 10% |
