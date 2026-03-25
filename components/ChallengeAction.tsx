"use client";

import { useState } from "react";
import { Rocket, Link as LinkIcon, Save, X, CheckCircle } from "lucide-react";
import { submitChallengeEntry } from "@/app/(platform)/tournament/actions"; // Import action user
import toast from "react-hot-toast";

interface ChallengeActionProps {
  challengeId: string;
  userId: string;
  isJoined: boolean;
  existingUrl?: string | null;
}

export default function ChallengeAction({ challengeId, userId, isJoined, existingUrl }: ChallengeActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState(existingUrl || "");

  const handleSubmit = async () => {
    if (!url) return toast.error("Link tidak boleh kosong");
    
    setIsLoading(true);
    try {
      await submitChallengeEntry(challengeId, userId, url);
      toast.success(isJoined ? "Submission diperbarui!" : "Berhasil Join Challenge!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Gagal mengirim data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. TOMBOL UTAMA */}
      {!isJoined ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center gap-3 hover:bg-emerald-400 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          <Rocket size={20} /> Join Challenge Now
        </button>
      ) : (
        <div className="flex flex-col gap-2">
           <button 
            onClick={() => setIsOpen(true)}
            className="bg-white text-slate-900 px-65 py-4 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center gap-3 hover:bg-slate-200 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <CheckCircle size={20} className="text-emerald-500" /> 
            {existingUrl ? "Update Submission" : "Submit Your Link"}
          </button>
          {existingUrl && <p className="text-[10px] text-emerald-400 font-bold uppercase text-center tracking-widest">Status: Submitted</p>}
        </div>
      )}

      {/* 2. MODAL FORM SUBMIT */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] border-4 border-slate-900 shadow-[16px_16px_0px_0px_#fff] overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-slate-50 p-6 border-b-2 border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-black uppercase italic tracking-tighter">
                {isJoined ? "Update Submission" : "Join Challenge"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <LinkIcon size={12}/> Link Project (GitHub/Demo)
                </label>
                <input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/username/project" 
                  className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold outline-none focus:border-black transition"
                />
                <p className="text-[10px] text-slate-400 italic">Pastikan link dapat diakses publik.</p>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-black text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "Mengirim..." : <><Save size={18} /> Kirim Submission</>}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}