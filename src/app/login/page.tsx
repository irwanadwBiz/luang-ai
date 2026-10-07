"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const { login, lang } = useAuth();
  const isEn = lang === 'en';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      router.push("/search");
    } else {
      alert(isEn ? 'Invalid email or password! Please register if you do not have an account.' : 'Email atau password salah! Silakan daftar jika belum punya akun.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2 lowercase">{isEn ? 'welcome back' : 'selamat datang kembali'}</h2>
        <p className="text-sm text-muted lowercase">{isEn ? 'login for more personalized results' : 'masuk untuk hasil yang lebih personal'}</p>
      </div>

      <form onSubmit={handleLogin} className="bg-surface-container rounded-3xl p-6 shadow-sm border border-outline/10 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium lowercase">{isEn ? 'email' : 'email'}</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-4 text-sm focus:outline-none focus:border-primary transition-colors duration-200"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium lowercase">{isEn ? 'password' : 'password'}</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline lowercase">{isEn ? 'forgot password?' : 'lupa password?'}</Link>
          </div>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-4 text-sm focus:outline-none focus:border-primary transition-colors duration-200"
          />
        </div>
        
        <button type="submit" className="w-full bg-primary text-on-primary rounded-full py-4 font-bold text-sm lowercase shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-300 ease-md3 mt-4">
          {isEn ? 'login' : 'masuk'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-muted lowercase">
        {isEn ? "don't have an account?" : "belum punya akun?"} <Link href="/register" className="text-primary font-bold hover:underline">{isEn ? 'register here' : 'daftar di sini'}</Link>
      </p>
    </div>
  );
}
