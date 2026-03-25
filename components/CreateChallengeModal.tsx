"use client";

import { useState } from "react";
import { Plus, X, Save, Calendar, Target, Type, Trophy } from "lucide-react";
import { createChallenge } from "@/app/admin/tournament/actions"; 
import toast from "react-hot-toast";

export default function CreateChallengeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await createChallenge(formData);
      toast.success("Turnamen berhasil diterbitkan!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Gagal membuat turnamen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON (Gaya Brutalist) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-slate-800 transition shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <Plus size={16} /> Buat Lomba Baru
      </button>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-6 border-b-2 border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter">New Challenge</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Setup kompetisi baru</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="p-8 space-y-5">
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <Type size={12}/> Judul Lomba
                </label>
                <input 
                  name="title" 
                  required 
                  placeholder="Contoh: Hackathon AI 2026" 
                  className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold outline-none focus:border-black transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Target size={12}/> Kategori
                    </label>
                    <select name="category" className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold outline-none focus:border-black transition">
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Fullstack">Fullstack</option>
                        <option value="UI/UX">UI/UX</option>
                        <option value="AI / ML">AI / ML</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Trophy size={12}/> Reward (XP)
                    </label>
                    <input 
                    name="reward" 
                    type="number"
                    placeholder="500"
                    className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold outline-none focus:border-black transition"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Calendar size={12}/> Mulai
                    </label>
                    <input 
                    name="startDate" 
                    type="date"
                    required 
                    className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold outline-none focus:border-black transition text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Calendar size={12}/> Selesai
                    </label>
                    <input 
                    name="endDate" 
                    type="date"
                    required 
                    className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold outline-none focus:border-black transition text-sm"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                   Deskripsi & Aturan
                </label>
                <textarea 
                  name="description" 
                  rows={3}
                  required 
                  placeholder="Jelaskan detail tantangan..." 
                  className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-medium text-sm outline-none focus:border-black transition resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-black text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-900 transition shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Memproses..." : <><Save size={18} /> Publish Challenge</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}