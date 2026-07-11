import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // Kosongkan tabel (Opsional, hapus jika tidak ingin reset data saat seeding ulang)
  await prisma.payment.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.room.deleteMany();

  const roomsData = Array.from({ length: 11 }).map((_, index) => ({
    roomNumber: (index + 1).toString().padStart(2, '0'), // Menghasilkan "01", "02", dst.
    priceSingle: 500000,
    priceDouble: 650000,
    plnId: `PLN-${Math.floor(1000000000 + Math.random() * 9000000000)}`, // Contoh ID PLN acak
    status: "KOSONG"
  }));

  for (const room of roomsData) {
    await prisma.room.create({
      data: room,
    });
  }

  console.log('Seeding selesai. 11 Kamar berhasil dibuat.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
