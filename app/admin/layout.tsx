import { PrismaClient } from "@prisma/client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user: authUser } } = await supabase.auth.getUser();

  // 1. Cek apakah ada yang login
  if (!authUser) redirect("/login");

  // 2. Cek Role di Database
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true }
  });

  // 3. JIKA BUKAN ADMIN -> USIR KE DASHBOARD
  if (dbUser?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Jika admin, izinkan masuk
  return <>{children}</>;
}