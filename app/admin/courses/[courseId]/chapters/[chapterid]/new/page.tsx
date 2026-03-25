"use client"; 

import { createLesson } from "@/app/admin/courses/actions"; 
import { ArrowLeft, Save, Plus, Trash2, Type, Video } from "lucide-react";
import Link from "next/link";
import { useState, use } from "react";

type Section = {
  subtitle: string;
  body: string;
};

export default function NewLessonPage({ params }: { params: Promise<{ courseId: string; chapterid: string }> }) {
  
  // 1. AMBIL PARAMS (Pastikan 'chapterid' huruf kecil)
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const chapterId = resolvedParams.chapterid; 

  const [sections, setSections] = useState<Section[]>([
    { subtitle: "", body: "" }
  ]);

  const addSection = () => {
    setSections([...sections, { subtitle: "", body: "" }]);
  };

  const removeSection = (index: number) => {
    if (sections.length === 1) return;
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  // Gabungkan HTML untuk disimpan ke database
  const combinedContent = sections.map(sec => `
    <h3 class="text-xl font-bold mb-2 mt-6">${sec.subtitle}</h3>
    <p class="mb-4 leading-relaxed">${sec.body}</p>
  `).join("");

  return (
    <div className="max-w-4xl mx-auto p-6 pt-10 pb-20">
       <Link href={`/admin/courses/${courseId}/edit`} className="inline-flex items-center gap-2 text-slate-500 hover:text-black mb-8 transition font-bold text-xs uppercase tracking-widest">
         <ArrowLeft size={16} /> Kembali
       </Link>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        
        <div className="bg-slate-50 border-b border-slate-100 p-10">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
                Buat Materi Baru
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                Lengkapi materi dengan Video dan Penjelasan Teks.
            </p>
        </div>

        <form action={createLesson.bind(null, chapterId, courseId)} className="p-10 space-y-8">
            
            {/* 1. JUDUL MATERI UTAMA */}
            <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-900 tracking-widest">
                    <Type size={14} /> Judul Materi Utama
                </label>
                <input 
                    name="title" 
                    required 
                    placeholder="Contoh: Pengenalan Dasar" 
                    className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl font-bold text-slate-900 outline-none focus:border-black transition text-lg"
                />
            </div>

            {/* 2. VIDEO URL (SAYA KEMBALIKAN DI SINI) */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-blue-600">
                    <Video size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Video Utama (Opsional)</span>
                </div>
                <input 
                    name="videoUrl" 
                    placeholder="Link Youtube (Misal: https://youtube.com/watch?v=...)" 
                    className="w-full bg-white border border-blue-200 p-3 rounded-xl font-medium text-sm text-slate-900 outline-none focus:border-blue-500 transition placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-400">Kosongkan jika materi ini hanya berupa teks bacaan.</p>
            </div>

            <div className="h-px bg-slate-100 w-full my-6"></div>

            {/* 3. REPEATER: SUB JUDUL & ISI TEXT */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-slate-900 tracking-widest">Konten Teks & Artikel</label>
                </div>

                {sections.map((section, index) => (
                    <div key={index} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative group transition hover:border-blue-300">
                        <div className="absolute -left-3 -top-3 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                            {index + 1}
                        </div>

                        {sections.length > 1 && (
                            <button type="button" onClick={() => removeSection(index)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition">
                                <Trash2 size={18} />
                            </button>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Sub Judul</label>
                                <input 
                                    value={section.subtitle}
                                    onChange={(e) => updateSection(index, "subtitle", e.target.value)}
                                    placeholder={`Contoh: Langkah ke-${index + 1}`}
                                    className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Isi Penjelasan</label>
                                <textarea 
                                    value={section.body}
                                    onChange={(e) => updateSection(index, "body", e.target.value)}
                                    rows={5}
                                    placeholder="Tulis penjelasannya di sini..."
                                    className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-500 transition resize-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button 
                    type="button" 
                    onClick={addSection}
                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Tambah Sub-Judul Baru
                </button>
            </div>

            <input type="hidden" name="content" value={combinedContent} />

            <div className="pt-6 border-t border-slate-100">
                <button type="submit" className="w-full bg-black text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition shadow-xl active:scale-95">
                    <Save size={18} /> Simpan Semua Materi
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}