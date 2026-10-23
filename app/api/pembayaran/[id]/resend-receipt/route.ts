import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWaMessage, getWaStatus } from '@/lib/wa';
import { generateReceiptMessage } from '@/lib/paymentUtils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        tenant: {
          include: { room: true }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Data pembayaran tidak ditemukan' }, { status: 404 });
    }

    if (!payment.tenant || !payment.tenant.waNumber) {
      return NextResponse.json({ error: 'Nomor WhatsApp penghuni tidak ditemukan' }, { status: 400 });
    }

    const waStatus = getWaStatus();
    if (!waStatus.isReady) {
      return NextResponse.json({ error: 'Bot WhatsApp sedang tidak aktif / terputus. Silakan cek menu Bot WA.' }, { status: 400 });
    }

    const waMsg = generateReceiptMessage(payment, payment.tenant);
    await sendWaMessage(payment.tenant.waNumber, waMsg);

    console.log(`[PEMBAYARAN] 📩 Kwitansi berhasil dikirim ulang ke ${payment.tenant.name} (${payment.tenant.waNumber})`);
    return NextResponse.json({ success: true, message: `Kwitansi berhasil dikirim ke WA ${payment.tenant.name}!` });
  } catch (error: any) {
    console.error('Error resending receipt:', error);
    return NextResponse.json({ error: error?.message || 'Gagal mengirim kwitansi WA' }, { status: 500 });
  }
}
