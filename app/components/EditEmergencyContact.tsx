"use client";

import { useState } from 'react';

type Props = {
  tenantId: string;
  emergencyName: string | null;
  emergencyWa: string | null;
};

export default function EditEmergencyContact({ tenantId, emergencyName, emergencyWa }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(emergencyName || '');
  const [wa, setWa] = useState(emergencyWa || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !wa.trim()) {
      alert('Nama dan nomor WA darurat tidak boleh kosong!');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('emergencyName', name);
    formData.append('emergencyWa', wa);

    const res = await fetch(`/api/penghuni/${tenantId}/lengkap-data`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Gagal menyimpan data. Coba lagi.');
    }
    setLoading(false);
  };

  const currentName = saved ? name : (emergencyName || '-');
  const currentWa = saved ? wa : (emergencyWa || null);

  return (
    <div style={{ backgroundColor: '#FEF2F2', padding: '2rem', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #FECACA', paddingBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#991B1B', margin: 0 }}>
          Kontak Darurat
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              backgroundColor: '#991B1B',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', color: '#B91C1C', display: 'block', marginBottom: '0.35rem', fontWeight: '500' }}>
              Nama Keluarga
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama anggota keluarga"
              style={{
                width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px',
                border: '1px solid #FCA5A5', fontSize: '0.95rem',
                backgroundColor: 'white', boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', color: '#B91C1C', display: 'block', marginBottom: '0.35rem', fontWeight: '500' }}>
              Nomor WhatsApp Darurat
            </label>
            <input
              type="tel"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="08xxxxxxxxxx"
              style={{
                width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px',
                border: '1px solid #FCA5A5', fontSize: '0.95rem',
                backgroundColor: 'white', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 1, padding: '0.65rem', backgroundColor: '#991B1B',
                color: 'white', border: 'none', borderRadius: '8px',
                fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Menyimpan...' : '💾 Simpan'}
            </button>
            <button
              onClick={() => {
                setName(emergencyName || '');
                setWa(emergencyWa || '');
                setIsEditing(false);
              }}
              style={{
                flex: 1, padding: '0.65rem', backgroundColor: 'transparent',
                color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: '8px',
                fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {saved && (
            <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
              ✅ Data berhasil diperbarui!
            </div>
          )}
          <div>
            <p style={{ fontSize: '0.875rem', color: '#B91C1C', margin: 0 }}>Nama Keluarga</p>
            <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#7F1D1D', margin: 0 }}>{currentName}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#B91C1C', margin: 0 }}>Nomor WhatsApp Darurat</p>
            {currentWa ? (
              <p style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>
                <a
                  href={`https://wa.me/${currentWa.startsWith('0') ? '62' + currentWa.substring(1) : currentWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#7F1D1D', textDecoration: 'none' }}
                >
                  {currentWa} &#x2197;
                </a>
              </p>
            ) : (
              <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#7F1D1D', margin: 0 }}>-</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
