"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function freeEnroll(courseId: string, userId: string) {
  try {
    // Cek apakah user sudah terdaftar
    const existing = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        }
      }
    });

    if (existing) {
      return { success: true, message: "Sudah terdaftar" };
    }

    await prisma.purchase.create({
      data: {
        userId,
        courseId,
        price: 0,
        status: "COMPLETED" 
      }
    });

    revalidatePath(`/courses/${courseId}`);
    return { success: true };

  } catch (error) {
    console.log("Enroll Error", error);
    return { error: "Gagal mendaftar kursus gratis" };
  }
}