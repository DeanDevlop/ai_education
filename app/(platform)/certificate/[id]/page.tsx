import { db } from '@/lib/db';
import { currentProfile } from '@/lib/current-profile';
import { redirect } from 'next/navigation';

interface CertificatePageProps {
  params: {
    id: string;
  };
}

const CertificatePage = async ({ params }: CertificatePageProps) => {
  const profile = await currentProfile();

  if (!profile || !profile.id) {
    return redirect("/auth/login");
  }

  const certificate = await db.certificate.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: true,
    },
  });

  if (!certificate) {
    return redirect("/not-found");
  }

  // --- PATCH: Tambahkan pemeriksaan otorisasi ---
  if (certificate.userId !== profile.id) {
    // Jika sertifikat bukan milik pengguna yang login, tolak akses
    return redirect("/unauthorized");
  }
  // --- AKHIR PATCH ---

  return (
    <div>
      <h1>Sertifikat untuk {certificate.user.name}</h1>
      <p>ID Sertifikat: {certificate.id}</p>
      {/* Tampilkan detail sertifikat */}
    </div>
  );
};

export default CertificatePage;