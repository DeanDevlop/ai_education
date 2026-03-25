"use client"; // Wajib Client Component karena pakai usePathname

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar"; 
import Navbar from "@/components/Navbar";   
import { Toaster } from "react-hot-toast";

export default function PlatformShell({
  children,
  user, 
  newBadges = [] // <--- 1. TERIMA DATA BADGE DISINI (Default array kosong)
}: {
  children: React.ReactNode;
  user: any;
  newBadges?: any[]; // Definisi Type
}) {
  const pathname = usePathname();

  // LOGIC: Sembunyikan Sidebar jika URL mengandung "/learning/" 
  // DAN panjangnya > 10 (asumsi bukan halaman list course biasa)
  const isPlayerPage = pathname?.includes("/learning/") && pathname.length > 10;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      {/* 1. SIDEBAR (Hanya muncul jika BUKAN halaman belajar) */}
      {!isPlayerPage && (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80] bg-white border-r border-gray-200">
          <Sidebar />
        </div>
      )}

      {/* 2. MAIN CONTENT */}
      {/* Padding kiri 0 kalau belajar, Padding kiri 64 (md) kalau dashboard */}
      <main className={`min-h-screen flex flex-col transition-all duration-300 ${isPlayerPage ? "pl-0" : "md:pl-64"}`}>
        
        {/* Navbar */}
        {/* Opsional: Sembunyikan navbar juga kalau mau full screen total */}
        {!isPlayerPage && (
            <div className="fixed top-0 right-0 z-50 h-16 w-full md:w-[calc(100%-16rem)] bg-white border-b border-gray-200">
                {/* 2. KIRIM DATA BADGE KE NAVBAR AGAR JADI POPUP */}
                <Navbar user={user} newBadges={newBadges} />
            </div>
        )}

        {/* Isi Halaman */}
        <div className={`flex-1 ${isPlayerPage ? "p-0 pt-0" : "p-6 pt-10"}`}>
            {children}
        </div>

      </main>
    </div>
  );
}