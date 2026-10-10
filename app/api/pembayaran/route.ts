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

    // 3. Kirim bukti kwitansi WA jika Bot Aktif dan status LUNAS
    if (data.status === 'LUNAS' && tenant) {
      const waStatus = getWaStatus();
      if (waStatus.isReady) {
        const formattedAmount = new Intl.NumberFormat('id-ID').format(payment.amount);
        const receiptNo = `DK-${payment.id.slice(0, 8).toUpperCase()}`;
        const transactionDate = new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const paymentDescription = data.paymentType === 'DEPOSIT'
          ? 'Deposit Kunci (Awal)'
          : `Biaya Sewa (${data.month})`;
        
        const waMsg = 
`🧾 *BUKTI PEMBAYARAN RESMI DIRA KOS*
────────────────────────────
*No. Resi   :* \`${receiptNo}\`
*Tanggal    :* ${transactionDate}

Halo Kak *${tenant.name}*,
Terima kasih banyak atas pembayaran Anda. Transaksi telah berhasil kami terima dan tercatat di sistem dengan rincian berikut:

🏠 *Kamar        :* Kamar ${tenant.room?.roomNumber || '-'}
📌 *Keperluan    :* ${paymentDescription}
💰 *Total Bayar  :* *Rp ${formattedAmount}*
✅ *Status       :* *LUNAS*

────────────────────────────
Pesan ini merupakan bukti pembayaran elektronik yang sah dari manajemen *DIRA KOS*.

Semoga hari Kakak menyenangkan, selalu nyaman, dan betah tinggal bersama kami. Jika ada kendala terkait fasilitas kamar, jangan ragu untuk menghubungi pengelola.

Salam hangat & terima kasih,
*Pengelola DIRA KOS* 🙏✨`;
        
        try {
          await sendWaMessage(tenant.waNumber, waMsg);
          console.log(`[PEMBAYARAN] ✅ Kwitansi WA berhasil dikirim ke ${tenant.name} (${tenant.waNumber})`);
        } catch (err: any) {
          console.error(`[PEMBAYARAN] ❌ Gagal kirim kwitansi WA ke ${tenant.name}:`, err?.message || err);
        }
      } else {
        console.warn(`[PEMBAYARAN] ⚠️ Bot WA sedang tidak aktif / belum scan QR. Kwitansi untuk ${tenant.name} tidak terkirim via WA.`);
      }
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
