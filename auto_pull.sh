#!/bin/bash
# auto_pull.sh
set -euo pipefail

PROJECT_DIR=${PROJECT_DIR:-/data/data/com.termux/files/home/selfbot-discord}
BRANCH=${AUTO_PULL_BRANCH:-main}
SLEEP_HOURS=${AUTO_PULL_INTERVAL_HOURS:-6}

cd "$PROJECT_DIR"

echo "[AUTO_PULL] Checking for updates on branch $BRANCH..."
git fetch origin "$BRANCH"

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" != "$REMOTE" ]; then
  if [ -n "$(git status --porcelain)" ]; then
    echo "[AUTO_PULL] Detected local changes. Please review/commit them before auto-sync."
    exit 1
  fi

  echo "[AUTO_PULL] Updates found. Performing fast-forward merge..."
  git merge --ff-only "origin/$BRANCH"

  if [ -f pnpm-lock.yaml ]; then
    echo "[AUTO_PULL] Installing dependencies (frozen lockfile)..."
    pnpm install --frozen-lockfile
  fi

  echo "[AUTO_PULL] Restarting process via PM2..."
  pm2 restart selfbot-discord || pm2 start dist/index.js --name "selfbot-discord"
  echo "[AUTO_PULL] Bot updated & restarted."
else
  echo "[AUTO_PULL] Already up-to-date. Restarting to keep process fresh..."
  pm2 restart selfbot-discord || pm2 start dist/index.js --name "selfbot-discord"
fi

echo "[AUTO_PULL] Sleeping for ${SLEEP_HOURS}h before next check..."
sleep "${SLEEP_HOURS}h"
