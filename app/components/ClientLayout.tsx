"use client";

import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Tentukan rute yang tidak perlu menampilkan Sidebar Admin
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname.startsWith('/daftar');

  return (
    <div className={isPublicPage ? "" : "layout-container"} style={isPublicPage ? { display: 'flex', minHeight: '100vh', flexDirection: 'column' } : {}}>
      
      {!isPublicPage && <Sidebar />}
      
      <main 
        className={isPublicPage ? "" : "main-content"} 
        style={isPublicPage ? { flex: '1', display: 'flex', flexDirection: 'column', width: '100%' } : { display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <div style={isPublicPage ? { flex: '1', padding: '2rem' } : { flex: '1' }}>
          {children}
        </div>
        
        <footer style={{ 
          marginTop: 'auto', 
          padding: '1.5rem', 
          textAlign: 'center', 
          borderTop: '1px solid #E5E7EB', 
          color: '#6B7280', 
          fontSize: '0.875rem' 
        }}>
          &copy;2026 DIRA KOS | By Indra R. Lingga
        </footer>
      </main>
      
    </div>
  );
}
