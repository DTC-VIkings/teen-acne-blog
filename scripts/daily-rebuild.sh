#!/bin/bash
# Daily rebuild script for teenacnesolutions.com
# Bumps LAST_REBUILD.txt, commits, pushes — triggers Vercel auto-deploy
# Run daily via launchd agent

set -e

REPO_DIR="/Users/tobiasnervik/Claude/teen-acne-blog"
LOG_FILE="$REPO_DIR/scripts/daily-rebuild.log"

cd "$REPO_DIR"

TODAY=$(date "+%Y-%m-%d")
NOW=$(date "+%Y-%m-%d %H:%M:%S %Z")

echo "[$NOW] Starting daily rebuild" >> "$LOG_FILE"

# Make sure we're on main and up to date
git checkout main >> "$LOG_FILE" 2>&1
git pull --rebase origin main >> "$LOG_FILE" 2>&1

# Bump the rebuild marker
echo "$TODAY" > LAST_REBUILD.txt

# Commit and push
git add LAST_REBUILD.txt
git commit -m "Daily rebuild: $TODAY" >> "$LOG_FILE" 2>&1
git push origin main >> "$LOG_FILE" 2>&1

echo "[$NOW] Rebuild triggered successfully" >> "$LOG_FILE"
