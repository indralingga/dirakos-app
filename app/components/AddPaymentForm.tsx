"use client";

import { useState } from 'react';

type Tenant = {
  id: string;
  name: string;
  checkInDate: Date;
  room: { roomNumber: string; priceSingle: number; priceDouble: number; status: string };
};

export default function AddPaymentForm({ activeTenants }: { activeTenants: Tenant[] }) {
  const [formData, setFormData] = useState({
    tenantId: '',
    paymentType: 'SEWA',
    amount: '',
    month: '',
    status: 'LUNAS'
  });
  const [loading, setLoading] = useState(false);

  // Auto-fill jumlah uang dan periode berdasarkan penghuni yg dipilih
  const handleTenantChange = (tenantId: string) => {
    const tenant = activeTenants.find(t => t.id === tenantId);
    let defaultAmount = '';
    let periodString = '';
    
    if (tenant) {
      if (formData.paymentType === 'SEWA') {
         defaultAmount = tenant.room.status === 'TERISI_BERDUA' ? tenant.room.priceDouble.toString() : tenant.room.priceSingle.toString();
         
         // Hitung periode aktif saat ini berdasarkan tanggal check-in dan tanggal sekarang
         const checkIn = new Date(tenant.checkInDate);
         const dueDay = checkIn.getDate();
         const today = new Date();
         
         // Cari batas awal siklus sewa berjalan
         let cycleStart = new Date(today.getFullYear(), today.getMonth(), dueDay);
         if (today.getDate() < dueDay) {
           cycleStart.setMonth(cycleStart.getMonth() - 1);
         }
         
         const nextMonth = new Date(cycleStart);
         nextMonth.setMonth(nextMonth.getMonth() + 1);
         
         const formatDate = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
         periodString = `${formatDate(cycleStart)} - ${formatDate(nextMonth)}`;
      } else {
         defaultAmount = '50000'; // Deposit
         periodString = 'Deposit Kunci Awal';
      }
    }
    
    setFormData({...formData, tenantId, amount: defaultAmount, month: periodString});
  };

  const handleTypeChange = (paymentType: string) => {
    const tenant = activeTenants.find(t => t.id === formData.tenantId);
    let defaultAmount = '';
    let periodString = '';
    
    if (tenant) {
      if (paymentType === 'SEWA') {
         defaultAmount = tenant.room.status === 'TERISI_BERDUA' ? tenant.room.priceDouble.toString() : tenant.room.priceSingle.toString();
         const checkIn = new Date(tenant.checkInDate);
         const dueDay = checkIn.getDate();
         const today = new Date();
         
         let cycleStart = new Date(today.getFullYear(), today.getMonth(), dueDay);
         if (today.getDate() < dueDay) {
           cycleStart.setMonth(cycleStart.getMonth() - 1);
         }
         
         const nextMonth = new Date(cycleStart);
         nextMonth.setMonth(nextMonth.getMonth() + 1);
         const formatDate = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
         periodString = `${formatDate(cycleStart)} - ${formatDate(nextMonth)}`;
      } else {
         defaultAmount = '50000';
         periodString = 'Deposit Kunci Awal';
      }
    } else if (paymentType === 'DEPOSIT') {
       defaultAmount = '50000';
       periodString = 'Deposit Kunci Awal';
    }

    setFormData({...formData, paymentType, amount: defaultAmount, month: periodString});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/pembayaran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      window.location.href = '/pembayaran';
    } else {
      alert("Gagal mencatat pembayaran");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Pilih Penghuni</label>
        <select 
          required
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
          value={formData.tenantId}
          onChange={(e) => handleTenantChange(e.target.value)}
        >
          <option value="">-- Pilih Penghuni Aktif --</option>
          {activeTenants.map(t => (
            <option key={t.id} value={t.id}>{t.name} (Kamar {t.room.roomNumber})</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Jenis Pembayaran</label>
        <select 
          required
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
          value={formData.paymentType}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <option value="SEWA">Sewa Bulanan</option>
          <option value="DEPOSIT">Deposit Kunci</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nominal (Rp)</label>
        <input 
          required type="number"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F3F4F6' }}
          value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Periode Sewa</label>
        <input 
          required type="text"
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
          value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})}
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
        {loading ? 'Menyimpan & Mengirim WA...' : 'Catat & Kirim Kwitansi WA'}
      </button>
    </form>
  );
}
