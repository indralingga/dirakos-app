import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const data = await req.json();
    
    await prisma.room.update({
      where: { id: params.id },
      data: {
        priceSingle: parseInt(data.priceSingle),
        priceDouble: parseInt(data.priceDouble),
        plnId: data.plnId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;

    // Pastikan kamar tidak terisi sebelum dihapus
    const room = await prisma.room.findUnique({ where: { id: params.id } });
    if (room && room.status !== 'KOSONG') {
      return NextResponse.json({ error: 'Kamar tidak bisa dihapus karena sedang terisi.' }, { status: 400 });
    }

    await prisma.room.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
