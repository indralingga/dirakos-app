const { Client, LocalAuth } = require('whatsapp-web.js');

console.log("📋 Memulai WhatsApp Client untuk mencari ID Grup & Saluran...\n");

const waClient = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

waClient.on('qr', () => {
    console.log("⚠️  Bot belum login. Silakan login (scan QR) terlebih dahulu via website!");
    process.exit(0);
});

waClient.on('ready', async () => {
    console.log("✅ WhatsApp Client terhubung! Sedang membaca data...\n");

    try {
        const chats = await waClient.getChats();

        // ─── GRUP ───────────────────────────────────────────────
        const groups = chats.filter(c => c.isGroup);
        console.log("╔══════════════════════════════════════════════════════╗");
        console.log("║              DAFTAR GRUP WHATSAPP                    ║");
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
        console.log("\n╔══════════════════════════════════════════════════════╗");
        console.log("║           DAFTAR SALURAN (CHANNEL / NEWSLETTER)      ║");
        console.log("╚══════════════════════════════════════════════════════╝");

        let channelCount = 0;
        for (const chat of chats) {
            // Saluran memiliki ID berakhiran @newsletter
            if (chat.id && chat.id._serialized && chat.id._serialized.endsWith('@newsletter')) {
                channelCount++;
                console.log(`  [${channelCount}] ${chat.name}`);
                console.log(`       ID : ${chat.id._serialized}`);
                console.log("      ──────────────────────────────────────────────");
            }
        }

        if (channelCount === 0) {
            console.log("   (Tidak ada saluran yang ditemukan)\n");
        }

        console.log("\n✅ Selesai! Salin ID yang Anda butuhkan lalu paste ke file .env di VPS.\n");

    } catch (err) {
        console.error("❌ Gagal membaca data:", err);
    }

    process.exit(0);
});

waClient.initialize().catch(err => {
    console.error("❌ Gagal inisialisasi WA:", err);
    process.exit(1);
});
