"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Menu, Settings, X, CheckCheck } from "lucide-react"; // Tambah icon CheckCheck
import SignOutButton from "./SignOutButton";
import BadgePopup from "./BadgePopup";

export default function Navbar({ user, newBadges = [] }: { user: any, newBadges?: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // State Search
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  
  // State Dropdown
  const [showNotif, setShowNotif] = useState(false);
  
  // 🔥 STATE BARU: STATUS BELUM DIBACA
  // Default true (ada titik merah), nanti berubah jadi false kalau diklik
  const [hasUnread, setHasUnread] = useState(true);

  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.name || "User")}&background=000000&color=fff`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // 🔥 FUNGSI: TANDAI DIBACA
  const handleMarkAsRead = () => {
    setHasUnread(false); // Hilangkan titik merah
    // setShowNotif(false); // Opsional: Kalau mau langsung tutup dropdown setelah klik, uncomment ini
  };

  return (
    <>
      <BadgePopup newBadges={newBadges} />

      <div className="h-full px-6 flex items-center justify-between bg-white border-b border-gray-200 relative">
        
        {/* BAGIAN KIRI: SEARCH */}
        <div className="flex items-center gap-4">
          <div className="md:hidden text-gray-500 cursor-pointer">
             <Menu size={20} />
          </div>
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative group">
            <Search size={16} className="absolute left-3 text-gray-400 group-focus-within:text-black transition-colors" />
            <input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                pathname.includes('projects') ? "Cari projek..." : 
                pathname.includes('courses') ? "Cari materi..." : "Cari di AiEdu..."
              } 
              className="pl-9 pr-12 py-2 w-80 text-sm border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-400 shadow-sm"
            />
             <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </form>
        </div>

        {/* BAGIAN KANAN */}
        <div className="flex items-center gap-5">
          
          <div className="flex items-center gap-3 pr-4 border-r border-gray-200 relative">
              
              {/* TOMBOL NOTIFIKASI */}
              <button 
                onClick={() => setShowNotif(!showNotif)} 
                className={`transition relative p-2 rounded-full hover:bg-slate-100 ${showNotif ? "text-black bg-slate-100" : "text-gray-500"}`}
              >
                  <Bell size={18} />
                  
                  {/* 🔥 LOGIC TITIK MERAH (Hanya muncul jika hasUnread === true) */}
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-600 rounded-full border border-white animate-pulse"></span>
                  )}
              </button>

              {/* DROPDOWN NOTIFIKASI */}
              {showNotif && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-sm text-slate-800">Notifikasi</h3>
                        <button onClick={() => setShowNotif(false)}><X size={14} className="text-slate-400 hover:text-black"/></button>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto">
                        <div className={`p-4 hover:bg-slate-50 border-b border-gray-50 transition cursor-pointer ${hasUnread ? "bg-blue-50/30" : ""}`}>
                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">System</p>
                            <p className="text-xs text-slate-600 leading-relaxed">Selamat datang kembali! Jangan lupa cek misi harianmu.</p>
                            <p className="text-[10px] text-slate-400 mt-2">Baru saja</p>
                        </div>
                        <div className={`p-4 hover:bg-slate-50 border-b border-gray-50 transition cursor-pointer ${hasUnread ? "bg-amber-50/30" : ""}`}>
                            <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Badge Unlocked</p>
                            <p className="text-xs text-slate-600 leading-relaxed">Kamu mendapatkan badge <span className="font-bold text-slate-900">Streak Starter</span>!</p>
                            <p className="text-[10px] text-slate-400 mt-2">10 menit yang lalu</p>
                        </div>
                    </div>
                    
                    {/* 🔥 TOMBOL "TANDAI SEMUA DIBACA" (Sekarang Berfungsi) */}
                    <div className="p-3 bg-slate-50 text-center border-t border-gray-100">
                        <button 
                            onClick={handleMarkAsRead}
                            disabled={!hasUnread} // Disable kalau sudah dibaca
                            className={`text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 w-full
                                ${hasUnread ? "text-blue-600 hover:text-blue-800" : "text-gray-400 cursor-default"}`}
                        >
                            {hasUnread ? (
                                <> <CheckCheck size={14} /> Tandai Semua Dibaca </>
                            ) : (
                                "Semua Sudah Dibaca"
                            )}
                        </button>
                    </div>
                </div>
              )}

              <Link href="/dashboard/settings" className="text-gray-500 hover:text-black transition p-2 hover:bg-slate-100 rounded-full">
                  <Settings size={18} />
              </Link>
              
              <div className="hidden md:block">
                  <SignOutButton />
              </div>
          </div>

          {/* Profil User */}
          <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block leading-tight">
                  <p className="text-sm font-semibold text-black">{user?.full_name || user?.name || "User"}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{user?.email}</p>
              </div>
              <div className="h-9 w-9 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                 <img src={userAvatar} alt="Avatar" className="h-full w-full object-cover" />
              </div>
          </div>

        </div>
      </div>
      
      {showNotif && (
        <div className="fixed inset-0 z-[40]" onClick={() => setShowNotif(false)}></div>
      )}
    </>
  );
}