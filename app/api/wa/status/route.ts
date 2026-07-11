import { NextResponse } from 'next/server';
import { getWaStatus } from '@/lib/wa';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getWaStatus();
  return NextResponse.json(status);
}
