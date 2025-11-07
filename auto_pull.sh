#!/bin/bash
# auto_pull.sh
# Script otomatis untuk sync project dan restart bot di Termux
# Branch: stable

set -e  # stop jika ada error

# Warna terminal
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
RESET="\033[0m"

PROJECT_DIR="/data/data/com.termux/files/home/selfbot-discord"
BRANCH="stable"
APP_NAME="selfbot-discord"

echo -e "${YELLOW}[AUTO_PULL] Memulai auto-pull untuk branch '$BRANCH'...${RESET}"

# Masuk ke folder project
cd "$PROJECT_DIR" || { echo -e "${RED}Gagal masuk ke direktori project.${RESET}"; exit 1; }

# Ambil update terbaru
git fetch origin "$BRANCH"

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/"$BRANCH")

if [ "$LOCAL" != "$REMOTE" ]; then
  echo -e "${YELLOW}[AUTO_PULL] Ada update di branch '$BRANCH', melakukan sinkronisasi...${RESET}"

  # Simpan hash package.json sebelum update
  OLD_PKG_HASH=$(sha1sum package.json 2>/dev/null | awk '{print $1}')

  # Hard reset ke remote branch
  git reset --hard origin/"$BRANCH"
  git pull origin "$BRANCH"

  # Cek apakah package.json berubah
  NEW_PKG_HASH=$(sha1sum package.json 2>/dev/null | awk '{print $1}')
  if [ "$OLD_PKG_HASH" != "$NEW_PKG_HASH" ]; then
    echo -e "${YELLOW}[AUTO_PULL] package.json berubah, menginstall dependensi...${RESET}"
    pnpm install
  fi

  # Restart pakai PM2
  echo -e "${YELLOW}[AUTO_PULL] Merestart bot...${RESET}"
  pm2 restart "$APP_NAME" || pm2 start index.js --name "$APP_NAME"

  echo -e "${GREEN}[AUTO_PULL] Bot berhasil di-update & restart.${RESET}"
else
  echo -e "${GREEN}[AUTO_PULL] Tidak ada update di branch '$BRANCH', tetap restart untuk jaga-jaga.${RESET}"
  pm2 restart "$APP_NAME" || pm2 start index.js --name "$APP_NAME"
fi

# Rehat 24 jam
echo -e "${YELLOW}[AUTO_PULL] Rehat selama 12 jam...${RESET}"
sleep 12h
