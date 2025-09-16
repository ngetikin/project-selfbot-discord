#!/bin/bash
# auto_pull.sh

# Masuk ke folder project
cd /data/data/com.termux/files/home/selfbot-discord || exit

# Reset biar selalu sync
git fetch --all
git reset --hard origin/main   # kalau branch utama "main"
# git reset --hard origin/master  # kalau branch utama "master"

# Pull update terbaru
git pull

# Jalankan bot pakai PM2 (restart kalau ada update)
pm2 restart selfbot-discord || pm2 start index.js --name "selfbot-discord"
