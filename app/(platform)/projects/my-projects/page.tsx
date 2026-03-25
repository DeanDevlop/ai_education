"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, Globe, Lock, Plus, ExternalLink, Layout, BookOpen, Search, ArrowRight, Zap } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import AddProjectModal from "@/components/AddProjectModal";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const confirmDelete = (projectId: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-xs font-black uppercase tracking-tight text-slate-800">
          Hapus projek ini secara permanen?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-[10px] font-black uppercase bg-slate-100 rounded-lg hover:bg-slate-200 transition"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await handleDelete(projectId);
            }}
            className="px-3 py-1.5 text-[10px] font-black uppercase bg-red-600 text-white rounded-lg hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        borderRadius: '20px',
        background: '#fff',
        color: '#333',
        border: '3px solid #000',
        padding: '16px',
        boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)'
      }
    });
  };

  const handleDelete = async (id: string) => {
    const loadId = toast.loading("Menghapus data...");
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      toast.success("Projek berhasil dihapus", { id: loadId });
      fetchMyProjects();
    } catch (err) {
      toast.error("Gagal menghapus projek", { id: loadId });
    }
  };

  const fetchMyProjects = useCallback(async () => {
    setIsLoading(true);
    const getId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return user.id;
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.id || null;
    };
    const finalId = await getId();
    if (!finalId) {
      setUserId(null);
      setIsLoading(false);
      return;
    }
    setUserId(finalId);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", finalId)
      .order("created_at", { ascending: false });
    if (!error) setProjects(data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  const handleToggleVisibility = async (projectId: string, currentVisibility: string) => {
    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';
    const idToast = toast.loading("Updating status...");
    const { error } = await supabase
      .from("projects")
      .update({ visibility: newVisibility, is_public: newVisibility === 'public' })
      .eq("id", projectId)
      .eq("user_id", userId);
    if (error) {
      toast.error("Gagal update database", { id: idToast });
    } else {
      toast.success(newVisibility === 'public' ? "Project Published!" : "Project Privated", { id: idToast });
      fetchMyProjects();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tighter uppercase italic">Workspace Saya</h1>
          <p className="text-sm text-gray-500 font-medium italic">Kelola draf dan publikasikan karya nyata kamu.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          <Plus size={18} /> Tambah Projek
        </button>
      </div>

      {/* --- GRID PROJEK --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-slate-50 rounded-[2.5rem] animate-pulse border-2 border-slate-100" />
          ))}
        </div>
      ) : !userId ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white border-4 border-dashed border-slate-100 rounded-[4rem]">
          <Lock size={60} className="text-slate-200 mb-6" />
          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Akses Terbatas</h3>
          <p className="text-slate-400 text-sm font-medium italic mt-2 text-center max-w-xs mb-8">Silakan login untuk mengelola workspace pribadi Anda.</p>
          <Link href="/login" className="px-8 py-4 bg-black text-white font-black rounded-2xl uppercase italic tracking-widest text-xs hover:shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] transition-all">
            Login Sekarang
          </Link>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <div key={p.id} className="group bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden hover:border-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 flex flex-col h-full">
              
              {/* Thumbnail Area */}
              <div className="h-48 bg-slate-50 relative flex items-center justify-center border-b-2 border-slate-100 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <Layout size={48} className="text-slate-200 group-hover:text-black transition-colors" />
                )}
                
                {/* Visibility Badge Gaya Brutalist */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 shadow-sm flex items-center gap-1.5 backdrop-blur-md
                  ${p.visibility === 'public' 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                    : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                  {p.visibility === 'public' ? <Globe size={10}/> : <Lock size={10}/>}
                  {p.visibility}
                </div>
              </div>

              {/* Konten Card */}
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-amber-500" fill="currentColor" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Workspace</span>
                </div>

                <h3 className="font-black text-xl text-slate-900 mb-2 line-clamp-1 uppercase italic tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                  {p.title}
                </h3>
                
                <p className="text-xs text-slate-500 line-clamp-2 mb-6 flex-1 italic leading-relaxed">
                  {p.description || "Masterpiece in progress."}
                </p>
                
                {/* Actions Footer */}
                <div className="pt-6 border-t border-slate-50 mt-auto flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleVisibility(p.id, p.visibility)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all
                        ${p.visibility === 'public' 
                        ? "bg-white border-black text-black hover:bg-slate-50" 
                        : "bg-black border-black text-white hover:bg-zinc-800"
                      }`}
                    >
                      {p.visibility === 'public' ? "Set Private" : "Set Public"}
                    </button>
                    
                    <button 
                      onClick={() => confirmDelete(p.id)}
                      className="px-4 py-3 bg-white border-2 border-red-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <Link 
                    href={`/projects/${p.id}`} 
                    className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 border-2 border-transparent text-slate-900 text-[10px] font-black rounded-2xl hover:bg-black hover:text-white transition-all uppercase tracking-[0.2em] group/btn"
                  >
                    Pratinjau Projek <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-32 bg-white border-4 border-dashed border-slate-100 rounded-[4rem]">
          <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Layout size={40} className="text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Workspace Kosong</h3>
          <p className="text-slate-400 text-sm font-medium italic mt-2 text-center max-w-xs mb-8">Klik tombol "Tambah Projek" untuk mulai membangun portfolio digitalmu.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-black text-white font-black rounded-2xl uppercase italic tracking-widest text-xs hover:shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] transition-all"
          >
            Mulai Sekarang
          </button>
        </div>
      )}

      <AddProjectModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); fetchMyProjects(); }} 
        userId={userId || ""} 
      />
    </div>
  );
}