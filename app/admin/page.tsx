import { PrismaClient } from "@prisma/client";
import { 
  Users, 
  Trophy, 
  BookOpen, 
  Activity, 
  ArrowUpRight,
  ShieldAlert,
  UserX,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { toggleUserStatus } from "./actions"; // Pastikan file actions.ts sudah ada

const prisma = new PrismaClient();

export default async function AdminDashboardPage() {
  // Ambil data statistik dan user terbaru secara paralel
  const [totalUsers, totalChallenges, totalSubmissions, latestUsers] = await Promise.all([
    prisma.user.count(),
    prisma.challenge.count(),
    prisma.challengeSubmission.count(),
    prisma.user.findMany({ 
      take: 5, 
      orderBy: { id: 'desc' },
      select: { id: true, name: true, email: true, status: true } 
    })
  ]);

  const stats = [
    { label: "Total Students", val: totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Challenges", val: totalChallenges, icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Submissions", val: totalSubmissions, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Command Center</h1>
          <p className="text-slate-400 font-medium italic text-sm">Monitor and manage your learning empire.</p>
        </div>
        <ShieldAlert size={150} className="absolute -right-10 -bottom-10 text-white/5 -rotate-12" />
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item, i) => (
          <div key={i} className="bg-white border-2 border-slate-50 p-8 rounded-[2.5rem] shadow-sm hover:border-black transition-all group">
            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
              <item.icon size={24} />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">{item.label}</p>
            <h3 className="text-5xl font-black text-slate-900 mt-2 italic tracking-tighter">{item.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* NEW USERS LIST DENGAN FITUR BAN */}
        <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <h2 className="text-xl font-black uppercase italic tracking-tight">Student Management</h2>
            <Users size={20} className="text-slate-300" />
          </div>
          <div className="divide-y divide-slate-50">
            {latestUsers.map((u) => (
              <div key={u.id} className="py-5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-sm ${u.status === 'BANNED' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-black text-sm uppercase tracking-tight ${u.status === 'BANNED' ? 'text-red-500 line-through' : 'text-slate-900'}`}>
                      {u.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{u.email}</p>
                  </div>
                </div>

                {/* TOMBOL ACTION: BAN / UNBAN */}
                <form action={async () => {
                  "use server";
                  await toggleUserStatus(u.id, u.status);
                }}>
                  <button 
                    title={u.status === 'ACTIVE' ? 'Ban User' : 'Unban User'}
                    className={`p-3 rounded-xl transition-all shadow-sm active:scale-90 ${
                      u.status === 'ACTIVE' 
                      ? 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 border border-slate-100' 
                      : 'bg-red-100 text-red-600 border border-red-200'
                    }`}
                  >
                    {u.status === 'ACTIVE' ? <UserX size={20} /> : <ShieldCheck size={20} />}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6">
          <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 border-b border-slate-200 pb-4">Quick Actions</h2>
          <div className="grid gap-4">
            <Link 
              href="/admin/tournament" 
              className="bg-white p-6 rounded-[2rem] border-2 border-transparent hover:border-black transition-all flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
                  <Trophy size={20} />
                </div>
                <span className="font-black uppercase text-sm italic tracking-tight">Review Submissions</span>
              </div>
              <ArrowUpRight size={20} className="text-slate-300 group-hover:text-black transition-colors" />
            </Link>

            <div className="bg-white/50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-between group opacity-60">
            <Link 
  href="/admin/courses" 
  className="bg-white p-6 rounded-[2rem] border-2 border-transparent hover:border-black transition-all flex items-center justify-between group shadow-sm"
>
  <div className="flex items-center gap-4">
    <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
      <BookOpen size={20} />
    </div>
    <span className="font-black uppercase text-sm italic tracking-tight text-slate-900">Course Management</span>
  </div>
  <ArrowUpRight size={20} className="text-slate-300 group-hover:text-black transition-colors" />
</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}