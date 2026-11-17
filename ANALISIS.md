# Analisis referensi dan penerapan

Sumber: https://sites.google.com/view/harpro-up2dkalbar/
Diakses 18 November 2026 WIT.

## Arsitektur informasi

Situs referensi memakai tujuh menu utama: Home; Proteksi & Meter; Pemeliharaan E&M; Support; Task Monitoring; Weather; About Us. Navigasi lengkap terdiri atas 81 entri unik dan disimpan di menu.json. Products dan Solutions tetap menjadi kelompok bertingkat pada Proteksi & Meter serta Pemeliharaan E&M. Support mempertahankan kelompok Software.

Home sumber menggabungkan perkenalan unit, cuaca, tautan cepat, dan berita. Portal Merauke memusatkan Home pada ringkasan pekerjaan, timeline, kalender, dan akses cepat ke data proteksi, jadwal padam, dan SLD.

Halaman Settings OCR/GFR sumber memiliki bagian setting penyulang/outgoing, recloser, dan display setting. Versi Merauke menghubungkan sumber spreadsheet yang diberikan pengguna, mempertahankan area recloser dengan status belum tersedia, serta tidak membawa data Kalimantan Barat.

Task Monitoring sumber terutama merupakan kumpulan embed spreadsheet dan dashboard (material, RKM, pemasangan keypoint, pemeliharaan, pengadaan, gangguan, dan lainnya). Versi Merauke mengubah interaksi utamanya menjadi timeline horizontal per pekerjaan sesuai screenshot Task Management. Ini adalah sistem tugas lokal yang berdiri sendiri; data tugas belum ditarik dari Google Sheets.

## Arah visual

Screenshot Planex menjadi referensi warna netral hangat, panel lembut, sudut membulat, ruang kosong, ikon garis, serta tombol hitam. Screenshot Task Management digunakan untuk susunan bar horizontal: nama tugas di kiri, rentang tanggal di kanan, progres di dalam bar. Warna biru/magenta cerah diganti sage, peach, pasir, dan lavender lembut.

Pada HP, sidebar berubah menjadi drawer, kartu akses cepat ditumpuk, metrik menjadi dua kolom, dan timeline dapat digeser secara horizontal di dalam panel. Lebar halaman utama tetap mengikuti layar.

## Batas implementasi

Menu dan shell portal tersedia lengkap; isi dokumen operasional untuk submenu selain OCR/GFR perlu dihubungkan oleh pemilik. Halaman kalkulator dalam navigasi dipertahankan sebagai halaman sumber, belum berupa mesin perhitungan teknik. Belum ada database bersama, kontrol akses internal, impor data tugas, notifikasi, kalender dinamis, atau sinkronisasi tugas ke Sheets.
