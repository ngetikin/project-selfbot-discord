# TODO 02 – Fallback Member Fetch & Izin

Status:

- [ ] Belum
- [x] Sudah

Tujuan:

- Memastikan pengecekan role admin pada `messageCreate` tetap berjalan ketika member tidak ada di cache.
- Meningkatkan pesan error atau log ketika fetch gagal.

Langkah rinci:

1. Ubah `messageCreate` agar mencoba `message.guild.members.fetch(message.author.id)` bila cache tidak menemukan member.
2. Tambahkan timeout/penanganan error agar fetch tidak menyebabkan unhandled rejection.
3. Pastikan balasan “tidak punya izin” hanya dikirim ketika hasil fetch valid dan role memang tidak ada.
4. Perbarui atau tambahkan unit test untuk kasus fetch fallback.
5. Jalankan `pnpm lint`, `pnpm test`, pastikan semua lolos.
6. Commit dengan pesan `fix(events): ensure permission check fetches member`.
