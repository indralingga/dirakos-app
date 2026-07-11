import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath =
  path === '/' ||
  path === '/login' ||
  path.startsWith('/daftar') ||
  path.startsWith('/api/auth') ||
  path.startsWith('/api/daftar') ||
  path.startsWith('/api/penghuni/');
  
  const token = request.cookies.get('admin_token')?.value || '';

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|lengkap-data|_next/image|favicon.ico|logo.png|qris.jpg).*)',
  ],
};
