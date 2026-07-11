import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PembayaranPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tenant: {
        include: { room: true }
      }
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Manajemen Pembayaran</h1>
          <p style={{ color: '#6B7280' }}>Riwayat transaksi pembayaran sewa dan deposit kunci.</p>
        </div>
        <Link href="/pembayaran/tambah" style={{
          backgroundColor: '#10B981', color: 'white', padding: '0.75rem 1.5rem', 
          borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
        }}>
          + Catat Pembayaran
        </Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal Transaksi</th>
              <th>Nama Penghuni</th>
              <th>Kamar</th>
              <th>Jenis</th>
              <th>Periode Sewa</th>
              <th>Nominal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.createdAt).toLocaleDateString('id-ID')}</td>
                <td style={{ fontWeight: '500' }}>{p.tenant.name}</td>
                <td>Kamar {p.tenant.room.roomNumber}</td>
                <td>{p.paymentType}</td>
                <td>{p.month}</td>
                <td style={{ fontWeight: 'bold', color: '#047857' }}>Rp {new Intl.NumberFormat('id-ID').format(p.amount)}</td>
                <td>
                  <span className={`badge ${p.status === 'LUNAS' ? 'badge-success' : 'badge-danger'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                  Belum ada data pembayaran yang tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
