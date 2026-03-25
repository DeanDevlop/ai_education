"use server";

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export async function deleteProject(projectId: string, userId: string) {
  try {

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", userId);

    if (error) throw error;

    revalidatePath("/platform/projects");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "Gagal menghapus projek." };
  }
}