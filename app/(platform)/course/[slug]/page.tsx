import { prisma } from "@/lib/prisma"; // ✅ PAKAI INI (Singleton), JANGAN new PrismaClient()
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  PlayCircle, 
  Lock, 
  Star, 
  Globe, 
  Award, 
  Clock, 
  FileText, 
  MonitorPlay,
  ArrowRight,
  CheckCircle2,
  Users
} from "lucide-react";

// Import Component
import { CourseEnrollButton } from "@/components/course-enroll-button"; 
import ReviewForm from "@/components/course/ReviewModal"; // ✅ Import Form Review

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Setup Supabase
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  // 1. AMBIL DATA COURSE + REVIEWS + PROGRESS
  const course = await prisma.course.findUnique({
    where: { slug: slug },
    include: {
      // Ambil Chapter & Lesson
      chapters: {
        include: { 
          lessons: {
            include: {
              userProgress: {
                where: { userId: user?.id || "" } 
              }
            },
            orderBy: { createdAt: 'asc' } 
          } 
        },
        orderBy: { createdAt: 'asc' }
      },
      // ✅ Ambil Reviews & User-nya
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      },
      // ✅ Hitung Jumlah Murid
      _count: {
        select: { enrollments: true }
      }
    }
  });

  if (!course) {
    notFound();
  }

  // 2. CEK APAKAH SUDAH BELI / ENROLLED
  let isEnrolled = false;
  if (user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
            userId: user.id,
            courseId: course.id
        }
      }
    });
    // Cek juga purchase table kalau pakai sistem beli putus
    const purchase = await prisma.purchase.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } }
    });
    
    isEnrolled = !!enrollment || !!purchase;
  }

  // 3. HITUNG PROGRESS BELAJAR
  const allLessons = course.chapters.flatMap((c) => c.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((lesson) => 
    lesson.userProgress.some((p) => p.isCompleted)
  ).length;

  const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  // 4. HITUNG RATING DINAMIS
  const totalStars = course.reviews.reduce((acc, r) => acc + r.rating, 0);
  const avgRating = course.reviews.length > 0 ? (totalStars / course.reviews.length).toFixed(1) : "New";

  // Cek Review User Sendiri
  const userReview = user ? course.reviews.find((r) => r.userId === user.id) : null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-slate-900 text-white py-12 lg:py-20 relative overflow-hidden">
        {/* Background Blur Image */}
        <div className="absolute inset-0 opacity-20 bg-center bg-cover blur-3xl" style={{ backgroundImage: `url(${course.thumbnail || '/placeholder.png'})` }}></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 space-y-6">
             <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Link href="/course" className="hover:text-white transition">Courses</Link> 
                <span>/</span> 
                <span className="text-amber-500">{course.slug}</span>
             </div>

            <h1 className="text-3xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none">
              {course.title}
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
              <span className="bg-amber-500 text-black px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                  {course.category}
              </span>
              
              {/* ✅ RATING DINAMIS DI HERO */}
              <div className="flex items-center text-amber-400 font-bold gap-1.5">
                <span className="text-lg">{avgRating}</span>
                <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={16} className={s <= Math.round(Number(avgRating) || 0) ? "fill-amber-400" : "text-slate-600"} />
                    ))}
                </div>
                <span className="text-xs text-slate-400 ml-1">({course.reviews.length} reviews)</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                 <Users size={16} /> {course._count.enrollments} Students
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400 pt-2 uppercase tracking-wide">
               <div className="flex items-center gap-2">
                 <Globe size={16} /> <span>Bahasa Indonesia</span>
               </div>
               <div className="flex items-center gap-2">
                 <Clock size={16} /> <span>Akses Seumur Hidup</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* === KOLOM KIRI === */}
        <div className="lg:col-span-2 space-y-10">

          {/* Progress Header (Hanya muncul kalau sudah daftar) */}
          {isEnrolled && (
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Progres Belajarmu</h3>
                <span className="text-sm font-black text-emerald-600">{progressPercentage}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
           
           {/* Kurikulum */}
           <div>
             <h2 className="text-2xl font-black mb-6 text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                 <MonitorPlay /> Kurikulum Materi
             </h2>
             <div className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
               {course.chapters.length > 0 ? (
                   course.chapters.map((chapter, idx) => (
                     <div key={chapter.id} className="border-b border-gray-100 last:border-0">
                       <div className="bg-slate-50/50 px-6 py-4 font-bold text-slate-900 flex justify-between items-center">
                         <span className="uppercase text-xs tracking-widest text-slate-500">Section {idx + 1}</span>
                         <span className="text-sm font-black uppercase">{chapter.title}</span>
                       </div>
                       <div className="divide-y divide-gray-50">
                        {chapter.lessons.map((lesson) => {
                          const isCompleted = lesson.userProgress?.[0]?.isCompleted || false;

                          return (
                            <Link 
                                href={isEnrolled ? `/learning/${course.slug}?lessonId=${lesson.id}` : "#"}
                                key={lesson.id} 
                                className={`px-6 py-4 flex justify-between items-center transition group 
                                  ${isEnrolled ? "hover:bg-slate-50 cursor-pointer" : "opacity-70 cursor-not-allowed"}
                                  ${isCompleted ? "bg-emerald-50/20" : ""} 
                                `}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg transition-colors 
                                  ${isCompleted 
                                    ? "bg-emerald-500 text-white" 
                                    : isEnrolled ? "bg-slate-100 text-slate-400 group-hover:bg-black group-hover:text-white" : "bg-slate-50 text-slate-300"}
                                `}>
                                  {isCompleted ? <CheckCircle2 size={18} /> : isEnrolled ? <PlayCircle size={18} /> : <Lock size={18} />}
                                </div>

                                <div className="flex flex-col">
                                  <span className={`text-sm font-medium transition-colors
                                    ${isCompleted ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-black"}
                                  `}>
                                    {lesson.title}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                   ))
               ) : (
                   <div className="p-10 text-center text-slate-400 text-sm">Belum ada materi yang diunggah.</div>
               )}
             </div>
           </div>

           {/* Instructor */}
           <div className="bg-white border border-gray-200 p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="h-24 w-24 bg-slate-900 rounded-full flex items-center justify-center text-white text-3xl font-black italic shadow-lg">AI</div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Tim AiEdu</h3>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Official Instructor</p>
                 <p className="text-slate-600 text-sm leading-relaxed">Kami adalah tim praktisi industri yang berdedikasi untuk mencetak talenta digital baru.</p>
              </div>
           </div>

           {/* ✅ BAGIAN REVIEW (BARU) */}
           <div id="reviews">
              <h2 className="text-2xl font-black mb-6 text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                  <Star className="text-amber-500" /> Ulasan Siswa
              </h2>

              {/* Form Review (Hanya jika user login) */}
              {user && (
                  <ReviewForm courseId={course.id} existingReview={userReview} />
              )}

              {/* List Review */}
              <div className="mt-8 space-y-6">
                {course.reviews.length > 0 ? (
                    course.reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
                            {/* Avatar */}
                            <div className="shrink-0">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                    <Image 
                                        src={review.user.avatar || `https://ui-avatars.com/api/?name=${review.user.name || "User"}`}
                                        alt={review.user.name || "User"}
                                        width={40} height={40}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                            {/* Content */}
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{review.user.name || "Siswa AiEdu"}</h4>
                                <div className="flex items-center gap-1 text-amber-400 my-1">
                                    {Array.from({length: review.rating}).map((_, i) => (
                                        <Star key={i} size={12} fill="currentColor" />
                                    ))}
                                </div>
                                <p className="text-slate-600 text-sm italic">"{review.comment}"</p>
                                <p className="text-xs text-slate-400 mt-2">{new Date(review.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 italic text-sm">Belum ada ulasan. Jadilah yang pertama!</p>
                    </div>
                )}
              </div>
           </div>

        </div>

        {/* === KOLOM KANAN (STICKY) === */}
        <div className="relative">
          <div className="sticky top-24 bg-white border-2 border-slate-100 shadow-2xl rounded-[2rem] overflow-hidden p-2">
              <div className="relative aspect-video bg-slate-100 rounded-[1.5rem] overflow-hidden group">
                 <img 
                    src={course.thumbnail || "/placeholder.png"} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                 />
                 {!isEnrolled && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <Lock className="text-white drop-shadow-md" size={48} />
                    </div>
                 )}
              </div>

              <div className="p-6 space-y-6">
                 {!isEnrolled && (
                     <div className="flex items-end gap-3">
                        <span className="text-4xl font-black text-slate-900 italic tracking-tighter">
                           {course.price === 0 ? "GRATIS" : formatRupiah(course.price)}
                        </span>
                     </div>
                 )}

                 {isEnrolled ? (
                     <Link href={`/learning/${course.slug}`} className="block w-full">
                       <button className="w-full bg-black hover:bg-zinc-800 text-white font-black py-4 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                           Lanjut Belajar <ArrowRight size={16} />
                       </button>
                     </Link>
                 ) : (
                     <CourseEnrollButton 
                        price={course.price}
                        courseId={course.id}
                        userId={user?.id}
                        slug={course.slug}
                     />
                 )}

                 <div className="space-y-4 pt-4 border-t border-slate-50">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Includes:</h4>
                    <ul className="text-sm text-slate-600 space-y-3 font-medium">
                       <li className="flex items-center gap-3">
                         <MonitorPlay size={16} className="text-slate-400" /> <span>Akses Video Full HD</span>
                       </li>
                       <li className="flex items-center gap-3">
                         <FileText size={16} className="text-slate-400" /> <span>Materi Teks & Artikel</span>
                       </li>
                       <li className="flex items-center gap-3">
                         <Award size={16} className="text-slate-400" /> <span>Sertifikat Kelulusan</span>
                       </li>
                    </ul>
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}