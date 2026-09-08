import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWaMessage, getWaStatus } from '@/lib/wa';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.props ? await props.props : await props.params;

    if (!getWaStatus().isReady) {
      return NextResponse.json({ error: 'Bot WA belum aktif. Silakan scan QR Code di menu Bot WA terlebih dahulu.' }, { status: 400 });
    }
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: { room: true }
    });

    if (!tenant || !tenant.isActive) {
      return NextResponse.json({ error: 'Penghuni tidak terdaftar atau sudah tidak aktif.' }, { status: 400 });
    }

    const lengkapDataUrl = `https://dirakos.indralingga.my.id/lengkap-data/${tenant.id}`;
    const waMsg = `Halo Kak ${tenant.name},\n\nBerikut adalah link Registrasi Mandiri DIRA KOS (Kamar ${tenant.room.roomNumber}) untuk melengkapi data kontak darurat dan mengunggah foto KTP:\n\n👉 ${lengkapDataUrl}\n\nMohon bantuannya untuk segera melengkapi data tersebut ya Kak. Terima kasih!`;
    
    await sendWaMessage(tenant.waNumber, waMsg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gagal kirim ulang form registrasi mandiri:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengirim WA' }, { status: 500 });
  }
}
