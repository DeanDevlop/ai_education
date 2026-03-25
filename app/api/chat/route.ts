import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; 

export async function POST(request: Request) {
  try {
    // 1. SAFETY CHECK
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ reply: "Error JSON.", action: "NONE" });
    }

    const history = body.history || []; 
    const courseSlug = body.courseSlug || null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ reply: "API Key Error.", action: "NONE" });

    // --- 2. SIAPKAN DATA ---
    let contextMaterial = "User sedang menjelajahi website (Posisi: General).";
    let navigationData = "";

    try {
        // A. Data Kursus (Jika user SEDANG MEMBUKA halaman course spesifik)
        if (courseSlug) {
          const course = await prisma.course.findUnique({
            where: { slug: courseSlug },
            include: {
              chapters: {
                orderBy: { createdAt: 'asc' },
                include: {
                  lessons: { select: { id: true, title: true, content: true } }
                }
              }
            }
          });

          if (course) {
            let fullMaterial = "";
            course.chapters.forEach((chapter, cIdx) => {
                fullMaterial += `\nBab ${cIdx + 1}: ${chapter.title}\n`;
                chapter.lessons.forEach((lesson, lIdx) => {
                   const clean = lesson.content ? lesson.content.replace(/<[^>]*>?/gm, '') : "Video Only";
                   fullMaterial += `- [ID: ${lesson.id}] ${lesson.title}: ${clean.substring(0, 100)}...\n`;
                });
            });
            contextMaterial = `POSISI USER: Sedang di halaman kursus "${course.title}"\nMATERI LENGKAP KURSUS INI:\n${fullMaterial}`;
          }
        }

        // B. Data Navigasi Global & List Kursus (DENGAN INTIPAN MATERI PERTAMA)
        const allCourses = await prisma.course.findMany({
            select: { 
                title: true, 
                slug: true,
                // 🔥 KITA AMBIL MATERI PERTAMA DISINI BIAR AI BISA JELASIN
                chapters: {
                    orderBy: { createdAt: 'asc' },
                    take: 1, 
                    select: {
                        lessons: {
                            orderBy: { createdAt: 'asc' },
                            take: 1,
                            select: { id: true, title: true, content: true }
                        }
                    }
                }
            }
        });

        // Format Text untuk AI (Lengkap dengan Info Materi Pertama)
        const courseLinks = allCourses.map(c => {
            const firstLesson = c.chapters[0]?.lessons[0];
            let startInfo = "";
            let startLink = `/course/${c.slug}`; // Default ke halaman depan course

            if (firstLesson) {
                // Bersihkan HTML tag dikit biar enak dibaca AI
                const snippet = firstLesson.content ? firstLesson.content.replace(/<[^>]*>?/gm, '').substring(0, 100) : "Video Pembelajaran";
                
                startLink = `/learning/${c.slug}?lessonId=${firstLesson.id}`;
                startInfo = `
                   > Judul Materi Pertama: "${firstLesson.title}"
                   > Inti Materi: "${snippet}..."
                `;
            }

            return `
            - KURSUS: "${c.title}"
              Link Detail: /course/${c.slug}
              Link Mulai Belajar (Materi 1): ${startLink}
              Info Materi Pertama: ${startInfo || "Belum ada materi."}
            `;
        }).join("\n");
        
        const globalLinks = `
        - Halaman Utama / Dashboard -> /dashboard
        - Halaman Katalog Course -> /course
        - Halaman Profile -> /profile
        - Halaman My Project -> /projects/my-projects
        `;

        navigationData = `
        MENU UTAMA:
        ${globalLinks}

        DAFTAR KURSUS & MATERI PERTAMANYA:
        ${courseLinks}
        `;

    } catch (dbError: any) {
        console.error("DB Error:", dbError.message);
    }

    // --- 3. CONFIG AI (GEMINI 2.5) ---
    const modelName = "gemini-2.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const systemPrompt = `
      PERAN: Anda adalah "Pak AIBot", guru privat yang asik dan suka menjelaskan.
      
      INFORMASI NAVIGASI & MATERI:
      ${navigationData}
      
      KONTEKS POSISI USER:
      ${contextMaterial}
      
      ATURAN PENTING (BACA DENGAN TELITI):
      1. JIKA USER MINTA MULAI BELAJAR / KE MATERI PERTAMA:
         - JANGAN LANGSUNG DIAM DAN PINDAH HALAMAN.
         - BACA "Info Materi Pertama" dari data di atas.
         - JELASKAN DULU: "Oke, materi pertama adalah [Judul]. Kita akan belajar tentang [Inti Materi]. Gaspol?"
         - BARU BERIKAN JSON NAVIGASI.
      
      2. Jika user cuma minta "ke menu course" (tanpa judul) -> Arahkan ke /course.
      3. Jika user sebut Judul Kursus -> Arahkan ke /course/[slug].

      FORMAT JSON WAJIB:
      { 
        "reply": "Kalimat penjelasan guru di sini...", 
        "action": "NAVIGATE", 
        "targetUrl": "/url_tujuan" 
      }
      
      Jika tidak perlu pindah halaman, action = "NONE".
    `;

    const payload = {
      contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...history.map((msg: any) => ({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: msg.content || "" }]
          }))
      ],
      generationConfig: { responseMimeType: "application/json" }
    };

    // --- 4. KIRIM KE GOOGLE ---
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // Fallback Error
    if (data.error) {
        return NextResponse.json({ reply: `Server Google Penuh (${data.error.message})`, action: "NONE" });
    }

    // --- 5. PARSING ---
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    try {
        const parsed = JSON.parse(rawText);
        return NextResponse.json(parsed);
    } catch (e) {
        return NextResponse.json({ reply: rawText || "Halo!", action: "NONE" });
    }

  } catch (error: any) {
    console.error("CRASH:", error);
    return NextResponse.json({ reply: "System Error.", action: "NONE" });
  }
}