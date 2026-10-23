export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Memastikan modul WA dan cron job otomatis aktif saat server start
    await import('./lib/wa');
  }
}
