import { prisma } from '@/lib/prisma';
import RoomActions from '@/app/components/RoomActions';

export const dynamic = 'force-dynamic';

export default async function KamarPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { roomNumber: 'asc' },
    include: {
      tenants: {
        where: { isActive: true }
      }
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Manajemen Kamar</h1>
          <p style={{ color: '#6B7280' }}>
            Daftar seluruh kamar beserta status, penghuni saat ini, dan ID Meteran PLN.
          </p>
        </div>
        <a href="/kamar/tambah" style={{
          backgroundColor: '#4F46E5', color: 'white', padding: '0.75rem 1.5rem', 
          borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
        }}>
          + Tambah Kamar
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {rooms.map((room) => {
          const isOccupied = room.status !== 'KOSONG';

          return (
            <div key={room.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              borderTop: `4px solid ${isOccupied ? '#10B981' : '#F59E0B'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Kamar {room.roomNumber}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <RoomActions roomId={room.id} isOccupied={isOccupied} roomNumber={room.roomNumber} />
                  {!isOccupied && (
                    <a href={`/daftar/${room.id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#047857', textDecoration: 'none', fontWeight: 'bold', backgroundColor: '#D1FAE5', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>Link Daftar</a>
                  )}
                  <span className={`badge ${isOccupied ? 'badge-success' : 'badge-warning'}`}>
                    {room.status}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span>Harga Sendiri:</span>
                  <strong>Rp 500.000</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span>Harga Berdua:</span>
                  <strong>Rp 650.000</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderTop: '1px dashed #E5E7EB', marginTop: '0.5rem' }}>
                  <span>Meteran PLN:</span>
                  <strong style={{ color: '#2563EB' }}>{room.plnId || '-'}</strong>
                </div>
              </div>

              {isOccupied && room.tenants.length > 0 ? (
                <div style={{
                  backgroundColor: '#F3F4F6',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Dihuni oleh ({room.tenants.length} orang):</div>
                  {room.tenants.map((t, idx) => (
                    <div key={t.id} style={{ borderTop: idx > 0 ? '1px dashed #D1D5DB' : 'none', paddingTop: idx > 0 ? '0.5rem' : '0' }}>
                      <div style={{ fontWeight: '600' }}>{t.name}</div>
                      <div style={{ color: '#4B5563' }}>{t.waNumber}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  Kamar Siap Disewa
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
