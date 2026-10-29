import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import fs from 'fs';
import path from 'path';
import { startCronJobs } from './cron';

const globalForWa = global as unknown as {
  waClient: Client | null;
  qrCodeData: string;
  qrGeneratedAt: number;
  isReady: boolean;
  isInitializing: boolean;
  statusMessage: string;
};

// Inisialisasi state global
if (!globalForWa.waClient) {
  globalForWa.waClient = null;
  globalForWa.qrCodeData = "";
  globalForWa.qrGeneratedAt = 0;
  globalForWa.isReady = false;
  globalForWa.isInitializing = false;
  globalForWa.statusMessage = "Menginisialisasi...";
}

// Deteksi OS otomatis untuk menemukan Chrome/Chromium native
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
  // Prioritaskan /usr/bin/chromium (native deb package) untuk stabilitas tanpa snap
  const linuxPaths = [
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser'
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
  '--disable-features=IsolateOrigins,site-per-process',
  '--disable-site-isolation-trials',
  '--disable-extensions',
  '--disable-software-rasterizer'
];

// Membersihkan lock file stale Chromium agar restart PM2 tidak pernah macet
function cleanStaleSessionLocks(sessionDir: string) {
  try {
    const lockFiles = ['SingletonLock', 'SingletonCookie', 'SingletonSocket', 'lockfile'];
    for (const file of lockFiles) {
      const p = path.join(sessionDir, file);
      try {
        if (fs.existsSync(p) || fs.lstatSync(p).isSymbolicLink()) {
          fs.unlinkSync(p);
          console.log(`🧹 [WA] Cleaned stale lock file: ${file}`);
        }
      } catch (e) {}
    }
  } catch (err) {}
}

function createClientInstance(): Client {
  const sessionDir = path.join(process.cwd(), '.wwebjs_auth', 'session');
  cleanStaleSessionLocks(sessionDir);

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(process.cwd(), '.wwebjs_auth') }),
    puppeteer: {
      ...(browserPath ? { executablePath: browserPath } : {}),
      args: puppeteerArgs
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`⏳ [WA] Loading screen: ${percent}% - ${message}`);
    globalForWa.statusMessage = `Memuat data chat (${percent}%)...`;
  });

  client.on('qr', (qr) => {
    console.log("QR Code received at", new Date().toISOString());
    globalForWa.qrCodeData = qr;
    globalForWa.qrGeneratedAt = Date.now();
    globalForWa.statusMessage = "Menunggu scan QR Code";
  });

  client.on('ready', async () => {
    console.log('✅ WA Client connected, stabilizing frame (3s)...');
    globalForWa.qrCodeData = "";
    globalForWa.statusMessage = "Stabilizing frame...";
    
    setTimeout(() => {
      globalForWa.isReady = true;
      globalForWa.statusMessage = "Terhubung";
      console.log('✅ WA Client is ready to send messages!');
      startCronJobs();
    }, 3000);
  });

  client.on('authenticated', () => {
    console.log('✅ WA Authenticated');
    globalForWa.statusMessage = "Sesi terautentikasi, memuat chat...";
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ WA Authentication failure', msg);
    globalForWa.isReady = false;
    globalForWa.statusMessage = "Autentikasi gagal. Silakan tautkan ulang.";
  });

  client.on('disconnected', (reason) => {
    console.warn('⚠️ WA Client disconnected:', reason);
    globalForWa.isReady = false;
    globalForWa.qrCodeData = "";
    globalForWa.statusMessage = "Terputus: " + reason;
  });

  return client;
}

export function initWaClient() {
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  if (isBuildPhase) return;
  if (globalForWa.isInitializing) return;

  globalForWa.isInitializing = true;
  globalForWa.isReady = false;
  globalForWa.qrCodeData = "";
  globalForWa.statusMessage = "Menghubungkan browser WhatsApp...";

  const client = createClientInstance();
  globalForWa.waClient = client;

  client.initialize().catch((err) => {
    console.error("WA Init error:", err);
    globalForWa.isInitializing = false;
    globalForWa.statusMessage = "Gagal memulai browser: " + (err?.message || err);
  });
}

// Inisialisasi otomatis jika belum aktif
if (!globalForWa.waClient && !globalForWa.isInitializing) {
  initWaClient();
}

export const waClient = globalForWa.waClient;

// FUNGSI SEGARKAN QR CODE DARI BROWSER
export const refreshQrCode = async () => {
  const client = globalForWa.waClient;
  if (!client || globalForWa.isReady) return false;

  globalForWa.qrCodeData = "";
  globalForWa.qrGeneratedAt = 0;
  globalForWa.statusMessage = "Menyegarkan halaman QR Code...";

  try {
    const pupPage = (client as any).pupPage;
    if (pupPage && !pupPage.isClosed()) {
      console.log('🔄 Memuat ulang halaman WhatsApp Web untuk QR Code baru via window.location.reload...');
      await pupPage.evaluate(() => {
        window.location.reload();
      });
      return true;
    }
  } catch (err: any) {
    console.warn('⚠️ Gagal reload cepat QR, melakukan restart bersih client...', err?.message || err);
  }

  // Jika halaman bermasalah / detached frame, restart client secara bersih dengan instance baru
  try {
    console.log('🔄 Merestart instance WhatsApp Client baru...');
    globalForWa.isInitializing = false;
    globalForWa.isReady = false;
    await client.destroy().catch(() => {});
    initWaClient();
    return true;
  } catch (resetErr) {
    console.error('❌ Gagal merestart client:', resetErr);
  }

  return false;
};

// FUNGSI STATUS BOT
export const getWaStatus = () => {
  return { 
    isReady: globalForWa.isReady, 
    qrCodeData: globalForWa.qrCodeData,
    qrGeneratedAt: globalForWa.qrGeneratedAt || 0,
    statusMessage: globalForWa.statusMessage || (globalForWa.isReady ? "Terhubung" : "Menghubungkan...")
  };
};

// FUNGSI KIRIM PESAN WA
export const sendWaMessage = async (to: string, message: string, mediaPath?: string) => {
  const client = globalForWa.waClient;
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
      return await client.sendMessage(chatId, media, { caption: message });
    } else {
      return await client.sendMessage(chatId, message);
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
      globalForWa.isInitializing = false;

      try {
        await client.destroy();
      } catch (destroyErr: any) {
        console.error('Error destroying broken client:', destroyErr?.message || destroyErr);
      }

      setTimeout(() => {
        console.log('🔄 Menginisialisasi ulang WA Client dengan instance baru...');
        initWaClient();
      }, 3000);
    }

    throw err;
  }
};

// Fungsi untuk mengeluarkan nomor dari Group WA Kos-kosan secara otomatis
export const removeTenantFromGroup = async (waNumber: string) => {
  try {
    const client = globalForWa.waClient;
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
