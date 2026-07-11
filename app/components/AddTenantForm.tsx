"use client";

import { useState } from 'react';

type Room = { id: string; roomNumber: string; status?: string };

export default function AddTenantForm({ availableRooms }: { availableRooms: Room[] }) {
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRoom = availableRooms.find(r => r.id === selectedRoomId);
  const isSecondTenant = selectedRoom?.status === 'TERISI_SENDIRI';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Jika input occupancyType disabled, kita perlu meng-append nilainya secara manual
    if (isSecondTenant) {
      formData.set('occupancyType', 'BERDUA');
    }

    const res = await fetch('/api/penghuni', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      window.location.href = '/penghuni'; // Redirect ke halaman penghuni
    } else {
      alert("Gagal menambahkan penghuni");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Pilih Kamar Kosong / Kamar Isi 1</label>
        <select 
          required name="roomId"
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        >
          <option value="">-- Pilih Kamar --</option>
          {availableRooms.map(r => (
            <option key={r.id} value={r.id}>
              Kamar {r.roomNumber} {r.status === 'TERISI_SENDIRI' ? '(Sudah Isi 1 - Bisa Tambah 1 Lagi)' : '(Kosong)'}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tipe Hunian (Sangat Penting!)</label>
        <select 
          required name="occupancyType"
          value={isSecondTenant ? 'BERDUA' : undefined}
          disabled={isSecondTenant}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F3F4F6' }}
        >
          <option value="SENDIRI">Sendiri (Rp 500.000 / bulan)</option>
          <option value="BERDUA">Berdua (Rp 650.000 / bulan)</option>
        </select>
        {isSecondTenant && (
          <p style={{ color: '#D97706', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: '500' }}>
            * Otomatis diset "Berdua" karena Anda menambahkan penghuni kedua pada kamar ini.
          </p>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          {isSecondTenant ? 'Nama Penghuni Kedua (Tambahan)' : 'Nama Penghuni Utama'}
        </label>
        <input 
          required type="text" name="name"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nomor WhatsApp</label>
        <input 
          required type="tel" name="waNumber" placeholder="08123456789"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tanggal Masuk (Patokan Jatuh Tempo)</label>
        <input 
          required type="date" name="checkInDate" defaultValue={new Date().toISOString().split('T')[0]}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Upload Foto KTP (Opsional)</label>
        <input 
          type="file" name="ktpFile" accept="image/*"
          style={{ width: '100%', padding: '0.5rem', border: '1px dashed #D1D5DB', borderRadius: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status Deposit Kunci (Rp 50.000)</label>
        <select 
          required name="depositStatus"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        >
          <option value="BELUM_LUNAS">Belum Dibayar (Nanti / Menyusul)</option>
          <option value="LUNAS">Sudah Dibayar (Lunas)</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem', borderTop: '1px dashed #D1D5DB', paddingTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4B5563' }}>Kontak Darurat (Opsional tapi Disarankan)</h3>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nama Kontak Keluarga</label>
        <input 
          type="text" name="emergencyName"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', marginBottom: '1rem' }}
        />
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nomor HP Darurat</label>
        <input 
          type="tel" name="emergencyWa"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
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
        {loading ? 'Menyimpan...' : 'Simpan & Check-in'}
      </button>
    </form>
  );
}
