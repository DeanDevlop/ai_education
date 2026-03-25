import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Trophy, Calendar, Users, Target, Clock, Award } from "lucide-react";
import ChallengeAction from "@/components/ChallengeAction";



export default async function TournamentPage() {
  const cookieStore = await cookies();
  
  
  // 1. Inisialisasi Supabase untuk ambil User Session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // 2. Ambil Challenge Aktif dari Database
  const activeChallenge = await prisma.challenge.findFirst({
    where: { status: "ACTIVE" },
    include: {
      submissions: {
        include: { user: true },
        orderBy: { score: 'desc' },
      }
    }
  });

  // Tampilan jika tidak ada lomba
  if (!activeChallenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Trophy size={60} className="text-slate-200" />
        <h2 className="text-xl font-black uppercase italic text-slate-400">Belum ada lomba aktif bulan ini</h2>
        <p className="text-sm text-slate-500">Nantikan tantangan seru berikutnya di AiEdu!</p>
      </div>
    );
  }

  // 3. Logika Pendukung
// --- 3. LOGIKA PENDUKUNG (PASTIKAN TIDAK ADA DUPLIKAT NAMA VARIABEL) ---
  const userSubmission = activeChallenge.submissions.find(sub => sub.userId === authUser?.id);
  const isJoined = !!userSubmission; // Ini akan menghasilkan true jika ada, false jika tidak
  const existingUrl = userSubmission?.contentUrl;

  const daysLeft = Math.ceil((new Date(activeChallenge.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const topSubmissions = activeChallenge.submissions.slice(0, 10);
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      
      {/* SECTION 1: HERO CHALLENGE */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[40px] p-10 md:p-16 text-white shadow-2xl border-4 border-slate-800 transition-all hover:border-slate-700">
        <div className="relative z-10 max-w-3xl space-y-6">
  
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-widest italic">
            <Target size={14} /> {activeChallenge.category} Mission
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
            {activeChallenge.title}
          </h1>
          
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl italic">
            {activeChallenge.description}
          </p>

         {/* Ganti JoinButton lama dengan ini */}
  <div className="pt-4">
    <ChallengeAction 
      challengeId={activeChallenge.id} 
      userId={authUser?.id || ""} 
      isJoined={isJoined}
      existingUrl={existingUrl}
    />
  </div>
          <div className="flex flex-wrap gap-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <Clock className="text-amber-400" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Deadline</p>
                <p className="text-sm font-bold uppercase tracking-tighter italic">
                  {daysLeft > 0 ? `${daysLeft} Hari Lagi` : "Berakhir Hari Ini"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <Users className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Participants</p>
                <p className="text-sm font-bold uppercase tracking-tighter italic">
                  {activeChallenge.submissions.length} Joined
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aksesoris Visual */}
        <Trophy className="absolute -right-16 -bottom-16 opacity-5 text-white -rotate-12 transition-transform hover:rotate-0 duration-1000" size={450} />
      </div>

      {/* SECTION 2: STANDINGS / LEADERBOARD LOMBA */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Award className="text-slate-900" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Challenge Standings</h2>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">Real-time Score Update</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {topSubmissions.length > 0 ? (
            topSubmissions.map((sub, i) => (
              <div 
                key={sub.id} 
                className="group flex items-center justify-between p-6 bg-white border-2 border-slate-50 rounded-[2rem] hover:border-black hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <span className={`text-3xl font-black italic w-10 ${i === 0 ? 'text-amber-500' : 'text-slate-200'}`}>
                    #{i + 1}
                  </span>
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black italic text-xl shadow-lg group-hover:scale-110 transition-transform">
                      {sub.user.avatar ? (
                        <img src={sub.user.avatar} className="rounded-2xl w-full h-full object-cover" alt="" />
                      ) : (
                        sub.user.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-base tracking-tight text-slate-900">{sub.user.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {sub.score} Points Secured
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Score Bar Visual */}
                <div className="flex items-center gap-8">
                  <div className="h-2.5 w-40 bg-slate-50 rounded-full overflow-hidden hidden lg:block border border-slate-100">
                    <div 
                      className={`h-full transition-all duration-1000 ${i === 0 ? 'bg-amber-500' : 'bg-slate-900'}`} 
                      style={{ width: `${Math.min(sub.score, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black italic tracking-tighter text-slate-900">{sub.score}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Total Score</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-black uppercase italic tracking-widest">Belum ada submission. Jadilah yang pertama!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component minimalis untuk icon Star
function Star({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  );
}