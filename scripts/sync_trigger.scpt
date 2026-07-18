-- GMC Portfolio Sync Trigger
-- This script runs the Python sync engine and can be used in Shortcuts

do shell script "python3 /Users/dnigga/Desktop/GMC/sync_engine.py"

display notification "GMC Portfolio Data Synced successfully." with title "Numbers Dashboard" subtitle "Ready for import/refresh"

tell application "Numbers"
	activate
	-- Optionally add code to refresh tables if already open
end tell
