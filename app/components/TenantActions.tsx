"use client";

import { useState } from 'react';

export default function TenantActions({ tenantId, isActive, tenantName }: { tenantId: string, isActive: boolean, tenantName: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckOut = async () => {
    if (!confirm(`Apakah Anda yakin ingin Check-Out penghuni ${tenantName}? Status kamarnya akan dikosongkan.`)) return;
    
    setLoading(true);
    const res = await fetch(`/api/penghuni/${tenantId}/checkout`, { method: 'POST' });
    if (res.ok) {
      window.location.reload();
    } else {
      alert("Gagal Check Out");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus data ${tenantName} SELAMANYA dari database? Ini tidak bisa dibatalkan.`)) return;
    
    setLoading(true);
    const res = await fetch(`/api/penghuni/${tenantId}`, { method: 'DELETE' });
    if (res.ok) {
      window.location.reload();
    } else {
      alert("Gagal Menghapus Data");
      setLoading(false);
    }
  };

  const handleNotify = async () => {
    if (!confirm(`Kirim pesan tagihan/testing ke WA ${tenantName} sekarang?`)) return;
    
    setLoading(true);
    const res = await fetch(`/api/penghuni/${tenantId}/notify`, { method: 'POST' });
    if (res.ok) {
      alert("Notifikasi WA berhasil dikirim!");
    } else {
      const err = await res.json();
      alert(err.error || "Gagal mengirim notifikasi WA");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <a 
        href={`/penghuni/${tenantId}`}
        style={{ 
          backgroundColor: '#10B981', color: 'white', textDecoration: 'none', padding: '0.4rem 0.8rem', 
          borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' 
        }}
        title="Lihat Detail Profil"
      >
        Detail
      </a>

      <button 
        onClick={handleNotify} 
        disabled={!isActive || loading}
        style={{ 
          backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', 
          borderRadius: '4px', cursor: isActive && !loading ? 'pointer' : 'not-allowed', 
          fontSize: '0.75rem', opacity: isActive ? 1 : 0.5 
        }}
        title="Kirim Pesan Tagihan WA"
      >
        Kirim Notif
      </button>

      <button 
        onClick={handleCheckOut} 
        disabled={!isActive || loading}
        style={{ 
          backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '0.4rem 0.8rem', 
          borderRadius: '4px', cursor: isActive && !loading ? 'pointer' : 'not-allowed', 
          fontSize: '0.75rem', opacity: isActive ? 1 : 0.5 
        }}
      >
        Check Out
      </button>
      
      <button 
        onClick={handleDelete} 
        disabled={loading}
        style={{ 
          backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', 
          borderRadius: '4px', cursor: !loading ? 'pointer' : 'not-allowed', 
          fontSize: '0.75rem' 
        }}
      >
        Hapus
      </button>
    </div>
  );
}
