#!/bin/bash
# auto_pull.sh

# Masuk ke folder project
cd /data/data/com.termux/files/home/selfbot-discord || exit

# Ambil update terbaru dari remote
git fetch origin main

# Cek apakah ada perbedaan antara local dan remote
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "[AUTO_PULL] Ada update di branch main, sync dulu..."

  # Hard reset ke remote biar bersih
  git reset --hard origin/main
  git pull origin main

  # Optional: install dependensi kalau ada perubahan package.json
  if [ -f package.json ]; then
    pnpm install
  fi

  # Restart pakai PM2
  pm2 restart selfbot-discord || pm2 start index.js --name "selfbot-discord"

  echo "[AUTO_PULL] Bot berhasil di-update & restart."
else
  echo "[AUTO_PULL] Tidak ada update, skip restart."
fi
