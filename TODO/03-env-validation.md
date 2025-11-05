# TODO 03 – Validasi Environment & Dokumentasi

Status:

- [ ] Belum
- [x] Sudah

Tujuan:

- Menambahkan validasi environment saat startup agar konfigurasi wajib terdeteksi lebih awal.
- Memperbarui `.env.example` beserta dokumentasi singkat mengenai variabel yang dipakai.

Langkah rinci:

1. Buat utilitas baru (misal `src/utils/validateEnv.ts`) yang memeriksa variabel kritis: `TOKEN`, `TEXT_PREFIX` (opsional), `ADMIN_ROLE_ID` (opsional), `EMOJI_CHANNEL_ID` (opsional), `DAILY_MEME_CHANNEL_ID` (opsional), `DAILY_MEME_API_URL`, `WEBHOOK_URL`, `VOICE_CHANNEL_ID`.
2. Panggil utilitas ini dari `src/index.ts` sebelum inisialisasi client; hentikan proses dengan pesan jelas jika variabel wajib (TOKEN) tidak ada.
3. Tambahkan warning/log jika variabel opsional kosong namun fitur terkait diaktifkan.
4. Perbarui `.env.example` agar mencantumkan seluruh variabel yang digunakan.
5. Sesuaikan dokumentasi tambahan bila diperlukan (README atau REVIEW).
6. Jalankan `pnpm lint`, `pnpm test`, pastikan tidak ada failure.
7. Commit dengan pesan `chore(config): add startup env validation`.
