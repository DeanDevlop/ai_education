'use client'
import { useState, useEffect } from 'react'
import { Trophy, X } from 'lucide-react'
import Image from 'next/image'

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function BadgePopup({ newBadges }: { newBadges: Badge[] }) {
  const [visible, setVisible] = useState(false)
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null)

  useEffect(() => {
    // Jika ada badge baru, tampilkan yang pertama
    if (newBadges.length > 0) {
      setCurrentBadge(newBadges[0])
      
      // Delay sedikit biar user "ngeh" halaman sudah load, baru muncul popup
      const timer = setTimeout(() => setVisible(true), 1000)
      
      // Hilang otomatis setelah 5 detik
      const hideTimer = setTimeout(() => setVisible(false), 6000)

      return () => {
        clearTimeout(timer)
        clearTimeout(hideTimer)
      }
    }
  }, [newBadges])

  if (!visible || !currentBadge) return null

  return (
    <div className="fixed bottom-10 right-5 md:right-10 z-50 animate-bounce-in">
      <div className="bg-white border-2 border-amber-100 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm relative overflow-hidden">
        
        {/* Background Sparkles */}
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-amber-400 opacity-20 blur-2xl rounded-full pointer-events-none"></div>

        {/* Close Button */}
        <button onClick={() => setVisible(false)} className="absolute top-2 right-2 text-slate-300 hover:text-slate-500">
            <X size={14} />
        </button>

        {/* Icon */}
        <div className="relative w-14 h-14 shrink-0">
             {/* Fallback kalau gambar error/masih emoji */}
             {currentBadge.icon.startsWith('/') ? (
                <Image 
                    src={currentBadge.icon} 
                    alt={currentBadge.name} 
                    fill 
                    className="object-contain drop-shadow-md"
                />
             ) : (
                <span className="text-4xl">{currentBadge.icon}</span>
             )}
        </div>

        {/* Text */}
        <div>
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">New Badge Unlocked!</p>
          <h3 className="font-black text-slate-900 text-sm leading-tight">{currentBadge.name}</h3>
          <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-1">{currentBadge.description}</p>
        </div>
      </div>
    </div>
  )
}