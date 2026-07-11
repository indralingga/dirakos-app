import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWaMessage, getWaStatus } from '@/lib/wa';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // 1. Buat catatan pembayaran
    const payment = await prisma.payment.create({
      data: {
        tenantId: data.tenantId,
        paymentType: data.paymentType,
        amount: parseInt(data.amount),
        month: data.month,
        status: data.status,
      }
    });

    // 1b. Ambil data penghuni dan kamar
    const tenant = await prisma.tenant.findUnique({ 
      where: { id: data.tenantId },
      include: { room: true }
    });

    // Jika kamar berdua, duplikasi catatan pembayaran ke teman sekamar agar status keduanya LUNAS
    if (tenant && tenant.room.status === 'TERISI_BERDUA') {
      const roommates = await prisma.tenant.findMany({
        where: {
          roomId: tenant.roomId,
          isActive: true,
          id: { not: tenant.id }
        }
      });
      
      for (const roommate of roommates) {
        await prisma.payment.create({
          data: {
            tenantId: roommate.id,
            paymentType: data.paymentType,
            amount: parseInt(data.amount),
            month: data.month,
            status: data.status,
          }
        });
      }
    }

    // 2. Jika ini adalah DEPOSIT, update status deposit penghuni
    if (data.paymentType === 'DEPOSIT' && data.status === 'LUNAS') {
      await prisma.tenant.update({
        where: { id: data.tenantId },
        data: { depositStatus: 'LUNAS' }
      });
      
      // Duplikasi LUNAS deposit ke teman sekamar jika kamar berdua
      if (tenant && tenant.room.status === 'TERISI_BERDUA') {
        await prisma.tenant.updateMany({
          where: { roomId: tenant.roomId, isActive: true },
          data: { depositStatus: 'LUNAS' }
        });
      }
    }

    // 3. Kirim bukti kwitansi WA jika Bot Aktif
    if (getWaStatus().isReady && data.status === 'LUNAS') {
      if (tenant) {
        const formattedAmount = new Intl.NumberFormat('id-ID').format(payment.amount);
        const msgType = data.paymentType === 'DEPOSIT' ? 'Deposit Kunci' : `Sewa Bulan ${data.month}`;
        
        const waMsg = `*Kwitansi DIRA KOS*\n\nTerima kasih ${tenant.name},\nPembayaran Anda untuk *${msgType}* sebesar *Rp ${formattedAmount}* telah kami terima.\n\nSemoga hari Anda menyenangkan!`;
        
        // Sengaja kita tangkap errornya agar tidak mengganggu proses utama
        sendWaMessage(tenant.waNumber, waMsg).catch(err => console.error("Gagal kirim kwitansi WA:", err));
      }
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
