"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, userProfile, updateProfile, lang } = useAuth();
  const isEn = lang === 'en';

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [minat, setMinat] = useState<string[]>([]);

  const minatOptions = isEn 
    ? ["music", "culinary", "arts & culture", "outdoors", "family", "sports"]
    : ["musik", "kuliner", "seni & budaya", "alam/outdoor", "keluarga & anak", "olahraga"];

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else if (userProfile) {
      setName(userProfile.name || "");
      setBio(userProfile.bio || "");
      setMinat(userProfile.minat || []);
    }
  }, [isLoggedIn, userProfile, router]);

  if (!isLoggedIn || !userProfile) return null;

  const toggleMinat = (m: string) => {
    setMinat(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, bio, minat });
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-500 pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2 lowercase">{isEn ? 'your profile' : 'profil kamu'}</h2>
        <p className="text-sm text-muted lowercase">{isEn ? 'manage your personal information' : 'kelola informasi personalmu'}</p>
      </div>

      <div className="bg-surface-container rounded-[32px] p-6 shadow-sm border border-outline/10 space-y-6">
        
        {/* Avatar Header */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-md bg-surface-container-low">
            <Image 
              src={userProfile.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile.name}`} 
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
          {!isEditing && (
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">{userProfile.name}</h3>
              <p className="text-sm text-muted">{userProfile.email}</p>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <label className="block text-sm font-medium lowercase">{isEn ? 'full name' : 'nama lengkap'}</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium lowercase">{isEn ? 'bio' : 'bio'}</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                placeholder={isEn ? "tell us about yourself..." : "ceritakan tentang dirimu..."}
                className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200 min-h-[100px]" 
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium lowercase">{isEn ? 'interests' : 'minat'}</label>
              <div className="flex flex-wrap gap-2">
                {minatOptions.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMinat(m)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ease-md3 active:scale-95 lowercase border ${
                      minat.includes(m)
                        ? 'bg-primary text-on-primary border-primary shadow-sm' 
                        : 'bg-surface-container-low text-foreground border-outline/50 hover:bg-primary/5'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-surface-container-low text-foreground rounded-full py-3 font-bold text-sm lowercase border border-outline/30 hover:bg-outline/10 active:scale-95 transition-all">
                {isEn ? 'cancel' : 'batal'}
              </button>
              <button type="submit" className="flex-1 bg-primary text-on-primary rounded-full py-3 font-bold text-sm lowercase shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all">
                {isEn ? 'save' : 'simpan'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            {/* Bio Section */}
            {userProfile.bio ? (
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline/10">
                <p className="text-sm font-bold lowercase mb-1 text-primary">{isEn ? 'about me' : 'tentang saya'}</p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{userProfile.bio}</p>
              </div>
            ) : (
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline/10 border-dashed text-center">
                <p className="text-sm text-muted lowercase italic">{isEn ? 'no bio added yet' : 'belum ada bio'}</p>
              </div>
            )}

            {/* Minat Section */}
            <div>
              <p className="text-sm font-bold lowercase mb-3 text-primary">{isEn ? 'interests' : 'minat'}</p>
              {userProfile.minat && userProfile.minat.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.minat.map((m, i) => (
                    <span key={i} className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold lowercase">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted lowercase italic">{isEn ? 'no interests added' : 'belum ada minat yang ditambahkan'}</p>
              )}
            </div>

            <button onClick={() => setIsEditing(true)} className="w-full bg-primary/10 text-primary rounded-full py-4 font-bold text-sm lowercase hover:bg-primary/20 active:scale-95 transition-all mt-4">
              {isEn ? 'edit profile' : 'edit profil'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
