#!/bin/bash
# auto_pull.sh
# Skrip update otomatis untuk lingkungan Termux/PM2 dengan mode dry-run & loop yang fleksibel.

set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: auto_pull.sh [options]
Options:
  --dry-run                Hanya tampilkan aksi tanpa menjalankan merge/install/build/restart
  --once                   Jalankan satu siklus saja lalu berhenti (abaikan interval tidur)
  --help                   Tampilkan bantuan ini

Konfigurasi via environment variable:
  PROJECT_DIR              Direktori project (default /data/data/com.termux/files/home/selfbot-discord)
  AUTO_PULL_BRANCH         Branch yang dipantau (default stable)
  AUTO_PULL_APP_NAME       Nama proses PM2 (default selfbot-discord)
  AUTO_PULL_PM2_ENTRY      Entry PM2 (default dist/index.js)
  AUTO_PULL_INTERVAL_HOURS Interval pengecekan (default 24 jam)
  AUTO_PULL_PNPM_ARGS      Argumen tambahan pnpm install (default --frozen-lockfile)
  AUTO_PULL_VERIFY_DIST    Set true/1 untuk memastikan file entry ada sebelum restart
USAGE
}

DRY_RUN=false
RUN_ONCE=false

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --once)
      RUN_ONCE=true
      shift
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

PROJECT_DIR=${PROJECT_DIR:-/data/data/com.termux/files/home/selfbot-discord}
BRANCH=${AUTO_PULL_BRANCH:-stable}
APP_NAME=${AUTO_PULL_APP_NAME:-selfbot-discord}
PM2_ENTRY=${AUTO_PULL_PM2_ENTRY:-dist/index.js}
SLEEP_HOURS=${AUTO_PULL_INTERVAL_HOURS:-24}
PNPM_INSTALL_ARGS=${AUTO_PULL_PNPM_ARGS:---frozen-lockfile}
VERIFY_DIST=${AUTO_PULL_VERIFY_DIST:-0}

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

run_cmd() {
  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY-RUN] $*"
  else
    "$@"
  fi
}

ensure_dist_entry() {
  local entry="$1"
  if [ "$VERIFY_DIST" = "1" ] || [ "$VERIFY_DIST" = "true" ]; then
    if [ ! -f "$entry" ]; then
      log_error "Entry $entry tidak ditemukan. Pastikan sudah menjalankan pnpm build dan commit dist/."
      exit 1
    fi
  fi
}

perform_cycle() {
  log_info "Project: $PROJECT_DIR | Branch: $BRANCH | PM2 entry: $PM2_ENTRY"

  cd "$PROJECT_DIR" || {
    log_error "Gagal masuk ke direktori project."
    exit 1
  }

  if [ -n "$(git status --porcelain)" ]; then
    log_error "Working tree kotor. Commit atau stash perubahan sebelum menjalankan skrip ini."
    exit 1
  }

  run_cmd git fetch origin "$BRANCH"

  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse "origin/$BRANCH")

  UPDATED=false
  if [ "$LOCAL" != "$REMOTE" ]; then
    log_info "Update ditemukan. Melakukan fast-forward merge..."
    run_cmd git merge --ff-only "origin/$BRANCH"

    CHANGED_FILES=$(git diff --name-only HEAD@"{1}" HEAD || true)
    if printf "%s" "$CHANGED_FILES" | grep -Eq '(^|\n)(package\.json|pnpm-lock\.yaml)(\n|$)'; then
      log_info "Dependensi berubah. Menjalankan pnpm install $PNPM_INSTALL_ARGS ..."
      run_cmd pnpm install $PNPM_INSTALL_ARGS
    fi

    log_info "Membangun ulang project..."
    run_cmd pnpm build
    UPDATED=true
  else
    log_info "Tidak ada perubahan pada branch $BRANCH."
  fi

  ensure_dist_entry "$PM2_ENTRY"

  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY-RUN] pm2 restart $APP_NAME || pm2 start $PM2_ENTRY --name $APP_NAME"
  else
    if ! pm2 restart "$APP_NAME"; then
      log_info "Instance belum ada. Menjalankan pm2 start $PM2_ENTRY --name $APP_NAME"
      pm2 start "$PM2_ENTRY" --name "$APP_NAME"
    fi
  fi

  if [ "$RUN_ONCE" = true ]; then
    log_info "Mode once aktif, keluar setelah siklus ini."
  elif [ "$DRY_RUN" = false ]; then
    log_info "Tidur selama ${SLEEP_HOURS}h sebelum pengecekan berikutnya."
    sleep "${SLEEP_HOURS}h"
  else
    log_info "Dry-run selesai."
  fi
}

perform_cycle

if [ "$RUN_ONCE" = false ] && [ "$DRY_RUN" = false ]; then
  while true; do
    perform_cycle
  done
fi
