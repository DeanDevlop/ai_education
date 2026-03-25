// app/api/seed/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Bersihkan database dulu (biar gak duplikat kalau direfresh)
    await prisma.enrollment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    // 2. Buat User Baru
    const user = await prisma.user.create({
      data: {
        email: "rizky@example.com",
        name: "Rizky The Developer",
        avatar: "https://github.com/shadcn.png", // Gambar placeholder
      },
    });

    // 3. Buat Kursus React
    const courseReact = await prisma.course.create({
      data: {
        slug: "react-basic",
        title: "Mastering React.js: Dari Pemula Jadi Expert",
        description: "Belajar React dari nol sampai bisa bikin aplikasi web modern.",
        price: 299000,
        thumbnail: "https://placehold.co/600x400/png?text=React+Mastery",
        lessons: {
            create: [
                { title: "Intro to React" },
                { title: "Components & Props" },
                { title: "Hooks Deep Dive" }
            ]
        }
      },
    });

    // 4. Buat Kursus Next.js
    const courseNext = await prisma.course.create({
      data: {
        slug: "nextjs-mastery",
        title: "Next.js 15 App Router Fullstack",
        description: "Panduan lengkap Next.js 15 dengan Server Actions & Prisma.",
        price: 450000,
        thumbnail: "https://placehold.co/600x400/png?text=NextJS+15",
        lessons: {
            create: [
                { title: "Setup Project" },
                { title: "Routing & Layouts" },
                { title: "Database Connection" }
            ]
        }
      },
    });

    // 5. Ceritanya si User sudah beli kelas React (Enrollment)
    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseReact.id,
        progress: 65, // Ceritanya udah belajar 65%
      },
    });

    return NextResponse.json({ 
        message: "Database BERHASIL diisi! 🎉", 
        user, 
        courses: [courseReact.title, courseNext.title] 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengisi database" }, { status: 500 });
  }
}