"use client";

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(0);

  // Inisialisasi client yang lebih stabil
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Tambahkan parameter isResend disini
 
  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      handleVerifyOtp(otp.join(""));
    }
  }, [otp]);

  const handleSendOtp = async (isResend: boolean = false) => {
    if (!email) return toast.error("Masukkan email kamu!");
    setIsLoading(true);
    
    // PERBAIKAN 1: Update redirectTo ke dashboard karena /update-password sudah dihapus
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/dashboard`,
    });

    setIsLoading(false);

    if (error) {
      // PERBAIKAN 2: Tangani jika user ternyata login pakai Google
      if (error.message.includes("identity provider")) {
        toast.error("Akun ini terhubung dengan Google. Silakan login via Google.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success(isResend ? "Kode baru dikirim!" : "Kode dikirim ke email!");
    setStep(2);
    setTimer(60); 
  };

  const handleVerifyOtp = async (finalOtp: string) => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: finalOtp,
      type: 'recovery',
    });

    if (error) {
      toast.error("Kode salah atau kadaluarsa!");
      setIsLoading(false);
      setOtp(new Array(6).fill("")); 
      inputRefs.current[0]?.focus();
    } else {
      toast.success("Verifikasi berhasil!");
      // PERBAIKAN 3: Langsung ke dashboard
      router.push("/dashboard");
    }
  };
  
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1c1c1c] text-white p-6">
      <Toaster position="top-center" />
      <div className="w-full max-w-[400px] bg-[#232323] p-8 rounded-xl border border-[#2e2e2e] shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {step === 1 ? "Lupa Password" : "Verifikasi Email"}
          </h1>
          <p className="text-xs text-gray-400">
            {step === 1 ? "Masukkan email untuk menerima kode reset" : `Kode dikirim ke ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <input
                className="w-full bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg p-3 pl-10 text-sm outline-none focus:border-emerald-500"
                type="email"
                placeholder="Email Address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleSendOtp(false)} 
              disabled={isLoading}
              className="w-full bg-emerald-600 p-3 rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-emerald-500 transition-colors"
            >
              Kirim Kode Verifikasi
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el;}}
                  value={data}
                  maxLength={1}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                      inputRefs.current[index - 1]?.focus();
                    }
                  }}
                  className="w-12 h-14 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-center text-xl font-bold text-emerald-500 outline-none focus:border-emerald-500"
                />
              ))}
            </div>

            <div className="text-center space-y-4">
              <div className="text-xs text-gray-500">
                {timer > 0 ? (
                  <span>Kirim ulang dalam <b className="text-emerald-500">{timer}s</b></span>
                ) : (
                  <button 
                    onClick={() => handleSendOtp(true)} 
                    className="text-emerald-500 font-bold underline cursor-pointer"
                  >
                    Kirim Ulang
                  </button>
                )}
              </div>
              <button onClick={() => setStep(1)} className="text-[10px] text-gray-600 uppercase font-bold block w-full hover:text-white transition-colors">
                Ganti Email
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}