import { prisma } from '@/lib/prisma';
import AddPaymentForm from '@/app/components/AddPaymentForm';

export const dynamic = 'force-dynamic';

export default async function TambahPembayaranPage() {
  const activeTenants = await prisma.tenant.findMany({
    where: { isActive: true },
    include: { 
      room: true,
      payments: {
        where: { paymentType: 'SEWA' },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div>
      <h1 className="page-title">Catat Pembayaran Masuk</h1>
      <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
        Pilih penghuni dan catat tagihan bulanan atau deposit kunci. Kwitansi akan langsung dikirim via WhatsApp!
      </p>

      {activeTenants.length === 0 ? (
        <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '1rem', borderRadius: '8px' }}>
          Belum ada penghuni aktif di sistem. Silakan tambah penghuni terlebih dahulu.
        </div>
      ) : (
        <AddPaymentForm activeTenants={activeTenants} />
      )}
    </div>
  );
}
