import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWaMessage, getWaStatus } from '@/lib/wa';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;

    if (!getWaStatus().isReady) {
      return NextResponse.json({ error: 'Bot WA belum aktif. Silakan scan QR Code di menu Bot WA terlebih dahulu.' }, { status: 400 });
    }
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: { room: true }
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ error: 'Penghuni tidak valid' }, { status: 400 });
    }

    const nominal = tenant.room.status === 'TERISI_BERDUA' ? tenant.room.priceDouble : tenant.room.priceSingle;
    const formattedAmount = new Intl.NumberFormat('id-ID').format(nominal);

    const waMsg = `*PENGINGAT DIRA KOS*\n\nHalo ${tenant.name},\nIni adalah pesan tagihan/testing dari admin DIRA KOS.\n\nBiaya sewa untuk Kamar ${tenant.room.roomNumber} adalah *Rp ${formattedAmount}*/bulan.\n\nPembayaran dapat dilakukan melalui QRIS yang terlampir pada pesan ini.\nSilakan abaikan pesan ini jika Anda sudah melakukan pembayaran. Terima kasih!`;
    
    await sendWaMessage(tenant.waNumber, waMsg, './public/qris.jpg');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengirim WA' }, { status: 500 });
  }
}
