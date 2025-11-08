# 📋 REVIEW.md

## 1. Gambaran Umum Proyek

Repositori ini berisi selfbot Discord modular berbasis TypeScript (CommonJS) yang dijalankan lewat Node.js ≥ 20.11 menggunakan `discord.js-selfbot-v13`. Entry point (`src/index.ts`) memuat `.env`, memvalidasi konfigurasi, membuat `SelfbotClient`, lalu melakukan auto-discovery command (`src/commands/`) dan event (`src/events/`). Tooling utama: `pnpm`, `tsx` untuk mode watch, Pino logger (`pino-pretty` di dev), Jest + ts-jest untuk pengujian, ESLint flat config, Prettier, serta Husky hooks. CI Github Actions sekarang hanya menjalankan `pnpm build`, namun karena skrip build men-trigger `prebuild` (`format:check`, `lint`, `test`), seluruh pemeriksaan tetap tercakup. Skrip `auto_pull.sh` diperuntukkan Termux/PM2 dan menargetkan branch `stable` dengan pipeline reset → install → restart setiap 24 jam.

## 2. Struktur dan Modul

- `src/index.ts` – memuat env dengan `dotenv`, memanggil `validateEnv`, menginisialisasi Discord selfbot client, mendaftarkan command/event dari `dist` secara dinamis, dan memulai login.
- `src/commands/` – modul perintah (`clearMessage`, `help`, `serverinfo`, `webhook`) mengekspor `{ name, description?, run }`.
- `src/events/` – handler `messageCreate` (dispatcher + role guard), `autoEmojiReactor`, `dailyMeme` (scheduler 06.00 WIB dengan helper reset), `ready` (join voice + rotasi status), dan `logger` (raw packet log).
- `src/utils/` – `logger.ts` (wrapper Pino) dan `validateEnv.ts` (validasi TOKEN + warning opsional). Tersedia script CLI `scripts/validateEnv.ts` yang bisa dijalankan via `pnpm validate:env`.
- `tests/` – suite Jest yang memverifikasi command utama, dispatcher, auto emoji, dan scheduler; logger dimock agar output bersih.
- Tooling & konfigurasi – `tsconfig.json` (strict=false), `eslint.config.mjs`, `jest.config.cjs`, Prettier config, `.env.example`, Husky hooks (`pre-commit` lint-staged, `pre-push` → `pnpm build`), serta workflow CI yang mengaktifkan Corepack, menyiapkan pnpm cache manual, lalu menjalankan build tunggal.
- `auto_pull.sh` – skrip bash berwarna untuk server Termux yang melakukan `git reset --hard origin/stable`, optional `pnpm install` jika `package.json` berubah, restart PM2 (`index.js`), lalu tidur 24 jam.

## 3. Kondisi Saat Ini

**Kekuatan**

- Arsitektur modular jelas; loader otomatis + kontrak tipe (`src/types/modules.ts`) memudahkan penambahan fitur baru.
- Tooling terpadu: `pnpm build` menjalankan format/lint/test sequential sebelum `tsc`, sehingga satu perintah menjaga kualitas baik di lokal maupun CI/Husky pre-push.
- Script `pnpm validate:env` memudahkan memastikan konfigurasi wajib ada sebelum runtime.
- Dokumentasi README sudah mencantumkan persyaratan Node 20+, perintah utama, serta gambaran arsitektur command/event.
- Husky pre-commit menjaga gaya kode melalui lint-staged dan dapat dilewati dengan prefiks `wip:` sesuai kebutuhan eksplorasi cepat.
- Masalah Jest worker crash sudah diatasi dengan menjalankan `jest --runInBand`, membuat `pnpm test` dan `pnpm build` stabil lagi di lingkungan terbatas.

**Kelemahan / Risiko**

- `auto_pull.sh` kembali memakai `git reset --hard` dan langsung menjalankan `git pull` setelahnya; setiap perubahan lokal (mis. `.env`, patch manual) akan hilang. Skrip ini juga selalu restart dengan `pm2 start index.js`, bukan `dist/index.js`, sehingga runtime bisa menggunakan sumber TypeScript mentah.
- `auto_pull.sh` mengunci `PROJECT_DIR`, `BRANCH`, dan `APP_NAME` secara hard coded tanpa opsi override atau pengecekan lingkungan; tidak ada proteksi terhadap kegagalan `pnpm install` atau status repo kotor.
- `tsconfig.json` masih menggunakan `strict: false`, dan ESLint menonaktifkan sederet aturan `@typescript-eslint/*` sehingga banyak potensi bug tipe yang tidak terdeteksi.
- `autoEmojiReactor` terus memakai `Array.sort(() => Math.random() - 0.5)` untuk memilih emoji, yang tidak efisien pada daftar besar dan menghasilkan bias.
- Workflow CI (GitHub Actions) dan Husky pre-push kini hanya menjalankan `pnpm build` tanpa menampilkan status format/lint/test secara terpisah di log; bila format/lint gagal, kegagalan tertutup oleh `prebuild` sehingga debugging di UI CI kurang jelas.
- `auto_pull.sh` kembali memakai `git reset --hard` dan langsung menjalankan `git pull` setelahnya; setiap perubahan lokal (mis. `.env`, patch manual) akan hilang. Skrip ini juga selalu restart dengan `pm2 start index.js`, bukan `dist/index.js`, sehingga runtime bisa menggunakan sumber TypeScript mentah.
- `auto_pull.sh` mengunci `PROJECT_DIR`, `BRANCH`, dan `APP_NAME` secara hard coded tanpa opsi override atau pengecekan lingkungan; tidak ada proteksi terhadap kegagalan `pnpm install` atau status repo kotor.
- `tsconfig.json` masih menggunakan `strict: false`, dan ESLint menonaktifkan sederet aturan `@typescript-eslint/*` sehingga banyak potensi bug tipe yang tidak terdeteksi.
- `autoEmojiReactor` terus memakai `Array.sort(() => Math.random() - 0.5)` untuk memilih emoji, yang tidak efisien pada daftar besar dan menghasilkan bias.
- Dokumentasi contributor (AGENTS) sebelumnya mengklaim pre-push menjalankan lint/test/build terpisah dan auto_pull aman dari hard reset; fakta repo terbaru berbeda sehingga panduan perlu diselaraskan (catatan sudah diperbarui tetapi tetap perlu tindak lanjut kode).

## 4. Rencana & Saran Pengembangan

1. **Sinkronisasi dokumentasi & skrip** – Jelaskan secara eksplisit bahwa `auto_pull.sh` melakukan reset destruktif pada branch `stable` dan hanya cocok untuk lingkungan tanpa perubahan lokal. Pertimbangkan varian aman (fast-forward + deteksi dirty tree) bila akan dipakai luas.
2. **Hardening auto_pull** – Tawarkan konfigurasi via variabel lingkungan, ganti `git reset --hard` dengan merge aman, dan arahkan PM2 untuk menjalankan `dist/index.js`. Tambahkan logging kegagalan `pnpm install` + fallback.
3. **Perketat kualitas kode** – Aktifkan opsi `strict` (minimal `strictNullChecks`, `noImplicitAny`) dan hidupkan kembali aturan lint penting (`no-unsafe-*`). Dokumentasikan rencana migrasi agar kontributor tahu prioritasnya.
4. **Optimasi event** – Ganti mekanisme pemilihan emoji dengan shuffle Fisher-Yates atau `Set` sampling; tambahkan limiter untuk channel ramai sehingga bot tidak kelebihan request.
5. **Observability & CI** – Walau `pnpm build` sudah menjalankan lint/test, pertimbangkan menambahkan langkah terpisah di workflow agar kegagalan lint/test terlihat jelas di UI Actions. Laporkan output `pnpm validate:env` di pipeline untuk catching misconfig dini.

## 5. Langkah Berikutnya

1. Update dokumentasi (README/AGENTS) untuk menggambarkan kondisi hook & auto_pull terbaru lalu sebutkan risiko reset keras.
2. Refactor `auto_pull.sh` agar mendukung konfigurasi via env dan menghindari hilangnya perubahan lokal; tambahkan opsi `--dry-run` atau logging sebelum eksekusi.
3. Aktifkan `strictNullChecks` + `noImplicitAny`, perbaiki error yang muncul, lalu lanjutkan ke aturan lint yang selama ini dimatikan.
4. Optimalkan `autoEmojiReactor` dan tambahkan test untuk memastikan algoritma baru tidak bias terhadap emoji tertentu.
5. Perluas `pnpm validate:env` agar memeriksa format ID Discord/URL webhook; jalankan skrip ini di CI sebelum build untuk mencegah runtime failure akibat konfigurasi kosong.
6. Perbarui workflow CI serta Husky pre-push agar mengeksekusi format/lint/test sebagai langkah tersendiri (atau menambahkan logging yang menonjol) sehingga kegagalan terlihat jelas dari interface Actions/Git tanpa perlu membaca log build panjang.
