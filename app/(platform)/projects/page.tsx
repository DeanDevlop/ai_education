"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Code2, Layout, Plus, Search, User, BookOpen, Zap, ArrowRight, X } from "lucide-react";
import AddProjectModal from "@/components/AddProjectModal";
import toast from "react-hot-toast";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const filteredProjects = projects.filter((p) => {
    const matchesFilter = !selectedFilter || p.tools?.toLowerCase().includes(selectedFilter.toLowerCase());
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery) || 
                          p.description?.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const fetchPublicProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles (
            name
          )
        `)
        .or('visibility.eq.public,is_public.eq.true') 
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("CATCH ERROR:", error);
      toast.error("Gagal memuat showcase");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicProjects();
  }, [fetchPublicProjects]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4 md:px-8"> 
      {/* Container diperlebar agar muat 4 kolom dengan lega */}
      
      {/* --- HEADER (Brutalist Style) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tighter uppercase italic">Showcase Projek</h1>
          <p className="text-sm text-gray-500 font-medium italic">Inspirasi karya nyata dari komunitas belajar AiEdu.</p>
        </div>
        
        <div className="flex gap-4">
          <Link 
            href="/projects/my-projects"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-black text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            Workspace Saya
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <Plus size={16} /> Submit Karya
          </button>
        </div>
      </div>

      {/* --- FILTER TOOLS --- */}
      <div className="bg-white p-2 border-2 border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto p-1 scrollbar-hide">
            <button 
            onClick={() => setSelectedFilter(null)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${!selectedFilter ? 'bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]' : 'bg-white text-gray-500 border-transparent hover:border-slate-200'}`}
            >
            Semua
            </button>
            {['Next.js', 'React', 'Tailwind', 'Supabase', 'Python','MySQL','OpenAI','Gemini AI','GitHub','TypeScript',].map((tool) => (
            <button
                key={tool}
                onClick={() => setSelectedFilter(tool)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 whitespace-nowrap ${selectedFilter === tool ? 'bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]' : 'bg-white text-gray-500 border-transparent hover:border-slate-200'}`}
            >
                {tool}
            </button>
            ))}
        </div>
      </div>

      {searchQuery && (
        <div className="flex items-center justify-between bg-black text-white p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(59,130,246,1)]">
            <div className="flex items-center gap-3">
                <Search size={18} className="text-blue-400" />
                <p className="text-xs font-bold uppercase tracking-tight">
                    Results for: <span className="italic text-blue-400">"{searchQuery}"</span> 
                    <span className="ml-2 opacity-50 font-medium">({filteredProjects.length} found)</span>
                </p>
            </div>
            <button 
                onClick={() => router.push(pathname)} 
                className="text-[10px] font-black bg-white text-black px-3 py-1.5 rounded-lg hover:bg-blue-400 transition-colors uppercase"
            >
                Clear <X size={12} className="inline ml-1" />
            </button>
        </div>
      )}

      {/* --- GRID PROJEK (UPDATED: COMPACT 4 COLUMNS) --- */}
      {isLoading ? (
        // Grid Skeleton: Diperkecil jadi 4 kolom
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-72 bg-slate-50 rounded-[2rem] animate-pulse border-2 border-slate-100" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        // Grid Content: Diperkecil jadi 4 kolom di layar besar (xl)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((p) => (
            <Link href={`/projects/${p.id}`} key={p.id} className="group">
              <div className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden hover:border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
                
                {/* Thumbnail Area: Diperkecil (h-40) agar lebih landscape & compact */}
                <div className="h-40 bg-slate-50 relative flex items-center justify-center border-b-2 border-slate-100 overflow-hidden">
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                        <BookOpen size={32} className="text-slate-200 group-hover:text-black transition-colors" />
                    </div>
                  )}
                  
                  {/* Tools Overlay: Lebih kecil */}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 pr-4">
                    {p.tools?.split(',').slice(0, 2).map((t: string) => (
                      <span key={t} className="bg-black text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-md">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Konten Card: Padding diperkecil (p-5) */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                         <User size={8} fill="currentColor" />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate">
                         {p.profiles?.name || "Unknown"}
                      </span>
                  </div>

                  {/* Judul lebih kecil sedikit agar muat */}
                  <h3 className="font-black text-lg text-slate-900 mb-2 line-clamp-1 uppercase italic tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h3>
                  
                  <p className="text-[10px] text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed font-medium">
                    {p.description || "Inovasi karya nyata dari komunitas belajar AiEdu."}
                  </p>
                  
                  {/* Footer Card */}
                  <div className="pt-4 border-t border-slate-50 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-500">
                        <Zap size={12} fill="currentColor" />
                        <span className="text-[9px] font-black text-black uppercase">Showcase</span>
                    </div>
                    
                    <div className="bg-slate-50 p-1.5 rounded-lg group-hover:bg-black group-hover:text-white transition-all">
                        <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-white border-4 border-dashed border-slate-100 rounded-[3rem]">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Layout size={32} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">No Projects</h3>
          <p className="text-slate-400 text-xs font-medium italic mt-1 text-center max-w-xs">Be the first to inspire!</p>
        </div>
      )}

      <AddProjectModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchPublicProjects(); 
        }} 
        userId={""}
      />
    </div>
  );
}