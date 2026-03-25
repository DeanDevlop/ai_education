"use client";
import { AVAILABLE_TOOLS } from "@/lib/tools-data";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { Github, Link as LinkIcon, Send, X, Image as ImageIcon } from "lucide-react";
import * as SI from 'simple-icons';

export default function AddProjectModal({ isOpen, onClose, userId }: { isOpen: boolean, onClose: () => void, userId: string }) {
  const [loading, setLoading] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const toggleTool = (toolName: string) => {
    setSelectedTools(prev => 
      prev.includes(toolName) 
        ? prev.filter(t => t !== toolName) 
        : [...prev, toolName]
    );
  };

  // Fungsi Upload Gambar ke Storage
  const uploadToStorage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-images') // Pastikan nama bucket ini benar di Supabase
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalUserId = null;

      // Ambil User ID secara otomatis
      const { data: { user } } = await supabase.auth.getUser();
      if (user) finalUserId = user.id;

      if (!finalUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) finalUserId = session.user.id;
      }

      // Fallback ke props jika tetap tidak ada
      if (!finalUserId && userId) finalUserId = userId;

      if (!finalUserId) {
        toast.error("Sesi tidak terbaca. Silakan login kembali.");
        setLoading(false);
        return;
      }

      // --- PROSES UPLOAD GAMBAR ---
      let imageUrl = "";
      if (imageFile) {
        toast.loading("Mengunggah gambar...");
        imageUrl = await uploadToStorage(imageFile);
        toast.dismiss();
      }

      // --- INSERT DATABASE ---
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const { error: insertError } = await supabase.from("projects").insert([{
        title: formData.get("title"),
        description: formData.get("description"),
        content: formData.get("content"),
        tools: selectedTools.join(", "),
        github_url: formData.get("github_url"),
        demo_url: formData.get("demo_url"),
        image_url: imageUrl,
        user_id: finalUserId,
        status: 'approved',
        visibility: 'private'
      }]);

      if (insertError) throw insertError;

      toast.success("Berhasil! Projek masuk ke Workspace.");
      onClose();
      window.location.reload();

    } catch (err: any) {
      toast.dismiss();
      console.error("DEBUG ERROR:", err);
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-slate-900">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold">Tambah Projek Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* INPUT GAMBAR */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-black transition group">
            <label className="cursor-pointer flex flex-col items-center">
              <ImageIcon className={`mb-2 ${imageFile ? 'text-blue-500' : 'text-gray-400'}`} size={24} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {imageFile ? imageFile.name : "Pilih Thumbnail Projek"}
              </span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
              />
            </label>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Judul Projek</label>
            <input required name="title" type="text" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-black outline-none" placeholder="Contoh: E-Learning AI App" />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Deskripsi Singkat</label>
            <textarea required name="description" rows={2} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-black outline-none resize-none" placeholder="Ringkasan untuk kartu projek..." />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1.5">Dokumentasi Projek (Markdown)</label>
            <textarea name="content" rows={4} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-black outline-none" placeholder="Jelaskan cara kerja, fitur, dll..." />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Tools / Tech Stack</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOOLS.map((tool) => {
                // @ts-ignore
                const iconData = SI[tool.id];
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => toggleTool(tool.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all
                      ${selectedTools.includes(tool.name) 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"}`}
                  >
                    {iconData && <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" dangerouslySetInnerHTML={{ __html: iconData.path }} />}
                    {tool.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 flex items-center gap-1"><Github size={10} /> GitHub URL</label>
              <input required name="github_url" type="url" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-black outline-none" placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 flex items-center gap-1"><LinkIcon size={10} /> Demo URL</label>
              <input name="demo_url" type="url" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-black outline-none" placeholder="https://demo.com" />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition">Batal</button>
            <button disabled={loading} type="submit" className="flex-1 py-2.5 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2">
              {loading ? "Memproses..." : <><Send size={16} /> Publikasikan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}