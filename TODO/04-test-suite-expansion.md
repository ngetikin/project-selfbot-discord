# TODO 04 – Perluasan Unit Test

Status:

- [x] Belum
- [ ] Sudah

Tujuan:

- Menambah cakupan unit test untuk command dan event penting sehingga regresi cepat terdeteksi.

Langkah rinci:

1. Tambahkan test untuk `clear` command (menghapus pesan, validasi jumlah).
2. Tambahkan test untuk `serverinfo` command (menyusun informasi server).
3. Tambahkan test untuk `webhook` command (menangani pesan kosong dan keberhasilan fetch).
4. Tambahkan test untuk `autoEmojiReactor` (pemilihan emoji default dan custom).
5. Tambahkan test untuk scheduler `dailyMeme` (jadwal berikutnya dihitung benar, meng-handle error API). Gunakan mock timer.
6. Pastikan semua test baru bekerja dengan jest menggunakan mocks sehingga tidak perlu memanggil API eksternal asli.
7. Jalankan `pnpm lint`, `pnpm test`.
8. Commit dengan pesan `test: expand coverage for commands and events`.
