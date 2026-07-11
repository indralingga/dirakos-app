"use client";

import { useState } from 'react';

export default function RoomActions({ roomId, isOccupied, roomNumber }: { roomId: string, isOccupied: boolean, roomNumber: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (isOccupied) {
      alert("Kamar tidak bisa dihapus karena sedang terisi!");
      return;
    }
    
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS Kamar ${roomNumber} secara permanen?`)) return;
    
    setLoading(true);
    const res = await fetch(`/api/kamar/${roomId}`, { method: 'DELETE' });
    
    if (res.ok) {
      window.location.reload();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menghapus kamar");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <a href={`/kamar/edit/${roomId}`} style={{ 
        fontSize: '0.75rem', color: '#4F46E5', textDecoration: 'none', 
        fontWeight: 'bold', backgroundColor: '#E0E7FF', padding: '0.3rem 0.6rem', borderRadius: '4px' 
      }}>
        Edit
      </a>
      
      <button 
        onClick={handleDelete}
        disabled={loading || isOccupied}
        style={{ 
          fontSize: '0.75rem', color: 'white', backgroundColor: '#EF4444', 
          border: 'none', fontWeight: 'bold', padding: '0.3rem 0.6rem', borderRadius: '4px',
          cursor: isOccupied ? 'not-allowed' : 'pointer',
          opacity: isOccupied ? 0.5 : 1
        }}
        title={isOccupied ? "Kosongkan kamar terlebih dahulu" : "Hapus kamar"}
      >
        Hapus
      </button>
    </div>
  );
}
