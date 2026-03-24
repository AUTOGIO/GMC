#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  GMC MISSION CONTROL — Launch Script
#  Double-click this file on macOS to open all dashboards.
# ═══════════════════════════════════════════════════════════════

LAUNCHER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIR="$(cd "$LAUNCHER_DIR/.." && pwd)"   # GMC root — where package.json lives
cd "$DIR"

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   GIOVANNINI MARE CAPITAL                ║"
echo "  ║   Mission Control — Launch Sequence      ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# ── 1. Open Excel spreadsheet ───────────────────────────────────
echo "  [1/4] Opening Excel spreadsheet..."
open "$LAUNCHER_DIR/GMC_Portfolio_Dashboard.xlsx"
sleep 1

# ── 2. Open Mission Control Launcher in browser ─────────────────
echo "  [2/4] Opening Mission Control Launcher..."
open "$LAUNCHER_DIR/GMC_Launcher.html"
sleep 1

# ── 3. Open Real Estate Monitor in browser ──────────────────────
echo "  [3/4] Opening Real Estate Monitor (Campinas/SP)..."
open "$LAUNCHER_DIR/campinas_real_estate_monitor.html"
sleep 1

# ── 4. Start Vite dev server + open GMC Dashboard ───────────────
echo "  [4/4] Starting GMC Portfolio Dashboard (Vite dev server)..."

# Check if server is already running
if lsof -i :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "        → Dev server already running on :5173"
  open "http://localhost:5173"
else
  echo "        → Starting npm run dev on port 5173..."
  # Run in background, log to temp file
  nohup npm run dev > /tmp/gmc_vite.log 2>&1 &
  VITE_PID=$!
  echo "        → Vite PID: $VITE_PID (log: /tmp/gmc_vite.log)"
  echo "        → Waiting for server to start..."
  # Poll until port is open (max 15s)
  for i in {1..15}; do
    sleep 1
    if lsof -i :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo "        → Server ready!"
      break
    fi
    echo "        → Waiting... ($i/15)"
  done
  open "http://localhost:5173"
fi

echo ""
echo "  ✅  All dashboards launched."
echo ""
echo "  Dashboards:"
echo "  • GMC Portfolio Dashboard  →  http://localhost:5173"
echo "  • Real Estate Monitor      →  campinas_real_estate_monitor.html"
echo "  • Mission Control Launcher →  GMC_Launcher.html"
echo "  • Portfolio Spreadsheet    →  GMC_Portfolio_Dashboard.xlsx"
echo ""
echo "  To stop the dev server: kill \$(lsof -ti :5173)"
echo ""
