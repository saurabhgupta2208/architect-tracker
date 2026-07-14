#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend-server/architect-tracker-web"
LOGS_DIR="$PROJECT_ROOT/logs"

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"

LOG_FILE="$LOGS_DIR/tracker-web.log"
PID_FILE="$LOGS_DIR/tracker-web.pid"

echo "========================================="
echo " Running Architect Tracker (Fat JAR) "
echo "========================================="

# Stop existing instance if running
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Stopping previous instance (PID $OLD_PID)..."
    kill "$OLD_PID" 2>/dev/null || true
    sleep 2
  fi
  rm -f "$PID_FILE"
fi

# Find the JAR file (ignoring the plain jar if present)
JAR_FILE=$(find "$BACKEND_DIR/build/libs" -name "*.jar" | grep -v "plain" | head -n 1)

if [ -z "$JAR_FILE" ]; then
  echo "Error: Could not find executable JAR file."
  echo "Please run build.sh first."
  exit 1
fi

echo "Found JAR: $JAR_FILE"
echo "Starting application..."

# Change directory to backend so relative paths (like ../data) resolve correctly
cd "$BACKEND_DIR"

# Start the application in the background
java -Xlog:gc:file="$LOGS_DIR/gc.log" -jar "$JAR_FILE" -server.port=3001 > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

echo "Application is starting (PID $SERVER_PID)..."
echo -n "Checking status"

# Wait for server to be ready
for i in {1..40}; do
  sleep 1
  # Check if the root endpoint or api returns a successful response
  if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo ""
    echo "✅ Server is running!"
    echo "Logs are being written to: $LOG_FILE"
    echo "You can view the application at: http://localhost:3001"
    
    # Open browser
    if command -v xdg-open &>/dev/null; then
      xdg-open http://localhost:3001 2>/dev/null &
    elif command -v google-chrome &>/dev/null; then
      google-chrome http://localhost:3001 2>/dev/null &
    fi
    exit 0
  fi
  echo -n "."
done

echo ""
echo "⚠️ Server may not have started properly or is taking too long."
echo "Check logs at: $LOG_FILE"
