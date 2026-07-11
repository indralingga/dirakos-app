import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const emptyRoomsCount = await prisma.room.count({ where: { status: 'KOSONG' } });
  
  const isAvailable = emptyRoomsCount > 0;
  
  // URL WhatsApp
  const phoneNumber = "6282384502003"; // Format 62
  const textMessage = isAvailable 
    ? `Halo Pak Indra, saya melihat di website bahwa DIRA KOS masih memiliki kamar kosong. Saya tertarik untuk bertanya lebih lanjut.`
    : `Halo Pak Indra, saya melihat di website DIRA KOS sedang penuh. Apakah ada waiting list atau info jika ada yang kosong?`;
    
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(textMessage)}`;

  return (
    <div style={{ 
      fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#FAFAFA', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: '#1F2937'
    }}>
      
      {/* Navbar Minimalis */}
      <nav style={{
        padding: '1.5rem 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderBottom: '1px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="DIRA KOS" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.025em' }}>DIRA KOS</span>
        </div>
        <div>
          <Link href="/login" style={{
            fontSize: '0.875rem', fontWeight: '600', color: '#6B7280', textDecoration: 'none',
            padding: '0.5rem 1rem', borderRadius: '999px', transition: 'all 0.2s'
          }}>
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 5%', textAlign: 'center' }}>
        
        {/* Ketersediaan Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '999px',
          backgroundColor: isAvailable ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${isAvailable ? '#A7F3D0' : '#FECACA'}`,
          color: isAvailable ? '#065F46' : '#991B1B',
          fontWeight: '600',
          fontSize: '0.875rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: isAvailable ? '#10B981' : '#EF4444',
            boxShadow: `0 0 8px ${isAvailable ? '#10B981' : '#EF4444'}`
          }}></span>
          {isAvailable ? `Tersedia ${emptyRoomsCount} Kamar Kosong` : 'Mohon Maaf, Kamar Penuh'}
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          fontWeight: '800', 
          lineHeight: '1.1',
          marginBottom: '1.5rem',
          letterSpacing: '-0.05em',
          background: 'linear-gradient(135deg, #111827 0%, #4B5563 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SISTEM MANAJEMEN <br/> KOS-KOSAN
        </h1>
        
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#6B7280', 
          maxWidth: '600px', 
          marginBottom: '3rem',
          lineHeight: '1.6' 
        }}>
          DIRA KOS menawarkan fasilitas lengkap, Harga Terjangkau, dan lingkungan yang tenang untuk menunjang produktivitas Anda.
        </p>

        {/* CTA Button */}
        <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 2rem',
          backgroundColor: '#25D366',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '999px',
          fontWeight: '700',
          fontSize: '1.125rem',
          boxShadow: '0 10px 15px -3px rgba(37, 211, 102, 0.3), 0 4px 6px -2px rgba(37, 211, 102, 0.15)',
          transition: 'transform 0.2s, boxShadow 0.2s',
          cursor: 'pointer'
        }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Hubungi Pemilik Kos
        </a>

        {/* Info Grid Tambahan */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          width: '100%',
          maxWidth: '800px',
          marginTop: '5rem',
          textAlign: 'left'
        }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>📍 Lokasi Strategis</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: '1.5' }}>Berada dekat dengan minimarket, pergudangan dan area perkantoran.</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>✨ Fasilitas Lengkap</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: '1.5' }}>Kamar mandi didalam, kipas angin, Kasur, Lemari, dan sistem keamanan cctv di parkiran dan area publik .</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>💼 Manajemen Digital</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: '1.5' }}>Sistem pengingat tagihan dan kwitansi dikelola otomatis untuk kenyamanan penghuni.</p>
          </div>
        </div>

      </main>

      {/* Footer Minimalis */}
      <footer style={{
        padding: '2rem 5%',
        borderTop: '1px solid #E5E7EB',
        backgroundColor: 'white',
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: '0.875rem'
      }}>
        <div style={{ marginBottom: '0.5rem', fontWeight: '500', color: '#4B5563' }}>DIRA KOS</div>
        <div>&copy; {new Date().getFullYear()} | Managed by Indra R. Lingga</div>
      </footer>
    </div>
  );
}
