"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type UserProfile = {
  name: string;
  sisaCuti: number;
  jatahCuti: number;
};

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, pass: string) => boolean;
  register: (email: string, pass: string, name: string) => boolean;
  logout: () => void;
  lang: 'id' | 'en';
  setLang: (lang: 'id' | 'en') => void;
  userProfile: UserProfile | null;
  updateSisaCuti: (amount: number) => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => false,
  register: () => false,
  logout: () => {},
  lang: 'id',
  setLang: () => {},
  userProfile: null,
  updateSisaCuti: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [sisaCuti, setSisaCuti] = useState<number>(10);
  const [userName, setUserName] = useState<string>("Tamu");

  useEffect(() => {
    // Check local storage on mount
    const saved = localStorage.getItem('isLoggedIn');
    if (saved === 'true') {
      setIsLoggedIn(true);
      const email = localStorage.getItem('luang_logged_email');
      if (email) {
        const users = JSON.parse(localStorage.getItem('luang_users') || '[]');
        const user = users.find((u: any) => u.email === email);
        if (user) setUserName(user.name);
      }
    }
    const savedLang = localStorage.getItem('lang') as 'id' | 'en';
    if (savedLang) {
      // eslint-disable-next-line
      setLang(savedLang);
    }
    const savedCuti = localStorage.getItem('luang_sisa_cuti');
    if (savedCuti) {
      setSisaCuti(parseInt(savedCuti, 10));
    }
  }, []);

  // Background Worker: Cek task pending tiap 1 menit
  useEffect(() => {
    const checkPendingTasks = async () => {
      try {
        const historyStr = localStorage.getItem('luang_history');
        if (!historyStr) return;
        
        let history = JSON.parse(historyStr);
        let hasChanges = false;
        
        for (let i = 0; i < history.length; i++) {
          const item = history[i];
          if (item.status === 'pending_limit' && Date.now() >= item.retryAt) {
            console.log("Worker: Mencoba ulang task", item.id);
            try {
              const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/luang-request";
              const res = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key": "luang-secret-2027" },
                body: JSON.stringify(item.payload)
              });
              
              if (res.ok) {
                const rawText = await res.text();
                let data;
                try { data = JSON.parse(rawText); } catch(e) { data = { raw_text: rawText }; }
                
                if (data.message && (String(data.message).includes("429") || String(data.message).includes("exhausted"))) {
                  // Masih limit, tunda 1 jam lagi
                  history[i].retryAt = Date.now() + (60 * 60 * 1000);
                  hasChanges = true;
                } else {
                  // Berhasil!
                  history[i].status = 'completed';
                  history[i].data = data;
                  hasChanges = true;
                  // Optionally you could trigger a toast notification here
                }
              }
            } catch (err) {
              console.warn("Worker fetch error", err);
              // Coba lagi 1 jam kemudian
              history[i].retryAt = Date.now() + (60 * 60 * 1000);
              hasChanges = true;
            }
          }
        }
        
        if (hasChanges) {
          localStorage.setItem('luang_history', JSON.stringify(history));
          // Trigger custom event agar dashboard bisa re-render
          window.dispatchEvent(new Event('storage'));
        }
      } catch(e) {
        // ignore
      }
    };

    const interval = setInterval(checkPendingTasks, 60000); // Tiap 1 menit
    // Jalankan sekali saat mount
    setTimeout(checkPendingTasks, 5000);

    return () => clearInterval(interval);
  }, []);

  const login = (email: string, pass: string) => {
    const users = JSON.parse(localStorage.getItem('luang_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === pass);
    
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.name);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('luang_logged_email', email);
      return true;
    }
    return false;
  };

  const register = (email: string, pass: string, name: string) => {
    const users = JSON.parse(localStorage.getItem('luang_users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      return false; // Email sudah dipakai
    }
    
    users.push({ email, password: pass, name });
    localStorage.setItem('luang_users', JSON.stringify(users));
    
    // Auto login
    setIsLoggedIn(true);
    setUserName(name);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('luang_logged_email', email);
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('luang_logged_email');
  };

  const handleSetLang = (newLang: 'id' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const updateSisaCuti = (amount: number) => {
    setSisaCuti(amount);
    localStorage.setItem('luang_sisa_cuti', amount.toString());
  };

  const userProfile: UserProfile | null = isLoggedIn ? {
    name: userName,
    sisaCuti: sisaCuti,
    jatahCuti: 12
  } : null;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, register, logout, lang, setLang: handleSetLang, userProfile, updateSisaCuti }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
