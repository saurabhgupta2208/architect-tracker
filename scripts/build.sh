#!/bin/bash
set -e

# Define directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend-server/architect-tracker-web"
STATIC_DIR="$BACKEND_DIR/src/main/resources/static"

echo "========================================="
echo " Building Architect Tracker (Fat JAR) "
echo "========================================="

echo "[1/3] Building frontend..."
cd "$FRONTEND_DIR"
npm install --silent
npm run build

echo "[2/3] Copying frontend build to backend static folder..."
rm -rf "$STATIC_DIR"
mkdir -p "$STATIC_DIR"
cp -r "$FRONTEND_DIR/build/"* "$STATIC_DIR/"

echo "[3/3] Building backend (Executable JAR)..."
cd "$BACKEND_DIR"
gradle bootJar

echo "========================================="
echo " Build successful! Executable JAR is in:"
echo " $BACKEND_DIR/build/libs/"
echo "========================================="
