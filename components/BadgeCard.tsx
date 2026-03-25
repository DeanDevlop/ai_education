import Image from "next/image";

interface BadgeProps {
  badge: {
    name: string;
    description: string;
    icon: string; // Ini sekarang isinya path gambar (contoh: "/badges/expert.png")
  };
  earnedDate?: Date | null; // Opsional: kapan didapatkan
}

export default function BadgeCard({ badge, earnedDate }: BadgeProps) {
  // 1. Logika Warna Ring ala Kaggle berdasarkan nama badge
  // (Pastikan nama badgemu di database mengandung kata kunci ini)
  let ringColor = "ring-slate-200 shadow-slate-100"; // Default (Novice/Belum dapat)
  let bgColor = "bg-slate-50";

  // Cek nama badge (case insensitive)
  const nameLower = badge.name.toLowerCase();

  if (earnedDate) {
    // Hanya kasih warna kalau sudah didapatkan
    if (nameLower.includes("contributor") || nameLower.includes("intermediate")) {
        ringColor = "ring-blue-400 shadow-blue-200/50"; // Biru Kaggle
        bgColor = "bg-blue-50";
    } else if (nameLower.includes("expert") || nameLower.includes("advanced")) {
        ringColor = "ring-purple-500 shadow-purple-200/50"; // Ungu Kaggle
        bgColor = "bg-purple-50";
    } else if (nameLower.includes("master") || nameLower.includes("legend") || nameLower.includes("streak")) {
        ringColor = "ring-amber-400 shadow-amber-200/50"; // Emas Kaggle
        bgColor = "bg-amber-50";
    } else if (nameLower.includes("novice") || nameLower.includes("beginner")) {
        ringColor = "ring-green-400 shadow-green-200/50"; // Hijau Kaggle
        bgColor = "bg-green-50";
    }
  }


  return (
    <div 
      className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 text-center group
      ${earnedDate ? "opacity-100 hover:-translate-y-1" : "opacity-50 grayscale"}`}
      title={earnedDate ? `Didapatkan pada: ${new Date(earnedDate).toLocaleDateString('id-ID')}` : badge.description}
    >
      {/* --- BAGIAN GAMBAR & RING --- */}
      <div className={`relative w-20 h-20 mb-3 rounded-full p-1 ring-[3px] shadow-lg ${ringColor} ${bgColor} transition-all group-hover:shadow-xl`}>
        {/* Menggunakan Next/Image untuk performa */}
        <Image 
          src={badge.icon} // Path dari database (/badges/...)
          alt={badge.name}
          fill // Agar gambar memenuhi container induknya
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-1 drop-shadow-sm hover:scale-110 transition-transform"
        />
      </div>

      {/* NAMA BADGE */}
      <h3 className={`font-black text-xs uppercase tracking-wider mb-1 ${earnedDate ? "text-slate-900" : "text-slate-400"}`}>
        {badge.name}
      </h3>

      {/* DESKRIPSI SINGKAT */}
      <p className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-2 px-2">
        {badge.description}
      </p>

      {/* STATUS (Opsional) */}
      {!earnedDate && (
        <span className="mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            Locked
        </span>
      )}
    </div>
  );
}