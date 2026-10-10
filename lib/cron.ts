import cron from 'node-cron';
import path from 'path';
import { prisma } from './prisma';
import { sendWaMessage, getWaStatus } from './wa';
import { isCyclePaid, getSafeDueDate } from './paymentUtils';

let cronStarted = false;

/**
 * Logika pengecekan jatuh tempo dan pengiriman notifikasi H-3 serta Hari-H
 */
export async function runDueCheck() {
  console.log('⏰ [CRON] Menjalankan pengecekan jatuh tempo harian...');
  
  const waStatus = getWaStatus();
  if (!waStatus.isReady) {
    console.log('⚠️ [CRON] WA Client belum siap / terputus. Melewati proses pengiriman notifikasi.');
    return { success: false, message: 'WA Client not ready' };
  }

  try {
    const activeTenants = await prisma.tenant.findMany({
      where: { isActive: true },
      include: { 
        room: true,
        payments: {
          where: { paymentType: 'SEWA', status: 'LUNAS' }
        }
      }
    });

    const today = new Date();
    const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const qrisPath = path.join(process.cwd(), 'public', 'qris.jpg');
    const logs: Array<{ tenant: string; type: string; diffDays: number; status: string }> = [];

    for (const tenant of activeTenants) {
      const checkIn = new Date(tenant.checkInDate);
      const dueDay = checkIn.getDate();

      // Hitung tanggal jatuh tempo terdekat (bulan ini, atau bulan depan jika tanggal bulan ini sudah terlewati)
      let targetDueDate = getSafeDueDate(todayReset.getFullYear(), todayReset.getMonth(), dueDay);

      if (todayReset.getTime() > targetDueDate.getTime()) {
        targetDueDate = getSafeDueDate(todayReset.getFullYear(), todayReset.getMonth() + 1, dueDay);
      }

      const diffTime = targetDueDate.getTime() - todayReset.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // Cek apakah siklus targetDueDate sudah dibayar lunas
      const isPaid = isCyclePaid(tenant.payments, targetDueDate);

      if (isPaid) {
        // Tagihan untuk siklus ini sudah lunas, tidak perlu kirim pengingat
        continue;
      }

      const rentPrice = tenant.room.status === "TERISI_BERDUA" ? tenant.room.priceDouble : tenant.room.priceSingle;
      const formattedAmount = new Intl.NumberFormat('id-ID').format(rentPrice);
      const dueDateString = targetDueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      if (diffDays === 3) {
        // Pengingat H-3
        const waMsg = `*PENGINGAT DIRA KOS*\n\nHalo ${tenant.name},\nIni adalah pesan pengingat otomatis. Biaya sewa Kamar ${tenant.room.roomNumber} Anda akan jatuh tempo dalam 3 hari pada tanggal *${dueDateString}*.\n\nTagihan bulan ini: *Rp ${formattedAmount}*.\n\nPembayaran dapat dilakukan melalui QRIS yang terlampir pada pesan ini.\nMohon siapkan pembayaran Anda. Terima kasih!`;
        
        try {
          await sendWaMessage(tenant.waNumber, waMsg, qrisPath);
          console.log(`[CRON] ✅ Berhasil kirim pengingat H-3 ke ${tenant.name} (${tenant.waNumber})`);
          logs.push({ tenant: tenant.name, type: 'H-3', diffDays, status: 'terkirim' });
        } catch (sendErr: any) {
          console.error(`[CRON] ❌ Gagal kirim pengingat H-3 ke ${tenant.name}:`, sendErr?.message || sendErr);
          logs.push({ tenant: tenant.name, type: 'H-3', diffDays, status: `gagal: ${sendErr?.message}` });
        }

      } else if (diffDays === 0) {
        // Hari H Jatuh Tempo
        const waMsg = `*JATUH TEMPO DIRA KOS*\n\nHalo ${tenant.name},\nBiaya sewa Kamar ${tenant.room.roomNumber} Anda telah jatuh tempo HARI INI (*${dueDateString}*).\n\nTotal tagihan: *Rp ${formattedAmount}*.\n\nPembayaran dapat dilakukan melalui QRIS yang terlampir pada pesan ini.\nMohon segera melakukan pembayaran untuk menghindari kendala. Terima kasih!`;
        
        try {
          await sendWaMessage(tenant.waNumber, waMsg, qrisPath);
          console.log(`[CRON] ✅ Berhasil kirim pengingat Hari-H ke ${tenant.name} (${tenant.waNumber})`);
          logs.push({ tenant: tenant.name, type: 'Hari-H', diffDays, status: 'terkirim' });
        } catch (sendErr: any) {
          console.error(`[CRON] ❌ Gagal kirim pengingat Hari-H ke ${tenant.name}:`, sendErr?.message || sendErr);
          logs.push({ tenant: tenant.name, type: 'Hari-H', diffDays, status: `gagal: ${sendErr?.message}` });
        }
      }
    }

    console.log(`⏰ [CRON] Pengecekan selesai. Total notifikasi terproses: ${logs.length}`);
    return { success: true, count: logs.length, logs };

  } catch (err) {
    console.error('[CRON] Error saat menjalankan pengecekan jatuh tempo:', err);
    return { success: false, error: err };
  }
}

/**
 * Memulai penjadwalan cron job otomatis
 */
export const startCronJobs = () => {
  if (cronStarted) return;
  cronStarted = true;

  // Berjalan setiap jam 08:00 pagi WIB (Asia/Jakarta)
  cron.schedule('0 8 * * *', async () => {
    await runDueCheck();
  }, {
    timezone: 'Asia/Jakarta'
  });

  console.log('✅ Sistem Cron Job Jatuh Tempo telah diaktifkan (Jadwal: Setiap 08:00 WIB).');
};
