# Discord Selfbot (Hanya untuk Edukasi)

> ⚠️ Selfbot melanggar Ketentuan Layanan Discord. Pakai repo ini cuma di server uji milik sendiri. Simpan token baik-baik dan ganti secara berkala.

## Tentang Proyek

Repositori dari ngetikin ini adalah versi TypeScript dari selfbot yang modular. Tinggal taruh command baru di `src/commands/` atau event di `src/events/`, restart bot, dan fitur langsung kebaca. Awalnya dibuat sambil eksperimen jalanin bot 24/7 di Redmi 6A (Termux).

## Fitur Singkat

- Tooling modern: TypeScript, ESLint, Prettier, `pnpm`.
- Loader dinamis: file command/event otomatis diregistrasi.
- Siap dipakai di perangkat terbatas (contoh: PM2 di Termux).

## Persyaratan

- Node.js 20.11 atau lebih baru (butuh `global.fetch` bawaan untuk command webhook).
- `pnpm` (aktifkan via `corepack enable` bila belum ada).

## Cara Mulai Cepat

1. **Clone & install**
   ```bash
   git clone https://github.com/ngetikin/project-selfbot-discord.git
   cd project-selfbot-discord
   pnpm install
   cp .env.example .env
   ```
2. **Atur `.env`** minimal isi `TOKEN`. Variabel lain opsional (`WEBHOOK_URL`, `ADMIN_ROLE_ID`, `EMOJI_CHANNEL_ID`, dll). Jalankan `pnpm validate:env` untuk memastikan konfigurasi sudah lengkap sebelum start.
3. **Perintah penting**
   - `pnpm dev` – mode watch dengan reload.
   - `pnpm lint` – cek style + aturan TypeScript.
   - `pnpm format` / `pnpm format:check` – jaga format konsisten.
   - `pnpm build` – compile ke `dist/`.
   - `pnpm start` – build otomatis lalu jalanin `node dist/index.js`.
   - `pnpm test` – jalanin suite Jest untuk command & event (sequential `--runInBand` supaya stabil di device rendah).
   - `pnpm validate:env` – validasi variabel lingkungan (`.env`) tanpa menjalankan bot.

## Arsitektur Modul

- **Entrypoint (`src/index.ts`)** memuat `.env`, menjalankan `validateEnv`, membuat instance `SelfbotClient`, lalu melakukan auto-discovery semua file di `src/commands/` dan `src/events/`. Command disimpan di `client.commands` (Collection), event langsung diregistrasi.
- **Command (`src/commands/*.ts`)** wajib mengekspor objek `{ name, description?, run }`. Dispatcher hanya mengeksekusi command dari akun selfbot sendiri dengan prefix mention atau `TEXT_PREFIX`.
- **Event (`src/events/*.ts`)** mengekspor `{ event, run }`. Contoh: `messageCreate.ts` sebagai dispatcher, `autoEmojiReactor.ts` untuk reaksi otomatis, `dailyMeme.ts` scheduler 06.00 WIB, `ready.ts` menangani join voice channel + rotasi status.
- **Utility & tipe** berada di `src/utils/` (logger Pino + validator env) dan `src/types/` (interface command/event + augmentasi tipe Discord selfbot).
- **Testing** memakai Jest (`tests/*.test.ts`) dengan logger dimock; `tests/setup.ts` mengisi env default seperti `ADMIN_ROLE_ID`.

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

## Auto-pull di Termux

Skrip `auto_pull.sh` melakukan pengecekan berkala dan restart PM2 setelah update. Fitur:

- Fast-forward merge (`git merge --ff-only`) sehingga perubahan lokal tidak tertimpa.
- Otomatis menjalankan `pnpm install --frozen-lockfile` bila `package.json/pnpm-lock.yaml` berubah dan membangun ulang proyek.
- Variabel lingkungan untuk konfigurasi:
  - `PROJECT_DIR` – lokasi proyek (default `/data/data/com.termux/files/home/selfbot-discord`).
  - `AUTO_PULL_BRANCH` – branch yang dipantau (default `stable`).
  - `AUTO_PULL_APP_NAME` – nama proses PM2 (default `selfbot-discord`).
  - `AUTO_PULL_PM2_ENTRY` – file yang dijalankan PM2 (default `dist/index.js`).
  - `AUTO_PULL_INTERVAL_HOURS` – jeda antar pengecekan (default 24 jam).
  - `AUTO_PULL_PNPM_ARGS` – argumen tambahan untuk `pnpm install` (default `--frozen-lockfile`).

> ⚠️ Skrip akan berhenti jika working tree kotor agar token atau perubahan lokal tidak hilang. Pastikan branch `stable` tersedia dan sudah berisi `dist/` hasil build sebelum menjalankan PM2.

## Modifikasi Cepat

- Command baru: buat file di `src/commands/` export `{ name, run }`.
- Event baru: buat di `src/events/` export `{ event, run }`.
- Tambah tipe/custom declaration di `src/types/` atau `types/`.
- Jalankan `pnpm test` dan `pnpm validate:env` sebelum commit untuk memastikan bot aman dijalankan.

## Keamanan Token

- Jangan pernah commit `.env`.
- Pakai token khusus tiap lingkungan kalau perlu.
- Segera ganti token kalau dipakai demo atau merasa bocor.

Selamat ngulik! Ingat selalu konsekuensi selfbot di platform Discord. :)

## 🧑‍💻 Kontributor

Dibuat oleh Ngetikin Studio sebagai proyek pembelajaran web dasar.
