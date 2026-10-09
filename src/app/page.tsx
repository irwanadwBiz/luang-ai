"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../lib/AuthContext";

export default function LandingPage() {
  const { isLoggedIn, lang } = useAuth();
  const isEn = lang === 'en';

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-12 pt-6">
      
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <Image src="/logo-nobg.png" alt="Luang Logo" width={180} height={60} className="object-contain" priority />
        </div>
        <p className="text-xl font-medium text-foreground/80 ">{isEn ? 'Your AI holiday planner.' : 'AI perencana liburanmu.'}</p>
        <p className="text-sm text-foreground/60 max-w-[280px] mx-auto leading-relaxed ">
          {isEn ? 'Stop stressing over dates. Let us analyze national holidays and traffic patterns for you.' : 'Jangan pusing mikirin tanggal cuti. Biarkan kami menganalisis kalender libur nasional dan prediksi kemacetan untukmu.'}
        </p>
      </div>

      {/* Feature Cards / Benefits */}
      <div className="space-y-4">
        <div className="bg-surface-container rounded-[24px] p-6 shadow-sm border border-outline/10 hover:shadow-md transition-shadow ease-md3">
          <div className="w-12 h-12 bg-[#e0e7ff] rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🕵️‍♂️</span>
          </div>
          <h3 className="font-bold text-foreground mb-2">{isEn ? 'Incognito mode (guest)' : 'Mode penyamaran (guest)'}</h3>
          <p className="text-sm text-foreground/70 leading-relaxed">{isEn ? 'Test the waters without logging in. Perfect if you just want to peek at upcoming holidays.' : 'Coba-coba cari tanggal bagus tanpa perlu login. Cocok buat yang cuma mau kepo jadwal libur.'}</p>
        </div>

        <div className="bg-secondary-container rounded-[24px] p-6 shadow-sm border border-outline/10 relative overflow-hidden group hover:shadow-md transition-shadow ease-md3">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 relative z-10">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="font-bold text-on-secondary-container mb-2 relative z-10">{isEn ? 'Login for max results' : 'Login untuk hasil maksimal'}</h3>
          <ul className="text-sm text-on-secondary-container/80 list-disc list-inside space-y-1.5 relative z-10">
            <li>{isEn ? 'Sync with your leave balance' : 'Sinkron dengan sisa cutimu'}</li>
            <li>{isEn ? 'Save search history' : 'Simpan riwayat pencarian'}</li>
            <li>{isEn ? 'Highly personalized recommendations' : 'Rekomendasi lebih personal'}</li>
          </ul>
        </div>
      </div>

      {/* Action Area */}
      <div className="pt-6 space-y-4 border-t border-outline/20">
        {isLoggedIn ? (
          <Link href="/search" className="block w-full text-center bg-primary text-on-primary rounded-full py-4 font-bold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-300 ease-md3">
            {isEn ? 'Continue searching' : 'Lanjut cari waktu luang'}
          </Link>
        ) : (
          <>
            <Link href="/search" className="block w-full text-center bg-surface-container-low text-foreground border border-outline/30 rounded-full py-4 font-bold text-sm shadow-sm hover:bg-surface-container active:scale-95 transition-all duration-300 ease-md3">
              {isEn ? 'Try as guest' : 'Coba sebagai guest'}
            </Link>
            
            <Link href="/register" className="block w-full text-center bg-primary text-on-primary rounded-full py-4 font-bold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-300 ease-md3">
              {isEn ? 'Register now' : 'Daftar sekarang'}
            </Link>

            <p className="text-center text-sm text-foreground/60 pt-4">
              {isEn ? 'Already have an account?' : 'Sudah punya akun?'} <Link href="/login" className="text-primary font-bold hover:underline">{isEn ? 'Login here' : 'Masuk di sini'}</Link>
            </p>
          </>
        )}
      </div>

    </div>
  );
}
