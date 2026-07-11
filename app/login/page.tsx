"use client";

import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      window.location.href = '/dashboard';
    } else {
      const err = await res.json();
      alert(err.error || 'Gagal login');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <img src="/logo.png" alt="DIRA KOS" style={{ width: '100px', height: '100px', objectFit: 'contain', margin: '0 auto 1.5rem', borderRadius: '50%', padding: '0.2rem', backgroundColor: '#F3F4F6' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '0.5rem' }}>Selamat Datang Kembali</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: '0.875rem' }}>Silakan login untuk masuk ke Admin Panel</p>
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Username</label>
            <input 
              required type="text" 
              value={username} onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Password</label>
            <input 
              required type="password" 
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', padding: '0.875rem', backgroundColor: '#4F46E5', color: 'white', 
              border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
            }}
          >
            {loading ? 'Memverifikasi...' : 'Masuk Sistem'}
          </button>
        </form>
      </div>
    </div>
  );
}
