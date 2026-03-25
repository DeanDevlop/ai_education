// components/CommunityCard.tsx
import { ExternalLink } from "lucide-react";

export default function CommunityCard({ data }: { data: any }) {
  // Fungsi untuk memilih warna/icon berdasarkan platform
  const getPlatformStyle = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'whatsapp': return 'bg-green-500 text-white';
      case 'discord': return 'bg-indigo-500 text-white';
      case 'github': return 'bg-gray-900 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="border-2  bg-white p-6 rounded-2xl hover:border-black transition-all flex flex-col gap-4">
      <div className="flex items-center gap-4 bg-black">
        {/* Logo/Image Placeholder */}
      
        <div>
          <h3 className="font-bold text-lg">{data.name}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${getPlatformStyle(data.platform)}`}>
            {data.platform}
          </span>
        </div>
      </div>
      
      <p className="text-slate-500 text-sm line-clamp-2">
        {data.description}
      </p>

      <a 
        href={data.link_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-auto flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition"
      >
        Gabung Sekarang <ExternalLink size={14} />
      </a>
    </div>
  );
}