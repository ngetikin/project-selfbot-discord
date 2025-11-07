# 📋 REVIEW.md

## 1. Gambaran Umum Proyek

Proyek ini adalah selfbot Discord modular untuk tujuan edukasi, ditulis sepenuhnya dengan TypeScript (CommonJS) dan dijalankan di atas Node.js 20+ menggunakan pustaka `discord.js-selfbot-v13`. Runtime memanfaatkan loader dinamis untuk command/event, logger terstruktur Pino (`pino-pretty` di dev), validasi environment dasar, dan utilitas seperti scheduler meme harian, auto emoji reactor, serta integrasi webhook sederhana. Tooling standar mencakup `pnpm`, `tsx` untuk mode watch, `ts-jest` untuk testing, ESLint flat config dengan `typescript-eslint`, Prettier, serta Husky + lint-staged. CI GitHub Actions (`.github/workflows/ci.yml`) mereplikasi lint → test → build pada setiap push/pull request ke `main`/`dev`.

## 2. Struktur dan Modul

- `src/index.ts` – Entrypoint yang memuat `.env`, menjalankan `validateEnv`, membuat `SelfbotClient`, menginisialisasi `client.commands`, dan melakukan auto-discovery module commands/events via `fs.readdirSync` + `require`. Menangani login dan logging startup.
- `src/commands/` – Command modular:
  - `clearMessage.ts` menghapus sampai 100 pesan milik akun selfbot pada kanal aktif dengan feedback ke user.
  - `help.ts` membuat ringkasan command + prefix yang tersedia.
  - `serverinfo.ts` mengirim metadata guild (nama, ID, owner, jumlah member, waktu pembuatan).
  - `webhook.ts` meneruskan teks ke `WEBHOOK_URL` via `fetch` dan melaporkan hasil.
- `src/events/` – Event hook mandiri:
  - `messageCreate.ts` dispatcher command (prefix mention/opsional), guard role `ADMIN_ROLE_ID`, dan logging granular.
  - `autoEmojiReactor.ts` menambahkan reaksi emoji acak pada channel tertentu dengan fallback emoji global.
  - `dailyMeme.ts` scheduler 06.00 WIB yang menarik gambar dari Candaan API (atau override env), menyimpan state timer, serta mengekspor `resetDailyMemeScheduler` untuk test.
  - `ready.ts` melakukan auto join voice channel + status rotator (Rich Presence, CustomStatus, SpotifyRPC) saat variabel diaktifkan.
  - `logger.ts` mencatat event `raw` untuk keperluan debugging.
- `src/utils/` – `logger.ts` (wrapper Pino + child logger helper) dan `validateEnv.ts` (validasi wajib TOKEN + warning opsional).
- `src/types/` – Interface `CommandModule`/`EventModule` dan augmentasi tipe untuk `discord.js-selfbot-v13`; root `types/` disiapkan untuk deklarasi tambahan namun saat ini kosong.
- `tests/` – Suite Jest per use-case (`autoEmojiReactor`, `dailyMeme`, `messageCreate`, commands) dengan logger dimock; `tests/setup.ts` mengisi env default.
- `config files` – `tsconfig.json` (strict=false), `eslint.config.mjs`, Prettier config/ignore, `jest.config.cjs`, `.env.example`.
- `.husky/` – Hook `commit-msg`, `pre-commit`, `pre-push`; pre-commit kini memakai shebang valid dan menjalankan `pnpm lint-staged` (skip otomatis bila commit diawali `wip:`).
- `.github/workflows/ci.yml` – Pipeline lint/test/build.
- `auto_pull.sh` – Skrip Termux yang sekarang melakukan `git fetch`, fast-forward merge (tanpa `reset --hard`), deteksi working tree kotor, install dependen via `pnpm install --frozen-lockfile`, serta restart PM2 sebelum tidur configurable (`AUTO_PULL_INTERVAL_HOURS`, default 6 jam).
- `dist/` – Output hasil `pnpm build`.

## 3. Kondisi Saat Ini

**Kekuatan**

- Arsitektur modular rapi: loader command/event tunggal dengan kontrak tipe di `src/types`.
- Logging konsisten via Pino + child logger sehingga troubleshooting relatif mudah.
- Guard keamanan awal: hanya memproses command dari akun selfbot, dukungan role gating, dan peringatan env.
- Suite Jest sudah mencakup command utama dan mayoritas event critical (dispatcher, scheduler, emoji reactor).
- Tooling modern (pnpm, tsx, ESLint typed, Prettier) + workflow CI memastikan lint/test/build otomatis; `pnpm validate:env` menambah keamanan konfigurasi.
- Dokumentasi README/AGENTS diperbarui dengan kebutuhan Node 20+, arsitektur loader, langkah testing, dan panduan penggunaan skrip baru.

**Kelemahan / Risiko**

- `tsconfig.json` masih `strict: false`; banyak aturan `@typescript-eslint` dimatikan sehingga potensi bug runtime tidak terdeteksi selama build.
- `validateEnv` baru sebatas pemeriksaan string kosong; belum ada validasi format ID Discord, URL webhook, atau relasi antar-variabel (mis. `VOICE_CHANNEL_ID` wajib saat rotator suara aktif).
- `webhook.ts` tidak memeriksa status HTTP/response body dan tidak ada timeout sehingga error tetap generik dan sulit dirunut.
- `dailyMeme` memakai `https.get` tanpa AbortController atau retry; ketika API menggantung scheduler bisa terblokir, dan state `jobInitialized` masih global (tidak mendukung perubahan env setelah startup).
- `autoEmojiReactor` menggunakan `Array.sort` dengan comparator acak untuk memilih emoji; pendekatan ini O(n log n) dan bisa boros saat daftar emoji besar.
- Folder `types/` masih kosong; tiada dokumentasi penjelasan tipe tambahan walau folder sudah disediakan.

## 4. Rencana & Saran Pengembangan

1. **Naikkan standar tipe** – Aktifkan `strict: true` (minimal `strictNullChecks` + `noImplicitAny`) dan pulihkan aturan lint penting secara bertahap agar command/event baru memiliki jaminan tipe lebih kuat.
2. **Validasi konfigurasi lebih dalam** – Perluas `validateEnv` untuk memeriksa pola ID Discord (saluran, role), URL webhook valid, serta dependensi antar flag (mis. `VOICE_CHANNEL_ID` wajib ketika `AUTO_STATUS_ROTATOR` aktif). Tambahkan opsi `--json` pada `pnpm validate:env` untuk integrasi CI.
3. **Perkeras `webhook.ts`** – Tambahkan timeout (AbortController), cek `response.ok`, log status/body saat gagal, dan kirim pesan ke channel dengan detail minimal agar pengguna tahu apa yang keliru.
4. **Resiliensi scheduler** – Bungkus `https.get` dengan helper yang mendukung timeout dan retry eksponensial; simpan timestamp terakhir dikirim untuk menghindari duplikasi setelah restart dan izinkan reload env tanpa restart proses penuh.
5. **Optimasi auto emoji** – Ganti `Array.sort` acak dengan shuffle ala Fisher-Yates atau pilih `Set` berbasis `Math.random` untuk menekan kompleksitas.
6. **Isi folder `types/`** – Tambahkan d.ts tambahan (mis. helper Rich Presence, custom config) agar kontributor tahu tujuan folder tersebut.

## 5. Langkah Berikutnya

1. Implementasi bertahap opsi `strict` + audit lint rules agar CI menangkap issue tipe lebih awal.
2. Kembangkan `validateEnv` supaya memverifikasi format ID/URL, tambahkan mode non-interaktif untuk CI, dan dokumentasikan contoh output di README.
3. Perbarui `webhook.ts` dengan timeout + pemeriksaan `response.ok`, logging kaya, serta pesan error terperinci untuk user.
4. Perkuat `dailyMeme` menggunakan AbortController + retry dan mekanisme reload konfigurasi tanpa restart proses penuh.
5. Optimalkan pemilihan emoji di `autoEmojiReactor` agar tidak melakukan sort acak terhadap keseluruhan koleksi.
