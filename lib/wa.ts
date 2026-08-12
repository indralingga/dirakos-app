import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import fs from 'fs';
import { startCronJobs } from './cron';

const globalForWa = global as unknown as {
  waClient: Client,
  qrCodeData: string,
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

export const waClient = globalForWa.waClient || new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        ...(browserPath ? { executablePath: browserPath } : {}),
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

if (!globalForWa.isInitializing) {
  globalForWa.isInitializing = true;
  globalForWa.qrCodeData = "";
  globalForWa.isReady = false;

  waClient.on('qr', (qr) => {
      console.log("QR Code received");
      globalForWa.qrCodeData = qr;
  });

  waClient.on('ready', async () => {
      globalForWa.isReady = true;
      globalForWa.qrCodeData = "";
      console.log('✅ WA Client is ready!');
      
      // KODE UNTUK MENGECEK NAMA GRUP & ID-nya:
      try {
          const chats = await waClient.getChats();

          // Log Grup
          const groups = chats.filter(chat => chat.isGroup);
          console.log("\n========= BERIKUT DAFTAR GRUP WA ANDA =========");
          if (groups.length === 0) console.log("(Tidak ada grup)");
          groups.forEach(g => {
              console.log(`NAMA: "${g.name}" | ID: ${g.id._serialized}`);
          });
          console.log("================================================\n");

          // Log Saluran / Newsletter
          const channels = chats.filter(chat => chat.id._serialized.endsWith('@newsletter'));
          console.log("========= BERIKUT DAFTAR SALURAN WA ANDA =========");
          if (channels.length === 0) console.log("(Tidak ada saluran)");
          channels.forEach(c => {
              console.log(`NAMA: "${c.name}" | ID: ${c.id._serialized}`);
          });
          console.log("===================================================\n");

      } catch (err) {
          console.error("Gagal membaca daftar grup/saluran:", err);
      }

      startCronJobs();
  });

  waClient.on('authenticated', () => {
      console.log('✅ WA Authenticated');
  });

  waClient.on('auth_failure', msg => {
      console.error('❌ WA Authentication failure', msg);
      globalForWa.isReady = false;
  });

  waClient.initialize().catch(err => console.error("WA Init error:", err));
}

if (process.env.NODE_ENV !== 'production') {
  globalForWa.waClient = waClient;
}

// FUNGSI STATUS BOT (Menyelesaikan Error Build)
export const getWaStatus = () => {
  return { 
    isReady: globalForWa.isReady, 
    qrCodeData: globalForWa.qrCodeData 
  };
};

// FUNGSI KIRIM PESAN WA
export const sendWaMessage = async (to: string, message: string, mediaPath?: string) => {
  if (!globalForWa.isReady) {
    throw new Error("WhatsApp Client is not ready yet.");
  }
  
  let chatId = to;
  // Jika input tujuan tidak mengandung '@', format sebagai nomor HP biasa (@c.us)
  if (!to.includes('@')) {
    let formattedNumber = to.replace(/\D/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '62' + formattedNumber.substring(1);
    }
    chatId = `${formattedNumber}@c.us`;
  }
  
  if (mediaPath) {
    const media = MessageMedia.fromFilePath(mediaPath);
    await waClient.sendMessage(chatId, media, { caption: message });
  } else {
    await waClient.sendMessage(chatId, message);
  }
};


// Fungsi untuk mengeluarkan nomor dari Group WA Kos-kosan secara otomatis
export const removeTenantFromGroup = async (waNumber: string) => {
  try {
    if (!globalForWa.isReady) {
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

    const chat = await waClient.getChatById(groupId);
    if (chat.isGroup) {
      const groupChat = chat as any;
      await groupChat.removeParticipants([participantId]);
      console.log(`✅ Berhasil mengeluarkan ${participantId} dari group ${groupId}`);
    }
  } catch (error) {
    console.error("❌ Gagal mengeluarkan dari grup WA:", error);
  }
};
