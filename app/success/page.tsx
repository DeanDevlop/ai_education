// app/success/page.tsx
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans text-center">
      
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle size={64} className="text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pembayaran Sukses!</h1>
        <p className="text-gray-500 mb-8">
          Terima kasih sudah mendaftar. Kelas kamu sudah aktif dan siap untuk dipelajari.
        </p>

        <div className="space-y-3">
          <Link 
  href="/learning/react-basic"  // <-- Contoh langsung ke kelasnya
  className="..."
>
  Mulai Belajar (Demo)
</Link>
          
          <Link 
            href="/course/react-basic" 
            className="block w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Kembali ke Detail Kursus
          </Link>
        </div>
      </div>

    </div>
  );
}