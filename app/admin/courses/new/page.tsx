"use client";
import { useState } from "react";
import { createCourse } from "../actions";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CourseImageUpload } from "@/components/course-image-upload";

export default function NewCoursePage() {
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  return (
    <div className="max-w-3xl mx-auto pb-20 p-6">
      
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/courses" className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
            <ArrowLeft size={20} />
        </Link>
        <div>
            {/* Penanda Langkah Kecil */}
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Langkah 1: Setup Awal
            </span>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Create New Course</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
              Buat judul & harga dulu, baru isi materi video/artikel.
            </p>
        </div>
      </div>

      <form action={createCourse} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        
        {/* Title */}
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Judul Kursus</label>
           <input 
             name="title" 
             required 
             placeholder="Contoh: Mastering Next.js 15" 
             className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-black transition placeholder:text-slate-300"
           />
        </div>

        {/* Slug & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Slug (URL Unik)</label>
              <input 
                name="slug" 
                required 
                placeholder="mastering-nextjs" 
                className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-black transition placeholder:text-slate-300"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Harga (Rp)</label>
              <input 
                name="price" 
                type="number"
                required 
                placeholder="0 untuk gratis" 
                className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-black transition placeholder:text-slate-300"
              />
           </div>
        </div>

        {/* --- FITUR UPLOAD GAMBAR --- */}
        <div className="space-y-4">
           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Course Thumbnail</label>
           
           <CourseImageUpload 
             value={thumbnailUrl} 
             onChange={(url) => setThumbnailUrl(url)} 
           />
           
           {/* Input hidden agar URL-nya tetap terkirim saat form disubmit */}
           <input type="hidden" name="thumbnail" value={thumbnailUrl} />
        </div>

        {/* Description & Save Button */}
        {/* ... */}
        <button type="submit" disabled={!thumbnailUrl} className="w-full bg-black text-white p-6 rounded-[2rem] font-black text-sm uppercase tracking-widest disabled:bg-slate-300">
           Simpan Kursus
        </button>

        {/* Thumbnail */}
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Thumbnail URL</label>
           <input 
             name="thumbnail" 
             required 
             placeholder="https://..." 
             className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-black transition placeholder:text-slate-300"
           />
        </div>

        {/* Description */}
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Deskripsi Singkat</label>
           <textarea 
             name="description" 
             required 
             rows={4}
             placeholder="Jelaskan apa yang akan dipelajari..." 
             className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl font-medium text-slate-900 outline-none focus:border-black transition resize-none placeholder:text-slate-300"
           />
        </div>

        <div className="pt-4">
           {/* Update Teks Tombol */}
           <button type="submit" className="w-full bg-black text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-xl active:scale-95">
              <Save size={18} /> Simpan & Lanjut Isi Materi &rarr;
           </button>
        </div>

      </form>
    </div>
  );
}