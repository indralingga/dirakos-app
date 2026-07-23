const { Client, LocalAuth } = require('whatsapp-web.js');

console.log("Memulai WhatsApp Client untuk mencari ID Grup...");

const waClient = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || (process.platform === 'win32' 
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
          : '/usr/bin/chromium-browser'),
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

waClient.on('qr', (qr) => {
    console.log("\n⚠️ Bot belum login/terkoneksi.");
    console.log("Silakan login (scan QR) terlebih dahulu melalui website!");
    process.exit(0);
});

waClient.on('ready', async () => {
    console.log("✅ WhatsApp Client sudah terhubung!");
    console.log("Membaca daftar grup...\n");
    
    try {
        const chats = await waClient.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        
        console.log("=========================================");
        console.log("        DAFTAR GRUP WHATSAPP ANDA        ");
        console.log("=========================================");
        if (groups.length === 0) {
            console.log("Tidak ada grup yang ditemukan di akun WA ini.");
        } else {
            groups.forEach((group, index) => {
                console.log(`[${index + 1}] Nama Grup : ${group.name}`);
                console.log(`    ID Grup   : ${group.id._serialized}`);
                console.log("-----------------------------------------");
            });
        }
    } catch (err) {
        console.error("❌ Gagal membaca grup:", err);
    }
    
    process.exit(0);
});

waClient.initialize().catch(err => {
    console.error("❌ Gagal inisialisasi WA:", err);
    process.exit(1);
});
