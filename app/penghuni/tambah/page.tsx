import { prisma } from '@/lib/prisma';
import AddTenantForm from '@/app/components/AddTenantForm';

export const dynamic = 'force-dynamic';

export default async function TambahPenghuniPage() {
  const availableRooms = await prisma.room.findMany({
    where: { 
      status: { in: ['KOSONG', 'TERISI_SENDIRI'] } 
    },
    orderBy: { roomNumber: 'asc' },
    select: { id: true, roomNumber: true, status: true }
  });

  return (
    <div>
      <h1 className="page-title">Check-in Penghuni Baru</h1>
      <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
        Isi data penghuni secara manual untuk kamar yang masih kosong.
      </p>

      {availableRooms.length === 0 ? (
        <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '8px' }}>
          Maaf, saat ini tidak ada kamar kosong yang tersedia.
        </div>
      ) : (
        <AddTenantForm availableRooms={availableRooms} />
      )}
    </div>
  );
}
