"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlayCircle, FileText, Menu, CheckCircle, Circle } from "lucide-react";
import toast from "react-hot-toast";
import { toggleProgress } from "@/app/actions/progress"; 
import { ArrowRight } from "lucide-react";

// ... (Fungsi getEmbedUrl tetapkan saja, tidak berubah) ...
const getEmbedUrl = (url: string | null) => {
    if (!url) return "";
    if (url.includes("/embed/")) return url;
    if (url.includes("watch?v=")) return `https://www.youtube.com/embed/${url.split("watch?v=")[1].split("&")[0]}`;
    if (url.includes("youtu.be/")) return `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
    return url; 
};

export const CoursePlayerClient = ({ 
    course, 
    activeLesson,
    progress,       // Props Baru
    isCompleted,    // Props Baru
    userId          // Props Baru
}: { 
    course: any, 
    activeLesson: any,
    progress: number,
    isCompleted: boolean,
    userId: string
}) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Logic Tombol "Tandai Selesai"
  const onToggle = async () => {
    try {
        setIsLoading(true);
        // Panggil server action
        await toggleProgress(activeLesson.id, userId, !isCompleted, course.slug);
        
        if (!isCompleted) {
            toast.success("Materi selesai! Semangat! 🔥");
        } else {
            toast.success("Status selesai dibatalkan.");
        }
        
        router.refresh(); // Refresh biar bar-nya nambah
    } catch {
        toast.error("Gagal update progress");
    } finally {
        setIsLoading(false);
    }
  }

  if (!activeLesson) return <div className="p-10 text-center">Belum ada materi.</div>;
  const embedUrl = getEmbedUrl(activeLesson.videoUrl);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      
      {/* === SIDEBAR === */}
      <div className={`${isSidebarOpen ? "w-80" : "w-0"} bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 relative shrink-0`}>
        
        <div className="p-4 border-b border-slate-200 bg-white space-y-4">
           <Link href={`/course/${course.slug}`} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black uppercase tracking-widest transition">
              <ArrowLeft size={16} /> Kembali
           </Link>

           {/* 🔥 PROGRESS BAR AREA 🔥 */}
           <div className="space-y-2">
               <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                   <span>Progress Kursus</span>
                   <span>{progress}%</span>
               </div>
               <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                   <div 
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                   />
               </div>
           </div>
        </div>

        {/* List Lesson */}
        <div className="flex-1 overflow-y-auto pb-20">
           {course.chapters.map((chapter: any, idx: number) => (
             <div key={chapter.id}>
                <div className="bg-slate-100 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                   Bagian {idx + 1}: {chapter.title}
                </div>
                <div>
                   {chapter.lessons.map((lesson: any) => {
                      const isActive = lesson.id === activeLesson.id;
                      // Cek apakah lesson di list ini sudah selesai (dari DB)
                      const isLessonDone = lesson.userProgress?.[0]?.isCompleted; 

                      return (
                        <Link 
                           key={lesson.id} 
                           href={`/learning/${course.slug}?lessonId=${lesson.id}`}
                           className={`block px-4 py-3 border-l-4 transition hover:bg-white
                             ${isActive 
                                ? "border-black bg-white shadow-sm" 
                                : "border-transparent text-slate-500 hover:text-slate-800"
                             }
                           `}
                        >
                           <div className="flex items-start gap-3">
                              {/* Icon Checklist Dinamis */}
                              <div className={`mt-0.5 ${isActive ? "text-blue-600" : isLessonDone ? "text-emerald-500" : "text-slate-400"}`}>
                                 {isLessonDone ? <CheckCircle size={16} /> : (lesson.videoUrl ? <PlayCircle size={16} /> : <FileText size={16} />)}
                              </div>
                              <span className={`text-sm font-medium leading-snug ${isActive ? "text-black font-bold" : ""} ${isLessonDone ? "line-through text-slate-400" : ""}`}>
                                {lesson.title}
                              </span>
                           </div>
                        </Link>
                      )
                   })}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col h-full relative bg-white">
         
         <div className="h-16 border-b border-slate-100 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <Menu size={20} />
               </button>
               <h1 className="font-bold text-sm md:text-lg truncate max-w-md">{activeLesson.title}</h1>
            </div>

            {/* 🔥 TOMBOL MARK AS COMPLETE 🔥 */}
            <button 
                onClick={onToggle}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition
                    ${isCompleted 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                        : "bg-black text-white hover:bg-slate-800"
                    }
                `}
            >
                {isCompleted ? (
                    <> <CheckCircle size={16} /> Selesai </>
                ) : (
                    <> <Circle size={16} /> Tandai Selesai </>
                )}
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
            <div className="max-w-4xl mx-auto space-y-8">
               {/* Video & Text Content sama seperti sebelumnya... */}
               {activeLesson.videoUrl && (
                 <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5">
                    <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={activeLesson.title} />
                 </div>
               )}

               {activeLesson.content && (
                 <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="font-black text-xl mb-6 border-b border-slate-100 pb-4">Materi Bacaan</h3>
                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                 </div>
               )}
               <div className="pt-10 pb-20">
    {(() => {
        // Cari semua lesson dari semua chapter dalam satu list datar
        const allLessons = course.chapters.flatMap((c: any) => c.lessons);
        const currentIndex = allLessons.findIndex((l: any) => l.id === activeLesson.id);
        const nextLesson = allLessons[currentIndex + 1];

        return (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl">
                <div className="space-y-1 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {nextLesson ? "Materi Berikutnya" : ""}
                    </p>
                    <h4 className="text-lg font-bold">
                        {nextLesson ? nextLesson.title : "Semua materi telah selesai!"}
                    </h4>
                </div>

                {nextLesson ? (
                    <Link 
                        href={`/learning/${course.slug}?lessonId=${nextLesson.id}`}
                        className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-colors group"
                    >
                        Lanjut Belajar
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                ) : (
                    <Link 
                        href={`/course/${course.slug}`}
                        className="flex items-center gap-3 bg-gray-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                    >
                        Selesai & Kembali
                    </Link>
                )}
            </div>
        );
    })()}
</div>
            </div>
         </div>
      </div>
    </div>
  );
};