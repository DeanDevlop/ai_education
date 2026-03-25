import { prisma } from "@/lib/prisma";
import { Trophy, Medal, Star, Target } from "lucide-react";



export default async function LeaderboardPage() {
  // Ambil top 10 user global
  const topUsers = await prisma.user.findMany({
    orderBy: { totalLogins: 'desc' },
    take: 10
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6 flex items-center gap-4">
        <div className="p-3 bg-amber-50 rounded-xl text-amber-600 animate-bounce">
            <Trophy size={32} />
        </div>
        <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Leaderboard Komunitas</h1>
            <p className="text-sm text-gray-500 font-medium">Siapa yang paling konsisten belajar di AiEdu?</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-5 text-[10px] font-black uppercase tracking-widest opacity-70">Rank</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest opacity-70">Student</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest opacity-70 text-center">XP Points</th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest opacity-70 text-right">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topUsers.map((user, index) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center justify-center w-8 h-8">
                    {index === 0 ? <Medal className="text-amber-500" size={24} /> : 
                     index === 1 ? <Medal className="text-slate-400" size={24} /> :
                     index === 2 ? <Medal className="text-amber-700" size={24} /> :
                     <span className="text-sm font-black text-slate-300 italic">#{index + 1}</span>}
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg">
                      {user.avatar ? <img src={user.avatar} className="rounded-xl" /> : user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase italic">Verified Learner</p>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-center">
                   <div className="inline-flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-sm font-black text-amber-700">{user.totalLogins * 10}</span>
                   </div>
                </td>
                <td className="p-5 text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase">{user.totalLogins} Logins</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}