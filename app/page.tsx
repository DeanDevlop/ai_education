"use client";
import Link from "next/link";
import { 
  ArrowRight, 
  Bot, 
  BrainCircuit, 
  Zap, 
  CheckCircle2, 
  Globe 
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <span>AiEdu.</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#" className="hover:text-black transition-colors">Fitur</Link>
            <Link href="#" className="hover:text-black transition-colors">Metode</Link>
            <Link href="#" className="hover:text-black transition-colors">Harga</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black px-4 py-2">
              Masuk
            </Link>
            <Link href="/dashboard" className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all flex items-center gap-2">
              Daftar Gratis <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        
        {/* Badge Kecil */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Generasi Baru AI Education 2026
        </div>

        {/* Headline Utama */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight max-w-4xl mx-auto">
          Belajar Lebih Cepat dengan <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Asisten Personal AI
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Platform edukasi adaptif yang menyesuaikan kurikulum dengan kecepatan belajarmu. 
          Tanpa batas, tanpa biaya tersembunyi.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="h-12 px-8 rounded-full bg-black text-white font-medium flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-blue-900/10">
            Mulai Sekarang
          </Link>
          <Link href="#" className="h-12 px-8 rounded-full border border-gray-200 text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            Lihat Demo
          </Link>
        </div>

        {/* Stats Sederhana */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-8 md:gap-16 text-gray-400 grayscale opacity-70">
          <div className="flex items-center gap-2"><Globe size={18}/> 10k+ Pelajar</div>
          <div className="flex items-center gap-2"><CheckCircle2 size={18}/> Kurikulum Terakreditasi</div>
          <div className="flex items-center gap-2"><Zap size={18}/> Powered by Gemini 2.0</div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Kurikulum Adaptif</h3>
              <p className="text-gray-500 leading-relaxed">
                AI menganalisis kelemahanmu dan menyusun materi yang tepat. Tidak ada lagi belajar materi yang sudah kamu kuasai.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6">
                <Bot size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Tutor AI 24/7</h3>
              <p className="text-gray-500 leading-relaxed">
                Bingung tengah malam? Tanyakan apa saja pada asisten AI yang siap menjawab dengan konteks materi yang sedang dipelajari.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Analisis Performa</h3>
              <p className="text-gray-500 leading-relaxed">
                Dashboard real-time dengan data mendalam tentang progres belajar, prediksi nilai, dan area pengembangan.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER SIMPLE --- */}
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <Bot size={20} /> AiEdu.
          </div>
          <p className="text-sm text-gray-500">© 2026 AiEdu Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-black">Privacy</Link>
            <Link href="#" className="hover:text-black">Terms</Link>
            <Link href="#" className="hover:text-black">Twitter</Link>
          </div>
        </div>
      </footer>
      
    </div>
  );
}