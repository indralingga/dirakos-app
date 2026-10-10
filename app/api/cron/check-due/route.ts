import { NextResponse } from 'next/server';
import { runDueCheck } from '@/lib/cron';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await runDueCheck();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || error }, { status: 500 });
  }
}
