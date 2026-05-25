import { db } from '@/lib/db';
import { currentProfile } from '@/lib/current-profile';

const BadgesPage = async () => {
  const profile = await currentProfile();

  if (!profile || !profile.id) {
    // Handle case where user is not logged in or profile ID is missing
    return <div>Silakan login untuk melihat lencana Anda.</div>;
  }

  const userBadges = await db.userBadge.findMany({
    where: {
      userId: profile.id,
    },
    include: {
      badge: true,
    },
  });

  // ... rest of the component logic
  return (
    <div>
      <h1>Lencana Anda</h1>
      {userBadges.length === 0 ? (
        <p>Anda belum memiliki lencana.</p>
      ) : (
        <ul>
          {userBadges.map((userBadge) => (
            <li key={userBadge.id}>{userBadge.badge.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BadgesPage;