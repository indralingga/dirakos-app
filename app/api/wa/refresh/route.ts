import { NextResponse } from 'next/server';
import { refreshQrCode, getWaStatus } from '@/lib/wa';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await refreshQrCode();
    const status = getWaStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Gagal merefresh QR Code' }, { status: 500 });
  }
}
