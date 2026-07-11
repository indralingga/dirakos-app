"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WAPage() {
  const [status, setStatus] = useState({ isReady: false, qrCodeData: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/wa/status', { cache: 'no-store' });
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f4f7f6',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#2d3748', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Bot WA DIRA KOS</h1>
        
        {loading ? (
          <p style={{ color: '#718096' }}>Memuat status sistem...</p>
        ) : status.isReady ? (
          <div style={{
            backgroundColor: '#c6f6d5',
            color: '#276749',
            padding: '1rem',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>
            ✅ Bot WhatsApp Aktif!
          </div>
        ) : (
          <div>
            <div style={{
              backgroundColor: '#feebc8',
              color: '#c05621',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              Bot terputus. Buka WA Anda di HP, pilih "Tautkan Perangkat", lalu scan QR Code ini.
            </div>
            
            {status.qrCodeData ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(status.qrCodeData)}`} 
                  alt="QR Code" 
                  style={{ borderRadius: '8px', border: '4px solid #edf2f7' }}
                />
              </div>
            ) : (
              <div style={{
                height: '250px',
                backgroundColor: '#edf2f7',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{ color: '#a0aec0', marginBottom: '0.5rem' }}>Menyiapkan QR Code...</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e0' }}>Biasanya butuh 15-30 detik</div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
          <Link href="/" style={{ color: '#3182ce', textDecoration: 'none' }}>
            &larr; Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
