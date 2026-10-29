"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function WAPage() {
  const [status, setStatus] = useState<{ isReady: boolean; qrCodeData: string; qrGeneratedAt?: number; statusMessage?: string }>({
    isReady: false,
    qrCodeData: '',
    statusMessage: 'Menghubungkan...'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const lastQrRef = useRef<string>('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/wa/status', { cache: 'no-store' });
      const data = await res.json();
      setStatus(data);

      if (data.qrCodeData && data.qrCodeData !== lastQrRef.current) {
        lastQrRef.current = data.qrCodeData;
        setTimeLeft(25);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown 25 detik
  useEffect(() => {
    if (!status.qrCodeData || status.isReady) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [status.qrCodeData, status.isReady]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setStatus(prev => ({ ...prev, qrCodeData: '' }));
    try {
      await fetch('/api/wa/refresh', { method: 'POST' });
    } catch (err) {
      console.error('Gagal refresh:', err);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 2500);
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f4f7f6',
      fontFamily: 'system-ui, sans-serif',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#2d3748', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Bot WA DIRA KOS
        </h1>
        <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Sistem Pengiriman Notifikasi & Kwitansi Otomatis
        </p>

        {loading ? (
          <div style={{ padding: '2rem 0' }}>
            <p style={{ color: '#718096' }}>Memuat status sistem...</p>
          </div>
        ) : status.isReady ? (
          <div style={{
            backgroundColor: '#c6f6d5',
            color: '#22543d',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #9ae6b4'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Bot WhatsApp Aktif & Terhubung!
            </div>
            <p style={{ fontSize: '0.85rem', color: '#276749', margin: 0 }}>
              Sistem siap mengirimkan bukti pembayaran & pengingat jatuh tempo.
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              backgroundColor: isExpired ? '#fed7d7' : (status.qrCodeData ? '#feebc8' : '#e2e8f0'),
              color: isExpired ? '#9b2c2c' : (status.qrCodeData ? '#7b341e' : '#2d3748'),
              padding: '0.85rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              lineHeight: '1.4'
            }}>
              {isExpired ? (
                <span>⚠️ <b>Kode QR telah kedaluwarsa.</b> Silakan klik tombol di bawah untuk membuat QR Code baru sebelum memindai.</span>
              ) : status.qrCodeData ? (
                <span>Buka WhatsApp di HP &gt; <b>Perangkat Tertaut</b> &gt; <b>Tautkan Perangkat</b>, lalu segera scan QR Code di bawah.</span>
              ) : (
                <span>🔄 <b>{status.statusMessage || 'Sedang menghubungkan ke WhatsApp...'}</b> Mohon tunggu sesaat.</span>
              )}
            </div>

            {status.qrCodeData && !refreshing ? (
              <div style={{
                position: 'relative',
                display: 'inline-block',
                marginBottom: '1rem',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '4px solid #edf2f7',
                filter: isExpired ? 'blur(2px) grayscale(70%)' : 'none',
                transition: 'filter 0.3s ease'
              }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(status.qrCodeData)}`}
                  alt="QR Code WhatsApp"
                  style={{ display: 'block', width: '260px', height: '260px' }}
                />
              </div>
            ) : (
              <div style={{
                height: '260px',
                width: '260px',
                margin: '0 auto 1rem',
                backgroundColor: '#edf2f7',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px dashed #cbd5e0',
                padding: '1rem'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                <div style={{ color: '#4a5568', fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                  {refreshing ? 'Membuat QR Code baru...' : (status.statusMessage || 'Menyiapkan QR Code...')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '6px', textAlign: 'center' }}>
                  {status.statusMessage?.includes('Memuat') ? 'Sedang menyinkronkan chat WhatsApp...' : 'Mohon tunggu beberapa detik'}
                </div>
              </div>
            )}

            {/* Status Waktu Aktif QR */}
            {status.qrCodeData && !refreshing && (
              <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                {isExpired ? (
                  <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>Kedaluwarsa</span>
                ) : (
                  <span style={{ color: '#4a5568' }}>
                    Sisa waktu aktif: <b style={{ color: timeLeft <= 8 ? '#e53e3e' : '#319795' }}>{timeLeft} detik</b>
                  </span>
                )}
              </div>
            )}

            {/* Tombol Segarkan QR */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: refreshing ? '#a0aec0' : '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '0.925rem',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(49, 130, 206, 0.25)',
                transition: 'background 0.2s ease'
              }}
            >
              <span>🔄</span>
              <span>{refreshing ? 'Sedang Memuat Ulang...' : 'Buat QR Code Baru yang Segar'}</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #edf2f7', fontSize: '0.875rem' }}>
          <Link href="/" style={{ color: '#4a5568', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            &larr; <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
