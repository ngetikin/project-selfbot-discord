# Discord Selfbot (Hanya untuk Edukasi)

> ⚠️ Selfbot melanggar Ketentuan Layanan Discord. Pakai repo ini cuma di server uji milik sendiri. Simpan token baik-baik dan ganti secara berkala.

## Tentang Proyek

Repositori dari ngetikin ini adalah versi TypeScript dari selfbot yang modular. Tinggal taruh command baru di `src/commands/` atau event di `src/events/`, restart bot, dan fitur langsung kebaca. Awalnya dibuat sambil eksperimen jalanin bot 24/7 di Redmi 6A (Termux).

## Fitur Singkat

- Tooling modern: TypeScript, ESLint, Prettier, `pnpm`.
- Loader dinamis: file command/event otomatis diregistrasi.
- Siap dipakai di perangkat terbatas (contoh: PM2 di Termux).

## Cara Mulai Cepat

1. **Clone & install**
   ```bash
   git clone https://github.com/ngetikin/project-selfbot-discord.git
   cd project-selfbot-discord
   pnpm install
   cp .env.example .env
   ```
2. **Atur `.env`** minimal isi `TOKEN`. Variabel lain opsional (`WEBHOOK_URL`, `ADMIN_ROLE_ID`, `EMOJI_CHANNEL_ID`, dll).
3. **Perintah penting**
   - `pnpm dev` – mode watch dengan reload.
   - `pnpm lint` – cek style + aturan TypeScript.
   - `pnpm format` / `pnpm format:check` – jaga format konsisten.
   - `pnpm build` – compile ke `dist/`.
   - `pnpm start` – build otomatis lalu jalanin `node dist/index.js`.

## Contoh Hosting 24/7 di Termux (Redmi 6A)

```bash
pkg update
pkg install git nodejs-lts
corepack enable          # aktifkan pnpm
npm install -g pm2       # atau pnpm add -g pm2
```

Setelah setup dan `pnpm build`, jalankan:

```bash
pm2 start dist/index.js --name selfbot --watch
pm2 save
```

Kalau reboot, buka Termux lalu `pm2 resurrect`. Untuk update:

```bash
git pull
pnpm install --frozen-lockfile
pnpm build
pm2 restart selfbot
```

## Modifikasi Cepat

- Command baru: buat file di `src/commands/` export `{ name, run }`.
- Event baru: buat di `src/events/` export `{ event, run }`.
- Tambah tipe/custom declaration di `src/types/` atau `types/`.

## Keamanan Token

- Jangan pernah commit `.env`.
- Pakai token khusus tiap lingkungan kalau perlu.
- Segera ganti token kalau dipakai demo atau merasa bocor.

Selamat ngulik! Ingat selalu konsekuensi selfbot di platform Discord. :)
