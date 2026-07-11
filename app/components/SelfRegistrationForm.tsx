"use client";

import { useState } from 'react';

type Room = {
  id: string;
  roomNumber: string;
  priceSingle: number;
  priceDouble: number;
};

export default function SelfRegistrationForm({ room }: { room: Room }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('roomId', room.id);

    const res = await fetch('/api/daftar', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      const err = await res.json();
      alert(err.error || "Gagal mengirim formulir pendaftaran.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', backgroundColor: '#ECFDF5', padding: '3rem 2rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#047857', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>🎉 Pendaftaran Berhasil!</h2>
        <p style={{ color: '#065F46', marginBottom: '2rem' }}>
          Data Anda untuk Kamar <strong>{room.roomNumber}</strong> telah kami terima.
        </p>
        <p style={{ color: '#065F46', fontSize: '0.9rem' }}>
          Silakan konfirmasi ke pengelola kos dan kirimkan bukti transfer pembayaran sewa dan deposit kunci ke WhatsApp kami.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
      
      <div style={{ marginBottom: '1.5rem', backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#1F2937', margin: 0 }}>
          Pendaftaran Kamar {room.roomNumber}
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Nama Lengkap (Sesuai KTP)</label>
        <input 
          required type="text" name="name"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Nomor WhatsApp Aktif</label>
        <input 
          required type="tel" name="waNumber" placeholder="Contoh: 08123456789"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Tipe Hunian & Tarif</label>
        <select 
          required name="occupancyType"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB' }}
        >
          <option value="SENDIRI">Sendiri (Rp {new Intl.NumberFormat('id-ID').format(room.priceSingle)} / bulan)</option>
          <option value="BERDUA">Berdua (Rp {new Intl.NumberFormat('id-ID').format(room.priceDouble)} / bulan)</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Rencana Tanggal Masuk</label>
        <input 
          required type="date" name="checkInDate" defaultValue={new Date().toISOString().split('T')[0]}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Upload Foto KTP</label>
        <input 
          required type="file" name="ktpFile" accept="image/*"
          style={{ width: '100%', padding: '0.5rem', border: '2px dashed #D1D5DB', borderRadius: '8px' }}
        />
        <small style={{ color: '#6B7280', display: 'block', marginTop: '0.5rem' }}>Penting: Gunakan format JPG/PNG yang jelas untuk keamanan dan ketertiban kos.</small>
      </div>

      <div style={{ marginBottom: '2rem', borderTop: '2px dashed #E5E7EB', paddingTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Informasi Kontak Darurat</h3>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Nama Keluarga / Orang Tua</label>
        <input 
          required type="text" name="emergencyName"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', marginBottom: '1rem' }}
        />
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Nomor HP Darurat</label>
        <input 
          required type="tel" name="emergencyWa"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
        />
      </div>

      {/* Tampilan Informasi Pembayaran (QRIS Area) */}
      <div style={{ backgroundColor: '#EEF2FF', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h4 style={{ fontWeight: 'bold', color: '#4F46E5', marginBottom: '0.5rem' }}>Informasi Pembayaran</h4>
        <p style={{ fontSize: '0.875rem', color: '#4338CA', marginBottom: '1rem', lineHeight: '1.5' }}>
          Sebagai penghuni baru, Anda diwajibkan menyetor uang sewa awal dan <strong>Deposit Kunci sebesar Rp 50.000</strong>.
          <br /><br />
          Silakan transfer ke rekening yang ditunjuk atau scan QRIS berikut ini. Bukti transfer mohon diinfokan kepada pengelola.
        </p>
        <div style={{ backgroundColor: 'white', border: '1px solid #C7D2FE', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
           <span style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: '500' }}>[ TEMPAT GAMBAR QRIS.JPG ]</span>
           <br/>
           <img src="/qris.jpg" alt="QRIS Pembayaran" style={{ maxWidth: '100%', marginTop: '1rem', border: '1px solid #E5E7EB', borderRadius: '8px', display: 'none' }} onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => { e.currentTarget.style.display = 'inline-block'; (e.currentTarget.previousSibling as HTMLElement).style.display = 'none'; }} />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{ 
          width: '100%', padding: '1rem', backgroundColor: '#4F46E5', color: 'white', 
          border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.125rem', cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
        }}
      >
        {loading ? 'Mengirim Data...' : 'Kirim Pendaftaran'}
      </button>
    </form>
  );
}
