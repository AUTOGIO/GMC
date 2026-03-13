#!/usr/bin/env python3
"""
Sync convex_portfolio_instruments.md and dashboard CSVs from data/portfolio/gmc_portfolio_state.json.
Run from repo root: python3 numbers_sheets/sync_portfolio_from_json.py
"""
import json
import csv
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORTFOLIO_JSON = os.path.join(REPO_ROOT, "data", "portfolio", "gmc_portfolio_state.json")
ASSETS_DIR = os.path.join(REPO_ROOT, "Giovannini_Mare_Capital", "Assets")
MD_PATH = os.path.join(ASSETS_DIR, "convex_portfolio_instruments.md")
INSTRUMENTS_CSV = os.path.join(REPO_ROOT, "gmc_convex_instruments.csv")
SUMMARY_CSV = os.path.join(REPO_ROOT, "gmc_convex_asset_summary.csv")


def main():
    with open(PORTFOLIO_JSON, "r", encoding="utf-8") as f:
        state = json.load(f)

    cap = state["portfolio_summary"]["total_capital_usd"]
    as_of = state["last_update"]

    # Build instruments table rows
    inst_rows = []
    for a in state.get("asset_allocation", []):
        ac = a["asset_class"]
        for i in a.get("instruments", []):
            ticker = i.get("ticker") or "—"
            inst_rows.append({
                "Asset Class": ac,
                "Instrument ID": i.get("instrument_id", ""),
                "Name": i.get("name", ""),
                "Ticker": ticker,
                "Type": i.get("instrument_type", ""),
                "Custodian": i.get("custodian", ""),
                "Target Weight": round(i.get("target_weight", 0), 4),
                "Amount USD": i.get("amount_usd", 0),
                "Currency": i.get("currency", "USD"),
                "Execution Status": i.get("execution_status", "planned"),
                "Notes": (i.get("notes") or "").replace("|", ","),
            })

    # Asset class summary rows
    summary_rows = []
    for a in state.get("asset_allocation", []):
        summary_rows.append({
            "Asset Class": a["asset_class"],
            "Target Weight": a["target_weight"],
            "Amount USD": a["amount_usd"],
            "Min Weight": a.get("min_weight", ""),
            "Max Weight": a.get("max_weight", ""),
            "Role": a.get("role", ""),
        })

    # Gavetas
    gavetas = state.get("gavetas", [])
    gaveta_lines = []
    for g in gavetas:
        comps = ", ".join(f"{c['asset_class']} {int(c['weight']*100)}%" for c in g.get("components", []))
        gaveta_lines.append({
            "Bucket": g["name"],
            "Target Weight": g["target_weight"],
            "Target USD": g["target_amount_usd"],
            "Components": comps,
        })

    # Write markdown
    os.makedirs(ASSETS_DIR, exist_ok=True)
    with open(MD_PATH, "w", encoding="utf-8") as f:
        f.write("# GMC Convex Portfolio — Instrument List\n\n")
        f.write(f"Source: `gmc_portfolio_state.json` (gmc_convex_2026_q1). Total capital: USD {cap:,}. Last update: {as_of}.\n\n")
        f.write("## All instruments (target allocation)\n\n")
        headers = ["Asset Class", "Instrument ID", "Name", "Ticker", "Type", "Custodian", "Target Weight", "Amount USD", "Currency", "Execution Status", "Notes"]
        f.write("| " + " | ".join(headers) + " |\n")
        f.write("|" + "|".join(["-------------"] * len(headers)) + "|\n")
        for r in inst_rows:
            row = [str(r.get(h, "")) for h in headers]
            f.write("| " + " | ".join(row) + " |\n")
        f.write("\n## Asset class summary\n\n")
        sum_headers = ["Asset Class", "Target Weight", "Amount USD", "Min Weight", "Max Weight", "Role"]
        f.write("| " + " | ".join(sum_headers) + " |\n")
        f.write("|" + "|".join(["-------------"] * 6) + "|\n")
        for r in summary_rows:
            row = [str(r.get(h, "")) for h in sum_headers]
            f.write("| " + " | ".join(row) + " |\n")
        f.write("\n## Gavetas (buckets)\n\n")
        f.write("| Bucket | Target Weight | Target USD | Components |\n")
        f.write("|--------|---------------|------------|------------|\n")
        for r in gaveta_lines:
            f.write(f"| {r['Bucket']} | {r['Target Weight']} | {r['Target USD']} | {r['Components']} |\n")

    # Write CSVs
    if inst_rows:
        with open(INSTRUMENTS_CSV, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=inst_rows[0].keys())
            w.writeheader()
            w.writerows(inst_rows)
    if summary_rows:
        with open(SUMMARY_CSV, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=summary_rows[0].keys())
            w.writeheader()
            w.writerows(summary_rows)

    print("Updated:", MD_PATH)
    print("Updated:", INSTRUMENTS_CSV)
    print("Updated:", SUMMARY_CSV)


if __name__ == "__main__":
    main()
