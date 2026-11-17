# Operasi · UP3 Merauke

Portal Bidang Operasi UP3 Merauke. React + Vite, siap diimpor ke Vercel.

## Jalankan

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
```

## Deploy ke Vercel

1. Import repositori `fanugraha42-spec/operasi-merauke`.
2. Framework: **Vite**. Build: `npm run build`. Output: `dist`.
3. Tidak membutuhkan environment variables untuk versi ini.
4. Klik Deploy. Navigasi memakai hash URL sehingga tidak memerlukan server routing.

## Fitur

- 81 entri navigasi dengan hierarki sama seperti Google Site referensi.
- Dashboard dengan palet abu-abu hangat, kartu membulat, tombol gelap, aksen pastel terinspirasi screenshot Planex.
- Timeline horizontal 10 hari, filter tim, pilihan tanggal awal, tampilan daftar, dan editor tugas.
- Buat, ubah, hapus tugas; ekspor JSON; penyimpanan localStorage pada browser.
- Pencarian menu, menu samping responsif, dan area timeline yang dapat digeser di HP.
- Embed Google Sheets: menu OCR/GFR terhubung dengan URL yang diberikan pemilik.
- Pengaturan sumber Sheets untuk halaman detail lainnya.

## Status data dan batasan

Pekerjaan awal adalah **data contoh**, bukan laporan aktual PLN. Tugas dan perubahan sumber Sheets tersimpan **lokal per browser**, belum tersinkron antar pengguna. Belum ada backend, autentikasi, role admin, atau database bersama. Ekspor tugas tersedia untuk cadangan.

Spreadsheet tetap mengikuti izin Google; portal tidak mengubah sharing. Data spreadsheet tidak disalin ke repository. Untuk file XLSX ini, endpoint `/preview/sheet?gid=…` telah diverifikasi membuka tab berjudul “DATA SETTING PROTEKSI SISTEM DISTRIBUSI”; endpoint `/preview?gid=…` justru memilih tab pertama.

Sumber bawaan terdapat di `src/main.jsx` (`defaultSheet`). Pengaturan di UI berlaku pada browser tersebut saja. Halaman lain menampilkan keadaan kosong yang bisa dihubungkan dengan data Merauke, bukan menyalin data operasional Kalbar. Bagian recloser belum memiliki sumber terpisah. Weather menautkan BMKG; belum memiliki feed cuaca langsung.

Kalender dan periode awal contoh adalah November 2026. Data pekerjaan dapat diubah melalui UI. Untuk penggunaan bersama, tahap berikutnya adalah penyimpanan server dan autentikasi sesuai kebutuhan organisasi.

## Struktur

- `menu.json`: seluruh hierarki menu referensi.
- `src/main.jsx`: komponen portal dan data awal.
- `src/style.css`: desain serta breakpoint HP/tablet/desktop.
- `src/lib.js`: validasi embed dan perhitungan timeline.
- `tests/lib.test.js`: uji URL embed dan pemotongan tanggal timeline.
- `ANALISIS.md`: ringkasan analisis referensi.

## Verifikasi

Tes unit dan build produksi dijalankan. Embed tab spreadsheet diverifikasi pada browser. Pengujian visual/interaksi portal di browser belum dapat dijalankan karena layanan preview lingkungan mengembalikan timeout relay port 4173. CSS responsif telah diimplementasikan, tetapi perlu pemeriksaan visual setelah deployment Vercel.
