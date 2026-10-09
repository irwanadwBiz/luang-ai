"use client";

import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { isLoggedIn, lang, userProfile, updateSisaCuti } = useAuth();
  const isEn = lang === 'en';
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      const loadHistory = () => {
        const historyStr = localStorage.getItem("luang_history");
        if (historyStr) {
          setHistory(JSON.parse(historyStr));
        }
      };
      
      loadHistory();
      
      // Listen to worker updates
      window.addEventListener('storage', loadHistory);
      return () => window.removeEventListener('storage', loadHistory);
    }
  }, [isLoggedIn, router]);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah klik menembus ke card (agar tidak redirect ke result)
    
    const confirmMsg = isEn 
      ? 'Are you sure you want to delete this history permanently?' 
      : 'Yakin mau hapus riwayat ini secara permanen?';
      
    if (window.confirm(confirmMsg)) {
      const itemToDelete = history.find(item => item.id === id);
      if (itemToDelete) {
        const refundDays = itemToDelete.days || itemToDelete.payload?.days || 0;
        if (refundDays > 0 && userProfile) {
          const newSisaCuti = Math.min(userProfile.sisaCuti + refundDays, userProfile.jatahCuti || 12);
          updateSisaCuti(newSisaCuti);
        }
      }

      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);
      localStorage.setItem("luang_history", JSON.stringify(newHistory));
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="flex-1 flex flex-col py-4 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2 ">{isEn ? 'Your search history' : 'Riwayat pencarianmu'}</h2>
        <p className="text-sm text-muted ">
          {history.length > 0 
            ? (isEn ? `you saved ${history.length * 2} leave days this year` : `kamu telah menghemat ${history.length * 2} hari cuti tahun ini`) 
            : (isEn ? 'No history yet' : 'Belum ada riwayat pencarian')}
        </p>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="bg-surface-container-low rounded-3xl p-8 text-center border border-outline/10">
            <p className="text-muted ">{isEn ? 'You havent searched for any free time yet.' : 'Kamu belum pernah mencari waktu luang.'}</p>
          </div>
        ) : (
          history.map((item: any) => {
            const isPending = item.status === 'pending_limit';
            // Coba ambil rekomendasi pertama dari data
            const firstRek = item.data?.rekomendasi?.[0];
            const deskripsi = isPending 
              ? (isEn ? 'AI is resting. Will retry automatically.' : 'AI sedang istirahat. Akan dicoba lagi otomatis.') 
              : (firstRek?.deskripsi_singkat || (isEn ? 'No strategy recommended' : 'Tidak ada rekomendasi'));
            const tanggal = isPending 
              ? (isEn ? 'Waiting Queue' : 'Menunggu Antrean') 
              : (firstRek?.tanggal_cuti || (isEn ? 'No dates' : 'Belum ada jadwal'));
            
            return (
              <div 
                key={item.id} 
                onClick={() => {
                  if (!isPending) {
                    sessionStorage.setItem("luang_result", JSON.stringify(item.data));
                    router.push("/result");
                  }
                }}
                className={`bg-surface-container rounded-3xl p-5 shadow-sm border border-outline/10 space-y-3 transition-all ${isPending ? 'opacity-80' : 'Cursor-pointer hover:shadow-md active:scale-95'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold ">{item.reason} {isEn ? 'To' : 'Ke'} {item.destination}</p>
                    <p className="text-xs text-muted ">{tanggal}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <div className="relative group flex items-center">
                        <span className="text-xs font-bold bg-[#fef08a] text-[#854d0e] px-3 py-1 rounded-full flex items-center gap-1 cursor-help">
                          {isEn ? 'Pending' : 'Tertunda'}
                          <span className="bg-[#854d0e] text-[#fef08a] rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none">i</span>
                        </span>
                        {/* Tooltip */}
                        <div className="absolute right-0 top-8 w-48 bg-foreground text-background text-xs p-3 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                          {isEn ? 'Token exhausted. Relax, this request is queued and will run automatically in 1 hour!' : 'Sistem kena limit API. Tenang, request ini masuk antrean dan akan dieksekusi otomatis 1 jam lagi!'}
                          <div className="absolute -top-1 right-5 w-2 h-2 bg-foreground rotate-45"></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full ">{isEn ? 'Saved' : 'Tersimpan'}</span>
                    )}
                    
                    {/* Delete Button */}
                    <button 
                      onClick={(e) => handleDelete(item.id, e)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-outline/10 text-muted hover:bg-tertiary/10 hover:text-tertiary transition-colors"
                      title={isEn ? "Delete history" : "Hapus riwayat"}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className={`text-sm ${isPending ? 'text-[#854d0e] font-medium' : 'Text-foreground/80'}`}>{deskripsi}</p>
              </div>
            );
          })
        )}
      </div>

      <Link href="/search" className="block text-center w-full bg-primary text-on-primary rounded-full py-4 font-bold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-300 ease-md3 mt-auto">
        {isEn ? 'Find new free time' : 'Cari waktu luang baru'}
      </Link>
    </div>
  );
}
