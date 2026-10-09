"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, userProfile, updateProfile, updateSisaCuti, updateJatahCuti, lang } = useAuth();
  const isEn = lang === 'en';

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [minat, setMinat] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [sisaCuti, setSisaCuti] = useState<number>(0);
  const [jatahCuti, setJatahCuti] = useState<number>(0);

  const minatOptions = isEn 
    ? ["Music", "Culinary", "Arts & culture", "Outdoors", "Family", "Sports"]
    : ["Musik", "Kuliner", "Seni & budaya", "Alam/outdoor", "Keluarga & anak", "Olahraga"];

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else if (userProfile) {
      setName(userProfile.name || "");
      setBio(userProfile.bio || "");
      setMinat(userProfile.minat || []);
      setSisaCuti(userProfile.sisaCuti || 0);
      setJatahCuti(userProfile.jatahCuti || 0);
      setAvatarUrl(userProfile.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile.name}`);
    }
  }, [isLoggedIn, userProfile, router]);

  if (!isLoggedIn || !userProfile) return null;

  const toggleMinat = (m: string) => {
    setMinat(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(isEn ? 'File too large (max 2MB)' : 'Ukuran foto maksimal 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, bio, minat, avatarUrl });
    updateSisaCuti(sisaCuti);
    updateJatahCuti(jatahCuti);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-500 pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2 ">{isEn ? 'Your profile' : 'Profil kamu'}</h2>
        <p className="text-sm text-muted ">{isEn ? 'Manage your personal information' : 'Kelola informasi personalmu'}</p>
      </div>

      <div className="bg-surface-container rounded-[32px] p-6 shadow-sm border border-outline/10 space-y-6">
        
        {/* Avatar Header */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-md bg-surface-container-low group">
            <Image 
              src={isEditing ? (avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`) : (userProfile.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile.name}`)} 
              alt="Avatar"
              fill
              className={`object-cover ${isEditing ? 'group-hover:opacity-50 transition-opacity' : ''}`}
            />
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-[10px] font-bold text-center leading-tight p-1 ">
                {isEn ? 'Change photo' : 'Ubah foto'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
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
              <label className="block text-sm font-medium ">{isEn ? 'Full name' : 'Nama lengkap'}</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium ">{isEn ? 'Bio' : 'Bio'}</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                placeholder={isEn ? "Tell us about yourself..." : "Ceritakan tentang dirimu..."}
                className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200 min-h-[100px]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium ">{isEn ? 'Remaining leave' : 'Sisa cuti'}</label>
                <input required type="number" min="0" value={sisaCuti} onChange={(e) => setSisaCuti(parseInt(e.target.value) || 0)} className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium ">{isEn ? 'Leave quota' : 'Jatah cuti'}</label>
                <input required type="number" min="0" value={jatahCuti} onChange={(e) => setJatahCuti(parseInt(e.target.value) || 0)} className="w-full bg-surface-container-low rounded-t-xl rounded-b-none border-b-2 border-outline p-3 text-sm focus:outline-none focus:border-primary transition-colors duration-200" />
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium ">{isEn ? 'Interests' : 'Minat'}</label>
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
            
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-surface-container-low text-foreground rounded-full py-3 font-bold text-sm border border-outline/30 hover:bg-outline/10 active:scale-95 transition-all">
                {isEn ? 'Cancel' : 'Batal'}
              </button>
              <button type="submit" className="flex-1 bg-primary text-on-primary rounded-full py-3 font-bold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all">
                {isEn ? 'Save' : 'Simpan'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            {/* Leave Status Display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low border border-outline/30 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs font-bold text-foreground/60 ">{isEn ? 'Remaining' : 'Sisa cuti'}</span>
                <span className="text-sm font-black text-primary">{userProfile.sisaCuti} {isEn ? 'Days' : 'Hari'}</span>
              </div>
              <div className="bg-surface-container-low border border-outline/30 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs font-bold text-foreground/60 ">{isEn ? 'Quota' : 'Jatah tahunan'}</span>
                <span className="text-sm font-black text-foreground/80">{userProfile.jatahCuti} {isEn ? 'Days' : 'Hari'}</span>
              </div>
            </div>

            {/* Bio Section */}
            {userProfile.bio ? (
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline/10">
                <p className="text-sm font-bold mb-1 text-primary">{isEn ? 'About me' : 'Tentang saya'}</p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{userProfile.bio}</p>
              </div>
            ) : (
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline/10 border-dashed text-center">
                <p className="text-sm text-muted italic">{isEn ? 'No bio added yet' : 'Belum ada bio'}</p>
              </div>
            )}

            {/* Minat Section */}
            <div>
              <p className="text-sm font-bold mb-3 text-primary">{isEn ? 'Interests' : 'Minat'}</p>
              {userProfile.minat && userProfile.minat.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProfile.minat.map((m, i) => (
                    <span key={i} className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold ">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted italic">{isEn ? 'No interests added' : 'Belum ada minat yang ditambahkan'}</p>
              )}
            </div>

            <button onClick={() => setIsEditing(true)} className="w-full bg-primary/10 text-primary rounded-full py-4 font-bold text-sm hover:bg-primary/20 active:scale-95 transition-all mt-4">
              {isEn ? 'Edit profile' : 'Edit profil'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
