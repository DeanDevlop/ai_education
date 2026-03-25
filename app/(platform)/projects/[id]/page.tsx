"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Code2, ArrowLeft, Globe, Github, Eye, Calendar, Zap, User } from "lucide-react";
import toast from "react-hot-toast";
import CommentSection from "@/components/CommentSection";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            profiles (
              name
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        setProject(data);

        // Update View Count
        await supabase.rpc('increment_views', { row_id: id });
        setProject((prev: any) => ({
    ...prev,
    views: (prev.views || 0) + 1
}));

      } catch (error) {
        console.error("Error detail:", error);
        toast.error("Projek tidak ditemukan");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProjectData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-black"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Initializing Project Data...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Projek tidak ditemukan</h2>
        <button 
          onClick={() => router.push("/projects")} 
          className="mt-6 px-8 py-3 bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]"
        >
          Kembali ke Showcase
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      
      {/* NAVIGATION & ACTION */}
      <div className="flex items-center justify-between">
        <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>

        <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
                <Eye size={14} />
                <span className="text-[10px] font-black uppercase">{project.views || 0} Views</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase">{new Date(project.created_at).toLocaleDateString('id-ID')}</span>
            </div>
        </div>
      </div>

      <div className="bg-white border-2 border-black rounded-[3rem] overflow-hidden shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
        
        {/* HERO IMAGE SECTION */}
        <div className="h-[300px] md:h-[500px] bg-slate-50 relative border-b-2 border-black group overflow-hidden">
          {project.image_url ? (
            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-100">
              <Code2 size={120} />
            </div>
          )}
          
          {/* Badge Overlay */}
          <div className="absolute top-6 left-6">
             <div className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl">
                <Zap size={14} fill="currentColor" className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">AiEdu Featured Build</span>
             </div>
          </div>
        </div>
   
        <div className="p-8 md:p-14 space-y-10">
          
          {/* TITLE & BUTTONS */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">
                {project.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-black flex items-center justify-center text-white">
                    <User size={16} fill="currentColor" />
                </div>
                <p className="text-xs font-bold uppercase tracking-tight text-slate-500">
                    Built by <span className="text-black underline decoration-blue-500 decoration-2 underline-offset-4">{project.profiles?.name || "Kreator AiEdu"}</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {project.demo_url && (
                <a href={project.demo_url} target="_blank" className="flex items-center justify-center gap-3 bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                  <Globe size={18} /> Live Demo
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" className="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                  <Github size={18} /> Source Code
                </a>
              )}
            </div>
          </div>

          {/* TECH STACK BUBBLES */}
          <div className="flex flex-wrap gap-3">
            {project.tools?.split(',').map((t: string) => (
              <span key={t} className="bg-slate-50 px-5 py-2 rounded-xl text-[10px] font-black text-black border-2 border-slate-100 uppercase tracking-widest hover:border-black transition-colors">
                {t.trim()}
              </span>
            ))}
          </div>

          {/* DESCRIPTION SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-10 border-t-2 border-slate-50">
            <div className="lg:col-span-2 space-y-6">
                <h2 className="font-black text-black uppercase italic tracking-widest text-lg flex items-center gap-2">
                    <Zap size={20} className="text-amber-500" /> Project Brief
                </h2>
                <div className="bg-slate-50/50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg font-medium">
                    {project.description}
                    </p>
                </div>
                <CommentSection projectId={id as string} />
            </div>

            {/* SIDE INFO */}
            <div className="space-y-8">
                <div className="bg-black text-white p-8 rounded-[2.5rem] space-y-4 shadow-xl">
                    <h3 className="font-black uppercase text-xs tracking-[0.2em] text-blue-400">Project Insight</h3>
                    <p className="text-xs leading-relaxed opacity-80 italic">
                        Projek ini dibuat sebagai bagian dari eksplorasi teknologi di platform AiEdu. Dibuat dengan standar industri dan siap untuk dikembangkan lebih lanjut.
                    </p>
                </div>
                
                <div className="p-8 border-2 border-slate-100 rounded-[2.5rem]">
                    <h3 className="font-black uppercase text-xs tracking-[0.2em] mb-4">Inspiration</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase italic leading-none">
                        "Great things never came from comfort zones."
                    </p>
                </div>
                     
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}