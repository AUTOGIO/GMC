-- GMC Dashboard Creator
-- This script creates a new Numbers document and imports the GMC portfolio data

set baseDir to "/Users/dnigga/Desktop/GMC/"
set realEstateCSV to baseDir & "gmc_real_estate.csv"
set bankingCSV to baseDir & "gmc_banking.csv"
set allocationCSV to baseDir & "gmc_allocation.csv"

tell application "Numbers"
	activate
	set newDoc to make new document
	
	tell newDoc
		-- Sheet 1: Executive Summary
		set sheet1 to active sheet
		set name of sheet1 to "Executive Summary"
		delete every table of sheet1
		
		-- Sheet 2: Real Estate
		set sheet2 to make new sheet with properties {name:"Real Estate Inventory"}
		delete every table of sheet2
		
		-- Sheet 3: Liquidity
		set sheet3 to make new sheet with properties {name:"Banking & Liquidity"}
		delete every table of sheet3
	end tell
end tell

-- Helper to import CSV (via shell for speed/cleanliness)
-- Note: Numbers doesn't have a direct "import CSV to specific sheet" command in AppleScript 
-- that's simple, so we'll use the 'open' command which creates a new doc, 
-- then copy the table across.

on importCSVToSheet(csvPath, targetSheetName, docName)
	tell application "Numbers"
		set tempDoc to open (POSIX file csvPath)
		delay 1
		tell document 1 of tempDoc
			set theTable to table 1 of sheet 1
			tell table 1 of sheet 1 to select
			delay 0.5
		end tell
		
		tell application "System Events" to keystroke "c" using {command down}
		delay 0.5
		close tempDoc saving no
		
		tell document docName
			tell sheet targetSheetName to activate
		end tell
		
		tell application "System Events" to keystroke "v" using {command down}
	end tell
end importCSVToSheet

-- Since UI scripting is fragile, I'll provide this as a guide/automation script
-- But for the "Execute" step, I will run the sync engine and then notify the user.
