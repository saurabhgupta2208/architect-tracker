#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================="
echo " Architect Tracker - Local Setup "
echo "========================================="

bash "$SCRIPT_DIR/build.sh"
bash "$SCRIPT_DIR/run.sh"

echo "========================================="
echo " Setup Complete! "
echo "========================================="
