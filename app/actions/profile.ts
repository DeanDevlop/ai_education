"use server";

import { PrismaClient } from "@prisma/client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 1. ACTION GANTI NAMA (Update Database Prisma)
export async function updateProfileName(formData: FormData) {
  const name = formData.get("name") as string;
  
  if (!name || name.length < 3) {
    return { error: "Nama minimal 3 karakter." };
  }

  // Setup Supabase untuk cek user yg login
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // Update di Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: { name: name },
    });

    // Update metadata di Supabase (Opsional, biar sinkron)
    await supabase.auth.updateUser({
        data: { full_name: name }
    });

    revalidatePath("/dashboard"); // Refresh halaman dashboard otomatis
    return { success: "Nama berhasil diubah!" };
  } catch (err) {
    return { error: "Gagal update profile." };
  }
}

// 2. ACTION GANTI PASSWORD (Update Auth Supabase)
export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password.length < 6) return { error: "Password minimal 6 karakter." };
  if (password !== confirm) return { error: "Konfirmasi password tidak cocok." };

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
        cookies: { 
            getAll() { return cookieStore.getAll() },
            setAll(cookiesToSet) {
                // Server Action butuh set cookie manual buat update session
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                } catch {}
            }
        } 
    }
  );

  const { error } = await supabase.auth.updateUser({ password: password });

  if (error) return { error: error.message };
  
  return { success: "Password berhasil diganti!" };
}