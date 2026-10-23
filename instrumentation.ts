export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PHASE !== 'phase-production-build') {
    // Memastikan modul WA dan cron job otomatis aktif saat server runtime start
    await import('./lib/wa');
  }
}

