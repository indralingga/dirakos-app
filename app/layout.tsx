import './globals.css'
import type { Metadata } from 'next';
import ClientLayout from './components/ClientLayout';

export const metadata: Metadata = {
  title: 'DIRA KOS - Manajemen Kos Modern',
  description: 'Sistem Manajemen Kos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
