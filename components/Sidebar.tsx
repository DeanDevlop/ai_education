"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Compass, 
  BookOpen, 
  Trophy,
  UserCircle,
  FolderKanban, 
  Globe,        
  Crown,
  Users // Tambahkan icon Users
} from "lucide-react";

const sidebarRoutes = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Compass, label: "Browse Courses", href: "/course" },
  { icon: BookOpen, label: "My Learning", href: "/learning" },
  { icon: Globe, label: "Showcase", href: "/projects" }, 
  { icon: FolderKanban, label: "My Projects", href: "/projects/my-projects" }, 
  // Menu baru ditambahkan di sini
  { icon: Users, label: "Communities", href: "/communities" },
  { icon: Trophy, label: "Contest", href: "/tournament" },
  { icon: Crown, label: "Leaderboard", href: "/leaderboard" },
  { icon: UserCircle, label: "My Profile", href: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Logic untuk menyembunyikan sidebar di halaman player (belajar)
  const isPlayerPage = pathname?.includes("/learning/"); 

  if (isPlayerPage) {
    return null; 
  }


  return (
    <div className="h-full border-r border-gray-200 flex flex-col bg-white">
      
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg">
              <Image 
                src="/AiEdu.png" 
                alt="Logo" 
                fill 
                sizes="40px"
                className="object-contain"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">AiEdu.</span>
        </Link>
      </div>

      {/* MENU LIST */}
      <div className="flex-col w-full flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Main Menu</p>
        
        {sidebarRoutes.map((route) => {
          const isActive = pathname === route.href;
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-x-3 px-3 py-2.5 text-sm font-medium transition-all rounded-lg group
                ${isActive 
                  ? "bg-black text-white shadow-md shadow-gray-200" 
                  : "text-gray-500 hover:text-black hover:bg-gray-50"
                }
              `}
            >
              <route.icon 
                size={18} 
                className={`transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-black"}`} 
              />
              {route.label}
            </Link>
          );
        })}
      </div>

      {/* FOOTER: Upgrade Plan */}
      <div className="p-4 border-t border-gray-100">
         <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white shadow-lg">
            <p className="text-xs font-bold mb-1">AiEdu Pro Plan</p>
            <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">Dapatkan akses voice AI Tutor & Fitur Premium.</p>
            <button className="w-full py-2 bg-white text-black text-[10px] font-black rounded-lg hover:bg-gray-200 transition uppercase tracking-wider">
              Upgrade Now
            </button>
         </div>
      </div>
    </div>
  );
}