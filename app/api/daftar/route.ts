import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const roomId = formData.get('roomId') as string;
    const name = formData.get('name') as string;
    const waNumber = formData.get('waNumber') as string;
    const occupancyType = formData.get('occupancyType') as string;
    const checkInDate = formData.get('checkInDate') as string;
    const emergencyName = formData.get('emergencyName') as string;
    const emergencyWa = formData.get('emergencyWa') as string;
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
      return NextResponse.json({ error: 'Maaf, kamar ini sudah tidak tersedia.' }, { status: 400 });
    }

    const ktpPath = fileName ? `/uploads/ktp/${fileName}` : null;

    const newTenant = await prisma.tenant.create({
      data: {
        roomId,
        name,
        waNumber,
        checkInDate: new Date(checkInDate),
        emergencyName,
        emergencyWa,
        ktpPhoto: ktpPath,
        ktpFile: ktpPath,
        depositStatus: 'BELUM_LUNAS',
        isActive: true,
      }
    });

    const newStatus = occupancyType === 'BERDUA' ? 'TERISI_BERDUA' : 'TERISI_SENDIRI';
    await prisma.room.update({
      where: { id: roomId },
      data: { status: newStatus }
    });


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server saat mendaftar.' }, { status: 500 });
  }
}
