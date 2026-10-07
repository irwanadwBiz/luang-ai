"use client";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "../lib/AuthContext";
import Link from "next/link";
import Image from "next/image";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

function Header() {
  const { isLoggedIn, logout, lang, setLang } = useAuth();
  
  return (
    <header className="p-4 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="flex items-center">
        <Image src="/logo-nobg.png" alt="Luang Logo" width={80} height={30} className="object-contain" priority />
      </Link>
      <div className="text-sm font-medium flex items-center gap-4">
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline/20">
          <button onClick={() => setLang('id')} className={`font-bold transition-colors ${lang === 'id' ? 'text-primary' : 'text-muted hover:text-primary'}`}>id</button>
          <span className="text-outline/50">|</span>
          <button onClick={() => setLang('en')} className={`font-bold transition-colors ${lang === 'en' ? 'text-primary' : 'text-muted hover:text-primary'}`}>en</button>
        </div>
        
        {isLoggedIn && (
          <div className="flex gap-3 lowercase items-center">
            <Link href="/dashboard" className="text-primary hover:text-primary/80 transition-colors">dashboard</Link>
            <button onClick={logout} className="text-muted hover:text-foreground transition-colors">{lang === 'en' ? 'logout' : 'keluar'}</button>
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
