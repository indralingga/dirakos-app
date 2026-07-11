import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilPenghuniPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: { room: true }
  });

  if (!tenant) {
    return notFound();
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link href="/penghuni" style={{ textDecoration: 'none', color: '#4F46E5', fontWeight: 'bold' }}>
          &larr; Kembali
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Profil Penghuni</h1>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1F2937', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
            Informasi Pribadi
          </h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>Nama Lengkap</p>
              <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: 0 }}>{tenant.name}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>Kamar</p>
              <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: 0 }}>Kamar {tenant.room.roomNumber}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>Nomor WhatsApp</p>
              <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                <a href={`https://wa.me/${tenant.waNumber.startsWith('0') ? '62' + tenant.waNumber.substring(1) : tenant.waNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#047857', textDecoration: 'none' }}>
                  {tenant.waNumber} &#x2197;
                </a>
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>Tanggal Check-in</p>
              <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: 0 }}>{new Date(tenant.checkInDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>Status Penyewaan</p>
              <span className={`badge ${tenant.isActive ? 'badge-success' : 'badge-danger'}`}>
                {tenant.isActive ? 'AKTIF' : 'SUDAH CHECKOUT'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ backgroundColor: '#FEF2F2', padding: '2rem', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#991B1B', borderBottom: '1px solid #FECACA', paddingBottom: '0.5rem' }}>
              Kontak Darurat
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#B91C1C', margin: 0 }}>Nama Keluarga</p>
                <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#7F1D1D', margin: 0 }}>{tenant.emergencyName || '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#B91C1C', margin: 0 }}>Nomor WhatsApp Darurat</p>
                {tenant.emergencyWa ? (
                  <p style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                    <a href={`https://wa.me/${tenant.emergencyWa.startsWith('0') ? '62' + tenant.emergencyWa.substring(1) : tenant.emergencyWa}`} target="_blank" rel="noopener noreferrer" style={{ color: '#7F1D1D', textDecoration: 'none' }}>
                      {tenant.emergencyWa} &#x2197;
                    </a>
                  </p>
                ) : (
                  <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#7F1D1D', margin: 0 }}>-</p>
                )}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1F2937', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
              Dokumen KTP
            </h2>
            {tenant.ktpPhoto ? (
              <div style={{ textAlign: 'center' }}>
                <a href={tenant.ktpPhoto} target="_blank" rel="noopener noreferrer">
                  <img src={tenant.ktpPhoto} alt="KTP Penghuni" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                </a>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>Klik gambar untuk memperbesar</p>
              </div>
            ) : (
              <p style={{ color: '#6B7280', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
                Belum ada foto KTP yang diunggah.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
