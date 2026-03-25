import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr"; // Butuh cek user login
import { cookies } from "next/headers";
import { CoursePlayerClient } from "./_components/course-card";

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}

export default async function LearningPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lessonId } = await searchParams;

  // 1. Ambil User Login (PENTING untuk progress)
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  // 2. Ambil Data Course + Lesson + UserProgress
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      chapters: {
        include: {
          lessons: {
            include: {
              userProgress: {
                where: { userId: user.id } // Ambil status user ini aja
              }
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!course) return redirect("/");

  // 3. Tentukan Lesson Aktif
  let activeLesson = null;
  if (lessonId) {
    activeLesson = course.chapters.flatMap((c) => c.lessons).find((l) => l.id === lessonId);
  } else {
    activeLesson = course.chapters[0]?.lessons[0];
  }

  // --- 🔥 LOGIC HITUNG PERSEN ---
  const allLessons = course.chapters.flatMap((c) => c.lessons); // Gabung semua lesson jadi 1 list
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((lesson) => 
    lesson.userProgress.some((p) => p.isCompleted) // Cek yg isCompleted = true
  ).length;

  const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  // -----------------------------

  // Cek apakah lesson yg sedang dibuka ini sudah selesai?
  const isCurrentLessonCompleted = activeLesson?.userProgress?.[0]?.isCompleted || false;

  return (
    <CoursePlayerClient 
      course={course} 
      activeLesson={activeLesson}
      progress={progressPercentage} // Kirim persen ke client
      isCompleted={isCurrentLessonCompleted} // Kirim status lesson ini
      userId={user.id}
    />
  );
}