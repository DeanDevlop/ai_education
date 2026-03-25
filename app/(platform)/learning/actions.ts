"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function toggleLessonCompletion(lessonId: string, userId: string, isCompleted: boolean, courseSlug: string) {
  try {
    await prisma.userProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: { isCompleted },
      create: {
        userId,
        lessonId,
        isCompleted
      }
    });

    revalidatePath(`/learning/${courseSlug}`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal update progress" };
  }
}