import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Pastikan nomor kamar tidak duplikat
    const existing = await prisma.room.findUnique({ where: { roomNumber: data.roomNumber } });
    if (existing) {
      return NextResponse.json({ error: 'Nomor kamar sudah ada' }, { status: 400 });
    }

    const newRoom = await prisma.room.create({
      data: {
        roomNumber: data.roomNumber,
        priceSingle: parseInt(data.priceSingle),
        priceDouble: parseInt(data.priceDouble),
        plnId: data.plnId || null,
        status: 'KOSONG'
      }
    });

    return NextResponse.json({ success: true, room: newRoom });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
