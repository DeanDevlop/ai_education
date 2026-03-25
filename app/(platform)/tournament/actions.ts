"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function submitChallengeEntry(challengeId: string, userId: string, contentUrl: string) {
  if (!userId || !challengeId) return;

  try {
    // Gunakan upsert: Kalau belum ada -> Create, Kalau sudah ada -> Update URL-nya
    await prisma.challengeSubmission.upsert({
      where: {
        challengeId_userId: {
          challengeId,
          userId
        }
      },
      update: {
        contentUrl,
        // Reset score kalau submit ulang? Opsional. Di sini kita biarkan score tetap.
      },
      create: {
        challengeId,
        userId,
        contentUrl,
        score: 0
      }
    });

    revalidatePath("/platform/tournament");
  } catch (error) {
    console.error("Gagal submit:", error);
    throw new Error("Gagal mengirim submission.");
  }
}