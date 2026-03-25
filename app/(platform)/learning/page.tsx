import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  PlayCircle, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Trophy, 
  Zap,
  CheckCircle
} from "lucide-react";

export default async function MyLearningPage() {
  // 1. Cek Login
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Ambil data dari KEDUA tabel (Purchases & Enrollments)
  // 🔥 PERBAIKAN DISINI: Menambahkan wrapper 'include' di paling luar
  const courseInclude = {
    include: { 
        course: {
            include: {
                chapters: {
                    include: {
                        lessons: {
                            include: {
                                userProgress: {
                                    where: { userId: user.id }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
  };

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      purchases: courseInclude,    // Sekarang strukturnya jadi: purchases: { include: { course: ... } } (BENAR)
      enrollments: courseInclude   
    }
  });

  // 3. GABUNGKAN DATA & HILANGKAN DUPLIKAT
  const rawList = [
    ...(userData?.purchases || []), 
    ...(userData?.enrollments || [])
  ];

  // Filter Duplikat
  const uniqueCoursesMap = new Map();
  rawList.forEach((item) => {
    if (!uniqueCoursesMap.has(item.course.id)) {
        uniqueCoursesMap.set(item.course.id, item);
    }
  });

  const myCourses = Array.from(uniqueCoursesMap.values());

  // 4. Hitung Statistik
  const totalCourses = myCourses.length;
  const completedCourses = myCourses.filter((p: any) => {
    const all = p.course.chapters.flatMap((c: any) => c.lessons);
    const done = all.filter((l: any) => l.userProgress.some((up: any) => up.isCompleted)).length;
    return all.length > 0 && all.length === done;
  }).length;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tighter uppercase italic">My Learning</h1>
          <p className="text-sm text-gray-500 font-medium italic">Track your course completions and certificates.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white border border-blue-100 p-2 pr-5 rounded-full shadow-md">
          <div className="bg-black p-2 rounded-full text-white shadow-lg">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Status</p>
            <p className="text-xl font-black text-black leading-none uppercase italic">Active Learner</p>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative group hover:border-black transition-all">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Total Enrolled</p>
          <h3 className="text-5xl font-black text-black italic tracking-tighter mt-4 relative z-10">{totalCourses}</h3>
          <BookOpen size={100} className="absolute -right-4 -bottom-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative group hover:border-emerald-500 transition-all">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Completed Courses</p>
          <h3 className="text-5xl font-black text-emerald-600 italic tracking-tighter mt-4 relative z-10">{completedCourses}</h3>
          <Trophy size={100} className="absolute -right-4 -bottom-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* COURSE LIST */}
      <div className="space-y-6">
        <h2 className="font-black text-xs text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
            <PlayCircle size={16}/> Continue Your Journey
        </h2>

        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCourses.map((item: any) => {
              
              const allLessons = item.course.chapters.flatMap((c: any) => c.lessons);
              const totalLessons = allLessons.length;
              const completedLessons = allLessons.filter((lesson: any) => 
                lesson.userProgress.some((p: any) => p.isCompleted)
              ).length;

              const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

              return (
                <Link 
                  key={item.id} 
                  href={`/learning/${item.course.slug}`} 
                  className="group bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden hover:border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden border-b-2 border-slate-100">
                      <img 
                          src={item.course.thumbnail || "/placeholder.png"} 
                          alt={item.course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      {progressPercentage === 100 && (
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-xl">
                            <CheckCircle size={16} />
                        </div>
                      )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-black text-lg text-slate-900 uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                        {item.course.title}
                    </h3>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
                            <p className="text-sm font-black italic tracking-tighter">{progressPercentage}%</p>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden p-0.5">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${progressPercentage === 100 ? "bg-emerald-500" : "bg-black"}`} 
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                            <Clock size={12} />
                            <span>{progressPercentage === 100 ? "Completed" : "In Progress"}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                            <ArrowRight size={16} />
                        </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border-4 border-dashed border-slate-100 rounded-[3rem]">
              <BookOpen size={60} className="text-slate-200 mb-4" />
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">No Classes Found</h3>
              <p className="text-slate-400 text-sm italic mb-8 text-center max-w-xs">You haven't joined any mission yet. Start your journey now!</p>
              <Link 
                  href="/course" 
                  className="px-8 py-4 bg-black text-white font-black rounded-2xl uppercase italic tracking-widest text-xs hover:shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] transition-all active:scale-95"
              >
                  Find New Course
              </Link>
          </div>
        )}
      </div>
    </div>
  );
}