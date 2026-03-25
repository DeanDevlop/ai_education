import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Settings, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "./ProfileForm"; 



export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Ambil data user lengkap
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
  });

  return (
    // Style background disesuaikan dengan tema Dashboard (Putih/Abu)
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Back */}
        <div className="flex items-center gap-2 mb-8">
            <Link href="/dashboard" className="p-2 hover:bg-white rounded-full transition text-gray-500 hover:text-black">
                <ChevronLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Settings className="text-gray-400" /> Pengaturan Akun
            </h1>
        </div>

        {/* ✅ UPDATE DISINI: Oper data tambahan ke ProfileForm */}
        <ProfileForm 
            initialName={userData?.name || ""} 
            email={userData?.email || ""}
            
            // Data baru (Pastikan schema.prisma sudah diupdate ya!)
            initialHeadline={userData?.headline || ""}
            initialPhone={userData?.phone || ""}
            initialLocation={userData?.location || ""}
            initialBio={userData?.bio || ""}
        />
        
      </div>
    </div>
  );
}