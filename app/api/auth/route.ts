import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // DAFTAR USER ADMIN YANG DIIZINKAN LOGIN
    const isAdminValid = 
      (username === 'dira' && password === 'Palang66') || 
      (username === 'wali' && password === 'testing'); // Akun baru tambahan Anda

    if (isAdminValid) {
      // Set cookie using next/headers
      const cookieStore = await cookies();
      cookieStore.set('admin_token', 'true', {
        httpOnly: true,
        secure: false, // Diubah ke false agar bisa login lewat HTTP (Not Secure) di VPS
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 minggu
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Username atau Password salah' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  return NextResponse.json({ success: true });
}
