import cron from 'node-cron';
import { prisma } from './prisma';
import { sendWaMessage, getWaStatus } from './wa';

let cronStarted = false;

export const startCronJobs = () => {
  if (cronStarted) return;
  cronStarted = true;

  // Berjalan setiap jam 08:00 pagi
  cron.schedule('0 8 * * *', async () => {
    console.log('Menjalankan pengecekan jatuh tempo harian...');
    
    if (!getWaStatus().isReady) {
      console.log('WA Client belum siap. Melewati cron job.');
      return;
    }

    try {
      // Ambil semua penghuni aktif
      const activeTenants = await prisma.tenant.findMany({
        where: { isActive: true },
        include: { room: true }
      });

      const today = new Date();
      
      for (const tenant of activeTenants) {
        // Ambil tanggal masuk
        const checkInDate = new Date(tenant.checkInDate);
        const dueDay = checkInDate.getDate();
        
        // Buat tanggal jatuh tempo untuk bulan ini dengan aman tanpa overflow
        let dueDateThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        dueDateThisMonth.setDate(dueDay);
        
        // Jika hari ini sudah lewat tanggal jatuh tempo, berarti jatuh temponya bulan depan
        if (today.getDate() > dueDay) {
           dueDateThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
           dueDateThisMonth.setDate(dueDay);
        }

        // Hitung selisih hari antara hari ini dan tanggal jatuh tempo
        // Setel jam ke 00:00:00 agar perhitungannya murni beda hari
        const t1 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const t2 = new Date(dueDateThisMonth.getFullYear(), dueDateThisMonth.getMonth(), dueDateThisMonth.getDate()).getTime();
        
        const diffDays = Math.round((t2 - t1) / (1000 * 60 * 60 * 24));

        // Format bulan tagihan untuk pencocokan (misal: "Mei")
        const startMonthName = dueDateThisMonth.toLocaleDateString('id-ID', { month: 'long' });
        const startMonthShort = dueDateThisMonth.toLocaleDateString('id-ID', { month: 'short' });
        const startMonthNum = (dueDateThisMonth.getMonth() + 1).toString();
        const startMonthNumZero = startMonthNum.padStart(2, '0');
        const startYear = dueDateThisMonth.getFullYear().toString();

        // Ambil semua pembayaran sewa lunas untuk penghuni ini
        const tenantPayments = await prisma.payment.findMany({
          where: {
            tenantId: tenant.id,
            paymentType: "SEWA",
            status: "LUNAS"
          }
        });

        // Cek apakah sudah lunas untuk siklus bulan ini menggunakan pencocokan fleksibel
        const isPaidThisMonth = tenantPayments.some(p => {
          const rawPeriod = p.month.toLowerCase();
          
          // 1. Jika formatnya kata (misal mengandung "Mei" dan "2026")
          const hasMonthText = rawPeriod.includes(startMonthName.toLowerCase()) || rawPeriod.includes(startMonthShort.toLowerCase());
          const hasYearText = rawPeriod.includes(startYear);
          if (hasMonthText && hasYearText) {
            return true;
          }

          // 2. Jika formatnya angka (misal mengandung "/5/2026")
          const numericPattern1 = `/${startMonthNum}/${startYear}`;
          const numericPattern2 = `/${numericPattern1.replace(`/${startMonthNum}/`, `/${startMonthNumZero}/`)}`;
          if (rawPeriod.includes(numericPattern1) || rawPeriod.includes(numericPattern2)) {
            return true;
          }

          return false;
        });

        if (isPaidThisMonth) {
          continue; // Sudah lunas, abaikan
        }

        // Harga sewa
        const rentPrice = tenant.room.status === "TERISI_BERDUA" ? tenant.room.priceDouble : tenant.room.priceSingle;
        const formattedAmount = new Intl.NumberFormat('id-ID').format(rentPrice);

          if (diffDays === 3) {
            // Pengingat H-3
            const dueDateString = new Date(today.getFullYear(), today.getMonth(), checkInDate.getDate()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const waMsg = `*PENGINGAT DIRA KOS*\n\nHalo ${tenant.name},\nIni adalah pesan pengingat otomatis. Biaya sewa Kamar ${tenant.room.roomNumber} Anda akan jatuh tempo dalam 3 hari pada tanggal *${dueDateString}*.\n\nTagihan bulan ini: *Rp ${formattedAmount}*.\n\nPembayaran dapat dilakukan melalui QRIS yang terlampir pada pesan ini.\nMohon siapkan pembayaran Anda. Terima kasih!`;
            
            await sendWaMessage(tenant.waNumber, waMsg, './public/qris.jpg');
            console.log(`[CRON] Sent H-3 reminder to ${tenant.name}`);
            
          } else if (diffDays === 0) {
            // Hari H
            const waMsg = `*JATUH TEMPO DIRA KOS*\n\nHalo ${tenant.name},\nBiaya sewa Kamar ${tenant.room.roomNumber} Anda telah jatuh tempo HARI INI.\n\nTotal tagihan: *Rp ${formattedAmount}*.\n\nPembayaran dapat dilakukan melalui QRIS yang terlampir pada pesan ini.\nMohon segera melakukan pembayaran untuk menghindari kendala. Terima kasih!`;
            
            await sendWaMessage(tenant.waNumber, waMsg, './public/qris.jpg');
            console.log(`[CRON] Sent D-Day reminder to ${tenant.name}`);
          }
      }

    } catch (err) {
      console.error('Error saat menjalankan cron job:', err);
    }
  });

  console.log('✅ Sistem Cron Job Jatuh Tempo telah diaktifkan.');
};
