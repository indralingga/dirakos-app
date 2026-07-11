import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWaMessage, getWaStatus, removeTenantFromGroup } from '@/lib/wa'; // Import dipindah ke paling atas

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: params.id },
        include: { room: true }
    });

    if (!tenant || !tenant.isActive) {
        return NextResponse.json({ error: 'Penghuni tidak valid' }, { status: 400 });
    }

    await prisma.tenant.update({
        where: { id: params.id },
        data: { isActive: false }
    });

    // Sesuaikan status kamar berdasarkan sisa penghuni aktif
    const remainingTenants = await prisma.tenant.count({
        where: { 
            roomId: tenant.roomId, 
            isActive: true,
            id: { not: params.id }
        }
    });

    const newRoomStatus = remainingTenants >= 1 ? 'TERISI_SENDIRI' : 'KOSONG';
    await prisma.room.update({
        where: { id: tenant.roomId },
        data: { status: newRoomStatus }
    });

    const checkIn = new Date(tenant.checkInDate);
    const today = new Date();
    let months = (today.getFullYear() - checkIn.getFullYear()) * 12;
    months -= checkIn.getMonth();
    months += today.getMonth();
    if (months <= 0) months = 1;

    // Kirim notifikasi WA & Keluarkan dari Grup WA Kos
    if (getWaStatus().isReady) {
        const waMsg = `*DIRA KOS*\n\nHalo ${tenant.name},\nProses Check-Out Kamar ${tenant.room?.roomNumber} telah berhasil dicatat di sistem kami.\n\nTerima kasih banyak telah mempercayakan DIRA KOS sebagai tempat tinggal Anda selama kurang lebih ${months} bulan terakhir.\n\nSemoga sukses selalu untuk Anda, dan pintu kami selalu terbuka jika Anda ingin kembali. 🙏`;

        sendWaMessage(tenant.waNumber, waMsg)
        .then(() => {
            // Tunggu 3 detik agar pesan ucapan terima kasih terbaca sebelum dikeluarkan dari grup
            setTimeout(async () => {
                await removeTenantFromGroup(tenant.waNumber); // Menggunakan import statis
            }, 3000);
        })
        .catch(err => console.error("Gagal kirim WA Checkout / Kick Group:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
