import { prisma } from '@/lib/prisma';
import SelfRegistrationForm from '@/app/components/SelfRegistrationForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PendaftaranKamarPage(props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;

  const room = await prisma.room.findUnique({
    where: { id: params.roomId, status: 'KOSONG' }
  });

  if (!room) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#991B1B', fontSize: '2rem', marginBottom: '1rem' }}>Kamar Tidak Tersedia</h1>
        <p style={{ color: '#4B5563' }}>Maaf, kamar ini sudah terisi atau tautan pendaftaran tidak valid.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '0.5rem' }}>DIRA KOS</h1>
        <p style={{ fontSize: '1.125rem', color: '#6B7280' }}>Formulir Pendaftaran Penghuni Baru</p>
      </div>

      <SelfRegistrationForm room={room} />
    </div>
  );
}
