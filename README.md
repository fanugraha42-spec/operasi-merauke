# Operasi · UP3 Merauke

Portal Bidang Operasi UP3 Merauke, React + Vite. Diimpor ke Vercel dari repositori ini.

## Konfigurasi proyek yang sudah dipasang

Project URL dan publishable key publik pemilik sudah ditanam di `src/supabase.public.json`. Vercel dapat membangun koneksi dari file ini tanpa environment variable tambahan. Variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` tetap dapat dipakai untuk mengganti konfigurasi saat build.

**Hasil pemeriksaan awal:** proyek Supabase merespons, tetapi REST API belum menemukan `portal_tasks` dan `portal_sheet_sources`. Jalankan `supabase/schema.sql` pada SQL Editor proyek tersebut. Selama tabel belum tersedia, portal akan menampilkan error penyimpanan bersama dan tidak menerima penyimpanan baru. Tugas lama browser tetap dapat diunduh melalui Panduan portal.

Setelah SQL berhasil, portal mencoba koneksi lagi setiap 10 detik; bisa juga klik Muat ulang data. Koneksi GitHub ke Supabase tidak otomatis membuat kedua tabel ini.

## Penyimpanan bersama tanpa login

Versi ini menyediakan koneksi Supabase untuk tugas dan sumber Google Sheets bersama. Sesuai permintaan pemilik, **semua pengunjung dapat membaca, menambah, mengubah, dan menghapus data portal tanpa login**. Siapa pun yang mengetahui URL/API juga dapat melakukan perubahan tersebut. Izin ini hanya diterapkan pada dua tabel portal. Izin dokumen Google Sheets tetap mengikuti pengaturan Google.

**Belum aktif sampai skrip SQL berhasil dijalankan dan deployment yang memuat konfigurasi publik selesai.** Mode lokal hanya digunakan jika konfigurasi publik dihapus dan kedua environment variable dikosongkan. Jika konfigurasi sudah ada tetapi database/koneksi gagal, aplikasi menampilkan error dan tidak beralih diam-diam ke penyimpanan lokal.

### 1. Buat proyek Supabase

1. Di dashboard Supabase, buat **New project** bernama `operasi-merauke`.
2. Pilih organisasi Anda dan region yang dekat dengan pengguna. Simpan password database secara pribadi; frontend tidak membutuhkannya.
3. Tunggu proyek selesai dibuat.
4. Buka **SQL Editor → New query**, salin seluruh isi [`supabase/schema.sql`](supabase/schema.sql), lalu **Run**.
5. Skrip membuat tabel `portal_tasks` dan `portal_sheet_sources`, validasi data, revision, serta policy baca/tulis/hapus publik untuk role `anon` dan `authenticated`.
6. Skrip memasang link bawaan OCR/GFR dan Jadwal Padam. Menjalankannya lagi tidak menimpa link yang sudah diedit pengguna.

Tugas bersama awalnya kosong. Tugas contoh dan data lama browser tidak diunggah otomatis. Cadangan tugas lama dapat diunduh lewat **Panduan portal → Unduh cadangan tugas lama browser ini**. Setelah koneksi aktif, masukkan tugas yang ingin dipublikasikan melalui Tambah pekerjaan. Jangan menghapus data browser sebelum menyimpan cadangan.

### 2. Hubungkan Vercel

Ambil **Project URL** dan **Publishable key** dari pengaturan API/Connect proyek Supabase. Legacy `anon` key juga didukung. Ini kunci publik untuk frontend, bukan password atau service key.

Di Vercel → proyek `operasi-merauke` → Settings → Environment Variables, tambahkan:

| Nama | Isi |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL, mis. `https://PROJECT.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key berawalan `sb_publishable_`, atau legacy `anon` key |

Pasang pada environment Production (dan Preview jika dibutuhkan), lalu **Redeploy**. Vite membaca konfigurasi saat build, sehingga mengganti variable tanpa redeploy belum mengaktifkan koneksi. Jangan memakai `service_role`, `sb_secret_`, atau password database pada variable `VITE_`.

Build Vercel: preset **Vite**, command `npm run build`, output `dist`. Navigasi memakai hash URL.

### 3. Periksa dari dua perangkat

1. Buka URL deployment yang sama pada laptop dan HP. Keduanya harus menampilkan **Terhubung · data bersama diperbarui otomatis setiap 10 detik**.
2. Tambahkan tugas dari laptop; HP menampilkan tugas tersebut dalam sekitar 10 detik selama halaman aktif, atau gunakan **Muat ulang data**.
3. Ubah progres dan prioritas dari HP; perubahan terlihat di laptop.
4. Ubah sumber Sheets pada salah satu submenu, lalu periksa submenu yang sama di perangkat lain.
5. Hapus tugas uji; tugas tersebut ikut hilang pada perangkat lain.

Jika muncul error, periksa URL/key, hasil SQL, koneksi internet, dan apakah proyek Supabase aktif. Jangan menonaktifkan RLS: policy publik yang diperlukan sudah disertakan dalam skrip.

## Perilaku sinkronisasi

- Setiap tugas disimpan sebagai satu baris; menyimpan satu tugas tidak mengganti seluruh daftar dan tidak menghapus tugas baru pengguna lain.
- Setiap sumber Sheets disimpan per path menu.
- Perangkat mengambil data setiap 10 detik saat tab terlihat, saat jendela kembali aktif, saat online, dan setelah menyimpan. Ini polling, bukan WebSocket/realtime instan.
- Perubahan menggunakan nomor revision. Jika dua orang mengedit baris yang sama, perubahan kedua dari formulir lama ditolak dengan pesan konflik. Tutup formulir, muat ulang data, lalu buka detail terbaru.
- Pesan berhasil baru muncul setelah server mengonfirmasi penyimpanan. Error mempertahankan formulir beserta isinya agar dapat dicoba ulang.
- Data lama localStorage tidak dihapus atau dipublikasikan otomatis.
- Pembaruan isi spreadsheet berasal dari Google, bukan dari database tugas. Muat ulang halaman untuk memuat ulang embed.

## Jalankan lokal

```sh
npm ci
cp .env.example .env.local
# Isi .env.local dengan konfigurasi publik proyek Anda.
npm run dev
```

```sh
npm test
npm run build
```

Tanpa `.env.local`, aplikasi memakai konfigurasi publik di `src/supabase.public.json`. Jangan commit `.env.local`.

## Fitur antarmuka

62 entri menu; Products Proteksi & Meter disederhanakan menjadi 13 submenu sesuai revisi pemilik, sidebar dengan animasi expand/collapse dan hover transparan, header sticky, pencarian, layout responsif, timeline horizontal 10 hari, filter tim, editor tugas, warna berdasarkan prioritas, ekspor JSON, dan embed Windy untuk Merauke. Kalender/periode awal dashboard masih contoh November 2026. Form tugas baru memakai tanggal hari ini di WIT.

Sumber Google Sheets bawaan ada di `src/main.jsx` (`defaultSheets`) dan seed SQL. Setelah database aktif, sumber database mengungguli sumber bawaan kode. Sumber yang diedit pada mode lokal hanya berlaku di browser tersebut.

## Struktur dan validasi

- `src/shared-store.js`: klien Supabase REST dengan penyimpanan per baris dan cek revision.
- `src/usePortalData.js`: status koneksi, sinkronisasi berkala, dan mode lokal.
- `supabase/schema.sql`: tabel, validasi, policy publik, serta seed sumber Sheets.
- `tests/shared-store.test.js`: dua klien dengan database PostgREST simulasi untuk konflik, penghapusan, perubahan Sheets, pagination, dan kegagalan jaringan.
- `tests/lib.test.js`: validasi embed dan perhitungan timeline.

Build dan tes otomatis dijalankan. Proyek Supabase asli belum tersedia saat implementasi; SQL/policy dan sinkronisasi dua perangkat pada deployment asli masih perlu diverifikasi setelah konfigurasi. Tes simulasi tidak menggantikan uji deployment pada langkah 3.

Referensi: [API keys Supabase](https://supabase.com/docs/guides/getting-started/api-keys), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Products Proteksi & Meter dan Pending Item

Products berisi 13 entri: Setting OCR / GFR, Setting UFR, Setting Sectionalizer, Data Screening Keypoint, Fault Locator, Feeder Underbuilt, Jurnal DCC, Sectionalizer Solution, Recloser Solution, Relay Solution, 3 Way Solution, SOP dan IK Proteksi, serta Pending Item Proteksi. Tiga slug setting lama dipertahankan supaya sumber tersimpan tetap berlaku. Halaman solusi/SOP/Pending lama dialihkan ke lokasi baru melalui alias. Entri lama yang dihapus dari menu tidak menghapus data Supabase.

Dua sumber Sheets baru ada di `src/protection.js`, seed SQL, dan database bersama.

Halaman solusi Google Sites berisi artikel native, bukan embed Sheets. Situs sumber mengirim `X-Frame-Options: DENY` dan CSP `frame-ancestors`, sehingga seluruh halaman tidak bisa di-iframe. Portal menyediakan tombol ke panduan asli serta panel lampiran asli (Drive/folder/video/PDF) menggunakan ID yang sama, dicatat di `src/original-sources.json`. Artikel lengkap tetap dibaca pada situs sumber; isi teknisnya tidak disalin atau diubah. Label lampiran portal diringkas untuk navigasi.

Pending Item adalah daftar temuan bersama: ringkasan temuan/lokasi, PIC, tanggal, target, prioritas, dan status. Status Terbuka/Dalam tindak lanjut/Selesai disimpan sebagai progres 0/50/100. Temuan memakai baris `portal_tasks` dengan ID awalan `pending-proteksi-` dan tim Proteksi & Meter. Awalan tersebut mengidentifikasi jenis temuan; temuan tidak ikut dihitung atau ditampilkan pada dashboard/timeline pekerjaan umum. Mekanisme revision dan sinkronisasi 10 detik tetap digunakan. **Tidak perlu menjalankan SQL atau membuat tabel baru untuk fitur Pending Item.**

Sumber diperiksa pada 25 November 2026. Pengujian tambahan ada di `tests/protection.test.js` dan uji sinkronisasi temuan di `tests/shared-store.test.js`.

### Navigasi Proteksi

Nama menu utama menjadi **Proteksi**. Ketiga belas halaman ditampilkan langsung di bawah Proteksi, tanpa kelompok Products. Halaman ringkasan Proteksi juga menampilkan langsung 13 kartu tersebut. `parent` pada menu menentukan induk tampilan; path halaman dan kunci sumber Sheets tetap dipertahankan supaya link serta data bersama yang sudah ada tetap bekerja. Bookmark lama `#proteksi-meter/products` dialihkan ke ringkasan Proteksi. Hierarki Pemeliharaan E&M dan Support tetap memakai induknya masing-masing.

## SCADA dan kategori pekerjaan

Menu SCADA & Telekomunikasi ada langsung di bawah Proteksi, berisi List IP RTU GH, List IP Relay, dan List IP Keypoint. Sumber Sheets belum diberikan; ketiga halaman menyediakan pengaturan sumber bersama.

Task Monitoring mempunyai lima tab kategori. Tambah pekerjaan memakai kategori tab aktif sebagai awal; kategori bisa dipilih atau diubah pada formulir. Kategori berbeda dari tim penanggung jawab. Data lama tanpa kategori ditampilkan dalam Proteksi.

**Untuk database yang sudah berjalan**, jalankan `supabase/migrations/20261126_task_categories.sql` di SQL Editor Supabase. Ini menambah kolom kategori tanpa menghapus pekerjaan lama. Instalasi baru dapat memakai schema.sql. Tanpa migrasi, pembacaan data lama tetap tersedia, tetapi simpan pekerjaan berkategori menampilkan instruksi migrasi.

Ikon ekspor ada di kanan Tambah pekerjaan. XLSX berisi Seluruh Pekerjaan (semua kategori), Tampilan Aktif (tab dan filter aktif), Rekap Kategori, serta Keterangan. Pending Item Proteksi tidak masuk rekap tugas. Tanggal berupa date Excel, progres numerik berformat persen, durasi numerik, baris header dibekukan, dan autofilter tersedia. Label ruang kerja bersama di atas monitoring dihapus.

## Sumber asli Support

Wiring Diagram Keypoint, empat halaman Manual Book, halaman Software, dan 12 submenu Software memakai sumber asli yang diambil dari Har-Pro pada 26 November 2026. Terdapat 186 referensi berlabel di 18 halaman (sebagian dapat menunjuk berkas yang sama). URL halaman dan sumber disimpan di `src/original-sources.json`.

Berkas/folder Drive yang mendukungnya ditampilkan lewat preview; link unduhan ABB, Schneider dan sumber eksternal lain dibuka pada penyedianya. Semua sumber dapat dibuka langsung melalui tombol Buka sumber. Akses tetap mengikuti izin pemilik; portal tidak menyalin berkas, mengubah izin, atau menjalankan software/firmware. Daftar sumber dapat dicari berdasarkan nama/versi. Halaman Software tetap menampilkan semua tombol submenunya di atas katalog utama.

Validasi meliputi kelengkapan 18 halaman, konsistensi ID berkas pada preview, vendor downloads, dan keberadaan 12 katalog submenu. Isi serta keberhasilan unduhan setiap berkas pihak ketiga belum diverifikasi.
