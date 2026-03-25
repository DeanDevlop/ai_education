"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link"; // Tambahkan ini

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
       window.location.assign("/dashboard?welcome=true");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!email || !password) return toast.error("Isi semua data!");

    setIsLoading(true);
    const idToast = toast.loading("Memverifikasi...");

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success("Berhasil!", { id: idToast });
        setTimeout(() => {
          window.location.assign("/dashboard");
        }, 500);
      }
    } catch (err: any) {
      toast.error(err.message || "Email atau password salah", { id: idToast });
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1c1c1c] text-white p-6 font-sans">
      <Toaster position="top-center" />
      <div className="w-full max-w-[400px] space-y-6 bg-[#232323] p-8 rounded-xl border border-[#2e2e2e] shadow-2xl">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight uppercase italic">Login Akun</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Selamat Datang di AiEdu</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1 italic">Email</label>
            <input
              required
              className="w-full bg-[#1c1c1c] border border-[#3e3e3e] rounded-lg p-3 text-sm outline-none focus:border-emerald-500 transition-all"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 italic">Password</label>
              {/* LINK LUPA PASSWORD */}
              <Link 
                href="/forgot-password" 
                className="text-[10px] font-bold text-emerald-500 uppercase hover:text-emerald-400 transition-colors"
              >
                Lupa Password?
              </Link>
            </div>
            <input
              required
              className="w-full bg-[#1c1c1c] border border-[#3e3e3e] rounded-lg p-3 text-sm outline-none focus:border-emerald-500 transition-all"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-lg disabled:opacity-50 mt-2 shadow-lg uppercase text-xs tracking-widest transition-all active:scale-95"
          >
            {isLoading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>

        <div className="relative py-2 flex items-center justify-center">
            <div className="border-t border-[#3e3e3e] w-full absolute"></div>
            <span className="text-[10px] uppercase font-bold text-gray-500 bg-[#232323] px-3 relative z-10 italic">Atau</span>
        </div>

        <button
          type="button"
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-all text-xs uppercase"
        >
          Masuk dengan Google
        </button>

        {/* LINK REGISTER */}
        <p className="text-center text-[11px] font-medium text-gray-400 mt-4">
          Belum punya akun?{" "}
          <Link 
            href="/register" 
            className="text-emerald-500 font-bold uppercase hover:underline underline-offset-4"
          >
            Daftar Gratis
          </Link>
        </p>
      </div>
    </main>
  );
}