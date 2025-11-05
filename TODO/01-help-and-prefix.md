# TODO 01 – Help Command & Prefix

Status:

- [ ] Belum
- [x] Sudah

Tujuan:

- Menambahkan command `help` yang menampilkan daftar command aktif beserta deskripsi singkat.
- Menyediakan dukungan prefix teks (misalnya `!`) yang bisa dikonfigurasi via environment (`TEXT_PREFIX`), selain prefix mention.

Langkah rinci:

1. Buat file baru `src/commands/help.ts` yang mengambil daftar command dari `client.commands` dan menyusun pesan berformat rapi.
2. Simpan metadata deskripsi pada setiap command yang relevan (clear, serverinfo, webhook) untuk dipakai oleh `help`.
3. Update handler `messageCreate` sehingga menerima prefix mention maupun prefix teks (`TEXT_PREFIX`) bila disetel.
4. Tambahkan dokumentasi singkat pada README atau REVIEW bila diperlukan (opsional).
5. Jalankan `pnpm lint`, `pnpm test`, perbaiki apabila gagal.
6. Commit dengan pesan `feat(commands): add help command and text prefix`.
