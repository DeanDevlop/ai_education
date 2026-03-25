"use client";

import { useState } from "react";
import { PlayCircle, CheckCircle, Menu, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toggleLessonCompletion } from "@/app/(platform)/learning/actions"; // Import action tadi
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Definisikan tipe data biar tidak error TS
type Lesson = {
  id: string;
  title: string;
  videoUrl: string;
  isCompleted: boolean; // Field tambahan dari hasil olahan data
};

type Chapter = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  slug: string;
  chapters: Chapter[];
};

export default function CoursePlayer({ 
  course, 
  userId, 
  progressCount 
}: { 
  course: Course, 
  userId: string, 
  progressCount: number 
}) {
  const router = useRouter();
  // Set lesson pertama sebagai default
  const [activeLesson, setActiveLesson] = useState<Lesson>(course.chapters[0]?.lessons[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Hitung persentase total
  const totalLessons = course.chapters.reduce((acc, chap) => acc + chap.lessons.length, 0);
  const percentage = Math.round((progressCount / totalLessons) * 100);

  const onMarkComplete = async () => {
    setIsLoading(true);
    // Toggle status (kalau sudah selesai jadi belum, dan sebaliknya)
    const newStatus = !activeLesson.isCompleted;

    const res = await toggleLessonCompletion(activeLesson.id, userId, newStatus, course.slug);
    
    if (res.success) {
      toast.success(newStatus ? "Materi Selesai! 🎉" : "Progress dibatalkan");
      // Update state lokal biar UI langsung berubah
      activeLesson.isCompleted = newStatus;
      router.refresh(); // Refresh data server untuk update sidebar & persentase
    } else {
      toast.error("Gagal menyimpan progress");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative`}>
        <div className="h-16 px-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-sm text-slate-800">Daftar Materi</h2>
          <Link href="/platform/course" className="text-xs font-semibold text-gray-500 hover:text-black">Kembali</Link>
        </div>

        <div className="flex-1 overflow-y-auto pb-20">
          {course.chapters.map((chapter, cIdx) => (
            <div key={chapter.id}>
              <div className="bg-gray-50 px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                Bagian {cIdx + 1}: {chapter.title}
              </div>
              <div>
                {chapter.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left px-4 py-3.5 flex items-start gap-3 border-l-4 transition hover:bg-gray-50
                      ${activeLesson.id === lesson.id ? "border-black bg-gray-100 text-black font-semibold" : "border-transparent text-gray-500"}
                    `}
                  >
                    <div className="mt-0.5">
                      {lesson.isCompleted ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : activeLesson.id === lesson.id ? (
                        <PlayCircle size={16} className="text-black" />
                      ) : (
                        <Lock size={16} className="text-gray-300" />
                      )}
                    </div>
                    <span className="text-sm leading-snug line-clamp-2">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md">
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-lg text-slate-800 truncate">{course.title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
            </div>
            <span className="font-bold text-black">{percentage}%</span>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 flex flex-col items-center overflow-y-auto p-4 md:p-8">
           <div className="w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-200 relative">
             <iframe 
               src={activeLesson.videoUrl} 
               className="w-full h-full" 
               title={activeLesson.title}
               allowFullScreen
             ></iframe>
           </div>

           <div className="w-full max-w-5xl mt-6 flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                 <h2 className="text-xl font-bold text-slate-900 mb-1">{activeLesson.title}</h2>
                 <p className="text-gray-500 text-sm">Tonton sampai habis lalu tandai selesai.</p>
              </div>
              <button 
                onClick={onMarkComplete}
                disabled={isLoading}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-lg
                  ${activeLesson.isCompleted 
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                    : "bg-black text-white hover:bg-gray-800"
                  }
                `}
              >
                 {isLoading ? "Menyimpan..." : activeLesson.isCompleted ? (
                   <><CheckCircle2 size={18} /> Selesai</>
                 ) : (
                   <><CheckCircle size={18} /> Tandai Selesai</>
                 )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}