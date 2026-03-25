"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { freeEnroll } from "@/app/actions/enroll"; // Pastikan path action benar
import toast from "react-hot-toast";
import { ArrowRight, Lock } from "lucide-react";

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
  userId: string | undefined;
  slug: string;
}

export const CourseEnrollButton = ({
  price,
  courseId,
  userId,
  slug
}: CourseEnrollButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    // 1. Cek Login
    if (!userId) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/sign-in"); // Sesuaikan route login kamu
      return;
    }

    setIsLoading(true);

    try {
      // 2. LOGIKA KURSUS GRATIS
      if (price === 0) {
        const res = await freeEnroll(courseId, userId);
        if (res.success) {
            toast.success("Berhasil mendaftar gratis! 🎉");
            router.refresh(); // Refresh halaman biar tombol berubah jadi "Lanjut Belajar"
        } else {
            toast.error("Gagal mendaftar.");
        }
      } else {
        // 3. LOGIKA BERBAYAR -> KE CHECKOUT
        router.push(`/checkout/${slug}`);
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`w-full font-black py-4 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs
        ${price === 0 
            ? "bg-slate-900 hover:bg-slate-800 text-white" 
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
        }
      `}
    >
      {isLoading ? (
        "Memproses..." 
      ) : price === 0 ? (
        "Daftar Gratis Sekarang"
      ) : (
        <>Beli Akses Rp {price.toLocaleString("id-ID")}</>
      )}
    </button>
  )
}