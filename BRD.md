# Business Requirements Document (BRD) - Luang.ai

## 1. Executive Summary
Luang.ai adalah aplikasi pintar (*Progressive Web App*) yang ditujukan untuk membantu pekerja kantoran atau masyarakat umum dalam merencanakan cuti, liburan, dan waktu luang mereka. Melalui integrasi kecerdasan buatan (via n8n), Luang mengambil alih beban kognitif pengguna dalam menyocokkan sisa cuti, jadwal tanggal merah nasional, dan memprediksi kepadatan lalu lintas agar mendapatkan pengalaman liburan yang optimal.

## 2. Business Objectives
1. **Meningkatkan Work-Life Balance**: Mengurangi stres pekerja dengan memberikan jadwal cuti yang akurat dan minim hambatan.
2. **Efisiensi Cuti**: Membantu karyawan "menghemat" jatah cuti tahunan dengan cara menggabungkan cuti dengan hari libur nasional (harpitnas).
3. **Automasi Perencanaan Perjalanan**: Menyediakan *itinerary* dasar beserta rekomendasi transportasi tanpa pengguna harus riset manual dari nol.

## 3. Target Audience
1. **Karyawan Kantoran**: Terikat dengan kuota cuti tahunan (misal 12 hari/tahun) dan mencari hari kejepit untuk libur panjang.
2. **Keluarga (Mudik/Acara)**: Membutuhkan analisis kemacetan dan cuaca lokasi tujuan untuk keamanan perjalanan.
3. **Wisatawan Mandiri**: Orang yang spontan namun tetap butuh jaminan tiket, akomodasi, dan rute terbaik.

## 4. Scope of the System
Sistem berfokus pada **Sisi Klien (Frontend)** yang saat ini dibangun menggunakan arsitektur *serverless/headless*, di mana otak kecerdasan buatan sepenuhnya di- *offload* ke n8n (sebagai orkestrator *Agent AI*).
- **In-Scope**: Web app (PWA), Integrasi Geolokasi, Penyimpanan Riwayat Offline (LocalStorage), Antrean AI Otomatis (Background Worker), dan Pengaturan Bahasa (ID/EN).
- **Out-of-Scope (Saat Ini)**: Pembelian tiket langsung (hanya memberikan saran tautan/nama platform), sinkronisasi real-time antar-perangkat (masih bergantung pada local storage HP masing-masing sebelum integrasi Supabase).

## 5. Key Success Metrics (KPI)
1. **User Retention**: Seberapa sering pengguna kembali membuka aplikasi untuk mengecek cuti atau riwayat rekomendasi.
2. **Conversion Rate (Pencarian -> Hasil)**: Persentase pengguna yang berhasil menyelesaikan *form* pencarian hingga mendapatkan rekomendasi tanpa terkendala error limit (429).
3. **PWA Install Rate**: Jumlah pengguna yang mengunduh (Add to Homescreen) aplikasi Luang.ai ke perangkat seluler mereka.

## 6. Functional Requirements (High Level)
- Aplikasi harus dapat mengenali lokasi *user* secara akurat dengan persetujuan (Consent).
- Aplikasi harus menyediakan 3 jenis rekomendasi dari AI: Rekomendasi Utama (Terbaik), Opsi Hemat Cuti, dan Opsi Menghindari Macet.
- Aplikasi harus menangani limitasi API/Token dari AI. Jika *rate limit* tercapai, aplikasi tidak boleh membuang data *user*, melainkan menahannya di antrean latar belakang dan melakukan *retry* otomatis.

## 7. Future Roadmaps (Supabase Phase)
- **Phase 1 (Current)**: Frontend lokal dengan *state management* *localStorage* + PWA.
- **Phase 2**: Otentikasi sungguhan (Supabase Auth) untuk melacak secara riil jatah cuti per pengguna. Sinkronisasi *History* lintas-perangkat menggunakan PostgreSQL Supabase.
- **Phase 3**: Integrasi pemesanan (Traveloka/Tiket.com API) secara langsung melalui *widget* aplikasi.
