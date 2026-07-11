"use client";

import { useState } from 'react';

type Room = {
  id: string;
  roomNumber: string;
  priceSingle: number;
  priceDouble: number;
  plnId: string | null;
};

export default function EditRoomForm({ room }: { room: Room }) {
  const [formData, setFormData] = useState({
    priceSingle: room.priceSingle.toString(),
    priceDouble: room.priceDouble.toString(),
    plnId: room.plnId || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/kamar/${room.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      window.location.href = '/kamar';
    } else {
      alert("Gagal mengubah data kamar");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
      
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
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>ID Meteran PLN</label>
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
          width: '100%', padding: '1rem', backgroundColor: '#4F46E5', color: 'white', 
          border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' 
        }}
      >
        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}
