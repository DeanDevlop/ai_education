"use server";

import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function submitReview(courseId: string, rating: number, comment: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // 1. Cek User Login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Kamu harus login untuk memberi ulasan." };
  }

  try {
    // 2. Cek apakah user sudah pernah review course ini?
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (existingReview) {
      // Opsi A: Error kalau sudah pernah review
      // return { error: "Kamu sudah memberikan ulasan untuk materi ini." };
      
      // Opsi B: Update review lama (Lebih ramah user)
      await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment }
      });
    } else {
      // 3. Buat Review Baru
      await prisma.review.create({
        data: {
          userId: user.id,
          courseId: courseId,
          rating: rating,
          comment: comment,
        }
      });
    }

    // 4. Refresh Halaman biar rating langsung berubah
    revalidatePath(`/course/${courseId}`);
    revalidatePath(`/course`); // Refresh halaman list juga
    
    return { success: true };

  } catch (error) {
    console.error("Gagal submit review:", error);
    return { error: "Terjadi kesalahan sistem. Coba lagi nanti." };
  }
}