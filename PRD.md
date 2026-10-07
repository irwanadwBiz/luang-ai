# Product Requirements Document (PRD) - Luang.ai

## 1. Product Overview
Luang.ai adalah antarmuka web (Frontend) yang menjembatani *user* dengan *AI Agent Workflow* di n8n. Aplikasi ini dirancang menyerupai aplikasi *native* di *smartphone* berkat teknologi Progressive Web App (PWA) Next.js. Desain aplikasi difokuskan pada konsep minimalisme (*Ponytail Review* rules), antarmuka dinamis (*micro-animations*, warna cerah), dan interaksi *stateless* namun persisten (via *Local Storage*).

## 2. Fitur Utama & Spesifikasi

### 2.1 PWA (Progressive Web App)
- **Deskripsi**: Aplikasi dapat di-*install* (Add to Home Screen) pada peramban Chrome, Safari, dan Edge genggam.
- **Teknologi**: `@ducanh2912/next-pwa` dengan `next.config.ts` khusus untuk `Turbopack`.
- **Kebutuhan**: *Manifest* `public/manifest.json` yang berisi definisi warna *theme* (#ffffff), ikon beresolusi mulai 192px hingga 512px, serta mode *standalone* display.

### 2.2 Geolocation & Nominatim Reverse Geocoding
- **Deskripsi**: Mengetahui titik kumpul/keberangkatan *user* agar AI di n8n bisa menganalisis rute.
- **Spesifikasi**:
  - Hanya men- *trigger* API Geolocation bawaan peramban jika *user* sudah memberikan *consent* (centang opsi lokasi).
  - Melakukan *fetch* ke OpenStreetMap (Nominatim) `/reverse` endpoint untuk menerjemahkan koordinat Latitude/Longitude menjadi nama Kota yang bisa dipahami AI.

### 2.3 Toleransi Kegagalan AI (Background Worker & Retry System)
- **Deskripsi**: Menghindari *User Frustration* saat eksekusi n8n tersendat akibat *Free Tier Rate Limit* (429/Token Exhausted).
- **Spesifikasi**:
  - Jika `fetch` mendapat respons berbau limit ("429", "exhausted"), aplikasi menelan *error* tersebut.
  - Aplikasi menyimpan *payload* pencarian ke `localStorage` dengan status `pending_limit` dan menyetel stempel waktu antre `Date.now() + 1 jam`.
  - Halaman `Dashboard` (Riwayat) mengubah UI menjadi lencana warna kuning "Pending (i)" dengan pesan *Tooltip* informatif.
  - Ada `setInterval` (*Worker*) di dalam `AuthContext.tsx` yang secara otomatis mengecek setiap 60 detik. Jika durasi tunggu sudah lewat, ia akan kembali memanggil n8n di belakang layar tanpa mengganggu aktivitas *user*. 
  - Setelah berhasil, status diperbarui menjadi `completed`, *storage event* ditekan (*dispatched*), dan antarmuka *Dashboard* seketika berubah hijau menjadi "Tersimpan".

### 2.4 Sistem Profil & Auth (Mock / Local)
- **Deskripsi**: Meyakinkan bahwa rekomendasi cuti berbasis kuota personal, bukan global.
- **Spesifikasi**:
  - `AuthContext` menyediakan objek `userProfile` (Mock: Sisa Cuti 10, Jatah 12).
  - Profil bersifat kondisional. *Field* cuti di *form* hanya muncul jika aplikasi mendeteksi pengguna `isLoggedIn`.
  - Jika belum *login*, pengguna didorong melakukan pendaftaran.

## 3. Struktur Antarmuka (Pages)

1. **`/search`**:
   - Komponen interaktif *stepper* khusus (bukan `input type="number"` biasa) untuk memilih jumlah hari.
   - Pilihan *Pills* dinamis (Liburan, Mudik, dll) dan transportasi.
   - Kotak centang persetujuan Geolocation.
2. **`/result`**:
   - Pengurai (*Parser*) JSON cerdas yang otomatis merapikan kembalian JSON milik n8n.
   - Desain *Accordions* bergaya *expandable* untuk setiap jenis rekomendasi (Utama, Hemat, Anti-Macet).
   - Indikator khusus "Info Tanggal Merah" (*Holiday Context*) dan "Analisis Luang" dengan efek gradien.
3. **`/dashboard`**:
   - Etalase riwayat pencarian (dibaca dari `luang_history` di *localStorage*).
   - Menghitung heuristik hari cuti yang diselamatkan (jumlah riwayat x 2 hari).
   - Memiliki *Event Listener* penyegaran-mandiri yang bereaksi jika ada aktivitas latar belakang (dari *Worker* limitasi).

## 4. Infrastruktur & Deployment
- **Engine**: Next.js 16 (App Router + Turbopack).
- **Styling**: TailwindCSS dengan konvensi penamaan Material Design 3 (MD3) seperti `bg-surface-container` dan `text-primary`.
- **Hosting**: Vercel (Produksi).
- **Variabel Lingkungan yang Wajib**:
  - `NEXT_PUBLIC_N8N_WEBHOOK_URL` (URL Absolute n8n. Pastikan bisa diakses publik/CORS terbuka).
