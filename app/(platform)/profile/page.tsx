import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import BadgeCard from "@/components/BadgeCard";
import { 
  Award, 
  BookOpen, 
  Star, 
  ExternalLink, 
  User as UserIcon,
  Github,
  Flame,
  Trophy
} from "lucide-react";
import Link from "next/link";


export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Ambil data user lengkap dengan relasinya agar sinkron dengan Dashboard
  const dbUser = await prisma.user.findUnique({
    where: { id: user?.id },
    include: {
      earnedBadges: { include: { badge: true } },
      enrollments: true,
      activities: true
    }
  });

  // 2. Hitung Peringkat secara Dinamis (Sama dengan logika Dashboard/Leaderboard)
  const allUsersRanked = await prisma.user.findMany({
    orderBy: { totalLogins: 'desc' },
    select: { id: true }
  });
  const myRank = allUsersRanked.findIndex(u => u.id === dbUser?.id) + 1;

  const certificates = await prisma.certificate.findMany({
    where: { userId: user?.id },
    orderBy: { issuedAt: 'desc' }
  });

 const projects = await prisma.project.findMany({
  where: {
    // UBAH DARI 'user_id' MENJADI 'userId'
    userId: user?.id, 
  },
  orderBy: {
    // UBAH DARI 'created_at' MENJADI 'createdAt'
    createdAt: 'desc', 
  }
});

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      
      {/* HEADER PROFIL - DESAIN LEBIH TAJAM */}
      <div className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10 shadow-sm relative overflow-hidden group">
        <div className="h-40 w-40 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-6xl font-black shadow-2xl relative z-10 italic">
          {dbUser?.avatar ? (
            <img src={dbUser.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            dbUser?.name?.charAt(0).toUpperCase() || "S"
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-4 relative z-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
              {dbUser?.name || "Student AiEdu"}
            </h1>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">{dbUser?.email}</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-black border border-orange-100 uppercase italic">
              <Flame size={16} fill="currentColor" />
              {dbUser?.streak || 0} Day Streak
            </div>
            <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-xs font-black border border-amber-100 uppercase italic">
              <Trophy size={16} />
              Rank #{myRank}
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-black border border-blue-100 uppercase italic">
              <Star size={16} fill="currentColor" />
              {dbUser?.totalLogins ? dbUser.totalLogins * 10 : 0} XP
            </div>
          </div>
        </div>

        <Link 
          href="/platform/dashboard/settings" 
          className="px-8 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition shadow-lg active:scale-95"
        >
          Edit Profil
        </Link>

        {/* Aksesoris Background */}
        <Trophy className="absolute -right-10 -bottom-10 text-slate-50 opacity-50 group-hover:rotate-12 transition-transform" size={240} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* KOLOM KIRI: ACHIEVEMENTS & CERTIFICATES */}
        <div className="lg:col-span-2 space-y-8">
          
         <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <Star className="text-slate-900" size={20} />
                <h2 className="text-lg font-black uppercase italic tracking-tight">Koleksi Badge</h2>
            </div>
            
            {/* GANTI FLEX JADI GRID AGAR RAPI */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {dbUser?.earnedBadges && dbUser.earnedBadges.length > 0 ? (
                dbUser.earnedBadges.map((ub) => (
             
                  <BadgeCard 
                    key={ub.id} 
                    badge={ub.badge} 
                    earnedDate={ub.createdAt} 
                  />
                ))
              ) : (
                <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                   <Trophy size={32} className="mx-auto text-slate-300 mb-2" />
                   <p className="text-gray-400 text-xs italic font-medium">Belum ada badge yang dikoleksi.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <Award className="text-slate-900" size={20} />
                <h2 className="text-lg font-black uppercase italic tracking-tight">Sertifikat</h2>
            </div>

            {certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                        <Link key={cert.id} href={`/certificate/${cert.id}`}>
                            <div className="group p-5 bg-white border border-gray-200 rounded-2xl hover:border-black transition-all">
                                <Award className="text-gray-200 group-hover:text-amber-500 transition-colors mb-3" size={32} />
                                <h3 className="font-bold text-slate-900 line-clamp-1 uppercase text-sm">{cert.courseName}</h3>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Lulus: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                <div className="mt-4 flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                    Verify <ExternalLink size={10} className="ml-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-14 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Award size={40} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400 text-xs font-bold uppercase">Selesaikan kursus untuk klaim sertifikat</p>
                </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: PROJEK SHOWCASE */}
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <Github className="text-slate-900" size={20} />
                <h2 className="text-lg font-black uppercase italic tracking-tight">Projek GitHub</h2>
            </div>

            <div className="space-y-4">
                {projects.length > 0 ? (
                    projects.map((proj) => (
                        <div key={proj.id} className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 group hover:border-black transition-all">
                            <h4 className="font-black text-sm text-slate-900 uppercase italic tracking-tight group-hover:text-blue-600 transition-colors">{proj.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 font-medium leading-relaxed">{proj.description}</p>
                            <div className="flex items-center justify-between pt-2">
                              <a href={proj.github_url} target="_blank" className="text-[9px] font-black text-slate-400 hover:text-black flex items-center gap-1.5 uppercase tracking-tighter border border-slate-100 px-2 py-1 rounded-md">
                                  <Github size={12} /> View Source
                              </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-400 text-[10px] font-bold uppercase">Belum ada projek diunggah</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}