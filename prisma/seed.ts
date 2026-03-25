const badges = [
  { name: "Early Bird", description: "Login pertama kali", icon: "Sun", criteria: "FIRST_LOGIN" },
  { name: "7 Day Hero", description: "Login 7 hari beruntun", icon: "Flame", criteria: "STREAK_7" },
  { name: "Creator", description: "Upload projek pertama", icon: "Layout", criteria: "FIRST_PROJECT" },
  { name: "Fast Learner", description: "Selesaikan 1 kursus", icon: "Zap", criteria: "COURSE_1" },
];

// Jalankan di script atau temporary route
for (const b of badges) {
  await prisma.badge.upsert({
    where: { id: b.criteria }, // Gunakan criteria sebagai ID unik sementara
    update: {},
    create: { id: b.criteria, ...b }
  });
}