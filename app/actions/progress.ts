"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function toggleProgress(lessonId: string, userId: string, isCompleted: boolean, courseSlug: string) {
  try {
    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        }
      },
      update: {
        isCompleted: isCompleted // Update status (jadi true/false)
      },
      create: {
        userId,
        lessonId,
        isCompleted: isCompleted // Buat baru kalau belum ada
      }
    });

    // Refresh halaman player biar progress bar nambah
    revalidatePath(`/learning/${courseSlug}`);
    
    return { success: true };
  } catch (error) {
    console.log("Progress Error", error);
    return { error: "Gagal update progress" };
  }
}