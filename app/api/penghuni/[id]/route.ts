import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;

    // Ambil data untuk mengecek kamarnya
    const tenant = await prisma.tenant.findUnique({ where: { id: params.id } });
    
    if (tenant) {
      // Hapus semua riwayat pembayaran yang terkait agar tidak error foreign key
      await prisma.payment.deleteMany({
        where: { tenantId: params.id }
      });

      // Hapus penghuni
      await prisma.tenant.delete({
        where: { id: params.id }
      });

      // Jika penghuni tersebut masih aktif, sesuaikan status kamarnya berdasarkan sisa penghuni aktif
      if (tenant.isActive) {
        const remainingTenants = await prisma.tenant.count({
          where: { 
            roomId: tenant.roomId, 
            isActive: true,
            id: { not: params.id }
          }
        });

        let newRoomStatus = 'KOSONG';
        if (remainingTenants >= 1) {
          newRoomStatus = 'TERISI_SENDIRI';
        }

        await prisma.room.update({
          where: { id: tenant.roomId },
          data: { status: newRoomStatus }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
