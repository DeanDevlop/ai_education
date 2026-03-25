"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function toggleUserStatus(userId: string, currentStatus: string) {
  const newStatus = currentStatus === "ACTIVE" ? "BANNED" : "ACTIVE";
  
  await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus }
  });

  revalidatePath("/admin");
  return { success: `User status updated to ${newStatus}` };
}
export async function gradeSubmission(submissionId: string, score: number) {
  try {
    await prisma.challengeSubmission.update({
      where: { id: submissionId },
      data: { score: score }
    });

    revalidatePath("/admin/tournament");
    revalidatePath("/tournament");
    return { success: true };
  } catch (error) {
    return { error: "Gagal mengupdate skor" };
  }
}