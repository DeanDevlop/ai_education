import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Search, ArrowRight, Star, Zap, Eye, Layers, Users } from "lucide-react";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const query = (await searchParams).search || "";
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // 1. Ambil Course BESERTA Reviews-nya
  // Kita include 'reviews' agar bisa menghitung rata-rata rating
  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
      // Filter opsional: Hanya tampilkan yang isPublished: true (jika kolomnya ada)
      // isPublished: true, 
    },
    include: {
        chapters: true,
        // Ambil data review (cukup rating-nya saja biar ringan)
        reviews: {
            select: { rating: true }
        },
        _count: {
            select: { enrollments: true }
        }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalCourses = await prisma.course.count();

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tighter uppercase italic">Explore Courses</h1>
          <p className="text-sm text-gray-500 font-medium italic">Upgrade your skills with industrial grade curriculum.</p>
        </div>
        
        <div className="hidden md:flex items-center gap-3 bg-white border border-amber-100 p-2 pr-5 rounded-full shadow-md">
          <div className="bg-amber-500 p-2 rounded-full text-white shadow-lg">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase leading-none">Total Library</p>
            <p className="text-sm font-black text-black leading-none uppercase italic">
                {totalCourses} Classes Available
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      {query && (
        <div className="flex items-center justify-between bg-black text-white p-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-blue-400" />
            <p className="text-sm font-bold uppercase tracking-tight">
              Results for: <span className="italic text-blue-400">"{query}"</span>
            </p>
          </div>
          <Link href="/course" className="text-[10px] font-black bg-white text-black px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors uppercase">
            Clear
          </Link>
        </div>
      )}

      {/* GRID COURSES */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            
            // 🔥 LOGIKA HITUNG RATA-RATA (DINAMIS) 🔥
            // Menjumlahkan semua bintang dari review
            const totalStars = course.reviews.reduce((acc, review) => acc + review.rating, 0);
            const reviewCount = course.reviews.length;
            
            // Hitung rata-rata: Total Bintang / Jumlah Orang
            // Jika belum ada review, tampilkan "New"
            const averageRating = reviewCount > 0 ? (totalStars / reviewCount).toFixed(1) : "New";

            return (
                <div key={course.id} className="group bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden hover:border-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 flex flex-col h-full">
                    
                    {/* Thumbnail */}
                    <div className="h-52 relative bg-slate-100 border-b-2 border-slate-100 overflow-hidden">
                        <img 
                          src={course.thumbnail || `https://placehold.co/600x400/png?text=${encodeURIComponent(course.title)}`} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg ${course.price === 0 ? "bg-green-500 text-white" : "bg-black text-white"}`}>
                            {course.price === 0 ? "Free Access" : "Premium"}
                          </span>
                        </div>
                    </div>

                    {/* Konten Card */}
                    <div className="p-7 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-3">
                            
                            {/* TAMPILAN RATING DINAMIS */}
                            <div className="flex items-center gap-1 text-amber-500" title={`${reviewCount} Reviews`}>
                              <Star size={14} fill="currentColor" />
                              <span className="text-xs font-black text-black">
                                {averageRating}
                              </span>
                              {/* Tampilkan jumlah voter dalam kurung jika ada */}
                              {reviewCount > 0 && (
                                <span className="text-[10px] text-slate-400 font-bold">({reviewCount})</span>
                              )}
                            </div>

                            {/* Info Murid */}
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Users size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {course._count.enrollments} Students
                                </span>
                            </div>
                        </div>

                        <h3 className="font-black text-xl text-slate-900 mb-3 line-clamp-2 uppercase italic tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                            {course.title}
                        </h3>
                        
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1 font-medium leading-relaxed italic">
                            {course.description || "Master this technology with our hands-on industrial curriculum."}
                        </p>

                        <div className="flex items-center gap-4 mb-6 border-t border-b border-slate-50 py-3">
                            <div className="flex items-center gap-1.5 text-slate-400" title="Modules">
                                <Layers size={14} />
                                <span className="text-[10px] font-bold">{course.chapters.length} Modules</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400" title="Views">
                                <Eye size={14} />
                                {/* Menggunakan data views asli dari DB */}
                                <span className="text-[10px] font-bold">{course.views} Views</span>
                            </div>
                        </div>
                        
                        <div className="mt-auto">
                            <Link 
                                href={`/course/${course.slug}`} // Pastikan pakai slug
                                className="flex items-center justify-between w-full p-4 bg-slate-50 rounded-2xl group/btn hover:bg-black transition-all duration-300"
                            >
                                <span className="text-[11px] font-black uppercase tracking-widest group-hover/btn:text-white transition-colors">
                                  Start Learning
                                </span>
                                <div className="bg-white p-2 rounded-xl group-hover/btn:bg-blue-500 group-hover/btn:text-white transition-all">
                                  <ArrowRight size={18} />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white border-4 border-dashed border-slate-100 rounded-[4rem]">
            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Search size={40} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">No Match Found</h3>
            <p className="text-slate-400 text-sm font-medium italic mt-2">Try different keywords.</p>
        </div>
      )}
    </div>
  );
}