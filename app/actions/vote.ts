"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function toggleUpvote(projectId: string, userId: string) {
  try {
    // Cek apakah sudah ada upvote
    const existing = await prisma.upvote.findUnique({
      where: {
        userId_projectId: { userId, projectId }
      }
    });

    if (existing) {
      // Jika ada, hapus (Unlike)
      await prisma.upvote.delete({ where: { id: existing.id } });
    } else {
      // Jika belum, buat baru (Upvote)
      await prisma.upvote.create({
        data: { userId, projectId }
      });
    }

    revalidatePath("/platform/tournament");
    revalidatePath("/platform/projects");
    return { success: true };
  } catch (e) {
    return { error: "Gagal memproses vote" };
  }
}