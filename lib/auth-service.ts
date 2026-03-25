import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAuthUser() {
  const cookieStore = await cookies();
  
  // 1. Cek User ke Supabase (Pusat Data Asli)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user: authUser } } = await supabase.auth.getUser();

  // Kalau di Supabase gak login, return null
  if (!authUser) return null;

  // 2. Cek Data di Database Lokal (Prisma)
  let dbUser = await prisma.user.findUnique({
    where: { id: authUser.id }
  });

  // 3. SKENARIO A: User Baru (Belum ada di DB Lokal) -> BUAT BARU
  if (!dbUser) {
    console.log("🆕 User baru terdeteksi! Membuat data...");
    dbUser = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!, // Ambil email dari Supabase
        name: authUser.user_metadata.full_name || authUser.email?.split("@")[0],
        avatar: authUser.user_metadata.avatar_url || "",
        role: "STUDENT",
        status: "ACTIVE"
      }
    });
  } 
  
  // 4. SKENARIO B: User Ada, TAPI Email Kosong/Beda (Masalah Kamu Sekarang) -> UPDATE!
  else if (dbUser.email !== authUser.email) {
    console.log("⚠️ Email di database kosong/salah! Memperbaiki sinkronisasi...");
    
    dbUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        email: authUser.email! // Paksa update email dari Supabase ke Lokal
      }
    });
  }

  return dbUser;
}