"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";

export default function SearchForm() {
  const router = useRouter();
  const { isLoggedIn, lang, userProfile, updateSisaCuti } = useAuth();
  const isEn = lang === 'en';
  
  const [days, setDays] = useState(3);
  const [reason, setReason] = useState(isEn ? "Vacation" : "Liburan");
  const [activity, setActivity] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [destination, setDestination] = useState("");
  const [transport, setTransport] = useState(isEn ? "Personal vehicle" : "Kendaraan pribadi");
  
  const [useLocation, setUseLocation] = useState(false); // Consent checkbox
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return alert(isEn ? "Please enter destination!" : "Isi tujuan dulu ya!");
    if (isLoggedIn && !userProfile) return alert(isEn ? "Profile error!" : "Gagal memuat profil!");
    
    setLoading(true);
    try {
      let originLocation = "Tidak diketahui (Tamu/Akses Lokasi Ditolak)";
      
      // Ambil lokasi hanya jika user login DAN MENGIZINKAN (centang checkbox)
      if (isLoggedIn && useLocation && "geolocation" in navigator) {
        try {
          console.log("Meminta akses lokasi pengguna...");
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Reverse geocoding gratis menggunakan Nominatim OpenStreetMap
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const city = geoData.address?.city || geoData.address?.town || geoData.address?.county || geoData.address?.state || "Lokasi Tidak Dikenali";
            originLocation = `${city} (Lat: ${lat}, Lon: ${lon})`;
            console.log("Lokasi terdeteksi:", originLocation);
          } else {
            originLocation = `Kordinat: Lat ${lat}, Lon ${lon}`;
          }
        } catch (geoErr) {
          console.warn("Gagal mendapatkan lokasi:", geoErr);
        }
      }

      let promptInjection = isEn ? " IMPORTANT: You MUST generate the entire JSON response (including all values, recommendations, and analysis) in English language!" : "";
      if (startDate && endDate) {
        const startStr = startDate.toLocaleDateString('id-ID');
        const endStr = endDate.toLocaleDateString('id-ID');
        promptInjection += ` CRITICAL: User berencana berangkat dan pulang secara spesifik di dalam rentang blok waktu dari tanggal ${startStr} hingga ${endStr}. Pastikan SEMUA kandidat tanggal cuti yang direkomendasikan berada PERSIS di dalam rentang blok waktu tersebut, JANGAN menyarankan bulan atau event libur lain di luar rentang itu.`;
      }
      
      let finalReason = (reason === "Vacation" || reason === "Liburan") && activity.trim() 
        ? `${reason} (Activity: ${activity.trim()})`
        : reason;
        
      if (startDate && endDate) {
        finalReason += ` - Rentang Waktu: ${startDate.toLocaleDateString('id-ID')} s.d. ${endDate.toLocaleDateString('id-ID')}`;
      }

      const payload = {
        email: "User@test.com", // dummy email yg ada di Supabase
        destination,
        reason: finalReason + promptInjection,
        days,
        transport,
        origin_location: originLocation,
        sisaCuti: userProfile?.sisaCuti || 0,
        jatahCuti: userProfile?.jatahCuti || 0
      };

      console.log("Memanggil n8n webhook...", payload);
      
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/luang-request";
      
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log("n8n status:", res.status);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        // Jika AI malah membalas teks biasa (Markdown), jangan biarkan error res.json()!
        // Bungkus teks tersebut ke dalam format buatan agar tidak nendang user.
        console.warn("AI tidak membalas dengan JSON, membungkus sebagai teks mentah.");
        data = { raw_text: rawText };
      }
      console.log("n8n data:", data);
      
      // Jika n8n membalas status 200 tapi isinya pesan error 429 (terkadang terjadi di n8n)
      if (data.message && (String(data.message).includes("429") || String(data.message).includes("exhausted"))) {
        throw new Error("Token Exhausted 429");
      }
      
      sessionStorage.setItem("luang_result", JSON.stringify(data));
      
      // Simpan ke riwayat pencarian (localStorage)
      try {
        const historyStr = localStorage.getItem("luang_history");
        const history = historyStr ? JSON.parse(historyStr) : [];
        const newHistoryItem = {
          id: Date.now(),
          destination,
          reason,
          dateSaved: new Date().toISOString(),
          data: data,
          days: days
        };
        // Simpan max 10 riwayat
        localStorage.setItem("luang_history", JSON.stringify([newHistoryItem, ...history].slice(0, 10)));
      } catch (e) {
        console.warn("Gagal menyimpan riwayat", e);
      }

      console.log("Pindah ke /result...");
      
      // Kurangi sisa cuti jika login (sebagai indikator form berhasil terkirim/disimpan)
      if (isLoggedIn && userProfile) {
        updateSisaCuti(Math.max(0, userProfile.sisaCuti - days));
      }

      // Fallback navigation in case Next.js router hangs
      window.location.href = '/result';
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setLoading(false);
      
      const errMsg = err.message || "";
      if (errMsg.includes("429") || errMsg.includes("exhausted") || errMsg.includes("Too Many Requests")) {
        // Simpan sebagai Pending (Kena Limit) untuk di-retry 1 jam kemudian
        try {
          const historyStr = localStorage.getItem("luang_history");
          const history = historyStr ? JSON.parse(historyStr) : [];
          const newPendingItem = {
            id: Date.now(),
            destination,
            reason,
            dateSaved: new Date().toISOString(),
            status: 'Pending_limit',
            retryAt: Date.now() + (60 * 60 * 1000), // 1 jam dari sekarang
            payload: {
              email: "User@test.com",
              destination,
              reason,
              days,
              transport,
              origin_location: "Tidak diketahui (Disimpan dari cache error)",
              sisaCuti: userProfile?.sisaCuti || 0,
              jatahCuti: userProfile?.jatahCuti || 0
            }
          };
          localStorage.setItem("luang_history", JSON.stringify([newPendingItem, ...history].slice(0, 10)));
        } catch (e) {
          console.warn("Gagal menyimpan pending history", e);
        }

        alert(isEn ? "AI limit reached. Don't worry, it's saved in Dashboard and will retry in 1 hour!" : "Limit AI habis! Jangan khawatir, request disimpan di Dashboard dan akan otomatis diulang 1 jam lagi.");
        
        // Tetap kurangi sisa cuti karena request pending masuk antrean
        if (isLoggedIn && userProfile) {
          updateSisaCuti(Math.max(0, userProfile.sisaCuti - days));
        }

        router.push("/dashboard");
      } else {
        alert("Gagal konek ke n8n! Pastikan n8n sudah Active. Error: " + errMsg);
      }
    }
  };

  const reasonOptions = isEn ? ["Vacation", "Hometown visit", "Family event"] : ["Liburan", "Mudik", "Acara keluarga"];
  const transportOptions = isEn ? ["Personal vehicle", "Public transport"] : ["Kendaraan pribadi", "Transportasi umum"];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 my-auto animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150 duration-1000"></div>
          <div className="absolute inset-[-1rem] bg-primary/10 rounded-full animate-pulse duration-700"></div>
          <div className="relative z-10 p-2">
            <Image 
              src="/logo-nobg.png" 
              alt="Luang Logo" 
              width={80} 
              height={80} 
              className="object-contain animate-bounce"
            />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-bold text-primary ">{isEn ? 'Crafting schedule...' : 'Meracik jadwal...'}</p>
          <p className="text-sm text-muted animate-pulse">{isEn ? 'Syncing national holidays & traffic data' : 'Menyinkronkan kalender cuti & data macet'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{isEn ? 'Find your perfect time.' : 'Cari waktu terbaikmu.'}</h2>
        <p className="text-muted mt-2 ">{isEn ? 'Let AI handle the headache of scheduling.' : 'Biar AI yang pusing cari jadwal yang pas.'}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-md3 space-y-6">
        
        {/* Stepper */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground/90">{isEn ? 'How many leave days to use?' : 'Berapa hari cuti yang dipakai?'}</label>
          <div className="flex items-center space-x-4 bg-surface-container-low rounded-full p-1.5 w-fit border border-outline/30">
            <button type="button" onClick={() => setDays(Math.max(1, days - 1))} className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm text-primary active:scale-95 transition-transform ease-md3 hover:bg-primary/5">-</button>
            <span className="font-bold w-6 text-center text-lg">{days}</span>
            <button type="button" onClick={() => setDays(days + 1)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm text-primary active:scale-95 transition-transform ease-md3 hover:bg-primary/5">+</button>
          </div>
        </div>

        {/* Pills Reason */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground/90">{isEn ? 'Purpose?' : 'Keperluan apa?'}</label>
          <div className="flex flex-wrap gap-2">
            {reasonOptions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-md3 active:scale-95 border ${
                  reason === r 
                    ? 'bg-primary text-on-primary border-primary shadow-sm' 
                    : 'Bg-surface-container-low text-foreground border-outline/50 hover:bg-primary/5'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Activity Input (only if Vacation/Liburan) */}
        {(reason === "Vacation" || reason === "Liburan") && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-medium text-foreground/90">{isEn ? 'Specific activity? (Optional)' : 'Mau aktivitas apa? (Opsional)'}</label>
            <input 
              type="text" 
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder={isEn ? "E.g., camping, culinary, museum" : "Contoh: camping, kuliner, ke pantai"}
              className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-4 text-sm focus:outline-none focus:border-primary transition-colors duration-200 placeholder-muted/60"
            />
          </div>
        )}

        {/* MD3 Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground/90">{isEn ? 'Destination' : 'Tujuan'}</label>
          <input 
            type="text" 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={isEn ? "E.g., Bali, Tokyo" : "Contoh: Bandung, Bali"}
            className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-4 text-sm focus:outline-none focus:border-primary transition-colors duration-200 placeholder-muted/60"
          />
        </div>

        {/* Date Range Input */}
        <div className="space-y-4 animate-in fade-in duration-300 bg-surface-container-low p-5 rounded-2xl border border-outline/30">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/90">{isEn ? 'When do you plan to go?' : 'Pilih rentang tanggal (Blok waktu)'}</label>
            <div className="w-full bg-white rounded-xl border border-outline/20 p-2 text-sm focus-within:border-primary transition-colors duration-200 text-foreground shadow-sm">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                minDate={new Date()}
                placeholderText={isEn ? "Select start and end dates" : "Pilih tanggal mulai s.d. selesai"}
                className="w-full focus:outline-none p-1 text-sm bg-transparent cursor-pointer"
                wrapperClassName="w-full"
                dateFormat="dd MMM yyyy"
              />
            </div>
          </div>
          <div className="text-xs text-foreground/60 leading-relaxed pt-1">
            {isEn ? 'Select a range of dates. AI will find the best leave strategy within this block.' : 'Sorot (blok) beberapa hari sekaligus di kalender. AI akan mencari jadwal cuti terbaik dalam rentang waktu tersebut.'}
          </div>
        </div>

        {/* Pills Transport */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground/90">{isEn ? 'Transportation' : 'Transportasi'}</label>
          <div className="flex flex-wrap gap-2">
            {transportOptions.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTransport(t)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-md3 active:scale-95 border ${
                  transport === t 
                    ? 'bg-secondary-container text-on-secondary-container border-transparent' 
                    : 'Bg-surface-container-low text-foreground border-outline/50 hover:bg-secondary-container/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Auth Fields */}
        {isLoggedIn && userProfile && (
          <div className="pt-6 border-t border-outline/20">
            <p className="block text-sm font-medium text-foreground/90 mb-3">{isEn ? 'Your leave status' : 'Status cutimu'}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low border border-outline/30 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs font-bold text-foreground/60 ">{isEn ? 'Remaining' : 'Sisa cuti'}</span>
                <span className="text-sm font-black text-primary">{userProfile.sisaCuti} {isEn ? 'Days' : 'Hari'}</span>
              </div>
              <div className="bg-surface-container-low border border-outline/30 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs font-bold text-foreground/60 ">{isEn ? 'Quota' : 'Jatah tahunan'}</span>
                <span className="text-sm font-black text-foreground/80">{userProfile.jatahCuti} {isEn ? 'Days' : 'Hari'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <input 
                type="checkbox" 
                id="useLocation" 
                checked={useLocation}
                onChange={(e) => setUseLocation(e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-2 border-border/50 rounded focus:ring-primary/20 accent-primary"
              />
              <label htmlFor="useLocation" className="text-xs font-medium text-foreground/80 cursor-pointer">
                {isEn ? 'Use my current location to get accurate route analysis' : 'Gunakan lokasi saat ini untuk rute yang lebih akurat'}
              </label>
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center mt-4">
            <p className="text-xs font-medium text-primary ">
              {isEn 
                ? 'Want personalized route analysis based on your location and automatic leave tracking? ' 
                : 'Ingin analisis rute akurat dari lokasimu dan pengaturan sisa cuti otomatis? '}
              <a href="#" onClick={(e) => { e.preventDefault(); router.push("/login"); }} className="font-bold underline hover:text-primary/80 transition-colors">
                {isEn ? 'Login now!' : 'Login sekarang!'}
              </a>
            </p>
          </div>
        )}

        {/* Primary CTA */}
        <button type="submit" className="w-full mt-2 bg-primary text-on-primary rounded-full py-4 font-bold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-300 ease-md3">
          {isEn ? 'Find available time' : 'Temukan waktu luang'}
        </button>
      </form>
    </div>
  );
}
