# Luang Frontend 🏝️
**Cari Waktu Luang, Biar AI yang Pusing!**

Aplikasi PWA (Progressive Web App) berbasis Next.js 16 (Turbopack) yang mengintegrasikan kecerdasan buatan via n8n webhook untuk merencanakan liburan, memprediksi kemacetan, dan menyesuaikan dengan sisa cuti.

## 🚀 Fitur Utama
1. **Analisis Jadwal & Cuti Pintar**: Memberikan rekomendasi liburan berdasarkan tanggal merah dan sisa cuti.
2. **Integrasi n8n AI Workflow**: Langsung menembak Webhook n8n yang berisi Agent (Trip Planner, Leave Assistant, Crowd Predictor).
3. **Background Worker (Auto-Retry)**: Jika limit n8n habis (Error 429), request disimpan ke antrean lokal dan akan diproses ulang otomatis di latar belakang setiap menit.
4. **Offline & PWA Support**: Dapat diinstal di HP, dan riwayat disimpan di `localStorage` (tanpa backend).
5. **Geolocation**: Mengecek cuaca atau kondisi kota asal secara otomatis.

---

## 🛠 Instalasi & Menjalankan Lokal

1. **Clone repository ini**
   ```bash
   git clone <repo-url>
   cd luang-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (.env)**
   Buat file `.env` (file ini di-ignore oleh Git agar aman) dan isi:
   ```env
   # Ganti dengan URL Webhook n8n production Anda, atau ngrok jika local
   NEXT_PUBLIC_N8N_WEBHOOK_URL="https://n8n.domainanda.com/webhook/luang-request"
   ```

4. **Jalankan mode development**
   ```bash
   npm run dev
   ```
   Aplikasi bisa diakses di `http://localhost:3000`.

---

## 📦 Panduan Deploy ke Vercel

Aplikasi ini sudah dioptimasi untuk Vercel. Anda HANYA PERLU men-push folder ini ke GitHub, lalu:
1. Masuk ke **Vercel Dashboard** > Add New Project.
2. Import repository GitHub ini.
3. Di bagian **Environment Variables**, tambahkan:
   - Name: `NEXT_PUBLIC_N8N_WEBHOOK_URL`
   - Value: `https://... (url n8n anda)`
4. Klik **Deploy**.

*File-file yang tidak ikut di-push (sudah ada di `.gitignore`):*
- `node_modules/`
- `.env`
- File hasil build PWA (`sw.js`, `workbox-*.js`)
- `.next/`

---

## 🗄 Migrasi & Seeding ke Supabase (Next Steps)

Saat ini, sistem **Login**, **Profil Cuti (sisa cuti)**, dan **History** masih menggunakan MOCK DATA yang disimpan di `localStorage` (lihat `src/lib/AuthContext.tsx`). 

Untuk mengubahnya ke *Database Real* (Supabase), berikut langkah migrasinya:

### 1. Persiapan Supabase
- Buat project di [Supabase](https://supabase.com/).
- Install client Supabase di proyek ini:
  ```bash
  npm install @supabase/supabase-js
  ```
- Tambahkan Env Var di `.env` (dan Vercel):
  ```env
  NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..."
  ```

### 2. Schema / Table Migration
Buat 2 tabel utama di SQL Editor Supabase Anda:
```sql
-- Tabel Profil User (Untuk menyimpan jatah cuti)
CREATE TABLE public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  sisa_cuti integer default 12,
  jatah_cuti integer default 12
);

-- Tabel Riwayat Pencarian (Menggantikan luang_history di localStorage)
CREATE TABLE public.search_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users not null,
  destination text,
  reason text,
  payload jsonb, -- Untuk sistem pending/retry
  status text default 'completed', -- 'completed', 'pending_limit'
  retry_at timestamp with time zone,
  ai_response jsonb, -- Hasil dari n8n
  created_at timestamp with time zone default now()
);
```

### 3. Update AuthContext.tsx
Ganti logika `localStorage.getItem('isLoggedIn')` dengan `supabase.auth.getSession()` atau gunakan SSR/Middleware Supabase agar manajemen sesi lebih aman. Ganti juga logika `Background Worker` agar mengintip tabel `search_history` di database (atau pindahkan Worker ke backend NestJS jika aplikasi ini digabung).
