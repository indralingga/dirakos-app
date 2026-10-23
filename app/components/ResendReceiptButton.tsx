"use client";

import { useState } from 'react';

export default function ResendReceiptButton({
  paymentId,
  tenantName
}: {
  paymentId: string;
  tenantName: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!confirm(`Kirim bukti kwitansi WA resmi ke ${tenantName}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/pembayaran/${paymentId}/resend-receipt`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Kwitansi WA berhasil dikirim ke ${tenantName}!`);
      } else {
        alert(`❌ ${data.error || "Gagal mengirim kwitansi"}`);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleResend}
      disabled={loading}
      style={{
        backgroundColor: '#3B82F6',
        color: 'white',
        border: 'none',
        padding: '0.35rem 0.65rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}
      title="Kirim ulang bukti kwitansi resmi ke WA penghuni"
    >
      {loading ? 'Mengirim...' : '📩 Kirim WA'}
    </button>
  );
}
