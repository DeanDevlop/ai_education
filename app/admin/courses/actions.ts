"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

// ==========================================
// 1. CREATE COURSE
// ==========================================
export async function createCourse(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const price = Number(formData.get("price"));
  const description = formData.get("description") as string;
  const thumbnail = formData.get("thumbnail") as string;

  let newCourseId = "";

  try {
    const newCourse = await prisma.course.create({
      data: { title, slug, price, description, thumbnail }
    });

    // Buat chapter pertama otomatis agar admin tidak bingung
    await prisma.chapter.create({
      data: {
        title: "Pendahuluan",
        courseId: newCourse.id
      }
    });

    newCourseId = newCourse.id;
  } catch (error) {
    console.error("Error creating course:", error);
    return { error: "Gagal membuat kursus. Pastikan Slug unik." };
  }

  // Redirect WAJIB di luar blok try-catch
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${newCourseId}/edit`);
}

// ==========================================
// 2. UPDATE COURSE
// ==========================================
export async function updateCourse(courseId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const price = Number(formData.get("price"));
  const description = formData.get("description") as string;
  const thumbnail = formData.get("thumbnail") as string;

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { title, slug, price, description, thumbnail }
    });
  } catch (error) {
    console.error("Update error:", error);
    return { error: "Gagal update data kursus." };
  }

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/edit`);
  redirect("/admin/courses");
}

// ==========================================
// 3. DELETE COURSE
// ==========================================
export async function deleteCourse(courseId: string) {
  try {
    await prisma.course.delete({
      where: { id: courseId }
    });
    revalidatePath("/admin/courses");
  } catch (error) {
    console.error("Delete error:", error);
  }
}

// ==========================================
// 4. CHAPTER ACTIONS (Create, Update, Delete)
// ==========================================
export async function createChapter(courseId: string, formData: FormData) {
  const title = formData.get("title") as string;
  if (!title) return;

  await prisma.chapter.create({
    data: { title, courseId }
  });

  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function updateChapter(chapterId: string, courseId: string, formData: FormData) {
  const title = formData.get("title") as string;

  await prisma.chapter.update({
    where: { id: chapterId },
    data: { title }
  });

  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteChapter(chapterId: string, courseId: string) {
  await prisma.chapter.delete({
    where: { id: chapterId }
  });
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

// ==========================================
// 5. LESSON ACTIONS (Materi)
// ==========================================
export async function createLesson(chapterId: string, courseId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const content = formData.get("content") as string;

  if (!title) return;

  try {
    await prisma.lesson.create({
      data: {
        title,
        chapterId,
        videoUrl: videoUrl || null,
        content: content || null,
      }
    });
  } catch (error) {
    console.error("Create lesson error:", error);
  }

  revalidatePath(`/admin/courses/${courseId}/edit`);
  redirect(`/admin/courses/${courseId}/edit`);
}