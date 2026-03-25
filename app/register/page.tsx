"use client";

// ✅ UPDATE IMPORT: Pakai SSR client biar aman & konsisten
import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterPage() {
  // ✅ INISIALISASI SUPABASE CLIENT DI SINI
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ✅ STATE BARU: Tambah state untuk Nama
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [strength, setStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    setStrength({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleRegister = async () => {
    // ✅ VALIDASI BARU: Cek nama
    if (!name) return toast.error("Nama lengkap harus diisi!");
    if (!email) return toast.error("Email tidak boleh kosong!");
    if (!validateEmail(email)) return toast.error("Format email tidak valid!");
    if (!Object.values(strength).every(Boolean)) return toast.error("Password belum aman!");
    if (password !== confirmPassword) return toast.error("Konfirmasi password tidak cocok!");

    const loadingToast = toast.loading("Sedang memproses...");

    // ✅ UPDATE SIGNUP: Kirim data 'full_name' ke metadata Supabase
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                full_name: name, // Ini nanti ditangkap sama SQL Trigger buat masukin ke Database Prisma
            }
        }
    });

    toast.dismiss(loadingToast);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registrasi berhasil!");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  const Requirement = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-[12px] ${met ? "text-emerald-400" : "text-gray-500"}`}>
      <div className={`h-1 w-1 rounded-full ${met ? "bg-emerald-400" : "bg-gray-600"}`} />
      <span>{label}</span>
    </div>
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1c1c1c] text-white p-6">
      <Toaster position="top-center" />

      <div className="w-full max-w-[400px] space-y-6 bg-[#232323] p-8 rounded-xl border border-[#2e2e2e] shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Buat Akun</h1>
          <p className="text-xs text-gray-400">Silakan lengkapi detail di bawah ini</p>
        </div>

        <div className="space-y-4">
          
          {/* ✅ INPUT BARU: NAMA LENGKAP */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {/* Icon User */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <input
                className="w-full bg-[#1c1c1c] border border-[#3e3e3e] rounded-lg p-3 pl-10 text-sm outline-none focus:border-emerald-500 placeholder:text-gray-600 font-medium"
                type="text"
                placeholder="Contoh: Rizky The Developer"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Input Email (KODE LAMA TETAP ADA) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <input
                className="w-full bg-[#1c1c1c] border border-[#3e3e3e] rounded-lg p-3 pl-10 text-sm outline-none focus:border-emerald-500 placeholder:text-gray-600"
                type="email"
                placeholder="Email Address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Input Password (KODE LAMA TETAP ADA) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <input
                className="w-full bg-[#1c1c1c] border border-[#3e3e3e] rounded-lg p-3 pl-10 pr-10 text-sm outline-none focus:border-emerald-500 placeholder:text-gray-600"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.399 8.044 7.432 5 12 5c4.568 0 8.601 3.044 9.964 6.678.04.108.04.22 0 .328C20.601 15.956 16.568 19 12 19c-4.568 0-8.601-3.044-9.964-6.678Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
</svg>
                )}
              </button>
            </div>

            {/* Password Requirement Box (KODE LAMA TETAP ADA) */}
            <div className={`mt-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#2e2e2e] space-y-2.5 ${password ? "block" : "hidden"}`}>
              <Requirement met={strength.length} label="Minimal 8 karakter" />
              <Requirement met={strength.upper} label="Huruf besar (A-Z)" />
              <Requirement met={strength.lower} label="Huruf kecil (a-z)" />
              <Requirement met={strength.number} label="Angka (0-9)" />
              <Requirement met={strength.symbol} label="Simbol khusus (!@#$)" />
            </div>
          </div>

          {/* Input Konfirmasi Password (KODE LAMA TETAP ADA) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <input
                className={`w-full bg-[#1c1c1c] border rounded-lg p-3 pl-10 outline-none text-sm ${
                  confirmPassword ? (password === confirmPassword ? "border-emerald-500" : "border-red-500") : "border-[#3e3e3e]"
                }`}
                type="password"
                placeholder="Konfirmasi password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleRegister}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg mt-4 shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-colors"
          >
            Daftar Akun
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#2e2e2e]"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-[#232323] px-2 text-gray-500">atau</span></div>
          </div>

          <p className="text-center text-[11px] text-gray-400">
            Sudah punya akun? <button onClick={() => router.push("/login")} className="text-emerald-500 font-bold hover:underline font-sans">Login Sekarang</button>
          </p>
        </div>
      </div>
    </main>
  );
}