#!/bin/bash

# ─────────────────────────────────────────────────────────────
#  Architect Tracker Web (Spring Boot) — launcher
# ─────────────────────────────────────────────────────────────

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_DIR="$SCRIPT_DIR/backend-server/architect-tracker-web"
BUILD_DIR="$FRONTEND_DIR/build"
STATIC_DIR="$BACKEND_DIR/src/main/resources/static"
DATA_DIR="$SCRIPT_DIR/backend-server/data"
LOG_FILE="$SCRIPT_DIR/tracker-web.log"
PID_FILE="$SCRIPT_DIR/tracker-web.pid"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

print_banner() {
  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║       🏗  Architect Tracker Web          ║${NC}"
  echo -e "${BOLD}║   Spring Boot Backend + React Frontend   ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
  echo ""
}

print_banner

# ── Check for Java ─────────────────────────────────────────
if ! command -v java &>/dev/null; then
  echo -e "${RED}✗ Java not found.${NC}"
  echo ""
  echo "Install Java 17+ (e.g. sudo apt install openjdk-17-jdk)"
  exit 1
fi
echo -e "${GREEN}✓ Java found${NC}"

# ── Check for gradle ───────────────────────────────────────
if ! command -v gradle &>/dev/null; then
  echo -e "${RED}✗ Gradle not found.${NC}"
  echo ""
  echo "Install Gradle (e.g. sudo apt install gradle) or download a wrapper."
  exit 1
fi
echo -e "${GREEN}✓ Gradle found${NC}"

# ── Check for node ─────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found.${NC}"
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
mkdir -p "$DATA_DIR/images"
echo -e "${GREEN}✓ Data directory ready: $DATA_DIR${NC}"

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
  echo -e "${CYAN}🔨 Building frontend…${NC}"
  cd "$FRONTEND_DIR" && npm run build > "$LOG_FILE" 2>&1
  echo -e "${GREEN}✓ Frontend built successfully${NC}"
fi

# ── Copy frontend to Spring Boot static resources ─────────────
echo -e "${CYAN}📋 Copying frontend build to Spring Boot static folder…${NC}"
rm -rf "$STATIC_DIR"
mkdir -p "$STATIC_DIR"
cp -r "$BUILD_DIR/"* "$STATIC_DIR/"

# ── Start backend ────────────────────────────────────────────
echo ""
echo -e "${CYAN}🚀 Starting Architect Tracker Web (Spring Boot)…${NC}"
cd "$BACKEND_DIR"
gradle bootRun >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

# ── Wait for server to be ready ──────────────────────────────
echo -n "   Waiting for server"
for i in {1..40}; do
  sleep 0.5
  if curl -s http://localhost:3001/api/data > /dev/null 2>&1; then
    echo ""
    break
  fi
  echo -n "."
done

echo ""
echo -e "${GREEN}${BOLD}✅ Architect Tracker Web is running!${NC}"
echo ""
echo -e "   ${BOLD}Open in browser:${NC}  http://localhost:3001"
echo -e "   ${BOLD}Logs:${NC}             $LOG_FILE"
echo -e "   ${BOLD}Stop server:${NC}      ./stop-web.sh"
echo ""

# ── Open browser ─────────────────────────────────────────────
if command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:3001 2>/dev/null &
elif command -v google-chrome &>/dev/null; then
  google-chrome http://localhost:3001 2>/dev/null &
elif command -v firefox &>/dev/null; then
  firefox http://localhost:3001 2>/dev/null &
fi

# ── Keep running (trap Ctrl+C) ───────────────────────────────
cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping Architect Tracker Web…${NC}"
  kill "$SERVER_PID" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo -e "${GREEN}✓ Stopped.${NC}"
  exit 0
}
trap cleanup INT TERM

wait "$SERVER_PID"
