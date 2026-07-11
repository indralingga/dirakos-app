import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { sendWaMessage } from '@/lib/wa';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const roomId = formData.get('roomId') as string;
    const occupancyType = formData.get('occupancyType') as string;
    const name = formData.get('name') as string;
    const waNumber = formData.get('waNumber') as string;
    const checkInDate = formData.get('checkInDate') as string;
    const emergencyName = formData.get('emergencyName') as string;
    const emergencyWa = formData.get('emergencyWa') as string;
    const depositStatus = formData.get('depositStatus') as string;

    const file = formData.get('ktpFile') as File;
    let fileName = null;

    if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ktp');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room || room.status !== 'KOSONG') {
        return NextResponse.json({ error: 'Kamar tidak tersedia' }, { status: 400 });
    }

    const newTenant = await prisma.tenant.create({
        data: {
            roomId,
            name,
            waNumber,
            checkInDate: new Date(checkInDate),
            emergencyName: emergencyName || null,
            emergencyWa: emergencyWa || null,
            ktpPhoto: fileName ? `/uploads/ktp/${fileName}` : null,
            depositStatus,
            isActive: true,
        }
    });

    const newStatus = occupancyType === 'BERDUA' ? 'TERISI_BERDUA' : 'TERISI_SENDIRI';
    await prisma.room.update({
        where: { id: roomId },
        data: { status: newStatus }
    });


    // Kirim link pengisian data (KTP & Kontak Darurat) secara pribadi (Japri) ke penghuni baru
    const lengkapDataUrl = `https://dirakos.indralingga.my.id/lengkap-data/${newTenant.id}`;
    const japriMsg = `*LENGKAPI DATA PENGHUNI DIRA KOS* 📋\n\nHalo *${name}*,\n\nSelamat datang di Dira Kos! Anda telah terdaftar di sistem kami.\n\nUntuk keperluan pelaporan administrasi ke pengurus RT setempat, mohon melengkapi foto KTP dan nomor kontak darurat Anda secara mandiri melalui link aman berikut ini:\n\n🔗 *Link Pengisian:* ${lengkapDataUrl}\n\n🔒 *Jaminan Keamanan Data:* Data KTP Anda disimpan secara aman di server pribadi Indra R. Lingga untuk pelaporan RT, dan akan terhapus secara otomatis & permanen dari server pada saat Anda Check-Out dari kosan.\n\nTerima kasih atas kerja samanya! 🙏`;
    
    sendWaMessage(waNumber, japriMsg).catch((err: any) => console.error("Gagal kirim link japri lengkap-data:", err));

    return NextResponse.json({ success: true, tenant: newTenant });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
