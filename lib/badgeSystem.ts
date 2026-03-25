import { prisma } from "@/lib/prisma";

export async function checkAndAwardBadges(userId: string) {
  // 1. Ambil data user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { earnedBadges: true }
  });

  if (!user) return;

  // 2. Ambil semua badge
  const allBadges = await prisma.badge.findMany();

  for (const badge of allBadges) {
    // Cek apakah sudah punya
    const hasBadge = user.earnedBadges.some(ub => ub.badgeId === badge.id);
    if (hasBadge) continue;

    // Parsing Criteria
    let criteria;
    try {
      criteria = JSON.parse(badge.criteria);
    } catch (e) {
      console.error(`[BADGE ERROR] JSON Invalid untuk badge: ${badge.name}`);
      continue;
    }

    let qualified = false;

    // --- DEBUGGING LOG (Cek Terminal VSCode kamu saat refresh) ---
    console.log(`Checking Badge: ${badge.name} | Type: ${criteria.type} | User Streak: ${user.streak}`);

    // LOGIKA PENGECEKAN
    const type = criteria.type ? criteria.type.toUpperCase() : ""; // Paksa huruf besar

    if (type === "STREAK") {
        if (user.streak >= criteria.value) qualified = true;
    } 
    else if (type === "TOTAL_POINTS") {
        if (user.totalPoints >= criteria.value) qualified = true;
    }
    else if (type === "COURSE_COUNT") {
        if (user.completedCourses >= criteria.value) qualified = true;
    }

    // BERIKAN BADGE
    if (qualified) {
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: badge.id
        }
      });
      console.log(`🎉 SELAMAT! User dapat badge: ${badge.name}`);
    }
  }
}