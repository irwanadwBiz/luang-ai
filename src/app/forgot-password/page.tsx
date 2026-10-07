"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import Link from "next/link";

export default function ForgotPassword() {
  const router = useRouter();
  const { lang, login } = useAuth();
  const isEn = lang === 'en';
  
  const [step, setStep] = useState<"email" | "otp" | "new_password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('luang_users') || '[]');
    if (!users.find((u: any) => u.email === email)) {
      alert(isEn ? 'Email not found!' : 'Email tidak ditemukan!');
      return;
    }
    setStep("otp");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("new_password");
  };

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert(isEn ? 'Password must be at least 6 characters!' : 'Password minimal 6 karakter!');
      return;
    }
    const users = JSON.parse(localStorage.getItem('luang_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem('luang_users', JSON.stringify(users));
    }
    alert(isEn ? 'Password updated! Please login.' : 'Password berhasil diubah! Silakan login.');
    router.push("/login");
  };

  return (
    <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2 lowercase">{isEn ? 'forgot password' : 'lupa password'}</h2>
        <p className="text-sm text-muted lowercase">
          {step === "email" && (isEn ? "enter your email to receive an otp" : "masukkan emailmu untuk menerima kode otp")}
          {step === "otp" && (isEn ? "enter the 4-digit otp we sent" : "masukkan 4 digit otp yang kami kirimkan")}
          {step === "new_password" && (isEn ? "enter your new password" : "masukkan password barumu")}
        </p>
      </div>

      <div className="bg-surface-container rounded-3xl p-6 shadow-sm border border-outline/10">
        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium lowercase">{isEn ? 'email address' : 'alamat email'}</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-4 text-sm focus:outline-none focus:border-primary transition-colors duration-200"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary rounded-full py-4 font-bold text-sm lowercase shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-300 ease-md3">
              {isEn ? 'send otp' : 'kirim otp'}
            </button>
          </form>
        ) : step === "otp" ? (
          <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <label className="block text-sm font-medium lowercase">{isEn ? 'otp code' : 'kode otp'}</label>
              <input 
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                required
                placeholder="0000"
                className="w-full text-center tracking-[1em] font-bold bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-4 text-xl focus:outline-none focus:border-primary transition-colors duration-200"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary rounded-full py-4 font-bold text-sm lowercase shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-300 ease-md3">
              {isEn ? 'verify' : 'verifikasi'}
            </button>
            <button type="button" onClick={() => setStep("email")} className="w-full mt-2 text-primary font-medium text-xs hover:underline lowercase">
              {isEn ? 'resend code' : 'kirim ulang kode'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNewPasswordSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <label className="block text-sm font-medium lowercase">{isEn ? 'new password' : 'password baru'}</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-4 text-sm focus:outline-none focus:border-primary transition-colors duration-200"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary rounded-full py-4 font-bold text-sm lowercase shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-300 ease-md3">
              {isEn ? 'save password' : 'simpan password'}
            </button>
          </form>
        )}
      </div>
      
      <p className="mt-8 text-center text-sm text-muted lowercase">
        <Link href="/login" className="text-primary font-bold hover:underline">{isEn ? 'back to login' : 'kembali ke halaman masuk'}</Link>
      </p>
    </div>
  );
}
