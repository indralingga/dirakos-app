import { prisma } from '@/lib/prisma';
import EditRoomForm from '@/app/components/EditRoomForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditKamarPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const room = await prisma.room.findUnique({
    where: { id: params.id }
  });

  if (!room) return notFound();

  return (
    <div>
      <h1 className="page-title">Edit Data Kamar {room.roomNumber}</h1>
      <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
        Ubah harga sewa atau perbarui ID meteran PLN kamar ini.
      </p>
      
      <EditRoomForm room={room} />
    </div>
  );
}
