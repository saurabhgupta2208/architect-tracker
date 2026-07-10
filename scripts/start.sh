#!/bin/bash

# ─────────────────────────────────────────────────────────────
#  Architect Tracker — single-click launcher for Linux
# ─────────────────────────────────────────────────────────────

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_DIR="$SCRIPT_DIR/backend"
BUILD_DIR="$FRONTEND_DIR/build"
DATA_DIR="$SCRIPT_DIR/data"
LOG_FILE="$SCRIPT_DIR/tracker.log"
PID_FILE="$SCRIPT_DIR/tracker.pid"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

print_banner() {
  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║       🏗  Architect Tracker v1.0          ║${NC}"
  echo -e "${BOLD}║   Senior → Principal/Staff Architect      ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
  echo ""
}

print_banner

# ── Check for node ─────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found.${NC}"
  echo ""
  echo "Install Node.js 18+ with one of these:"
  echo "  Ubuntu/Debian:  sudo apt install nodejs npm"
  echo "  Fedora/RHEL:    sudo dnf install nodejs npm"
  echo "  Or via nvm:     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
  echo "                  nvm install 18 && nvm use 18"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
  echo -e "${RED}✗ Node.js 16+ required (found v${NODE_VERSION}).${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# ── Stop any existing instance ───────────────────────────────
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo -e "${YELLOW}↺ Stopping previous instance (PID $OLD_PID)…${NC}"
    kill "$OLD_PID" 2>/dev/null || true
    sleep 1
  fi
  rm -f "$PID_FILE"
fi

# ── Ensure data directory ────────────────────────────────────
mkdir -p "$DATA_DIR"
echo -e "${GREEN}✓ Data directory ready: $DATA_DIR${NC}"

# ── Install backend dependencies ─────────────────────────────
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo -e "${CYAN}⬇  Installing backend dependencies…${NC}"
  cd "$BACKEND_DIR" && npm install --silent
  echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

# ── Build frontend (only if not already built or source changed) ─
NEEDS_BUILD=false
if [ ! -d "$BUILD_DIR" ]; then
  NEEDS_BUILD=true
elif [ "$FRONTEND_DIR/src/App.js" -nt "$BUILD_DIR/index.html" ]; then
  NEEDS_BUILD=true
fi

if [ "$NEEDS_BUILD" = true ]; then
  echo -e "${CYAN}⬇  Installing frontend dependencies…${NC}"
  cd "$FRONTEND_DIR" && npm install --silent
  echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
  echo -e "${CYAN}🔨 Building frontend (this takes ~60 seconds the first time)…${NC}"
  cd "$FRONTEND_DIR" && npm run build > "$LOG_FILE" 2>&1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
  else
    echo -e "${RED}✗ Frontend build failed. Check $LOG_FILE for details.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✓ Frontend already built (no changes detected)${NC}"
fi

# ── Start backend ────────────────────────────────────────────
echo ""
echo -e "${CYAN}🚀 Starting Architect Tracker…${NC}"
cd "$BACKEND_DIR"
node server.js >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

# ── Wait for server to be ready ──────────────────────────────
echo -n "   Waiting for server"
for i in {1..20}; do
  sleep 0.5
  if curl -s http://localhost:3001/api/data > /dev/null 2>&1; then
    echo ""
    break
  fi
  echo -n "."
done

echo ""
echo -e "${GREEN}${BOLD}✅ Architect Tracker is running!${NC}"
echo ""
echo -e "   ${BOLD}Open in browser:${NC}  http://localhost:3001"
echo -e "   ${BOLD}Data saved to:${NC}    $DATA_DIR/tracker.json"
echo -e "   ${BOLD}Logs:${NC}             $LOG_FILE"
echo -e "   ${BOLD}Stop server:${NC}      ./stop.sh"
echo ""

# ── Open browser ─────────────────────────────────────────────
if command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:3001 2>/dev/null &
elif command -v google-chrome &>/dev/null; then
  google-chrome http://localhost:3001 2>/dev/null &
elif command -v firefox &>/dev/null; then
  firefox http://localhost:3001 2>/dev/null &
fi

echo -e "${YELLOW}Press Ctrl+C to stop the server, or close this terminal.${NC}"
echo ""

# ── Keep running (trap Ctrl+C) ───────────────────────────────
cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping Architect Tracker…${NC}"
  kill "$SERVER_PID" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo -e "${GREEN}✓ Stopped. Your data is saved in $DATA_DIR/tracker.json${NC}"
  exit 0
}
trap cleanup INT TERM

wait "$SERVER_PID"
