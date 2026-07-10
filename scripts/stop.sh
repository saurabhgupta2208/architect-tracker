#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/tracker.pid"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    rm -f "$PID_FILE"
    echo "✓ Architect Tracker stopped."
  else
    echo "Process not running."
    rm -f "$PID_FILE"
  fi
else
  # Fallback: kill by port
  PID=$(lsof -ti:3001 2>/dev/null)
  if [ -n "$PID" ]; then kill "$PID" && echo "✓ Stopped (port 3001 freed)."; else echo "Nothing running on port 3001."; fi
fi
