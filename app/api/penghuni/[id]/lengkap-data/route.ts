import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const tenantId = params.id;

    // Cek apakah data penghuni terdaftar
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
        return NextResponse.json({ error: 'Data penghuni tidak ditemukan' }, { status: 404 });
    }

    const formData = await req.formData();
    const emergencyName = formData.get('emergencyName') as string;
    const emergencyWa = formData.get('emergencyWa') as string;
    const file = formData.get('ktpFile') as File;

    let fileName = tenant.ktpPhoto; // pertahankan foto KTP lama jika sudah ada

    if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Simpan file KTP baru
        const rawFileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ktp');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, rawFileName), buffer);
        fileName = `/uploads/ktp/${rawFileName}`;
    }

    // Update data KTP dan Kontak Darurat ke database
    const updatedTenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: {
            emergencyName: emergencyName || tenant.emergencyName,
            emergencyWa: emergencyWa || tenant.emergencyWa,
            ktpPhoto: fileName
        }
    });

    return NextResponse.json({ success: true, tenant: updatedTenant });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
