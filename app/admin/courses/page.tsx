import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus, Edit, BookOpen, Trash2, Users } from "lucide-react";
import { deleteCourse } from "./actions";

const prisma = new PrismaClient();

export default async function AdminCoursesPage() {
  // Ambil data kursus beserta hitungan murid & chapter
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
        _count: { 
            select: { enrollments: true, chapters: true } 
        } 
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
           <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Course Manager</h1>
           <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-widest">Kelola materi pembelajaran</p>
        </div>
        <Link href="/admin/courses/new" className="bg-black text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-slate-800 transition shadow-lg hover:shadow-xl active:scale-95">
           <Plus size={16} /> Tambah Kursus
        </Link>
      </div>

      {/* LIST KURSUS */}
      <div className="grid gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white border-2 border-slate-50 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between hover:border-black transition group gap-6">
             
             <div className="flex items-center gap-6 w-full md:w-auto">
                {/* Thumbnail */}
                <div className="h-20 w-32 bg-slate-100 rounded-2xl overflow-hidden relative shadow-inner shrink-0">
                   <img src={course.thumbnail} alt="" className="object-cover w-full h-full" />
                </div>
                
                {/* Info */}
                <div>
                   <h3 className="font-black text-xl text-slate-900 uppercase italic tracking-tight">{course.title}</h3>
                   <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">
                        Rp {course.price.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <BookOpen size={12} /> {course._count.chapters} Chapters
                      </span>
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">
                        <Users size={12} /> {course._count.enrollments} Siswa
                      </span>
                   </div>
                </div>
             </div>
             
             {/* Actions */}
             <div className="flex gap-3 w-full md:w-auto justify-end">
                {/* Tombol Edit (Nanti diarahkan ke halaman edit chapter) */}
                <Link href={`/admin/courses/${course.id}/edit`} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition border border-slate-100">
                   <Edit size={20} />
                </Link>

                {/* Tombol Hapus */}
               <form action={deleteCourse.bind(null, course.id)}>
    <button 
        type="submit"
        className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition border border-slate-100"
        title="Hapus Kursus"
    >
        <Trash2 size={20} />
    </button>
</form>
             </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
             <BookOpen className="mx-auto text-slate-300 mb-4 opacity-50" size={64} />
             <p className="text-slate-400 font-black uppercase text-sm tracking-widest">Belum ada kursus tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}