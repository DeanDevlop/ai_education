"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [github, setGithub] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return;

    const { error } = await supabase.from("projects").insert({
      title,
      description,
      github_url: github,
      user_id: userData.user.id,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Project dikirim, menunggu review.");
      router.push("/dashboard");
    }
  };

  return (
    <main className="p-8 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Upload Project</h1>

      <input
        className="w-full border p-2"
        placeholder="Judul Project"
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border p-2"
        placeholder="Deskripsi"
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="w-full border p-2"
        placeholder="GitHub URL"
        onChange={(e) => setGithub(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-black text-white p-2"
      >
        Kirim
      </button>
    </main>
  );
}