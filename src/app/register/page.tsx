"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function Register() {
  const router = useRouter();
  const { register, lang } = useAuth();
  const isEn = lang === 'en';
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [minat, setMinat] = useState<string[]>([]);
  const minatOptions = isEn 
    ? ["Music", "Culinary", "Arts & culture", "Outdoors", "Family", "Sports"]
    : ["Musik", "Kuliner", "Seni & budaya", "Alam/outdoor", "Keluarga & anak", "Olahraga"];
    
  const toggleMinat = (m: string) => {
    setMinat(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert(isEn ? 'Password must be at least 6 characters!' : 'Password minimal 6 karakter!');
      return;
    }
    const success = register(email, password, name, minat);
    if (success) {
      router.push("/search");
    } else {
      alert(isEn ? 'Email already registered! Please use a different email or login.' : 'Email sudah terdaftar! Silakan gunakan email lain atau login.');
    }
  };

  return (
    <div className="flex-1 flex flex-col py-4 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2 ">{isEn ? 'Join luang' : 'Daftar luang'}</h2>
        <p className="text-sm text-muted ">{isEn ? 'Optimize your leave days today' : 'Optimalkan cutimu sekarang juga'}</p>
      </div>

      <form onSubmit={handleRegister} className="bg-surface-container rounded-3xl p-6 shadow-sm border border-outline/10 space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium ">{isEn ? 'Full name' : 'Nama lengkap'}</label>
          <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium ">{isEn ? 'Email' : 'Email'}</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium ">{isEn ? 'Password' : 'Password'}</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium ">{isEn ? 'Phone number' : 'Nomor telepon'}</label>
          <input required type="tel" className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium ">{isEn ? 'Occupation' : 'Pekerjaan'}</label>
          <select required className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200 bg-transparent appearance-none">
            <option value="" disabled selected>{isEn ? 'Select occupation...' : 'Pilih pekerjaan...'}</option>
            <option value="swasta">{isEn ? 'Private sector' : 'Swasta'}</option>
            <option value="pns">{isEn ? 'Civil servant (pns)' : 'Pns'}</option>
          </select>
        </div>
        
        {/* Minat Opsional */}
        <div className="space-y-3 pt-2">
          <label className="block text-sm font-medium ">{isEn ? 'Interests (optional)' : 'Minat (opsional)'}</label>
          <div className="flex flex-wrap gap-2">
            {minatOptions.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMinat(m)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ease-md3 active:scale-95 border ${
                  minat.includes(m)
                    ? 'bg-primary text-on-primary border-primary shadow-sm' 
                    : 'Bg-surface-container-low text-foreground border-outline/50 hover:bg-primary/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        
        <button type="submit" className="w-full bg-primary text-on-primary rounded-full py-4 font-bold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-300 ease-md3 mt-6">
          {isEn ? 'Register' : 'Daftar'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-muted ">
        {isEn ? 'Already have an account?' : 'Sudah punya akun?'} <Link href="/login" className="text-primary font-bold hover:underline">{isEn ? 'Login' : 'Masuk'}</Link>
      </p>
    </div>
  );
}
