import { PrismaClient } from "@prisma/client";
import { ExternalLink, Trophy } from "lucide-react";
import { Toaster } from "react-hot-toast";
import GradeForm from "@/components/GradeForm"; 
import CreateChallengeModal from "@/components/CreateChallengeModal"; // <--- 1. IMPORT MODAL

const prisma = new PrismaClient();

export default async function AdminTournamentPage() {
  const submissions = await prisma.challengeSubmission.findMany({
    include: { 
      user: true, 
      challenge: true 
    },
    orderBy: { id: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 p-6">
      <Toaster position="top-center" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-6 text-black">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Review Center</h1>
          <p className="text-sm text-gray-500 font-medium mt-2">Evaluasi karya student dan kelola turnamen aktif.</p>
        </div>

        <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Entries</p>
                <p className="text-3xl font-black italic">{submissions.length}</p>
            </div>
            
            {/* 2. PASANG TOMBOL DI SINI */}
            <CreateChallengeModal /> 
        </div>
      </div>

      <div className="grid gap-6">
        {submissions.map((sub) => (
          <div key={sub.id} className="bg-white border-2 border-gray-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:border-black transition-all group shadow-sm">
            
            {/* USER INFO */}
            <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
              <div className="h-20 w-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl font-black italic shadow-xl group-hover:scale-105 transition-transform shrink-0">
                {sub.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1 overflow-hidden">
                <span className="inline-block text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter border border-emerald-100 whitespace-nowrap">
                  {sub.challenge.title}
                </span>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic truncate">{sub.user.name}</h3>
                <div className="flex items-center gap-4 pt-2">
                  {sub.contentUrl ? (
                    <a 
                      href={sub.contentUrl} 
                      target="_blank" 
                      className="text-blue-600 text-xs font-black flex items-center gap-1.5 hover:text-blue-800 uppercase tracking-widest transition-colors"
                    >
                      Buka Link Karya <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs font-bold uppercase italic opacity-50">Belum ada lampiran</span>
                  )}
                </div>
              </div>
            </div>

            {/* GRADE FORM */}
            <GradeForm subId={sub.id} currentScore={sub.score} />

          </div>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
            <Trophy className="mx-auto text-slate-200 mb-6 opacity-20" size={80} />
            <p className="text-slate-400 font-black uppercase italic tracking-widest text-lg">Belum ada submission masuk.</p>
          </div>
        )}
      </div>
    </div>
  );
}