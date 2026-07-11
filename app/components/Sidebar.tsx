"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Kamar', path: '/kamar' },
    { name: 'Penghuni', path: '/penghuni' },
    { name: 'Pembayaran', path: '/pembayaran' },
    { name: 'Bot WhatsApp', path: '/wa' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem 1rem' }}>
        <img src="/logo.png" alt="DIRA KOS Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '50%', backgroundColor: 'white', padding: '0.2rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Admin Panel</h2>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.05em' }}>v2.1.0</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <button 
          onClick={async () => {
            await fetch('/api/auth', { method: 'DELETE' });
            window.location.href = '/login';
          }}
          style={{
            width: '100%', padding: '0.75rem', backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white',
            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.color = 'white'; }}
        >
          Keluar (Logout)
        </button>
      </div>
    </aside>
  );
}
