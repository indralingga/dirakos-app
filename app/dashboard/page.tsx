import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const totalRooms = await prisma.room.count();
  const filledRooms = await prisma.room.count({ where: { status: { not: 'KOSONG' } } });
  const emptyRooms = totalRooms - filledRooms;
  
  const activeTenants = await prisma.tenant.count({ where: { isActive: true } });

  // Ambil transaksi yang dibayar pada bulan ini (berdasarkan tanggal sistem/createdAt)
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const thisMonthPayments = await prisma.payment.findMany({
    where: { 
      createdAt: { gte: firstDayOfMonth },
      status: 'LUNAS' 
    },
    include: {
      tenant: {
        include: { room: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalIncome = thisMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div>
      <h1 className="page-title">Dashboard DIRA KOS</h1>
      
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-title">Pendapatan Bulan Ini</div>
          <div className="stat-value success">Rp {new Intl.NumberFormat('id-ID').format(totalIncome)}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Kamar Terisi</div>
          <div className="stat-value">{filledRooms} / {totalRooms}</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Kamar Kosong</div>
          <div className="stat-value warning">{emptyRooms}</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Penghuni Aktif</div>
          <div className="stat-value">{activeTenants}</div>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: '2rem' }}>
        <h2 style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB', margin: 0 }}>Histori Pembayaran Terakhir</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal Bayar</th>
              <th>Nama Penghuni</th>
              <th>Kamar</th>
              <th>Jenis</th>
              <th>Nominal</th>
            </tr>
          </thead>
          <tbody>
            {thisMonthPayments.length > 0 ? (
              thisMonthPayments.slice(0, 5).map((payment, idx) => (
                <tr key={idx}>
                  <td>{new Date(payment.createdAt).toLocaleDateString('id-ID')}</td>
                  <td style={{ fontWeight: '500' }}>{payment.tenant.name}</td>
                  <td>Kamar {payment.tenant.room.roomNumber}</td>
                  <td><span className="badge badge-success">{payment.paymentType}</span></td>
                  <td style={{ fontWeight: 'bold' }}>Rp {new Intl.NumberFormat('id-ID').format(payment.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Belum ada pembayaran yang masuk di bulan ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
