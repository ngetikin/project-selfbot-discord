#!/bin/bash
# auto_pull.sh
# Skrip update otomatis untuk lingkungan Termux/PM2 dengan sinkronisasi aman.

set -euo pipefail

PROJECT_DIR=${PROJECT_DIR:-/data/data/com.termux/files/home/selfbot-discord}
BRANCH=${AUTO_PULL_BRANCH:-stable}
APP_NAME=${AUTO_PULL_APP_NAME:-selfbot-discord}
PM2_ENTRY=${AUTO_PULL_PM2_ENTRY:-dist/index.js}
SLEEP_HOURS=${AUTO_PULL_INTERVAL_HOURS:-24}
PNPM_INSTALL_ARGS=${AUTO_PULL_PNPM_ARGS:---frozen-lockfile}

GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
RESET="\033[0m"

log_info() {
  printf "%b[AUTO_PULL]%b %s\n" "$YELLOW" "$RESET" "$1"
}

log_error() {
  printf "%b[AUTO_PULL]%b %s\n" "$RED" "$RESET" "$1"
}

log_info "Project: $PROJECT_DIR | Branch: $BRANCH | PM2 entry: $PM2_ENTRY"

cd "$PROJECT_DIR" || {
  log_error "Gagal masuk ke direktori project."
  exit 1
}

if [ -n "$(git status --porcelain)" ]; then
  log_error "Working tree kotor. Commit atau stash perubahan sebelum menjalankan skrip ini."
  exit 1
}

git fetch origin "$BRANCH"

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

NEED_RESTART=true

if [ "$LOCAL" != "$REMOTE" ]; then
  log_info "Update ditemukan. Melakukan fast-forward merge..."
  git merge --ff-only "origin/$BRANCH"

  CHANGED_FILES=$(git diff --name-only HEAD@"{1}" HEAD || true)
  if printf "%s" "$CHANGED_FILES" | grep -Eq '(^|\n)(package\.json|pnpm-lock\.yaml)(\n|$)'; then
    log_info "Dependensi berubah. Menjalankan pnpm install $PNPM_INSTALL_ARGS ..."
    pnpm install $PNPM_INSTALL_ARGS
  fi

  log_info "Membangun ulang project..."
  pnpm build
else
  log_info "Tidak ada perubahan pada branch $BRANCH."
fi

if [ "$NEED_RESTART" = true ]; then
  log_info "Merestart proses lewat PM2..."
  if ! pm2 restart "$APP_NAME"; then
    log_info "Instance belum ada. Menjalankan pm2 start $PM2_ENTRY --name $APP_NAME"
    pm2 start "$PM2_ENTRY" --name "$APP_NAME"
  fi
fi

log_info "Tidur selama ${SLEEP_HOURS}h sebelum pengecekan berikutnya."
sleep "${SLEEP_HOURS}h"
