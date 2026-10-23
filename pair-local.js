const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

console.log("==================================================");
console.log("🚀 DIRAKOS - WHATSAPP LOCAL PAIRING TOOL");
console.log("==================================================");
console.log("Menyiapkan koneksi WhatsApp melalui jaringan lokal...");

const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

let browserPath = undefined;
for (const p of chromePaths) {
    if (fs.existsSync(p)) {
        browserPath = p;
        break;
    }
}

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        executablePath: browserPath,
        headless: false, // Menampilkan jendela browser asli agar bebas dari deteksi headless WhatsApp
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});

client.on('qr', (qr) => {
    console.log("\n==================================================");
    console.log("📱 SILAKAN SCAN QR CODE DI BAWAH INI (ATAU DI JENDELA CHROME):");
    console.log("==================================================\n");
    qrcode.generate(qr, { small: true });
    console.log("\nMenunggu scan dari WhatsApp di HP Anda...\n");
});

client.on('authenticated', () => {
    console.log("🔑 Berhasil terautentikasi! Menyinkronkan data sesi...");
});

client.on('ready', async () => {
    console.log("\n==================================================");
    console.log("🎉 WHATSAPP BERHASIL TERHUBUNG & TAUTAN AKTIF (READY)!");
    console.log("Sesi tersimpan rapi di folder .wwebjs_auth.");
    console.log("Menutup browser dalam 5 detik...");
    console.log("==================================================\n");
    
    setTimeout(async () => {
        try {
            await client.destroy();
        } catch (e) {}
        console.log("✅ SELESAI! Anda sekarang bisa menutup jendela ini.");
        console.log("Sesi siap disinkronkan ke VPS Dirakos.");
        process.exit(0);
    }, 5000);
});

client.on('auth_failure', (msg) => {
    console.error("❌ Autentikasi gagal:", msg);
});

client.on('disconnected', (reason) => {
    console.log("⚠️ Terputus:", reason);
});

console.log("Membuka browser WhatsApp Web...");
client.initialize().catch(err => {
    console.error("❌ Terjadi error saat inisialisasi:", err);
});
