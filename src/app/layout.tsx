"use client";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "../lib/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

function Header() {
  const { isLoggedIn, logout, lang, setLang } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="p-4 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="flex items-center">
        <Image src="/logo-nobg.png" alt="Luang Logo" width={80} height={30} className="object-contain" priority />
      </Link>
      <div className="text-sm font-medium flex items-center gap-4 relative">
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline/20">
          <button onClick={() => setLang('id')} className={`font-bold transition-colors ${lang === 'id' ? 'text-primary' : 'text-muted hover:text-primary'}`}>ID</button>
          <span className="text-outline/50">|</span>
          <button onClick={() => setLang('en')} className={`font-bold transition-colors ${lang === 'en' ? 'text-primary' : 'text-muted hover:text-primary'}`}>EN</button>
        </div>
        
        {isLoggedIn && (
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center justify-center"
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-background border border-outline/20 rounded-xl shadow-lg py-2 z-50 flex flex-col font-medium ">
                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-surface-container-low transition-colors text-left text-primary">{lang === 'en' ? 'Profile' : 'Profil'}</Link>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-surface-container-low transition-colors text-left text-primary">Dashboard</Link>
                <div className="h-px bg-outline/20 my-1"></div>
                <button onClick={() => { setIsMenuOpen(false); logout(); }} className="px-4 py-2 hover:bg-surface-container-low transition-colors text-left text-muted">{lang === 'en' ? 'Logout' : 'Keluar'}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

// Atmospheric Organic Blur Shapes
function AtmosphericBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Primary Blur Shape */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl mix-blend-multiply" />
      {/* Secondary Blur Shape */}
      <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-secondary-container/60 rounded-full blur-3xl mix-blend-multiply" />
      {/* Tertiary Blur Shape */}
      <div className="absolute -bottom-40 left-1/4 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl mix-blend-multiply" />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Luang" />
      </head>
      <body className={`${roboto.className} bg-background text-foreground antialiased min-h-screen relative`}>
        <AtmosphericBackground />
        <AuthProvider>
          <div className="max-w-md mx-auto min-h-screen flex flex-col relative z-10 bg-background/40 shadow-2xl shadow-primary/5">
            <Header />
            <main className="p-6 flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
