import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import TenantActions from '@/app/components/TenantActions';
import { isCyclePaid, getSafeDueDate } from '@/lib/paymentUtils';

export const dynamic = 'force-dynamic';

export default async function PenghuniPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      room: true,
      payments: {
        where: { paymentType: 'SEWA' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const today = new Date();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Manajemen Penghuni</h1>
          <p style={{ color: '#6B7280' }}>Data seluruh penghuni aktif dan riwayat penghuni lama.</p>
        </div>
        <Link href="/penghuni/tambah" style={{
          backgroundColor: '#4F46E5', color: 'white', padding: '0.75rem 1.5rem', 
          borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
        }}>
          + Tambah Penghuni
        </Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kamar</th>
              <th>Tgl Masuk</th>
              <th>Deposit</th>
              <th>Status Sewa</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => {
              // Menghitung status sewa bulan ini
              let rentStatus = <span className="badge badge-warning">Cek Tagihan</span>;
              
              if (!t.isActive) {
                rentStatus = <span className="badge" style={{ backgroundColor: '#E5E7EB', color: '#4B5563' }}>Kaluar</span>;
              } else {
                // Cari tahu siklus sewa aktif saat ini berdasarkan tanggal masuk (checkInDate)
                const checkIn = new Date(t.checkInDate);
                const dueDay = checkIn.getDate();
                
                // Cari batas awal siklus sewa yang berlaku sekarang dengan aman (hindari overflow tgl 29/30/31)
                let cycleStart = getSafeDueDate(today.getFullYear(), today.getMonth(), dueDay);

                if (today.getDate() < dueDay) {
                  // Jika hari ini belum mencapai tanggal jatuh tempo bulan ini, 
                  // berarti dia masih di dalam siklus yang dimulai bulan lalu.
                  cycleStart = getSafeDueDate(today.getFullYear(), today.getMonth() - 1, dueDay);
                }

                // Cari batas awal siklus sewa BERIKUTNYA dengan aman
                let nextCycleStart = getSafeDueDate(cycleStart.getFullYear(), cycleStart.getMonth() + 1, dueDay);

                // 1. Cek Kelunasan Siklus Berjalan
                const isPaidCurrentCycle = isCyclePaid(t.payments, cycleStart);

                // 2. Cek Kelunasan Siklus Berikutnya (jika dia sudah bayar duluan untuk bulan depan)
                const isPaidNextCycle = isCyclePaid(t.payments, nextCycleStart);

                // Hitung sisa hari menuju siklus berikutnya (untuk pengingat H-3 s/d Hari H)
                const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const nextCycleStartReset = new Date(nextCycleStart.getFullYear(), nextCycleStart.getMonth(), nextCycleStart.getDate());
                
                const timeDiffToNext = nextCycleStartReset.getTime() - todayReset.getTime();
                const daysDiffToNext = Math.round(timeDiffToNext / (1000 * 60 * 60 * 24));

                if (isPaidCurrentCycle) {
                  // Jika siklus berjalan sudah lunas, cek apakah siklus berikutnya sudah dekat (H-3 s/d Hari H)
                  // dan belum dibayar
                  if (daysDiffToNext <= 3 && daysDiffToNext >= 0 && !isPaidNextCycle) {
                    if (daysDiffToNext === 0) {
                      rentStatus = <span className="badge badge-warning">Jatuh Tempo Hari Ini</span>;
                    } else {
                      rentStatus = <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>H - {daysDiffToNext}</span>;
                    }
                  } else {
                    rentStatus = <span className="badge badge-success">Lunas</span>;
                  }
                } else {
                  // Hitung keterlambatan/sisa hari berdasarkan tanggal jatuh tempo siklus saat ini
                  // Jatuh temponya adalah di awal siklus ini (jika hari ini sudah lewat)
                  const cycleStartReset = new Date(cycleStart.getFullYear(), cycleStart.getMonth(), cycleStart.getDate());
                  
                  const diffTime = todayReset.getTime() - cycleStartReset.getTime();
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  
                  if (diffDays > 0) {
                     rentStatus = <span className="badge badge-danger">Telat {diffDays} Hari</span>;
                  } else if (diffDays === 0) {
                     rentStatus = <span className="badge badge-warning">Jatuh Tempo Hari Ini</span>;
                  } else {
                     rentStatus = <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>H {diffDays}</span>;
                  }
                }
              }

              return (
                <tr key={t.id}>
                  <td style={{ fontWeight: '500' }}>
                    {t.name}
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{t.waNumber}</div>
                  </td>
                  <td><span className="badge" style={{ backgroundColor: '#E0E7FF', color: '#3730A3' }}>Kamar {t.room.roomNumber}</span></td>
                  <td>{new Date(t.checkInDate).toLocaleDateString('id-ID')}</td>
                  <td>
                    <span className={`badge ${t.depositStatus === 'LUNAS' ? 'badge-success' : 'badge-danger'}`}>
                      {t.depositStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{rentStatus}</td>
                  <td>
                    <span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {t.isActive ? 'AKTIF' : 'KELUAR'}
                    </span>
                  </td>
                  <td>
                    <TenantActions tenantId={t.id} isActive={t.isActive} tenantName={t.name} />
                  </td>
                </tr>
              );
            })}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                  Belum ada data penghuni.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
