import { PrismaClient } from "@prisma/client";
import { Trophy, Lock, Star, Zap, Flame, Layout } from "lucide-react";

const prisma = new PrismaClient();

const ICON_MAP: any = {
  Trophy: <Trophy size={40} />,
  Star: <Star size={40} />,
  Zap: <Zap size={40} />,
  Flame: <Flame size={40} />,
  Layout: <Layout size={40} />,
};

export default async function BadgesPage() {
  const allBadges = await prisma.badge.findMany();
  // Asumsikan kita ambil data user yang login (ini contoh statis/hardcode userId)
  const userBadges = await prisma.userBadge.findMany({ where: { userId: 'USER_ID_KAMU' } });
  const earnedIds = userBadges.map(ub => ub.badgeId);

  return (
    <div className="space-y-10 pb-20">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Achievement Gallery</h1>
        <p className="text-gray-500">Kumpulkan badge dengan menyelesaikan misi harian dan belajar.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {allBadges.map((badge) => {
          const isEarned = earnedIds.includes(badge.id);
          
          return (
            <div 
              key={badge.id}
              className={`relative p-6 rounded-3xl border-2 flex flex-col items-center text-center transition-all duration-500 ${
                isEarned 
                ? "bg-white border-amber-200 shadow-lg shadow-amber-100 scale-100" 
                : "bg-gray-50 border-gray-100 opacity-50 grayscale scale-95"
              }`}
            >
              <div className={`${isEarned ? "text-amber-500" : "text-gray-300"} mb-4`}>
                {ICON_MAP[badge.icon] || <Trophy size={40} />}
              </div>
              
              <h3 className="font-black text-[10px] uppercase tracking-widest mb-1">{badge.name}</h3>
              <p className="text-[10px] text-gray-400 leading-tight">{badge.description}</p>

              {!isEarned && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/40 backdrop-blur-[1px] rounded-3xl">
                  <Lock size={16} className="text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
