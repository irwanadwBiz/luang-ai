"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type UserProfile = {
  name: string;
  sisaCuti: number;
  jatahCuti: number;
};

type AuthContextType = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  lang: 'id' | 'en';
  setLang: (lang: 'id' | 'en') => void;
  userProfile: UserProfile | null;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  lang: 'id',
  setLang: () => {},
  userProfile: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');

  useEffect(() => {
    // Check local storage on mount
    const saved = localStorage.getItem('isLoggedIn');
    if (saved === 'true') {
      // eslint-disable-next-line
      setIsLoggedIn(true);
    }
    const savedLang = localStorage.getItem('lang') as 'id' | 'en';
    if (savedLang) {
      // eslint-disable-next-line
      setLang(savedLang);
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

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  const handleSetLang = (newLang: 'id' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const userProfile: UserProfile | null = isLoggedIn ? {
    name: "Teduh",
    sisaCuti: 5,
    jatahCuti: 12
  } : null;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, lang, setLang: handleSetLang, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
