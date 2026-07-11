const { Client, LocalAuth } = require('whatsapp-web.js');

console.log("Memulai WA Test...");

const waClient = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

waClient.on('qr', (qr) => {
    console.log("✅ Berhasil mendapatkan QR dari sistem!");
    process.exit(0);
});

waClient.on('ready', () => {
    console.log("Client is ready!");
    process.exit(0);
});

waClient.initialize().catch(err => {
    console.error("❌ Gagal inisialisasi WA:", err);
    process.exit(1);
});
