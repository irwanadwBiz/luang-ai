"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";

function ResultContent() {
  const router = useRouter();
  const { lang } = useAuth();
  const isEn = lang === 'en';
  
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("luang_result");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const item = Array.isArray(parsed) ? parsed[0] : parsed;
        const raw = item.output || item;
        const isDataEmpty = !raw.rekomendasi && !raw.strategies && !raw.itinerary && !raw.raw_text;
        
        if (isDataEmpty) {
          setData({ error: true, raw });
          return;
        }

        if (raw.raw_text) {
          setData({
            rekomendasi: [{
              tipe: 'Teks Mentah (Bukan JSON)',
              tanggal_cuti: 'Data Mentah',
              deskripsi_singkat: 'AI membalas dengan teks biasa (Markdown):',
              prediksi_berangkat: '-',
              prediksi_pulang: '-',
              kelebihan: [],
              kekurangan: [],
              analisis_luang: raw.raw_text,
              saran_perjalanan: [],
              itinerary_harian: []
            }]
          });
        } else if (raw.rekomendasi) {
          // Normalisasi schema baru yang berupa string menjadi array untuk kebutuhan UI
          const normalized = {
            rekomendasi: raw.rekomendasi.map((r: any) => {
              const safeArray = (val: any) => {
                if (Array.isArray(val)) return val;
                if (typeof val === 'string') {
                  try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) return parsed;
                  } catch (e) {
                    return [val]; // Jika bukan JSON, jadikan 1 elemen array
                  }
                }
                return [val || ''];
              };

              return {
                tipe: r.tipe || 'Utama',
                tanggal_cuti: r.tanggal_cuti || '-',
                deskripsi_singkat: r.deskripsi_singkat || '-',
                prediksi_berangkat: r.prediksi_berangkat || '-',
                prediksi_pulang: r.prediksi_pulang || '-',
                kelebihan: safeArray(r.kelebihan),
                kekurangan: safeArray(r.kekurangan),
                info_tanggal_merah: r.info_tanggal_merah || '',
                analisis_luang: r.analisis_luang || '-',
                saran_perjalanan: safeArray(r.saran_perjalanan),
                itinerary_harian: r.itinerary_harian || [
                  { hari: isEn ? 'Departure Time Advice' : 'Saran Waktu Berangkat', kegiatan: r.waktu_berangkat_terbaik || '-' },
                  { hari: isEn ? 'Return Time Advice' : 'Saran Waktu Pulang', kegiatan: r.waktu_pulang_terbaik || '-' }
                ]
              };
            })
          };
          setData(normalized);
        } else {
          setData({ error: true, raw });
        }
      } catch (e) {
        router.push('/search');
      }
    } else {
      router.push('/search');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpand = (tipe: string) => {
    setExpandedOption(expandedOption === tipe ? null : tipe);
  };

  if (data?.error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 my-auto animate-in fade-in text-center p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-3xl mb-2">⚠️</div>
        <h2 className="text-xl font-bold text-foreground lowercase">{isEn ? 'data failed to load' : 'data gagal dimuat'}</h2>
        <p className="text-sm text-foreground/70 lowercase max-w-sm">{isEn ? 'there was an error parsing the ai response. please try adjusting your parameters.' : 'ada kesalahan saat membaca respons ai. coba sesuaikan ulang parameter pencarianmu.'}</p>
        <button onClick={() => router.push("/search")} className="mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm lowercase hover:bg-primary/90 transition-all">
          {isEn ? 'try again' : 'coba lagi'}
        </button>
      </div>
    );
  }

  if (!data || !data.rekomendasi) {
    return <div className="flex-1 flex items-center justify-center animate-pulse text-primary lowercase">{isEn ? 'processing results...' : 'memproses hasil...'}</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {data.rekomendasi.map((rek: any, idx: number) => {
        const isUtama = rek.tipe === "Utama";
        const isExpanded = expandedOption === rek.tipe;
        
        return (
          <div key={idx} className={`${isUtama ? 'bg-surface-container shadow-md' : 'bg-surface-container-low border border-outline/20 shadow-sm'} rounded-[32px] p-6 hover:shadow-lg transition-all duration-300 ease-md3`}>
            {/* Header */}
            <div className="text-center space-y-2 border-b border-outline/20 pb-6 mb-6">
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold lowercase mb-2 ${isUtama ? 'bg-primary/10 text-primary' : 'bg-outline/20 text-foreground/70'}`}>
                {isUtama ? (isEn ? '✨ top recommendation' : '✨ rekomendasi terbaik') : (isEn ? 'quiet alternative' : 'alternatif sepi')}
              </span>
              <h2 className={`text-3xl font-bold ${isUtama ? 'text-primary' : 'text-foreground'}`}>{rek.tanggal_cuti}</h2>
              <p className="text-sm text-foreground/70 font-medium lowercase">{rek.deskripsi_singkat}</p>
            </div>

            {/* Prediksi Kepadatan */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-bold lowercase text-foreground/80">{isEn ? 'traffic prediction' : 'prediksi lalu lintas'}</h3>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline/30 group-hover:scale-[1.01] transition-transform ease-md3">
                <span className="text-sm font-medium lowercase">{isEn ? 'departure' : 'berangkat'}</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full lowercase ${rek.prediksi_berangkat.includes('lancar') ? 'bg-[#bbf7d0] text-[#166534]' : 'bg-[#fef08a] text-[#854d0e]'}`}>{rek.prediksi_berangkat}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline/30 group-hover:scale-[1.01] transition-transform ease-md3">
                <span className="text-sm font-medium lowercase">{isEn ? 'return' : 'pulang'}</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full lowercase ${rek.prediksi_pulang.includes('sedang') || rek.prediksi_pulang.includes('padat') ? 'bg-[#fef08a] text-[#854d0e]' : 'bg-[#bbf7d0] text-[#166534]'}`}>{rek.prediksi_pulang}</span>
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#f0fdf4] p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-[#166534] lowercase mb-2">{isEn ? 'pros' : 'kelebihan'}</h4>
                <ul className="text-sm space-y-1.5 text-[#166534]/80 lowercase list-disc list-inside">
                  {rek.kelebihan.map((k: string, i: number) => <li key={i}>{k}</li>)}
                </ul>
              </div>
              <div className="bg-[#fef2f2] p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-[#991b1b] lowercase mb-2">{isEn ? 'cons' : 'kekurangan'}</h4>
                <ul className="text-sm space-y-1.5 text-[#991b1b]/80 lowercase list-disc list-inside">
                  {rek.kekurangan.map((k: string, i: number) => <li key={i}>{k}</li>)}
                </ul>
              </div>
            </div>

            {/* Info Tanggal Merah */}
            {rek.info_tanggal_merah && (
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 mb-6">
                <p className="text-xs font-bold text-orange-600 lowercase mb-1 flex items-center gap-1.5">
                  <span>🎯</span> {isEn ? 'holiday context' : 'info tanggal merah'}
                </p>
                <p className="text-sm text-orange-800/80 leading-relaxed lowercase">{rek.info_tanggal_merah}</p>
              </div>
            )}

            {/* Alasan AI */}
            <div className={`p-5 rounded-2xl text-sm relative overflow-hidden mb-6 ${isUtama ? 'bg-secondary-container' : 'border border-outline/10'}`}>
              {isUtama && <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>}
              <p className={`font-bold lowercase mb-1 relative z-10 ${isUtama ? 'text-on-secondary-container' : 'text-foreground'}`}>{isEn ? 'luang analysis' : 'analisis luang'}</p>
              <p className={`leading-relaxed lowercase relative z-10 ${isUtama ? 'text-on-secondary-container/80' : 'text-foreground/80'}`}>
                {rek.analisis_luang}
              </p>
            </div>

            {/* Saran Perjalanan & Itinerary Harian (EXPANDABLE) */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
              
              <div className="p-5 bg-surface-container-low rounded-2xl border border-outline/20 mb-4">
                <p className="text-sm font-bold text-foreground lowercase mb-3 flex items-center gap-2">
                  <span>💡</span> {isEn ? 'travel tips' : 'saran perjalanan & tiket'}
                </p>
                <ul className="text-sm space-y-2 text-foreground/80 list-disc list-inside">
                  {rek.saran_perjalanan.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-surface-container-low rounded-2xl border border-outline/20">
                <p className="text-sm font-bold text-foreground lowercase mb-4 flex items-center gap-2">
                  <span>📅</span> {isEn ? 'daily itinerary' : 'itinerary harian'}
                </p>
                <div className="space-y-4">
                  {rek.itinerary_harian.map((hari: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1.5 h-auto bg-primary/40 rounded-full"></div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{hari.hari}</p>
                        <p className="text-sm text-foreground/70 mt-1">{hari.kegiatan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => toggleExpand(rek.tipe)} 
              className={`w-full py-4 font-bold text-sm lowercase rounded-full transition-all duration-300 ease-md3 active:scale-95 shadow-sm ${
                isExpanded 
                  ? (isUtama ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-surface-container-low border border-primary text-primary')
                  : (isUtama ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-transparent text-primary border border-primary hover:bg-primary/5')
              }`}
            >
              {isExpanded ? (isEn ? 'collapse' : 'tutup detail') : (isEn ? 'view itinerary & select' : 'lihat itinerary & pilih')}
            </button>
            
          </div>
        );
      })}

      {/* Citations/Source */}
      <div className="pt-2 text-xs text-foreground/50 lowercase space-y-1.5 text-center">
        <p className="font-bold text-foreground/60">{isEn ? 'sources:' : 'sumber data:'}</p>
        <p className="flex justify-center gap-2"><span>[1]</span> {isEn ? 'skb 3 ministers - holidays 2027' : 'skb 3 menteri - libur nasional 2027'}</p>
        <p className="flex justify-center gap-2"><span>[2]</span> {isEn ? 'historical traffic data 2022-2026' : 'data historis kemacetan lalu lintas 2022-2026'}</p>
      </div>

      {/* Bottom Action */}
      <button onClick={() => router.push("/search")} className="w-full mt-4 bg-transparent text-primary border border-primary rounded-full py-4 font-bold text-sm lowercase hover:bg-primary/5 active:scale-95 transition-all duration-300 ease-md3">
        {isEn ? 'try other parameters' : 'coba parameter lain'}
      </button>

    </div>
  );
}

export default function Result() {
  const { lang } = useAuth();
  const isEn = lang === 'en';
  return (
    <Suspense fallback={<div className="flex-1 flex flex-col items-center justify-center my-auto"><p className="text-sm font-medium text-primary lowercase animate-pulse">{isEn ? 'loading strategy...' : 'memuat strategi...'}</p></div>}>
      <ResultContent />
    </Suspense>
  );
}
