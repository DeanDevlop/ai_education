import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; 
import { checkAndAwardBadges } from "@/lib/badgeSystem";
import AssistantBubble from "@/components/AssistantBubble"; 
import PlatformShell from "./_components/platform-shell";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Setup Supabase Auth
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // 2. Cek User Login
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 3. Logic Cek Badge (Global)
  try {
     await checkAndAwardBadges(user.id);
  } catch (e) {
     console.error("Badge Check Error:", e);
  }

  // 4. Ambil Data User (Termasuk Badge)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      users: { select: { email: true } },
      earnedBadges: { include: { badge: true } }
    },
  });

  if (!dbUser) {
    redirect("/create-profile");
  }

  // 5. Filter Badge Baru (< 10 detik)
  const newlyAwardedBadges = dbUser.earnedBadges
    .filter(ub => {
        const createdTime = new Date(ub.createdAt).getTime();
        const nowTime = Date.now();
        return (nowTime - createdTime) < 10000; 
    })
    .map(ub => ub.badge);

  // Ratakan data user
  const userData = {
    ...dbUser,
    email: dbUser.users?.email || user.email
  };

  // 6. RENDER SHELL (DIBUNGKUS FRAGMENT)
  return (
    <> {/* <--- TAMBAHKAN PEMBUNGKUS INI */}
    
      <PlatformShell user={userData} newBadges={newlyAwardedBadges}>
          {children}
      </PlatformShell>
      
      <AssistantBubble /> 
      
    </> 
  );
}