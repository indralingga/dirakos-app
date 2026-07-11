"use client";

import { useState } from 'react';

export default function AddRoomForm() {
  const [formData, setFormData] = useState({
    roomNumber: '',
    priceSingle: '500000',
    priceDouble: '650000',
    plnId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/kamar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      window.location.href = '/kamar';
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menambah kamar");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nomor/Nama Kamar Baru</label>
        <input 
          required type="text" placeholder="Contoh: 12"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
          value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Harga Sewa Sendiri (Rp)</label>
        <input 
          required type="number"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
          value={formData.priceSingle} onChange={(e) => setFormData({...formData, priceSingle: e.target.value})}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Harga Sewa Berdua (Rp)</label>
        <input 
          required type="number"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
          value={formData.priceDouble} onChange={(e) => setFormData({...formData, priceDouble: e.target.value})}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>ID Meteran PLN (Opsional)</label>
        <input 
          type="text"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
          value={formData.plnId} onChange={(e) => setFormData({...formData, plnId: e.target.value})}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{ 
          width: '100%', padding: '1rem', backgroundColor: '#10B981', color: 'white', 
          border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' 
        }}
      >
        {loading ? 'Menyimpan...' : 'Tambah Kamar Baru'}
      </button>
    </form>
  );
}
