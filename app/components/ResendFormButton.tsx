"use client";

import { useState } from 'react';

export default function ResendFormButton({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!confirm(`Kirim ulang link Form Registrasi Mandiri (Kontak Darurat & KTP) ke WA ${tenantName}?`)) return;

    setLoading(true);
    const res = await fetch(`/api/penghuni/${tenantId}/resend-form`, { method: 'POST' });
    if (res.ok) {
      alert(`Link Form Registrasi Mandiri berhasil dikirim ke WA ${tenantName}!`);
    } else {
      const err = await res.json();
      alert(err.error || "Gagal mengirim link ke WA");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleResend}
      disabled={loading}
      style={{
        backgroundColor: '#8B5CF6',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem'
      }}
    >
      📩 {loading ? 'Mengirim...' : 'Kirim Ulang Form Mandiri (WA)'}
    </button>
  );
}
