"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createChallenge(formData: FormData) {
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const reward = formData.get("reward");

  if (!title || !endDate || !startDate) return;

  try {
    // Opsional: Arsipkan lomba lama jika kamu mau cuma 1 lomba aktif
    // await prisma.challenge.updateMany({
    //     where: { status: "ACTIVE" },
    //     data: { status: "ARCHIVED" }
    // });

    await prisma.challenge.create({
      data: {
        title,
        description,
        category,
        startDate: new Date(startDate), // Konversi String ke Date
        endDate: new Date(endDate),     // Konversi String ke Date
        reward: Number(reward) || 500,  // Default 500 XP/Point
        status: "ACTIVE",
      },
    });

    revalidatePath("/admin/tournament");
    revalidatePath("/platform/tournament"); 
  } catch (error) {
    console.error("Error create challenge:", error);
    throw new Error("Gagal membuat lomba");
  }
}