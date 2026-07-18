
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
        my populateTable(t1, {{"Bucket (Gaveta)", "Weight", "Signal", "Last Changed"}, {"**CFM (Crypto)**", "**10%**", "Stable — elevated fragility", "Held Jan–Feb 2026"}, {"**VISA Ações (Equities)**", "**30%**", "Held — cycle watch", "Jan 21, 2026"}, {"**Other / Preservation**", "**60%**", "Cash, USD, Gold", "Structural"}})
        
        -- Create Portfolio Alignment Table
        set t2 to make new table at sheet1 with properties {name:"Convex Alignment"}
        my populateTable(t2, {{"Convex Gaveta", "GMC Equivalent", "Current Signal"}, {"Preservation + Cash", "Banking (BRL) + USD", "✅ Structurally in place"}, {"Crypto (CFM)", "BTC — to be added", "10% target, wait for fragility ↓"}, {"Equities (VISA)", "Foreign ETFs — to be added", "30% target, cycle watchful"}, {"Gold", "Gold oz — to be added", "Anti-fragile reserve, no cap signal"}, {"Brazil Tactical", "Real estate (illiquid)", "Underweight, structural only"}})
        
        -- Create Cash Position Table
        set t3 to make new table at sheet1 with properties {name:"Liquidity (Banking)"}
        my populateTable(t3, {{"Currency", "Value", "Institution", "Tier"}, {"BRL", "R$ 1.900.000,00", "—", "Survival / Liquidity"}})

        -- Create Real Estate Stats
        set t4 to make new table at sheet1 with properties {name:"Real Estate Summary"}
        my populateTable(t4, {{"Metric", "Value"}, {"**Total Properties**", "12"}, {"**Properties with Area Data**", "10"}, {"**Total Area (m²)**", "1,158"}, {"**Apartments**", "5"}, {"**Houses (Casas)**", "3"}, {"**Parking Spaces**", "2"}, {"**Land (Terreno)**", "1"}, {"**Total Market Value (R$)**", "5,518,260.00"}, {"**Total Venal Value 2025 (R$)**", "651,171.53"}, {"**Total Tax Assessment (R$)**", "708,444.00"}})
        
        -- Sheet: Inventory
        set sheet2 to make new sheet with properties {name:"Property Inventory"}
        set tInv to table 1 of sheet2
        set name of tInv to "Real Estate Master List"
        my populateTable(tInv, {{"ID", "Type", "Full Address", "CEP", "Matrícula", "Cartório", "Area (m²)", "Market Price/m² (R$)", "Market Value (R$)", "Venal Value 2025 (R$)", "Tax Assessment (R$)", "Building", "Garages", "Google Maps"}, {"1", "Terreno", "Loteamento Paraná Regina, SN, Nova Veneza", "13183-513", "—", "—", "—", "—", "450,000.00", "—", "130,000.00", "—", "—", "https://maps.google.com/?q=Loteamento+Parana+Regina+Nova+Veneza"}, {"2", "Apartamento", "Rua Buarque de Macedo, 635, Vila Nova, Campinas", "13073-018", "—", "—", "280", "7,377.00", "1,475,400.00", "—", "129,173.00", "Edifício Populus", "4", "https://maps.google.com/?q=Rua+Buarque+de+Macedo+635+Campinas"}, {"3", "Casa", "Av. Imperatriz Leopoldina, 10, Vila Nova, Campinas", "13073-035", "—", "—", "50", "7,194.00", "359,700.00", "—", "26,000.00", "—", "—", "https://maps.google.com/?q=Av+Imperatriz+Leopoldina+10+Campinas"}, {"4", "Casa", "Rua Franz Wilhelm Daffert, 484, Chapadão, Campinas", "13070-161", "—", "—", "380", "6,139.00", "1,541,700.00", "—", "153,307.00", "—", "—", "https://maps.google.com/?q=Rua+Franz+Wilhelm+Daffert+484+Campinas"}, {"5", "Apartamento", "Rua Hércules Florence, 367, Botafogo, Campinas", "13020-170", "—", "—", "50", "6,432.00", "355,920.00", "—", "48,100.00", "—", "—", "https://maps.google.com/?q=Rua+Hercules+Florence+367+Campinas"}, {"6", "Apartamento", "Rua Falcão Filho, 103, Campinas", "13020-158", "—", "—", "70", "6,432.00", "450,240.00", "—", "82,864.00", "—", "—", "https://maps.google.com/?q=Rua+Falcao+Filho+103+Campinas"}, {"7", "Casa", "Av. Imperatriz Leopoldina, 405, Vila Nova, Campinas", "13073-035", "—", "—", "130", "7,194.00", "935,220.00", "—", "139,000.00", "—", "—", "https://maps.google.com/?q=Av+Imperatriz+Leopoldina+405+Campinas"}, {"3.1.1", "Apartment", "Rua Paulo Setúbal, 367 – Apt 41, 4º andar, Condomínio Edifício Ébano, Campinas/SP", "—", "103.496", "2º Cartório de Registro de Imóveis", "69", "—", "—", "112,493.80", "—", "—", "—", "—"}, {"3.1.2", "Apartment", "Rua 14 de Dezembro, 51-59 – Apt 215, 2º andar Tipo B, Edifício Pitangueiras, Campinas/SP", "—", "37.776", "2º Cartório de Registro de Imóveis", "39", "—", "—", "105,961.38", "—", "—", "—", "—"}, {"3.1.5", "Apartment", "Rua Coronel Manuel de Morais, 317 – Apt 11, 1º andar (3º pavimento), Condomínio Edifício Pitangua, Campinas/SP", "—", "95.359", "2º Cartório de Registro de Imóveis", "110", "—", "—", "398,687.67", "—", "—", "—", "—"}, {"3.1.6", "Parking Space", "Rua Coronel Manuel de Morais, 317 – Vaga 01, térreo (2º pavimento), Condomínio Edifício Pitangua, Campinas/SP", "—", "95.360", "2º Cartório de Registro de Imóveis", "—", "—", "—", "17,030.68", "—", "—", "—", "—"}, {"3.1.7", "Parking Space", "Rua Coronel Manuel de Morais, 317 – Vaga 02, térreo (2º pavimento), Condomínio Edifício Pitangua, Campinas/SP", "—", "95.361", "2º Cartório de Registro de Imóveis", "—", "—", "—", "17,030.68", "—", "—", "—", "—"}})
        
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
