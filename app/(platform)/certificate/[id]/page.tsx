import { PrismaClient } from "@prisma/client";
import { Award, Download, Share2, CheckVerified } from "lucide-react";
import Image from "next/image";

const prisma = new PrismaClient();

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const cert = await prisma.certificate.findUnique({
    where: { id: params.id }
  });

  if (!cert) return <div className="p-20 text-center">Sertifikat tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      
      {/* Tombol Aksi */}
      <div className="flex justify-end gap-3 no-print">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition">
          <Share2 size={16} /> Share LinkedIn
        </button>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition"
        >
          <Download size={16} /> Download PDF
        </button>
      </div>

      {/* FRAME SERTIFIKAT */}
      <div className="bg-white border-[12px] border-double border-gray-100 p-1 rounded-sm shadow-2xl relative overflow-hidden print:shadow-none print:border-gray-300">
        
        {/* Dekorasi Watermark Logo (Gunakan logo AE yang baru) */}
        <div className="absolute -right-20 -bottom-20 opacity-[0.03] rotate-12">
            <Image src="/logo-aiedu.png" alt="watermark" width={400} height={400} />
        </div>

        <div className="border border-gray-200 p-12 md:p-20 text-center space-y-10 relative z-10">
          
          {/* Header Sertifikat */}
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
                <Image src="/logo-aiedu.png" alt="AiEdu Logo" width={60} height={60} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">CERTIFICATE</h1>
            <p className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase">OF COMPLETION</p>
          </div>

          <div className="space-y-2">
            <p className="text-gray-500 italic">Sertifikat ini diberikan kepada:</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 border-b-2 border-gray-100 inline-block px-10 pb-2">
                {cert.userName}
            </h2>
          </div>

          <div className="max-w-md mx-auto">
            <p className="text-gray-600 leading-relaxed text-sm">
                Telah berhasil menyelesaikan seluruh kurikulum dan ujian kompetensi pada program kursus:
                <br />
                <span className="font-bold text-black text-lg">"{cert.courseName}"</span>
            </p>
          </div>

          {/* Footer Sertifikat (Tanda Tangan & QR) */}
          <div className="grid grid-cols-2 pt-12 gap-8 items-end">
            <div className="text-left space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Diberikan pada:</p>
                <p className="text-sm font-bold text-slate-900">
                    {new Date(cert.issuedAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
            </div>
            <div className="text-right space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID Verifikasi:</p>
                <p className="text-xs font-mono text-slate-900">{cert.certificateCode}</p>
            </div>
          </div>

          {/* Badge Lulus */}
          <div className="absolute top-10 right-10 opacity-20">
             <Award size={100} strokeWidth={1} />
          </div>
        </div>
      </div>
    </div>
  );
}