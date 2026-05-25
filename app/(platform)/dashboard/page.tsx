import { db } from '@/lib/db';
import { currentProfile } from '@/lib/current-profile';
import { startOfDay, endOfDay } from 'date-fns';

const DashboardPage = async () => {
  const profile = await currentProfile();

  if (!profile || !profile.id) {
    // Handle unauthorized access
    return null;
  }

  const userId = profile.id;
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  // --- PATCH: Gunakan transaksi untuk operasi atomik ---
  await db.$transaction(async (prisma) => {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastLogin: true,
        streak: true,
        totalLogins: true,
        totalPoints: true,
      },
    });

    if (!userData) {
      throw new Error("User not found");
    }

    const hasLogToday = await prisma.activity.count({
      where: {
        userId: userId,
        type: 'LOGIN',
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }) > 0;

    if (!hasLogToday) {
      // Logika untuk update streak, totalLogins, totalPoints
      let newStreak = userData.streak || 0;
      const lastLoginDate = userData.lastLogin ? startOfDay(userData.lastLogin) : null;
      const yesterday = startOfDay(new Date(today.setDate(today.getDate() - 1)));

      if (lastLoginDate && lastLoginDate.getTime() === yesterday.getTime()) {
        newStreak += 1;
      } else if (!lastLoginDate || lastLoginDate.getTime() !== startOfToday.getTime()) {
        // Reset streak if not consecutive and not already logged today
        newStreak = 1;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLogin: today,
          streak: newStreak,
          totalLogins: { increment: 1 },
          totalPoints: { increment: 10 },
        },
      });

      await prisma.activity.create({
        data: {
          userId: userId,
          type: 'LOGIN',
          description: 'User logged in',
        },
      });
    }
  });
  // --- AKHIR PATCH ---

  // Fetch data for display after updates
  const updatedUserData = await db.user.findUnique({
    where: { id: userId },
    select: {
      streak: true,
      totalLogins: true,
      totalPoints: true,
    },
  });

  // ... rest of the component logic to display data
  return (
    <div>
      <h1>Dashboard Pengguna</h1>
      <p>Streak: {updatedUserData?.streak}</p>
      <p>Total Login: {updatedUserData?.totalLogins}</p>
      <p>Total Poin: {updatedUserData?.totalPoints}</p>
    </div>
  );
};

export default DashboardPage;