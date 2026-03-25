// app/components/CheckoutButton.tsx
"use client";

import { Lock, Loader2, X, CreditCard, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CheckoutButtonProps {
  courseId: string;
  courseName: string;
  price: number;
}

export default function CheckoutButton({ courseId, courseName, price }: CheckoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false); // Mengatur buka/tutup popup
  const [isProcessing, setIsProcessing] = useState(false); // Mengatur loading di dalam popup
  const router = useRouter();

  // Format harga untuk tampilan
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price || 0);

  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    // 1. Simulasi Loading Bank (2 detik)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Redirect ke halaman sukses
    router.push(`/success?course=${courseId}`);
  };

  return (
    <>
      {/* --- TOMBOL UTAMA (Yang muncul di halaman Checkout) --- */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-lg transition flex justify-center items-center gap-2 shadow-lg shadow-blue-200"
      >
        <Lock size={18} /> Bayar Sekarang
      </button>

      {/* --- POPUP MODAL (Hanya muncul jika isOpen = true) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* 1. Backdrop Hitam Transparan (Bisa diklik untuk tutup) */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isProcessing && setIsOpen(false)}
          ></div>

          {/* 2. Kotak Modal Putih */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            
            {/* Header Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">Konfirmasi Pembayaran</h3>
              {!isProcessing && (
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="bg-white p-2 rounded-full shadow-sm text-blue-600">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-semibold mb-1">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-gray-900">{formattedPrice}</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed">
                Anda akan melakukan pembayaran untuk kelas <strong>"{courseName}"</strong>. 
                Pastikan saldo Anda mencukupi.
              </p>
            </div>

            {/* Footer Modal (Tombol Action) */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3">
              {/* Tombol Batal */}
              <button 
                onClick={() => setIsOpen(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
              >
                Batal
              </button>
              
              {/* Tombol Konfirmasi Bayar */}
              <button 
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 flex justify-center items-center gap-2 shadow-lg shadow-blue-200/50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    Bayar <CheckCircle size={18} />
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar Hiasan (Kalau lagi loading) */}
            {isProcessing && (
               <div className="absolute top-0 left-0 w-full h-1 bg-blue-100">
                 <div className="h-full bg-blue-600 animate-progressBar"></div>
               </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}