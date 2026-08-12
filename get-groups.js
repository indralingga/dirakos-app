const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

// Deteksi path Chromium secara otomatis
const linuxPaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
];
let browserPath = process.env.PUPPETEER_EXECUTABLE_PATH || '';
if (!browserPath) {
    for (const p of linuxPaths) {
        if (fs.existsSync(p)) { browserPath = p; break; }
    }
}

console.log(`📋 Menggunakan browser: ${browserPath || '(default)'}`);
console.log("⏳ Menginisialisasi WhatsApp Client...\n");

const waClient = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        executablePath: browserPath || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

waClient.on('qr', () => {
    console.log("⚠️  Bot belum login. Silakan login (scan QR) terlebih dahulu via website!");
    process.exit(0);
});

waClient.on('ready', async () => {
    console.log("✅ WhatsApp Client terhubung!");
    console.log("⏳ Menunggu 3 detik agar sesi stabil...\n");

    // Jeda 3 detik agar sesi Puppeteer benar-benar siap
    await new Promise(r => setTimeout(r, 3000));

    try {
        const chats = await waClient.getChats();

        // ─── GRUP ───────────────────────────────────────────────
        const groups = chats.filter(c => c.isGroup);
        console.log("╔══════════════════════════════════════════════════════╗");
        console.log("║              DAFTAR GRUP WHATSAPP (@g.us)            ║");
        console.log("╚══════════════════════════════════════════════════════╝");

        if (groups.length === 0) {
            console.log("   (Tidak ada grup yang ditemukan)\n");
        } else {
            groups.forEach((g, i) => {
                console.log(`  [${i + 1}] ${g.name}`);
                console.log(`       ID : ${g.id._serialized}`);
                console.log("      ──────────────────────────────────────────────");
            });
        }

        // ─── SALURAN / NEWSLETTER ────────────────────────────────
        const channels = chats.filter(c => c.id && c.id._serialized && c.id._serialized.endsWith('@newsletter'));
        console.log("\n╔══════════════════════════════════════════════════════╗");
        console.log("║        DAFTAR SALURAN (CHANNEL @newsletter)          ║");
        console.log("╚══════════════════════════════════════════════════════╝");

        if (channels.length === 0) {
            console.log("   (Tidak ada saluran yang ditemukan)\n");
        } else {
            channels.forEach((c, i) => {
                console.log(`  [${i + 1}] ${c.name}`);
                console.log(`       ID : ${c.id._serialized}`);
                console.log("      ──────────────────────────────────────────────");
            });
        }

        console.log("\n✅ Selesai! Salin ID yang dibutuhkan lalu paste ke file .env\n");

    } catch (err) {
        console.error("❌ Gagal membaca data:", err.message || err);
    }

    process.exit(0);
});

waClient.initialize().catch(err => {
    console.error("❌ Gagal inisialisasi WA:", err.message || err);
    process.exit(1);
});
