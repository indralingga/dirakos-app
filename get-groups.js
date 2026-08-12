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

console.log(`📋 Menggunakan browser  : ${browserPath || '(default)'}`);
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
    console.log("⏳ Menunggu chat list WA selesai di-sync...\n");

    const MAX_ATTEMPTS = 20;
    let allChats = null;

    // Polling dari sisi Node.js (lebih stabil dari polling di dalam browser)
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        process.stdout.write(`   Percobaan ${attempt}/${MAX_ATTEMPTS} - cek store...`);
        
        await new Promise(r => setTimeout(r, 3000)); // tunggu 3 detik tiap percobaan

        try {
            const result = await waClient.pupPage.evaluate(() => {
                const store = window.Store;
                if (!store || !store.Chat) return null;
                const models = store.Chat.getModelsArray();
                if (!models || models.length === 0) return null;
                return models.map(chat => ({
                    id: chat.id ? chat.id._serialized : '',
                    name: chat.name || chat.formattedTitle || '(Tanpa Nama)',
                    isGroup: !!chat.isGroup,
                }));
            });

            if (result && result.length > 0) {
                allChats = result;
                console.log(` ✅ Ditemukan ${result.length} chat!`);
                break;
            } else {
                console.log(` ⏳ Belum ada data...`);
            }
        } catch (e) {
            console.log(` ⚠️  Error: ${e.message}`);
        }
    }

    if (!allChats || allChats.length === 0) {
        console.log("\n❌ Timeout: Store WhatsApp tidak kunjung terisi setelah 60 detik.");
        console.log("   Kemungkinan penyebab:");
        console.log("   → Sesi WA sudah kadaluarsa (perlu scan QR ulang via website)");
        console.log("   → Versi Chromium tidak kompatibel dengan WA Web terbaru\n");
        process.exit(0);
    }

    // ─── GRUP (@g.us) ────────────────────────────────────────
    const groups = allChats.filter(c => c.id.endsWith('@g.us'));
    console.log("\n╔══════════════════════════════════════════════════════╗");
    console.log("║           DAFTAR GRUP WHATSAPP (@g.us)               ║");
    console.log("╚══════════════════════════════════════════════════════╝");

    if (groups.length === 0) {
        console.log("   (Tidak ada grup yang ditemukan)\n");
    } else {
        groups.forEach((g, i) => {
            console.log(`  [${i + 1}] ${g.name}`);
            console.log(`       ID : ${g.id}`);
            console.log("      ──────────────────────────────────────────────");
        });
    }

    // ─── SALURAN / NEWSLETTER (@newsletter) ─────────────────
    const channels = allChats.filter(c => c.id.endsWith('@newsletter'));
    console.log("\n╔══════════════════════════════════════════════════════╗");
    console.log("║        DAFTAR SALURAN (CHANNEL @newsletter)          ║");
    console.log("╚══════════════════════════════════════════════════════╝");

    if (channels.length === 0) {
        console.log("   (Tidak ada saluran yang ditemukan)\n");
    } else {
        channels.forEach((c, i) => {
            console.log(`  [${i + 1}] ${c.name}`);
            console.log(`       ID : ${c.id}`);
            console.log("      ──────────────────────────────────────────────");
        });
    }

    console.log(`\n✅ Selesai! Total: ${groups.length} grup, ${channels.length} saluran ditemukan.\n`);
    process.exit(0);
});

waClient.initialize().catch(err => {
    console.error("❌ Gagal inisialisasi WA:", err.message || err);
    process.exit(1);
});
