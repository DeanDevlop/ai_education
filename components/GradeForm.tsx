"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { gradeSubmission } from "@/app/admin/actions";
import toast from "react-hot-toast";

export default function GradeForm({ subId, currentScore }: { subId: string, currentScore: number }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    const score = Number(formData.get("score"));
    
    setLoading(true);
    const idToast = toast.loading("Mengupdate skor...");

    try {
      const res = await gradeSubmission(subId, score);
      if (res.success) {
        toast.success("Skor berhasil diperbarui!", { id: idToast });
      } else {
        toast.error("Gagal update skor", { id: idToast });
      }
    } catch (err) {
      toast.error("Terjadi kesalahan", { id: idToast });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form 
      action={handleSubmit}
      className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors"
    >
      <div className="flex flex-col">
        <label className="text-[8px] font-black uppercase text-slate-400 ml-1 italic">Assign Score</label>
        <input 
          name="score"
          type="number" 
          defaultValue={currentScore}
          className="w-24 bg-transparent text-xl font-black outline-none text-slate-900"
        />
      </div>
      <button 
        disabled={loading}
        type="submit"
        className="bg-black text-white p-3 rounded-xl hover:bg-emerald-600 transition-all active:scale-90 shadow-lg disabled:opacity-50"
      >
        <Check size={20} />
      </button>
    </form>
  );
}