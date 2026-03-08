import os
import csv

def csv_to_as_list(csv_path):
    if not os.path.exists(csv_path):
        return "{}"
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    as_rows = []
    for row in rows:
        cleaned_row = ['"' + str(cell).replace('"', '\\"').replace("\n", " ").strip() + '"' for cell in row]
        as_rows.append('{' + ', '.join(cleaned_row) + '}')
    return '{' + ', '.join(as_rows) + '}'

def generate_populator():
    base_dir = "/Users/dnigga/Documents/Active_Projects/GMC"
    
    files = {
        "macro_rec": os.path.join(base_dir, "gmc_macro_recommendations.csv"),
        "re_stats": os.path.join(base_dir, "gmc_real_estate_stats.csv"),
        "cash": os.path.join(base_dir, "gmc_cash_position.csv"),
        "inventory": os.path.join(base_dir, "gmc_real_estate_inventory.csv"),
        "alignment": os.path.join(base_dir, "gmc_convex_gavetas_alignment.csv")
    }
    
    script = """
tell application "Numbers"
    activate
    set doc to make new document
    delay 1
    
    tell doc
        -- Sheet 1: Executive Dashboard
        set sheet1 to active sheet
        set name of sheet1 to "Executive Dashboard"
        
        -- Use the default table for the first piece of data
        set t1 to table 1 of sheet1
        set name of t1 to "Macro Recommendations"
        my populateTable(t1, DATA_MACRO_REC)
        
        -- Create Portfolio Alignment Table
        set t2 to make new table at sheet1 with properties {name:"Convex Alignment"}
        my populateTable(t2, DATA_ALIGNMENT)
        
        -- Create Cash Position Table
        set t3 to make new table at sheet1 with properties {name:"Liquidity (Banking)"}
        my populateTable(t3, DATA_CASH)

        -- Create Real Estate Stats
        set t4 to make new table at sheet1 with properties {name:"Real Estate Summary"}
        my populateTable(t4, DATA_RE_STATS)
        
        -- Sheet: Inventory
        set sheet2 to make new sheet with properties {name:"Property Inventory"}
        set tInv to table 1 of sheet2
        set name of tInv to "Real Estate Master List"
        my populateTable(tInv, DATA_INVENTORY)
        
    end tell
end tell

on populateTable(targetTable, rowData)
    tell application "Numbers"
        set rowCount to count of rowData
        if rowCount is 0 then return
        set colCount to count of item 1 of rowData
        
        tell targetTable
            set row count to rowCount
            set column count to colCount
            repeat with i from 1 to rowCount
                set thisRow to item i of rowData
                repeat with j from 1 to colCount
                    try
                        set value of cell j of row i to item j of thisRow
                    on error
                        -- handle potential cell type issues
                    end try
                end repeat
            end repeat
        end tell
    end tell
end populateTable
"""
    
    script = script.replace("DATA_MACRO_REC", csv_to_as_list(files["macro_rec"]))
    script = script.replace("DATA_ALIGNMENT", csv_to_as_list(files["alignment"]))
    script = script.replace("DATA_CASH", csv_to_as_list(files["cash"]))
    script = script.replace("DATA_RE_STATS", csv_to_as_list(files["re_stats"]))
    script = script.replace("DATA_INVENTORY", csv_to_as_list(files["inventory"]))
    
    with open(os.path.join(base_dir, "populate_dashboard.scpt"), "w") as f:
        f.write(script)
    print("Generated populate_dashboard.scpt")

if __name__ == "__main__":
    generate_populator()
