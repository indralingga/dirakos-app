import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import fs from 'fs';
import { startCronJobs } from './cron';

const globalForWa = global as unknown as {
  waClient: Client,
  qrCodeData: string,
  qrGeneratedAt: number,
  isReady: boolean,
  isInitializing: boolean
};

// Deteksi OS otomatis untuk menemukan Chrome di Windows maupun Linux VPS
let browserPath = '';
if (process.platform === 'win32') {
    const paths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) {
            browserPath = p;
            break;
        }
    }
} else {
    const linuxPaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium'
    ];
    for (const p of linuxPaths) {
        if (fs.existsSync(p)) {
            browserPath = p;
            break;
        }
    }
}

const puppeteerArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-site-isolation-trials',
    '--js-flags=--max-old-space-size=512'
];

export const waClient = globalForWa.waClient || new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        ...(browserPath ? { executablePath: browserPath } : {}),
        args: puppeteerArgs
    }
});

// Hindari inisialisasi Puppeteer / WA Client saat proses next build
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuildPhase && !globalForWa.isInitializing) {
  globalForWa.isInitializing = true;
  globalForWa.qrCodeData = "";
  globalForWa.isReady = false;

  waClient.on('qr', (qr) => {
      console.log("QR Code received at", new Date().toISOString());
      globalForWa.qrCodeData = qr;
      globalForWa.qrGeneratedAt = Date.now();
  });

  waClient.on('ready', async () => {
      console.log('✅ WA Client connected, stabilizing frame (3s)...');
      globalForWa.qrCodeData = "";
      
      setTimeout(() => {
          globalForWa.isReady = true;
          console.log('✅ WA Client is ready to send messages!');
          startCronJobs();
      }, 3000);
  });

  waClient.on('authenticated', () => {
      console.log('✅ WA Authenticated');
  });

  waClient.on('auth_failure', msg => {
      console.error('❌ WA Authentication failure', msg);
      globalForWa.isReady = false;
  });

  waClient.on('disconnected', reason => {
      console.warn('⚠️ WA Client disconnected:', reason);
      globalForWa.isReady = false;
      globalForWa.qrCodeData = "";
  });

  waClient.initialize().catch(err => console.error("WA Init error:", err));
}

globalForWa.waClient = waClient;

// FUNGSI SEGARKAN QR CODE DARI BROWSER
export const refreshQrCode = async () => {
  const client = globalForWa.waClient || waClient;
  if (!client || globalForWa.isReady) return false;
  try {
    const pupPage = (client as any).pupPage;
    if (pupPage && !pupPage.isClosed()) {
      console.log('🔄 Memuat ulang halaman WhatsApp Web untuk QR Code baru...');
      globalForWa.qrCodeData = "";
      globalForWa.qrGeneratedAt = 0;
      await pupPage.reload({ waitUntil: 'networkidle2', timeout: 30000 });
      return true;
    }
  } catch (err: any) {
    console.error('Gagal reload QR:', err?.message || err);
  }
  return false;
};

// FUNGSI STATUS BOT (Menyelesaikan Error Build)
export const getWaStatus = () => {
  return { 
    isReady: globalForWa.isReady, 
    qrCodeData: globalForWa.qrCodeData,
    qrGeneratedAt: globalForWa.qrGeneratedAt || 0
  };
};

// FUNGSI KIRIM PESAN WA
export const sendWaMessage = async (to: string, message: string, mediaPath?: string) => {
  const client = globalForWa.waClient || waClient;
  if (!globalForWa.isReady || !client) {
    throw new Error("WhatsApp Client belum siap / belum terhubung.");
  }
  
  if (!to || typeof to !== 'string') {
    throw new Error("Nomor tujuan WhatsApp tidak valid.");
  }

  let chatId = to.trim();
  // Jika input tujuan tidak mengandung '@', format sebagai nomor HP biasa (@c.us)
  if (!chatId.includes('@')) {
    let formattedNumber = chatId.replace(/\D/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '62' + formattedNumber.substring(1);
    }
    chatId = `${formattedNumber}@c.us`;
  }
  
  try {
    if (mediaPath && fs.existsSync(mediaPath)) {
      const media = MessageMedia.fromFilePath(mediaPath);
      await client.sendMessage(chatId, media, { caption: message });
    } else {
      await client.sendMessage(chatId, message);
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.error(`[WA ERROR] Gagal mengirim pesan ke ${chatId}:`, errMsg);

    // Deteksi jika Puppeteer browser/frame terputus / detached
    if (
      errMsg.includes('detached Frame') ||
      errMsg.includes('Session closed') ||
      errMsg.includes('Execution context was destroyed') ||
      errMsg.includes('Target closed')
    ) {
      console.warn('🚨 Puppeteer browser/frame terlepas atau crash. Mereset client WhatsApp...');
      globalForWa.isReady = false;

      try {
        await client.destroy();
      } catch (destroyErr: any) {
        console.error('Error destroying broken client:', destroyErr?.message || destroyErr);
      }

      setTimeout(() => {
        console.log('🔄 Menginisialisasi ulang WA Client...');
        globalForWa.isInitializing = false;
        waClient.initialize().catch(reInitErr => {
          console.error('❌ Gagal inisialisasi ulang WA Client:', reInitErr);
        });
      }, 3000);
    }

    throw err;
  }
};


// Fungsi untuk mengeluarkan nomor dari Group WA Kos-kosan secara otomatis
export const removeTenantFromGroup = async (waNumber: string) => {
  try {
    const client = globalForWa.waClient || waClient;
    if (!globalForWa.isReady || !client) {
      console.log("⚠️ WA Client tidak aktif, melewati proses mengeluarkan dari grup.");
      return;
    }
    const groupId = process.env.WA_GROUP_ID;
    if (!groupId) {
      console.log("⚠️ WA_GROUP_ID tidak ditemukan di environment variable.");
      return;
    }

    let formattedNumber = waNumber.replace(/\D/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '62' + formattedNumber.substring(1);
    }
    const participantId = `${formattedNumber}@c.us`;

    const chat = await client.getChatById(groupId);
    if (chat.isGroup) {
      const groupChat = chat as any;
      await groupChat.removeParticipants([participantId]);
      console.log(`✅ Berhasil mengeluarkan ${participantId} dari group ${groupId}`);
    }
  } catch (error) {
    console.error("❌ Gagal mengeluarkan dari grup WA:", error);
  }
};
