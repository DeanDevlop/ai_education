import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { updateCourse, createChapter, deleteChapter, updateChapter } from "../../actions"; // Tambah delete & update
import { Save, ArrowLeft, Plus, GripVertical, Video, Trash2, RefreshCw } from "lucide-react"; // Tambah RefreshCw

const prisma = new PrismaClient();

// Params di Next.js 15 harus di-await
export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
        chapters: {
            include: { lessons: true },
            orderBy: { createdAt: 'asc' } // Urutkan bab dari yang pertama dibuat
        }
    }
  });

  if (!course) redirect("/admin/courses");

  return (
    <div className="max-w-7xl mx-auto pb-20 p-6 space-y-8">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/admin/courses" className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
            <ArrowLeft size={20} />
        </Link>
        <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Edit Course</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Atur konten dan detail kursus.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* KOLOM KIRI: FORM EDIT INFO DASAR */}
          <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
                  <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md">INFO</span>
                  <h2 className="font-bold text-slate-900 uppercase tracking-tight">Detail Kursus</h2>
              </div>

              <form action={updateCourse.bind(null, courseId)} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Judul</label>
                   <input name="title" defaultValue={course.title} required className="input-field" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Slug</label>
                        <input name="slug" defaultValue={course.slug} required className="input-field" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Harga</label>
                        <input name="price" type="number" defaultValue={course.price} required className="input-field" />
                    </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Thumbnail URL</label>
                   <input name="thumbnail" defaultValue={course.thumbnail} required className="input-field" />
                   {/* Preview Gambar Kecil */}
                   <div className="h-20 w-32 bg-slate-100 rounded-xl overflow-hidden mt-2">
                       <img src={course.thumbnail} className="w-full h-full object-cover opacity-80" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Deskripsi</label>
                   <textarea name="description" rows={4} defaultValue={course.description} required className="input-field resize-none" />
                </div>

                <button type="submit" className="w-full bg-black text-white p-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition">
                    Simpan Perubahan
                </button>
              </form>
          </div>

          {/* KOLOM KANAN: MANAJEMEN CHAPTER & LESSON */}
          <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">KONTEN</span>
                    <h2 className="font-bold text-slate-900 uppercase tracking-tight">Chapters & Materi</h2>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{course.chapters.length} Bab</span>
              </div>

              {/* Form Tambah Chapter Baru */}
              <form action={createChapter.bind(null, courseId)} className="flex gap-2">
                  <input 
                    name="title" 
                    required 
                    placeholder="Judul Bab Baru (misal: Pengenalan)" 
                    className="flex-1 bg-white border-2 border-slate-100 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition"
                  />
                  <button type="submit" className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 transition">
                      <Plus size={20} />
                  </button>
              </form>

             {/* List Chapter (VERSI YANG SUDAH DIPERBAIKI) */}
<div className="space-y-4">
    {course.chapters.map((chapter, index) => (
        <div key={chapter.id} className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden group hover:border-blue-200 transition-colors">
            
            {/* Header Chapter: Sekarang jadi FORM agar bisa diedit */}
            <div className="bg-slate-50 p-3 flex items-center justify-between border-b border-slate-100 gap-4">
                
                {/* Form untuk Edit Judul Chapter */}
                <form action={updateChapter.bind(null, chapter.id, courseId)} className="flex-1 flex items-center gap-3">
                    <div className="cursor-move text-slate-300 hover:text-slate-600">
                        <GripVertical size={16} />
                    </div>
                    <span className="font-black text-[10px] uppercase text-slate-400 tracking-widest shrink-0">
                        BAB {index + 1}
                    </span>
                    
                    {/* Input Judul (Langsung edit di sini) */}
                    <input 
                        name="title"
                        defaultValue={chapter.title}
                        className="flex-1 bg-transparent font-bold text-slate-900 text-sm outline-none border-b border-transparent focus:border-blue-500 transition-all placeholder:text-slate-300"
                        placeholder="Nama Bab..."
                    />
                    
                    {/* Tombol Simpan Perubahan (Muncul saat hover/fokus) */}
                    <button type="submit" className="text-slate-300 hover:text-blue-600 transition" title="Simpan Nama Bab">
                        <RefreshCw size={14} />
                    </button>
                </form>

                {/* Tombol Hapus Chapter */}
                <div className="flex gap-2 pl-2 border-l border-slate-200">
                     <form action={deleteChapter.bind(null, chapter.id, courseId)}>
                        <button type="submit" className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-red-600 transition" title="Hapus Bab">
                            <Trash2 size={16} />
                        </button>
                    </form>
                </div>
            </div>

            {/* List Lesson (Tetap sama) */}
            <div className="p-2 space-y-1">
                {chapter.lessons.length > 0 ? (
                    chapter.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                            <Video size={14} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{lesson.title}</span>
                            <span className="ml-auto text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md font-bold">VIDEO</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4">
                        <p className="text-[10px] text-slate-300 font-bold italic uppercase">Belum ada materi video</p>
                    </div>
                )}
                
               <Link 
    href={`/admin/courses/${courseId}/chapters/${chapter.id}/new`}
    className="flex items-center justify-center w-full py-3 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-dashed border-slate-200 hover:border-blue-200"
>
    <Plus size={14} className="mr-2" /> Tambah Materi (Video & Teks)
</Link>
            </div>
        </div>
    ))}

    {course.chapters.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 font-bold text-sm">Belum ada bab materi.</p>
        </div>
    )}
</div>
          </div>

      </div>

      <style>{`
        .input-field {
            width: 100%;
            background-color: #f8fafc; /* bg-slate-50 */
            border: 2px solid transparent;
            padding: 1rem;
            border-radius: 1rem;
            font-weight: 700;
            color: #0f172a; /* text-slate-900 */
            outline: none;
            transition: all 0.2s;
        }
        .input-field:focus {
            border-color: #000;
            background-color: #fff;
        }
      `}</style>
    </div>
  );
}