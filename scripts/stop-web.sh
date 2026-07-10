#!/bin/bash

# ─────────────────────────────────────────────────────────────
#  Stop Architect Tracker Web
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$PROJECT_ROOT/logs/tracker-web.pid"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo -e "${YELLOW}Stopping Architect Tracker Web (PID $PID)…${NC}"
    kill "$PID"
    
    # Wait for process to exit
    for i in {1..10}; do
      if ! kill -0 "$PID" 2>/dev/null; then
        break
      fi
      sleep 0.5
    done
    
    # Force kill if still running
    if kill -0 "$PID" 2>/dev/null; then
      echo -e "${RED}Process didn't stop. Forcing kill…${NC}"
      kill -9 "$PID"
    fi
    
    echo -e "${GREEN}✓ Architect Tracker Web stopped.${NC}"
  else
    echo -e "${YELLOW}Process $PID is not running.${NC}"
  fi
  rm -f "$PID_FILE"
else
  echo -e "${YELLOW}PID file not found. Is Architect Tracker Web running?${NC}"
fi
