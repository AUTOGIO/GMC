import os
import re
import csv

def parse_all_markdown_tables(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    tables, current_table, in_table = [], [], False
    for line in lines:
        line = line.strip()
        if line.startswith('|') and line.endswith('|'):
            if not in_table:
                if not re.match(r'^\|[:\s\- |]+\|$', line):
                    in_table, current_table = True, [line]
            else:
                current_table.append(line)
        else:
            if in_table:
                if len(current_table) > 2: tables.append(current_table)
                in_table, current_table = False, []
    if in_table and len(current_table) > 2: tables.append(current_table)
    parsed_tables = []
    for t in tables:
        headers = [h.strip() for h in t[0].split('|') if h.strip()]
        data_rows = t[2:]
        table_data = []
        for row in data_rows:
            values = [v.strip() for v in row.split('|') if v.strip()]
            if len(values) >= len(headers):
                table_data.append(dict(zip(headers, values[:len(headers)])))
        if table_data: parsed_tables.append(table_data)
    return parsed_tables

def save_to_csv(data, filename):
    if not data: return
    keys = data[0].keys()
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        dict_writer = csv.DictWriter(f, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(data)
    print(f"Updated {filename}")

def sync_portfolio():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets_dir = os.path.join(base_dir, "Giovannini_Mare_Capital/Assets")
    reports_dir = os.path.join(base_dir, "Giovannini_Mare_Capital/Convex_Reports")
    
    # Extract everything
    re_tables = parse_all_markdown_tables(os.path.join(assets_dir, "real_estate_master.md"))
    banking_tables = parse_all_markdown_tables(os.path.join(assets_dir, "Banking.md"))
    macro_tables = parse_all_markdown_tables(os.path.join(reports_dir, "MACRO_SUMMARY.md"))
    convex_tables = parse_all_markdown_tables(os.path.join(assets_dir, "convex_portfolio_instruments.md"))
    
    # 1. Detailed Inventory
    if re_tables: save_to_csv(re_tables[0], os.path.join(base_dir, "gmc_inventory_detailed.csv"))
    
    # 1b. Convex instruments (from convex_portfolio_instruments.md)
    if convex_tables:
        save_to_csv(convex_tables[0], os.path.join(base_dir, "gmc_convex_instruments.csv"))
        if len(convex_tables) >= 2:
            save_to_csv(convex_tables[1], os.path.join(base_dir, "gmc_convex_asset_summary.csv"))
    
    # 2. Master Summary (Composite)
    summary_rows = []
    # Add Macro Recs
    if macro_tables:
        summary_rows.append({"Metric": "--- MACRO RECOMMENDATIONS ---", "Value": ""})
        for row in macro_tables[0]:
            k = row.get("Bucket (Gaveta)", "Gaveta")
            v = row.get("Weight", "") + " | " + row.get("Signal", "")
            summary_rows.append({"Metric": k, "Value": v})
    
    # Add Real Estate Stats
    if len(re_tables) >= 2:
        summary_rows.append({"Metric": "--- REAL ESTATE SUMMARY ---", "Value": ""})
        for row in re_tables[1]:
            summary_rows.append({"Metric": row.get("Metric", ""), "Value": row.get("Value", "")})
            
    # Add Cash
    if banking_tables:
        summary_rows.append({"Metric": "--- LIQUIDITY POSITION ---", "Value": ""})
        for row in banking_tables[0]:
            summary_rows.append({"Metric": "Cash (" + row.get("Currency", "BRL") + ")", "Value": row.get("Value", "")})
            
    # Save Master Summary
    if summary_rows:
        with open(os.path.join(base_dir, "gmc_dashboard_summary.csv"), 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["Metric", "Value"])
            writer.writeheader()
            writer.writerows(summary_rows)
        print("Updated gmc_dashboard_summary.csv")

if __name__ == "__main__":
    sync_portfolio()
