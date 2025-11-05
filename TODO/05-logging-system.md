# TODO 05 – Sistem Logging Pino

Status:

- [ ] Belum
- [x] Sudah

Tujuan:

- Mengintegrasikan logger Pino yang ringan dan konsisten di seluruh runtime bot.
- Menyediakan konfigurasi berbeda untuk environment development dan production.
- Mengganti penggunaan `console.*` dengan logger terstruktur berlevel.
- Menjamin konfigurasi dapat diatur lewat environment (`LOG_LEVEL`, `NODE_ENV`).

Langkah yang diselesaikan:

1. Menambahkan dependensi `pino` (runtime) dan `pino-pretty` (dev) sesuai rekomendasi.
2. Membuat utilitas `src/utils/logger.ts` dengan konfigurasi:
   - Level default mengikuti `LOG_LEVEL` atau `debug` di non-production.
   - Output JSON di production, `pino-pretty` dengan warna & timestamp human readable di development.
   - Timestamp ISO dan metadata `service` sebagai konteks bawaan.
   - Fungsi `getLogger` untuk membuat child logger per modul.
3. Memperbarui bootstrap (`src/index.ts`) untuk menggunakan logger ketika memuat command/event, melaporkan sukses login, dan menangani error.
4. Mengganti seluruh `console.log/warn/error` pada command & event (`messageCreate`, `ready`, `autoEmojiReactor`, `dailyMeme`, dll.) dengan child logger yang relevan.
5. Menambahkan variabel opsional `LOG_LEVEL` ke `.env.example` serta validasi environment agar konfigurasi logging terdokumentasi.
6. Memperbarui suite Jest agar mem-mock logger (menghindari noise) dan menyesuaikan pengujian baru.
7. Menjalankan `pnpm lint` dan `pnpm test` memastikan integrasi logging tidak menimbulkan regresi.

Catatan praktik baik:

- Gunakan `getLogger('nama-modul')` di file baru agar log mudah ditelusuri.
- Atur `LOG_LEVEL` ke `debug` saat debugging lokal, `info` atau `warn` untuk produksi.
- Jika butuh konteks tambahan (misal requestId), buat child logger dengan `getLogger({ module: '...', requestId })`.
- Saat menambah fitur baru, log peristiwa penting (success, error, path cabang) dengan level yang tepat (`info` untuk jalur normal, `warn` untuk kondisi tak lazim, `error` untuk kegagalan).
