# Operasi · UP3 Merauke

Portal Bidang Operasi UP3 Merauke, React + Vite. Diimpor ke Vercel dari repositori ini.

## Penyimpanan bersama tanpa login

Versi ini menyediakan koneksi Supabase untuk tugas dan sumber Google Sheets bersama. Sesuai permintaan pemilik, **semua pengunjung dapat membaca, menambah, mengubah, dan menghapus data portal tanpa login**. Siapa pun yang mengetahui URL/API juga dapat melakukan perubahan tersebut. Izin ini hanya diterapkan pada dua tabel portal. Izin dokumen Google Sheets tetap mengikuti pengaturan Google.

**Belum aktif sampai Anda membuat proyek Supabase, menjalankan SQL, dan memasang kedua environment variable di Vercel.** Tanpa keduanya, portal tetap memakai penyimpanan lokal dengan pemberitahuan yang jelas. Jika konfigurasi sudah ada tetapi database/koneksi gagal, aplikasi menampilkan error dan tidak beralih diam-diam ke penyimpanan lokal.

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

Tanpa `.env.local`, aplikasi berjalan dalam mode lokal. Jangan commit `.env.local`.

## Fitur antarmuka

81 entri menu mengikuti situs referensi, sidebar dengan animasi expand/collapse dan hover transparan, header sticky, pencarian, layout responsif, timeline horizontal 10 hari, filter tim, editor tugas, warna berdasarkan prioritas, ekspor JSON, dan embed Windy untuk Merauke. Kalender/periode awal dashboard masih contoh November 2026. Form tugas baru memakai tanggal hari ini di WIT.

Sumber Google Sheets bawaan ada di `src/main.jsx` (`defaultSheets`) dan seed SQL. Setelah database aktif, sumber database mengungguli sumber bawaan kode. Sumber yang diedit pada mode lokal hanya berlaku di browser tersebut.

## Struktur dan validasi

- `src/shared-store.js`: klien Supabase REST dengan penyimpanan per baris dan cek revision.
- `src/usePortalData.js`: status koneksi, sinkronisasi berkala, dan mode lokal.
- `supabase/schema.sql`: tabel, validasi, policy publik, serta seed sumber Sheets.
- `tests/shared-store.test.js`: dua klien dengan database PostgREST simulasi untuk konflik, penghapusan, perubahan Sheets, pagination, dan kegagalan jaringan.
- `tests/lib.test.js`: validasi embed dan perhitungan timeline.

Build dan tes otomatis dijalankan. Proyek Supabase asli belum tersedia saat implementasi; SQL/policy dan sinkronisasi dua perangkat pada deployment asli masih perlu diverifikasi setelah konfigurasi. Tes simulasi tidak menggantikan uji deployment pada langkah 3.

Referensi: [API keys Supabase](https://supabase.com/docs/guides/getting-started/api-keys), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
