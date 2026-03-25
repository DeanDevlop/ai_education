import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { 
  BookOpen, 
  CheckSquare, 
  Flame, 
  Trophy, 
  Calendar, 
  Target,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Celebration from "@/components/Celebration";
import { checkAndAwardBadges } from "@/lib/badgeSystem";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  // 1. Ambil Data User Awal
  let userData = await prisma.user.findUnique({ 
    where: { id: authUser.id },
    include: { 
      enrollments: { include: { course: true } },
      activities: { orderBy: { date: 'desc' } }, // Urutkan biar gampang cek hari ini
      earnedBadges: { include: { badge: true } }
    }
  });

  if (userData) {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const lastLoginDate = new Date(userData.lastLogin || 0); 
    lastLoginDate.setHours(0, 0, 0, 0);

    const isLoginToday = today.getTime() === lastLoginDate.getTime();
    
    // 🔥 FIX ACTIVITY HISTORY: Cek apakah SUDAH ada log hari ini di tabel Activities?
    // Jangan cuma percaya 'lastLogin', cek real data di tabel activity.
    const hasLogToday = userData.activities.some(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0,0,0,0);
        return logDate.getTime() === today.getTime();
    });

    let updateData: any = {};
    let shouldUpdate = false;

    // A. Reset Daily Quest (Logic lama)
    const lastQuestDate = new Date(userData.lastQuestDate || 0);
    lastQuestDate.setHours(0,0,0,0);
    if (today.getTime() !== lastQuestDate.getTime()) {
      updateData.dailyQuestCompleted = false;
      updateData.lastQuestDate = now;
      shouldUpdate = true;
    }

    // B. Logic Streak & Activity
    // Kita update JIKA: Belum login hari ini ATAU Belum ada log aktivitas hari ini
    if (!isLoginToday || !hasLogToday) {
      
      // Kalau benar-benar hari baru (bukan cuma log yang hilang), update streak
      if (!isLoginToday) {
          const oneDay = 24 * 60 * 60 * 1000;
          const diffDays = Math.round(Math.abs((today.getTime() - lastLoginDate.getTime()) / oneDay));
          
          let newStreak = userData.streak;
          if (diffDays === 1) newStreak += 1;
          else if (diffDays > 1) newStreak = 1;

          updateData.streak = newStreak;
          updateData.lastLogin = now;
          updateData.totalLogins = { increment: 1 };
          updateData.totalPoints = { increment: 10 };
      }

      // Selalu buat activity log baru jika belum ada hari ini
      if (!hasLogToday) {
          updateData.activities = {
            create: { date: now }
          };
      }
      
      shouldUpdate = true;
    }

    // C. Eksekusi Update
    if (shouldUpdate) {
      await prisma.user.update({
        where: { id: authUser.id },
        data: updateData
      });
    }

    // D. Cek Badge
    try {
        await checkAndAwardBadges(authUser.id);
    } catch (error) {
        console.error("Gagal cek badge:", error);
    }

    // E. RE-FETCH DATA (Wajib biar UI update)
    userData = await prisma.user.findUnique({ 
        where: { id: authUser.id },
        include: { 
          enrollments: { include: { course: true } },
          activities: { orderBy: { date: 'desc' } },
          earnedBadges: { include: { badge: true } }
        }
    });
  }

  // --- DATA PREP UNTUK UI ---
  
  // Rank
  const allUsersRanked = await prisma.user.findMany({
    orderBy: { totalLogins: 'desc' },
    select: { id: true }
  });
  const myRank = allUsersRanked.findIndex(u => u.id === authUser.id) + 1;

  // Activity Grid
  const logs = userData?.activities || [];
  const activeDates = new Set(logs.map(log => new Date(log.date).toDateString()));
  const activityDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(new Date().getDate() - (29 - i));
    return { date: d.toDateString(), active: activeDates.has(d.toDateString()) };
  });

  // Badge Display
  const streakBadge = userData?.earnedBadges.find(ub => 
    ub.badge.name.toLowerCase().includes("streak")
  );
  const achievementTitle = streakBadge ? streakBadge.badge.name : "Novice Learner";

  const totalCourses = userData?.enrollments.length || 0;
  const finishedCourses = userData?.enrollments.filter(e => e.progress === 100).length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tighter uppercase italic">Overview</h1>
          <p className="text-sm text-gray-500 font-medium italic">Your learning journey tracker.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white border border-orange-100 p-2 pr-5 rounded-full shadow-md">
          <div className="bg-orange-500 p-2 rounded-full text-white shadow-lg animate-pulse">
            <Flame size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-black text-orange-400 uppercase leading-none">Day Streak</p>
            <p className="text-xl font-black text-orange-600 leading-none">{userData?.streak || 0} DAYS</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Activity History */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Activity History</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activityDays.map((day, i) => (
                <div key={i} title={day.date} className={`w-4 h-4 rounded-[3px] ${day.active ? 'bg-green-600' : 'bg-slate-100'}`} />
              ))}
            </div>
          </div>

          {/* DAILY QUEST SECTION */}
          <div className={`p-6 rounded-2xl border-2 transition-all ${userData?.dailyQuestCompleted ? "bg-green-50 border-green-200" : "bg-white border-dashed border-slate-300"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${userData?.dailyQuestCompleted ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-tight">Misi Hari Ini</h3>
                  <p className="text-xs text-slate-500 italic">Selesaikan 1 materi untuk klaim hadiah!</p>
                </div>
              </div>
              {userData?.dailyQuestCompleted ? (
                <span className="text-[10px] font-black text-green-600 uppercase border border-green-200 px-3 py-1 rounded-full bg-white">Selesai</span>
              ) : (
                <Link href="/course" className="px-4 py-2 bg-black text-white text-[10px] font-black rounded-lg uppercase">Kerjakan</Link>
              )}
            </div>
          </div>
        </div>

        {/* Rank Status (Achievement) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest">Achievement</p>
          
          {streakBadge ? (
             <Trophy size={80} className="text-amber-500 animate-bounce drop-shadow-lg" /> 
          ) : (
             <Trophy size={80} className="text-slate-100 opacity-30" />
          )}
          
          <h4 className="mt-6 font-black text-sm uppercase tracking-tighter text-slate-800">
            {achievementTitle}
          </h4>
        </div>
      </div>
      
      {/* (Sisa code Stats Grid & Continued Learning sama seperti sebelumnya) */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Enrolled", val: totalCourses, icon: BookOpen, color: "text-black" },
          { label: "Finished", val: finishedCourses, icon: CheckSquare, color: "text-green-600" },
          { label: "Rank", val: `#${myRank}`, icon: Trophy, color: "text-amber-500" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative group hover:border-black transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{item.label}</p>
            <h3 className="text-5xl font-black text-black italic tracking-tighter mt-4 relative z-10">{item.val}</h3>
            <item.icon size={100} className="absolute -right-4 -bottom-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-black text-xs text-slate-900 uppercase tracking-widest italic">Continue Learning</h2>
          <Link href="/course" className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">Browse All <ArrowRight size={12} /></Link>
        </div>
        <div className="divide-y divide-gray-50">
          {userData?.enrollments.map((e) => (
            <Link key={e.id} href={`/learning/${e.course.slug}`} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-6">
                <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center"><BookOpen size={20} className="text-slate-400" /></div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase">{e.course.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{e.progress}% DONE</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-200" />
            </Link>
          ))}
        </div>
      </div>

      <Celebration trigger={userData?.streak === 7} />
    </div>
  );
}