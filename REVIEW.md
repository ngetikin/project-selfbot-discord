# Review Proyek – Discord Selfbot Modular

Dokumen ini merangkum kondisi repositori pada commit `cd87ccd` di branch `dev`: fitur yang sudah ada, peningkatan terbaru, tooling yang terpasang, kekurangan yang ditemukan, serta rekomendasi pengembangan selanjutnya.

---

## Fitur yang Sudah Diimplementasikan

- **Entrypoint runtime (`src/index.ts`)**
  - Memuat variabel lingkungan memakai `dotenv`.
  - Menginisialisasi klien `discord.js-selfbot-v13`.
  - Melakukan auto-discovery command di `src/commands/` dan event listener di `src/events/`.
  - Menyimpan command ke `client.commands` (Collection) dan mendaftarkan event handler ke klien.
  - Tercatat login sukses lewat log `[READY]` dan menggunakan `TOKEN` dari `.env`.

- **Command module**
  - `clearMessage.ts`: Menghapus sampai 100 pesan milik akun selfbot pada channel aktif dengan validasi jumlah dan feedback respons.
  - `serverinfo.ts`: Mengirim ringkasan informasi server (nama, ID, jumlah member, pemilik, tanggal pembuatan).
  - `webhook.ts`: Mem-posting teks ke `WEBHOOK_URL` yang ada di env dengan penanganan error dasar.

- **Event module**
  - `messageCreate.ts`: Dispatcher command; kini hanya menerima pesan dari akun selfbot sendiri, mendukung mention `<@id>` dan `<@!id>`, memberi peringatan bila `client.commands` kosong, serta menerapkan pengecekan role `ADMIN_ROLE_ID` apabila tersedia.
  - `autoEmojiReactor.ts`: Menambahkan reaksi emoji acak pada channel yang diatur melalui `EMOJI_CHANNEL_ID`, memprioritaskan emoji server non-animasi.
  - `dailyMeme.ts`: Menjadwalkan kirim meme tiap hari pukul 06.00 WIB dari API `DAILY_MEME_API_URL` (fallback `https://candaan-api.vercel.app/api/image/random`). Menangani kesalahan HTTP dan memberi log jadwal.
  - `logger.ts`: Logger event `raw` sederhana.
  - `ready.ts`: Saat `ready`, mampu join voice channel (jika `VOICE_CHANNEL_ID` diset) dan memutar beberapa aktivitas Rich Presence ketika `AUTO_STATUS_ROTATOR` aktif, dengan logging error yang baik.

- **Type definition (`src/types/modules.ts`)**
  - Menyediakan interface untuk command/event module sehingga loader tetap konsisten.

- **Tooling bawaan**
  - ESLint konfigurasi flat + `typescript-eslint` dengan linting bertipe khusus untuk `src`.
  - Prettier (`.prettierrc.json`, `.prettierignore`) dan Husky hooks dengan `lint-staged`.
  - Script `pnpm` untuk build (tsc), dev (`tsx watch`), lint, format, dsb.
  - Skrip utilitas `auto_pull.sh`.

---

## Peningkatan Terbaru

1. **Perbaikan dispatcher command**
   - `src/events/messageCreate.ts` kini:
     - Mengabaikan pesan selain dari akun selfbot.
     - Menerima dua format mention agar fleksibel terhadap perubahan display name.
     - Memberi pesan peringatan saat `client.commands` belum siap.
     - Hanya memeriksa role jika `ADMIN_ROLE_ID` diatur, lalu mengirim balasan “tidak punya izin” yang jelas.
     - Logging tambahan ketika data author atau `client.user` belum siap.

2. **Fondasi unit testing**
   - Menambahkan dependensi `jest`, `ts-jest`, `@types/jest`.
   - Membuat `jest.config.cjs` dengan preset ts-jest, coverage, dan setup khusus.
   - `tests/setup.ts` menyiapkan env (ADMIN_ROLE_ID) dan reset mock sebelum tiap test.
   - `tests/messageCreate.test.ts` berisi tiga skenario:
     - Jalur sukses ketika akun selfbot dan role cocok.
     - Pesan dari user lain diabaikan.
     - Jalur gagal ketika role tidak memenuhi syarat.

3. **Perbaikan Developer Experience**
   - Menambahkan script `pnpm test` dan menautkannya ke Husky pre-push (urutan lint → test → build).
   - Membuat hook `commit-msg` yang memaksa format Conventional Commits dengan pengecualian `wip:` dan merge commit.
   - Menyesuaikan `eslint.config.mjs` supaya file test tidak memerlukan parser informasi tipe sehingga lint staged berjalan mulus.

---

## Dependensi Baru (Dev)

- `jest`
- `ts-jest`
- `@types/jest`

Tidak ada perubahan pada dependency runtime.

---

## Kekurangan & Risiko yang Terlihat

- **Status selfbot:** library yang dipakai melanggar ToS Discord bila dipakai di akun real. Harus sangat hati-hati bila ingin dipakai di luar eksperimen.
- **Hak akses terbatas:** dispatcher hanya menerima command dari akun selfbot. Jika ingin admin lain bisa mengakses, perlu mekanisme whitelist tambahan.
- **Ketergantungan cache:** pengecekan role memakai cache `message.guild.members`. Pada server besar, cache mungkin tidak lengkap—perlu fallback `fetch`.
- **Ketergantungan restart:** module scheduler `dailyMeme` tidak punya persistensi, sehingga restart akan memundurkan jadwal dan tidak punya backoff untuk kegagalan beruntun.
- **Cakupan testing sempit:** Baru event `messageCreate` yang diuji. Command lain dan scheduler belum tertangkap oleh unit test.
- **Logging bising:** Penggunaan `console.log` masih banyak. Tanpa level log atau pemfilteran, output produksi bisa sulit dibaca.
- **Validasi konfigurasi minim:** Error akibat env yang kosong baru terlihat ketika fitur dipicu. Perlu mekanisme validasi saat startup agar developer tahu lebih cepat.
- **Keamanan webhook:** Command webhook belum memberi detail saat request gagal (status code, dsb). Pengguna mungkin kesulitan debug bila URL salah.

---

## Rekomendasi Pengembangan

1. **Perluas suite testing**
   - Tambah test untuk command lain dan event scheduler.
   - Pertimbangkan integration test dengan mock klien Discord.js untuk memverifikasi registrasi module.

2. **Kenyamanan command**
   - Buat command `help` yang menampilkan daftar command dan contoh penggunaan.
   - Tambahkan opsi prefix teks selain mention agar fleksibel.

3. **Manajemen hak akses**
   - Izinkan beberapa role ID atau daftar user ID yang dipercaya.
   - Fallback `message.guild.members.fetch` saat cache kosong supaya pengecekan role tidak gagal.

4. **Ketahanan scheduler**
   - Simpan state jadwal (misal di file atau key-value store) agar restart tidak mengulang jadwal awal.
   - Terapkan retry/backoff bila API meme bermasalah atau sediakan fallback konten lokal.

5. **Observabilitas**
   - Standarkan format log (misal pakai level info/warn/error) dan sertakan timestamp.
   - Pertimbangkan agregasi log ke file atau layanan log untuk pemantauan jangka panjang.

6. **Validasi konfigurasi**
   - Tambahkan pengecekan `.env` saat startup; jika ada config wajib yang hilang, tampilkan instruksi lengkap atau hentikan proses.
   - Perbarui `.env.example` agar mencantumkan seluruh variabel yang dipakai (TOKEN, ADMIN_ROLE_ID, DAILY_MEME_CHANNEL_ID, EMOJI_CHANNEL_ID, dsb).

7. **Keamanan & roadmap**
   - Dokumentasikan langkah menjalankan bot di server sandbox.
   - Jika ingin produksi, rencanakan migrasi ke bot resmi (Discord bot SDK + slash command) agar tidak menyalahi ToS.

8. **CI/CD**
   - Replikasi tahapan Husky (lint, test, build) pada pipeline CI supaya tetap terjaga walau hook dilewati.
   - Publikasikan laporan cakupan test atau lint di pull request.

---

## Ringkasan

Proyek telah memiliki selfbot modular dengan auto-loading command/event, reaksi emoji otomatis, scheduler meme harian, pengaturan presence, dan dispatcher yang lebih aman untuk command milik akun sendiri. Tooling diperkuat dengan Jest, hook commit konvensional, serta push pipeline yang menjalankan lint/test/build. Fokus lanjutan sebaiknya pada perluasan testing, penguatan manajemen akses, validasi konfigurasi, dan peningkatan observabilitas supaya proyek makin stabil dan mudah dirawat.
