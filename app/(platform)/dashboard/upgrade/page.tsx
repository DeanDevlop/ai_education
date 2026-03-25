"use client";

import { supabase } from "@/lib/supabaseClient";

export default function UpgradePage() {
  const upgrade = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase
      .from("profiles")
      .update({ role: "premium" })
      .eq("id", userData.user.id);

    alert("Akun berhasil di-upgrade (simulasi)");
  };

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold">Upgrade Premium</h1>
      <button
        onClick={upgrade}
        className="bg-black text-white p-2 mt-4"
      >
        Upgrade
      </button>
    </main>
  );
}